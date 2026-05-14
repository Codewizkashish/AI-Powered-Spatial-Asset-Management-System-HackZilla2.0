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
        <header className="bg-surface/95 shadow-subtle sticky top-0 z-50 border-b border-border backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-primary">
              Spatial Asset Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Urban asset detection powered by AI
            </p>
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
