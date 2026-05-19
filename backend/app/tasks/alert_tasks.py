from celery import shared_task
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.database import async_session
from app.models import Patient, RiskScore, Alert, User, District
from app.services.notification_service import send_fcm_notification
from app.services.alert_service import create_alert


@shared_task
def send_high_risk_alerts():
    import asyncio

    async def _run():
        async with async_session() as db:
            cutoff = datetime.utcnow() - timedelta(minutes=15)
            result = await db.execute(
                select(RiskScore, Patient)
                .join(Patient, Patient.id == RiskScore.patient_id)
                .where(RiskScore.score > 70, RiskScore.computed_at >= cutoff)
            )
            high_risk = result.all()

            for risk, patient in high_risk:
                existing = await db.execute(
                    select(Alert).where(
                        Alert.type == "high_risk_patient",
                        Alert.source_id == patient.id,
                        Alert.status == "active",
                    )
                )
                if existing.scalar_one_or_none():
                    continue

                alert_data = {
                    "type": "high_risk_patient",
                    "severity": "high",
                    "district_id": patient.user.district_id,
                    "source_id": patient.id,
                    "message": f"High risk patient: {patient.user.name} (Score: {risk.score})",
                    "details": {"patient_id": str(patient.id), "score": risk.score},
                }
                await create_alert(db, alert_data, str(patient.user.id))

    asyncio.run(_run())


@shared_task
def generate_daily_summary():
    import asyncio

    async def _run():
        async with async_session() as db:
            yesterday = datetime.utcnow() - timedelta(days=1)
            result = await db.execute(
                select(District, func.count(Alert.id).label("alert_count"))
                .join(Alert, Alert.district_id == District.id, isouter=True)
                .where(Alert.created_at >= yesterday)
                .group_by(District.id)
            )
            districts = result.all()

            phos = await db.execute(select(User).where(User.role == "public_health_officer"))
            for pho in phos.scalars().all():
                if pho.fcm_token:
                    await send_fcm_notification(
                        pho.fcm_token,
                        "Daily Health Summary",
                        f"Your district had {districts[0][1] if districts else 0} alerts yesterday.",
                        {"type": "daily_summary"},
                    )

    asyncio.run(_run())
