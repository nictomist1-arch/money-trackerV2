from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    POSTGRES_USER: str = "postgres"  
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "moneytracker"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    APP_NAME: str = "MoneyTracker API"
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:3000"  
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False
    }