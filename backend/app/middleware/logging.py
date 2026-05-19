from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import structlog
import uuid
import time

logger = structlog.get_logger()


async def logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    response = await call_next(request)

    latency = (time.time() - start_time) * 1000
    logger.info(
        "request_completed",
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        latency_ms=round(latency, 2),
    )

    response.headers["X-Request-ID"] = request_id
    return response


async def exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.error("unhandled_exception", request_id=request_id, error=str(exc))

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "request_id": request_id,
        },
    )
