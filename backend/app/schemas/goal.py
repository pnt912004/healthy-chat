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
    daily_water_target_ml: Optional[int] = 2500
    daily_sleep_target_hours: Optional[float] = 8.0
    daily_exercise_target_minutes: Optional[int] = 30
    daily_protein_target: Optional[float] = None
    daily_carbs_target: Optional[float] = None
    daily_fat_target: Optional[float] = None


class GoalUpdate(BaseModel):
    current_weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    target_weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    weekly_goal_rate: Optional[float] = None
    daily_calorie_goal: Optional[float] = None
    daily_water_target_ml: Optional[int] = None
    daily_sleep_target_hours: Optional[float] = None
    daily_exercise_target_minutes: Optional[int] = None
    daily_protein_target: Optional[float] = None
    daily_carbs_target: Optional[float] = None
    daily_fat_target: Optional[float] = None


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
    daily_water_target_ml: Optional[int] = None
    daily_sleep_target_hours: Optional[float] = None
    daily_exercise_target_minutes: Optional[int] = None
    daily_protein_target: Optional[float] = None
    daily_carbs_target: Optional[float] = None
    daily_fat_target: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
