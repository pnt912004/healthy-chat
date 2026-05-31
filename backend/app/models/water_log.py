from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class WaterLog(SQLModel, table=True):
    __tablename__ = "water_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    amount_ml: int = Field(default=250)  # ml
    logged_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
