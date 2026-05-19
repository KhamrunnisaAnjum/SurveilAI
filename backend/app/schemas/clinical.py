from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, date
import uuid


class PatientListParams(BaseModel):
    ward: Optional[str] = None
    risk_level: Optional[str] = None
    admission_date_from: Optional[date] = None
    admission_date_to: Optional[date] = None
    skip: int = 0
    limit: int = 50


class PatientResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    age: int
    gender: str
    ward_id: Optional[str]
    admission_date: date
    risk_score: Optional[float] = None

    model_config = {"from_attributes": True}


class PatientDetailResponse(PatientResponse):
    vitals: List["VitalResponse"] = []
    latest_risk: Optional["RiskScoreResponse"] = None


class VitalCreate(BaseModel):
    patient_id: uuid.UUID
    heart_rate: Optional[int] = None
    spo2: Optional[int] = None
    temperature: Optional[float] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    respiratory_rate: Optional[int] = None


class VitalResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    recorded_at: datetime
    heart_rate: Optional[int]
    spo2: Optional[int]
    temperature: Optional[float]
    bp_systolic: Optional[int]
    bp_diastolic: Optional[int]
    respiratory_rate: Optional[int]

    model_config = {"from_attributes": True}


class RiskScoreResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    score: float
    computed_at: datetime
    shap_values: Dict[str, float]
    model_version: Optional[str]

    model_config = {"from_attributes": True}


class EscalateRequest(BaseModel):
    message: Optional[str] = None


PatientDetailResponse.model_rebuild()
