from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/", response_model=List[schemas.AssetOut])
def list_assets(db: Session = Depends(get_db)):
    return db.query(models.Asset).all()