from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class NutritionLogCreate(BaseModel):
    food_name: str
    calories: float
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0
    portion: Optional[str] = None
    meal_type: str = "breakfast"  # breakfast / lunch / dinner / snack
    logged_at: Optional[datetime] = None


class NutritionLogOut(BaseModel):
    id: int
    user_id: int
    food_name: str
    calories: float
    protein: Optional[float]
    carbs: Optional[float]
    fat: Optional[float]
    portion: Optional[str]
    meal_type: str
    logged_at: datetime

    class Config:
        from_attributes = True


class NutritionSummary(BaseModel):
    date: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    goal_calories: Optional[float]
    remaining_calories: Optional[float]
    logs: List[NutritionLogOut]


class NutritionDayBar(BaseModel):
    date: str
    day_label: str
    total_calories: float
    goal_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float


class NutritionWeekly(BaseModel):
    week: List[NutritionDayBar]
    goal_calories: float
