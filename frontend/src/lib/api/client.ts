import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    apiClient.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    apiClient.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
  }

  return apiClient;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return `Backend is not reachable at ${API_BASE_URL}. Start the FastAPI server or check CORS/API URL.`;
    }

    const detail = error.response.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(', ');
    }

    return `Request failed with status ${error.response.status}.`;
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}
