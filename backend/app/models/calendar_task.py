from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class CalendarTask(Base):
    """
    Represents a task scheduled by the user for a specific date in the calendar.
    """
    __tablename__ = "calendar_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Task scheduling
    task_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Task details
    icon: Mapped[str] = mapped_column(String(10), default="📋")
    title: Mapped[str] = mapped_column(String(150), nullable=False)

    # Status
    done: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )



    def __repr__(self) -> str:
        return f"<CalendarTask user_id={self.user_id} date={self.task_date} done={self.done}>"