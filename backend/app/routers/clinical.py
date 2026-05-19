from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Patient, Vital, RiskScore, User
from app.schemas.clinical import (
    PatientListParams, PatientResponse, PatientDetailResponse, VitalCreate, VitalResponse, RiskScoreResponse, EscalateRequest
)
from app.middleware.auth import get_current_user
from app.services.risk_service import recalculate_patient_risk
from app.services.notification_service import send_fcm_notification

router = APIRouter(prefix="/api/clinical", tags=["clinical"])


@router.get("/patients", response_model=list[PatientResponse])
async def list_patients(
    ward: str = Query(None),
    risk_level: str = Query(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    query = select(Patient, User.name.label("name")).join(User, User.id == Patient.user_id).where(Patient.is_active == True)
    if ward:
        query = query.where(Patient.ward_id == ward)

    result = await db.execute(query)
    rows = result.all()

    patients = []
    for patient, name in rows:
        risk_result = await db.execute(
            select(RiskScore).where(RiskScore.patient_id == patient.id).order_by(RiskScore.computed_at.desc()).limit(1)
        )
        risk = risk_result.scalar_one_or_none()
        score = risk.score if risk else None

        if risk_level:
            if risk_level == "high" and (score is None or score <= 70):
                continue
            if risk_level == "moderate" and (score is None or score < 30 or score > 70):
                continue
            if risk_level == "low" and (score is None or score >= 30):
                continue

        patients.append({
            "id": str(patient.id),
            "user_id": str(patient.user_id),
            "name": name,
            "age": patient.age,
            "gender": patient.gender,
            "ward_id": patient.ward_id,
            "admission_date": patient.admission_date,
            "risk_score": score,
        })

    return patients


@router.get("/patients/{patient_id}", response_model=PatientDetailResponse)
async def get_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Patient, User.name.label("name")).join(User).where(Patient.id == patient_id))
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient, name = row

    vitals_result = await db.execute(
        select(Vital).where(Vital.patient_id == patient_id).order_by(Vital.recorded_at.desc()).limit(50)
    )
    vitals = vitals_result.scalars().all()

    risk_result = await db.execute(
        select(RiskScore).where(RiskScore.patient_id == patient_id).order_by(RiskScore.computed_at.desc()).limit(1)
    )
    risk = risk_result.scalar_one_or_none()

    return {
        "id": str(patient.id),
        "user_id": str(patient.user_id),
        "name": name,
        "age": patient.age,
        "gender": patient.gender,
        "ward_id": patient.ward_id,
        "admission_date": patient.admission_date,
        "risk_score": risk.score if risk else None,
        "vitals": [
            {
                "id": str(v.id),
                "patient_id": str(v.patient_id),
                "recorded_at": v.recorded_at.isoformat(),
                "heart_rate": v.heart_rate,
                "spo2": v.spo2,
                "temperature": v.temperature,
                "bp_systolic": v.bp_systolic,
                "bp_diastolic": v.bp_diastolic,
                "respiratory_rate": v.respiratory_rate,
            }
            for v in vitals
        ],
        "latest_risk": {
            "id": str(risk.id),
            "patient_id": str(risk.patient_id),
            "score": risk.score,
            "computed_at": risk.computed_at.isoformat(),
            "shap_values": risk.shap_values,
            "model_version": risk.model_version,
        } if risk else None,
    }


@router.get("/patients/{patient_id}/vitals", response_model=list[VitalResponse])
async def get_vitals(
    patient_id: str,
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    result = await db.execute(
        select(Vital).where(Vital.patient_id == patient_id, Vital.recorded_at >= cutoff).order_by(Vital.recorded_at)
    )
    vitals = result.scalars().all()
    return [
        {
            "id": str(v.id),
            "patient_id": str(v.patient_id),
            "recorded_at": v.recorded_at.isoformat(),
            "heart_rate": v.heart_rate,
            "spo2": v.spo2,
            "temperature": v.temperature,
            "bp_systolic": v.bp_systolic,
            "bp_diastolic": v.bp_diastolic,
            "respiratory_rate": v.respiratory_rate,
        }
        for v in vitals
    ]


@router.get("/risk/{patient_id}", response_model=RiskScoreResponse)
async def get_risk_score(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    risk = await recalculate_patient_risk(db, patient_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {
        "id": str(risk.id),
        "patient_id": str(risk.patient_id),
        "score": risk.score,
        "computed_at": risk.computed_at.isoformat(),
        "shap_values": risk.shap_values,
        "model_version": risk.model_version,
    }


@router.post("/risk/{patient_id}/recalculate", response_model=RiskScoreResponse)
async def recalculate_risk(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    risk = await recalculate_patient_risk(db, patient_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {
        "id": str(risk.id),
        "patient_id": str(risk.patient_id),
        "score": risk.score,
        "computed_at": risk.computed_at.isoformat(),
        "shap_values": risk.shap_values,
        "model_version": risk.model_version,
    }


@router.post("/patients/{patient_id}/escalate", status_code=status.HTTP_200_OK)
async def escalate_patient(
    patient_id: str,
    data: EscalateRequest = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    patient_result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    senior_clinicians = await db.execute(
        select(User).where(User.role.in_(["public_health_officer", "admin"]), User.district_id == patient.user.district_id)
    )
    for clinician in senior_clinicians.scalars().all():
        if clinician.fcm_token:
            await send_fcm_notification(
                clinician.fcm_token,
                "Patient Escalation",
                f"Patient {patient.user.name} has been escalated.",
                {"patient_id": patient_id, "escalated_by": user["sub"]},
            )

    return {"message": "Escalation sent to senior clinicians"}


@router.post("/vitals", response_model=VitalResponse, status_code=status.HTTP_201_CREATED)
async def record_vitals(
    data: VitalCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    vital = Vital(
        patient_id=data.patient_id,
        heart_rate=data.heart_rate,
        spo2=data.spo2,
        temperature=data.temperature,
        bp_systolic=data.bp_systolic,
        bp_diastolic=data.bp_diastolic,
        respiratory_rate=data.respiratory_rate,
        recorded_by=user["sub"],
    )
    db.add(vital)
    await db.commit()
    await db.refresh(vital)

    await recalculate_patient_risk(db, str(data.patient_id))

    return {
        "id": str(vital.id),
        "patient_id": str(vital.patient_id),
        "recorded_at": vital.recorded_at.isoformat(),
        "heart_rate": vital.heart_rate,
        "spo2": vital.spo2,
        "temperature": vital.temperature,
        "bp_systolic": vital.bp_systolic,
        "bp_diastolic": vital.bp_diastolic,
        "respiratory_rate": vital.respiratory_rate,
    }
