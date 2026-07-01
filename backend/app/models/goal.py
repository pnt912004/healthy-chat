from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class Goal(SQLModel, table=True):
    __tablename__ = "goals"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, unique=True)

    # Body metrics
    current_weight: Optional[float] = Field(default=None)   # kg
    height: Optional[float] = Field(default=None)           # cm
    age: Optional[int] = Field(default=None)
    gender: Optional[str] = Field(default=None)             # male / female / other
    activity_level: Optional[str] = Field(default="sedentary")  # sedentary / moderate / active
    target_weight: Optional[float] = Field(default=None)    # kg
    body_fat_percentage: Optional[float] = Field(default=None) # %
    weekly_goal_rate: Optional[float] = Field(default=0.5)  # kg/week

    # Calculated results
    bmr: Optional[float] = Field(default=None)
    tdee: Optional[float] = Field(default=None)
    bmi: Optional[float] = Field(default=None)
    daily_calorie_goal: Optional[float] = Field(default=None)
    estimated_days_to_target: Optional[int] = Field(default=None)

    daily_water_target_ml: Optional[int] = Field(default=2500)
    daily_sleep_target_hours: Optional[float] = Field(default=8.0)
    daily_exercise_target_minutes: Optional[int] = Field(default=30)
    daily_protein_target: Optional[float] = Field(default=None)
    daily_carbs_target: Optional[float] = Field(default=None)
    daily_fat_target: Optional[float] = Field(default=None)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
