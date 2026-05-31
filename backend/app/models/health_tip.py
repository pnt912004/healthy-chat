from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class HealthTip(SQLModel, table=True):
    __tablename__ = "health_tips"

    id: Optional[int] = Field(default=None, primary_key=True)
    category: str = Field(index=True, max_length=50) # Dinh dưỡng, Giấc ngủ, Vận động...
    content: str
    icon: Optional[str] = Field(default="psychology", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
