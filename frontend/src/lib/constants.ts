export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
export const MAP_CENTER_LAT = parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT || '20.5937');
export const MAP_CENTER_LNG = parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG || '78.9629');
export const DEFAULT_ZOOM = parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM || '4');

export const ASSET_CATEGORIES = [
  'Building',
  'Tree',
  'Park',
  'Water Body',
  'Road',
  'Drain',
  'Parking',
  'Waste',
  'Solar Panel',
];

export const SEVERITY_COLORS: Record<string, string> = {
  High: '#dc2626',
  Medium: '#d97706',
  Low: '#b7791f',
};
