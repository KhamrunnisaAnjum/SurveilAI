from celery import shared_task
from app.utils import otp as otp_utils


@shared_task
def cleanup_expired_otps():
    pass
