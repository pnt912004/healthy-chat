from sqlmodel import create_engine, Session, SQLModel
from ..core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)


def init_db():
    # Import tất cả models để SQLModel nhận biết và tạo bảng
    from ..models import (  # noqa: F401
        User, Goal, NutritionLog, WaterLog, ChatMessage, HealthTip,
        ExerciseLog, SleepLog, MoodLog, Food, FavoriteFood,
        Notification, ReminderSetting
    )
    SQLModel.metadata.create_all(engine)

    from sqlmodel import text
    try:
        with Session(engine) as session:
            session.exec(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;"))
            session.commit()
    except Exception:
        pass

    # Seed data nếu cần
    with Session(engine) as session:
        from sqlmodel import select
        from ..core.security import hash_password

        # Seed admin
        admin_user = session.exec(select(User).where(User.username == "admin")).first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@healthychat.com",
                hashed_password=hash_password("Admin@123"),
                first_name="Super",
                last_name="Admin",
                role="admin",
                is_verified=True
            )
            session.add(admin_user)
            session.commit()
        else:
            if not admin_user.is_verified:
                admin_user.is_verified = True
                session.add(admin_user)
                session.commit()

        if not session.exec(select(HealthTip)).first():
            tips = [
                HealthTip(category="Dinh dưỡng", icon="restaurant", content="Đi bộ 10 phút sau bữa ăn giúp điều hoà đường huyết và cải thiện tiêu hoá đáng kể."),
                HealthTip(category="Nước", icon="water_drop", content="Uống một ly nước ngay sau khi thức dậy giúp kích hoạt các cơ quan nội tạng và bù nước cho cơ thể."),
                HealthTip(category="Giấc ngủ", icon="bedtime", content="Hạn chế sử dụng thiết bị điện tử 30 phút trước khi ngủ để cải thiện chất lượng giấc ngủ."),
                HealthTip(category="Vận động", icon="fitness_center", content="Đứng dậy và vươn vai mỗi 45 phút làm việc giúp giảm căng thẳng cho cột sống và mắt."),
                HealthTip(category="Tâm lý", icon="psychology", content="Dành 5 phút thiền định mỗi sáng giúp bạn giữ bình tĩnh và tập trung tốt hơn trong cả ngày."),
            ]
            for t in tips:
                session.add(t)
            session.commit()

        # Seed foods
        import sys
        import os
        # Need to append the parent dir to import seed_foods
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.abspath(os.path.join(current_dir, "../../"))
        if backend_dir not in sys.path:
            sys.path.append(backend_dir)
            
        try:
            from seed_foods import run_seed
            run_seed()
        except Exception as e:
            print("Failed to seed foods:", e)


def get_session():
    with Session(engine) as session:
        yield session
