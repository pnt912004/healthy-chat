from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# ─── Register ──────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None


# ─── Login ─────────────────────────────────────────────────────────────────
class UserLogin(BaseModel):
    username: str
    password: str


# ─── Update Profile ────────────────────────────────────────────────────────
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


# ─── Change Password ────────────────────────────────────────────────────────
class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ─── Response ──────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
