from pydantic import BaseModel
from typing import Optional


class ReminderCreate(BaseModel):
    icon: str = "💊"
    title: str
    time: str
    color: str = "#FFB3C6"
    repeat: str = "Once"


class ReminderUpdate(BaseModel):
    icon: Optional[str] = None
    title: Optional[str] = None
    time: Optional[str] = None
    color: Optional[str] = None
    repeat: Optional[str] = None
    is_active: Optional[bool] = None


class ReminderResponse(BaseModel):
    id: int
    icon: str
    title: str
    time: str
    color: str
    repeat: str
    is_active: bool

    class Config:
        from_attributes = True