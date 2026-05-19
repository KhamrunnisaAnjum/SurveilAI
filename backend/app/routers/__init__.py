from app.routers.auth import router as auth_router
from app.routers.community import router as community_router
from app.routers.clinical import router as clinical_router
from app.routers.facilities import router as facilities_router
from app.routers.alerts import router as alerts_router
from app.routers.admin import router as admin_router
from app.routers.tips import router as tips_router

__all__ = [
    "auth_router",
    "community_router",
    "clinical_router",
    "facilities_router",
    "alerts_router",
    "admin_router",
    "tips_router",
]
