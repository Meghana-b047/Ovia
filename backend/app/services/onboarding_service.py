from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.onboarding import OnboardingProfile
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse


def _resolve_last_period_date(option: str) -> date:
    """Convert the user's selected option into an actual calendar date."""
    today = date.today()
    mapping = {
        "Today": today,
        "Yesterday": today - timedelta(days=1),
        "2 days ago": today - timedelta(days=2),
        "3+ days ago": today - timedelta(days=3),
    }
    return mapping.get(option, today - timedelta(days=1))


async def save_onboarding(
    user: User,
    data: OnboardingRequest,
    db: AsyncSession,
) -> OnboardingResponse:
    # Prevent duplicate submissions — update if already exists
    result = await db.execute(
        select(OnboardingProfile).where(OnboardingProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    last_period_date = _resolve_last_period_date(data.last_period_option)

    if profile:
        # Update existing
        profile.cycle_length_option = data.cycle_length_option
        profile.cycle_length_days = data.cycle_length_days
        profile.period_duration_option = data.period_duration_option
        profile.period_duration_days = data.period_duration_days
        profile.last_period_option = data.last_period_option
        profile.last_period_date = last_period_date
        profile.goal = data.goal
    else:
        profile = OnboardingProfile(
            user_id=user.id,
            cycle_length_option=data.cycle_length_option,
            cycle_length_days=data.cycle_length_days,
            period_duration_option=data.period_duration_option,
            period_duration_days=data.period_duration_days,
            last_period_option=data.last_period_option,
            last_period_date=last_period_date,
            goal=data.goal,
        )
        db.add(profile)

    # Mark onboarding complete on the user record
    user.onboarding_complete = True
    await db.commit()
    await db.refresh(profile)

    return OnboardingResponse.model_validate(profile)


async def get_onboarding(user: User, db: AsyncSession) -> OnboardingResponse:
    result = await db.execute(
        select(OnboardingProfile).where(OnboardingProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding profile not found",
        )
    return OnboardingResponse.model_validate(profile)
