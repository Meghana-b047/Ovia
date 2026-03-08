from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.notification import Notification
from app.models.user import User


def get_notifications(user: User, db: Session, limit: int = 50) -> List[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def mark_notification_read(notification_id: int, user: User, db: Session) -> None:
    notif = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()


def mark_all_read(user: User, db: Session) -> None:
    db.query(Notification).filter(
        Notification.user_id == user.id, Notification.read == False
    ).update({"read": True})
    db.commit()


def delete_notification(notification_id: int, user: User, db: Session) -> None:
    notif = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()