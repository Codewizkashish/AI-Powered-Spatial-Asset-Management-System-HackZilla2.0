# CODING_RULES.md
# Coding Standards — AI Spatial Asset Management System

> These rules are **non-negotiable**. Every PR must follow them. No exceptions.
> One style. One team. One codebase.

---

## 1. General Principles

1. **Separate concerns always** — UI never talks to DB. Services never import React. Routes never contain business logic.
2. **Abstract every external dependency** — AI models, external APIs (Gemini, Supabase), and DBs all go behind a service interface.
3. **Generate modules, not monoliths** — each file has ONE clear responsibility.
4. **No magic numbers or strings** — use constants and enums.
5. **Fail loudly in dev, fail gracefully in prod** — raise exceptions in services, catch at route level, return proper HTTP codes.

---

## 2. Python (Backend)

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Variables | `snake_case` | `image_id`, `asset_geom` |
| Functions | `snake_case` | `run_inference()`, `mask_to_polygon()` |
| Classes | `PascalCase` | `DetectedAsset`, `VisionEngine` |
| Constants | `UPPER_SNAKE_CASE` | `DEFAULT_CRS`, `MAX_IMAGE_SIZE_MB` |
| Files/Modules | `snake_case` | `vision_engine.py`, `geo_logic.py` |
| Pydantic Models | `PascalCase` + `Schema` suffix | `AnalyzeResponseSchema` |
| DB Models | `PascalCase` + no suffix | `DetectedAsset`, `Image` |

### File Structure Rules

```python
# Every Python file header order:
# 1. stdlib imports
# 2. third-party imports
# 3. local imports
# 4. constants
# 5. class/function definitions

# Example: services/vision_engine.py
import os
from pathlib import Path

import numpy as np
from ultralytics import YOLO

from models.schemas import DetectedAssetSchema
from core.config import settings

MODEL_PATH = Path("weights/yolov8_urban.pt")
CONFIDENCE_THRESHOLD = 0.45
```

### FastAPI Route Rules

```python
# ✅ CORRECT — routes only handle HTTP concerns
@router.post("/analyze", response_model=AnalyzeResponseSchema)
async def analyze_image(
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    image_bytes = await image.read()
    result = await vision_engine.run_inference(image_bytes)   # ← service call
    saved = await asset_repository.save_assets(result, db)   # ← repo call
    return build_response(saved)                              # ← formatter


# ❌ WRONG — business logic in route
@router.post("/analyze")
async def analyze_image(image: UploadFile):
    model = YOLO("weights/best.pt")     # never load model in route
    results = model(await image.read()) # never run inference in route
    ...
```

### Service Rules

```python
# Services are pure Python classes/functions — no FastAPI imports, no HTTP codes
# They raise domain exceptions, not HTTPException

class VisionEngine:
    def __init__(self):
        self._model = None  # lazy load

    def _load_model(self):
        if self._model is None:
            self._model = YOLO(settings.MODEL_PATH)

    def run_inference(self, image_bytes: bytes) -> list[DetectedAssetSchema]:
        self._load_model()
        # ... inference logic
        # raise ValueError("Invalid image") — NOT HTTPException
```

### Error Handling Pattern

```python
# In services: raise domain exceptions
class InferenceError(Exception): pass
class GeometryError(Exception): pass

# In routes: catch and convert to HTTP
@router.post("/analyze")
async def analyze_image(...):
    try:
        result = vision_engine.run_inference(image_bytes)
    except InferenceError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Type Hints

```python
# ALL functions must have type hints — no exceptions
def calculate_area(polygon_wkt: str, crs: str = "EPSG:4326") -> float:
    ...

async def get_assets_in_bbox(bbox: BBoxSchema, db: AsyncSession) -> list[AssetGeoJSON]:
    ...
```

### Async Rules

- All DB operations: `async` with `AsyncSession`
- All file I/O: use `aiofiles`
- CPU-bound tasks (YOLOv8 inference): run in `asyncio.to_thread()` — never block the event loop

```python
# ✅ Correct
result = await asyncio.to_thread(vision_engine.run_inference, image_bytes)

# ❌ Wrong — blocks event loop
result = vision_engine.run_inference(image_bytes)
```

---

## 3. TypeScript / Next.js (Frontend)

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `imageId`, `assetList` |
| Functions | `camelCase` | `handleUpload()`, `fetchAssets()` |
| React Components | `PascalCase` | `MapView`, `UploadZone` |
| Hooks | `camelCase` + `use` prefix | `useAssetAnalysis`, `useMapBounds` |
| Constants | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `DEFAULT_ZOOM` |
| Files (components) | `PascalCase.tsx` | `MapView.tsx` |
| Files (utils/services) | `camelCase.ts` | `assetService.ts`, `geoUtils.ts` |
| CSS classes | `kebab-case` | `upload-zone`, `warning-badge` |
| Type files | `PascalCase.ts` (in `types/`) | `Asset.ts`, `ApiResponse.ts` |

### Component Rules

```tsx
// ✅ CORRECT — component is pure UI, data comes from props/hooks
// Mark with 'use client' if it uses hooks/state
'use client';

interface AssetSummaryProps {
  summary: Record<string, { count: number; total_area_sqm: number }>;
}

