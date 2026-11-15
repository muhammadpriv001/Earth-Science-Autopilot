'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopLocationBar } from './TopLocationBar';
import { Sidebar } from './Sidebar';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Landing page ('/') and Auth pages ('/auth/*') are in the public domain, NOT inside the portal
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth');

  if (isLandingPage) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#06211b]">
        <div className="sticky top-0 z-50 hidden md:block">
          <PublicNavbar />
        </div>
        <main className="w-full flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#f8faf9]">
        <div className="sticky top-0 z-50 hidden md:block">
          <PublicNavbar />
        </div>
        <main className="flex w-full flex-1 items-center justify-center">{children}</main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  // PORTAL APPLICATION DOMAIN (/dashboard, /explore, /forecast, /analysis, /compare, /resources, /profile)
  // Consistently uses Dashboard V22 Theme: Deep Forest Green (#061d18), Clean White Neomorphism (#edf2ef canvas), Coral & Mint Accents
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#edf2ef] text-slate-800">
      {/* Top Location & Locus Bar (Deep Forest Green & Glassmorphism) */}
      <TopLocationBar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Vertical Portal Sidebar Navigation (desktop/tablet only) */}
        <Sidebar />

        {/* Portal Page Main Content Area (Scrolls independently while sidebar stays pinned) */}
        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#edf2ef] text-slate-800">
          <div className="w-full flex-1">{children}</div>
          <Footer />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
