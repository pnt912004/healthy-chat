import asyncio
from sqlmodel import create_engine, text
from app.core.config import settings

def main():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';"))
            conn.commit()
            print("Successfully added role column")
        except Exception as e:
            print(f"Error (maybe column already exists): {e}")

if __name__ == "__main__":
    main()
