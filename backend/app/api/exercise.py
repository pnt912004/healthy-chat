from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func

from ..db.session import get_session
from ..models.user import User
from ..models.exercise_log import ExerciseLog
from ..schemas.exercise import (
    ExerciseLogCreate,
    ExerciseLogOut,
    ExerciseSummary,
    ExerciseWeekly,
    ExerciseDayBar,
    ExerciseRange
)
from ..core.security import get_current_user
from ..models.goal import Goal

router = APIRouter(prefix="/exercise", tags=["Exercise Tracker"])

CALORIES_PER_MINUTE = {
    "Chạy bộ": {"low": 8.0, "moderate": 11.0, "high": 15.0},
    "Đạp xe": {"low": 5.0, "moderate": 8.0, "high": 12.0},
    "Yoga": {"low": 3.0, "moderate": 4.0, "high": 5.0},
    "Gym": {"low": 4.0, "moderate": 6.0, "high": 8.0},
    "Bơi": {"low": 6.0, "moderate": 8.0, "high": 11.0},
    "Đi bộ": {"low": 3.5, "moderate": 5.0, "high": 7.0},
    "HIIT": {"low": 9.0, "moderate": 12.0, "high": 15.0},
    "Cầu lông": {"low": 5.0, "moderate": 7.0, "high": 9.0},
}
DEFAULT_CALORIES_PER_MINUTE = {"low": 4.0, "moderate": 6.0, "high": 8.0}

DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

def _day_range(day: date):
    start = datetime.combine(day, datetime.min.time())
    end   = datetime.combine(day, datetime.max.time())
    return start, end

def _calculate_calories(exercise_type: str, intensity: str, duration_minutes: int, weight: float) -> float:
    rates = CALORIES_PER_MINUTE.get(exercise_type, DEFAULT_CALORIES_PER_MINUTE)
    rate = rates.get(intensity.lower(), rates["moderate"])
    adjusted_rate = rate * (weight / 70.0) if weight else rate
    return adjusted_rate * duration_minutes

@router.get("/logs", response_model=List[ExerciseLogOut])
def get_logs(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    start, end = _day_range(target)
    logs = session.exec(
        select(ExerciseLog).where(
            ExerciseLog.user_id == current_user.id,
            ExerciseLog.logged_at >= start,
            ExerciseLog.logged_at <= end,
        ).order_by(ExerciseLog.logged_at)
    ).all()
    return logs

@router.post("/logs", response_model=ExerciseLogOut, status_code=201)
def add_log(
    body: ExerciseLogCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not 0 < body.duration_minutes <= 480:
        raise HTTPException(status_code=400, detail="Thời gian tập không hợp lệ (1-480 phút)")
        
    calories = body.calories_burned
    if calories is None:
        goal = session.exec(select(Goal).where(Goal.user_id == current_user.id)).first()
        weight = goal.current_weight if goal and goal.current_weight else 70.0
        calories = _calculate_calories(body.exercise_type, body.intensity, body.duration_minutes, weight)

    log = ExerciseLog(
        user_id=current_user.id,
        exercise_type=body.exercise_type,
        duration_minutes=body.duration_minutes,
        intensity=body.intensity,
        calories_burned=calories,
        notes=body.notes,
        logged_at=body.logged_at or datetime.now(),
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return log

@router.delete("/logs/{log_id}")
def delete_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    log = session.get(ExerciseLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhật ký bài tập")
    session.delete(log)
    session.commit()
    return {"message": "Đã xoá"}

@router.get("/summary", response_model=ExerciseSummary)
def get_summary(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    start, end = _day_range(target)

    logs = session.exec(
        select(ExerciseLog).where(
            ExerciseLog.user_id == current_user.id,
            ExerciseLog.logged_at >= start,
            ExerciseLog.logged_at <= end,
        )
    ).all()

    total_minutes = sum(l.duration_minutes for l in logs)
    total_calories = sum(l.calories_burned for l in logs)
    
    return ExerciseSummary(
        total_minutes=total_minutes,
        total_calories_burned=total_calories,
        count=len(logs)
    )

@router.get("/weekly", response_model=ExerciseWeekly)
def get_weekly(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    monday = target - timedelta(days=target.weekday())

    week_bars: List[ExerciseDayBar] = []
    total_weekly_calories = 0.0
    total_weekly_minutes = 0

    for i in range(7):
        day = monday + timedelta(days=i)
        start, end = _day_range(day)
        
        day_logs = session.exec(
            select(ExerciseLog).where(
                ExerciseLog.user_id == current_user.id,
                ExerciseLog.logged_at >= start,
                ExerciseLog.logged_at <= end,
            )
        ).all()
        
        day_cal = sum(l.calories_burned for l in day_logs)
        day_min = sum(l.duration_minutes for l in day_logs)
        
        week_bars.append(ExerciseDayBar(
            date=str(day),
            calories_burned=day_cal,
            duration_minutes=day_min,
        ))
        
        total_weekly_calories += day_cal
        total_weekly_minutes += day_min

    return ExerciseWeekly(
        days=week_bars,
        total_weekly_calories=total_weekly_calories,
        total_weekly_minutes=total_weekly_minutes
    )

@router.get("/range", response_model=ExerciseRange)
def get_range(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    start = datetime.combine(start_date, datetime.min.time())
    end = datetime.combine(end_date, datetime.max.time())
    
    logs = session.exec(
        select(ExerciseLog).where(
            ExerciseLog.user_id == current_user.id,
            ExerciseLog.logged_at >= start,
            ExerciseLog.logged_at <= end,
        )
    ).all()
    
    daily_data = {}
    total_calories = 0.0
    total_minutes = 0
    
    for l in logs:
        d = str(l.logged_at.date())
        if d not in daily_data:
            daily_data[d] = {"date": d, "calories_burned": 0.0, "duration_minutes": 0}
        daily_data[d]["calories_burned"] += l.calories_burned
        daily_data[d]["duration_minutes"] += l.duration_minutes
        total_calories += l.calories_burned
        total_minutes += l.duration_minutes
        
    days = [ExerciseDayBar(**data) for data in daily_data.values()]
    days.sort(key=lambda x: x.date)
        
    return ExerciseRange(
        days=days,
        total_calories=total_calories,
        total_minutes=total_minutes
    )
