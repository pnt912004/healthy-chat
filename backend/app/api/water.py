from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func

from ..db.session import get_session
from ..models.user import User
from ..models.water_log import WaterLog
from ..schemas.water import WaterLogCreate, WaterLogOut, WaterSummary, WaterWeekly, WaterDayBar
from ..core.security import get_current_user

router = APIRouter(prefix="/water", tags=["Water Tracker"])

WATER_GOAL_ML = 2500  # mặc định 2.5L

DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]


def _day_range(day: date):
    start = datetime.combine(day, datetime.min.time())
    end   = datetime.combine(day, datetime.max.time())
    return start, end


def _total_for_day(session: Session, user_id: int, day: date) -> int:
    start, end = _day_range(day)
    result = session.exec(
        select(func.sum(WaterLog.amount_ml)).where(
            WaterLog.user_id == user_id,
            WaterLog.logged_at >= start,
            WaterLog.logged_at <= end,
        )
    ).first()
    return result or 0


@router.get("/logs", response_model=List[WaterLogOut])
def get_logs(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    start, end = _day_range(target)
    logs = session.exec(
        select(WaterLog).where(
            WaterLog.user_id == current_user.id,
            WaterLog.logged_at >= start,
            WaterLog.logged_at <= end,
        ).order_by(WaterLog.logged_at)
    ).all()
    return logs


@router.post("/logs", response_model=WaterLogOut, status_code=201)
def add_log(
    body: WaterLogCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    log = WaterLog(
        user_id=current_user.id,
        amount_ml=body.amount_ml,
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
    log = session.get(WaterLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhật ký nước")
    session.delete(log)
    session.commit()
    return {"message": "Đã xoá"}


@router.get("/summary", response_model=WaterSummary)
def get_summary(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    start, end = _day_range(target)

    logs = session.exec(
        select(WaterLog).where(
            WaterLog.user_id == current_user.id,
            WaterLog.logged_at >= start,
            WaterLog.logged_at <= end,
        ).order_by(WaterLog.logged_at)
    ).all()

    total = sum(l.amount_ml for l in logs)
    pct   = min(round(total / WATER_GOAL_ML * 100), 100)

    # Tính streak
    streak = 0
    check_day = target
    while True:
        day_total = _total_for_day(session, current_user.id, check_day)
        if day_total >= WATER_GOAL_ML:
            streak += 1
            check_day -= timedelta(days=1)
        else:
            break

    last_log = logs[-1].logged_at if logs else None

    return WaterSummary(
        date=str(target),
        total_ml=total,
        goal_ml=WATER_GOAL_ML,
        pct=pct,
        streak_days=streak,
        last_log_at=last_log,
        logs=[WaterLogOut.model_validate(l) for l in logs],
    )


@router.get("/weekly", response_model=WaterWeekly)
def get_weekly(
    log_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target = log_date or date.today()
    # Tính ngày đầu tuần (Thứ 2)
    monday = target - timedelta(days=target.weekday())

    week_bars: List[WaterDayBar] = []
    for i in range(7):
        day = monday + timedelta(days=i)
        total = _total_for_day(session, current_user.id, day)
        pct   = min(round(total / WATER_GOAL_ML * 100), 100)
        week_bars.append(WaterDayBar(
            date=str(day),
            day_label=DAY_LABELS[i],
            total_ml=total,
            goal_ml=WATER_GOAL_ML,
            pct=pct,
        ))

    return WaterWeekly(week=week_bars, goal_ml=WATER_GOAL_ML)

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
        select(WaterLog).where(
            WaterLog.user_id == current_user.id,
            WaterLog.logged_at >= start,
            WaterLog.logged_at <= end,
        )
    ).all()
    
    daily_data = {}
    for l in logs:
        d = str(l.logged_at.date())
        if d not in daily_data:
            daily_data[d] = {"date": d, "total_ml": 0}
        daily_data[d]["total_ml"] += l.amount_ml
        
    return list(daily_data.values())
