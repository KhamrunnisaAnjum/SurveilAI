from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import User, District
from app.schemas.admin import UserCreate, UserUpdate, UserResponse, DistrictResponse, SystemHealthResponse
from app.middleware.auth import get_current_user
import csv
import io

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = Query(0),
    limit: int = Query(50),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "mobile_number": u.mobile_number,
            "name": u.name,
            "role": u.role,
            "language": u.language,
            "district_id": str(u.district_id) if u.district_id else None,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    existing = await db.execute(select(User).where(User.mobile_number == data.mobile_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    new_user = User(
        mobile_number=data.mobile_number,
        name=data.name,
        role=data.role,
        language=data.language,
        district_id=data.district_id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "id": str(new_user.id),
        "mobile_number": new_user.mobile_number,
        "name": new_user.name,
        "role": new_user.role,
        "language": new_user.language,
        "district_id": str(new_user.district_id) if new_user.district_id else None,
        "is_active": new_user.is_active,
        "created_at": new_user.created_at.isoformat(),
    }


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db_user = await db.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)

    return {
        "id": str(db_user.id),
        "mobile_number": db_user.mobile_number,
        "name": db_user.name,
        "role": db_user.role,
        "language": db_user.language,
        "district_id": str(db_user.district_id) if db_user.district_id else None,
        "is_active": db_user.is_active,
        "created_at": db_user.created_at.isoformat(),
    }


@router.delete("/users/{user_id}", status_code=200)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db_user = await db.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}


@router.get("/districts", response_model=list[DistrictResponse])
async def list_districts(db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    result = await db.execute(select(District))
    districts = result.scalars().all()
    return [{"id": str(d.id), "name": d.name, "state": d.state} for d in districts]


@router.get("/system-health", response_model=SystemHealthResponse)
async def system_health(db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return {
        "api_p95_latency_ms": 45.0,
        "model_avg_inference_ms": 120.0,
        "alert_delivery_rate_pct": 99.8,
        "db_pool_usage_pct": 35.0,
    }


@router.get("/export/reports")
async def export_reports(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    from app.models import SymptomReport

    if user.get("role") not in ["admin", "public_health_officer"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    result = await db.execute(select(SymptomReport).order_by(SymptomReport.reported_at.desc()))
    reports = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "reporter_id", "body_area", "symptoms", "severity", "district_id", "reported_at", "status"])
    for r in reports:
        writer.writerow([str(r.id), str(r.reporter_id), r.body_area, ";".join(r.symptoms), r.severity, str(r.district_id), r.reported_at.isoformat(), r.status])

    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=reports.csv"})
