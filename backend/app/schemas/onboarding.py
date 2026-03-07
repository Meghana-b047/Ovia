from datetime import date
from typing import Optional, Literal
from pydantic import BaseModel, Field, model_validator


GoalType = Literal["Track my cycle", "Manage PCOS/PCOD", "Plan pregnancy", "General health"]

CycleLengthOption = Literal["21-25 days", "26-30 days", "31-35 days", "Not sure"]
PeriodDurationOption = Literal["1-3 days", "4-5 days", "6-7 days", "Not sure"]
LastPeriodOption = Literal["Today", "Yesterday", "2 days ago", "3+ days ago"]


class OnboardingRequest(BaseModel):
    # Step 01
    cycle_length_option: CycleLengthOption
    cycle_length_days: int = Field(..., ge=18, le=40, description="Exact day value from the picker")

    # Step 02
    period_duration_option: PeriodDurationOption
    period_duration_days: int = Field(..., ge=1, le=10, description="Exact day value from the picker")

    # Step 03
    last_period_option: LastPeriodOption

    # Step 04
    goal: GoalType


class OnboardingResponse(BaseModel):
    id: int
    user_id: int
    cycle_length_option: Optional[str]
    cycle_length_days: Optional[int]
    period_duration_option: Optional[str]
    period_duration_days: Optional[int]
    last_period_option: Optional[str]
    last_period_date: Optional[date]
    goal: Optional[str]

    model_config = {"from_attributes": True}
