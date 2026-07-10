import pandas as pd
import re
from sqlalchemy.orm import Session
from app.models import Asset, User, AssetAssignment

CORE_DEVICE_COLUMNS = {
    "PC/CPU": ("PC Brand", "PC Sl No."),
    "Laptop": ("Laptop Brand", "Laptop Sl No."),
    "Monitor": ("Monitor Brand", "Monitor Sl No."),
    "Keyboard": ("Keyboard Brand", "Keyboard Sl No."),
    "Mouse": ("Mouse Brand", "Mouse Sl No."),
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def make_user_key(name: str, location: str) -> str:
    return f"{slugify(name)}.{slugify(location)}@placeholder.internal"


def parse_wide_excel(file) -> list[dict]:
    df = pd.read_excel(file)
    records = []

    for _, row in df.iterrows():
        name = str(row["Name"]).strip()
        location = str(row["Location"]).strip()
        user_key = make_user_key(name, location)
        devices_used = [d.strip() for d in str(row["Devices Used"]).split(",")]
        status = "Active" if str(row.get("Remarks", "")).strip() == "Active" else "Inactive"

        for device_type, (brand_col, serial_col) in CORE_DEVICE_COLUMNS.items():
            if device_type in devices_used:
                serial = str(row[serial_col]).strip()
                records.append({
                    "asset_code": f"{slugify(device_type)}-{serial}".upper(),
                    "name": f"{device_type} ({serial})",
                    "category": "IT Equipment",
                    "commodity_type": device_type,
                    "brand_name": str(row[brand_col]).strip(),
                    "model_name": None,
                    "serial_number": serial,
                    "location": location,
                    "status": status,
                    "assigned_user_key": user_key,
                    "assigned_user_name": name,
                })

        other_serial = str(row["Other Device Sl No."]).strip()
        records.append({
            "asset_code": f"{slugify(str(row['Other Device']))}-{other_serial}".upper(),
            "name": f"{row['Other Device']} ({other_serial})",
            "category": "IT Equipment",
            "commodity_type": str(row["Other Device"]).strip(),
            "brand_name": None,
            "model_name": None,
            "serial_number": other_serial,
            "location": location,
            "status": status,
            "assigned_user_key": user_key,
            "assigned_user_name": name,
        })

        other2_serial = str(row["Other Device 2 Sl No."]).strip()
        records.append({
            "asset_code": f"{slugify(str(row['Other Device 2']))}-{other2_serial}".upper(),
            "name": f"{row['Other Device 2']} ({other2_serial})",
            "category": "IT Equipment",
            "commodity_type": str(row["Other Device 2"]).strip(),
            "brand_name": str(row["Other Device 2 Brand"]).strip(),
            "model_name": None,
            "serial_number": other2_serial,
            "location": location,
            "status": status,
            "assigned_user_key": user_key,
            "assigned_user_name": name,
        })

    return records
def upsert_wide_format(db: Session, records: list[dict]) -> dict:
    seen_asset_codes = set()
    users_cache = {}
    added, updated, new_users, new_assignments = 0, 0, 0, 0

    for rec in records:
        seen_asset_codes.add(rec["asset_code"])

        user_key = rec["assigned_user_key"]
        if user_key in users_cache:
            user = users_cache[user_key]
        else:
            user = db.query(User).filter(User.email == user_key).first()
            if not user:
                user = User(name=rec["assigned_user_name"], email=user_key, role="viewer")
                db.add(user)
                db.flush()
                new_users += 1
            users_cache[user_key] = user

        asset = db.query(Asset).filter(Asset.asset_code == rec["asset_code"]).first()
        if asset:
            asset.name = rec["name"]
            asset.category = rec["category"]
            asset.commodity_type = rec["commodity_type"]
            asset.brand_name = rec["brand_name"]
            asset.model_name = rec["model_name"]
            asset.serial_number = rec["serial_number"]
            asset.location = rec["location"]
            asset.status = rec["status"]
            asset.is_active = True
            updated += 1
        else:
            asset = Asset(
                asset_code=rec["asset_code"],
                name=rec["name"],
                category=rec["category"],
                commodity_type=rec["commodity_type"],
                brand_name=rec["brand_name"],
                model_name=rec["model_name"],
                serial_number=rec["serial_number"],
                location=rec["location"],
                status=rec["status"],
                is_active=True,
            )
            db.add(asset)
            db.flush()
            added += 1

        existing_assignment = (
            db.query(AssetAssignment)
            .filter(AssetAssignment.asset_id == asset.id, AssetAssignment.user_id == user.id)
            .first()
        )
        if not existing_assignment:
            db.add(AssetAssignment(asset_id=asset.id, user_id=user.id))
            new_assignments += 1

    deactivated = (
        db.query(Asset)
        .filter(Asset.asset_code.notin_(seen_asset_codes), Asset.is_active == True)
        .update({Asset.is_active: False}, synchronize_session=False)
    )

    db.commit()

    return {
        "assets_added": added,
        "assets_updated": updated,
        "new_users_created": new_users,
        "new_assignments": new_assignments,
        "assets_deactivated": deactivated,
    }