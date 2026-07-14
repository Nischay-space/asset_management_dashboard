from fastapi import APIRouter, Depends, Query,HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.models import User
from typing import List, Optional

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/", response_model=List[schemas.AssetOut])
def list_assets(
    category: Optional[str] = Query(None),
    commodity_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(models.Asset)

    if category:
        query = query.filter(models.Asset.category.ilike(category))
    if commodity_type:
        query = query.filter(models.Asset.commodity_type.ilike(commodity_type))
    if location:
        query = query.filter(models.Asset.location.ilike(location))
    if status:
        query = query.filter(models.Asset.status.ilike(status))
    if search:
        pattern = f"%{search}%"
        query = query.outerjoin(models.Asset.assigned_users).filter(
            or_(
                models.Asset.brand_name.ilike(pattern),
                models.Asset.model_name.ilike(pattern),
                models.Asset.serial_number.ilike(pattern),
                models.Asset.asset_code.ilike(pattern),
                models.Asset.name.ilike(pattern),
                models.User.name.ilike(pattern),
            )
        ).distinct()

    return query.all()
#filter endpoint
@router.get("/filter-options")
def get_filter_options(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(models.Asset.category).distinct().filter(models.Asset.category.isnot(None)).all()
    commodity_types = db.query(models.Asset.commodity_type).distinct().filter(models.Asset.commodity_type.isnot(None)).all()
    locations = db.query(models.Asset.location).distinct().filter(models.Asset.location.isnot(None)).all()
    statuses = db.query(models.Asset.status).distinct().filter(models.Asset.status.isnot(None)).all()

    return {
        "categories": sorted([c[0] for c in categories]),
        "commodity_types": sorted([c[0] for c in commodity_types]),
        "locations": sorted([c[0] for c in locations]),
        "statuses": sorted([c[0] for c in statuses]),
    }
@router.get("/{asset_id}", response_model=schemas.AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_assets = db.query(models.Asset).count()
    active_assets = db.query(models.Asset).filter(models.Asset.is_active == True).count()
    inactive_assets = total_assets - active_assets
    total_locations = db.query(models.Asset.location).filter(models.Asset.location.isnot(None)).distinct().count()
    total_users = db.query(models.User).count()

    return {
        "total_assets": total_assets,
        "active_assets": active_assets,
        "inactive_assets": inactive_assets,
        "total_locations": total_locations,
        "total_users": total_users,
    }