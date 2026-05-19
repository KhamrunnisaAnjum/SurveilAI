import uuid
from datetime import datetime
from sqlalchemy import Column, Float, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    score = Column(Float, nullable=False)
    computed_at = Column(DateTime, default=datetime.utcnow)
    shap_values = Column(JSON, default=dict)
    model_version = Column(String(50), nullable=True)

    patient = relationship("Patient", back_populates="risk_scores")
