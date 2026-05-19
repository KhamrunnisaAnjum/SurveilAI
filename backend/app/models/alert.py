import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID


class AlertTypeEnum(str, Enum):
    outbreak = "outbreak"
    high_risk_patient = "high_risk_patient"
    resource_shortage = "resource_shortage"
    broadcast = "broadcast"


class AlertSeverityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertStatusEnum(str, Enum):
    active = "active"
    acknowledged = "acknowledged"
    dismissed = "dismissed"
    escalated = "escalated"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum("outbreak", "high_risk_patient", "resource_shortage", "broadcast", name="alerttypeenum"), nullable=False)
    severity = Column(Enum("low", "medium", "high", "critical", name="alertseverityenum"), nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"), nullable=False)
    source_id = Column(UUID(as_uuid=True), nullable=True)
    message = Column(String(1000), nullable=False)
    details = Column(JSON, default=dict)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    status = Column(Enum("active", "acknowledged", "dismissed", "escalated", name="alertstatusenum"), server_default="active")

    district = relationship("District", back_populates="alerts")
    creator = relationship("User", back_populates="created_alerts")
    acknowledged_by_user = relationship("User", back_populates="acknowledged_alerts")
