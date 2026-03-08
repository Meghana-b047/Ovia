from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.calendar_task import CalendarTask
from app.models.user import User
from app.schemas.calendar_task import CalendarTaskCreate, CalendarTaskUpdate


def get_tasks(user: User, db: Session, task_date: Optional[str] = None) -> List[CalendarTask]:
    q = db.query(CalendarTask).filter(CalendarTask.user_id == user.id)
    if task_date:
        q = q.filter(CalendarTask.task_date == task_date)
    return q.order_by(CalendarTask.created_at).all()


def create_task(payload: CalendarTaskCreate, user: User, db: Session) -> CalendarTask:
    task = CalendarTask(user_id=user.id, **payload.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(task_id: int, payload: CalendarTaskUpdate, user: User, db: Session) -> CalendarTask:
    task = db.query(CalendarTask).filter(CalendarTask.id == task_id, CalendarTask.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


def delete_task(task_id: int, user: User, db: Session) -> None:
    task = db.query(CalendarTask).filter(CalendarTask.id == task_id, CalendarTask.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()