from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class HealthTipBase(BaseModel):
    category: str
    content: str
    icon: Optional[str] = "psychology"

class HealthTipCreate(HealthTipBase):
    pass

class HealthTipUpdate(BaseModel):
    category: Optional[str] = None
    content: Optional[str] = None
    icon: Optional[str] = None

class HealthTipOut(HealthTipBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
