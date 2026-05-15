# AI-Powered Spatial Asset Management System

AI-powered detection and classification of urban and railway assets from satellite, drone, and aerial imagery.

Built for a hackathon demo around upload, AI detection, map visualization, risk warnings, and GeoJSON export.

## What It Does

The system ingests imagery, detects assets such as buildings, trees, parks, water bodies, roads, drains, parking, waste, and solar panels, stores/serves spatial results through the backend, and presents them in a Next.js dashboard with Leaflet map overlays.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, Leaflet |
| Backend | FastAPI, Python, Pydantic |
| AI / Detection | YOLOv8 segmentation |
| Spatial | PostGIS / Supabase-ready contracts |
| Optional Intelligence | Neo4j, Gemini |

## Repository Structure

```text
backend/   FastAPI app, routes, services, configuration
frontend/  Next.js dashboard and map UI
docs/      Architecture, migration, coding, and project notes
```

## API Contract

Frontend expects:

- `POST /api/v1/public/analyze`
- `POST /api/v1/public/chat`
- `GET /api/v1/official/assets`
- `GET /api/v1/official/warnings`
- `GET /api/v1/official/export?format=geojson`

The upload response should include:

```json
{
  "image_id": "uuid",
  "summary": {
    "Building": { "count": 10, "total_area_sqm": 1200 }
  },
  "geojson": {
    "type": "FeatureCollection",
    "features": []
  },
  "warnings": []
}
```

For best map warning placement, each warning `asset_id` should match `feature.properties.asset_id` or `feature.properties.id`.

## Backend Quick Start

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://localhost:8000/docs`

## Frontend Quick Start

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`

Dashboard: `http://localhost:3000/dashboard`

Expected frontend environment:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Demo Flow

1. Open `/dashboard`.
2. Upload JPG/PNG imagery.
3. Backend returns detected asset GeoJSON, summary counts, and warnings.
4. Frontend renders polygons, warning markers, category summary, and export.

## Notes

- Do not commit real secrets.
- Keep backend contracts stable for the frontend dashboard.
- Use the semantic frontend theme tokens from `frontend/src/app/globals.css`.
