from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse
from app.services import onboarding_service

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.post("", response_model=OnboardingResponse, status_code=201)
async def submit_onboarding(
    data: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Save the user's onboarding answers (all 4 steps from OnboardingScreen.js).
    Also sets onboarding_complete = True on the user record.
    Safe to call multiple times — will update if already submitted.
    """
    return await onboarding_service.save_onboarding(current_user, data, db)


@router.get("", response_model=OnboardingResponse)
async def get_onboarding(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the current user's onboarding profile."""
    return await onboarding_service.get_onboarding(current_user, db)
