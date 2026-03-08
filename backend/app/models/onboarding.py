from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class OnboardingProfile(Base):
    __tablename__ = "onboarding_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Step 01 — Cycle length (matches OnboardingScreen question id: 'cycle_length')
    cycle_length_option: Mapped[Optional[str]] = mapped_column(String(20))   # e.g. "26-30 days"
    cycle_length_days: Mapped[Optional[int]] = mapped_column(Integer)        # exact value from picker, e.g. 28

    # Step 02 — Period duration (matches question id: 'period_duration')
    period_duration_option: Mapped[Optional[str]] = mapped_column(String(20))  # e.g. "4-5 days"
    period_duration_days: Mapped[Optional[int]] = mapped_column(Integer)       # exact value, e.g. 5

    # Step 03 — Last period (matches question id: 'last_period')
    last_period_option: Mapped[Optional[str]] = mapped_column(String(20))   # e.g. "Yesterday"
    last_period_date: Mapped[Optional[date]] = mapped_column(Date)          # computed actual date

    # Step 04 — Goal (matches question id: 'goal')
    goal: Mapped[Optional[str]] = mapped_column(String(50))   # e.g. "Track my cycle" | "Manage PCOS/PCOD" | etc.

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


    def __repr__(self) -> str:
        return f"<OnboardingProfile user_id={self.user_id} goal={self.goal}>"
