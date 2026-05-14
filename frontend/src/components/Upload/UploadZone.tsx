'use client';

import { useState } from 'react';
import { analyzeImage } from '@/lib/api/assetService';
import { useAppStore } from '@/store/useAppStore';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'done';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [progress, setProgress] = useState(0);

  const {
    isLoading,
    setLoading,
    setError,
    error,
    setSummary,
    setGeojson,
    setWarnings,
    setImageId,
    reset,
  } = useAppStore();

  const resetProgress = () => {
    setUploadStage('idle');
    setProgress(0);
  };

  const clearSelection = () => {
    setFile(null);
    setError(null);
    resetProgress();
    reset();
  };

  const validateFile = (candidate: File) => {
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      setError('Only JPG and PNG images are supported.');
      return false;
    }

    if (candidate.size > MAX_FILE_BYTES) {
      setError(`File size must be under ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelected = (candidate: File) => {
    setError(null);

    if (!validateFile(candidate)) {
      setFile(null);
      resetProgress();
      return;
    }

    setFile(candidate);
    resetProgress();
  };

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
      handleFileSelected(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFileSelected(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setUploadStage('uploading');
      setProgress(25);

      const formData = new FormData();
      formData.append('image', file);

      setUploadStage('processing');
      setProgress(70);

      const result = await analyzeImage(formData);
      setImageId(result.image_id);
      setSummary(result.summary);
      setGeojson(result.geojson);
      setWarnings(result.warnings);

      setUploadStage('done');
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image.');
      resetProgress();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden bg-surface rounded-card shadow-soft border border-border p-6"
      style={{
        background:
          'linear-gradient(135deg, rgba(0,124,137,0.06) 0%, rgba(255,255,255,0.9) 45%, rgba(21,128,61,0.08) 100%)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: 'linear-gradient(90deg, var(--primary), var(--info), var(--success))' }}
      />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Upload Image</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Drag and drop or browse your image for instant AI analysis.
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            uploadStage === 'done'
              ? 'bg-success-soft text-success-foreground border-success'
              : uploadStage === 'processing'
              ? 'bg-warning-soft text-warning-foreground border-warning'
              : uploadStage === 'uploading'
              ? 'bg-primary-soft text-primary-foreground border-primary'
              : 'bg-surface-elevated text-muted-foreground border-border'
          }`}
        >
          <span
            className={`mr-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-current ${
              uploadStage === 'uploading' || uploadStage === 'processing' ? 'animate-pulse' : ''
            }`}
          />
          {uploadStage === 'done'
            ? 'Ready'
            : uploadStage === 'processing'
            ? 'Processing'
            : uploadStage === 'uploading'
            ? 'Uploading'
            : 'Idle'}
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-card p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary-soft shadow-subtle'
            : 'border-border-strong bg-surface-elevated hover:border-primary'
        }`}
      >
        <div
          className="absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -left-10 -bottom-12 h-28 w-28 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-subtle border border-border">
            <span className="text-3xl">📁</span>
          </div>
          <p className="mt-3 text-foreground font-semibold truncate">
            {file ? file.name : 'Drag image here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG or PNG • Max {MAX_FILE_SIZE_MB}MB
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs text-muted-foreground border border-border">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {isDragging ? 'Drop to upload' : 'Secure upload, no data stored'}
          </div>
        </label>
      </div>

      {file && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-2.5 py-1">
              {file.type.replace('image/', '').toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-2.5 py-1">
              {Math.max(1, Math.round(file.size / 1024)).toLocaleString()} KB
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleFileSelected(file)}
              className="text-primary hover:text-primary-hover transition-colors"
            >
              Recheck
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-danger-foreground hover:text-danger transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="w-full mt-4 bg-primary hover:bg-primary-hover disabled:bg-muted text-primary-foreground disabled:text-surface font-semibold py-2.5 px-4 rounded-control transition-all shadow-soft disabled:shadow-none disabled:cursor-not-allowed hover:-translate-y-0.5"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {(uploadStage === 'uploading' || uploadStage === 'processing' || uploadStage === 'done') && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>
              {uploadStage === 'uploading'
                ? 'Uploading'
                : uploadStage === 'processing'
                ? 'Processing'
                : 'Done'}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-elevated">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--info), var(--success))',
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-danger-soft border border-danger text-danger-foreground rounded-control">
          {error}
        </div>
      )}
    </div>
  );
}
