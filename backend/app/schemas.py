from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    role: str

    class Config:
        from_attributes = True


class AssetOut(BaseModel):
    id: int
    asset_code: str
    name: str
    category: Optional[str]
    location: Optional[str]
    status: Optional[str]
    value: Optional[float]
    is_active: bool
    created_at: datetime
    assigned_users: List[UserOut] = []

    class Config:
        from_attributes = True