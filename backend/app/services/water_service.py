from typing import List
from sqlalchemy.orm import Session
from app.models.water_log import WaterLog
from app.models.user import User
from app.schemas.water_log import WaterLogRequest


def upsert_water_log(payload: WaterLogRequest, user: User, db: Session) -> WaterLog:
    existing = (
        db.query(WaterLog)
        .filter(WaterLog.user_id == user.id, WaterLog.log_date == payload.log_date)
        .first()
    )
    if existing:
        existing.glasses = payload.glasses
    else:
        existing = WaterLog(user_id=user.id, log_date=payload.log_date, glasses=payload.glasses)
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


def get_water_logs(user: User, db: Session, limit: int = 30) -> List[WaterLog]:
    return (
        db.query(WaterLog)
        .filter(WaterLog.user_id == user.id)
        .order_by(WaterLog.log_date.desc())
        .limit(limit)
        .all()
    )