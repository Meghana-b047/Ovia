from pydantic import BaseModel
from typing import Optional


class NotificationSettingsUpdate(BaseModel):
    secret_chats: Optional[bool] = None
    personal_advice: Optional[bool] = None
    period_soon: Optional[bool] = None
    ovulation: Optional[bool] = None
    period_end: Optional[bool] = None
    period_start: Optional[bool] = None
    contraception: Optional[bool] = None
    lifestyle: Optional[bool] = None
    water_reminder: Optional[bool] = None
    sleep_reminder: Optional[bool] = None
    exercise_reminder: Optional[bool] = None


class NotificationSettingsResponse(BaseModel):
    secret_chats: bool
    personal_advice: bool
    period_soon: bool
    ovulation: bool
    period_end: bool
    period_start: bool
    contraception: bool
    lifestyle: bool
    water_reminder: bool
    sleep_reminder: bool
    exercise_reminder: bool

    class Config:
        from_attributes = True