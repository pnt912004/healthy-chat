from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..models.sleep_log import SleepLog
from ..models.mood_log import MoodLog
from ..schemas.wellness import (
    SleepLogCreate, SleepLogOut, SleepSummary,
    MoodLogCreate, MoodLogOut, WellnessInsight
)
from ..core.security import get_current_user

import google.generativeai as genai
import os

router = APIRouter(prefix="/wellness", tags=["Wellness Tracker"])

# Initialize Gemini if API key is present
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def _day_range(day: date):
    start = datetime.combine(day, datetime.min.time())
    end   = datetime.combine(day, datetime.max.time())
    return start, end

# --- Sleep Endpoints ---

@router.post("/sleep", response_model=SleepLogOut, status_code=201)
def add_sleep_log(
    body: SleepLogCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    duration_delta = body.wake_time - body.sleep_time
    duration_hours = duration_delta.total_seconds() / 3600.0
    if duration_hours < 0:
        duration_hours += 24 # cross midnight
    
    log = SleepLog(
        user_id=current_user.id,
        sleep_time=body.sleep_time,
        wake_time=body.wake_time,
        duration_hours=duration_hours,
        quality=body.quality,
        notes=body.notes,
        logged_at=body.logged_at or datetime.now(),
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return log

@router.get("/sleep", response_model=List[SleepLogOut])
def get_sleep_logs(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    start, end = _day_range(target)
    logs = session.exec(
        select(SleepLog).where(
            SleepLog.user_id == current_user.id,
            SleepLog.logged_at >= start,
            SleepLog.logged_at <= end,
        ).order_by(SleepLog.logged_at)
    ).all()
    return logs

@router.delete("/sleep/{log_id}")
def delete_sleep_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    log = session.get(SleepLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhật ký giấc ngủ")
    session.delete(log)
    session.commit()
    return {"message": "Đã xoá"}

@router.get("/sleep/summary", response_model=SleepSummary)
def get_sleep_summary(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Calculate 7-day average and streak
    today = date.today()
    start_date = today - timedelta(days=6)
    start_datetime = datetime.combine(start_date, datetime.min.time())
    
    logs = session.exec(
        select(SleepLog).where(
            SleepLog.user_id == current_user.id,
            SleepLog.logged_at >= start_datetime
        ).order_by(SleepLog.logged_at.desc())
    ).all()
    
    if not logs:
        return SleepSummary(avg_duration_hours=0.0, streak_days=0, count=0)
        
    avg_duration = sum(l.duration_hours for l in logs) / len(logs)
    
    # Calculate streak of sleeping >= 7h
    streak = 0
    for l in logs:
        if l.duration_hours >= 7.0:
            streak += 1
        else:
            break
            
    return SleepSummary(avg_duration_hours=avg_duration, streak_days=streak, count=len(logs))

# --- Mood Endpoints ---

@router.post("/mood", response_model=MoodLogOut, status_code=201)
def add_mood_log(
    body: MoodLogCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    log = MoodLog(
        user_id=current_user.id,
        mood=body.mood,
        energy_level=body.energy_level,
        tags=body.tags,
        notes=body.notes,
        logged_at=body.logged_at or datetime.now(),
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return log

@router.get("/mood", response_model=List[MoodLogOut])
def get_mood_logs(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    start, end = _day_range(target)
    logs = session.exec(
        select(MoodLog).where(
            MoodLog.user_id == current_user.id,
            MoodLog.logged_at >= start,
            MoodLog.logged_at <= end,
        ).order_by(MoodLog.logged_at)
    ).all()
    return logs

@router.delete("/mood/{log_id}")
def delete_mood_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    log = session.get(MoodLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhật ký cảm xúc")
    session.delete(log)
    session.commit()
    return {"message": "Đã xoá"}

# --- Insights Endpoint ---

@router.get("/insights", response_model=WellnessInsight)
def get_wellness_insights(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not GEMINI_API_KEY:
         return WellnessInsight(insights="Chưa cấu hình Gemini API Key. Vui lòng thêm GEMINI_API_KEY vào biến môi trường.")
         
    # Gather 7 days of sleep and mood data
    today = date.today()
    start_date = today - timedelta(days=6)
    start_datetime = datetime.combine(start_date, datetime.min.time())
    
    sleep_logs = session.exec(
        select(SleepLog).where(
            SleepLog.user_id == current_user.id,
            SleepLog.logged_at >= start_datetime
        )
    ).all()
    
    mood_logs = session.exec(
        select(MoodLog).where(
            MoodLog.user_id == current_user.id,
            MoodLog.logged_at >= start_datetime
        )
    ).all()
    
    # Prompt preparation
    sleep_data_str = ", ".join([f"{l.duration_hours:.1f}h (q:{l.quality})" for l in sleep_logs])
    mood_data_str = ", ".join([f"{l.mood} (e:{l.energy_level})" for l in mood_logs])
    
    prompt = f"""
    Bạn là một chuyên gia tư vấn sức khoẻ. Dưới đây là dữ liệu 7 ngày gần đây của người dùng:
    Giấc ngủ: {sleep_data_str if sleep_data_str else 'Chưa có dữ liệu'}
    Cảm xúc (e=năng lượng 1-5): {mood_data_str if mood_data_str else 'Chưa có dữ liệu'}
    
    Hãy viết một đoạn ngắn (khoảng 3-4 câu tiếng Việt) phân tích mối liên hệ giữa giấc ngủ và cảm xúc/năng lượng của họ, đồng thời đưa ra 1 lời khuyên hữu ích, thân thiện. 
    Không cần dùng từ ngữ quá hàn lâm.
    """
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return WellnessInsight(insights=response.text)
    except Exception as e:
        return WellnessInsight(insights="Đã xảy ra lỗi khi tạo đánh giá tự động.")
