from twilio.rest import Client
from app.config import get_settings

settings = get_settings()


async def send_otp_sms(mobile_number: str, otp: str) -> bool:
    if settings.DEV_OTP_BYPASS:
        return True
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"Your Surveil OTP is: {otp}. Valid for 5 minutes.",
            from_=settings.TWILIO_FROM_NUMBER,
            to=mobile_number,
        )
        return True
    except Exception:
        return False
