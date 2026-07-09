from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.excel_parser import parse_excel, upsert_assets

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/")
def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")

    try:
        df = parse_excel(file.file)
        result = upsert_assets(db, df)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Upload processed successfully", "summary": result}