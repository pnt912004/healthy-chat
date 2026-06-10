from typing import Optional
from sqlmodel import SQLModel, Field

class ReminderSetting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    water_reminder: bool = Field(default=True)
    water_interval_hours: int = Field(default=2)
    meal_reminder: bool = Field(default=True)
    exercise_reminder: bool = Field(default=True)
    weekly_report: bool = Field(default=True)
    quiet_hours_start: str = Field(default="22:00")
    quiet_hours_end: str = Field(default="07:00")
