from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class NutritionLog(SQLModel, table=True):
    __tablename__ = "nutrition_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    food_name: str = Field(max_length=200)
    calories: float = Field(default=0)          # kcal
    protein: Optional[float] = Field(default=0)  # g
    carbs: Optional[float] = Field(default=0)    # g
    fat: Optional[float] = Field(default=0)      # g
    portion: Optional[str] = Field(default=None, max_length=100)  # "1 khẩu phần (250g)"

    # breakfast / lunch / dinner / snack
    meal_type: str = Field(default="breakfast", max_length=20)

    logged_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
