from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel

# Sleep Schemas
class SleepLogCreate(BaseModel):
    sleep_time: datetime
    wake_time: datetime
    quality: int # 1-5
    notes: Optional[str] = None
    logged_at: Optional[datetime] = None

class SleepLogOut(BaseModel):
    id: int
    user_id: int
    sleep_time: datetime
    wake_time: datetime
    duration_hours: float
    quality: int
    notes: Optional[str] = None
    logged_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class SleepSummary(BaseModel):
    avg_duration_hours: float
    streak_days: int
    count: int

# Mood Schemas
class MoodLogCreate(BaseModel):
    mood: str
    energy_level: int # 1-5
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    logged_at: Optional[datetime] = None

class MoodLogOut(BaseModel):
    id: int
    user_id: int
    mood: str
    energy_level: int
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    logged_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class WellnessInsight(BaseModel):
    insights: str
