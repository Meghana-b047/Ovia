from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.water_log import WaterLogRequest, WaterLogResponse
from app.services.water_service import upsert_water_log, get_water_logs

router = APIRouter(prefix="/water", tags=["Water"])


@router.post("", response_model=WaterLogResponse)
def log_water(
    payload: WaterLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return upsert_water_log(payload, current_user, db)


@router.get("", response_model=List[WaterLogResponse])
def list_water_logs(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_water_logs(current_user, db, limit)