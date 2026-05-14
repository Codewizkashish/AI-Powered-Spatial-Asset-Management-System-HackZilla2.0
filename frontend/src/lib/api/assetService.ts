import { getApiClient } from './client';
import type { AnalyzeResponse, Asset, Warning, BBox } from '@/types/api';

const getApi = () => getApiClient();

export async function analyzeImage(formData: FormData): Promise<AnalyzeResponse> {
  const response = await getApi().post<AnalyzeResponse>('/public/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getAssetsInBbox(bbox: BBox): Promise<Asset[]> {
  const response = await getApi().get<Asset[]>('/official/assets', {
    params: {
      min_lat: bbox.minLat,
      min_lng: bbox.minLng,
      max_lat: bbox.maxLat,
      max_lng: bbox.maxLng,
    },
  });
  return response.data;
}

export async function getWarnings(): Promise<Warning[]> {
  const response = await getApi().get<Warning[] | { warnings: Warning[] }>('/official/warnings');
  return Array.isArray(response.data) ? response.data : response.data.warnings;
}

export async function sendChatQuery(query: string, imageId: string): Promise<string> {
  const response = await getApi().post<{ response?: string; reply?: string }>('/public/chat', {
    query,
    image_id: imageId,
  });
  return response.data.response ?? response.data.reply ?? '';
}

export async function exportAssets(format: 'geojson' | 'csv'): Promise<Blob> {
  const response = await getApi().get(`/official/export?format=${format}`, {
    responseType: 'blob',
  });
  return response.data;
}
