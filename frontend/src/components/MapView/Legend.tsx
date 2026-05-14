'use client';

import { CATEGORY_COLORS, SEVERITY_COLORS } from '@/lib/constants';
import type { GeoJSONFeature, Warning } from '@/types/api';

interface LegendProps {
  features: GeoJSONFeature[];
  warnings: Warning[];
}

export function Legend({ features, warnings }: LegendProps) {
  const categories = Array.from(
    new Set(features.map((feature) => feature.properties.category))
  ).filter(Boolean);

  return (
    <div className="absolute bottom-4 left-4 z-[400] max-w-64 rounded-card border border-border bg-surface/95 p-3 text-xs shadow-soft backdrop-blur">
      <p className="mb-2 font-semibold text-foreground">Map intelligence</p>

      <div className="space-y-1">
        {(categories.length > 0 ? categories : ['Building', 'Tree', 'Water Body']).map(
          (category) => (
            <div key={category} className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#007c89' }}
              />
              <span>{category}</span>
            </div>
          )
        )}
      </div>

      {warnings.length > 0 && (
        <div className="mt-3 border-t border-border pt-2">
          <p className="mb-1 font-medium text-foreground">Warnings</p>
          {(['High', 'Medium', 'Low'] as const).map((severity) => (
            <div key={severity} className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[severity] }}
              />
              <span>{severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
