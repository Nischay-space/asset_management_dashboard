from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Asset, User
from app.auth import get_current_user

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pattern = f"%{q}%"

    assets = (
        db.query(Asset)
        .filter(
            (Asset.name.ilike(pattern))
            | (Asset.asset_code.ilike(pattern))
            | (Asset.brand_name.ilike(pattern))
            | (Asset.serial_number.ilike(pattern))
        )
        .limit(5)
        .all()
    )

    users = (
        db.query(User)
        .filter((User.name.ilike(pattern)) | (User.email.ilike(pattern)))
        .limit(5)
        .all()
    )

    return {
        "assets": [{"id": a.id, "name": a.name, "asset_code": a.asset_code} for a in assets],
        "users": [{"id": u.id, "name": u.name, "email": u.email} for u in users],
    }