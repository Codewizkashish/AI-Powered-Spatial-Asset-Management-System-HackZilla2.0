'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
              Spatial Asset Manager
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold text-foreground">
              AI-powered spatial intelligence for urban assets
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Upload satellite imagery, detect assets, and surface risks in a
              single dashboard built for rapid decision-making.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Open Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-control border border-border bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
              >
                View Live Map
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Assets monitored', value: '10K+', note: 'Across public infrastructure' },
                { label: 'Avg. analysis time', value: '< 60s', note: 'Per satellite image' },
                { label: 'Risk alerts', value: 'Multi-tier', note: 'High to low severity' },
              ].map((item) => (
                <div key={item.label} className="rounded-card border border-border bg-surface p-4 shadow-subtle">
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">{item.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface shadow-soft p-6">
            <h2 className="text-lg font-semibold text-foreground">What you can do</h2>
            <div className="mt-4 space-y-3">
              {[
                'Upload imagery and trigger AI analysis',
                'Track asset counts and total area',
                'Review warnings ranked by severity',
                'Explore assets on an interactive map',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-card border border-border bg-surface-elevated px-4 py-3 text-xs text-muted-foreground">
              Everything is centralized inside the dashboard so you never lose context.
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Detection pipeline',
              body: 'Automated extraction of buildings, roads, green cover, and water bodies with confidence scoring.',
            },
            {
              title: 'Risk insights',
              body: 'Surface encroachments, drainage blockages, and anomalies with severity-ranked alerts.',
            },
            {
              title: 'Operational export',
              body: 'Download GeoJSON for planning, GIS operations, and compliance reporting.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-card border border-border bg-surface p-6 shadow-subtle">
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
