from sqlmodel import create_engine, text
from app.db.session import engine

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE goals ADD COLUMN body_fat_percentage FLOAT;"))
        conn.commit()
    except Exception as e: print(e)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE goals ADD COLUMN weekly_goal_rate FLOAT DEFAULT 0.5;"))
        conn.commit()
    except Exception as e: print(e)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE goals ADD COLUMN estimated_days_to_target INTEGER;"))
        conn.commit()
    except Exception as e: print(e)

print("Done")
