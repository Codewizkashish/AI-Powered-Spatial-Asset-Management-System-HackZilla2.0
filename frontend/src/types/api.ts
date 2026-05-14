export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'Point' | 'LineString';
    coordinates: number[][][] | number[][] | number[];
  };
  properties: {
    category: string;
    confidence: number;
    area_sqm: number;
  };
}

export interface AnalyzeResponse {
  image_id: string;
  summary: Record<string, { count: number; total_area_sqm: number }>;
  geojson: {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
  };
  warnings: Warning[];
}

export interface Asset {
  id: string;
  image_id: string;
  asset_category: string;
  confidence_score: number;
  area_sqm: number;
  geometry: GeoJSONFeature['geometry'];
}

export interface Warning {
  id: string;
  asset_id: string;
  issue_type: string;
  severity: 'High' | 'Medium' | 'Low';
  created_at: string;
}

export interface BBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}
