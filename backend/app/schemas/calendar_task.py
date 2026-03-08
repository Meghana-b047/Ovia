from pydantic import BaseModel
from typing import Optional


class CalendarTaskCreate(BaseModel):
    task_date: str   # YYYY-MM-DD
    icon: str = "📋"
    title: str


class CalendarTaskUpdate(BaseModel):
    done: Optional[bool] = None
    title: Optional[str] = None
    icon: Optional[str] = None


class CalendarTaskResponse(BaseModel):
    id: int
    task_date: str
    icon: str
    title: str
    done: bool

    class Config:
        from_attributes = True