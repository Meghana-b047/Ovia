from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.cycle import CycleLog, SymptomLog
from app.models.social import WaterLog, SleepLog
from app.models.onboarding import OnboardingData
from app.schemas.cycle import (
    CycleLogRequest, CycleLogResponse,
    SymptomLogRequest, SymptomLogResponse,
    CycleStatusResponse,
    WaterLogRequest, WaterLogResponse,
    SleepLogRequest, SleepLogResponse,
)

router = APIRouter(prefix="/cycle", tags=["cycle"])


# ─── Helpers ────────────────────────────────────────────────────────────────

def _compute_cycle_status(last_period: date, cycle_length: int, period_duration: int) -> dict:
    today = date.today()
    days_since = (today - last_period).days
    cycle_day = (days_since % cycle_length) + 1
    phase_start_of_cycle = last_period + timedelta(days=(days_since // cycle_length) * cycle_length)

    ovulation_day = cycle_length - 14
    fertile_start = ovulation_day - 3
    fertile_end = ovulation_day + 1

    if cycle_day <= period_duration:
        phase = "Menstruation"
    elif cycle_day <= 13:
        phase = "Follicular"
    elif cycle_day <= ovulation_day + 1:
        phase = "Ovulation"
    else:
        phase = "Luteal"

    next_period = phase_start_of_cycle + timedelta(days=cycle_length)
    ovulation_date = phase_start_of_cycle + timedelta(days=ovulation_day - 1)
    fw_start = phase_start_of_cycle + timedelta(days=fertile_start - 1)
    fw_end = phase_start_of_cycle + timedelta(days=fertile_end - 1)

    return {
        "cycle_day": cycle_day,
        "cycle_total": cycle_length,
        "phase": phase,
        "next_period_date": str(next_period),
        "fertile_window_start": str(fw_start),
        "fertile_window_end": str(fw_end),
        "ovulation_date": str(ovulation_date),
    }


# ─── Cycle Status ────────────────────────────────────────────────────────────

@router.get("/status", response_model=CycleStatusResponse)
def get_cycle_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    onboarding = db.query(OnboardingData).filter(OnboardingData.user_id == current_user.id).first()
    cycle_length = onboarding.cycle_length_days if onboarding else 28
    period_duration = onboarding.period_duration_days if onboarding else 5

    last_log = (
        db.query(CycleLog)
        .filter(CycleLog.user_id == current_user.id)
        .order_by(CycleLog.start_date.desc())
        .first()
    )

    if last_log:
        last_period = last_log.start_date
    else:
        # Default: assume period started 14 days ago
        last_period = date.today() - timedelta(days=14)

    status = _compute_cycle_status(last_period, cycle_length, period_duration)
    return CycleStatusResponse(**status)


# ─── Cycle Logs ──────────────────────────────────────────────────────────────

@router.post("/log", response_model=CycleLogResponse, status_code=201)
def log_period(
    payload: CycleLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = CycleLog(user_id=current_user.id, **payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/log", response_model=List[CycleLogResponse])
def get_cycle_logs(
    limit: int = 12,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(CycleLog)
        .filter(CycleLog.user_id == current_user.id)
        .order_by(CycleLog.start_date.desc())
        .limit(limit)
        .all()
    )


@router.delete("/log/{log_id}", status_code=204)
def delete_cycle_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.query(CycleLog).filter(CycleLog.id == log_id, CycleLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()


# ─── Symptom Logs ────────────────────────────────────────────────────────────

@router.post("/symptoms", response_model=SymptomLogResponse, status_code=201)
def log_symptoms(
    payload: SymptomLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Upsert by date
    existing = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == current_user.id, SymptomLog.log_date == payload.log_date)
        .first()
    )
    if existing:
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    log = SymptomLog(user_id=current_user.id, **payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/symptoms", response_model=List[SymptomLogResponse])
def get_symptoms(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(SymptomLog).filter(SymptomLog.user_id == current_user.id)
    if start_date:
        q = q.filter(SymptomLog.log_date >= start_date)
    if end_date:
        q = q.filter(SymptomLog.log_date <= end_date)
    return q.order_by(SymptomLog.log_date.desc()).all()


@router.get("/symptoms/{log_date}", response_model=SymptomLogResponse)
def get_symptom_by_date(
    log_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == current_user.id, SymptomLog.log_date == log_date)
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="No symptom log for this date")
    return log


# ─── Water Tracking ──────────────────────────────────────────────────────────

@router.post("/water", response_model=WaterLogResponse)
def log_water(
    payload: WaterLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(WaterLog).filter(WaterLog.user_id == current_user.id, WaterLog.log_date == payload.log_date).first()
    if existing:
        existing.glasses = payload.glasses
    else:
        existing = WaterLog(user_id=current_user.id, log_date=payload.log_date, glasses=payload.glasses)
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


@router.get("/water", response_model=List[WaterLogResponse])
def get_water_logs(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(WaterLog)
        .filter(WaterLog.user_id == current_user.id)
        .order_by(WaterLog.log_date.desc())
        .limit(limit)
        .all()
    )


# ─── Sleep Tracking ──────────────────────────────────────────────────────────

@router.post("/sleep", response_model=SleepLogResponse)
def log_sleep(
    payload: SleepLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(SleepLog).filter(SleepLog.user_id == current_user.id, SleepLog.log_date == payload.log_date).first()
    if existing:
        existing.hours = payload.hours
        existing.minutes = payload.minutes
    else:
        existing = SleepLog(user_id=current_user.id, **payload.dict())
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


@router.get("/sleep", response_model=List[SleepLogResponse])
def get_sleep_logs(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(SleepLog)
        .filter(SleepLog.user_id == current_user.id)
        .order_by(SleepLog.log_date.desc())
        .limit(limit)
        .all()
    )
