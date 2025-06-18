"""
Configuration settings for Open Denkaru EMR.
"""
from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "Open Denkaru EMR"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes for high security
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "RS256"  # Using RS256 instead of HS256
    
    # Authentication
    MFA_REQUIRED: bool = False  # Set to True to require MFA for all users
    PASSWORD_MIN_LENGTH: int = 14
    PASSWORD_HISTORY_COUNT: int = 8
    ACCOUNT_LOCKOUT_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_DURATION_MINUTES: int = 30
    SESSION_TIMEOUT_MINUTES: int = 15
    MAX_CONCURRENT_SESSIONS: int = 2
    
    # Argon2 settings (OWASP recommended)
    ARGON2_MEMORY_COST: int = 19456  # 19 MiB
    ARGON2_TIME_COST: int = 2
    ARGON2_PARALLELISM: int = 1
    
    # Database
    DATABASE_URL: str = Field(..., description="PostgreSQL database URL")
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis
    REDIS_URL: str = Field(..., description="Redis URL for caching")
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Medical specific
    CLINIC_NAME: str = "Open Denkaru Clinic"
    CLINIC_CODE: str = "DENKARU001"
    TIMEZONE: str = "Asia/Tokyo"
    
    # File storage
    STORAGE_PATH: str = "/app/storage"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # External services
    ORCA_API_URL: Optional[str] = None
    ORCA_API_KEY: Optional[str] = None
    
    @property 
    def cors_origins_list(self) -> List[str]:
        return [i.strip() for i in self.CORS_ORIGINS.split(",")]
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        return [i.strip() for i in self.ALLOWED_HOSTS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()