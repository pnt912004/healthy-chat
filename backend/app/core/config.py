from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthyChat AI"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/healthychat"

    # JWT
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_USE_A_LONG_RANDOM_STRING"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 ngày

    # Gemini
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
