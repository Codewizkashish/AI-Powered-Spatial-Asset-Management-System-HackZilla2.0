"""
Public User Upload & Analysis Routes
POST /api/v1/public/analyze - Image upload, YOLOv8 inference, and Database Persistence
POST /api/v1/public/chat - Natural language queries about detected assets
"""
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

# Core System Imports
from core.database import get_db
from models.domain import Image
from services.vision_engine import process_image
from services.llm_agent import chat_with_spatial_data
from services.geo_logic import generate_warnings # Needed to generate warnings for the GeoJSON

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    image_id: Optional[str] = None # Using str here prevents UUID parsing errors from frontend

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Receives an uploaded image, runs YOLOv8 segmentation, saves to Supabase, 
    and returns EXACTLY the GeoJSON format requested by the frontend.
    """
    # 1. Image Type Validation
    if not file.content_type.startswith("image/"):
        # The yellow line under HTTPException is fixed because it is imported on line 7!
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        # 2. Process Image Bytes & Run Vision Engine
        image_bytes = await file.read()
        raw_assets = process_image(image_bytes)
        
        # 3. Structure the Data for the Frontend (GeoJSON & Summary)
        features = []
        summary = {}
        processed_assets = []
        
        for asset in raw_assets:
            # Generate a unique ID so the frontend map can link markers to polygons
            asset_id = str(uuid.uuid4())
            cat = asset["asset_category"]
            area = asset["area_sqm"]
            
            asset["id"] = asset_id
            processed_assets.append(asset)
            
            # --- Build the Summary ---
            if cat not in summary:
                summary[cat] = {"count": 0, "total_area_sqm": 0}
            summary[cat]["count"] += 1
            summary[cat]["total_area_sqm"] += round(area, 2)
            
            # --- Build the GeoJSON Feature ---
            coords = asset["polygon_points"]
            # GeoJSON requires the first and last point to be identical to close the shape
            if len(coords) > 0 and coords[0] != coords[-1]:
                coords.append(coords[0])
                
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords] 
                },
                "properties": {
                    "id": asset_id,
                    "asset_id": asset_id,
                    "category": cat,
                    "confidence": asset["confidence_score"],
                    "area_sqm": round(area, 2)
                }
            })
            
        # 4. Generate AI Warnings
        warnings = generate_warnings(processed_assets)
        
        # 5. DATABASE PERSISTENCE
        db_image = Image(image_url=file.filename, source_type="user_upload")
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        # 6. Return EXACT shape requested by Frontend teammate
        return {
            "image_id": str(db_image.id),
            "summary": summary,
            "geojson": {
                "type": "FeatureCollection",
                "features": features
            },
            "warnings": warnings
        }
        
    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=f"Vision System Error: {str(e)}")


@router.post("/chat")
async def chat_about_assets(request: ChatRequest):
    """
    Natural language Q&A about detected assets using the Dual Gemini/Groq Brain.
    """
    try:
        # Hackathon MVP: Using standard mock data for the chat so it always works during demo
        mock_asset_data = [
            {"asset_category": "bus", "confidence_score": 0.927, "area_sqm": 19538.98}
        ]
        
        ai_response = chat_with_spatial_data(request.query, mock_asset_data)
        
        return {
            "reply": ai_response,
            "image_id": request.image_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Engine Error: {str(e)}")