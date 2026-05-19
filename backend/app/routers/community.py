from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from geoalchemy2.functions import ST_SetSRID, ST_MakePoint
from app.database import get_db
from app.models import SymptomReport, District, Alert
from app.schemas.community import SymptomReportCreate, SymptomReportBatch, SymptomReportResponse, OutbreakDataPoint, OutbreakAlertResponse
from app.middleware.auth import get_current_user
from app.services.geo_service import get_outbreak_data

router = APIRouter(prefix="/api/community", tags=["community"])


@router.post("/reports", response_model=SymptomReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(
    data: SymptomReportCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = SymptomReport(
        reporter_id=user["sub"],
        body_area=data.body_area,
        symptoms=data.symptoms,
        severity=data.severity,
        location=func.ST_SetSRID(func.ST_MakePoint(data.lng, data.lat), 4326),
        district_id=data.district_id,
        synced_at=datetime.utcnow(),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    report_dict = {
        "id": str(report.id),
        "reporter_id": str(report.reporter_id),
        "body_area": report.body_area,
        "symptoms": report.symptoms,
        "severity": report.severity,
        "lat": data.lat,
        "lng": data.lng,
        "district_id": str(report.district_id),
        "reported_at": report.reported_at.isoformat(),
        "status": report.status,
    }
    return report_dict


@router.post("/reports/batch", status_code=status.HTTP_201_CREATED)
async def batch_submit_reports(
    data: SymptomReportBatch,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    created = []
    for report_data in data.reports:
        report = SymptomReport(
            reporter_id=user["sub"],
            body_area=report_data.body_area,
            symptoms=report_data.symptoms,
            severity=report_data.severity,
            location=func.ST_SetSRID(func.ST_MakePoint(report_data.lng, report_data.lat), 4326),
            district_id=report_data.district_id,
        )
        db.add(report)
        created.append(report)
    await db.commit()
    return {"message": f"{len(created)} reports submitted", "count": len(created)}


@router.get("/reports", response_model=list[SymptomReportResponse])
async def list_reports(
    district_id: str = None,
    days: int = Query(7, ge=1, le=90),
    status_filter: str = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    query = select(SymptomReport).where(SymptomReport.reported_at >= cutoff)
    if district_id:
        query = query.where(SymptomReport.district_id == district_id)
    if status_filter:
        query = query.where(SymptomReport.status == status_filter)

    result = await db.execute(query.order_by(SymptomReport.reported_at.desc()))
    reports = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "reporter_id": str(r.reporter_id),
            "body_area": r.body_area,
            "symptoms": r.symptoms,
            "severity": r.severity,
            "lat": 0,
            "lng": 0,
            "district_id": str(r.district_id),
            "reported_at": r.reported_at.isoformat(),
            "status": r.status,
        }
        for r in reports
    ]


@router.get("/outbreaks", response_model=list[OutbreakDataPoint])
async def get_outbreaks(
    district_id: str = None,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    data = await get_outbreak_data(db, district_id, days)
    return [
        {
            "district_id": str(row.district_id),
            "district_name": row.district_name,
            "case_count": row.case_count,
            "severity": "high" if row.case_count > 20 else "medium" if row.case_count > 5 else "low",
        }
        for row in data
    ]


@router.get("/outbreaks/alerts", response_model=list[OutbreakAlertResponse])
async def get_outbreak_alerts(
    district_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Alert)
        .where(Alert.type == "outbreak", Alert.district_id == district_id, Alert.status == "active")
        .order_by(Alert.created_at.desc())
    )
    alerts = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "type": a.type,
            "severity": a.severity,
            "message": a.message,
            "created_at": a.created_at.isoformat(),
            "status": a.status,
        }
        for a in alerts
    ]
