from pydantic import BaseModel
from typing import List


class WaterLogRequest(BaseModel):
    log_date: str   # YYYY-MM-DD
    glasses: int


class WaterLogResponse(BaseModel):
    log_date: str
    glasses: int

    class Config:
        from_attributes = True