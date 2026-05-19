from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "surveil",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.risk_tasks", "app.tasks.alert_tasks", "app.tasks.sync_tasks", "app.tasks.cleanup_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    beat_schedule={
        "recalculate-risk-scores": {
            "task": "app.tasks.risk_tasks.recalculate_all_risk_scores",
            "schedule": 300.0,
        },
        "send-high-risk-alerts": {
            "task": "app.tasks.alert_tasks.send_high_risk_alerts",
            "schedule": 600.0,
        },
        "sync-offline-reports": {
            "task": "app.tasks.sync_tasks.sync_offline_reports",
            "schedule": 60.0,
        },
        "generate-daily-summary": {
            "task": "app.tasks.alert_tasks.generate_daily_summary",
            "schedule": crontab(hour=6, minute=0),
        },
        "cleanup-expired-otps": {
            "task": "app.tasks.cleanup_tasks.cleanup_expired_otps",
            "schedule": 1800.0,
        },
    },
)
