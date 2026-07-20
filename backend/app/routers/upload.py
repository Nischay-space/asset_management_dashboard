import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.excel_parser import parse_excel, upsert_assets
from app.services.wide_format_parser import parse_wide_excel, upsert_wide_format
from app.auth import require_admin
from app.models import User, Asset
from app import schemas

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/preview")
def preview_standard(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")

    try:
        df = parse_excel(file.file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    df = df.where(pd.notnull(df), None)
    records = df.to_dict(orient="records")

    existing_codes = {row[0] for row in db.query(Asset.asset_code).all()}
    would_update = sum(1 for r in records if r.get("asset_code") in existing_codes)
    would_add = len(records) - would_update

    return {
        "records": records,
        "preview": {
            "total_records": len(records),
            "would_add": would_add,
            "would_update": would_update,
        },
    }


@router.post("/commit")
def commit_standard(
    payload: schemas.StandardCommitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    df = pd.DataFrame([r.model_dump() for r in payload.records])
    result = upsert_assets(db, df)
    return {"message": "Import completed successfully", "summary": result}


@router.post("/hardware-list/preview")
def preview_hardware_list(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")

    try:
        records, report = parse_wide_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    existing_serials = {row[0] for row in db.query(Asset.serial_number).all()}
    would_update = sum(1 for r in records if r["serial_number"] in existing_serials)
    would_add = len(records) - would_update

    return {
        "records": records,
        "report": report,
        "preview": {
            "total_records": len(records),
            "would_add": would_add,
            "would_update": would_update,
        },
    }


@router.post("/hardware-list/commit")
def commit_hardware_list(
    payload: schemas.WideFormatCommitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    records = [r.model_dump() for r in payload.records]
    result = upsert_wide_format(db, records)
    return {"message": "Import completed successfully", "summary": result}