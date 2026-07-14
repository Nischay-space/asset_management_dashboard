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

class AssetSummary(BaseModel):
    id: int
    asset_code: str
    name: str
    commodity_type: Optional[str]
    brand_name: Optional[str]
    location: Optional[str]
    status: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class UserWithAssets(BaseModel):
    id: int
    name: str
    email: Optional[str]
    role: str
    assigned_assets: List[AssetSummary] = []

    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    id: int
    file_name: str
    file_size: int
    file_type: str
    uploaded_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True       