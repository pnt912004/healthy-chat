import uuid
import json
import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..models.chat_message import ChatMessage
from ..schemas.chat import ChatSend, ChatMessageOut, ChatResponse, ChatSession
from ..core.security import get_current_user
from ..core.config import settings

router = APIRouter(prefix="/chat", tags=["AI Chat"])

# ─── System prompt cho AI ────────────────────────────────────────────────────
SYSTEM_PROMPT = """Bạn là trợ lý AI sức khoẻ của HealthyChat, chuyên về dinh dưỡng, thể dục, và lối sống lành mạnh.
Hãy luôn trả lời bằng tiếng Việt, thân thiện, chính xác về y tế nhưng không thay thế bác sĩ.
Khi phân tích bữa ăn, hãy ước tính calo và macro (protein, carbs, fat).
Nếu bạn phân tích một bữa ăn, hãy kèm theo một khối JSON chứa các chỉ số dinh dưỡng ở cuối câu trả lời, bao bọc trong thẻ <analysis>...</analysis>.
Định dạng JSON: {"kcal": 450, "protein": "32g", "carbs": "28g", "fat": "18g"}
Khi người dùng hỏi về bài tập, hãy gợi ý bài tập phù hợp với thể trạng.
Giữ câu trả lời ngắn gọn, rõ ràng (không quá 200 từ trừ khi cần thiết)."""


def _get_ai_response(history: list, new_message: str) -> str:
    """Gọi Gemini API để lấy phản hồi AI."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        # Xây dựng lịch sử conversation
        chat_history = []
        for msg in history[-10:]:  # giữ 10 tin nhắn gần nhất
            chat_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content],
            })

        chat = model.start_chat(history=chat_history)
        response = chat.send_message(new_message)
        return response.text

    except Exception as e:
        return f"Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau. (Lỗi: {str(e)[:100]})"


def _extract_analysis(text: str):
    """Trích xuất JSON analysis từ tag <analysis> và xoá tag khỏi text."""
    match = re.search(r'<analysis>(.*?)</analysis>', text, re.DOTALL)
    analysis = None
    clean_text = text
    if match:
        try:
            analysis = json.loads(match.group(1).strip())
            clean_text = text.replace(match.group(0), "").strip()
        except:
            pass
    return clean_text, analysis


@router.post("/send", response_model=ChatResponse, status_code=201)
def send_message(
    body: ChatSend,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Tạo session_id nếu chưa có
    session_id = body.session_id or str(uuid.uuid4())

    # Lấy lịch sử session để đưa vào context
    history = session.exec(
        select(ChatMessage).where(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id,
        ).order_by(ChatMessage.created_at)
    ).all()

    # Lưu tin nhắn của người dùng
    user_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        role="user",
        content=body.message,
    )
    session.add(user_msg)
    session.commit()
    session.refresh(user_msg)

    # Gọi Gemini AI
    ai_raw_text = _get_ai_response(list(history), body.message)
    
    # Trích xuất analysis
    ai_text, analysis = _extract_analysis(ai_raw_text)

    # Lưu phản hồi AI
    ai_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        role="ai",
        content=ai_text,
        analysis=analysis
    )
    session.add(ai_msg)
    session.commit()
    session.refresh(ai_msg)

    return ChatResponse(
        session_id=session_id,
        user_message=ChatMessageOut.model_validate(user_msg),
        ai_message=ChatMessageOut.model_validate(ai_msg),
    )


@router.get("/sessions", response_model=List[ChatSession])
def get_sessions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Lấy danh sách các phiên chat AI, ngoại trừ phiên của admin."""
    messages = session.exec(
        select(ChatMessage).where(
            ChatMessage.user_id == current_user.id,
            ~ChatMessage.session_id.startswith("admin_")
        ).order_by(ChatMessage.created_at)
    ).all()

    sessions_map: dict = {}
    for msg in messages:
        if msg.session_id not in sessions_map:
            sessions_map[msg.session_id] = {
                "session_id": msg.session_id,
                "preview": msg.content[:80],
                "created_at": msg.created_at,
                "message_count": 0,
            }
        sessions_map[msg.session_id]["message_count"] += 1

    result = [ChatSession(**v) for v in sessions_map.values()]
    result.sort(key=lambda x: x.created_at, reverse=True)
    return result


@router.get("/history/{session_id}", response_model=List[ChatMessageOut])
def get_history(
    session_id: str,
    limit: int = Query(default=50, le=200),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    messages = session.exec(
        select(ChatMessage).where(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id,
        ).order_by(ChatMessage.created_at).limit(limit)
    ).all()
    return messages

@router.post("/admin/send", response_model=ChatMessageOut)
def send_message_to_admin(
    body: ChatSend,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    session_id = f"admin_{current_user.id}"
        
    user_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        role="user",
        content=body.message,
    )
    session.add(user_msg)
    session.commit()
    session.refresh(user_msg)
    return user_msg

@router.get("/unread")
def get_user_unread_count(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    from sqlalchemy import func
    count = session.exec(
        select(func.count(ChatMessage.id)).where(
            ChatMessage.user_id == current_user.id,
            ChatMessage.role == "admin",
            ChatMessage.is_read == False
        )
    ).one()
    return {"unread_count": count}

@router.post("/read/{session_id}")
def mark_user_chat_read(
    session_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    from sqlmodel import update
    session.exec(
        update(ChatMessage).where(
            ChatMessage.session_id == session_id,
            ChatMessage.user_id == current_user.id,
            ChatMessage.role == "admin",
            ChatMessage.is_read == False
        ).values(is_read=True)
    )
    session.commit()
    return {"message": "Đã đánh dấu đọc"}
