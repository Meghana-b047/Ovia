
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileResponse, 
    UpdateProfileRequest
)
from app.services import auth_service
from app.core.security import decode_token, create_access_token, create_refresh_token
from fastapi import HTTPException

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email + password.
    Returns JWT tokens immediately so the user can proceed to onboarding.
    """
    return await auth_service.register_user(data, db)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Login with email + password.
    Returns access + refresh tokens, plus onboarding_complete flag
    so the app knows where to redirect.
    """
    return await auth_service.login_user(data, db)


@router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate via Google.
    Send the ID token from Expo Google Sign-In — backend verifies it
    and finds or creates the user.
    """
    return await auth_service.google_auth(data.id_token, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Swap a valid refresh token for a new access + refresh token pair."""
    return await auth_service.refresh_access_token(data.refresh_token, db)


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile."""
    return current_user

@router.patch("/me", response_model=UserProfileResponse)
def update_me(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.age is not None:
        current_user.age = payload.age
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=204)
def delete_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()