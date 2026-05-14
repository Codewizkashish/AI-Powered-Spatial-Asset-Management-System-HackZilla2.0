'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER_LAT, MAP_CENTER_LNG, DEFAULT_ZOOM } from '@/lib/constants';
import { useAppStore } from '@/store/useAppStore';
import type { GeoJSONFeature, Warning } from '@/types/api';
import { AssetLayer } from './AssetLayer';
import { FocusLayer, type AssetPoint } from './FocusLayer';
import { Legend } from './Legend';
import { MapControls } from './MapControls';
import { WarningMarker } from './WarningMarker';
import { normalizeAssetPoints, normalizeFeatureCoordinates } from './mapHelpers';

interface MapViewProps {
  features?: GeoJSONFeature[];
  warnings?: Warning[];
  highlightPoints?: AssetPoint[];
  focusedPoint?: AssetPoint | null;
}

export function MapView({
  features,
  warnings,
  highlightPoints = [],
  focusedPoint = null,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [featureBounds, setFeatureBounds] = useState<L.LatLngBounds | null>(null);
  const storeGeojson = useAppStore((state) => state.geojson);
  const storeWarnings = useAppStore((state) => state.warnings);
  const rawFeatures = features ?? storeGeojson?.features ?? [];
  const mapFeatures = useMemo(
    () => normalizeFeatureCoordinates(rawFeatures),
    [rawFeatures]
  );
  const mapWarnings = warnings ?? storeWarnings;
  const normalizedHighlightPoints = useMemo(
    () => normalizeAssetPoints(highlightPoints),
    [highlightPoints]
  );
  const normalizedFocusedPoint = useMemo(() => {
    if (!focusedPoint) return null;
    return (
      normalizedHighlightPoints.find((point) => point.id === focusedPoint.id) ??
      normalizeAssetPoints([focusedPoint])[0] ??
      null
    );
  }, [focusedPoint, normalizedHighlightPoints]);
  const defaultCenter = useMemo<L.LatLngExpression>(
    () => [MAP_CENTER_LAT, MAP_CENTER_LNG],
    []
  );

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds | null) => {
    setFeatureBounds(bounds);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
      }).setView(defaultCenter, DEFAULT_ZOOM);
      setMap(mapRef.current);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, [defaultCenter]);

  useEffect(() => {
    map?.invalidateSize();
  }, [map]);

  return (
    <div className="relative min-h-[28rem] overflow-hidden rounded-card border border-border bg-surface shadow-soft">
      <div ref={containerRef} className="h-[28rem] w-full" />
      <AssetLayer
        map={map}
        features={mapFeatures}
        onBoundsChange={handleBoundsChange}
      />
      <WarningMarker map={map} features={mapFeatures} warnings={mapWarnings} />
      <FocusLayer
        map={map}
        highlightPoints={normalizedHighlightPoints}
        focusedPoint={normalizedFocusedPoint}
      />
      <MapControls
        map={map}
        defaultCenter={defaultCenter}
        defaultZoom={DEFAULT_ZOOM}
        featureBounds={featureBounds}
      />
      <Legend features={mapFeatures} warnings={mapWarnings} />
    </div>
  );
}
