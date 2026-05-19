from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    CELERY_BROKER_URL: str

    JWT_PRIVATE_KEY: str
    JWT_PUBLIC_KEY: str
    JWT_ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    FIREBASE_SERVICE_ACCOUNT_JSON: str = "{}"

    VITE_FRONTEND_URL: str = "http://localhost:5173"
    DEV_OTP_BYPASS: bool = False

    MODEL_PATH: str = "./models/risk_model.pkl"

    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"

    OTP_EXPIRE_SECONDS: int = 300
    OTP_RATE_LIMIT_WINDOW: int = 900
    OTP_RATE_LIMIT_MAX: int = 3

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
