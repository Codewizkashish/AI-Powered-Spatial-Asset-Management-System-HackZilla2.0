import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Spatial Asset Manager',
  description:
    'AI-powered detection and classification of urban assets from satellite, drone, and aerial imagery.',
  keywords: [
    'spatial asset',
    'geospatial',
    'AI detection',
    'urban mapping',
    'YOLOv8',
    'PostGIS',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
                  Spatial Intelligence Suite
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-info to-success">
                  Spatial Asset Manager
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Urban asset detection powered by AI
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">Live mapping</span>
                <span className="rounded-full border border-border px-3 py-1">Risk analytics</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-surface border-t border-border mt-8">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
            <p>
              AI-powered detection system | Built with Next.js, Leaflet, and
              FastAPI
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
