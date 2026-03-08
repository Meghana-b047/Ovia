from pydantic import BaseModel
from datetime import date


class SleepLogRequest(BaseModel):
    log_date: date   # YYYY-MM-DD
    hours: int
    minutes: int = 0


class SleepLogResponse(BaseModel):
    log_date: date
    hours: int
    minutes: int

    class Config:
        from_attributes = True