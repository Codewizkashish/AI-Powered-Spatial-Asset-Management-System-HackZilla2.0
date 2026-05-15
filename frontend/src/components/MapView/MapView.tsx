'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER_LAT, MAP_CENTER_LNG, DEFAULT_ZOOM } from '@/lib/constants';
import type { GeoJSONFeature } from '@/types/api';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

interface MapViewProps {
  features?: GeoJSONFeature[];
  highlightPoints?: {
    id: string;
    label: string;
    lat: number;
    lng: number;
  }[];
  focusedPoint?: {
    id: string;
    label: string;
    lat: number;
    lng: number;
  } | null;
}

export function MapView({ features, highlightPoints, focusedPoint }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const highlightLayerRef = useRef<L.Layer | null>(null);
  const highlightMarkersRef = useRef<L.LayerGroup | null>(null);

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

      if (!mapRef.current.getPane('assetMarkers')) {
        mapRef.current.createPane('assetMarkers');
        mapRef.current.getPane('assetMarkers')!.style.zIndex = '650';
      }
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

            layer.on('click', () => {
              if (!mapRef.current) return;

              if (highlightLayerRef.current) {
                mapRef.current.removeLayer(highlightLayerRef.current);
              }

              const layerWithBounds = layer as L.Polygon | L.Polyline;
              const layerWithPoint = layer as L.Marker;
              const bounds = 'getBounds' in layerWithBounds ? layerWithBounds.getBounds() : null;
              const center = bounds
                ? bounds.getCenter()
                : 'getLatLng' in layerWithPoint
                ? layerWithPoint.getLatLng()
                : mapRef.current.getCenter();
              const highlight = L.circleMarker(center, {
                radius: 14,
                color: '#f59e0b',
                weight: 3,
                fillColor: '#fde68a',
                fillOpacity: 0.85,
              });

              highlight.addTo(mapRef.current);
              highlightLayerRef.current = highlight;
            });
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

  useEffect(() => {
    if (!mapRef.current) return;

    if (highlightMarkersRef.current) {
      mapRef.current.removeLayer(highlightMarkersRef.current);
    }

    if (!highlightPoints || highlightPoints.length === 0) {
      highlightMarkersRef.current = null;
      return;
    }

    const markers = L.layerGroup([], { pane: 'assetMarkers' });
    highlightPoints.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 9,
        color: '#0f766e',
        weight: 3,
        fillColor: '#5eead4',
        fillOpacity: 0.95,
        pane: 'assetMarkers',
      });
      const popupContent = document.createElement('div');
      popupContent.className = 'text-sm font-semibold';
      popupContent.textContent = point.label;
      marker.bindPopup(popupContent);
      marker.on('click', () => {
        marker.openPopup();
        mapRef.current?.setView([point.lat, point.lng], 17);
      });
      markers.addLayer(marker);
    });

    markers.addTo(mapRef.current);
    highlightMarkersRef.current = markers;

    if (highlightPoints.length > 0) {
      const bounds = L.latLngBounds(highlightPoints.map((point) => [point.lat, point.lng]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [highlightPoints]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (highlightLayerRef.current) {
      mapRef.current.removeLayer(highlightLayerRef.current);
      highlightLayerRef.current = null;
    }

    if (!focusedPoint) return;

    const highlight = L.circleMarker([focusedPoint.lat, focusedPoint.lng], {
      radius: 14,
      color: '#f59e0b',
      weight: 3,
      fillColor: '#fde68a',
      fillOpacity: 0.85,
    });
    highlight.addTo(mapRef.current);
    highlightLayerRef.current = highlight;
    mapRef.current.setView([focusedPoint.lat, focusedPoint.lng], 18);
  }, [focusedPoint]);

  return (
    <div
      ref={containerRef}
      className="w-full h-96 rounded-card shadow-soft border border-border"
    />
  );
}
