"""
Public User Upload & Analysis Routes
POST /api/v1/public/analyze - Image upload and YOLOv8 inference
POST /api/v1/public/chat - Natural language queries about detected assets
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.vision_engine import process_image
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    image_id: Optional[UUID] = None

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Receives an uploaded image, runs YOLOv8 segmentation, 
    and returns detected assets with polygon coordinates.
    """
    # 1. Validate it is actually an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        # 2. Read the file bytes
        image_bytes = await file.read()
        
        # 3. Pass to our Vision Engine
        detected_assets = process_image(image_bytes)
        
        # Calculate total area just for the summary response
        total_area = sum([asset["area_sqm"] for asset in detected_assets])
        
        # 4. Return the data to the frontend
        return {
            "message": "Image processed successfully",
            "asset_count": len(detected_assets),
            "total_area_sqm": round(total_area, 2),
            "assets": detected_assets
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.post("/chat")
async def chat_about_assets(request: ChatRequest):
    """
    Natural language Q&A about detected assets.
    (Phase 2 - Optional Gemini integration)
    """
    return {
        "message": "Chat feature coming in Phase 2",
        "query": request.query,
        "image_id": request.image_id
    }
