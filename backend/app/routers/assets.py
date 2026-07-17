from fastapi import APIRouter, Depends, Query,HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin
from app.models import User
from typing import List, Optional
from datetime import datetime, timedelta
from app.utils import normalize_title
from app.models import AssetAssignment
from app.models import Invoice
from app.services.storage import delete_file

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

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_assets = db.query(models.Asset).count()
    active_assets = db.query(models.Asset).filter(models.Asset.is_active == True).count()
    inactive_assets = total_assets - active_assets
    total_locations = db.query(models.Asset.location).filter(models.Asset.location.isnot(None)).distinct().count()
    total_users = db.query(models.User).count()

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recently_added = db.query(models.Asset).filter(models.Asset.created_at >= seven_days_ago).count()

    return {
        "total_assets": total_assets,
        "active_assets": active_assets,
        "inactive_assets": inactive_assets,
        "total_locations": total_locations,
        "total_users": total_users,
        "recently_added": recently_added,
    }
@router.post("/", response_model=schemas.AssetOut)
def create_asset(payload: schemas.AssetCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    existing = db.query(models.Asset).filter(models.Asset.asset_code == payload.asset_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="An asset with this code already exists")

    data = payload.model_dump()
    for field in ("category", "commodity_type", "location", "status"):
        if data.get(field):
            data[field] = normalize_title(data[field])

    asset = models.Asset(**data, is_active=True)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

@router.post("/{asset_id}/assignments/{user_id}")
def assign_user_to_asset(asset_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not asset or not user:
        raise HTTPException(status_code=404, detail="Asset or user not found")

    existing = db.query(AssetAssignment).filter(
        AssetAssignment.asset_id == asset_id, AssetAssignment.user_id == user_id
    ).first()
    if existing:
        return {"message": "Already assigned"}

    db.add(AssetAssignment(asset_id=asset_id, user_id=user_id))
    db.commit()
    return {"message": "User assigned"}


@router.delete("/{asset_id}/assignments/{user_id}")
def unassign_user_from_asset(asset_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    assignment = db.query(AssetAssignment).filter(
        AssetAssignment.asset_id == asset_id, AssetAssignment.user_id == user_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.delete(assignment)
    db.commit()
    return {"message": "User unassigned"}

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

@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    invoices = db.query(Invoice).filter(Invoice.asset_id == asset_id).all()
    for invoice in invoices:
        delete_file(invoice.file_path)

    db.delete(asset)
    db.commit()

    return {"message": "Asset deleted"}

@router.patch("/{asset_id}", response_model=schemas.AssetOut)
def update_asset(asset_id: int, payload: schemas.AssetUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    updates = payload.model_dump(exclude_unset=True)
    for field in ("category", "commodity_type", "location", "status"):
        if field in updates and updates[field]:
            updates[field] = normalize_title(updates[field])

    for field, value in updates.items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return asset


#filter endpoint
@router.get("/{asset_id}", response_model=schemas.AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

    

