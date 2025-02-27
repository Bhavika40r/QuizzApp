from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database settings
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_NAME: str = os.getenv("DB_NAME", "quiz_app")
    
    # JWT Settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60  # As per requirements: 60 minutes
    
    # Application Settings
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Rate Limiting
    RATE_LIMIT_PER_SECOND: int = 100  # As per requirements: 100 requests per second
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")  # Redis for rate limiting

settings = Settings()