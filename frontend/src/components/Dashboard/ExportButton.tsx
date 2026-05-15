'use client';

import { useState } from 'react';
import { exportAssets } from '@/lib/api/assetService';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAppStore } from '@/store/useAppStore';

const EXPORT_FORMAT = 'geojson';

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageId = useAppStore((state) => state.imageId);
  const geojson = useAppStore((state) => state.geojson);

  const handleExport = async () => {
    try {
      setError(null);
      setIsExporting(true);

      const blob = geojson
        ? new Blob([JSON.stringify(geojson, null, 2)], {
            type: 'application/geo+json',
          })
        : await exportAssets(EXPORT_FORMAT);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `assets-${imageId ?? 'latest'}.${EXPORT_FORMAT}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 rounded-control border border-transparent bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted"
      >
        <span>Export GeoJSON</span>
        <span className="text-xs text-primary-foreground/80">{isExporting ? 'Working...' : '.geojson'}</span>
      </button>

      {error && (
        <div className="mt-2 text-xs text-danger-foreground">
          {error}
        </div>
      )}
    </div>
  );
}
