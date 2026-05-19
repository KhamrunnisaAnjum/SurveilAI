import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID, Geometry, Array


class BodyAreaEnum(str, Enum):
    head = "head"
    chest = "chest"
    abdomen = "abdomen"
    limbs = "limbs"
    skin = "skin"
    other = "other"


class ReportStatusEnum(str, Enum):
    pending = "pending"
    reviewed = "reviewed"
    escalated = "escalated"


class SymptomReport(Base):
    __tablename__ = "symptom_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reported_at = Column(DateTime, default=datetime.utcnow)
    body_area = Column(Enum("head", "chest", "abdomen", "limbs", "skin", "other", name="bodyareaenum"), nullable=False)
    symptoms = Array(String)
    severity = Column(Integer, nullable=False)
    location = Geometry("POINT", srid=4326, nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"), nullable=False)
    synced_at = Column(DateTime, nullable=True)
    status = Column(Enum("pending", "reviewed", "escalated", name="reportstatusenum"), server_default="pending")

    reporter = relationship("User", back_populates="reported_symptoms")
    district = relationship("District", back_populates="symptom_reports")
