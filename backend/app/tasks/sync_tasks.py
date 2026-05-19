from celery import shared_task
from sqlalchemy import select
from app.database import async_session
from app.models import SymptomReport


@shared_task
def sync_offline_reports():
    import asyncio

    async def _run():
        async with async_session() as db:
            result = await db.execute(
                select(SymptomReport).where(SymptomReport.synced_at.is_(None))
            )
            reports = result.scalars().all()
            for report in reports:
                report.synced_at = __import__("datetime").datetime.utcnow()
            if reports:
                await db.commit()

    asyncio.run(_run())
