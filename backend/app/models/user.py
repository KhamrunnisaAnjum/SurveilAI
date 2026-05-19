import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID


class RoleEnum(str, Enum):
    patient = "patient"
    asha_worker = "asha_worker"
    nurse = "nurse"
    public_health_officer = "public_health_officer"
    admin = "admin"


class LanguageEnum(str, Enum):
    en = "en"
    hi = "hi"
    kn = "kn"
    ta = "ta"
    te = "te"
    mr = "mr"
    bn = "bn"
    od = "od"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mobile_number = Column(String(15), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    language = Column(Enum("en", "hi", "kn", "ta", "te", "mr", "bn", "od", name="languageenum"), server_default="en")
    role = Column(Enum("patient", "asha_worker", "nurse", "public_health_officer", "admin", name="roleenum"), nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"), nullable=True)
    village_cluster_id = Column(UUID(as_uuid=True), nullable=True)
    ward_id = Column(UUID(as_uuid=True), nullable=True)
    fcm_token = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    district = relationship("District", back_populates="users")
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    reported_symptoms = relationship("SymptomReport", back_populates="reporter")
    recorded_vitals = relationship("Vital", back_populates="recorded_by_user")
    created_alerts = relationship("Alert", back_populates="creator")
    acknowledged_alerts = relationship("Alert", back_populates="acknowledged_by_user")
    home_visits = relationship("HomeVisit", back_populates="asha_worker")
