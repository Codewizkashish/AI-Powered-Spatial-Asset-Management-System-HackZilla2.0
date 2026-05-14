'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapControlsProps {
  map: L.Map | null;
  defaultCenter: L.LatLngExpression;
  defaultZoom: number;
  featureBounds: L.LatLngBounds | null;
}

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';
const SATELLITE_ATTRIBUTION = 'Tiles &copy; Esri';

export function MapControls({
  map,
  defaultCenter,
  defaultZoom,
  featureBounds,
}: MapControlsProps) {
  const controlRef = useRef<L.Control | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const featureBoundsRef = useRef<L.LatLngBounds | null>(featureBounds);

  useEffect(() => {
    featureBoundsRef.current = featureBounds;
  }, [featureBounds]);

  useEffect(() => {
    if (!map) return;

    tileLayerRef.current = L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    const control = new L.Control({ position: 'topright' });
    let isSatellite = false;
    let toggleButton: HTMLButtonElement | null = null;

    control.onAdd = () => {
      const container = L.DomUtil.create(
        'div',
        'leaflet-bar bg-surface border border-border shadow-soft'
      );

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      const createButton = (label: string, title: string) => {
        const button = L.DomUtil.create(
          'button',
          'block h-9 w-9 bg-surface text-foreground hover:bg-primary-soft'
        ) as HTMLButtonElement;
        button.type = 'button';
        button.title = title;
        button.textContent = label;
        return button;
      };

      const zoomIn = createButton('+', 'Zoom in');
      const zoomOut = createButton('-', 'Zoom out');
      const reset = createButton('R', 'Reset map view');
      toggleButton = createButton('OSM', 'Toggle satellite imagery');
      toggleButton.className =
        'block h-9 min-w-12 px-2 bg-surface text-xs font-semibold text-foreground hover:bg-primary-soft';

      zoomIn.onclick = () => map.zoomIn();
      zoomOut.onclick = () => map.zoomOut();
      reset.onclick = () => {
        const bounds = featureBoundsRef.current;
        if (bounds?.isValid()) {
          map.fitBounds(bounds, { padding: [36, 36], maxZoom: 18 });
          return;
        }
        map.setView(defaultCenter, defaultZoom);
      };
      toggleButton.onclick = () => {
        if (tileLayerRef.current) {
          map.removeLayer(tileLayerRef.current);
        }

        isSatellite = !isSatellite;
        tileLayerRef.current = L.tileLayer(
          isSatellite ? SATELLITE_TILE_URL : OSM_TILE_URL,
          {
            attribution: isSatellite ? SATELLITE_ATTRIBUTION : OSM_ATTRIBUTION,
            maxZoom: 19,
          }
        ).addTo(map);

        if (toggleButton) {
          toggleButton.textContent = isSatellite ? 'SAT' : 'OSM';
        }
      };

      container.append(zoomIn, zoomOut, reset, toggleButton);
      return container;
    };

    control.addTo(map);
    controlRef.current = control;

    return () => {
      if (controlRef.current) {
        controlRef.current.remove();
        controlRef.current = null;
      }

      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
    };
  }, [defaultCenter, defaultZoom, map]);

  return null;
}
