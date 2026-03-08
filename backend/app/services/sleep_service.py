from typing import List
from sqlalchemy.orm import Session
from app.models.sleep_log import SleepLog
from app.models.user import User
from app.schemas.sleep_log import SleepLogRequest


def upsert_sleep_log(payload: SleepLogRequest, user: User, db: Session) -> SleepLog:
    existing = (
        db.query(SleepLog)
        .filter(SleepLog.user_id == user.id, SleepLog.log_date == payload.log_date)
        .first()
    )
    if existing:
        existing.hours = payload.hours
        existing.minutes = payload.minutes
    else:
        existing = SleepLog(user_id=user.id, **payload.dict())
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


def get_sleep_logs(user: User, db: Session, limit: int = 30) -> List[SleepLog]:
    return (
        db.query(SleepLog)
        .filter(SleepLog.user_id == user.id)
        .order_by(SleepLog.log_date.desc())
        .limit(limit)
        .all()
    )