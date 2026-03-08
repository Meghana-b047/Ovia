from pydantic import BaseModel
from datetime import datetime


class SocialCommentCreate(BaseModel):
    content: str


class SocialCommentResponse(BaseModel):
    id: int
    post_id: int
    author_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True