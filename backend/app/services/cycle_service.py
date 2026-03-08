import json
from datetime import date, timedelta
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.cycle import CycleLog
from app.models.onboarding import OnboardingProfile
from app.schemas.cycle_log import (
    CycleLogRequest,
    CycleLogUpdate,
    CycleLogResponse,
    CyclePhaseResponse,
)



# ── Cycle syncing tips (from research doc) ────────────────────────────────────

PHASE_TIPS = {
    "menstrual": {
        "exercise": "Low impact movement today — yoga, gentle stretching, or a slow walk 🧘",
        "nutrition": "Focus on iron-rich foods like spinach and beans paired with Vitamin C for absorption 🥬",
    },
    "follicular": {
        "exercise": "Great time for moderate cardio — try jogging, hiking, or biking 🚴",
        "nutrition": "Lean proteins, healthy fats, and complex carbs will fuel your rising energy 🥑",
    },
    "ovulatory": {
        "exercise": "Peak energy! Perfect for HIIT, strength training, or spinning 💪",
        "nutrition": "Load up on antioxidant-rich foods — berries, leafy greens, and citrus 🫐",
    },
    "luteal": {
        "exercise": "Ease back to walking or yoga; avoid over-reaching as progesterone rises 🌿",
        "nutrition": "Complex carbs like sweet potatoes help mood swings; increase protein slightly 🍠",
    },
    "unknown": {
        "exercise": "Log your cycle to get personalized exercise tips 📅",
        "nutrition": "Log your cycle to get personalized nutrition tips 🥗",
    },
}


# ── Prediction engine ─────────────────────────────────────────────────────────

class CyclePredictionEngine:
    """
    Simple moving-average predictor.
    Uses the last 3 cycles for average length, falling back to
    onboarding data or a 28-day default if history is thin.
    """

    @staticmethod
    def predict(
        logs: List[CycleLog],
        default_cycle_length: int = 28,
        default_period_duration: int = 5,
    ) -> dict:
        if not logs:
            return {"next_period": None, "ovulation": None, "cycle_length": default_cycle_length}

        # Compute actual cycle lengths from history (need ≥2 logs)
        cycle_lengths = []
        sorted_logs = sorted(logs, key=lambda l: l.period_start_date)
        for i in range(1, len(sorted_logs)):
            delta = (sorted_logs[i].period_start_date - sorted_logs[i - 1].period_start_date).days
            if 18 <= delta <= 60:   # sanity bounds
                cycle_lengths.append(delta)

        avg_length = (
            round(sum(cycle_lengths[-3:]) / len(cycle_lengths[-3:]))
            if cycle_lengths
            else default_cycle_length
        )

        latest = sorted_logs[-1]
        next_period = latest.period_start_date + timedelta(days=avg_length)
        # Ovulation ≈ 14 days before next period
        ovulation = next_period - timedelta(days=14)

        return {
            "next_period": next_period,
            "ovulation": ovulation,
            "cycle_length": avg_length,
        }

    @staticmethod
    def current_phase(
        last_start: date,
        cycle_length: int,
        period_duration: int,
    ) -> tuple[str, int]:
        today = date.today()
        day_of_cycle = (today - last_start).days + 1

        if day_of_cycle < 1:
            return "unknown", 0
        elif day_of_cycle <= period_duration:
            return "menstrual", day_of_cycle
        elif day_of_cycle <= 13:
            return "follicular", day_of_cycle
        elif day_of_cycle <= 16:
            return "ovulatory", day_of_cycle
        elif day_of_cycle <= cycle_length:
            return "luteal", day_of_cycle
        else:
            # Overdue — next period expected
            return "luteal", day_of_cycle


# ── Service functions ─────────────────────────────────────────────────────────

