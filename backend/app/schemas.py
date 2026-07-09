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
    commodity_type: Optional[str]
    brand_name: Optional[str]
    model_name: Optional[str]
    serial_number: Optional[str]
    location: Optional[str]
    status: Optional[str]
    is_active: bool
    created_at: datetime
    assigned_users: List[UserOut] = []

    class Config:
        from_attributes = True