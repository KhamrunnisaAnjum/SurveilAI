from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Alert, User
from app.services.notification_service import send_fcm_notification
from app.websocket import manager


async def create_alert(db: AsyncSession, alert_data: dict, created_by_id: str) -> Alert:
    alert = Alert(**alert_data, created_by=created_by_id)
    db.add(alert)
    await db.commit()
    await db.refresh(alert)

    await manager.broadcast_to_district(str(alert.district_id), {"type": "alert", "data": _alert_to_dict(alert)})

    nurses = await db.execute(
        select(User).where(User.role.in_(["nurse", "public_health_officer"]), User.district_id == alert.district_id)
    )
    for nurse in nurses.scalars().all():
        if nurse.fcm_token:
            await send_fcm_notification(
                nurse.fcm_token,
                f"New {alert.severity} Alert",
                alert.message,
                {"alert_id": str(alert.id), "type": alert.type},
            )

    return alert


async def acknowledge_alert(db: AsyncSession, alert_id: str, user_id: str) -> Alert | None:
    from datetime import datetime

    alert = await db.get(Alert, alert_id)
    if alert:
        alert.status = "acknowledged"
        alert.acknowledged_by = user_id
        alert.acknowledged_at = datetime.utcnow()
        await db.commit()
        await db.refresh(alert)
    return alert


async def escalate_alert(db: AsyncSession, alert_id: str) -> Alert | None:
    alert = await db.get(Alert, alert_id)
    if alert:
        alert.status = "escalated"
        await db.commit()
        await db.refresh(alert)
    return alert


async def dismiss_alert(db: AsyncSession, alert_id: str) -> Alert | None:
    alert = await db.get(Alert, alert_id)
    if alert:
        alert.status = "dismissed"
        await db.commit()
        await db.refresh(alert)
    return alert


def _alert_to_dict(alert: Alert) -> dict:
    return {
        "id": str(alert.id),
        "type": alert.type,
        "severity": alert.severity,
        "district_id": str(alert.district_id),
        "message": alert.message,
        "created_at": alert.created_at.isoformat(),
        "status": alert.status,
    }
