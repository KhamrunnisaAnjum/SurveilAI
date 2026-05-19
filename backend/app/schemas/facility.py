from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
import uuid


class FacilityListParams(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: float = 5.0
    type: Optional[str] = None
    icu_available: Optional[bool] = None
    o2_available: Optional[bool] = None
    blood_type: Optional[str] = None


class FacilityResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    district_id: uuid.UUID
    address: Optional[str]
    phone: Optional[str]
    google_maps_url: Optional[str]
    distance_km: Optional[float] = None

    model_config = {"from_attributes": True}


class FacilityInventoryUpdate(BaseModel):
    icu_beds_total: Optional[int] = None
    icu_beds_available: Optional[int] = None
    o2_cylinders_total: Optional[int] = None
    o2_cylinders_available: Optional[int] = None
    blood_units: Optional[Dict[str, int]] = None
    ambulances_total: Optional[int] = None
    ambulances_available: Optional[int] = None


class FacilityDetailResponse(FacilityResponse):
    inventory: Optional["InventoryResponse"] = None


class InventoryResponse(BaseModel):
    icu_beds_total: int
    icu_beds_available: int
    o2_cylinders_total: int
    o2_cylinders_available: int
    blood_units: Dict[str, int]
    ambulances_total: int
    ambulances_available: int
    updated_at: datetime

    model_config = {"from_attributes": True}


FacilityDetailResponse.model_rebuild()
