from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class WaterLogCreate(BaseModel):
    amount_ml: int = 250
    logged_at: Optional[datetime] = None


class WaterLogOut(BaseModel):
    id: int
    user_id: int
    amount_ml: int
    logged_at: datetime

    class Config:
        from_attributes = True


class WaterDayBar(BaseModel):
    date: str   # YYYY-MM-DD
    day_label: str  # T2, T3, ...
    total_ml: int
    goal_ml: int
    pct: int


class WaterSummary(BaseModel):
    date: str
    total_ml: int
    goal_ml: int
    pct: int
    streak_days: int
    last_log_at: Optional[datetime]
    logs: List[WaterLogOut]


class WaterWeekly(BaseModel):
    week: List[WaterDayBar]
    goal_ml: int
