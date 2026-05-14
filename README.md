# 🛰️ AI Spatial Asset Management System
**AI-powered detection and classification of urban assets from satellite, drone, and aerial imagery.**

Built for Indian Railways / Urban Governance | eGov Foundation DIGIT Platform

---

## 📋 What This Does

Ingests aerial/satellite images → Detects urban assets (buildings, water bodies, roads, drains, trees, parks) using YOLOv8 → Stores spatial data in PostGIS → Surfaces interactive map overlays with risk/encroachment alerts.

---

## 🏗️ Stack at a Glance

| Layer | Technology |
|---|---|
| AI / Detection | YOLOv8-seg (Ultralytics) |
| Backend | FastAPI + Python |
| Spatial DB | PostGIS via Supabase |
| Graph DB | Neo4j AuraDB |
| Frontend | Next.js 15 + Leaflet.js |
| Geometry | Shapely + GeoPandas |
| LLM (optional) | Google Gemini API |

---

## 📁 Repository Structure

```
spatial-asset-system/
├── backend/        # FastAPI app
├── frontend/       # React app
├── ml/             # YOLOv8 training scripts
├── infra/          # DB schema, Neo4j setup
└── docs/           # All architecture and project docs
```

---

## 🚀 Quick Start

### 1. Clone
```bash
git clone https://github.com/<your-org>/spatial-asset-system.git
cd spatial-asset-system
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your Supabase, Neo4j, and Gemini credentials in .env
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
npm run dev
```

### 4. Database Setup
```bash
# Run the PostGIS schema in your Supabase SQL editor:
cat infra/schema.sql

# Run Neo4j setup queries in AuraDB browser:
cat infra/neo4j_setup.cypher
```

### 5. ML Model
```bash
cd ml
# Download base YOLOv8 weights (not committed to git)
python -c "from ultralytics import YOLO; YOLO('yolov8n-seg.pt')"
# Fine-tune on urban dataset:
python train.py
```

---

## 📖 Documentation

| Doc | Purpose |
|---|---|
| [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Project memory, stack, flows, dependencies |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, services, data flow, module structure |
| [CODING_RULES.md](docs/CODING_RULES.md) | Naming conventions, patterns, formatting rules |
| [FEATURE_LOG.md](docs/FEATURE_LOG.md) | Every feature, change, fix, and decision tracked |

> **Read all four docs before writing any code.**

---

## 🔑 Environment Variables

See `backend/.env.example` for all required variables.

Never commit real credentials. Share them with teammates via a secure channel.

---

## 🌿 Git Workflow

```
main  ←  stable releases only
dev   ←  all PRs target here

feature/<name>   new features
fix/<name>       bug fixes
refactor/<name>  restructuring
```

**Always create a branch. Always PR into `dev`. Never push directly to `main`.**

---

## 🏁 Hackathon Phase Plan

| Phase | Hours | Milestone |
|---|---|---|
| 1 | 0–10h | POST /analyze pipeline + frontend polygon overlay |
| 2 | 10–15h | Neo4j risks + warnings API |
| 3 | 15–18h | Official dashboard + export |
| 4 | 18–20h | Chat LLM + bonus features |

---

## 👥 Team

| Role | Owner |
|---|---|
| ML / Vision Engine | |
| Backend / API | |
| Frontend / Map UI | |
| DB / Infra | |
