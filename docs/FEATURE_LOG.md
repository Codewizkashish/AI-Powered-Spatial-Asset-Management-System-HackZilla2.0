# FEATURE_LOG.md
# Feature & Decision Log — AI Spatial Asset Management System

> **Rule**: Every feature added, every bug fixed, every architectural decision made — log it here.
> Format: newest entries at the top.
> Owner: the person who made the change logs it immediately.

---

## Log Format

```
### [YYYY-MM-DD] <TYPE>: <Short Title>
- **Author**: @username
- **Branch**: feature/xxx or fix/xxx
- **Status**: ✅ Done | 🔄 In Progress | ⏸ Blocked | ❌ Reverted

**What**: One sentence description.
**Why**: The reason this decision was made.
**How**: Key implementation detail or approach taken.
**Impact**: What other modules/people are affected.
**Notes**: Edge cases, known issues, follow-ups needed.
```

---

## Types
- `FEAT` — new feature
- `FIX` — bug fix
- `DECISION` — architectural/technical decision
- `REFACTOR` — code restructuring
- `INFRA` — database, cloud, CI/CD
- `DOCS` — documentation update
- `REVERT` — rolled back change

---

---

## Entries

---

### [2025-01-01] INFRA: Initial project scaffold and documentation
- **Author**: @team
- **Branch**: `main`
- **Status**: ✅ Done

**What**: Created base directory structure, four core docs, `.gitignore`, and README.

**Why**: Establish shared conventions before any code is written so all team members work from the same mental model.

**How**: Docs created: `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `CODING_RULES.md`, `FEATURE_LOG.md`. Directory tree scaffolded for `backend/`, `frontend/`, `ml/`, `infra/`, `docs/`.

**Impact**: All team members — read all four docs before writing a single line of code.

**Notes**: Model weights directory (`ml/weights/`) is gitignored. Each team member must download YOLOv8 base weights separately.

---

### [2025-01-01] DECISION: Use YOLOv8-seg only (drop SAM and SegFormer for MVP)
- **Author**: @team
- **Branch**: N/A (architecture decision)
- **Status**: ✅ Done

**What**: Decided to use only YOLOv8-seg for the hackathon MVP, deferring SAM and SegFormer.

**Why**: YOLOv8-seg handles detection + segmentation in a single forward pass. SAM requires two-stage inference (prompt → segment) which is slower and more complex to integrate. SegFormer is semantic-only — harder to get per-instance polygons. Time constraint of 20 hours makes a single, well-integrated model the correct choice.

**How**: `vision_engine.py` will load one YOLOv8-seg model. Output masks converted to Shapely polygons via `mask_to_polygon()`.

**Impact**: `ml/` team — focus training exclusively on YOLOv8-seg dataset config. `services/vision_engine.py` owner — no SAM integration needed for MVP.

**Notes**: Post-hackathon: evaluate SAM 2 for edge-refinement as a post-processing step on top of YOLOv8 detections.

---

### [2025-01-01] DECISION: Supabase for PostGIS, Neo4j AuraDB for graph (both cloud free tier)
- **Author**: @team
- **Branch**: N/A (architecture decision)
- **Status**: ✅ Done

**What**: Offload all database compute to cloud free tiers — Supabase (PostGIS) and Neo4j AuraDB.

**Why**: Running PostGIS + Neo4j locally would consume RAM needed for YOLOv8 inference. Supabase gives instant PostGIS + pgvector with a REST API. AuraDB gives a managed Neo4j instance without local Java heap issues.

**How**: Connection strings stored in `.env`. `core/database.py` sets up both connections on startup.

**Impact**: All team members need Supabase and AuraDB accounts. Connection strings shared via secure channel (NOT committed to git).

**Notes**: Free tier Supabase has 500MB storage limit — fine for image URLs (images stored as Supabase Storage objects, not in DB). AuraDB free tier: 200K nodes / 400K relationships — sufficient for MVP.

---

### [2025-01-01] DECISION: MVP scope — first 10 hours = analyze pipeline only
- **Author**: @team
- **Branch**: N/A (strategy decision)
- **Status**: ✅ Done

**What**: Hard gate: Neo4j, pgvector, LLM chat, and official dashboard are locked until the core analyze pipeline is end-to-end working.

**Why**: Risk management. The `POST /analyze` pipeline (upload → YOLOv8 → PostGIS → frontend polygon overlay) is the demo core. Everything else is bonus. A broken MVP pipeline with bonus features is worse than a working MVP.

**How**: Phase 1 (0–10h): `vision_engine` + `geo_logic` + `upload.py` route + frontend `UploadZone` + `MapView`. Phase 2 (10h+): graph, warnings, dashboard, chat.

**Impact**: All team members — do not start Phase 2 work until `POST /analyze` returns correct GeoJSON to the frontend map.

**Notes**: Checkpoint: demo the polygon overlay on Leaflet before 10-hour mark.

---

<!-- 
═══════════════════════════════════════════════
  ADD NEW ENTRIES ABOVE THIS LINE
  Copy the format from the Log Format section above
═══════════════════════════════════════════════

UPCOMING / PLANNED FEATURES (move to logged entries when done):

[ ] FEAT: POST /public/analyze — full pipeline
[ ] FEAT: YOLOv8-seg model loading + inference
[ ] FEAT: Mask to WKT polygon conversion (Shapely)
[ ] FEAT: PostGIS asset save (GeoAlchemy2)
[ ] FEAT: Frontend UploadZone component
[ ] FEAT: Frontend MapView + GeoJSON polygon layer
[ ] FEAT: AssetSummary panel (count + area)
[ ] FEAT: Neo4j asset node creation
[ ] FEAT: Encroachment detection (ST_DWithin + buffer)
[ ] FEAT: Warnings table population
[ ] FEAT: GET /official/assets (bbox spatial query)
[ ] FEAT: GET /official/warnings
[ ] FEAT: POST /official/export (GeoJSON/CSV download)
[ ] FEAT: POST /public/chat (Gemini LLM Q&A)
[ ] FEAT: WarningList dashboard component
[ ] FEAT: Change detection (two-image comparison)
[ ] FEAT: DIGIT Urban Asset Registry integration

-->
