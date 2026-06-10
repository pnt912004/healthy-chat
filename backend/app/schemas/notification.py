from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    content: str
    is_read: bool
    action_url: Optional[str]
    created_at: datetime

class ReminderSettingCreate(BaseModel):
    water_reminder: Optional[bool] = None
    water_interval_hours: Optional[int] = None
    meal_reminder: Optional[bool] = None
    exercise_reminder: Optional[bool] = None
    weekly_report: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

class ReminderSettingOut(BaseModel):
    id: int
    user_id: int
    water_reminder: bool
    water_interval_hours: int
    meal_reminder: bool
    exercise_reminder: bool
    weekly_report: bool
    quiet_hours_start: str
    quiet_hours_end: str
