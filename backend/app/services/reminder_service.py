from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.reminder import Reminder
from app.models.user import User
from app.schemas.reminder import ReminderCreate, ReminderUpdate


def get_reminders(user: User, db: Session) -> List[Reminder]:
    return db.query(Reminder).filter(Reminder.user_id == user.id).order_by(Reminder.id).all()


def create_reminder(payload: ReminderCreate, user: User, db: Session) -> Reminder:
    reminder = Reminder(user_id=user.id, **payload.dict())
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def update_reminder(reminder_id: int, payload: ReminderUpdate, user: User, db: Session) -> Reminder:
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == user.id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(reminder, k, v)
    db.commit()
    db.refresh(reminder)
    return reminder


def delete_reminder(reminder_id: int, user: User, db: Session) -> None:
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == user.id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(reminder)
    db.commit()