'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CATEGORY_COLORS } from '@/lib/constants';
import type { GeoJSONFeature } from '@/types/api';
import { escapeHtml } from './mapHelpers';

interface AssetLayerProps {
  map: L.Map | null;
  features: GeoJSONFeature[];
  onBoundsChange?: (bounds: L.LatLngBounds | null) => void;
}

const FALLBACK_COLOR = '#007c89';

export function AssetLayer({ map, features, onBoundsChange }: AssetLayerProps) {
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (features.length === 0) {
      onBoundsChange?.(null);
      return;
    }

    const layer = L.geoJSON(features, {
      style: (feature) => {
        const category = String(feature?.properties?.category ?? '');
        const color = CATEGORY_COLORS[category] ?? FALLBACK_COLOR;

        return {
          color,
          fillColor: color,
          fillOpacity: 0.28,
          opacity: 0.95,
          weight: 2,
        };
      },
      onEachFeature: (feature, leafletLayer) => {
        const category = escapeHtml(feature.properties?.category);
        const confidence = Number(feature.properties?.confidence ?? 0);
        const area = Number(feature.properties?.area_sqm ?? 0);

        leafletLayer.bindPopup(
          `<div class="min-w-44 text-sm">
            <p class="font-semibold">${category || 'Detected Asset'}</p>
            <p>Confidence: ${(confidence * 100).toFixed(1)}%</p>
            <p>Area: ${area.toFixed(2)} sqm</p>
          </div>`
        );

        leafletLayer.on({
          mouseover: (event) => {
            const target = event.target as L.Path;
            target.setStyle({ fillOpacity: 0.45, weight: 3 });
          },
          mouseout: (event) => {
            layer.resetStyle(event.target);
          },
        });
      },
    }).addTo(map);

    layerRef.current = layer;

    const bounds = layer.getBounds();
    onBoundsChange?.(bounds.isValid() ? bounds : null);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 18 });
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [features, map, onBoundsChange]);

  return null;
}
