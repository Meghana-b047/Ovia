from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import (
    get_notifications, mark_notification_read, mark_all_read, delete_notification
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notifications(current_user, db, limit)


@router.post("/{notification_id}/read", status_code=200)
def read_one(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mark_notification_read(notification_id, current_user, db)
    return {"ok": True}


@router.post("/read-all", status_code=200)
def read_all(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mark_all_read(current_user, db)
    return {"ok": True}


@router.delete("/{notification_id}", status_code=204)
def remove_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_notification(notification_id, current_user, db)