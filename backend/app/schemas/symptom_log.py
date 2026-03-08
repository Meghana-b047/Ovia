from pydantic import BaseModel
from typing import Optional
from datetime import date


class SymptomLogRequest(BaseModel):
    log_date: date
    mood: Optional[str] = None
    pain_level: Optional[int] = None
    flow: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None


class SymptomLogResponse(BaseModel):
    id: int
    log_date: date
    mood: Optional[str]
    pain_level: Optional[int]
    flow: Optional[str]
    symptoms: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True