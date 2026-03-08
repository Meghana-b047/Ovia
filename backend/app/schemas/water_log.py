from pydantic import BaseModel
from typing import List
from datetime import date 


class WaterLogRequest(BaseModel):
    log_date: date  # YYYY-MM-DD
    glasses: int


class WaterLogResponse(BaseModel):
    log_date: date
    glasses: int

    class Config:
        from_attributes = True