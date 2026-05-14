"""
Railway Official Dashboard Routes
GET /api/v1/official/assets - Spatial query with bounding box
GET /api/v1/official/warnings - Critical alerts and risk assessments
POST /api/v1/official/export - Export assets as GeoJSON/CSV
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import httpx
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from models.domain import Image, DetectedAsset, Warning
from services.vision_engine import process_image
from services.geo_logic import generate_warnings

router = APIRouter()

class RegionRequest(BaseModel):
    latitude: float
    longitude: float
    zoom: int = 18

def get_bounding_box(lat, lon, offset=0.002):
    """
    Creates a bounding box around a center point.
    0.002 degrees is roughly a 200m x 200m area (perfect for asset detection).
    """
    min_lon = lon - offset
    min_lat = lat - offset
    max_lon = lon + offset
    max_lat = lat + offset
    return f"{min_lon},{min_lat},{max_lon},{max_lat}"

@router.post("/analyze_region")
async def analyze_railway_region(request: RegionRequest, db: Session = Depends(get_db)):
    """
    Fetches a live satellite tile via Esri (NO API KEY NEEDED), analyzes it, 
    saves results to PostGIS, and returns assets + warnings.
    """
    # 1. Create Bounding Box and Fetch Esri Satellite Data
    bbox = get_bounding_box(request.latitude, request.longitude)
    
    # Esri ArcGIS World Imagery REST API - 100% Free, No Key Required
    image_url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox={bbox}&bboxSR=4326&imageSR=4326&size=600,600&format=jpg&f=image"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Could not fetch live satellite data from Esri.")
            image_bytes = response.content

        # 2. Run Vision & Intelligence Engines
        detected_assets = process_image(image_bytes)
        warnings = generate_warnings(detected_assets)

        # 3. SAVE TO SUPABASE DATABASE
        db_image = Image(image_url=image_url, source_type="satellite")
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        for asset in detected_assets:
            points_str = ", ".join([f"{pt[0]} {pt[1]}" for pt in asset["polygon_points"]])
            if asset["polygon_points"][0] != asset["polygon_points"][-1]:
                first_pt = asset["polygon_points"][0]
                points_str += f", {first_pt[0]} {first_pt[1]}"

            wkt_polygon = f"POLYGON(({points_str}))"

            db_asset = DetectedAsset(
                image_id=db_image.id,
                asset_category=asset["asset_category"],
                confidence_score=asset["confidence_score"],
                area_sqm=asset["area_sqm"],
                geom=wkt_polygon 
            )
            db.add(db_asset)
            db.commit()
            db.refresh(db_asset)

            for warning in warnings:
                if (warning["issue_type"] == "Potential Encroachment" and asset["asset_category"] in ["Building", "Properties"]) or \
                   (warning["issue_type"] == "High Waterlogging Risk" and asset["asset_category"] == "Water Body") or \
                   (warning["issue_type"] == "Vegetation Overgrowth" and asset["asset_category"] in ["Trees", "Green Cover"]):
                    
                    db_warning = Warning(
                        asset_id=db_asset.id,
                        issue_type=warning["issue_type"],
                        severity=warning["severity"]
                    )
                    db.add(db_warning)
                    
        db.commit()

        # 4. Return data to frontend
        return {
            "region": {"lat": request.latitude, "lng": request.longitude},
            "status": "Analysis Complete & Saved to Database",
            "total_assets_found": len(detected_assets),
            "critical_warnings": len(warnings),
            "assets": detected_assets,
            "warnings": warnings,
            "preview_url": image_url
        }

    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assets")
async def get_assets(db: Session = Depends(get_db)):
    """
    Get all detected assets (placeholder for Phase 1)
    TODO: Add bbox spatial filtering in Phase 2
    """
    assets = db.query(DetectedAsset).limit(100).all()
    return {"total": len(assets), "assets": assets}

@router.get("/warnings")
async def get_warnings(db: Session = Depends(get_db)):
    """
    Get all warnings (placeholder for Phase 1)
    TODO: Add severity filtering in Phase 2
    """
    warnings_list = db.query(Warning).limit(100).all()
    return {"total": len(warnings_list), "warnings": warnings_list}
