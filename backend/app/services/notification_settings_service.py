from sqlalchemy.orm import Session
from app.models.notification_settings import NotificationSettings
from app.models.user import User
from app.schemas.notification_settings import NotificationSettingsUpdate


def get_or_create_settings(user: User, db: Session) -> NotificationSettings:
    settings = db.query(NotificationSettings).filter(NotificationSettings.user_id == user.id).first()
    if not settings:
        settings = NotificationSettings(user_id=user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(payload: NotificationSettingsUpdate, user: User, db: Session) -> NotificationSettings:
    settings = get_or_create_settings(user, db)
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(settings, k, v)
    db.commit()
    db.refresh(settings)
    return settings