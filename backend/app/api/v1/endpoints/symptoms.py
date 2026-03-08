from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.cycle_log import CycleLogRequest, CycleLogResponse, CycleStatusResponse
from app.services.cycle_service import get_cycle_history, log_cycle, get_current_phase, delete_cycle_log, update_cycle_log

router = APIRouter(prefix="/cycle", tags=["Cycle"])


@router.get("/status", response_model=CycleStatusResponse)
def cycle_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_current_phase(current_user, db)


@router.get("/logs", response_model=List[CycleLogResponse])
def list_cycle_logs(
    limit: int = 12,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_cycle_history(current_user, db, limit)


@router.post("/logs", response_model=CycleLogResponse, status_code=201)
def add_cycle_log(
    payload: CycleLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return log_cycle(payload, current_user, db)


@router.delete("/logs/{log_id}", status_code=204)
def remove_cycle_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_cycle_log(log_id, current_user, db)