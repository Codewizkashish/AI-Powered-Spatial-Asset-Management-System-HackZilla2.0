from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str
    
    # AI / LLM Keys
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # Graph Database (Phase 2+)
    NEO4J_URI: Optional[str] = None
    NEO4J_USER: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None
    
    # YOLOv8 Configuration
    YOLOV8_MODEL_PATH: str = "yolov8n-seg.pt"  # Make sure this matches the model you are using
    YOLOV8_CONFIDENCE_THRESHOLD: float = 0.5
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # This tells Pydantic to read the .env file and ignore any extra variables
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()