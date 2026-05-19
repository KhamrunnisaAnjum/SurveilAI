from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas.auth import OTPRequest, OTPVerify, TokenRefresh, FCMTokenRequest, TokenResponse, UserResponse
from app.utils.otp import generate_otp, store_otp, verify_otp, check_rate_limit, store_refresh_token, invalidate_refresh_token
from app.utils.jwt import create_access_token, create_refresh_token, decode_token
from app.services.auth_service import send_otp_sms
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp(data: OTPRequest, db: AsyncSession = Depends(get_db)):
    if not check_rate_limit(data.mobile_number):
        raise HTTPException(status_code=429, detail="Too many OTP requests. Please wait.")

    otp = generate_otp()
    store_otp(data.mobile_number, otp)
    await send_otp_sms(data.mobile_number, otp)
    return {"message": "OTP sent successfully"}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    if not verify_otp(data.mobile_number, data.otp):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    result = await db.execute(select(User).where(User.mobile_number == data.mobile_number))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please contact admin.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token_data = {"sub": str(user.id), "role": user.role, "district_id": str(user.district_id) if user.district_id else None}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    store_refresh_token(decode_token(refresh_token)["jti"], str(user.id))

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: TokenRefresh):
    try:
        payload = decode_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_data = {"sub": payload["sub"], "role": payload["role"], "district_id": payload.get("district_id")}
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)
    invalidate_refresh_token(payload["jti"])
    store_refresh_token(decode_token(new_refresh)["jti"], payload["sub"])

    return TokenResponse(access_token=new_access, refresh_token=new_refresh)


@router.post("/fcm-token", status_code=status.HTTP_200_OK)
async def save_fcm_token(data: FCMTokenRequest, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = user["sub"]
    db_user = await db.get(User, user_id)
    if db_user:
        db_user.fcm_token = data.fcm_token
        await db.commit()
    return {"message": "FCM token saved"}


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    db_user = await db.get(User, user["sub"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
