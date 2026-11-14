'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopLocationBar } from './TopLocationBar';
import { Sidebar } from './Sidebar';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Landing page ('/') and Auth pages ('/auth/*') are in the public domain, NOT inside the portal
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth');

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#06211b] flex flex-col w-full">
        <PublicNavbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col w-full">
        <PublicNavbar />
        <main className="flex-1 w-full flex items-center justify-center">{children}</main>
        <Footer />
      </div>
    );
  }

  // PORTAL APPLICATION DOMAIN (/dashboard, /explore, /forecast, /analysis, /compare, /resources, /profile)
  // Consistently uses Dashboard V22 Theme: Deep Forest Green (#061d18), Clean White Neomorphism (#edf2ef canvas), Coral & Mint Accents
  return (
    <div className="h-screen bg-[#edf2ef] flex flex-col w-full overflow-hidden text-slate-800">
      {/* Top Location & Locus Bar (Deep Forest Green & Glassmorphism) */}
      <TopLocationBar />

      <div className="flex flex-1 h-[calc(100vh-53px)] overflow-hidden">
        {/* Left Vertical Portal Sidebar Navigation (Fixed in place, never scrolls away) */}
        <Sidebar />

        {/* Portal Page Main Content Area (Scrolls independently while sidebar stays pinned) */}
        <main className="flex-1 min-w-0 h-full flex flex-col bg-[#edf2ef] text-slate-800 overflow-y-auto">
          <div className="flex-1 w-full">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
