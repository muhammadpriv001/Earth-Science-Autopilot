import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'The Earth Science Autopilot | ASK THE EARTH',
  description: 'AI-assisted Earth-science research, geospatial exploration, and deterministic statistical trend detection for NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!',
  keywords: [
    'NASA Space Apps Challenge 2026',
    'Earth System Trend Detective',
    'Earth Science',
    'Geospatial AI',
    'Mann-Kendall Trend Test',
    'Sens Slope',
    'Climate Trends',
    'NASA CMR',
    'NOAA CDO',
  ],
  authors: [{ name: 'Earth Science Autopilot Team', url: 'https://spacegeoai.com' }],
  metadataBase: new URL('https://spacegeoai.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* Leaflet Free OpenStreetMap Engine Styles & Scripts */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          async
        />
      </head>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-300 flex flex-col">
        <Navbar />
        <main className="flex-1 w-full pt-2 sm:pt-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
