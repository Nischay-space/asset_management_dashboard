import re
import pandas as pd
from rapidfuzz import fuzz
from app.utils import normalize_title
from sqlalchemy.orm import Session
from app.models import Asset, User, AssetAssignment

CORE_DEVICE_CANON = {
    "PC/CPU": ("pc_brand", "pc_sl_no"),
    "Laptop": ("laptop_brand", "laptop_sl_no"),
    "Monitor": ("monitor_brand", "monitor_sl_no"),
    "Keyboard": ("keyboard_brand", "keyboard_sl_no"),
    "Mouse": ("mouse_brand", "mouse_sl_no"),
}

KNOWN_DEVICE_TYPES = list(CORE_DEVICE_CANON.keys()) + [
    "Printer", "Scanner", "UPS", "Webcam", "Headset",
    "Docking Station", "External HDD", "SSD", "Tablet", "iPad",
]

SENTINEL_VALUES = {"no", "n/a", "na", "none", "-", "nil", ""}

CANONICAL_ALIASES = {
    "name": ["name"],
    "location": ["location", "table on", "cabin", "desk"],
    "devices_used": ["devices used", "devices used by you", "device used"],
    "pc_brand": ["pc brand"],
    "pc_sl_no": ["pc sl no", "pc serial", "pc serial no"],
    "laptop_brand": ["laptop brand"],
    "laptop_sl_no": ["laptop sl no", "laptop serial"],
    "mouse_brand": ["mouse brand"],
    "mouse_sl_no": ["mouse sl no"],
    "keyboard_brand": ["keyboard brand"],
    "keyboard_sl_no": ["keyboard sl no"],
    "monitor_brand": ["monitor brand"],
    "monitor_sl_no": ["monitor sl no"],
    "other_device": ["other device", "other device brand"],
    "other_device_sl_no": ["other device sl no"],
    "other_device_2": ["other device 2", "any other 2nd device", "other 2nd device"],
    "other_device_2_brand": ["other device 2 brand"],
    "other_device_2_sl_no": ["other device 2 sl no"],
    "remarks": ["remarks", "status", "notes"],
}


def normalize_header(h: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(h).lower()).strip()


def resolve_columns(columns) -> dict:
    normalized_aliases = {
        canon: [normalize_header(a) for a in aliases]
        for canon, aliases in CANONICAL_ALIASES.items()
    }
    resolved = {}
    for col in columns:
        norm_col = normalize_header(col)

        exact_match = next(
            (canon for canon, aliases in normalized_aliases.items() if norm_col in aliases),
            None,
        )
        if exact_match:
            resolved[col] = exact_match
            continue

        best_canon, best_score = None, 0
        for canon, aliases in normalized_aliases.items():
            for alias in aliases:
                score = fuzz.ratio(norm_col, alias)
                if score > best_score:
                    best_score, best_canon = score, canon
        if best_score >= 80:
            resolved[col] = best_canon

    return resolved


def normalize_device_token(token: str, threshold: int = 78) -> str | None:
    token = token.strip()
    if not token:
        return None

    best_type, best_score = None, 0
    for canon in CORE_DEVICE_CANON:
        score = max(
            fuzz.ratio(token.lower(), canon.lower()),
            fuzz.partial_ratio(token.lower(), canon.lower()),
        )
        if score > best_score:
            best_score, best_type = score, canon

    return best_type if best_score >= threshold else None


def normalize_location(raw: str) -> str:
    cleaned = re.sub(r"\s*,\s*", " ", str(raw))
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return normalize_title(cleaned)


def classify_freeform_device(value: str):
    value = str(value).strip()
    if value.lower() in SENTINEL_VALUES:
        return None

    for canon in KNOWN_DEVICE_TYPES:
        if canon.lower() in value.lower() or fuzz.partial_ratio(canon.lower(), value.lower()) >= 85:
            brand = value if value.lower() != canon.lower() else None
            return canon, brand

    return "Other", value


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def make_user_key(name: str, location: str) -> str:
    return f"{slugify(name)}.{slugify(location)}@placeholder.internal"


