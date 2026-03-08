from pydantic_settings import BaseSettings
from functools import lru_cache
import os 

class Settings(BaseSettings):
    # Database — SQLite (file created automatically in project root)
    DATABASE_URL: str = "sqlite+aiosqlite:///./ovia.db"

    # JWT
    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # App
    APP_NAME: str = "Ovia"
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    #YouTUbe API 
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    YOUTUBE_SEARCH_URL: str = "https://www.googleapis.com/youtube/v3/search"
    YOUTUBE_MAX_RESULTS: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
