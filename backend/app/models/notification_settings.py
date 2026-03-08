from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class NotificationSettings(Base):
    """
    Stores notification preferences for a user.
    Each user has only one row of settings.
    """
    __tablename__ = "notification_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Notification preferences
    secret_chats: Mapped[bool] = mapped_column(Boolean, default=True)
    personal_advice: Mapped[bool] = mapped_column(Boolean, default=True)

    period_soon: Mapped[bool] = mapped_column(Boolean, default=True)
    ovulation: Mapped[bool] = mapped_column(Boolean, default=False)
    period_end: Mapped[bool] = mapped_column(Boolean, default=False)
    period_start: Mapped[bool] = mapped_column(Boolean, default=True)

    contraception: Mapped[bool] = mapped_column(Boolean, default=False)

    lifestyle: Mapped[bool] = mapped_column(Boolean, default=True)
    water_reminder: Mapped[bool] = mapped_column(Boolean, default=False)
    sleep_reminder: Mapped[bool] = mapped_column(Boolean, default=True)
    exercise_reminder: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamp
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationship
    user = relationship("User", back_populates="notification_settings")

    def __repr__(self) -> str:
        return f"<NotificationSettings user_id={self.user_id}>"