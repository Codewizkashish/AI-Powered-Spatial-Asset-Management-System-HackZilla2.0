import L from 'leaflet';
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
