import firebase_admin
from firebase_admin import credentials, messaging
import json
from app.config import get_settings

settings = get_settings()
_fcm_initialized = False


def init_fcm():
    global _fcm_initialized
    if not _fcm_initialized:
        try:
            cred = credentials.Certificate(json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON))
            firebase_admin.initialize_app(cred)
            _fcm_initialized = True
        except Exception:
            pass


async def send_fcm_notification(token: str, title: str, body: str, data: dict = None) -> bool:
    init_fcm()
    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=token,
        )
        messaging.send(message)
        return True
    except Exception:
        return False


async def send_fcm_to_topic(topic: str, title: str, body: str, data: dict = None) -> bool:
    init_fcm()
    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            topic=topic,
        )
        messaging.send(message)
        return True
    except Exception:
        return False
