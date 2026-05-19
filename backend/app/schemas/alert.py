from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
import uuid


class AlertCreate(BaseModel):
    type: str
    severity: str
    district_id: uuid.UUID
    message: str
    details: Optional[Dict] = None


class AlertResponse(BaseModel):
    id: uuid.UUID
    type: str
    severity: str
    district_id: uuid.UUID
    message: str
    details: Optional[Dict] = None
    created_by: uuid.UUID
    created_at: datetime
    acknowledged_by: Optional[uuid.UUID] = None
    acknowledged_at: Optional[datetime] = None
    status: str

    model_config = {"from_attributes": True}


class AlertListParams(BaseModel):
    district_id: Optional[uuid.UUID] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    skip: int = 0
    limit: int = 50
