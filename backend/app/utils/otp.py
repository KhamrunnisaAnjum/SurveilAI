import random
import time
import json
import threading
from app.config import get_settings

settings = get_settings()


class InMemoryStore:
    def __init__(self):
        self._store: dict = {}
        self._lock = threading.Lock()

    def setex(self, key: str, ttl: int, value: str) -> None:
        with self._lock:
            self._store[key] = {"value": value, "expires_at": time.time() + ttl}

    def get(self, key: str) -> str | None:
        with self._lock:
            item = self._store.get(key)
            if item is None:
                return None
            if time.time() > item["expires_at"]:
                del self._store[key]
                return None
            return item["value"]

    def incr(self, key: str) -> int:
        with self._lock:
            item = self._store.get(key)
            if item is None:
                return 0
            if time.time() > item["expires_at"]:
                del self._store[key]
                return 0
            new_val = int(item["value"]) + 1
            item["value"] = str(new_val)
            return new_val

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)


try:
    import redis
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    redis_client.ping()
    _use_redis = True
except Exception:
    redis_client = InMemoryStore()
    _use_redis = False


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


def store_otp(mobile_number: str, otp: str) -> None:
    key = f"otp:{mobile_number}"
    redis_client.setex(key, settings.OTP_EXPIRE_SECONDS, otp)


def verify_otp(mobile_number: str, otp: str) -> bool:
    if settings.DEV_OTP_BYPASS and otp == "123456":
        return True
    key = f"otp:{mobile_number}"
    stored = redis_client.get(key)
    return stored == otp


def check_rate_limit(mobile_number: str) -> bool:
    key = f"rate:otp:{mobile_number}"
    current = redis_client.get(key)
    if current is None:
        redis_client.setex(key, settings.OTP_RATE_LIMIT_WINDOW, 1)
        return True
    if int(current) >= settings.OTP_RATE_LIMIT_MAX:
        return False
    redis_client.incr(key)
    return True


def store_refresh_token(jti: str, user_id: str) -> None:
    key = f"refresh:{jti}"
    redis_client.setex(key, settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, user_id)


def invalidate_refresh_token(jti: str) -> None:
    redis_client.delete(f"refresh:{jti}")


def cache_risk_score(patient_id: str, score: float, shap_values: dict) -> None:
    key = f"risk:{patient_id}"
    redis_client.setex(key, 300, json.dumps({"score": score, "shap_values": shap_values}))


def get_cached_risk_score(patient_id: str) -> dict | None:
    key = f"risk:{patient_id}"
    data = redis_client.get(key)
    return json.loads(data) if data else None
