import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.dialect_helpers import UUID, Geometry


class FacilityTypeEnum(str, Enum):
    hospital = "hospital"
    clinic = "clinic"
    blood_bank = "blood_bank"
    phc = "phc"
    ambulance = "ambulance"


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    type = Column(Enum("hospital", "clinic", "blood_bank", "phc", "ambulance", name="facilitytypeenum"), nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"), nullable=False)
    location = Geometry("POINT", srid=4326, nullable=False)
    address = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    google_maps_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    district = relationship("District", back_populates="facilities")
    inventory = relationship("FacilityInventory", back_populates="facility", uselist=False)
