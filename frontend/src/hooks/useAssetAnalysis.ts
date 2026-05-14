'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { analyzeImage, getWarnings, sendChatQuery } from '@/lib/api/assetService';

export function useAssetAnalysis() {
  const { setLoading, setError, setSummary, setGeojson, setWarnings, setImageId } = useAppStore();

  const analyze = useCallback(
    async (file: File) => {
      try {
        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append('image', file);

        const result = await analyzeImage(formData);
        setImageId(result.image_id);
        setSummary(result.summary);
        setGeojson(result.geojson);
        setWarnings(result.warnings);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSummary, setGeojson, setWarnings, setImageId]
  );

  const fetchWarnings = useCallback(async () => {
    try {
      const warnings = await getWarnings();
      setWarnings(warnings);
      return warnings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch warnings';
      setError(errorMessage);
      throw err;
    }
  }, [setWarnings, setError]);

  const sendQuery = useCallback(
    async (query: string, imageId: string) => {
      try {
        const response = await sendChatQuery(query, imageId);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send query';
        setError(errorMessage);
        throw err;
      }
    },
    [setError]
  );

  return { analyze, fetchWarnings, sendQuery };
}
