from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.cycle import (
    CycleLogCreate,
    CycleLogUpdate,
    CycleLogResponse,
    CyclePhaseResponse,
)
from app.services import cycle_service

router = APIRouter(prefix="/cycle", tags=["Cycle Tracking"])


@router.post("/log", response_model=CycleLogResponse, status_code=201)
async def log_period(
    data: CycleLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Log the start of a new period.
    Automatically runs the prediction engine and returns
    predicted next period + ovulation date.
    """
    return await cycle_service.log_cycle(current_user, data, db)


@router.patch("/log/{log_id}", response_model=CycleLogResponse)
async def update_period_log(
    log_id: int,
    data: CycleLogUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update an existing cycle log — e.g. add end date once period is over,
    or update symptoms and mood throughout the cycle.
    """
    return await cycle_service.update_cycle_log(current_user, log_id, data, db)


@router.get("/history", response_model=List[CycleLogResponse])
async def get_history(
    limit: int = Query(default=12, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the user's cycle history (most recent first).
    Default limit = 12 cycles (~1 year).
    """
    return await cycle_service.get_cycle_history(current_user, db, limit=limit)


@router.get("/phase", response_model=CyclePhaseResponse)
async def get_current_phase(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the user's current cycle phase (menstrual / follicular / ovulatory / luteal)
    along with personalised exercise and nutrition tips based on the research document.
    This is the main endpoint for the Home Screen dashboard.
    """
    return await cycle_service.get_current_phase(current_user, db)
