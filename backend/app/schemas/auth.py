from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class OTPRequest(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)


class OTPVerify(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)


class TokenRefresh(BaseModel):
    refresh_token: str


class FCMTokenRequest(BaseModel):
    fcm_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    mobile_number: str
    name: str
    role: str
    language: str = "en"
    district_id: Optional[uuid.UUID] = None


class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
