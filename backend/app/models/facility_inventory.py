import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID


class FacilityInventory(Base):
    __tablename__ = "facility_inventory"

    facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"), primary_key=True)
    icu_beds_total = Column(Integer, default=0)
    icu_beds_available = Column(Integer, default=0)
    o2_cylinders_total = Column(Integer, default=0)
    o2_cylinders_available = Column(Integer, default=0)
    blood_units = Column(JSON, default=dict)
    ambulances_total = Column(Integer, default=0)
    ambulances_available = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    facility = relationship("Facility", back_populates="inventory")
