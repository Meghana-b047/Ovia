from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse
from app.services.reminder_service import get_reminders, create_reminder, update_reminder, delete_reminder

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.get("", response_model=List[ReminderResponse])
def list_reminders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_reminders(current_user, db)


@router.post("", response_model=ReminderResponse, status_code=201)
def add_reminder(
    payload: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_reminder(payload, current_user, db)


@router.patch("/{reminder_id}", response_model=ReminderResponse)
def edit_reminder(
    reminder_id: int,
    payload: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_reminder(reminder_id, payload, current_user, db)


@router.delete("/{reminder_id}", status_code=204)
def remove_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_reminder(reminder_id, current_user, db)