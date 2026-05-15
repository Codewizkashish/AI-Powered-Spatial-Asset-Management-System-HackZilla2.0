from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# We will uncomment these as we build the route files!
from api.routes import upload, official 
from core.database import engine, Base
import models.domain 

# This creates the tables in Supabase if they don't exist
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Geospatial Asset Management API", 
    version="1.0.0",
    description="Backend engine for satellite/drone image asset detection."
)

# Allow your frontend partner's React/Next.js app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for the hackathon MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/v1/public", tags=["Public"])
app.include_router(official.router, prefix="/api/v1/official", tags=["Official"])

@app.get("/")
def health_check():
    return {
        "status": "Active", 
        "system": "Geospatial Intelligence Core",
        "message": "Send images, I am ready."
    }