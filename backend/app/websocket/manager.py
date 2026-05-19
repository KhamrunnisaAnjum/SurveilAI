from typing import Dict, Set
from fastapi import WebSocket
import asyncio
import json
from app.config import get_settings
import structlog

logger = structlog.get_logger()
settings = get_settings()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.redis = None
        self.redis_available = False

    async def connect(self, websocket: WebSocket, district_id: str):
        await websocket.accept()
        if district_id not in self.active_connections:
            self.active_connections[district_id] = set()
        self.active_connections[district_id].add(websocket)

    def disconnect(self, websocket: WebSocket, district_id: str):
        if district_id in self.active_connections:
            self.active_connections[district_id].discard(websocket)
            if not self.active_connections[district_id]:
                del self.active_connections[district_id]

    async def broadcast_to_district(self, district_id: str, message: dict):
        if district_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[district_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            for conn in disconnected:
                self.disconnect(conn, district_id)

    async def start_redis_listener(self):
        try:
            import redis.asyncio as aioredis
            self.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await self.redis.ping()
            self.redis_available = True
            pubsub = self.redis.pubsub()
            await pubsub.psubscribe("alerts:*")
            asyncio.create_task(self._listen(pubsub))
            logger.info("Redis pub/sub connected for WebSocket alerts")
        except Exception:
            self.redis_available = False
            logger.warning("Redis not available, WebSocket alerts will use direct broadcast only")

    async def _listen(self, pubsub):
        while True:
            try:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "pmessage":
                    channel = message["channel"]
                    district_id = channel.split(":")[1]
                    data = json.loads(message["data"])
                    await self.broadcast_to_district(district_id, data)
            except Exception:
                await asyncio.sleep(1)

    async def publish_alert(self, district_id: str, data: dict):
        await self.broadcast_to_district(district_id, data)
        if self.redis_available and self.redis:
            try:
                await self.redis.publish(f"alerts:{district_id}", json.dumps(data))
            except Exception:
                pass

    async def send_heartbeat(self):
        while True:
            await asyncio.sleep(30)
            for district_id in list(self.active_connections.keys()):
                for conn in list(self.active_connections.get(district_id, set())):
                    try:
                        await conn.send_json({"type": "ping"})
                    except Exception:
                        self.disconnect(conn, district_id)


manager = ConnectionManager()
