from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "FlowCare API"
    DATABASE_URL: str = "postgresql://postgres:amogh@localhost:5432/flowcare"
    REDIS_URL: str = "redis://localhost:6379/0"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
    
    SECRET_KEY: str = "placeholder_will_be_overridden_by_env"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # 1 week

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", ".env"),
        extra="ignore"
    )

settings = Settings()
