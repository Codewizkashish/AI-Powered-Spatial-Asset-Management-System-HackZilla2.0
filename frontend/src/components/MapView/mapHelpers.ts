import L from 'leaflet';
import { MAP_CENTER_LAT, MAP_CENTER_LNG } from '@/lib/constants';
import type { GeoJSONFeature, Warning } from '@/types/api';

export function getFeatureAssetId(feature: GeoJSONFeature): string | undefined {
  return feature.properties.asset_id ?? feature.properties.id;
}

export function getFeatureCenter(feature: GeoJSONFeature): L.LatLng | null {
  try {
    const layer = L.geoJSON(feature);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      return bounds.getCenter();
    }

    if (feature.geometry.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates as number[];
      return L.latLng(lat, lng);
    }
  } catch {
    return null;
  }

  return null;
}

export function getWarningPosition(
  warning: Warning,
  features: GeoJSONFeature[]
): L.LatLng | null {
  const lat = warning.latitude ?? warning.lat;
  const lng = warning.longitude ?? warning.lng;

  if (typeof lat === 'number' && typeof lng === 'number') {
    return L.latLng(lat, lng);
  }

  const relatedFeature = features.find(
    (feature) => getFeatureAssetId(feature) === warning.asset_id
  );

  if (relatedFeature) {
    return getFeatureCenter(relatedFeature);
  }

  return features[0] ? getFeatureCenter(features[0]) : null;
}

export function escapeHtml(value: string | number | undefined): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

type Position = [number, number];
type PointLike = {
  lat: number;
  lng: number;
};

function collectPositions(value: unknown, positions: Position[]) {
  if (!Array.isArray(value)) return;

  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    positions.push([value[0], value[1]]);
    return;
  }

  value.forEach((item) => collectPositions(item, positions));
}

function mapCoordinates(value: unknown, mapper: (position: Position) => Position): unknown {
  if (!Array.isArray(value)) return value;

  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    return mapper([value[0], value[1]]);
  }

  return value.map((item) => mapCoordinates(item, mapper));
}

function needsPixelNormalization(positions: Position[]) {
  return positions.some(
    ([lng, lat]) => Math.abs(lat) > 90 || Math.abs(lng) > 180
  );
}

export function normalizeFeatureCoordinates(features: GeoJSONFeature[]): GeoJSONFeature[] {
  const positions: Position[] = [];
  features.forEach((feature) => collectPositions(feature.geometry.coordinates, positions));

  if (positions.length === 0 || !needsPixelNormalization(positions)) {
    return features;
  }

  const lngValues = positions.map(([lng]) => lng);
  const latValues = positions.map(([, lat]) => lat);
  const minX = Math.min(...lngValues);
  const maxX = Math.max(...lngValues);
  const minY = Math.min(...latValues);
  const maxY = Math.max(...latValues);
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const span = 0.035;

  return features.map((feature) => ({
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: mapCoordinates(feature.geometry.coordinates, ([x, y]) => {
        const lng = MAP_CENTER_LNG + ((x - minX) / width - 0.5) * span;
        const lat = MAP_CENTER_LAT - ((y - minY) / height - 0.5) * span;
        return [lng, lat];
      }) as GeoJSONFeature['geometry']['coordinates'],
    },
  }));
}

export function normalizeAssetPoints<T extends PointLike>(points: T[]): T[] {
  if (
    points.length === 0 ||
    !points.some((point) => Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180)
  ) {
    return points;
  }

  const minX = Math.min(...points.map((point) => point.lng));
  const maxX = Math.max(...points.map((point) => point.lng));
  const minY = Math.min(...points.map((point) => point.lat));
  const maxY = Math.max(...points.map((point) => point.lat));
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const span = 0.035;

  return points.map((point) => ({
    ...point,
    lng: MAP_CENTER_LNG + ((point.lng - minX) / width - 0.5) * span,
    lat: MAP_CENTER_LAT - ((point.lat - minY) / height - 0.5) * span,
  }));
}