async def log_cycle(
    user: User, data: CycleLogRequest, db: AsyncSession
) -> CycleLogResponse:
    # Fetch onboarding defaults for prediction fallback
    ob_result = await db.execute(
        select(OnboardingProfile).where(OnboardingProfile.user_id == user.id)
    )
    onboarding = ob_result.scalar_one_or_none()

    # Fetch previous logs for prediction
    logs_result = await db.execute(
        select(CycleLog)
        .where(CycleLog.user_id == user.id)
        .order_by(CycleLog.period_start_date)
    )
    existing_logs = logs_result.scalars().all()

    default_cycle = onboarding.cycle_length_days if onboarding else 28
    default_duration = onboarding.period_duration_days if onboarding else 5

    predictions = CyclePredictionEngine.predict(
        list(existing_logs),
        default_cycle_length=default_cycle,
        default_period_duration=default_duration,
    )

    symptoms_json = json.dumps(data.symptoms) if data.symptoms else None

    log = CycleLog(
        user_id=user.id,
        period_start_date=data.period_start_date,
        period_end_date=data.period_end_date,
        flow_intensity=data.flow_intensity,
        symptoms=symptoms_json,
        mood=data.mood,
        notes=data.notes,
        predicted_next_period=predictions["next_period"],
        predicted_ovulation_date=predictions["ovulation"],
        cycle_length_days=predictions["cycle_length"],
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return _to_response(log)


async def update_cycle_log(
    user: User, log_id: int, data: CycleLogUpdate, db: AsyncSession
) -> CycleLogResponse:
    result = await db.execute(
        select(CycleLog).where(CycleLog.id == log_id, CycleLog.user_id == user.id)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cycle log not found")

    if data.period_end_date is not None:
        log.period_end_date = data.period_end_date
    if data.flow_intensity is not None:
        log.flow_intensity = data.flow_intensity
    if data.symptoms is not None:
        log.symptoms = json.dumps(data.symptoms)
    if data.mood is not None:
        log.mood = data.mood
    if data.notes is not None:
        log.notes = data.notes

    await db.commit()
    await db.refresh(log)
    return _to_response(log)


async def get_cycle_history(
    user: User, db: AsyncSession, limit: int = 12
) -> List[CycleLogResponse]:
    result = await db.execute(
        select(CycleLog)
        .where(CycleLog.user_id == user.id)
        .order_by(desc(CycleLog.period_start_date))
        .limit(limit)
    )
    logs = result.scalars().all()
    return [_to_response(log) for log in logs]


async def get_current_phase(user: User, db: AsyncSession) -> CyclePhaseResponse:
    # Get onboarding profile
    ob_result = await db.execute(
        select(OnboardingProfile).where(OnboardingProfile.user_id == user.id)
    )
    onboarding = ob_result.scalar_one_or_none()

    # Get last cycle log
    logs_result = await db.execute(
        select(CycleLog)
        .where(CycleLog.user_id == user.id)
        .order_by(desc(CycleLog.period_start_date))
        .limit(1)
    )
    latest_log = logs_result.scalar_one_or_none()

    default_cycle = onboarding.cycle_length_days if onboarding else 28
    default_duration = onboarding.period_duration_days if onboarding else 5

    if not latest_log and onboarding and onboarding.last_period_date:
        # Use onboarding data as a seed
        last_start = onboarding.last_period_date
        next_period = last_start + timedelta(days=default_cycle)
        ovulation = next_period - timedelta(days=14)
    elif latest_log:
        last_start = latest_log.period_start_date
        next_period = latest_log.predicted_next_period
        ovulation = latest_log.predicted_ovulation_date
    else:
        return CyclePhaseResponse(
            phase="unknown",
            day_of_cycle=None,
            days_until_next_period=None,
            predicted_next_period=None,
            predicted_ovulation_date=None,
            exercise_tip=PHASE_TIPS["unknown"]["exercise"],
            nutrition_tip=PHASE_TIPS["unknown"]["nutrition"],
        )

    phase, day = CyclePredictionEngine.current_phase(last_start, default_cycle, default_duration)
    days_until = (next_period - date.today()).days if next_period else None

    tips = PHASE_TIPS.get(phase, PHASE_TIPS["unknown"])
    return CyclePhaseResponse(
        phase=phase,
        day_of_cycle=day,
        days_until_next_period=days_until,
        predicted_next_period=next_period,
        predicted_ovulation_date=ovulation,
        exercise_tip=tips["exercise"],
        nutrition_tip=tips["nutrition"],
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_response(log: CycleLog) -> CycleLogResponse:
    symptoms = json.loads(log.symptoms) if log.symptoms else None
    return CycleLogResponse(
        id=log.id,
        user_id=log.user_id,
        period_start_date=log.period_start_date,
        period_end_date=log.period_end_date,
        flow_intensity=log.flow_intensity,
        symptoms=symptoms,
        mood=log.mood,
        notes=log.notes,
        predicted_next_period=log.predicted_next_period,
        predicted_ovulation_date=log.predicted_ovulation_date,
        cycle_length_days=log.cycle_length_days,
    )

def _compute_cycle_status(last_period: date, cycle_length: int, period_duration: int) -> dict:
    today = date.today()
    days_since = (today - last_period).days
    cycle_day = (days_since % cycle_length) + 1
    cycle_start = last_period + timedelta(days=(days_since // cycle_length) * cycle_length)

    ovulation_day_num = cycle_length - 14
    fertile_start_num = ovulation_day_num - 3
    fertile_end_num = ovulation_day_num + 1

    if cycle_day <= period_duration:
        phase = "Menstruation"
    elif cycle_day <= 13:
        phase = "Follicular"
    elif cycle_day <= ovulation_day_num + 1:
        phase = "Ovulation"
    else:
        phase = "Luteal"

    return {
        "cycle_day": cycle_day,
        "cycle_total": cycle_length,
        "phase": phase,
        "next_period_date": str(cycle_start + timedelta(days=cycle_length)),
        "fertile_window_start": str(cycle_start + timedelta(days=fertile_start_num - 1)),
        "fertile_window_end": str(cycle_start + timedelta(days=fertile_end_num - 1)),
        "ovulation_date": str(cycle_start + timedelta(days=ovulation_day_num - 1)),
    }

def get_cycle_status(user: User, db: Session) -> CyclePhaseResponse:
    onboarding = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user.id).first()
    cycle_length = onboarding.cycle_length_days if onboarding else 28
    period_duration = onboarding.period_duration_days if onboarding else 5

    last_log = (
        db.query(CycleLog)
        .filter(CycleLog.user_id == user.id)
        .order_by(CycleLog.start_date.desc())
        .first()
    )
    last_period = last_log.start_date if last_log else date.today() - timedelta(days=14)

    return CyclePhaseResponse(**_compute_cycle_status(last_period, cycle_length, period_duration))

def create_cycle_log(payload: CycleLogRequest, user: User, db: Session) -> CycleLog:
    log = CycleLog(user_id=user.id, **payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def _compute_cycle_status(last_period: date, cycle_length: int, period_duration: int) -> dict:
    today = date.today()
    days_since = (today - last_period).days
    cycle_day = (days_since % cycle_length) + 1
    cycle_start = last_period + timedelta(days=(days_since // cycle_length) * cycle_length)

    ovulation_day_num = cycle_length - 14
    fertile_start_num = ovulation_day_num - 3
    fertile_end_num = ovulation_day_num + 1

    if cycle_day <= period_duration:
        phase = "Menstruation"
    elif cycle_day <= 13:
        phase = "Follicular"
    elif cycle_day <= ovulation_day_num + 1:
        phase = "Ovulation"
    else:
        phase = "Luteal"

    return {
        "cycle_day": cycle_day,
        "cycle_total": cycle_length,
        "phase": phase,
        "next_period_date": str(cycle_start + timedelta(days=cycle_length)),
        "fertile_window_start": str(cycle_start + timedelta(days=fertile_start_num - 1)),
        "fertile_window_end": str(cycle_start + timedelta(days=fertile_end_num - 1)),
        "ovulation_date": str(cycle_start + timedelta(days=ovulation_day_num - 1)),
    }




def create_cycle_log(payload: CycleLogRequest, user: User, db: Session) -> CycleLog:
    log = CycleLog(user_id=user.id, **payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_cycle_logs(user: User, db: Session, limit: int = 12) -> List[CycleLog]:
    return (
        db.query(CycleLog)
        .filter(CycleLog.user_id == user.id)
        .order_by(CycleLog.start_date.desc())
        .limit(limit)
        .all()
    )


def delete_cycle_log(log_id: int, user: User, db: Session) -> None:
    log = db.query(CycleLog).filter(CycleLog.id == log_id, CycleLog.user_id == user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Cycle log not found")
    db.delete(log)
    db.commit()
