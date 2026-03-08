from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.social_comment import SocialComment
from app.models.social_post import SocialPost
from app.models.user import User
from app.schemas.social_comment import SocialCommentCreate


def get_comments(post_id: int, db: Session) -> List[SocialComment]:
    return (
        db.query(SocialComment)
        .filter(SocialComment.post_id == post_id)
        .order_by(SocialComment.created_at)
        .all()
    )


def create_comment(post_id: int, payload: SocialCommentCreate, user: User, db: Session) -> SocialComment:
    if not db.query(SocialPost).filter(SocialPost.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")
    comment = SocialComment(
        post_id=post_id,
        user_id=user.id,
        author_name=user.full_name,
        content=payload.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment