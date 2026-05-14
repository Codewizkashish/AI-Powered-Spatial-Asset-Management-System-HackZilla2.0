# Next.js Migration Guide
**From React to Next.js 15 + App Router**

> Last Updated: 2025 | Migration for AI Spatial Asset Management System

---

## 1. Why Next.js?

| Benefit | Details |
|---|---|
| **Server Components** | Render components on the server, reduce JS bundle, faster initial load |
| **Built-in Routing** | File-based routing in `app/` directory, no need for React Router |
| **Image Optimization** | Automatic image optimization for Leaflet map tiles |
| **API Routes** | Built-in API layer for middleware and CORS handling |
| **SSR/SSG Ready** | Perfect for map initialization and SEO |
| **TypeScript** | First-class TypeScript support out of the box |
| **Tailwind CSS** | Pre-configured Tailwind CSS |
| **Development Speed** | Fast Refresh, better error messages, built-in testing setup |

---

## 2. Recommended Next.js Version

### **Next.js 15.x** ✅ RECOMMENDED
- **Latest stable release** with all modern features
- **App Router** (file-based routing, Server Components)
- **Leaf let.js compatibility**: Excellent (use `'use client'` for map components)
- **TypeScript**: Full support with strict mode
- **Package Size**: Optimized, lightweight
- **Performance**: Best in class

#### Package Versions
```json
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.6.0",
  "tailwindcss": "^3.4.0"
}
```

---

## 3. Directory Structure Migration

### Before (React)
```
frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx           # Entry point
│   ├── App.jsx            # Root component
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   └── utils/
└── public/
```

### After (Next.js)
```
frontend/
├── package.json
├── next.config.ts         # Next.js config (replaces vite.config.js)
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
├── src/
│   ├── app/               # NEW: App Router directory
│   │   ├── layout.tsx     # Root layout (replaces main.jsx)
│   │   ├── page.tsx       # Home page (replaces App.jsx)
│   │   ├── globals.css    # Global styles
│   │   ├── api/           # API routes (optional)
│   │   └── dashboard/
│   │       └── page.tsx   # Dashboard page
│   │
│   ├── components/
│   ├── lib/               # RENAMED from services/
│   │   ├── api/           # API clients
│   │   └── utils/         # Utility functions
│   ├── hooks/
│   ├── store/
│   ├── types/             # NEW: TypeScript types
│   └── constants.ts       # NEW: Centralized constants
└── public/
```

---

## 4. Key Migration Steps

### Step 1: Initialize Next.js Project
```bash
cd frontend
# Option A: Create new Next.js project
npx create-next-app@latest . --typescript --tailwind --app

# Option B: Manual setup
npm install next@15 react@19 react-dom@19 typescript tailwindcss postcss autoprefixer
npx next telemetry disable
```

### Step 2: Create Basic Directory Structure
```bash
mkdir -p src/{app,components,lib/api,hooks,store,types,constants}
touch src/app/layout.tsx src/app/page.tsx src/app/globals.css
```

### Step 3: Update Environment Variables
```bash
# .env.local (replaces .env)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MAP_CENTER_LAT=20.5937
NEXT_PUBLIC_MAP_CENTER_LNG=78.9629
NEXT_PUBLIC_MAP_ZOOM=4
```

> **Important**: Variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

### Step 4: Update Package Dependencies

#### Install Required Packages
```bash
npm install \
  leaflet react-leaflet \
  zustand \
  axios \
  classnames
```

#### DevDependencies
```bash
npm install --save-dev \
  @types/leaflet \
  @types/node
```

### Step 5: Migrate Component Files

#### app/layout.tsx (Root Layout)
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Spatial Asset Management',
  description: 'Detect and manage urban assets from satellite imagery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-slate-50 to-slate-100">
        {children}
      </body>
    </html>
  );
}
```

#### app/page.tsx (Home Page)
```tsx
'use client'; // Mark as Client Component since it uses hooks

import { UploadZone } from '@/components/Upload/UploadZone';
import { MapView } from '@/components/MapView/MapView';
import { AssetSummary } from '@/components/Dashboard/AssetSummary';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const { summary, geojson } = useAppStore();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-3xl font-bold text-blue-600">
          🛰️ Spatial Asset Manager
        </h1>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Upload Section */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
          <UploadZone />
        </div>

        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <MapView features={geojson?.features || []} />
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="bg-white shadow-md p-4 mx-4 mb-4 rounded-lg">
          <AssetSummary summary={summary} />
        </div>
      )}
    </main>
  );
}
```

#### app/dashboard/page.tsx
```tsx
'use client';