export function AssetSummary({ summary }: AssetSummaryProps) {
  return (
    <div className="asset-summary">
      {Object.entries(summary).map(([category, data]) => (
        <SummaryRow key={category} category={category} {...data} />
      ))}
    </div>
  );
}

// ❌ WRONG — component fetches its own data (mixes UI and data logic)
export function AssetSummary() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/official/assets`).then(...);  // never fetch in display component
  }, []);
}
```

### Server vs Client Components

```tsx
// ✅ Server Component (default in Next.js 15 App Router)
// page.tsx — no 'use client' needed
export default function Dashboard() {
  // Can access env vars, DB directly, secrets safely
  return <MapView />;
}

// ✅ Client Component (for interactivity)
// components/MapView.tsx
'use client';

import { useState, useEffect } from 'react';

export function MapView() {
  // useState, useEffect, event handlers here
  return <div id="map" className="w-full h-screen" />;
}
```

### Service Abstraction (Never use raw fetch in components)

```ts
// lib/api/assetService.ts
import { getApiClient } from './client';
import type { AnalyzeResponse, Asset } from '@/types/api';

const apiClient = getApiClient();

export const analyzeImage = async (formData: FormData): Promise<AnalyzeResponse> => {
  const response = await apiClient.post('/public/analyze', formData);
  return response.data;
};

export const getAssetsInBbox = async (bbox: BBox): Promise<Asset[]> => {
  const response = await apiClient.get('/official/assets', { params: bbox });
  return response.data;
};
```

### Next.js App Router Structure

```tsx
// app/page.tsx — Home page
export default function Home() {
  return (
    <main>
      <UploadZone />
      <MapView />
    </main>
  );
}

// app/dashboard/page.tsx — Dashboard page
export default function Dashboard() {
  return (
    <div>
      <AssetSummary />
      <WarningList />
    </div>
  );
}

// app/layout.tsx — Root layout
export const metadata = {
  title: 'AI Spatial Asset Management',
  description: 'Detect and manage urban assets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}
```

```jsx
// ✅ Component uses service via hook
function UploadZone() {
  const { analyze, isLoading, error } = useAssetAnalysis();
  // ...
}

// hooks/useAssetAnalysis.js
import { analyzeImage } from '../services/assetService';
export function useAssetAnalysis() {
  // state + call assetService.analyzeImage()
}
```

### State Management Rules

- **Local UI state** (open/close, hover): `useState` in component
- **Server/async data**: custom hooks wrapping service calls
- **Global app state** (current image, analysis results, warnings): Zustand store
- **Never** put API response data directly in component state — it belongs in the store

### File Size Limits

- Components: max **150 lines** — if longer, split into sub-components
- Hooks: max **80 lines** — if longer, split logic
- Service files: max **100 lines** — group by domain

---

## 4. Database / SQL Rules

- All migrations tracked in `infra/schema.sql` — the single source of truth
- Never alter the DB schema directly in code without updating `schema.sql`
- Every spatial column **must** have a GIST index
- Use UUIDs for all primary keys — never auto-increment integers
- Foreign key constraints required — no orphaned records

---

## 5. Git Workflow

### Branch Naming

```
main          ← production-ready only
dev           ← integration branch, all PRs target here

feature/vision-engine-inference
feature/postgis-asset-save
feature/frontend-map-overlay
fix/mask-polygon-conversion
refactor/split-geo-service
```

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short description>

Types:
  feat     — new feature
  fix      — bug fix
  refactor — code restructure (no behavior change)
  docs     — documentation only
  test     — adding/fixing tests
  chore    — tooling, deps, config

Examples:
  feat(vision): add YOLOv8 mask-to-polygon conversion
  fix(geo): handle edge case for zero-area polygons
  feat(api): add POST /public/analyze endpoint
  refactor(frontend): extract MapView into sub-components
  docs: update ARCHITECTURE.md with Neo4j schema
```

### PR Rules

1. Every PR targets `dev`, never `main`
2. PR must include: what changed, why, how to test
3. At least 1 reviewer approval before merge
4. No PR merges with failing tests
5. **Commit after every stable feature** — do not bundle unrelated changes

---

## 6. Environment & Config Rules

- **Never hardcode secrets** — always use `core/config.py` (Pydantic Settings)
- **Never commit `.env`** — only commit `.env.example` with placeholder values
- All config accessed via `settings.VARIABLE_NAME` — never `os.environ.get()` directly in business code

```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    NEO4J_URI: str
    NEO4J_PASSWORD: str
    GEMINI_API_KEY: str
    MODEL_PATH: str = "ml/weights/best.pt"
    MAX_IMAGE_SIZE_MB: int = 20
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 7. What Is NEVER Allowed

| ❌ Never Do | ✅ Do Instead |
|---|---|
| Business logic in route handlers | Move to service layer |
| DB queries in React components | Use hooks → services → API |
| Raw `os.environ.get()` in services | Use `settings.VARIABLE_NAME` |
| `import *` anywhere | Explicit imports only |
| `print()` for logging | Use Python `logging` module |
| Hardcoded coordinate systems | Use `DEFAULT_CRS` constant |
| Committing model weight files | Add to `.gitignore`, document download steps |
| Merging to `main` directly | Always go through `dev` |
| `any` type hint in Python | Use proper types or `Union` |
