from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class FavoriteFood(SQLModel, table=True):
    __tablename__ = "favorite_foods"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    food_id: int = Field(foreign_key="foods.id", index=True)
    created_at: datetime = Field(default_factory=datetime.now)