import { AssetSummary } from '@/components/Dashboard/AssetSummary';
import { WarningList } from '@/components/Dashboard/WarningList';
import { ExportButton } from '@/components/Dashboard/ExportButton';
import { useAppStore } from '@/store/useAppStore';

export default function Dashboard() {
  const { summary, warnings } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          {summary && <AssetSummary summary={summary} />}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          {warnings && warnings.length > 0 ? (
            <WarningList warnings={warnings} />
          ) : (
            <p className="text-gray-500">No warnings at this time</p>
          )}
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-md p-4">
        <ExportButton />
      </div>
    </div>
  );
}
```

### Step 6: Convert React Components to Client Components

#### Before (React with .jsx)
```jsx
// components/MapView/MapView.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useAppStore } from '../../store/useAppStore';

export function MapView() {
  const mapRef = useRef(null);
  const { geojson } = useAppStore();

  useEffect(() => {
    // map initialization
  }, []);

  return <div ref={mapRef} className="w-full h-screen" />;
}
```

#### After (Next.js with .tsx)
```tsx
// components/MapView/MapView.tsx
'use client'; // Required for hooks/state

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '@/store/useAppStore';
import type { GeoJSONFeature } from '@/types/api';

interface MapViewProps {
  features?: GeoJSONFeature[];
}

export function MapView({ features }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT || '20.5937'), 
         parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG || '78.9629')],
        parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM || '4')
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Add GeoJSON layer
    if (features && features.length > 0) {
      L.geoJSON(
        {
          type: 'FeatureCollection',
          features: features,
        },
        {
          style: {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.4,
          },
        }
      ).addTo(mapRef.current);
    }
  }, [features]);

  return <div ref={containerRef} className="w-full h-screen rounded-lg" />;
}
```

### Step 7: Create API Service Layer

#### lib/constants.ts
```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
export const MAP_CENTER_LAT = parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT || '20.5937');
export const MAP_CENTER_LNG = parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG || '78.9629');
export const DEFAULT_ZOOM = parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM || '4');
```

#### lib/api/client.ts
```ts
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    apiClient.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  return apiClient;
}
```

#### lib/api/assetService.ts
```ts
import { getApiClient } from './client';
import type { AnalyzeResponse, Asset, Warning, BBox } from '@/types/api';

const apiClient = getApiClient();

export async function analyzeImage(formData: FormData): Promise<AnalyzeResponse> {
  const response = await apiClient.post<AnalyzeResponse>('/public/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getAssetsInBbox(bbox: BBox): Promise<Asset[]> {
  const response = await apiClient.get<Asset[]>('/official/assets', {
    params: {
      min_lat: bbox.minLat,
      min_lon: bbox.minLng,
      max_lat: bbox.maxLat,
      max_lon: bbox.maxLng,
    },
  });
  return response.data;
}

export async function getWarnings(): Promise<Warning[]> {
  const response = await apiClient.get<Warning[]>('/official/warnings');
  return response.data;
}

export async function exportAssets(format: 'geojson' | 'csv'): Promise<Blob> {
  const response = await apiClient.get(`/official/export?format=${format}`, {
    responseType: 'blob',
  });
  return response.data;
}
```

### Step 8: Update Store (Zustand)

#### store/useAppStore.ts
```ts
'use client';

import { create } from 'zustand';
import type { GeoJSONFeature, Warning, Asset } from '@/types/api';

interface AppState {
  // State
  imageId: string | null;
  summary: Record<string, { count: number; total_area_sqm: number }> | null;
  geojson: { type: 'FeatureCollection'; features: GeoJSONFeature[] } | null;
  warnings: Warning[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setImageId: (id: string) => void;
  setSummary: (summary: AppState['summary']) => void;
  setGeojson: (geojson: AppState['geojson']) => void;
  setWarnings: (warnings: Warning[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  imageId: null,
  summary: null,
  geojson: null,
  warnings: [],
  isLoading: false,
  error: null,

  // Actions
  setImageId: (id) => set({ imageId: id }),
  setSummary: (summary) => set({ summary }),
  setGeojson: (geojson) => set({ geojson }),
  setWarnings: (warnings) => set({ warnings }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    imageId: null,
    summary: null,
    geojson: null,
    warnings: [],
    isLoading: false,
    error: null,
  }),
}));
```

### Step 9: Create TypeScript Types

#### types/api.ts
```ts
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    category: string;
    confidence: number;
    area_sqm: number;
  };
}

