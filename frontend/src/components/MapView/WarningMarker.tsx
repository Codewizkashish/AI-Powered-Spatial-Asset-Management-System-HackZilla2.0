'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { GeoJSONFeature, Warning } from '@/types/api';
import { escapeHtml, getWarningPosition } from './mapHelpers';

interface WarningMarkerProps {
  map: L.Map | null;
  features: GeoJSONFeature[];
  warnings: Warning[];
}

const SEVERITY_RADIUS: Record<string, number> = {
  Critical: 14,
  High: 12,
  Medium: 10,
  Low: 8,
};

export function WarningMarker({
  map,
  features,
  warnings,
}: WarningMarkerProps) {
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const markerGroup = L.layerGroup();

    warnings.forEach((warning) => {
      const position = getWarningPosition(warning, features);
      if (!position) return;

      const color = SEVERITY_COLORS[warning.severity] ?? SEVERITY_COLORS.Low;
      const marker = L.circleMarker(position, {
        radius: SEVERITY_RADIUS[warning.severity] ?? SEVERITY_RADIUS.Low,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.92,
      });

      marker.bindPopup(
        `<div class="min-w-44 text-sm">
          <p class="font-semibold">${escapeHtml(warning.issue_type)}</p>
          <p>Severity: ${escapeHtml(warning.severity)}</p>
          <p>${escapeHtml(warning.description)}</p>
          <p>Asset ID: ${escapeHtml(warning.asset_id)}</p>
        </div>`
      );

      marker.addTo(markerGroup);
    });

    markerGroup.addTo(map);
    layerRef.current = markerGroup;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [features, map, warnings]);

  return null;
}
