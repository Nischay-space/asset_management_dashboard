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
    
class AssetCreate(BaseModel):
    asset_code: str
    name: str
    category: Optional[str] = None
    commodity_type: Optional[str] = None
    brand_name: Optional[str] = None
    model_name: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    commodity_type: Optional[str] = None
    brand_name: Optional[str] = None
    model_name: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None 
      
class UserCreate(BaseModel):
    name: str
    email: Optional[str] = None
    role: str = "viewer"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

    
class WideFormatRecord(BaseModel):
    asset_code: str
    name: str
    category: Optional[str] = None
    commodity_type: Optional[str] = None
    brand_name: Optional[str] = None
    model_name: Optional[str] = None
    serial_number: str
    location: Optional[str] = None
    status: Optional[str] = None
    assigned_user_key: str
    assigned_user_name: str


class WideFormatCommitRequest(BaseModel):
    records: List[WideFormatRecord]


class StandardRecord(BaseModel):
    asset_code: str
    name: str
    category: Optional[str] = None
    commodity_type: Optional[str] = None
    brand_name: Optional[str] = None
    model_name: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class StandardCommitRequest(BaseModel):
    records: List[StandardRecord]