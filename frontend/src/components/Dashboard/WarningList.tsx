'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ASSET_CATEGORIES } from '@/lib/constants';
import { getSeverityBadgeColor } from '@/lib/utils/formatters';
import type { Warning } from '@/types/api';

type AssetMeta = {
  label: string;
  icon: ReactNode;
};

const SEVERITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const CATEGORY_KEYWORDS = [
  { label: 'Building', keywords: ['building'] },
  { label: 'Tree', keywords: ['tree'] },
  { label: 'Park', keywords: ['park'] },
  { label: 'Water Body', keywords: ['water', 'lake', 'pond', 'river'] },
  { label: 'Road', keywords: ['road', 'street', 'highway'] },
  { label: 'Drain', keywords: ['drain', 'drainage'] },
  { label: 'Parking', keywords: ['parking'] },
  { label: 'Waste', keywords: ['waste', 'garbage', 'dump'] },
  { label: 'Solar Panel', keywords: ['solar'] },
];

function getAssetMeta(issueType: string): AssetMeta {
  const lowerIssue = issueType.toLowerCase();
  const matched = CATEGORY_KEYWORDS.find((category) =>
    category.keywords.some((keyword) => lowerIssue.includes(keyword))
  );
  const label = matched?.label ?? 'Asset';

  switch (label) {
    case 'Building':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 20V6.5A2.5 2.5 0 0 1 6.5 4H17.5A2.5 2.5 0 0 1 20 6.5V20" />
            <path d="M9 20v-4h6v4" />
            <path d="M8 8h2M14 8h2M8 11h2M14 11h2" />
          </svg>
        ),
      };
    case 'Tree':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 3c-3 0-5.5 2.2-5.5 5 0 2 1.2 3.6 3 4.4-1.7.4-3 2-3 3.8 0 2.3 2 4.3 4.5 4.3h1v-4" />
            <path d="M12 3c3 0 5.5 2.2 5.5 5 0 2-1.2 3.6-3 4.4 1.7.4 3 2 3 3.8 0 2.3-2 4.3-4.5 4.3h-1v-4" />
            <path d="M12 16v5" />
          </svg>
        ),
      };
    case 'Park':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 20c2-5 10-5 12 0" />
            <path d="M12 4c-2.5 0-4.5 2-4.5 4.5S9.5 13 12 13s4.5-2 4.5-4.5S14.5 4 12 4z" />
          </svg>
        ),
      };
    case 'Water Body':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 15c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0 3.5-1 5 0" />
            <path d="M3 11c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0 3.5-1 5 0" />
          </svg>
        ),
      };
    case 'Road':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 3h6l3 18h-4l-1-4H11l-1 4H6L9 3z" />
            <path d="M12 8v3M12 14v2" />
          </svg>
        ),
      };
    case 'Drain':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16l-2 12H6L4 6z" />
            <path d="M8 10h8M7 13h10" />
          </svg>
        ),
      };
    case 'Parking':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M8 4h5a4 4 0 0 1 0 8H8V4z" />
            <path d="M8 12v8" />
          </svg>
        ),
      };
    case 'Waste':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 7h16" />
            <path d="M9 7V5h6v2" />
            <path d="M6 7l1 12h10l1-12" />
            <path d="M10 11v5M14 11v5" />
          </svg>
        ),
      };
    case 'Solar Panel':
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 10h16l-2 8H6l-2-8z" />
            <path d="M8 10V6h8v4" />
            <path d="M7 14h10" />
          </svg>
        ),
      };
    default:
      return {
        label,
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="8" />
          </svg>
        ),
      };
  }
}

function normalizeAssetLabel(label: string) {
  if (ASSET_CATEGORIES.includes(label)) {
    return label;
  }
  return label;
}

export default function WarningList() {
  const warnings = useAppStore((state) => state.warnings);

  const sortedWarnings = useMemo(() => {
    return [...warnings].sort((a, b) => {
      const severityOrder =
        (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
      if (severityOrder !== 0) return severityOrder;
      return a.issue_type.localeCompare(b.issue_type);
    });
  }, [warnings]);

  if (!warnings || warnings.length === 0) {
    return (
      <div
        className="relative overflow-hidden rounded-card border border-border bg-surface shadow-soft p-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(220,38,38,0.06) 0%, rgba(255,255,255,0.9) 40%, rgba(245,158,11,0.08) 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
              Risk monitor
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            </div>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Risk Warnings</h2>
          </div>
          <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-xs text-muted-foreground">
            0 active
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          No warnings detected yet. Alerts will appear here once analysis runs.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map((item) => (
            <div key={item} className="h-20 rounded-card border border-border bg-surface-elevated" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-card border border-border shadow-soft p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Risk Warnings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {warnings.length} active alerts sorted by severity
          </p>
        </div>
        <div className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
          Severity-ranked
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {sortedWarnings.map((warning) => {
          const assetMeta = getAssetMeta(warning.issue_type);
          const assetLabel = normalizeAssetLabel(assetMeta.label);

          return (
            <div
              key={warning.id}
              className="flex flex-col gap-3 rounded-card border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground">
                  {assetMeta.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{assetLabel}</p>
                  <p className="text-xs text-muted-foreground">{warning.issue_type}</p>
                  {warning.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{warning.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityBadgeColor(
                    warning.severity
                  )}`}
                >
                  {warning.severity}
                </span>
                {warning.asset_id && (
                  <span className="text-xs text-muted-foreground">ID: {warning.asset_id.slice(0, 6)}...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
