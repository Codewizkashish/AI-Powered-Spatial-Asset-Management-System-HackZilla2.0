'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER_LAT, MAP_CENTER_LNG, DEFAULT_ZOOM } from '@/lib/constants';
import type { GeoJSONFeature } from '@/types/api';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

interface MapViewProps {
  features?: GeoJSONFeature[];
}

export function MapView({ features }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [MAP_CENTER_LAT, MAP_CENTER_LNG],
        DEFAULT_ZOOM
      );

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Update GeoJSON layer when features change
    if (features && features.length > 0) {
      // Remove old layer
      if (geoJsonLayerRef.current) {
        mapRef.current?.removeLayer(geoJsonLayerRef.current);
      }

      const featureCollection: FeatureCollection<
        Geometry,
        GeoJSONFeature['properties']
      > = {
        type: 'FeatureCollection',
        features: features as Feature<Geometry, GeoJSONFeature['properties']>[],
      };

      // Create new GeoJSON layer
      geoJsonLayerRef.current = L.geoJSON(
        featureCollection,
        {
          style: {
            color: '#007c89',
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.4,
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const popup = L.popup().setContent(
                `<div class="text-sm">
                  <p><strong>${feature.properties.category}</strong></p>
                  <p>Confidence: ${(feature.properties.confidence * 100).toFixed(1)}%</p>
                  <p>Area: ${feature.properties.area_sqm.toFixed(2)} m²</p>
                </div>`
              );
              layer.bindPopup(popup);
            }
          },
        }
      );

      geoJsonLayerRef.current.addTo(mapRef.current);

      // Fit bounds to features
      const bounds = geoJsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [features]);

  return (
    <div
      ref={containerRef}
      className="w-full h-96 rounded-card shadow-soft border border-border"
    />
  );
}
