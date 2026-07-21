from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.models import User
from app.auth import require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserWithAssets])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(models.User).all()

@router.post("/", response_model=schemas.UserWithAssets)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if payload.email:
        existing = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="A user with this email already exists")

    user = models.User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=schemas.UserWithAssets)
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=schemas.UserWithAssets)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}