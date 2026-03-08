from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Register ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120, examples=["Priya Sharma"])
    email: EmailStr
    age: int = Field(..., ge=10, le=60)
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


# ── Google OAuth ──────────────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google ID token from the mobile client")


# ── Token responses ───────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    onboarding_complete: bool = False


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── User response (safe, no password) ────────────────────────────────────────

class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    age: Optional[int]
    auth_provider: str
    is_verified: bool
    onboarding_complete: bool

    model_config = {"from_attributes": True}

# ------ Update Profile Request ─────────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    age: Optional[int] = Field(None, ge=10, le=100)