'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Layers,
  Database,
  Cpu,
  LineChart,
  GitCompare,
  BookOpen,
  FolderGit2,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/variables', label: 'Variables', icon: Layers },
  { href: '/datasets', label: 'Datasets', icon: Database },
  { href: '/autopilot', label: 'Autopilot', icon: Cpu, badge: 'AI' },
  { href: '/analysis', label: 'Time-Series', icon: LineChart },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all">
      <div className="mx-auto max-w-7xl">
        {/* Floating Frosted Pill Nav Bar */}
        <div className="pointer-events-auto relative flex items-center justify-between gap-3 sm:gap-4 rounded-full border border-white/10 bg-slate-950/75 px-3.5 sm:px-5 py-2 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl ring-1 ring-white/10 before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/40 before:to-transparent">
          {/* Brand & Compact Pill Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Compass className="h-4 w-4 text-white animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                EARTH SCIENCE AUTOPILOT
                <span className="hidden md:inline-block rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 text-[9px] font-semibold text-cyan-300">
                  NASA Space Apps
                </span>
              </span>
              <span className="hidden xl:block text-[10px] font-medium text-slate-400 leading-tight mt-0.5">
                ASK THE EARTH — Search. Investigate. Discover.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                  {link.label}
                  {link.badge && (
                    <span className="ml-0.5 rounded-full bg-cyan-400/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/autopilot"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Launch Autopilot
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Frosted Dropdown Pill Menu */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto mt-2 rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 xl:hidden">
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map(link => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-2xl p-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/autopilot"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25"
              >
                <Sparkles className="h-4 w-4" />
                Launch Autopilot
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-200"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
