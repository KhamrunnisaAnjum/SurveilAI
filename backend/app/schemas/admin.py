from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class UserCreate(BaseModel):
    mobile_number: str
    name: str
    role: str
    language: str = "en"
    district_id: Optional[uuid.UUID] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    language: Optional[str] = None
    district_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    mobile_number: str
    name: str
    role: str
    language: str
    district_id: Optional[uuid.UUID]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DistrictResponse(BaseModel):
    id: uuid.UUID
    name: str
    state: str

    model_config = {"from_attributes": True}


class SystemHealthResponse(BaseModel):
    api_p95_latency_ms: float
    model_avg_inference_ms: float
    alert_delivery_rate_pct: float
    db_pool_usage_pct: float
