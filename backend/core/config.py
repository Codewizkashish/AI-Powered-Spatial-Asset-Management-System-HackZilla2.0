from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    
    # Optional settings (Phase 2+)
    NEO4J_URI: Optional[str] = None
    NEO4J_USER: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None
    
    # YOLOv8 Configuration
    YOLOV8_MODEL_PATH: str = "yolov8l-seg.pt"
    YOLOV8_CONFIDENCE_THRESHOLD: float = 0.5
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    class Config:
        env_file = ".env"

settings = Settings()