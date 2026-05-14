# ARCHITECTURE.md
# System Architecture — AI Spatial Asset Management System

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│   Next.js Frontend  |  Leaflet.js Map  |  Tailwind UI           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / REST (JSON, GeoJSON)
┌───────────────────────────────▼─────────────────────────────────┐
│                         API LAYER                               │
│              FastAPI  |  Pydantic Validation  |  CORS           │
│   /public/*  (upload, chat)  |  /official/*  (dashboard, export)│
└──────┬─────────────────────────────────────────┬────────────────┘
       │                                         │
┌──────▼────────────┐                 ┌──────────▼──────────────┐
│   SERVICE LAYER   │                 │    SERVICE LAYER        │
│  vision_engine.py │                 │   geo_logic.py          │
│  (YOLOv8 infer)   │                 │   (Shapely/GeoPandas)   │
│  llm_agent.py     │                 │   graph_logic.py        │
│  (Gemini API)     │                 │   (Neo4j Cypher)        │
└──────┬────────────┘                 └──────────┬──────────────┘
       │                                         │
┌──────▼─────────────────────────────────────────▼──────────────┐
│                        DATA LAYER                              │
│   PostGIS (Supabase)         │        Neo4j AuraDB            │
│   - images                   │        - Asset nodes           │
│   - detected_assets          │        - Risk relationships     │
│   - rail_sections            │        - Graph queries         │
│   - warnings                 │                                │
│                              │                                │
│   Supabase Storage           │                                │
│   - Raw image files          │                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
spatial-asset-system/
│
├── backend/                          # FastAPI application
│   ├── main.py                       # App init, middleware, router registration
│   ├── requirements.txt
│   ├── .env.example
│   │
│   ├── api/
│   │   ├── dependencies.py           # DB session injection, auth guards
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── upload.py             # POST /public/analyze, POST /public/chat
│   │       └── official.py           # GET /official/assets, warnings, export
│   │
│   ├── core/
│   │   ├── config.py                 # Pydantic Settings (env vars)
│   │   └── database.py               # SQLAlchemy engine + Neo4j driver setup
│   │
│   ├── services/
│   │   ├── vision_engine.py          # YOLOv8 load, inference, mask→polygon
│   │   ├── geo_logic.py              # Buffer checks, area calc, ST_DWithin
│   │   ├── graph_logic.py            # Neo4j Cypher: create nodes, query risks
│   │   └── llm_agent.py              # Gemini API wrapper for chat Q&A
│   │
│   ├── models/
│   │   ├── schemas.py                # Pydantic I/O models (request/response)
│   │   └── domain.py                 # SQLAlchemy + GeoAlchemy2 table models
│   │
│   └── tests/
│       ├── test_vision.py
│       ├── test_geo.py
│       └── test_routes.py
│
├── frontend/                         # Next.js 15 App Router application
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Root layout (global styles, metadata)
│       │   ├── page.tsx              # Home page
│       │   ├── api/                  # API routes (middleware, proxies if needed)
│       │   │   └── [...proxy].ts     # Optional: proxy to FastAPI
│       │   ├── dashboard/
│       │   │   └── page.tsx          # Dashboard page
│       │   └── globals.css           # Global Tailwind styles
│       │
│       ├── components/               # Pure UI components (no business logic)
│       │   ├── MapView/
│       │   │   ├── MapView.tsx       # Leaflet map container (Client Component)
│       │   │   ├── AssetLayer.tsx    # GeoJSON polygon overlays
│       │   │   └── WarningMarker.tsx # Alert pins on map
│       │   ├── Upload/
│       │   │   ├── UploadZone.tsx    # Drag-drop image upload
│       │   │   └── ProgressBar.tsx
│       │   ├── Dashboard/
│       │   │   ├── AssetSummary.tsx  # Count + area table
│       │   │   ├── WarningList.tsx   # Severity-sorted alerts
│       │   │   └── ExportButton.tsx
│       │   └── Chat/
│       │       └── ChatPanel.tsx     # LLM Q&A interface
│       │
│       ├── lib/
│       │   ├── api/                  # API abstraction layer
│       │   │   ├── client.ts         # Fetch/axios instance + interceptors
│       │   │   ├── assetService.ts   # analyze, getAssets, export
│       │   │   └── chatService.ts    # sendQuery
│       │   ├── utils/
│       │   │   ├── geoUtils.ts       # GeoJSON helpers, coordinate transforms
│       │   │   └── formatters.ts     # Area formatting, label display
│       │   └── constants.ts          # API URLs, default values
│       │
│       ├── hooks/                    # Custom React hooks
│       │   ├── useAssetAnalysis.ts
│       │   └── useMapBounds.ts
│       │
│       ├── store/                    # Global state (Zustand)
│       │   └── useAppStore.ts
│       │
│       └── types/                    # TypeScript types
│           ├── asset.ts
│           └── api.ts
│
├── ml/                               # ML model scripts (separate from backend)
│   ├── train.py                      # YOLOv8 fine-tuning script
│   ├── evaluate.py                   # mAP, IoU metrics
│   ├── export_model.py               # Export to ONNX/TorchScript
│   ├── data/
│   │   ├── prepare_deepglobe.py      # Dataset preprocessing
│   │   └── dataset.yaml              # YOLOv8 dataset config
│   └── weights/
│       └── .gitkeep                  # Model weights (gitignored)
│
├── infra/
│   ├── schema.sql                    # PostGIS schema (source of truth)
│   └── neo4j_setup.cypher            # Neo4j constraints + indexes
│
├── docs/
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── CODING_RULES.md
│   └── FEATURE_LOG.md
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # Lint + test on PR
│
├── .gitignore
└── README.md
```

---

## 3. Service Layer Contracts

### `vision_engine.py`
```
Input:  image_path: str | bytes
Output: List[DetectedAsset]
        {
          class_name: str,
          confidence: float,
          polygon_wkt: str,       # WKT format for PostGIS
          bbox: [x1,y1,x2,y2],
          mask_array: np.ndarray  # raw mask (internal only)
        }
```

### `geo_logic.py`
```
calculate_area(polygon_wkt, crs) → float (sq meters)
check_encroachment(asset_geom, rail_section_geom, buffer_m) → bool
mask_to_polygon(mask_array, image_meta) → str (WKT)
get_assets_in_bbox(bbox: BBox) → List[GeoJSON Feature]
```

### `graph_logic.py`
```
create_asset_node(asset_id, category, area) → None
create_risk_relationship(asset_id, rail_id, risk_type) → None
query_risks_near_track(rail_id) → List[RiskResult]
```

### `llm_agent.py`
```
Input:  query: str, context_data: dict (assets from DB)
Output: str (natural language response from Gemini)
```

---

## 4. Database Schema

### PostGIS (Supabase)

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Raw image registry
CREATE TABLE images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url   TEXT NOT NULL,
    upload_time TIMESTAMP DEFAULT NOW(),
    source_type VARCHAR(50)       -- 'satellite' | 'drone' | 'user_upload'
);

-- Detected assets with spatial geometry
CREATE TABLE detected_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id        UUID REFERENCES images(id) ON DELETE CASCADE,
    asset_category  VARCHAR(50) NOT NULL,
    confidence_score FLOAT,
    area_sqm        FLOAT,
    geom            geometry(Polygon, 4326)
);
CREATE INDEX idx_assets_geom ON detected_assets USING GIST(geom);

-- Railway track reference data
CREATE TABLE rail_sections (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name VARCHAR(100),
    geom         geometry(LineString, 4326)
);
CREATE INDEX idx_rail_geom ON rail_sections USING GIST(geom);

-- Risk and warning records
CREATE TABLE warnings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id   UUID REFERENCES detected_assets(id) ON DELETE CASCADE,
    issue_type VARCHAR(100),    -- 'Encroachment' | 'Drainage Blockage'
    severity   VARCHAR(20),     -- 'High' | 'Medium' | 'Low'
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Neo4j AuraDB — Node/Relationship Model

```
(:Asset {id, category, area_sqm, image_id})
(:RailSection {id, section_name})
(:Warning {id, issue_type, severity})

(:Asset)-[:NEAR_TRACK {distance_m: float}]→(:RailSection)
(:Asset)-[:HAS_RISK]→(:Warning)
(:Asset)-[:BLOCKS_DRAINAGE]→(:Asset)
```

---

## 5. API Contract

### Base URL: `/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/public/analyze` | None | Upload image, run detection |
| POST | `/public/chat` | None | LLM Q&A on image assets |
| GET | `/official/assets` | Token | Spatial query by bounding box |
| GET | `/official/warnings` | Token | All active risk alerts |
| POST | `/official/export` | Token | Download GeoJSON/CSV |

### POST `/public/analyze` — Request / Response

```json
// Request: multipart/form-data
{ "image": <file> }

// Response
{
  "image_id": "uuid",
  "summary": {
    "Water Body": {"count": 2, "total_area_sqm": 4500.0},
    "Building":   {"count": 14, "total_area_sqm": 12300.5}
  },
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Polygon", "coordinates": [...] },
        "properties": {
          "category": "Water Body",
          "confidence": 0.91,
          "area_sqm": 2200.0
        }
      }
    ]
  },
  "warnings": [
    { "issue_type": "Encroachment", "severity": "High", "asset_id": "uuid" }
  ]
}
```

---

## 6. Frontend Component Data Flow

```
App.jsx
  ├── UploadZone → calls assetService.analyze() → updates store
  ├── MapView    → reads store.geojson → renders AssetLayer
  ├── AssetSummary → reads store.summary
  ├── WarningList  → reads store.warnings
  └── ChatPanel    → calls chatService.sendQuery()
```

---

## 7. Hackathon Phase Gates

| Phase | Hours | Goal |
|---|---|---|
| 1 — Core Pipeline | 0–10h | Upload → YOLOv8 → PostGIS → Frontend polygon overlay |
| 2 — Graph + Alerts | 10–15h | Neo4j risk detection, warnings API |
| 3 — Dashboard | 15–18h | Official view, bbox query, export |
| 4 — Polish + Bonus | 18–20h | Chat LLM, change detection, DIGIT integration |
