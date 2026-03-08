from pydantic import BaseModel


class SleepLogRequest(BaseModel):
    log_date: str   # YYYY-MM-DD
    hours: int
    minutes: int = 0


class SleepLogResponse(BaseModel):
    log_date: str
    hours: int
    minutes: int

    class Config:
        from_attributes = True