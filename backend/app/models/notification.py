from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    type: str  # water, meal, exercise, weekly
    title: str
    content: str
    is_read: bool = Field(default=False)
    action_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
