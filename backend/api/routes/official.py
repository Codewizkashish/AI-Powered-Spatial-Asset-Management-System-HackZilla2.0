"""
Railway Official Dashboard Routes
GET /api/v1/official/assets - Spatial query with bounding box
GET /api/v1/official/warnings - Critical alerts and risk assessments
POST /api/v1/official/export - Export assets as GeoJSON/CSV
"""
import uuid
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
    0.002 degrees is roughly a 200m x 200m area.
    """
    min_lon = lon - offset
    min_lat = lat - offset
    max_lon = lon + offset
    max_lat = lat + offset
    return f"{min_lon},{min_lat},{max_lon},{max_lat}"

@router.post("/analyze_region")
async def analyze_railway_region(request: RegionRequest, db: Session = Depends(get_db)):
    """
    Fetches a live satellite tile via Esri, analyzes it using the REAL vision model, 
    saves results to PostGIS, and returns GeoJSON + warnings.
    """
    # 1. Create Bounding Box and Fetch Esri Satellite Data
    bbox = get_bounding_box(request.latitude, request.longitude)
    image_url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox={bbox}&bboxSR=4326&imageSR=4326&size=600,600&format=jpg&f=image"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Could not fetch live satellite data from Esri.")
            image_bytes = response.content

        # 2. Run REAL Vision Engine (No more fake data!)
        raw_assets = process_image(image_bytes)

        # 3. Save Image to DB First
        db_image = Image(image_url=image_url, source_type="satellite")
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        # 4. Process Assets, Save to DB, and Build GeoJSON concurrently
        features = []
        summary = {}
        processed_assets = []

        for asset in raw_assets:
            cat = asset["asset_category"]
            area = asset["area_sqm"]
            coords = asset["polygon_points"]

            # Format Geometry for Database
            points_str = ", ".join([f"{pt[0]} {pt[1]}" for pt in coords])
            if len(coords) > 0 and coords[0] != coords[-1]:
                first_pt = coords[0]
                points_str += f", {first_pt[0]} {first_pt[1]}"
            wkt_polygon = f"POLYGON(({points_str}))" if points_str else "POLYGON EMPTY"

            # SAVE ASSET TO DB (This generates the real ID)
            db_asset = DetectedAsset(
                image_id=db_image.id,
                asset_category=cat,
                confidence_score=asset["confidence_score"],
                area_sqm=area,
                geom=wkt_polygon 
            )
            db.add(db_asset)
            db.commit()
            db.refresh(db_asset)

            # Get the real database ID as a string
            real_asset_id = str(db_asset.id)
            
            # Attach it to our Python dictionary for the Warning generator
            asset["id"] = real_asset_id
            processed_assets.append(asset)

            # --- Build the Frontend Summary ---
            if cat not in summary:
                summary[cat] = {"count": 0, "total_area_sqm": 0}
            summary[cat]["count"] += 1
            summary[cat]["total_area_sqm"] += round(area, 2)

            # --- Build the Frontend GeoJSON Feature ---
            geo_coords = coords.copy()
            if len(geo_coords) > 0 and geo_coords[0] != geo_coords[-1]:
                geo_coords.append(geo_coords[0])

            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [geo_coords] # GeoJSON needs an array of rings
                },
                "properties": {
                    "id": real_asset_id,
                    "asset_id": real_asset_id, # Exact match for teammate's contract
                    "category": cat,
                    "confidence": asset["confidence_score"],
                    "area_sqm": round(area, 2)
                }
            })

        # 5. Generate Warnings based on the REAL detected assets
        warnings = generate_warnings(processed_assets)

        # 6. Save Warnings to Database (Linked by real_asset_id)
        for w in warnings:
            db_warning = Warning(
                asset_id=w["asset_id"],
                issue_type=w["issue_type"],
                severity=w["severity"]
            )
            db.add(db_warning)
        db.commit()

        # 7. Return EXACT payload shape requested by Frontend
        return {
            "image_id": str(db_image.id),
            "preview_url": image_url, # So the frontend map has a background
            "region": {"lat": request.latitude, "lng": request.longitude},
            "summary": summary,
            "geojson": {
                "type": "FeatureCollection",
                "features": features
            },
            "warnings": warnings
        }

    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assets")
async def get_assets(db: Session = Depends(get_db)):
    """Get all detected assets"""
    assets = db.query(DetectedAsset).limit(100).all()
    return {"total": len(assets), "assets": assets}

@router.get("/warnings")
async def get_warnings(db: Session = Depends(get_db)):
    """Get all warnings"""
    warnings_list = db.query(Warning).limit(100).all()
    return {"total": len(warnings_list), "warnings": warnings_list}