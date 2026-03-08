from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SleepLog(Base):
    """
    Represents a user's daily sleep log.
    Each row = one day's sleep duration entry.
    """
    __tablename__ = "sleep_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Log date
    log_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Sleep duration
    hours: Mapped[int] = mapped_column(Integer, default=0)
    minutes: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamp
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationship
    user = relationship("User", back_populates="sleep_logs")

    def __repr__(self) -> str:
        return f"<SleepLog user_id={self.user_id} date={self.log_date} sleep={self.hours}h {self.minutes}m>"