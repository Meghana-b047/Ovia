from pydantic import BaseModel
from datetime import datetime


class SocialPostCreate(BaseModel):
    category: str = "General"
    content: str
    is_anonymous: bool = False


class SocialPostResponse(BaseModel):
    id: int
    author_name: str
    category: str
    content: str
    likes: int
    is_anonymous: bool
    created_at: datetime

    class Config:
        from_attributes = True