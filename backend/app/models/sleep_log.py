from typing import Optional
from datetime import datetime, time, timezone
from sqlmodel import Field, SQLModel


class SleepLog(SQLModel, table=True):
    __tablename__ = "sleep_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    sleep_time: datetime
    wake_time: datetime
    duration_hours: float
    quality: int = Field(ge=1, le=5)
    notes: Optional[str] = Field(default=None)
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
