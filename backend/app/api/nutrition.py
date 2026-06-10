from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..models.goal import Goal
from ..models.nutrition_log import NutritionLog
from ..schemas.nutrition import NutritionLogCreate, NutritionLogOut, NutritionSummary
from ..core.security import get_current_user

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


def _get_day_range(day: date):
    start = datetime.combine(day, datetime.min.time())
    end = datetime.combine(day, datetime.max.time())
    return start, end


@router.get("/logs", response_model=List[NutritionLogOut])
def get_logs(
    log_date: Optional[date] = Query(default=None, description="YYYY-MM-DD, mặc định hôm nay"),
    meal_type: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target_date = log_date or date.today()
    start, end = _get_day_range(target_date)

    stmt = select(NutritionLog).where(
        NutritionLog.user_id == current_user.id,
        NutritionLog.logged_at >= start,
        NutritionLog.logged_at <= end,
    )
    if meal_type:
        stmt = stmt.where(NutritionLog.meal_type == meal_type)

    logs = session.exec(stmt.order_by(NutritionLog.logged_at)).all()
    return logs


@router.post("/logs", response_model=NutritionLogOut, status_code=201)
def add_log(
    body: NutritionLogCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    log = NutritionLog(
        user_id=current_user.id,
        logged_at=body.logged_at or datetime.now(),
        **body.model_dump(exclude={"logged_at"}),
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return log


@router.put("/logs/{log_id}", response_model=NutritionLogOut)
def update_log(
    log_id: int,
    body: NutritionLogCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    log = session.get(NutritionLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhật ký")
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)
        
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
    log = session.get(NutritionLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhật ký")
    session.delete(log)
    session.commit()
    return {"message": "Đã xoá nhật ký"}


@router.get("/summary", response_model=NutritionSummary)
def get_summary(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target_date = log_date or date.today()
    start, end = _get_day_range(target_date)

    logs = session.exec(
        select(NutritionLog).where(
            NutritionLog.user_id == current_user.id,
            NutritionLog.logged_at >= start,
            NutritionLog.logged_at <= end,
        )
    ).all()

    total_calories = sum(l.calories for l in logs)
    total_protein  = sum(l.protein or 0 for l in logs)
    total_carbs    = sum(l.carbs or 0 for l in logs)
    total_fat      = sum(l.fat or 0 for l in logs)

    # Lấy calorie goal
    goal = session.exec(select(Goal).where(Goal.user_id == current_user.id)).first()
    goal_cal = goal.daily_calorie_goal if goal else None

    return NutritionSummary(
        date=str(target_date),
        total_calories=round(total_calories, 1),
        total_protein=round(total_protein, 1),
        total_carbs=round(total_carbs, 1),
        total_fat=round(total_fat, 1),
        goal_calories=goal_cal,
        remaining_calories=round(goal_cal - total_calories, 1) if goal_cal else None,
        logs=[NutritionLogOut.model_validate(l) for l in logs],
    )


DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

@router.get("/weekly", response_model=None)
def get_weekly(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    from ..schemas.nutrition import NutritionWeekly, NutritionDayBar
    from sqlalchemy import func
    
    target = log_date or date.today()
    monday = target - timedelta(days=target.weekday())
    
    goal = session.exec(select(Goal).where(Goal.user_id == current_user.id)).first()
    goal_cal = goal.daily_calorie_goal if goal else 2000.0

    week_bars = []
    for i in range(7):
        day = monday + timedelta(days=i)
        start, end = _get_day_range(day)
        
        logs = session.exec(
            select(NutritionLog).where(
                NutritionLog.user_id == current_user.id,
                NutritionLog.logged_at >= start,
                NutritionLog.logged_at <= end,
            )
        ).all()
        
        total_cal = sum(l.calories for l in logs)
        total_pro = sum(l.protein or 0 for l in logs)
        total_carbs = sum(l.carbs or 0 for l in logs)
        total_fat = sum(l.fat or 0 for l in logs)
        
        week_bars.append(NutritionDayBar(
            date=str(day),
            day_label=DAY_LABELS[i],
            total_calories=round(total_cal, 1),
            goal_calories=round(goal_cal, 1),
            total_protein=round(total_pro, 1),
            total_carbs=round(total_carbs, 1),
            total_fat=round(total_fat, 1),
        ))

    return NutritionWeekly(week=week_bars, goal_calories=round(goal_cal, 1))

@router.get("/range")
def get_range(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    start = datetime.combine(start_date, datetime.min.time())
    end = datetime.combine(end_date, datetime.max.time())
    
    logs = session.exec(
        select(NutritionLog).where(
            NutritionLog.user_id == current_user.id,
            NutritionLog.logged_at >= start,
            NutritionLog.logged_at <= end,
        )
    ).all()
    
    daily_data = {}
    for l in logs:
        d = str(l.logged_at.date())
        if d not in daily_data:
            daily_data[d] = {"date": d, "calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        daily_data[d]["calories"] += l.calories
        daily_data[d]["protein"] += l.protein or 0
        daily_data[d]["carbs"] += l.carbs or 0
        daily_data[d]["fat"] += l.fat or 0
        
    # Làm tròn
    for d in daily_data.values():
        d["calories"] = round(d["calories"], 1)
        d["protein"] = round(d["protein"], 1)
        d["carbs"] = round(d["carbs"], 1)
        d["fat"] = round(d["fat"], 1)
        
    return list(daily_data.values())
