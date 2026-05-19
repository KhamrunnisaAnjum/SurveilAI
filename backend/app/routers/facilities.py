from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Facility, FacilityInventory
from app.schemas.facility import FacilityListParams, FacilityResponse, FacilityDetailResponse, FacilityInventoryUpdate, InventoryResponse
from app.middleware.auth import get_current_user
from app.services.geo_service import get_facilities, get_facility_detail

router = APIRouter(prefix="/api/facilities", tags=["facilities"])


@router.get("", response_model=list[FacilityResponse])
async def list_facilities(
    lat: float = Query(None),
    lng: float = Query(None),
    radius_km: float = Query(5.0),
    type: str = Query(None),
    icu_available: bool = Query(None),
    o2_available: bool = Query(None),
    blood_type: str = Query(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    params = FacilityListParams(
        lat=lat, lng=lng, radius_km=radius_km, type=type,
        icu_available=icu_available, o2_available=o2_available, blood_type=blood_type,
    )
    rows = await get_facilities(db, params)

    facilities = []
    for row in rows:
        facility = row[0] if isinstance(row, tuple) else row
        distance = row[1] if isinstance(row, tuple) and len(row) > 1 else None

        facilities.append({
            "id": str(facility.id),
            "name": facility.name,
            "type": facility.type,
            "district_id": str(facility.district_id),
            "address": facility.address,
            "phone": facility.phone,
            "google_maps_url": facility.google_maps_url,
            "distance_km": round(distance, 2) if distance else None,
        })

    return facilities


@router.get("/{facility_id}", response_model=FacilityDetailResponse)
async def get_facility(
    facility_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    facility = await get_facility_detail(db, facility_id)
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    return {
        "id": str(facility.id),
        "name": facility.name,
        "type": facility.type,
        "district_id": str(facility.district_id),
        "address": facility.address,
        "phone": facility.phone,
        "google_maps_url": facility.google_maps_url,
        "inventory": {
            "icu_beds_total": facility.inventory.icu_beds_total,
            "icu_beds_available": facility.inventory.icu_beds_available,
            "o2_cylinders_total": facility.inventory.o2_cylinders_total,
            "o2_cylinders_available": facility.inventory.o2_cylinders_available,
            "blood_units": facility.inventory.blood_units or {},
            "ambulances_total": facility.inventory.ambulances_total,
            "ambulances_available": facility.inventory.ambulances_available,
            "updated_at": facility.inventory.updated_at.isoformat(),
        } if facility.inventory else None,
    }


@router.put("/{facility_id}/inventory", status_code=200)
async def update_inventory(
    facility_id: str,
    data: FacilityInventoryUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") not in ["admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    inventory = await db.get(FacilityInventory, facility_id)
    if not inventory:
        inventory = FacilityInventory(facility_id=facility_id)
        db.add(inventory)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(inventory, key, value)

    await db.commit()
    await db.refresh(inventory)

    return {
        "icu_beds_total": inventory.icu_beds_total,
        "icu_beds_available": inventory.icu_beds_available,
        "o2_cylinders_total": inventory.o2_cylinders_total,
        "o2_cylinders_available": inventory.o2_cylinders_available,
        "blood_units": inventory.blood_units or {},
        "ambulances_total": inventory.ambulances_total,
        "ambulances_available": inventory.ambulances_available,
        "updated_at": inventory.updated_at.isoformat(),
    }
