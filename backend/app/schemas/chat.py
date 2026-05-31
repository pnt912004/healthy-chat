from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ChatSend(BaseModel):
    message: str
    session_id: Optional[str] = None   # None → tạo session mới


class ChatMessageOut(BaseModel):
    id: int
    session_id: str
    role: str
    content: str
    analysis: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    session_id: str
    user_message: ChatMessageOut
    ai_message: ChatMessageOut


class ChatSession(BaseModel):
    session_id: str
    preview: str          # đoạn đầu tin nhắn cuối
    created_at: datetime
    message_count: int
    unread_count: int = 0
