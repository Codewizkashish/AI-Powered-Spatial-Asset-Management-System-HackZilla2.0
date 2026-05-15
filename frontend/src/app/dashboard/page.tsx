'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import UploadZone from '@/components/Upload/UploadZone';
import AssetSummary from '@/components/Dashboard/AssetSummary';
import WarningList from '@/components/Dashboard/WarningList';
import ExportButton from '@/components/Dashboard/ExportButton';
import { MapView } from '@/components/MapView/MapView';
import { useAppStore } from '@/store/useAppStore';
import type { GeoJSONFeature } from '@/types/api';

type AssetPoint = {
  id: string;
  label: string;
  category: string;
  lat: number;
  lng: number;
};

const getFeatureCenter = (feature: GeoJSONFeature) => {
  const { geometry } = feature;
  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates as number[];
    return { lat, lng };
  }

  const coords = geometry.coordinates as number[][][] | number[][];
  const flat = geometry.type === 'Polygon' ? (coords as number[][][]).flat() : (coords as number[][]);
  if (!flat.length) return null;

  const sum = flat.reduce(
    (acc, [lng, lat]) => {
      acc.lat += lat;
      acc.lng += lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / flat.length, lng: sum.lng / flat.length };
};

export default function DashboardPage() {
  const summary = useAppStore((state) => state.summary);
  const warnings = useAppStore((state) => state.warnings);
  const geojson = useAppStore((state) => state.geojson);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [focusedAsset, setFocusedAsset] = useState<AssetPoint | null>(null);

  const assetPoints = useMemo<AssetPoint[]>(() => {
    if (!geojson?.features?.length) return [];
    return geojson.features
      .map((feature, index) => {
        const center = getFeatureCenter(feature);
        if (!center) return null;
        const label = feature.properties.category;
        return {
          id: `${label}-${index}`,
          label: `${label} ${index + 1}`,
          category: label,
          lat: center.lat,
          lng: center.lng,
        };
      })
      .filter((item): item is AssetPoint => Boolean(item));
  }, [geojson]);

  const filteredPoints = selectedCategory
    ? assetPoints.filter((asset) => asset.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8">
        <div
          className="rounded-card border border-border bg-surface shadow-soft px-6 py-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,124,137,0.16) 0%, rgba(37,99,235,0.08) 40%, rgba(21,128,61,0.12) 100%)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
                  Live workspace
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back to Home
                </Link>
              </div>
              <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload satellite images and review detected assets, risks, and coverage.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
                  Live analysis view
                </div>
                <ExportButton />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-card border border-danger bg-danger-soft px-4 py-3 text-sm text-danger-foreground">
            {error}
          </div>
        )}

        <div className="mt-6">
          {isLoading && (!geojson || geojson.features.length === 0) ? (
            <div className="h-[420px] rounded-card border border-border bg-surface-elevated" />
          ) : (
            <div className="rounded-card border border-border bg-surface shadow-soft p-3">
              <MapView
                key={
                  geojson
                    ? `geojson-${geojson.features.length}-${geojson.features
                        .map((feature) => feature.id ?? feature.properties?.id ?? '')
                        .join(',')}`
                    : 'geojson-empty'
                }
                features={geojson?.features}
                highlightPoints={filteredPoints}
                focusedPoint={focusedAsset}
              />
            </div>
          )}
          {summary && warnings.length === 0 && (
            <div className="mt-4 rounded-card border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
              No warnings detected for this image.
            </div>
          )}
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
            <UploadZone />
            <WarningList />
          </div>

          {isLoading && !summary && (
            <div className="rounded-card border border-border bg-surface p-6 shadow-soft">
              <div className="h-5 w-40 rounded-full bg-surface-elevated" />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-24 rounded-card border border-border bg-surface-elevated" />
                ))}
              </div>
            </div>
          )}

          {!isLoading && (
            <AssetSummary
              selectedCategory={selectedCategory}
              onSelectCategory={(category) => {
                setSelectedCategory(category);
                setFocusedAsset(null);
              }}
            />
          )}

          {selectedCategory && (
            <div className="rounded-card border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedCategory} Assets
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tap an asset to focus its location on the map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setFocusedAsset(null);
                  }}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>

              {filteredPoints.length === 0 ? (
                <div className="mt-4 rounded-card border border-border bg-surface-elevated px-4 py-3 text-sm text-muted-foreground">
                  No assets found for this category yet.
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPoints.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setFocusedAsset(asset)}
                      className={`rounded-card border px-4 py-3 text-left transition-colors hover:border-primary ${
                        focusedAsset?.id === asset.id ? 'border-primary bg-primary-soft' : 'border-border bg-surface-elevated'
                      }`}
                    >
                      <div className="text-sm font-semibold text-foreground">{asset.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {asset.lat.toFixed(5)}, {asset.lng.toFixed(5)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
