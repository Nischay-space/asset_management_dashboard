from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.excel_parser import parse_excel, upsert_assets
from app.auth import require_admin
from app.models import User
from app.services.wide_format_parser import parse_wide_excel, upsert_wide_format


router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/")
def upload_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")

    try:
        df = parse_excel(file.file)
        result = upsert_assets(db, df)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Upload processed successfully", "summary": result}

@router.post("/hardware-list")
def upload_hardware_list(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")

    try:
        records, report = parse_wide_excel(file.file)
        result = upsert_wide_format(db, records)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")

    return {"message": "Hardware list processed successfully", "summary": {**result, **report}}