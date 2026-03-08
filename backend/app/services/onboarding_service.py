from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.onboarding import OnboardingProfile
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse


def _resolve_last_period_date(option: str) -> date:
    today = date.today()
    mapping = {
        "Today":       today,
        "Yesterday":   today - timedelta(days=1),
        "2 days ago":  today - timedelta(days=2),
        "3+ days ago": today - timedelta(days=3),
    }
    return mapping.get(option, today - timedelta(days=1))


def save_onboarding(user: User, data: OnboardingRequest, db: Session) -> OnboardingResponse:
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user.id).first()

    last_period_date = _resolve_last_period_date(data.last_period_option)

    if profile:
        profile.cycle_length_option   = data.cycle_length_option
        profile.cycle_length_days     = data.cycle_length_days
        profile.period_duration_option = data.period_duration_option
        profile.period_duration_days  = data.period_duration_days
        profile.last_period_option    = data.last_period_option
        profile.last_period_date      = last_period_date
        profile.goal                  = data.goal
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

    user.onboarding_complete = True
    db.commit()
    db.refresh(profile)

    return OnboardingResponse.model_validate(profile)


def get_onboarding(user: User, db: Session) -> OnboardingResponse:
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding profile not found")
    return OnboardingResponse.model_validate(profile)