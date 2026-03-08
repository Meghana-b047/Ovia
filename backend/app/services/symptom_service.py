from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.symptom_log import SymptomLog
from app.models.user import User
from app.schemas.symptom_log import SymptomLogRequest


def upsert_symptom_log(payload: SymptomLogRequest, user: User, db: Session) -> SymptomLog:
    existing = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user.id, SymptomLog.log_date == payload.log_date)
        .first()
    )
    if existing:
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    log = SymptomLog(user_id=user.id, **payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_symptom_logs(user: User, db: Session, start_date: Optional[str], end_date: Optional[str]) -> List[SymptomLog]:
    q = db.query(SymptomLog).filter(SymptomLog.user_id == user.id)
    if start_date:
        q = q.filter(SymptomLog.log_date >= start_date)
    if end_date:
        q = q.filter(SymptomLog.log_date <= end_date)
    return q.order_by(SymptomLog.log_date.desc()).all()


def get_symptom_by_date(log_date: str, user: User, db: Session) -> SymptomLog:
    log = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user.id, SymptomLog.log_date == log_date)
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="No symptom log for this date")
    return log