def parse_wide_excel(file) -> tuple[list[dict], dict]:
    raw_df = pd.read_excel(file)

    col_map = resolve_columns(raw_df.columns)
    unmapped = [c for c in raw_df.columns if c not in col_map]
    df = raw_df.rename(columns=col_map)

    required = {"name", "location", "devices_used"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Could not identify required columns: {sorted(missing)}")

    records = []
    skipped_rows = []
    uncertain = []

    for idx, row in df.iterrows():
        name = str(row["name"]).strip()
        location = normalize_location(row["location"])
        user_key = make_user_key(name, location)
        status = "Active" if "remarks" not in df.columns or str(row.get("remarks", "")).strip().lower() == "active" else "Inactive"

        raw_devices = str(row["devices_used"]).split(",")
        devices_used = {t for t in (normalize_device_token(d) for d in raw_devices) if t}

        for device_type, (brand_col, serial_col) in CORE_DEVICE_CANON.items():
            if device_type not in devices_used:
                continue
            if brand_col not in df.columns or serial_col not in df.columns:
                continue

            serial = str(row[serial_col]).strip()
            if not serial or serial.lower() == "nan":
                skipped_rows.append(f"Row {idx + 2}: {device_type} listed for {name} but no serial number found")
                continue

            brand = str(row[brand_col]).strip()
            records.append({
                "asset_code": f"{slugify(device_type)}-{serial}".upper(),
                "name": f"{device_type} ({serial})",
                "category": "IT Equipment",
                "commodity_type": device_type,
                "brand_name": brand if brand and brand.lower() != "nan" else None,
                "model_name": None,
                "serial_number": serial,
                "location": location,
                "status": status,
                "assigned_user_key": user_key,
                "assigned_user_name": name,
            })

        for type_col, serial_col, brand_col in [
            ("other_device", "other_device_sl_no", None),
            ("other_device_2", "other_device_2_sl_no", "other_device_2_brand"),
        ]:
            if type_col not in df.columns or serial_col not in df.columns:
                continue

            raw_value = row.get(type_col)
            if pd.isna(raw_value):
                continue

            classified = classify_freeform_device(raw_value)
            if classified is None:
                continue
            commodity_type, inferred_brand = classified
            if commodity_type == "Other":
                uncertain.append(f"Row {idx + 2}: could not classify '{raw_value}' for {name}, tagged as 'Other'")

            serial = str(row[serial_col]).strip()
            if not serial or serial.lower() == "nan":
                continue

            explicit_brand = None
            if brand_col and brand_col in df.columns:
                explicit_brand = str(row[brand_col]).strip()
                if explicit_brand.lower() == "nan":
                    explicit_brand = None

            brand_name = explicit_brand or inferred_brand

            records.append({
                "asset_code": f"{slugify(commodity_type)}-{serial}".upper(),
                "name": f"{commodity_type} ({serial})",
                "category": "IT Equipment",
                "commodity_type": commodity_type,
                "brand_name": brand_name,
                "model_name": None,
                "serial_number": serial,
                "location": location,
                "status": status,
                "assigned_user_key": user_key,
                "assigned_user_name": name,
            })

    report = {
        "unmapped_columns": unmapped,
        "skipped_rows": skipped_rows,
        "uncertain_classifications": uncertain,
    }

    return records, report
def upsert_wide_format(db: Session, records: list[dict]) -> dict:
    seen_asset_codes = set()
    users_cache = {}
    assets_by_serial = {}
    seen_assignment_pairs = set()
    added, updated, new_users, new_assignments, reclassified = 0, 0, 0, 0, 0

    for rec in records:
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
        if not asset:
            asset = assets_by_serial.get(rec["serial_number"])
        if not asset:
            asset = db.query(Asset).filter(Asset.serial_number == rec["serial_number"]).first()

        if asset:
            if asset.asset_code != rec["asset_code"]:
                reclassified += 1
            asset.asset_code = rec["asset_code"]
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

        assets_by_serial[rec["serial_number"]] = asset
        seen_asset_codes.add(asset.asset_code)

        assignment_key = (asset.id, user.id)
        if assignment_key not in seen_assignment_pairs:
            existing_assignment = (
                db.query(AssetAssignment)
                .filter(AssetAssignment.asset_id == asset.id, AssetAssignment.user_id == user.id)
                .first()
            )
            if not existing_assignment:
                db.add(AssetAssignment(asset_id=asset.id, user_id=user.id))
                new_assignments += 1
            seen_assignment_pairs.add(assignment_key)

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
        "reclassified": reclassified,
    }