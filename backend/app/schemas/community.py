from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class SymptomReportCreate(BaseModel):
    body_area: str
    symptoms: List[str]
    severity: int = Field(..., ge=1, le=10)
    lat: float
    lng: float
    district_id: uuid.UUID


class SymptomReportBatch(BaseModel):
    reports: List[SymptomReportCreate]


class SymptomReportResponse(BaseModel):
    id: uuid.UUID
    reporter_id: uuid.UUID
    body_area: str
    symptoms: List[str]
    severity: int
    lat: float
    lng: float
    district_id: uuid.UUID
    reported_at: datetime
    status: str

    model_config = {"from_attributes": True}


class OutbreakDataPoint(BaseModel):
    district_id: uuid.UUID
    district_name: str
    case_count: int
    severity: str


class OutbreakAlertResponse(BaseModel):
    id: uuid.UUID
    type: str
    severity: str
    message: str
    created_at: datetime
    status: str

    model_config = {"from_attributes": True}
