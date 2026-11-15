import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LocationProvider } from '@/context/LocationContext';
import { AuthProvider } from '@/context/AuthAndInvestigationContext';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'The Earth Science Autopilot | spacegeoai.com',
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

// Mobile-first viewport configuration: safe-area aware with a forest-green
// browser chrome that matches the portal navigation.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#06211b' },
    { media: '(prefers-color-scheme: dark)', color: '#06211b' },
  ],
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
      <body className="flex min-h-dvh flex-col bg-[#f8faf9] font-sans text-slate-900 antialiased selection:bg-emerald-500/25 selection:text-emerald-900">
        <AuthProvider>
          <LocationProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
