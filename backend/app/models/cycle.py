from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class CycleLog(Base):
    """
    Represents one menstrual cycle entry.
    Each row = one period start event logged by the user.
    """
    __tablename__ = "cycle_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Core dates
    period_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    period_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)   # filled when period ends

    # Flow and symptoms
    flow_intensity: Mapped[Optional[str]] = mapped_column(String(10))   # "light" | "medium" | "heavy"
    symptoms: Mapped[Optional[str]] = mapped_column(Text)                # JSON string: ["cramps","bloating"]
    mood: Mapped[Optional[str]] = mapped_column(String(30))              # "happy" | "anxious" | "irritable" etc.
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Computed predictions (set by the prediction service)
    predicted_next_period: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    predicted_ovulation_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    cycle_length_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )



    def __repr__(self) -> str:
        return f"<CycleLog user_id={self.user_id} start={self.period_start_date}>"
