from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import List
from datetime import datetime, time, timedelta, timezone

from ..db.session import get_session
from ..core.security import get_current_admin
from ..models.user import User
from ..models.chat_message import ChatMessage
from ..models.nutrition_log import NutritionLog
from ..models.water_log import WaterLog
from ..models.health_tip import HealthTip
from ..models.exercise_log import ExerciseLog
from ..models.sleep_log import SleepLog
from ..models.mood_log import MoodLog

from ..schemas.user import UserOut
from ..schemas.admin import DashboardStats, UserUpdateAdmin, AdminReply
from ..schemas.chat import ChatSession, ChatMessageOut
from ..schemas.health_tip import HealthTipOut, HealthTipCreate, HealthTipUpdate

router = APIRouter(tags=["Admin"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    today_start = datetime.combine(datetime.now(timezone.utc).date(), time.min).replace(tzinfo=timezone.utc)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)
    
    total_users = session.exec(select(func.count(User.id))).one()
    new_users_today = session.exec(select(func.count(User.id)).where(User.created_at >= today_start)).one()
    new_users_week = session.exec(select(func.count(User.id)).where(User.created_at >= week_start)).one()
    new_users_month = session.exec(select(func.count(User.id)).where(User.created_at >= month_start)).one()
    
    total_chat_messages = session.exec(select(func.count(ChatMessage.id))).one()
    total_nutrition_logs = session.exec(select(func.count(NutritionLog.id))).one()
    total_water_logs = session.exec(select(func.count(WaterLog.id))).one()
    total_exercise_logs = session.exec(select(func.count(ExerciseLog.id))).one()
    total_sleep_logs = session.exec(select(func.count(SleepLog.id))).one()
    total_mood_logs = session.exec(select(func.count(MoodLog.id))).one()
    
    active_chat_users = session.exec(select(ChatMessage.user_id).where(ChatMessage.created_at >= today_start)).all()
    active_nutrition_users = session.exec(select(NutritionLog.user_id).where(NutritionLog.created_at >= today_start)).all()
    active_water_users = session.exec(select(WaterLog.user_id).where(WaterLog.created_at >= today_start)).all()
    active_exercise_users = session.exec(select(ExerciseLog.user_id).where(ExerciseLog.created_at >= today_start)).all()
    active_sleep_users = session.exec(select(SleepLog.user_id).where(SleepLog.created_at >= today_start)).all()
    active_mood_users = session.exec(select(MoodLog.user_id).where(MoodLog.created_at >= today_start)).all()
    
    active_users_today = len(set(active_chat_users + active_nutrition_users + active_water_users + active_exercise_users + active_sleep_users + active_mood_users))

    return DashboardStats(
        total_users=total_users,
        new_users_today=new_users_today,
        new_users_week=new_users_week,
        new_users_month=new_users_month,
        total_chat_messages=total_chat_messages,
        total_nutrition_logs=total_nutrition_logs,
        total_water_logs=total_water_logs,
        total_exercise_logs=total_exercise_logs,
        total_sleep_logs=total_sleep_logs,
        total_mood_logs=total_mood_logs,
        active_users_today=active_users_today
    )

# Users Management
@router.get("/users", response_model=List[UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    from sqlalchemy import or_
    query = select(User)
    
    if search:
        query = query.where(or_(User.username.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
        
    users = session.exec(query.order_by(User.id.desc()).offset(skip).limit(limit)).all()
    return users

@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_update: UserUpdateAdmin,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    if user.id == current_admin.id:
        if user_update.is_active is not None and user_update.is_active != current_admin.is_active:
            raise HTTPException(status_code=400, detail="Không thể thay đổi trạng thái của chính mình")
        if user_update.role is not None and user_update.role != current_admin.role:
            raise HTTPException(status_code=400, detail="Không thể thay đổi quyền của chính mình")
    
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.role is not None:
        user.role = user_update.role
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Không thể xóa chính mình")
        
    from sqlalchemy import delete
    # Xóa các dữ liệu liên quan để tránh lỗi khóa ngoại (Foreign Key constraint)
    session.exec(delete(ChatMessage).where(ChatMessage.user_id == user_id))
    session.exec(delete(NutritionLog).where(NutritionLog.user_id == user_id))
    session.exec(delete(WaterLog).where(WaterLog.user_id == user_id))
    session.exec(delete(ExerciseLog).where(ExerciseLog.user_id == user_id))
    session.exec(delete(SleepLog).where(SleepLog.user_id == user_id))
    session.exec(delete(MoodLog).where(MoodLog.user_id == user_id))

    session.delete(user)
    session.commit()
    return {"message": "Đã xóa người dùng thành công"}

# Health Tips Management
@router.get("/tips", response_model=List[HealthTipOut])
def get_tips(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    tips = session.exec(select(HealthTip).order_by(HealthTip.id.desc()).offset(skip).limit(limit)).all()
    return tips

@router.post("/tips", response_model=HealthTipOut)
def create_tip(
    tip_in: HealthTipCreate,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    tip = HealthTip(**tip_in.model_dump())
    session.add(tip)
    session.commit()
    session.refresh(tip)
    return tip

@router.put("/tips/{tip_id}", response_model=HealthTipOut)
def update_tip(
    tip_id: int,
    tip_in: HealthTipUpdate,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    tip = session.get(HealthTip, tip_id)
    if not tip:
        raise HTTPException(status_code=404, detail="Health Tip không tồn tại")
    
    update_data = tip_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tip, key, value)
        
    session.add(tip)
    session.commit()
    session.refresh(tip)
    return tip

@router.delete("/tips/{tip_id}")
def delete_tip(
    tip_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    tip = session.get(HealthTip, tip_id)
    if not tip:
        raise HTTPException(status_code=404, detail="Health Tip không tồn tại")
        
    session.delete(tip)
    session.commit()
    return {"message": "Đã xóa Health Tip thành công"}

# Admin Chats
@router.get("/chats", response_model=List[ChatSession])
def get_admin_chats(
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    messages = session.exec(
        select(ChatMessage).where(ChatMessage.session_id.startswith("admin_")).order_by(ChatMessage.created_at)
    ).all()
    
    sessions_map = {}
    for msg in messages:
        if msg.session_id not in sessions_map:
            sessions_map[msg.session_id] = {
                "session_id": msg.session_id,
                "message_count": 0,
                "unread_count": 0,
            }
        # Update preview and created_at to the latest message (since messages are ordered by ASC)
        sessions_map[msg.session_id]["preview"] = msg.content[:80]
        sessions_map[msg.session_id]["created_at"] = msg.created_at
        sessions_map[msg.session_id]["message_count"] += 1
        if msg.role == "user" and not msg.is_read:
            sessions_map[msg.session_id]["unread_count"] += 1
        
    result = [ChatSession(**v) for v in sessions_map.values()]
    result.sort(key=lambda x: x.created_at, reverse=True)
    return result

@router.get("/chats/{session_id}", response_model=List[ChatMessageOut])
def get_admin_chat_history(
    session_id: str,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    messages = session.exec(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    ).all()
    return messages

@router.post("/chats/reply", response_model=ChatMessageOut)
def admin_reply_chat(
    body: AdminReply,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    # Infer user_id from the existing session to prevent foreign key errors
    first_msg = session.exec(
        select(ChatMessage).where(ChatMessage.session_id == body.session_id).order_by(ChatMessage.created_at)
    ).first()
    
    if not first_msg:
        raise HTTPException(status_code=404, detail="Session không tồn tại")

    msg = ChatMessage(
        user_id=first_msg.user_id,
        session_id=body.session_id,
        role="admin",
        content=body.message
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg

@router.get("/chats/unread")
def get_admin_unread_count(
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    from sqlalchemy import func
    count = session.exec(
        select(func.count(ChatMessage.id)).where(
            ChatMessage.session_id.startswith("admin_"),
            ChatMessage.role == "user",
            ChatMessage.is_read == False
        )
    ).one()
    return {"unread_count": count}

@router.post("/chats/read/{session_id}")
def mark_admin_chat_read(
    session_id: str,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    from sqlmodel import update
    session.exec(
        update(ChatMessage).where(
            ChatMessage.session_id == session_id,
            ChatMessage.role == "user",
            ChatMessage.is_read == False
        ).values(is_read=True)
    )
    session.commit()
    return {"message": "Đã đánh dấu đọc"}

# Foods Management
from ..models.food import Food
from ..schemas.food import FoodCreate, FoodOut

@router.get("/foods", response_model=List[FoodOut])
def get_admin_foods(
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    is_verified: bool | None = None,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    from sqlalchemy import or_
    query = select(Food)
    if search:
        query = query.where(or_(Food.name.ilike(f"%{search}%"), Food.name_en.ilike(f"%{search}%")))
    if is_verified is not None:
        query = query.where(Food.is_verified == is_verified)
        
    foods = session.exec(query.order_by(Food.id.desc()).offset(skip).limit(limit)).all()
    return foods

@router.post("/foods", response_model=FoodOut)
def create_admin_food(
    food_in: FoodCreate,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    food = Food(**food_in.model_dump(), is_verified=True, source="admin")
    session.add(food)
    session.commit()
    session.refresh(food)
    return food

@router.put("/foods/{food_id}", response_model=FoodOut)
def update_admin_food(
    food_id: int,
    food_in: FoodCreate,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    food = session.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food không tồn tại")
        
    update_data = food_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(food, key, value)
        
    session.add(food)
    session.commit()
    session.refresh(food)
    return food

@router.delete("/foods/{food_id}")
def delete_admin_food(
    food_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    food = session.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food không tồn tại")
        
    from sqlalchemy import delete
    from ..models.favorite_food import FavoriteFood
    session.exec(delete(FavoriteFood).where(FavoriteFood.food_id == food_id))
    
    session.delete(food)
    session.commit()
    return {"message": "Đã xóa Food thành công"}

@router.patch("/foods/{food_id}/verify", response_model=FoodOut)
def verify_admin_food(
    food_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin)
):
    food = session.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food không tồn tại")
        
    food.is_verified = True
    session.add(food)
    session.commit()
    session.refresh(food)
    return food
