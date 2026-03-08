import json
from datetime import date, timedelta
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.cycle import CycleLog
from app.models.onboarding import OnboardingProfile
from app.schemas.cycle_log import (
    CycleLogRequest,
    CycleLogUpdate,
    CycleLogResponse,
    CyclePhaseResponse,
)

PHASE_TIPS = {
    "menstrual":  {"exercise": "Low impact movement today — yoga, gentle stretching, or a slow walk 🧘", "nutrition": "Focus on iron-rich foods like spinach and beans paired with Vitamin C 🥬"},
    "follicular": {"exercise": "Great time for moderate cardio — try jogging, hiking, or biking 🚴",     "nutrition": "Lean proteins, healthy fats, and complex carbs will fuel your rising energy 🥑"},
    "ovulatory":  {"exercise": "Peak energy! Perfect for HIIT, strength training, or spinning 💪",       "nutrition": "Load up on antioxidant-rich foods — berries, leafy greens, and citrus 🫐"},
    "luteal":     {"exercise": "Ease back to walking or yoga; avoid over-reaching as progesterone rises 🌿", "nutrition": "Complex carbs like sweet potatoes help mood swings; increase protein slightly 🍠"},
    "unknown":    {"exercise": "Log your cycle to get personalized exercise tips 📅",                    "nutrition": "Log your cycle to get personalized nutrition tips 🥗"},
}

class CyclePredictionEngine:
    @staticmethod
    def predict(logs, default_cycle_length=28, default_period_duration=5):
        if not logs:
            return {"next_period": None, "ovulation": None, "cycle_length": default_cycle_length}
        sorted_logs = sorted(logs, key=lambda l: l.period_start_date)
        cycle_lengths = []
        for i in range(1, len(sorted_logs)):
            delta = (sorted_logs[i].period_start_date - sorted_logs[i-1].period_start_date).days
            if 18 <= delta <= 60:
                cycle_lengths.append(delta)
        avg_length = round(sum(cycle_lengths[-3:]) / len(cycle_lengths[-3:])) if cycle_lengths else default_cycle_length
        latest = sorted_logs[-1]
        next_period = latest.period_start_date + timedelta(days=avg_length)
        ovulation = next_period - timedelta(days=14)
        return {"next_period": next_period, "ovulation": ovulation, "cycle_length": avg_length}

    @staticmethod
    def current_phase(last_start, cycle_length, period_duration):
        day_of_cycle = (date.today() - last_start).days + 1
        if day_of_cycle < 1:        return "unknown", 0
        elif day_of_cycle <= period_duration: return "menstrual", day_of_cycle
        elif day_of_cycle <= 13:    return "follicular", day_of_cycle
        elif day_of_cycle <= 16:    return "ovulatory", day_of_cycle
        else:                       return "luteal", day_of_cycle

def _symptoms_to_str(symptoms):
    if not symptoms:
        return None
    if isinstance(symptoms, list):
        return json.dumps(symptoms)
    return symptoms

def _to_response(log):
    symptoms = json.loads(log.symptoms) if log.symptoms else []
    return CycleLogResponse(
        id=log.id,
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

def log_cycle(user: User, data: CycleLogRequest, db: Session) -> CycleLogResponse:
    onboarding = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user.id).first()
    existing_logs = db.query(CycleLog).filter(CycleLog.user_id == user.id).order_by(CycleLog.period_start_date).all()
    default_cycle = onboarding.cycle_length_days if onboarding else 28
    default_duration = onboarding.period_duration_days if onboarding else 5
    predictions = CyclePredictionEngine.predict(existing_logs, default_cycle, default_duration)
    log = CycleLog(
        user_id=user.id,
        period_start_date=data.period_start_date,
        period_end_date=data.period_end_date,
        flow_intensity=data.flow_intensity,
        symptoms=_symptoms_to_str(data.symptoms),
        mood=data.mood,
        notes=data.notes,
        predicted_next_period=predictions["next_period"],
        predicted_ovulation_date=predictions["ovulation"],
        cycle_length_days=predictions["cycle_length"],
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return _to_response(log)

def update_cycle_log(user: User, log_id: int, data: CycleLogUpdate, db: Session) -> CycleLogResponse:
    log = db.query(CycleLog).filter(CycleLog.id == log_id, CycleLog.user_id == user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Cycle log not found")
    if data.period_end_date is not None: log.period_end_date = data.period_end_date
    if data.flow_intensity is not None:  log.flow_intensity = data.flow_intensity
    if data.symptoms is not None:        log.symptoms = _symptoms_to_str(data.symptoms)
    if data.mood is not None:            log.mood = data.mood
    if data.notes is not None:           log.notes = data.notes
    db.commit()
    db.refresh(log)
    return _to_response(log)

def get_cycle_history(user: User, db: Session, limit: int = 12) -> List[CycleLogResponse]:
    logs = db.query(CycleLog).filter(CycleLog.user_id == user.id).order_by(CycleLog.period_start_date.desc()).limit(limit).all()
    return [_to_response(log) for log in logs]

def delete_cycle_log(log_id: int, user: User, db: Session) -> None:
    log = db.query(CycleLog).filter(CycleLog.id == log_id, CycleLog.user_id == user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Cycle log not found")
    db.delete(log)
    db.commit()

def get_current_phase(user: User, db: Session) -> CyclePhaseResponse:
    onboarding = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user.id).first()
    latest_log = db.query(CycleLog).filter(CycleLog.user_id == user.id).order_by(CycleLog.period_start_date.desc()).first()
    default_cycle = onboarding.cycle_length_days if onboarding else 28
    default_duration = onboarding.period_duration_days if onboarding else 5
    if not latest_log and onboarding and onboarding.last_period_date:
        last_start = onboarding.last_period_date
        next_period = last_start + timedelta(days=default_cycle)
        ovulation = next_period - timedelta(days=14)
    elif latest_log:
        last_start = latest_log.period_start_date
        next_period = latest_log.predicted_next_period
        ovulation = latest_log.predicted_ovulation_date
    else:
        tips = PHASE_TIPS["unknown"]
        return CyclePhaseResponse(phase="unknown", day_of_cycle=None, days_until_next_period=None, predicted_next_period=None, predicted_ovulation_date=None, exercise_tip=tips["exercise"], nutrition_tip=tips["nutrition"])
    phase, day = CyclePredictionEngine.current_phase(last_start, default_cycle, default_duration)
    days_until = (next_period - date.today()).days if next_period else None
    tips = PHASE_TIPS.get(phase, PHASE_TIPS["unknown"])
    return CyclePhaseResponse(phase=phase, day_of_cycle=day, days_until_next_period=days_until, predicted_next_period=next_period, predicted_ovulation_date=ovulation, exercise_tip=tips["exercise"], nutrition_tip=tips["nutrition"])