export interface AnalyzeResponse {
  image_id: string;
  summary: Record<string, { count: number; total_area_sqm: number }>;
  geojson: {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
  };
  warnings: Warning[];
}

export interface Asset {
  id: string;
  image_id: string;
  asset_category: string;
  confidence_score: number;
  area_sqm: number;
  geometry: GeoJSONFeature['geometry'];
}

export interface Warning {
  id: string;
  asset_id: string;
  issue_type: string;
  severity: 'High' | 'Medium' | 'Low';
  created_at: string;
}

export interface BBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}
```

### Step 10: Update package.json

```json
{
  "name": "spatial-asset-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "zustand": "^4.4.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/leaflet": "^1.9.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

---

## 5. Key Differences: React vs Next.js

| Feature | React (Vite) | Next.js 15 |
|---|---|---|
| **Entry Point** | `main.jsx` in `src/` | `layout.tsx` in `app/` |
| **Routing** | React Router | File-based App Router |
| **Environment Vars** | `VITE_*` prefix | `NEXT_PUBLIC_*` prefix |
| **CSS Import** | Vite supports any CSS | Tailwind built-in, global styles in `globals.css` |
| **Component Type** | Functional (Client) | Server Components by default, `'use client'` for Client |
| **Build** | `npm run build` → Vite | `npm run build` → Next.js |
| **Dev Server** | `npm run dev` (Vite) | `npm run dev` (Next.js) |
| **API Routes** | External backend | Can use `app/api/` routes |
| **TypeScript** | Optional | Built-in support |
| **Performance** | Good | Better (Server Components reduce JS) |

---

## 6. Common Pitfalls

### ❌ Leaflet Map Not Rendering
```tsx
// ❌ Wrong: Map tries to access DOM on server
export function MapView() {
  return <div ref={mapRef} />;
}

// ✅ Correct: Mark as Client Component
'use client';
export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Now safe to access DOM
  }, []);
  return <div ref={containerRef} />;
}
```

### ❌ Environment Variables Not Accessible
```ts
// ❌ Wrong: Missing NEXT_PUBLIC_ prefix
// .env.local
API_URL=http://localhost:8000

// ✅ Correct: Add NEXT_PUBLIC_ prefix
// .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### ❌ Importing Server-Only Code in Client Components
```tsx
// ❌ Wrong
'use client';
import { dbQuery } from '@/lib/db'; // Server-only function

export function MyComponent() {
  dbQuery(); // Error!
}

// ✅ Correct: Use API routes
'use client';
import { getAssetsInBbox } from '@/lib/api/assetService';

export function MyComponent() {
  const assets = await getAssetsInBbox(bbox); // API call
}
```

---

## 7. Running Your Next.js App

```bash
cd frontend

# Install dependencies
npm install

# Development
npm run dev
# Open http://localhost:3000

# Build for production
npm build

# Production mode
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 8. Deployment Options

| Platform | Command | Notes |
|---|---|---|
| **Vercel** | `npm run build && npm start` | Next.js native |
| **Docker** | `docker build . && docker run` | Create Dockerfile |
| **Railway** | Connect GitHub repo | Auto-deploy on push |
| **Self-hosted** | `npm run build && npm start` | Node.js 18+ required |

---

## 9. Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [TypeScript in Next.js](https://nextjs.org/docs/getting-started/typescript)
- [Leaflet + React best practices](https://react-leaflet.js.org/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## 10. Checklist for Migration

- [ ] Initialize Next.js 15 project
- [ ] Install dependencies (leaflet, zustand, axios, etc.)
- [ ] Create `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/store/`, `src/types/`
- [ ] Create `app/layout.tsx` and `app/page.tsx`
- [ ] Create `.env.local` with `NEXT_PUBLIC_*` vars
- [ ] Migrate `services/` → `lib/api/`
- [ ] Convert components from `.jsx` → `.tsx` with proper `'use client'` marking
- [ ] Create TypeScript types in `types/`
- [ ] Setup Zustand store in `store/useAppStore.ts`
- [ ] Update `next.config.ts` and `tailwind.config.ts`
- [ ] Test locally: `npm run dev`
- [ ] Update documentation (README, ARCHITECTURE, CODING_RULES)
- [ ] Deploy to Vercel or your hosting provider

---

**Status**: ✅ All files have been updated to reflect Next.js 15. Ready for implementation!
