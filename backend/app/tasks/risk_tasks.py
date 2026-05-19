from celery import shared_task
from sqlalchemy import select
from app.database import async_session
from app.models import Patient
from app.services.risk_service import recalculate_patient_risk


@shared_task
def recalculate_all_risk_scores():
    import asyncio

    async def _run():
        async with async_session() as db:
            result = await db.execute(select(Patient).where(Patient.is_active == True))
            patients = result.scalars().all()
            for patient in patients:
                await recalculate_patient_risk(db, str(patient.id))

    asyncio.run(_run())
