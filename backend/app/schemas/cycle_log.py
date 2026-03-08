from datetime import date
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator


FlowIntensity = Literal["light", "medium", "heavy"]


# ── Log a new period ──────────────────────────────────────────────────────────

class CycleLogRequest(BaseModel):
    period_start_date: date
    period_end_date: Optional[date] = None
    flow_intensity: Optional[str] = None
    symptoms: Optional[List[str]] = []
    mood: Optional[str] = None
    notes: Optional[str] = None

    @field_validator('symptoms', mode='before')
    @classmethod
    def parse_symptoms(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return [s.strip() for s in v.split(',') if s.strip()]
        return []


# ── Update an existing log (e.g. add end date later) ─────────────────────────

class CycleLogUpdate(BaseModel):
    period_end_date: Optional[date] = None
    flow_intensity: Optional[FlowIntensity] = None
    symptoms: Optional[List[str]] = None
    mood: Optional[str] = Field(default=None, max_length=30)
    notes: Optional[str] = Field(default=None, max_length=1000)


# ── Response ──────────────────────────────────────────────────────────────────

class CycleLogResponse(BaseModel):
    id: int
    period_start_date: date
    period_end_date: Optional[date]
    flow_intensity: Optional[str]
    symptoms: Optional[List[str]]   # returns as list to frontend
    mood: Optional[str]
    notes: Optional[str]

    @field_validator('symptoms', mode='before')
    @classmethod
    def parse_symptoms(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str) and v:
            return [s.strip() for s in v.split(',') if s.strip()]
        return []

    model_config = {"from_attributes": True}


# ── Current cycle phase response ──────────────────────────────────────────────

class CyclePhaseResponse(BaseModel):
    phase: Literal["menstrual", "follicular", "ovulatory", "luteal", "unknown"]
    day_of_cycle: Optional[int]
    days_until_next_period: Optional[int]
    predicted_next_period: Optional[date]
    predicted_ovulation_date: Optional[date]
    exercise_tip: str
    nutrition_tip: str


class CycleStatusResponse(BaseModel):
    cycle_day: int
    cycle_total: int
    phase: str
    next_period_date: Optional[str]
    fertile_window_start: Optional[str]
    fertile_window_end: Optional[str]
    ovulation_date: Optional[str]