from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
import time

from app.config import get_settings
from app.database import engine, Base
from app.middleware.logging import logging_middleware, exception_handler
from app.middleware.rate_limit import setup_rate_limiting
from app.websocket import manager
from app.routers import (
    auth_router, community_router, clinical_router,
    facilities_router, alerts_router, admin_router, tips_router,
)

settings = get_settings()
logger = structlog.get_logger()

app = FastAPI(title="Surveil API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.VITE_FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_rate_limiting(app)
app.middleware("http")(logging_middleware)
app.add_exception_handler(Exception, exception_handler)

app.include_router(auth_router)
app.include_router(community_router)
app.include_router(clinical_router)
app.include_router(facilities_router)
app.include_router(alerts_router)
app.include_router(admin_router)
app.include_router(tips_router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await manager.start_redis_listener()
    import asyncio
    asyncio.create_task(manager.send_heartbeat())
    logger.info("Surveil API started")


@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
    logger.info("Surveil API shutdown")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "db": "connected",
        "redis": "connected" if manager.redis_available else "unavailable (dev mode)",
        "celery": "unavailable (dev mode)",
        "version": "1.0.0",
    }
