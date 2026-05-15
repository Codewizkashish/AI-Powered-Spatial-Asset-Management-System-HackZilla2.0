'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export type AssetPoint = {
  id: string;
  label: string;
  category: string;
  lat: number;
  lng: number;
};

interface FocusLayerProps {
  map: L.Map | null;
  highlightPoints: AssetPoint[];
  focusedPoint: AssetPoint | null;
}

export function FocusLayer({
  map,
  highlightPoints,
  focusedPoint,
}: FocusLayerProps) {
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const group = L.layerGroup();

    highlightPoints.forEach((point) => {
      const isFocused = focusedPoint?.id === point.id;
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: isFocused ? 11 : 7,
        color: isFocused ? '#ffffff' : '#007c89',
        weight: isFocused ? 3 : 2,
        fillColor: isFocused ? '#007c89' : '#d9f3f4',
        fillOpacity: isFocused ? 0.95 : 0.78,
      });

      marker.bindPopup(
        `<div class="min-w-36 text-sm">
          <p class="font-semibold">${point.label}</p>
          <p>${point.category}</p>
        </div>`
      );

      marker.addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;

    if (focusedPoint) {
      map.flyTo([focusedPoint.lat, focusedPoint.lng], Math.max(map.getZoom(), 17), {
        duration: 0.7,
      });
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [focusedPoint, highlightPoints, map]);

  return null;
}
