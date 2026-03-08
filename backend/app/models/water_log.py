from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, func, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class WaterLog(Base):
    """
    Represents a daily water intake log for a user.
    Each row = one day's water intake entry.
    """
    __tablename__ = "water_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Log date
    log_date: Mapped[date] = mapped_column(String, nullable=False)

    # Water intake
    glasses: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamp
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )



    def __repr__(self) -> str:
        return f"<WaterLog user_id={self.user_id} date={self.log_date} glasses={self.glasses}>"