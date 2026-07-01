import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..models.goal import Goal
from ..schemas.goal import GoalCreate, GoalOut, TDEERequest, TDEEResult
from ..core.security import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])

# ─── Hệ số hoạt động ─────────────────────────────────────────────────────────
ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "lightly_active": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

BMI_STATUS = [
    (18.5, "Thiếu cân"),
    (25.0, "Bình thường"),
    (30.0, "Thừa cân"),
    (float("inf"), "Béo phì"),
]


def _calculate_tdee(weight: float, height: float, age: int, gender: str, activity: str, body_fat: Optional[float] = None):
    if body_fat and body_fat > 0:
        # Katch-McArdle formula
        lbm = weight * (1 - body_fat / 100.0)
        bmr = 370 + (21.6 * lbm)
    else:
        # Mifflin-St Jeor formula
        if gender == "female":
            bmr = 10 * weight + 6.25 * height - 5 * age - 161
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age + 5

    multiplier = ACTIVITY_MULTIPLIERS.get(activity, 1.2)
    tdee = bmr * multiplier
    if height > 0:
        bmi = weight / ((height / 100) ** 2)
    else:
        bmi = 0.0

    status = "Bình thường"
    if bmi > 0:
        status = next((label for limit, label in BMI_STATUS if bmi < limit), "Béo phì")
        
    return round(bmr, 1), round(tdee, 1), round(bmi, 1), status


@router.post("/calculate-tdee", response_model=TDEEResult)
def calculate_tdee(body: TDEERequest):
    bmr, tdee, bmi, bmi_status = _calculate_tdee(
        body.current_weight, body.height, body.age, body.gender, body.activity_level, body.body_fat_percentage
    )
    # Tính thâm hụt/dư thừa nếu có target_weight
    deficit = 0.0
    estimated_days = None
    rate = body.weekly_goal_rate if body.weekly_goal_rate else 0.5
    
    if body.target_weight:
        if body.target_weight < body.current_weight:
            deficit = rate * 1100.0
            weight_diff = body.current_weight - body.target_weight
            estimated_days = int((weight_diff * 7700) / deficit) if deficit > 0 else 0
        elif body.target_weight > body.current_weight:
            deficit = -(rate * 1100.0)
            weight_diff = body.target_weight - body.current_weight
            estimated_days = int((weight_diff * 7700) / abs(deficit)) if deficit < 0 else 0

    daily_goal = tdee - deficit
    return TDEEResult(
        bmr=bmr,
        tdee=tdee,
        bmi=bmi,
        bmi_status=bmi_status,
        daily_calorie_goal=round(daily_goal, 1),
        calorie_deficit=deficit,
        estimated_days_to_target=estimated_days,
    )


logger = logging.getLogger(__name__)

@router.get("/me", response_model=Optional[GoalOut])
def get_goal(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    goal = session.exec(select(Goal).where(Goal.user_id == current_user.id)).first()
    return goal


@router.put("/me", response_model=GoalOut)
def upsert_goal(
    body: GoalCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        goal = session.exec(select(Goal).where(Goal.user_id == current_user.id)).first()

        # Tính TDEE tự động
        bmr, tdee, bmi, _ = _calculate_tdee(
            body.current_weight, body.height, body.age, body.gender, body.activity_level, body.body_fat_percentage
        )
        deficit = 0.0
        estimated_days = None
        rate = body.weekly_goal_rate if body.weekly_goal_rate else 0.5
        
        if body.target_weight:
            if body.target_weight < body.current_weight:
                deficit = rate * 1100.0
                weight_diff = body.current_weight - body.target_weight
                estimated_days = int((weight_diff * 7700) / deficit) if deficit > 0 else 0
            elif body.target_weight > body.current_weight:
                deficit = -(rate * 1100.0)
                weight_diff = body.target_weight - body.current_weight
                estimated_days = int((weight_diff * 7700) / abs(deficit)) if deficit < 0 else 0
            
        calculated_daily_goal = tdee - deficit
        daily_goal = body.daily_calorie_goal if body.daily_calorie_goal is not None else calculated_daily_goal

        if goal:
            # Cập nhật chỉ các field input từ user (loại bỏ daily_calorie_goal vì sẽ gán riêng)
            for key, val in body.model_dump(exclude={"daily_calorie_goal"}).items():
                setattr(goal, key, val)
            goal.bmr = bmr
            goal.tdee = tdee
            goal.bmi = bmi
            goal.daily_calorie_goal = round(daily_goal, 1)
            goal.estimated_days_to_target = estimated_days
            goal.updated_at = datetime.now(timezone.utc)
        else:
            body_data = body.model_dump(exclude={"daily_calorie_goal"})
            goal = Goal(
                user_id=current_user.id,
                bmr=bmr, tdee=tdee, bmi=bmi,
                daily_calorie_goal=round(daily_goal, 1),
                estimated_days_to_target=estimated_days,
                **body_data
            )

        session.add(goal)
        session.commit()
        session.refresh(goal)
        return goal
    except Exception as e:
        logger.exception(f"Error upserting goal for user {current_user.id}: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu mục tiêu: {str(e)}")
