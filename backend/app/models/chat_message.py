from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


from sqlalchemy import Column, JSON

class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    session_id: str = Field(index=True, max_length=100)  # UUID grouping messages into sessions
    role: str = Field(max_length=10)   # "user" | "ai"
    content: str                        # message text
    analysis: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
