# PROJECT_CONTEXT.md
# AI-Powered Spatial Asset Management System
> Last Updated: 2025 | Hackathon Build — 20-Hour Sprint

---

## 1. Project Summary

An end-to-end AI system for **Indian Railways / Urban Governance** that ingests satellite, drone, and aerial imagery, automatically detects and classifies urban assets (buildings, water bodies, trees, roads, drains, etc.), and surfaces them through an interactive geospatial interface with risk/encroachment alerts.

Built on top of the **eGov Foundation DIGIT** platform philosophy — open source, reusable, modular.

---

## 2. Problem Being Solved

| Pain Point | Impact |
|---|---|
| Illegal encroachments on railway land | Undetected for years, safety hazard |
| Clogged drainage systems | Track washouts during monsoons |
| Missing maintenance data on bridges/tracks | Speed restrictions, delays |
| Unmapped auxiliary assets | Revenue leakage |
| Inaccurate water/road body data | Hampers emergency ART response |

---

## 3. Tech Stack

### AI / ML
| Component | Choice | Reason |
|---|---|---|
| Primary Detection | **YOLOv8-seg** (Ultralytics) | Fast inference, handles segmentation, single model |
| Future (Post-MVP) | SAM, SegFormer | Accuracy boost after MVP is stable |
| Training Data | DeepGlobe, SpaceNet, iSAID, INRIA | Open-source aerial/satellite labeled datasets |

### Backend
| Component | Choice |
|---|---|
| Framework | **FastAPI** (Python) |
| Spatial DB | **PostGIS** via Supabase (free cloud) |
| Graph DB | **Neo4j AuraDB** (free cloud tier) |
| ORM | SQLAlchemy + GeoAlchemy2 |
| Geometry | Shapely + GeoPandas |
| LLM (Optional) | Google Gemini API (free tier) |

### Frontend
| Component | Choice |
|---|---|
| Framework | **Next.js 15** (App Router) |
| Map Layer | **Leaflet.js** + react-leaflet |
| Styling | Tailwind CSS |
| API Client | fetch / axios |
| State | React Context / Zustand |
| Server Functions | Next.js Server Actions |

### Infrastructure
| Component | Choice |
|---|---|
| DB Hosting | Supabase (PostGIS + pgvector pre-installed) |
| Graph Hosting | Neo4j AuraDB |
| Image Storage | Supabase Storage Buckets (MVP) |
| Dev Environment | Local + optional Google Colab (GPU) |

---

## 4. Asset Categories to Detect

| Priority | Asset Category | Sub-types |
|---|---|---|
| Must Have | Properties & Buildings | Residential, commercial, rooftop area |
| Must Have | Trees & Green Cover | Individual trees, clusters, canopy |
| Must Have | Parks & Open Spaces | Playgrounds, gardens, open plots |
| Must Have | Water Bodies | Lakes, ponds, rivers, canals |
| Must Have | Roads & Footpaths | Road network, pedestrian paths |
| Must Have | Drains & Sewage | Open drains, stormwater channels |
| Good to Have | Vehicles & Parking | Parked vehicles, parking lots |
| Good to Have | Waste Dumps | Illegal dumping, landfills |
| Optional | Solar Panels | Rooftop solar installations |

---

## 5. Key User Flows

### Flow 1 — Public User Upload & Analysis
```
User uploads image
  → POST /api/v1/public/analyze
    → Save image to Supabase Storage
    → Run YOLOv8-seg inference
    → Convert masks → Polygons (Shapely)
    → Save polygons to PostGIS (detected_assets)
    → Check Neo4j for immediate risks
  → Return: asset counts, areas, polygon coordinates
    → Frontend renders overlay on Leaflet map
```

### Flow 2 — Public User Chat Query
```
User types: "Are there any blocked drains near track section X?"
  → POST /api/v1/public/chat
    → Fetch relevant asset data from PostGIS by image_id
    → Pass context + query to Gemini API
  → Return: Natural language answer
```

### Flow 3 — Railway Official Dashboard
```
Official pans/zooms map
  → GET /api/v1/official/assets?bbox=...
    → PostGIS ST_Within spatial query
  → Return: GeoJSON of all assets in view
    → Rendered as Leaflet layer overlays

Official checks warnings
  → GET /api/v1/official/warnings
    → Query warnings table + Neo4j severe relationships
  → Return: Critical alerts with coordinates
```

### Flow 4 — Export
```
Official requests export
  → POST /api/v1/official/export
    → Dump detected_assets → GeoJSON / CSV
  → Return: Downloadable file
```

---

## 6. Data Flow Diagram (Text)

```
[Image Upload] 
    ↓
[Supabase Storage] ← stores raw image
    ↓
[YOLOv8-seg Inference] ← vision_engine.py
    ↓
[Mask → Polygon Conversion] ← geo_logic.py (Shapely)
    ↓
[PostGIS: detected_assets] ← GeoAlchemy2
    ↓
[Buffer / Encroachment Check] ← geo_logic.py (ST_DWithin)
    ↓
[Neo4j: Asset Relationships] ← graph_logic.py
    ↓
[Warnings Table populated] ← if risk detected
    ↓
[API Response → Frontend] ← GeoJSON + metadata
    ↓
[Leaflet Map Overlay] ← React frontend
```

---

## 7. External Dependencies

| Dependency | Purpose | Link |
|---|---|---|
| Ultralytics YOLOv8 | Core detection model | docs.ultralytics.com |
| Supabase | PostGIS + Storage hosting | supabase.com |
| Neo4j AuraDB | Graph relationship DB | neo4j.com/aura |
| Shapely | Geometry operations | shapely.readthedocs.io |
| GeoPandas | Spatial data manipulation | geopandas.org |
| GeoAlchemy2 | PostGIS ORM layer | geoalchemy2.readthedocs.io |
| Leaflet.js | Frontend map rendering | leafletjs.com |
| Google Gemini API | Free LLM for Q&A chat | ai.google.dev |
| DeepGlobe Dataset | Training data | kaggle.com/balraj98 |

---

## 8. Environment Variables Required

```env
# Database
SUPABASE_URL=
SUPABASE_KEY=
DATABASE_URL=postgresql+asyncpg://...@.../postgres

# Neo4j
NEO4J_URI=neo4j+s://...aura.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=

# Storage
SUPABASE_BUCKET=asset-images

# AI
GEMINI_API_KEY=

# App
APP_ENV=development
CORS_ORIGINS=http://localhost:3000
```

---

## 9. MVP Scope (First 10 Hours)

- [ ] POST /api/v1/public/analyze — full pipeline (upload → YOLOv8 → PostGIS → response)
- [ ] Frontend: image upload UI + Leaflet overlay of returned polygons
- [ ] PostGIS schema deployed on Supabase
- [ ] YOLOv8 model loaded and returning masks

**Everything else is Phase 2.**
