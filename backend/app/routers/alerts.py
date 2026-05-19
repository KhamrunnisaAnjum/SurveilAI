from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Alert
from app.schemas.alert import AlertCreate, AlertResponse, AlertListParams
from app.middleware.auth import get_current_user
from app.services.alert_service import create_alert, acknowledge_alert, escalate_alert, dismiss_alert
from app.websocket import manager

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
async def list_alerts(
    district_id: str = Query(None),
    severity: str = Query(None),
    status_filter: str = Query(None, alias="status"),
    skip: int = Query(0),
    limit: int = Query(50),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    query = select(Alert)
    if district_id:
        query = query.where(Alert.district_id == district_id)
    if severity:
        query = query.where(Alert.severity == severity)
    if status_filter:
        query = query.where(Alert.status == status_filter)

    query = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    alerts = result.scalars().all()

    return [
        {
            "id": str(a.id),
            "type": a.type,
            "severity": a.severity,
            "district_id": str(a.district_id),
            "message": a.message,
            "details": a.details,
            "created_by": str(a.created_by),
            "created_at": a.created_at.isoformat(),
            "acknowledged_by": str(a.acknowledged_by) if a.acknowledged_by else None,
            "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
            "status": a.status,
        }
        for a in alerts
    ]


@router.post("", response_model=AlertResponse, status_code=201)
async def create_new_alert(
    data: AlertCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") not in ["public_health_officer", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    alert = await create_alert(db, data.model_dump(), user["sub"])
    return {
        "id": str(alert.id),
        "type": alert.type,
        "severity": alert.severity,
        "district_id": str(alert.district_id),
        "message": alert.message,
        "details": alert.details,
        "created_by": str(alert.created_by),
        "created_at": alert.created_at.isoformat(),
        "acknowledged_by": None,
        "acknowledged_at": None,
        "status": alert.status,
    }


@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    alert = await acknowledge_alert(db, alert_id, user["sub"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "id": str(alert.id),
        "type": alert.type,
        "severity": alert.severity,
        "district_id": str(alert.district_id),
        "message": alert.message,
        "details": alert.details,
        "created_by": str(alert.created_by),
        "created_at": alert.created_at.isoformat(),
        "acknowledged_by": str(alert.acknowledged_by),
        "acknowledged_at": alert.acknowledged_at.isoformat(),
        "status": alert.status,
    }


@router.patch("/{alert_id}/escalate", response_model=AlertResponse)
async def escalate(alert_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    alert = await escalate_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "id": str(alert.id),
        "type": alert.type,
        "severity": alert.severity,
        "district_id": str(alert.district_id),
        "message": alert.message,
        "details": alert.details,
        "created_by": str(alert.created_by),
        "created_at": alert.created_at.isoformat(),
        "acknowledged_by": str(alert.acknowledged_by) if alert.acknowledged_by else None,
        "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
        "status": alert.status,
    }


@router.patch("/{alert_id}/dismiss", response_model=AlertResponse)
async def dismiss(alert_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    alert = await dismiss_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "id": str(alert.id),
        "type": alert.type,
        "severity": alert.severity,
        "district_id": str(alert.district_id),
        "message": alert.message,
        "details": alert.details,
        "created_by": str(alert.created_by),
        "created_at": alert.created_at.isoformat(),
        "acknowledged_by": str(alert.acknowledged_by) if alert.acknowledged_by else None,
        "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
        "status": alert.status,
    }


@router.get("/history", response_model=list[AlertResponse])
async def alert_history(
    district_id: str = Query(None),
    severity: str = Query(None),
    status_filter: str = Query(None, alias="status"),
    skip: int = Query(0),
    limit: int = Query(100),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return await list_alerts(district_id, severity, status_filter, skip, limit, db, user)


@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket, token: str):
    from app.utils.jwt import decode_token
    try:
        payload = decode_token(token)
    except Exception:
        await websocket.close(code=4001)
        return

    district_id = payload.get("district_id")
    if not district_id:
        await websocket.close(code=4002)
        return

    await manager.connect(websocket, district_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, district_id)
