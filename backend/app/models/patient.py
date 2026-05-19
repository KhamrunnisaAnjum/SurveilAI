import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, Boolean, DateTime, ForeignKey, Integer, Date
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID


class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Enum("male", "female", "other", name="genderenum"), nullable=False)
    ward_id = Column(String(50), nullable=True)
    admission_date = Column(Date, nullable=False)
    discharge_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="patient_profile")
    vitals = relationship("Vital", back_populates="patient", order_by="Vital.recorded_at.desc()")
    risk_scores = relationship("RiskScore", back_populates="patient")
    home_visits = relationship("HomeVisit", back_populates="patient")
