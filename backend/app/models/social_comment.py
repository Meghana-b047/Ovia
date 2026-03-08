from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SocialComment(Base):
    """
    Represents a comment made by a user on a social/community post.
    """
    __tablename__ = "social_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    post_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("social_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Author details
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Comment content
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


    def __repr__(self) -> str:
        return f"<SocialComment post_id={self.post_id} user_id={self.user_id}>"