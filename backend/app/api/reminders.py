from typing import Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..models.reminder_setting import ReminderSetting
from ..models.notification import Notification
from ..models.water_log import WaterLog
from ..models.nutrition_log import NutritionLog
from ..models.exercise_log import ExerciseLog
from ..schemas.notification import ReminderSettingOut, ReminderSettingCreate
from ..core.security import get_current_user

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.get("/settings", response_model=ReminderSettingOut)
def get_settings(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    setting = session.exec(
        select(ReminderSetting).where(ReminderSetting.user_id == current_user.id)
    ).first()
    
    if not setting:
        setting = ReminderSetting(user_id=current_user.id)
        session.add(setting)
        session.commit()
        session.refresh(setting)
        
    return setting

@router.put("/settings", response_model=ReminderSettingOut)
def update_settings(
    data: ReminderSettingCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    setting = session.exec(
        select(ReminderSetting).where(ReminderSetting.user_id == current_user.id)
    ).first()
    
    if not setting:
        setting = ReminderSetting(user_id=current_user.id)
        
    if data.water_reminder is not None: setting.water_reminder = data.water_reminder
    if data.water_interval_hours is not None: setting.water_interval_hours = data.water_interval_hours
    if data.meal_reminder is not None: setting.meal_reminder = data.meal_reminder
    if data.exercise_reminder is not None: setting.exercise_reminder = data.exercise_reminder
    if data.weekly_report is not None: setting.weekly_report = data.weekly_report
    if data.quiet_hours_start is not None: setting.quiet_hours_start = data.quiet_hours_start
    if data.quiet_hours_end is not None: setting.quiet_hours_end = data.quiet_hours_end
    
    session.add(setting)
    session.commit()
    session.refresh(setting)
    return setting

@router.post("/check")
def check_reminders(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Kiểm tra và tạo thông báo nếu cần thiết"""
    setting = session.exec(
        select(ReminderSetting).where(ReminderSetting.user_id == current_user.id)
    ).first()
    
    if not setting:
        setting = ReminderSetting(user_id=current_user.id)
        session.add(setting)
        session.commit()
        
    now = datetime.now()
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    
    # Check quiet hours logic (simplified)
    # Nếu đang trong giờ quiet hours thì không gửi thông báo (tùy chọn)
    
    new_notifications = 0
    
    # 1. Check Water
    if setting.water_reminder:
        last_water = session.exec(
            select(WaterLog)
            .where(WaterLog.user_id == current_user.id, WaterLog.logged_at >= start_of_day)
            .order_by(WaterLog.logged_at.desc())
        ).first()
        
        last_water_time = last_water.logged_at if last_water else start_of_day
        hours_since_water = (now - last_water_time).total_seconds() / 3600
        
        if hours_since_water >= setting.water_interval_hours:
            # Create notification
            # To avoid spamming, check if we already reminded in the last interval
            last_water_notif = session.exec(
                select(Notification)
                .where(Notification.user_id == current_user.id, Notification.type == "water")
                .order_by(Notification.created_at.desc())
            ).first()
            
            hours_since_notif = (now - last_water_notif.created_at).total_seconds() / 3600 if last_water_notif else 999
            
            if hours_since_notif >= setting.water_interval_hours:
                notif = Notification(
                    user_id=current_user.id,
                    type="water",
                    title="Nhắc nhở uống nước 💧",
                    content=f"Đã {setting.water_interval_hours} tiếng bạn chưa uống nước. Hãy bổ sung ngay nhé!",
                    action_url="/water"
                )
                session.add(notif)
                new_notifications += 1
                
    # 2. Check Exercise
    if setting.exercise_reminder and now.hour >= 17:
        has_exercise = session.exec(
            select(ExerciseLog)
            .where(ExerciseLog.user_id == current_user.id, ExerciseLog.logged_at >= start_of_day)
        ).first()
        
        if not has_exercise:
            last_ex_notif = session.exec(
                select(Notification)
                .where(
                    Notification.user_id == current_user.id, 
                    Notification.type == "exercise",
                    Notification.created_at >= start_of_day
                )
            ).first()
            
            if not last_ex_notif:
                notif = Notification(
                    user_id=current_user.id,
                    type="exercise",
                    title="Nhắc nhở tập luyện 🏋️",
                    content="Hôm nay bạn chưa có hoạt động thể chất nào. Dành chút thời gian tập luyện nhé!",
                    action_url="/exercise"
                )
                session.add(notif)
                new_notifications += 1
                
    if new_notifications > 0:
        session.commit()
        
    return {"message": "Checked", "new_notifications": new_notifications}
