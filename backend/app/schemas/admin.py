from typing import Optional, Literal
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_users: int
    new_users_today: int
    new_users_week: int
    new_users_month: int
    total_chat_messages: int
    total_nutrition_logs: int
    total_water_logs: int
    total_exercise_logs: int
    active_users_today: int

class UserUpdateAdmin(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[Literal["user", "admin"]] = None

class AdminReply(BaseModel):
    session_id: str
    message: str
    user_id: int
