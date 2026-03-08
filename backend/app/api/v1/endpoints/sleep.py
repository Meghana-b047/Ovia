from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.sleep_log import SleepLogRequest, SleepLogResponse
from app.services.sleep_service import upsert_sleep_log, get_sleep_logs

router = APIRouter(prefix="/sleep", tags=["Sleep"])


@router.post("", response_model=SleepLogResponse)
def log_sleep(
    payload: SleepLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return upsert_sleep_log(payload, current_user, db)


@router.get("", response_model=List[SleepLogResponse])
def list_sleep_logs(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_sleep_logs(current_user, db, limit)