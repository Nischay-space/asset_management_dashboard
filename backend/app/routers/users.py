from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserWithAssets])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(models.User).all()


@router.get("/{user_id}", response_model=schemas.UserWithAssets)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user