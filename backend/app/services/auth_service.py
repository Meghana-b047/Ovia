from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse


def _build_token_response(user: User) -> TokenResponse:
    payload = {"sub": str(user.id), "email": user.email}
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
        onboarding_complete=user.onboarding_complete,
    )


async def register_user(data: RegisterRequest, db: AsyncSession) -> TokenResponse:
    # Check duplicate email
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        age=data.age,
        hashed_password=hash_password(data.password),
        auth_provider="email",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _build_token_response(user)


async def login_user(data: LoginRequest, db: AsyncSession) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == data.email))
    user: Optional[User] = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    return _build_token_response(user)


async def google_auth(id_token_str: str, db: AsyncSession) -> TokenResponse:
    """
    Verify Google ID token from the mobile client (Expo Google Sign-In),
    then find-or-create the user.
    """
    try:
        google_info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )

    google_id = google_info["sub"]
    email = google_info.get("email", "")
    full_name = google_info.get("name", "Ovia User")

    # Try find by google_id first, then by email
    result = await db.execute(select(User).where(User.google_id == google_id))
    user: Optional[User] = result.scalar_one_or_none()

    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    if user:
        # Merge google_id if missing
        if not user.google_id:
            user.google_id = google_id
            user.auth_provider = "google"
            await db.commit()
            await db.refresh(user)
    else:
        # Create new user via Google
        user = User(
            full_name=full_name,
            email=email,
            google_id=google_id,
            auth_provider="google",
            is_verified=True,   # Google accounts are pre-verified
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return _build_token_response(user)


async def refresh_access_token(refresh_token: str, db: AsyncSession) -> TokenResponse:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    result = await db.execute(select(User).where(User.id == int(payload["sub"])))
    user: Optional[User] = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return _build_token_response(user)
