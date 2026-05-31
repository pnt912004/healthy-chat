from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class ExerciseLog(SQLModel, table=True):
    __tablename__ = "exercise_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    exercise_type: str = Field(max_length=100)
    duration_minutes: int
    intensity: str = Field(max_length=50) # e.g., low, moderate, high
    calories_burned: float
    notes: Optional[str] = Field(default=None)
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
