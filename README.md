# AI-Powered Spatial Asset Management System

## 📌 Overview
AI-powered Spatial Asset Management System for Indian Railways infrastructure monitoring using satellite/drone imagery, YOLOv8 segmentation, and PostGIS spatial database.

**Objective**: Automatically detect and classify urban/railway assets (buildings, trees, water bodies, roads, drains) from aerial imagery to enable real-time infrastructure monitoring and risk detection.

---

## 📁 Project Structure

```
spatialAsset/
├── backend/
│   ├── main.py                 # FastAPI app initialization
│   ├── api/
│   │   ├── dependencies.py     # DB sessions, auth dependencies
│   │   └── routes/
│   │       ├── upload.py       # Public user upload & analysis
│   │       └── official.py     # Dashboard & official queries
│   ├── core/
│   │   ├── config.py           # Configuration & env variables
│   │   └── database.py         # DB connection setup
│   ├── services/
│   │   ├── vision_engine.py    # YOLOv8 inference & mask logic
│   │   ├── geo_logic.py        # Spatial analysis with GeoPandas
│   │   ├── graph_logic.py      # Neo4j Cypher queries
│   │   └── llm_agent.py        # Gemini API integration
│   ├── models/
│   │   ├── schemas.py          # Pydantic request/response models
│   │   └── domain.py           # SQLAlchemy ORM models
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment template
├── .gitignore                  # Git ignore patterns
└── README.md                   # This file
```

---

## 🎯 Core API Endpoints

### Public Endpoints
- **`POST /api/v1/public/analyze`** - Upload image and run detection
- **`POST /api/v1/public/chat`** - Q&A about detected assets

### Official Endpoints
- **`GET /api/v1/official/assets`** - Spatial query with bounding box
- **`GET /api/v1/official/warnings`** - List warnings and alerts
- **`POST /api/v1/official/export`** - Export as GeoJSON/CSV

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL with PostGIS (Supabase recommended)
- Git

### 1. Clone & Navigate
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your actual values:
# - DATABASE_URL (Supabase PostgreSQL connection)
# - YOLOV8_MODEL_PATH 
# - GEMINI_API_KEY (optional)
```

### 5. Download YOLOv8 Model
```bash
python -c "from ultralytics import YOLO; YOLO('yolov8l-seg.pt')"
```

### 6. Setup Database Schema
```bash
# Run schema.sql in your Supabase/PostgreSQL database
psql $DATABASE_URL < ../schema.sql  # (if you have schema.sql)
```

### 7. Start Backend Server
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend Ready**: `http://localhost:8000`  
**API Docs**: `http://localhost:8000/docs`

---

## 🔧 Configuration (.env)

Create `.env` in `backend/` directory:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Model Configuration
YOLOV8_MODEL_PATH=./models/yolov8-seg.pt
YOLOV8_CONFIDENCE_THRESHOLD=0.5

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# LLM (Optional)
GEMINI_API_KEY=your-key-here

# Neo4j (Optional - Phase 2+)
NEO4J_URI=neo4j+s://your-instance
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
```

---

## 📊 Tech Stack

| Component | Technology |
|-----------|-----------|
| **ML/CV** | YOLOv8-seg (PyTorch) |
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL + PostGIS (Supabase) |
| **Geospatial** | Shapely, GeoPandas, GDAL |
| **Graph DB** | Neo4j AuraDB (optional) |
| **LLM** | Google Gemini (optional) |

---

## 📈 MVP Roadmap (20 Hours)

**Phase 1 (0-10 hrs)**: Core image analysis pipeline
- Image upload endpoint
- YOLOv8 inference  
- Save detections to PostGIS
- Frontend map display

**Phase 2 (10-15 hrs)**: Risk engine & graph relationships
- Encroachment detection
- Neo4j integration
- Warning generation

**Phase 3 (15-20 hrs)**: Export & dashboard refinement
- GeoJSON/CSV export
- Official dashboard
- Chat interface

---

## 🔗 Asset Categories

The model detects:
- 🏢 **Buildings** - Residential, commercial structures
- 🌳 **Trees & Green Cover** - Individual trees, tree clusters
- 💧 **Water Bodies** - Lakes, ponds, rivers, canals
- 🛣️ **Roads & Footpaths** - Road networks, pedestrian paths
- 🚰 **Drains & Sewage** - Open drains, storm water channels
- 🅿️ **Vehicles & Parking** - Parked vehicles, parking lots

---

## 🧪 Testing

```bash
# Test upload endpoint
curl -X POST http://localhost:8000/api/v1/public/analyze \
  -F "image=@test.jpg"

# View Swagger docs
# Open: http://localhost:8000/docs
```

---

## 📝 Database Schema

Key tables in PostGIS:
- `images` - Uploaded/satellite imagery metadata
- `detected_assets` - Asset polygons with confidence scores
- `rail_sections` - Railway track geometry
- `warnings` - Risk alerts and encroachments

---

## 🤝 Development

### Code Standards
- Python: PEP 8 with 100-char lines
- API responses: Pydantic models for validation
- Database: SQLAlchemy ORM + PostGIS spatial queries
- Type hints: Required for all functions

### File Organization
- Service logic isolated in `services/`
- Route handlers in `api/routes/`
- Data models in `models/`
- Configuration in `core/`

---

## ⚠️ Known Limitations & Future Work

- YOLOv8 inference limited by GPU memory (24GB tested, scales with model size)
- Coordinate precision: 6 decimals (~0.1m)
- Max image size: 50MB uploads
- Change detection requires time-series imagery

---

## 🆘 Troubleshooting

**Issue**: Model download fails
```bash
# Manual download
wget https://github.com/ultralytics/assets/releases/download/v8.0.0/yolov8l-seg.pt
# Place in backend/models/
```

**Issue**: Database connection error
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

**Issue**: CORS errors
- Check `ALLOWED_ORIGINS` in .env

**Issue**: GPU not detected
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

---

## 📚 References

- [YOLOv8 Documentation](https://docs.ultralytics.com)
- [FastAPI Guide](https://fastapi.tiangolo.com)
- [PostGIS Manual](https://postgis.net/documentation/)
- [Supabase PostgreSQL](https://supabase.com)
- [Neo4j AuraDB](https://neo4j.com/auradb)

---

## 📄 License

Part of the eGov Foundation's DIGIT Urban Governance initiative.

---

**Ready to start?** Follow [Quick Start](#-quick-start) above!
