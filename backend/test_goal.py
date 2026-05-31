from sqlmodel import Session, create_engine
from app.db.session import engine
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import GoalCreate
from datetime import datetime

with Session(engine) as session:
    user = session.query(User).first()
    if user:
        body = GoalCreate(current_weight=70.0, height=175.0, age=25, gender='male', activity_level='sedentary')
        body_data = body.model_dump(exclude={'daily_calorie_goal'})
        try:
            goal = Goal(user_id=user.id, bmr=1500, tdee=1800, bmi=22, daily_calorie_goal=2000, estimated_days_to_target=None, **body_data)
            session.add(goal)
            session.commit()
            print('Success')
        except Exception as e:
            print(f'Error: {e}')
