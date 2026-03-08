from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.social_comment import SocialCommentCreate, SocialCommentResponse
from app.services.social_comment_service import get_comments, create_comment

router = APIRouter(prefix="/social/posts", tags=["Social - Comments"])


@router.get("/{post_id}/comments", response_model=List[SocialCommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_comments(post_id, db)


@router.post("/{post_id}/comments", response_model=SocialCommentResponse, status_code=201)
def add_comment(
    post_id: int,
    payload: SocialCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_comment(post_id, payload, current_user, db)