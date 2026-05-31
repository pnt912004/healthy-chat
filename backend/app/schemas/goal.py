from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class GoalCreate(BaseModel):
    current_weight: float       # kg
    height: float               # cm
    age: int
    gender: str                 # male / female / other
    activity_level: str         # sedentary / moderate / active
    target_weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    weekly_goal_rate: Optional[float] = 0.5
    daily_calorie_goal: Optional[float] = None



class GoalUpdate(GoalCreate):
    pass


class TDEERequest(BaseModel):
    current_weight: float
    height: float
    age: int
    gender: str
    activity_level: str
    target_weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    weekly_goal_rate: Optional[float] = 0.5


class TDEEResult(BaseModel):
    bmr: float
    tdee: float
    bmi: float
    bmi_status: str
    daily_calorie_goal: float
    calorie_deficit: float
    estimated_days_to_target: Optional[int] = None


class GoalOut(BaseModel):
    id: int
    user_id: int
    current_weight: Optional[float]
    height: Optional[float]
    age: Optional[int]
    gender: Optional[str]
    activity_level: Optional[str]
    target_weight: Optional[float]
    body_fat_percentage: Optional[float]
    weekly_goal_rate: Optional[float]
    bmr: Optional[float]
    tdee: Optional[float]
    bmi: Optional[float]
    daily_calorie_goal: Optional[float]
    estimated_days_to_target: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
