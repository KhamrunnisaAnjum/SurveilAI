from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func as sql_func
from geoalchemy2.functions import ST_Distance, ST_Within, ST_AsGeoJSON, ST_SetSRID, ST_MakePoint
from app.models import Facility, FacilityInventory, District, SymptomReport
from app.schemas.facility import FacilityListParams


async def get_facilities(db: AsyncSession, params: FacilityListParams):
    query = select(Facility).where(Facility.is_active == True)

    if params.type:
        query = query.where(Facility.type == params.type)

    if params.lat and params.lng:
        point = func.ST_SetSRID(func.ST_MakePoint(params.lng, params.lat), 4326)
        distance = func.ST_Distance(Facility.location, point) * 111.32
        query = query.add_columns(distance.label("distance_km"))
        query = query.where(distance <= params.radius_km)
        query = query.order_by(distance)

        if params.icu_available:
            inventory_subq = select(FacilityInventory.facility_id).where(
                FacilityInventory.icu_beds_available > 0
            )
            query = query.where(Facility.id.in_(inventory_subq))

        if params.o2_available:
            inventory_subq = select(FacilityInventory.facility_id).where(
                FacilityInventory.o2_cylinders_available > 0
            )
            query = query.where(Facility.id.in_(inventory_subq))
    else:
        query = query.order_by(Facility.name)

    result = await db.execute(query)
    return result.all()


async def get_facility_detail(db: AsyncSession, facility_id: str):
    query = select(Facility).where(Facility.id == facility_id)
    result = await db.execute(query)
    facility = result.scalar_one_or_none()

    if facility:
        inv_query = select(FacilityInventory).where(FacilityInventory.facility_id == facility_id)
        inv_result = await db.execute(inv_query)
        facility.inventory = inv_result.scalar_one_or_none()

    return facility


async def get_outbreak_data(db: AsyncSession, district_id: str, days: int = 7):
    from datetime import datetime, timedelta

    cutoff = datetime.utcnow() - timedelta(days=days)
    query = (
        select(
            SymptomReport.district_id,
            District.name.label("district_name"),
            func.count(SymptomReport.id).label("case_count"),
        )
        .join(District, District.id == SymptomReport.district_id)
        .where(SymptomReport.reported_at >= cutoff)
    )

    if district_id:
        query = query.where(SymptomReport.district_id == district_id)

    query = query.group_by(SymptomReport.district_id, District.name)
    result = await db.execute(query)
    return result.all()


async def get_outbreak_geojson(db: AsyncSession, days: int = 7):
    from datetime import datetime, timedelta

    cutoff = datetime.utcnow() - timedelta(days=days)
    query = (
        select(
            District.id,
            District.name,
            func.count(SymptomReport.id).label("case_count"),
            func.ST_AsGeoJSON(District.geom).label("geojson"),
        )
        .join(SymptomReport, SymptomReport.district_id == District.id, isouter=True)
        .where(SymptomReport.reported_at >= cutoff)
        .group_by(District.id, District.name, District.geom)
    )
    result = await db.execute(query)
    return result.all()
