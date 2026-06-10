from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from sqlalchemy import func

from ..db.session import get_session
from ..models.user import User
from ..models.nutrition_log import NutritionLog
from ..models.water_log import WaterLog
from ..models.exercise_log import ExerciseLog
from ..models.sleep_log import SleepLog
from ..schemas.report import (
    DailySummary, WeeklyReport, MonthlyReport, 
    ComparisonReport, HealthScore, AIReview
)
from ..core.security import get_current_user

import google.generativeai as genai
import os

router = APIRouter(prefix="/reports", tags=["Health Reports"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def _get_daily_summary(session: Session, user_id: int, target_date: date) -> DailySummary:
    start_time = datetime.combine(target_date, datetime.min.time())
    end_time = datetime.combine(target_date, datetime.max.time())
    
    # Calories consumed
    nutritions = session.exec(select(NutritionLog).where(
        NutritionLog.user_id == user_id,
        NutritionLog.logged_at >= start_time,
        NutritionLog.logged_at <= end_time
    )).all()
    cal_consumed = sum(n.calories for n in nutritions)
    
    # Calories burned and Exercise minutes
    exercises = session.exec(select(ExerciseLog).where(
        ExerciseLog.user_id == user_id,
        ExerciseLog.logged_at >= start_time,
        ExerciseLog.logged_at <= end_time
    )).all()
    cal_burned = sum(e.calories_burned for e in exercises)
    ex_minutes = sum(e.duration_minutes for e in exercises)
    
    # Water
    waters = session.exec(select(WaterLog).where(
        WaterLog.user_id == user_id,
        WaterLog.logged_at >= start_time,
        WaterLog.logged_at <= end_time
    )).all()
    water_ml = sum(w.amount_ml for w in waters)
    
    # Sleep
    sleeps = session.exec(select(SleepLog).where(
        SleepLog.user_id == user_id,
        SleepLog.logged_at >= start_time,
        SleepLog.logged_at <= end_time
    )).all()
    sleep_hours = sum(s.duration_hours for s in sleeps)
    
    return DailySummary(
        date=target_date,
        calories_consumed=cal_consumed,
        calories_burned=cal_burned,
        water_ml=water_ml,
        exercise_minutes=ex_minutes,
        sleep_hours=sleep_hours
    )

@router.get("/weekly", response_model=WeeklyReport)
def get_weekly_report(
    target_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    end = target_date or date.today()
    start = end - timedelta(days=6)
    
    summaries = []
    days_goal_reached = 0
    total_cal_consumed = 0.0
    total_cal_burned = 0.0
    total_water = 0.0
    total_sleep = 0.0
    total_ex_min = 0
    
    for i in range(7):
        current_day = start + timedelta(days=i)
        summary = _get_daily_summary(session, current_user.id, current_day)
        summaries.append(summary)
        
        total_cal_consumed += summary.calories_consumed
        total_cal_burned += summary.calories_burned
        total_water += summary.water_ml
        total_sleep += summary.sleep_hours
        total_ex_min += summary.exercise_minutes
        
        # Simple goal logic: water > 2000 and cal_consumed > 1000
        if summary.water_ml >= 2000 and summary.calories_consumed >= 1000:
            days_goal_reached += 1
            
    return WeeklyReport(
        start_date=start,
        end_date=end,
        avg_calories_consumed=total_cal_consumed / 7,
        avg_calories_burned=total_cal_burned / 7,
        avg_water_ml=total_water / 7,
        avg_sleep_hours=total_sleep / 7,
        total_exercise_minutes=total_ex_min,
        days_goal_reached=days_goal_reached,
        daily_summaries=summaries
    )

@router.get("/monthly", response_model=MonthlyReport)
def get_monthly_report(
    month: Optional[int] = Query(default=None),
    year: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    today = date.today()
    m = month or today.month
    y = year or today.year
    
    start = date(y, m, 1)
    # Get last day of month
    if m == 12:
        end = date(y+1, 1, 1) - timedelta(days=1)
    else:
        end = date(y, m+1, 1) - timedelta(days=1)
        
    days_in_month = (end - start).days + 1
    
    summaries = []
    days_goal_reached = 0
    total_cal_consumed = 0.0
    total_cal_burned = 0.0
    total_water = 0.0
    total_sleep = 0.0
    total_ex_min = 0
    
    for i in range(days_in_month):
        current_day = start + timedelta(days=i)
        summary = _get_daily_summary(session, current_user.id, current_day)
        summaries.append(summary)
        
        total_cal_consumed += summary.calories_consumed
        total_cal_burned += summary.calories_burned
        total_water += summary.water_ml
        total_sleep += summary.sleep_hours
        total_ex_min += summary.exercise_minutes
        
        if summary.water_ml >= 2000 and summary.calories_consumed >= 1000:
            days_goal_reached += 1
            
    return MonthlyReport(
        month=m,
        year=y,
        avg_calories_consumed=total_cal_consumed / days_in_month,
        avg_calories_burned=total_cal_burned / days_in_month,
        avg_water_ml=total_water / days_in_month,
        avg_sleep_hours=total_sleep / days_in_month,
        total_exercise_minutes=total_ex_min,
        days_goal_reached=days_goal_reached,
        daily_summaries=summaries
    )

@router.get("/comparison", response_model=ComparisonReport)
def get_comparison(
    period1_start: date,
    period1_end: date,
    period2_start: date,
    period2_end: date,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    def get_period_stats(start_dt, end_dt):
        days = (end_dt - start_dt).days + 1
        if days <= 0: return 0, 0, 0
        total_cal = 0
        total_water = 0
        total_ex = 0
        for i in range(days):
            d = start_dt + timedelta(days=i)
            s = _get_daily_summary(session, current_user.id, d)
            total_cal += s.calories_consumed
            total_water += s.water_ml
            total_ex += s.exercise_minutes
        return total_cal/days, total_water/days, total_ex

    p1_cal, p1_water, p1_ex = get_period_stats(period1_start, period1_end)
    p2_cal, p2_water, p2_ex = get_period_stats(period2_start, period2_end)
    
    return ComparisonReport(
        period1_start=period1_start,
        period1_end=period1_end,
        period2_start=period2_start,
        period2_end=period2_end,
        p1_avg_calories=p1_cal,
        p2_avg_calories=p2_cal,
        p1_avg_water=p1_water,
        p2_avg_water=p2_water,
        p1_total_exercise=p1_ex,
        p2_total_exercise=p2_ex
    )

@router.get("/score", response_model=HealthScore)
def get_health_score(
    target_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    end = target_date or date.today()
    start = end - timedelta(days=6)
    
    total_cal = 0
    total_water = 0
    days_logged = 0
    
    for i in range(7):
        d = start + timedelta(days=i)
        s = _get_daily_summary(session, current_user.id, d)
        total_cal += s.calories_consumed
        total_water += s.water_ml
        if s.calories_consumed > 0 or s.water_ml > 0:
            days_logged += 1
            
    avg_cal = total_cal / 7
    avg_water = total_water / 7
    
    # Nutrition: 0-40 (giả sử lý tưởng là 2000, dung sai)
    nutrition_score = 40.0 if 1500 <= avg_cal <= 2500 else 20.0
    # Water: 0-30 (lý tưởng >= 2000)
    water_score = 30.0 if avg_water >= 2000 else (avg_water / 2000) * 30
    # Consistency: 0-30 (logged days)
    consistency_score = (days_logged / 7) * 30
    
    return HealthScore(
        date=end,
        total_score=nutrition_score + water_score + consistency_score,
        nutrition_score=nutrition_score,
        water_score=water_score,
        consistency_score=consistency_score
    )

@router.post("/ai-review", response_model=AIReview)
def get_ai_review(
    target_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not GEMINI_API_KEY:
        return AIReview(
            observations=["Chưa cấu hình API Key."],
            recommendations=["Vui lòng thêm GEMINI_API_KEY."]
        )
        
    end = target_date or date.today()
    start = end - timedelta(days=6)
    
    data_str = ""
    for i in range(7):
        d = start + timedelta(days=i)
        s = _get_daily_summary(session, current_user.id, d)
        data_str += f"Ngày {d}: Calo nạp {s.calories_consumed:.0f}, Tập {s.exercise_minutes} phút, Nước {s.water_ml}ml, Ngủ {s.sleep_hours:.1f}h\n"
        
    prompt = f"""
    Bạn là chuyên gia tư vấn sức khoẻ. Dưới đây là dữ liệu 7 ngày của người dùng:
    {data_str}
    
    Dựa vào dữ liệu này, hãy trả về CHÍNH XÁC cấu trúc JSON (không chứa code block hay markdown khác) có 2 mảng:
    - observations: 3 nhận xét ngắn gọn về tình hình tuần qua.
    - recommendations: 3 lời khuyên thiết thực để cải thiện tuần tới.
    """
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        import json
        data = json.loads(text)
        return AIReview(
            observations=data.get("observations", []),
            recommendations=data.get("recommendations", [])
        )
    except Exception as e:
        return AIReview(
            observations=["Lỗi phân tích từ AI."],
            recommendations=["Không thể lấy dữ liệu."]
        )
