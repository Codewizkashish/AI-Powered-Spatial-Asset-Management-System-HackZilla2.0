"""Mock FastAPI backend for hackathon testing"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import base64
from io import BytesIO
from PIL import Image

app = FastAPI(title="AI Spatial Asset Manager - Mock API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= Models =============
class SummaryData(BaseModel):
    count: int
    total_area_sqm: float

class Summary(BaseModel):
    Building: SummaryData
    Tree: SummaryData
    Water: SummaryData

class Warning(BaseModel):
    id: str
    severity: str
    issue_type: str
    location: str
    details: str

class Feature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict

class GeoJSON(BaseModel):
    type: str = "FeatureCollection"
    features: List[Feature]

class AnalyzeResponse(BaseModel):
    image_id: str
    summary: Summary
    geojson: GeoJSON
    warnings: List[Warning]

# ============= Mock Data =============
def get_mock_geojson():
    """Generate mock GeoJSON features from the image bounds"""
    return {
        "type": "FeatureCollection",
        "features": [
            # Building 1
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [78.95, 20.55],
                        [78.96, 20.55],
                        [78.96, 20.56],
                        [78.95, 20.56],
                        [78.95, 20.55]
                    ]]
                },
                "properties": {
                    "category": "Building",
                    "confidence": 0.95,
                    "area_sqm": 2500
                }
            },
            # Building 2
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [78.96, 20.54],
                        [78.97, 20.54],
                        [78.97, 20.55],
                        [78.96, 20.55],
                        [78.96, 20.54]
                    ]]
                },
                "properties": {
                    "category": "Building",
                    "confidence": 0.92,
                    "area_sqm": 1800
                }
            },
            # Tree 1
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [78.94, 20.56],
                        [78.945, 20.56],
                        [78.945, 20.565],
                        [78.94, 20.565],
                        [78.94, 20.56]
                    ]]
                },
                "properties": {
                    "category": "Tree",
                    "confidence": 0.88,
                    "area_sqm": 150
                }
            },
            # Water Body
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [78.97, 20.56],
                        [78.98, 20.56],
                        [78.98, 20.57],
                        [78.97, 20.57],
                        [78.97, 20.56]
                    ]]
                },
                "properties": {
                    "category": "Water",
                    "confidence": 0.91,
                    "area_sqm": 5000
                }
            }
        ]
    }

def get_mock_warnings():
    """Generate mock warnings"""
    return [
        {
            "id": "warn_001",
            "asset_id": "asset_001",
            "severity": "High",
            "issue_type": "Encroachment",
            "location": "Building 1",
            "description": "Unauthorized structure detected near water body",
            "details": "Unauthorized structure detected near water body"
        },
        {
            "id": "warn_002",
            "asset_id": "asset_002",
            "severity": "Medium",
            "issue_type": "Drainage Blockage",
            "location": "Water Body",
            "description": "Potential blockage detected in drainage channel",
            "details": "Potential blockage detected in drainage channel"
        },
        {
            "id": "warn_003",
            "asset_id": "asset_003",
            "severity": "Low",
            "issue_type": "Vegetation Loss",
            "location": "Tree Coverage",
            "description": "Green cover reduced compared to historical baseline",
            "details": "Green cover reduced compared to historical baseline"
        }
    ]

# ============= API Endpoints =============
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Spatial Asset Manager"}

@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze_image(image: UploadFile = File(...)):
    """
    Analyze uploaded satellite image and return detected assets
    """
    try:
        # Read image
        contents = await image.read()
        img = Image.open(BytesIO(contents))
        
        # Validate image
        if img.size[0] < 100 or img.size[1] < 100:
            raise HTTPException(status_code=400, detail="Image too small")
        
        # Generate image ID from hash
        import hashlib
        image_id = hashlib.md5(contents).hexdigest()[:12]
        
        # Return mock response with detected assets
        return AnalyzeResponse(
            image_id=image_id,
            summary=Summary(
                Building=SummaryData(count=45, total_area_sqm=125000),
                Tree=SummaryData(count=1203, total_area_sqm=18000),
                Water=SummaryData(count=8, total_area_sqm=95000)
            ),
            geojson=get_mock_geojson(),
            warnings=get_mock_warnings()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/warnings", response_model=List[Warning])
async def get_warnings():
    """Fetch warnings for current analysis"""
    return get_mock_warnings()

@app.get("/api/v1/assets")
async def get_assets():
    """Fetch assets for current analysis"""
    return get_mock_geojson()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
