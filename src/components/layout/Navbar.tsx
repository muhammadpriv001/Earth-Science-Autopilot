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
    <header className="sticky top-0 z-50 w-full border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-6 w-6 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              EARTH SCIENCE AUTOPILOT
              <span className="hidden sm:inline-block rounded-full bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                NASA Space Apps
              </span>
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              ASK THE EARTH — Search. Investigate. Discover.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.label}
                {link.badge && (
                  <span className="ml-0.5 rounded bg-cyan-400/20 px-1 py-0.2 text-[9px] font-bold text-cyan-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/autopilot"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Launch Autopilot
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-cyan-900/40 bg-slate-950/95 px-4 pt-2 pb-6 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {NAV_LINKS.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-900 flex flex-col gap-2">
            <Link
              href="/autopilot"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              Launch Autopilot
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

