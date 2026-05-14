'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import { analyzeImage } from '@/lib/api/assetService';
import { formatArea } from '@/lib/utils/formatters';

const MapView = dynamic(
  () => import('@/components/MapView/MapView').then((module) => module.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[28rem] rounded-card border border-border bg-surface shadow-soft" />
    ),
  }
);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isLoading, setLoading, setError, error, setSummary, setGeojson, setWarnings, setImageId } = useAppStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image');
      return;
    }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const summary = useAppStore((state) => state.summary);
  const warnings = useAppStore((state) => state.warnings);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-card shadow-soft border border-border p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Upload Image</h2>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-card p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary-soft'
                  : 'border-border-strong bg-surface-elevated hover:border-primary'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-foreground font-medium">
                  {file ? file.name : 'Drag image here or click'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported: JPG, PNG, GeoTIFF
                </p>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="w-full mt-4 bg-primary hover:bg-primary-hover disabled:bg-muted text-primary-foreground disabled:text-surface font-medium py-2 px-4 rounded-control transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-danger-soft border border-danger text-danger-foreground rounded-control">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <MapView />
          </div>

          {summary && (
            <div className="bg-surface rounded-card shadow-soft border border-border p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Detection Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(summary).map(([category, data]) => (
                  <div
                    key={category}
                    className="border border-border rounded-card bg-surface-elevated p-4 hover:shadow-subtle transition-shadow"
                  >
                    <p className="text-sm text-muted-foreground font-medium">{category}</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {data.count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total Area: {formatArea(data.total_area_sqm)}
                    </p>
                  </div>
                ))}
              </div>

              {warnings && warnings.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-3">Warnings</h3>
                  <div className="space-y-2">
                    {warnings.map((warning) => (
                      <div
                        key={warning.id}
                        className={`p-3 rounded-card text-sm ${
                          warning.severity === 'High'
                            ? 'bg-danger-soft text-danger-foreground'
                            : warning.severity === 'Medium'
                            ? 'bg-warning-soft text-warning-foreground'
                            : 'bg-accent-soft text-accent-foreground'
                        }`}
                      >
                        <strong>{warning.issue_type}</strong> ({warning.severity})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!summary && !isLoading && (
            <div className="bg-surface rounded-card shadow-soft border border-border p-6 text-center text-muted-foreground">
              <p className="text-lg">Upload an image to see analysis results</p>
            </div>
          )}

          {isLoading && (
            <div className="bg-surface rounded-card shadow-soft border border-border p-6 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="mt-2 text-muted-foreground">Analyzing image...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
