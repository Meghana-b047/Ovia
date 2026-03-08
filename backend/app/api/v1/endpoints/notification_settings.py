from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification_settings import NotificationSettingsUpdate, NotificationSettingsResponse
from app.services.notification_settings_service import get_or_create_settings, update_settings

router = APIRouter(prefix="/notification-settings", tags=["Notification Settings"])


@router.get("", response_model=NotificationSettingsResponse)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_or_create_settings(current_user, db)


@router.patch("", response_model=NotificationSettingsResponse)
def patch_settings(
    payload: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_settings(payload, current_user, db)