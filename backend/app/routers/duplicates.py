from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from rapidfuzz import fuzz
from app.database import get_db
from app.models import User, AssetAssignment, DuplicateDismissal
from app.auth import require_admin

router = APIRouter(prefix="/duplicates", tags=["duplicates"])

SIMILARITY_THRESHOLD = 85


def normalize_pair(id1: int, id2: int) -> tuple[int, int]:
    return (id1, id2) if id1 < id2 else (id2, id1)


@router.get("/")
def get_duplicate_candidates(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    users = db.query(User).all()
    dismissed = db.query(DuplicateDismissal).all()
    dismissed_pairs = {(d.user_id_a, d.user_id_b) for d in dismissed}

    candidates = []
    for i in range(len(users)):
        for j in range(i + 1, len(users)):
            user_a, user_b = users[i], users[j]
            pair_key = normalize_pair(user_a.id, user_b.id)

            if pair_key in dismissed_pairs:
                continue

            name_score = fuzz.ratio(user_a.name.lower(), user_b.name.lower())

            if name_score < SIMILARITY_THRESHOLD:
                continue

            reason = "similar name"
            if name_score == 100:
                reason = "identical name, different location on record"

            candidates.append({
                "user_a": {"id": user_a.id, "name": user_a.name, "email": user_a.email, "asset_count": len(user_a.assigned_assets)},
                "user_b": {"id": user_b.id, "name": user_b.name, "email": user_b.email, "asset_count": len(user_b.assigned_assets)},
                "similarity": name_score,
                "reason": reason,
            })

    candidates.sort(key=lambda c: c["similarity"], reverse=True)
    return candidates


class DismissRequest(BaseModel):
    user_id_a: int
    user_id_b: int


@router.post("/dismiss")
def dismiss_pair(payload: DismissRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    id_a, id_b = normalize_pair(payload.user_id_a, payload.user_id_b)

    existing = db.query(DuplicateDismissal).filter(
        DuplicateDismissal.user_id_a == id_a, DuplicateDismissal.user_id_b == id_b
    ).first()
    if existing:
        return {"message": "Already dismissed"}

    db.add(DuplicateDismissal(user_id_a=id_a, user_id_b=id_b, dismissed_by=current_user.id))
    db.commit()
    return {"message": "Pair dismissed"}


class MergeRequest(BaseModel):
    keep_user_id: int
    remove_user_id: int


@router.post("/merge")
def merge_users(payload: MergeRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if payload.keep_user_id == payload.remove_user_id:
        raise HTTPException(status_code=400, detail="Cannot merge a user with themselves")

    keep_user = db.query(User).filter(User.id == payload.keep_user_id).first()
    remove_user = db.query(User).filter(User.id == payload.remove_user_id).first()
    if not keep_user or not remove_user:
        raise HTTPException(status_code=404, detail="User not found")

    for asset in list(remove_user.assigned_assets):
        if keep_user not in asset.assigned_users:
            asset.assigned_users.append(keep_user)
        asset.assigned_users.remove(remove_user)

    db.flush()

    db.delete(remove_user)
    db.commit()

    return {"message": f"Merged into {keep_user.name}"}