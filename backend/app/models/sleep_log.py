from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class SleepLog(SQLModel, table=True):
    __tablename__ = "sleep_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    duration_hours: float
    quality: Optional[str] = Field(default=None, max_length=50) # e.g., good, average, poor
    notes: Optional[str] = Field(default=None)
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
