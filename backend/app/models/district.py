import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID, Geometry


class District(Base):
    __tablename__ = "districts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    geom = Geometry("POLYGON", srid=4326, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="district")
    facilities = relationship("Facility", back_populates="district")
    symptom_reports = relationship("SymptomReport", back_populates="district")
    alerts = relationship("Alert", back_populates="district")
