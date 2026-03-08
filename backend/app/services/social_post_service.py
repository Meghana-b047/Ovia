from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.social_post import SocialPost
from app.models.user import User
from app.schemas.social_post import SocialPostCreate


def get_posts(db: Session, user: User, category: Optional[str], limit: int, offset: int) -> List[SocialPost]:
    q = db.query(SocialPost)
    if category and category != "All":
        q = q.filter(SocialPost.category == category)
    return q.order_by(SocialPost.created_at.desc()).offset(offset).limit(limit).all()


def create_post(payload: SocialPostCreate, user: User, db: Session) -> SocialPost:
    author = "Anonymous" if payload.is_anonymous else user.full_name
    post = SocialPost(
        user_id=user.id,
        author_name=author,
        category=payload.category,
        content=payload.content,
        is_anonymous=payload.is_anonymous,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def like_post(post_id: int, db: Session) -> int:
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes += 1
    db.commit()
    return post.likes


def delete_post(post_id: int, user: User, db: Session) -> None:
    post = db.query(SocialPost).filter(SocialPost.id == post_id, SocialPost.user_id == user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not yours")
    db.delete(post)
    db.commit()