import pandas as pd
from sqlalchemy.orm import Session
from app.models import Asset

REQUIRED_COLUMNS = ["asset_code", "name", "category", "commodity_type", "location", "status"]


def parse_excel(file) -> pd.DataFrame:
    df = pd.read_excel(file)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    df["asset_code"] = df["asset_code"].astype(str).str.strip()
    df = df[df["asset_code"] != ""]

    return df


def upsert_assets(db: Session, df: pd.DataFrame) -> dict:
    seen_codes = set()
    added, updated = 0, 0

    for _, row in df.iterrows():
        code = row["asset_code"]
        seen_codes.add(code)

        existing = db.query(Asset).filter(Asset.asset_code == code).first()

        if existing:
            existing.name = row["name"]
            existing.category = row.get("category")
            existing.location = row.get("location")
            existing.status = row.get("status")
            existing.commodity_type = row.get("commodity_type")
            existing.brand_name = row.get("brand_name")
            existing.model_name = row.get("model_name")
            existing.serial_number = row.get("serial_number")
            existing.is_active = True
            updated += 1
        else:
            new_asset = Asset(
                asset_code=code,
                name=row["name"],
                category=row.get("category"),
                location=row.get("location"),
                status=row.get("status"),
                commodity_type=row.get("commodity_type"),
                brand_name=row.get("brand_name"),
                model_name=row.get("model_name"),
                serial_number=row.get("serial_number"),
                is_active=True,
            )
            db.add(new_asset)
            added += 1

    deactivated = (
        db.query(Asset)
        .filter(Asset.asset_code.notin_(seen_codes), Asset.is_active == True)
        .update({Asset.is_active: False}, synchronize_session=False)
    )

    db.commit()

    return {"added": added, "updated": updated, "deactivated": deactivated}