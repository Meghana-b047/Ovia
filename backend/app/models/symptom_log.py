from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SymptomLog(Base):
    """
    Represents a daily symptom/mood log entry.
    Each row = one day's symptoms logged by the user.
    """
    __tablename__ = "symptom_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Core date
    log_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Symptoms and mood
    mood: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)    # "Great" | "Good" | "Sad" etc.
    pain_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # 0-10
    flow: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)    # "light" | "medium" | "heavy"
    symptoms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)      # JSON string: ["cramps","bloating"]
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationship
    user = relationship("User", back_populates="symptom_logs")

    def __repr__(self) -> str:
        return f"<SymptomLog user_id={self.user_id} date={self.log_date}>"