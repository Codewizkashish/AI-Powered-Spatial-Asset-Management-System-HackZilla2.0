'use client';

import { create } from 'zustand';
import type { GeoJSONFeature, Warning } from '@/types/api';

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
  reset: () =>
    set({
      imageId: null,
      summary: null,
      geojson: null,
      warnings: [],
      isLoading: false,
      error: null,
    }),
}));
