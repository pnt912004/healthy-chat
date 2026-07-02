from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class MoodLog(SQLModel, table=True):
    __tablename__ = "mood_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    mood: str = Field(max_length=50) # e.g., happy, neutral, sad, stressed
    notes: Optional[str] = Field(default=None)
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
