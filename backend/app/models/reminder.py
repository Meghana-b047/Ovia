from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Reminder(Base):
    """
    Represents a reminder set by the user.
    Used for medications, hydration, tasks, etc.
    """
    __tablename__ = "reminders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Reminder content
    icon: Mapped[Optional[str]] = mapped_column(String, default="💊")
    title: Mapped[str] = mapped_column(String, nullable=False)
    time: Mapped[str] = mapped_column(String, nullable=False)   # "8:00 AM", "Tomorrow", etc.

    # UI attributes
    color: Mapped[Optional[str]] = mapped_column(String, default="#FFB3C6")

    # Reminder behavior
    repeat: Mapped[str] = mapped_column(String, default="Once")   # Once / Daily / Weekly / Monthly
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )



    def __repr__(self) -> str:
        return f"<Reminder user_id={self.user_id} title='{self.title}' time={self.time}>"