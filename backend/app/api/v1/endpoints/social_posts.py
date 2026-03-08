from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.social_post import SocialPostCreate, SocialPostResponse
from app.services.social_post_service import get_posts, create_post, like_post, delete_post

router = APIRouter(prefix="/social/posts", tags=["Social - Posts"])


@router.get("", response_model=List[SocialPostResponse])
def list_posts(
    category: Optional[str] = None,
    limit: int = 30,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_posts(db, current_user, category, limit, offset)


@router.post("", response_model=SocialPostResponse, status_code=201)
def new_post(
    payload: SocialPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_post(payload, current_user, db)


@router.post("/{post_id}/like", status_code=200)
def add_like(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    likes = like_post(post_id, db)
    return {"likes": likes}


@router.delete("/{post_id}", status_code=204)
def remove_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    delete_post(post_id, current_user, db)