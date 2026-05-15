import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from core.database import Base


def new_uuid() -> str:
    return str(uuid.uuid4())


class Image(Base):
    __tablename__ = "images"

    id = Column(String(36), primary_key=True, default=new_uuid)
    image_url = Column(Text, nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    source_type = Column(String(50), default="user_upload", nullable=False)

    assets = relationship("DetectedAsset", back_populates="image")


class DetectedAsset(Base):
    __tablename__ = "detected_assets"

    id = Column(String(36), primary_key=True, default=new_uuid)
    image_id = Column(String(36), ForeignKey("images.id"), nullable=False)
    asset_category = Column(String(80), nullable=False)
    confidence_score = Column(Float, default=0.0, nullable=False)
    area_sqm = Column(Float, default=0.0, nullable=False)
    geom = Column(Text, nullable=True)

    image = relationship("Image", back_populates="assets")
    warnings = relationship("Warning", back_populates="asset")


class Warning(Base):
    __tablename__ = "warnings"

    id = Column(String(36), primary_key=True, default=new_uuid)
    asset_id = Column(String(36), ForeignKey("detected_assets.id"), nullable=False)
    issue_type = Column(String(120), nullable=False)
    severity = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    asset = relationship("DetectedAsset", back_populates="warnings")
