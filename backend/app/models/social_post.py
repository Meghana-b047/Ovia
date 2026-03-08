from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SocialPost(Base):
    """
    Represents a post created by a user in the social/community section.
    Posts can belong to categories like PCOS, Period, Pregnancy, Fitness, etc.
    """
    __tablename__ = "social_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Author details
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)

    # Post content
    category: Mapped[str] = mapped_column(String(50), default="General")
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Engagement
    likes: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


    def __repr__(self) -> str:
        return f"<SocialPost user_id={self.user_id} category={self.category} likes={self.likes}>"