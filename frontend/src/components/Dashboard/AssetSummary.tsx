'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ASSET_CATEGORIES } from '@/lib/constants';
import { formatArea, formatNumber } from '@/lib/utils/formatters';

type StatCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  icon: JSX.Element;
  accentChipClass: string;
  accentDotClass: string;
  accentStripClass: string;
  isActive?: boolean;
  onClick?: () => void;
};

function StatCard({
  label,
  value,
  subtitle,
  icon,
  accentChipClass,
  accentDotClass,
  accentStripClass,
  isActive,
  onClick,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left overflow-hidden bg-surface rounded-card border shadow-subtle p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft ${
        isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accentStripClass}`} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${accentChipClass}`}>
            {icon}
          </span>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${accentDotClass}`} />
      </div>
      <div className="mt-3 text-2xl font-semibold text-foreground">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
    </button>
  );
}

function getCategoryIcon(label: string) {
  const baseClass = 'h-5 w-5';

  switch (label.toLowerCase()) {
    case 'building':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 20V6.5A2.5 2.5 0 0 1 6.5 4H17.5A2.5 2.5 0 0 1 20 6.5V20" />
          <path d="M9 20v-4h6v4" />
          <path d="M8 8h2M14 8h2M8 11h2M14 11h2" />
        </svg>
      );
    case 'tree':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3c-3 0-5.5 2.2-5.5 5 0 2 1.2 3.6 3 4.4-1.7.4-3 2-3 3.8 0 2.3 2 4.3 4.5 4.3h1v-4" />
          <path d="M12 3c3 0 5.5 2.2 5.5 5 0 2-1.2 3.6-3 4.4 1.7.4 3 2 3 3.8 0 2.3-2 4.3-4.5 4.3h-1v-4" />
          <path d="M12 16v5" />
        </svg>
      );
    case 'park':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 20c2-5 10-5 12 0" />
          <path d="M12 4c-2.5 0-4.5 2-4.5 4.5S9.5 13 12 13s4.5-2 4.5-4.5S14.5 4 12 4z" />
        </svg>
      );
    case 'water body':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 15c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0 3.5-1 5 0" />
          <path d="M3 11c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0 3.5-1 5 0" />
        </svg>
      );
    case 'road':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 3h6l3 18h-4l-1-4H11l-1 4H6L9 3z" />
          <path d="M12 8v3M12 14v2" />
        </svg>
      );
    case 'drain':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 6h16l-2 12H6L4 6z" />
          <path d="M8 10h8M7 13h10" />
        </svg>
      );
    case 'parking':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M8 4h5a4 4 0 0 1 0 8H8V4z" />
          <path d="M8 12v8" />
        </svg>
      );
    case 'waste':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 7h16" />
          <path d="M9 7V5h6v2" />
          <path d="M6 7l1 12h10l1-12" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      );
    case 'solar panel':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 10h16l-2 8H6l-2-8z" />
          <path d="M8 10V6h8v4" />
          <path d="M7 14h10" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

type AssetSummaryProps = {
  selectedCategory?: string | null;
  onSelectCategory?: (category: string) => void;
};

export default function AssetSummary({ selectedCategory, onSelectCategory }: AssetSummaryProps) {
  const summary = useAppStore((state) => state.summary);

  const categoryStats = useMemo(() => {
    return ASSET_CATEGORIES.map((category) => {
      const data = summary?.[category];
      return {
        label: category,
        count: data?.count ?? 0,
        area: data?.total_area_sqm ?? 0,
      };
    });
  }, [summary]);

  const totals = useMemo(() => {
    return categoryStats.reduce(
      (acc, item) => {
        acc.count += item.count;
        acc.area += item.area;
        return acc;
      },
      { count: 0, area: 0 }
    );
  }, [categoryStats]);

  const accents = [
    {
      chip: 'bg-primary-soft text-primary',
      dot: 'bg-primary',
      strip: 'bg-primary',
    },
    {
      chip: 'bg-secondary-soft text-secondary',
      dot: 'bg-secondary',
      strip: 'bg-secondary',
    },
    {
      chip: 'bg-accent-soft text-accent-foreground',
      dot: 'bg-accent',
      strip: 'bg-accent',
    },
    {
      chip: 'bg-info-soft text-info-foreground',
      dot: 'bg-info',
      strip: 'bg-info',
    },
    {
      chip: 'bg-warning-soft text-warning-foreground',
      dot: 'bg-warning',
      strip: 'bg-warning',
    },
    {
      chip: 'bg-success-soft text-success-foreground',
      dot: 'bg-success',
      strip: 'bg-success',
    },
  ];

  if (!summary) {
    return (
      <div
        className="relative overflow-hidden bg-surface rounded-card border border-border shadow-soft p-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(255,255,255,0.9) 45%, rgba(0,124,137,0.1) 100%)',
        }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
          Portfolio overview
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Asset Summary</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload an image to view asset counts, total area, and coverage.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 rounded-card border border-border bg-surface-elevated" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-card border border-border shadow-soft p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
            Portfolio snapshot
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Asset Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Total assets: {formatNumber(totals.count)}
          </p>
        </div>
        <div className="rounded-control border border-border bg-surface-elevated px-3 py-2 text-sm">
          <span className="text-muted-foreground">Total area</span>
          <span className="ml-2 font-semibold text-foreground">{formatArea(totals.area)}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categoryStats.map((item, index) => {
          const accent = accents[index % accents.length];
          return (
          <StatCard
            key={item.label}
            label={item.label}
            value={formatNumber(item.count)}
            subtitle={`Area: ${formatArea(item.area)}`}
            icon={getCategoryIcon(item.label)}
            accentChipClass={accent.chip}
            accentDotClass={accent.dot}
            accentStripClass={accent.strip}
            isActive={selectedCategory === item.label}
            onClick={() => onSelectCategory?.(item.label)}
          />
          );
        })}
      </div>
    </div>
  );
}
