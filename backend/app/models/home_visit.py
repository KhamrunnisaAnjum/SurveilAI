import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID


class VisitStatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
    missed = "missed"


class HomeVisit(Base):
    __tablename__ = "home_visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asha_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    status = Column(Enum("pending", "completed", "missed", name="visitstatusenum"), server_default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    asha_worker = relationship("User", back_populates="home_visits")
    patient = relationship("Patient", back_populates="home_visits")
