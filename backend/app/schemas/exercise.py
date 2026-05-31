from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ExerciseLogCreate(BaseModel):
    exercise_type: str
    duration_minutes: int
    intensity: str  # low, moderate, high
    calories_burned: Optional[float] = None # Will calculate if not provided
    notes: Optional[str] = None
    logged_at: Optional[datetime] = None


class ExerciseLogOut(BaseModel):
    id: int
    user_id: int
    exercise_type: str
    duration_minutes: int
    intensity: str
    calories_burned: float
    notes: Optional[str] = None
    logged_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ExerciseSummary(BaseModel):
    total_minutes: int
    total_calories_burned: float
    count: int


class ExerciseDayBar(BaseModel):
    date: str
    calories_burned: float
    duration_minutes: int


class ExerciseWeekly(BaseModel):
    days: List[ExerciseDayBar]
    total_weekly_calories: float
    total_weekly_minutes: int


class ExerciseRange(BaseModel):
    days: List[ExerciseDayBar]
    total_calories: float
    total_minutes: int
