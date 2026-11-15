'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  GitCompare,
  BookOpen,
  MapPin,
  FolderOpen,
  Activity,
  Layers,
  LogOut,
  LogIn,
  User,
  Plus,
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';

export const PORTAL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/explore', label: 'Explore & AI', icon: Compass, badge: 'Live GIS' },
  { href: '/analysis', label: 'Analysis', icon: TrendingUp },
  { href: '/compare', label: 'Comparison', icon: GitCompare },
  { href: '/forecast', label: 'Predictions', icon: Sparkles, badge: 'Forecast' },
  { href: '/cross-domain', label: 'Cross-Domain', icon: Activity, badge: 'Coupling' },
  { href: '/resources', label: 'Resources', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mainLocation, setAsMainLocation } = useLocation();
  const { user, signOut, savedInvestigations, loadInvestigation } = useAuth();

  return (
    <aside
      className="group/sidebar relative z-40 hidden h-full w-[72px] shrink-0 select-none flex-col overflow-hidden border-r border-emerald-900/60 bg-[#06211b] shadow-[4px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 ease-in-out hover:w-64 md:flex"
    >
      {/* BRAND & LOGO HEADER */}
      <div className="flex items-center px-4 py-3.5 border-b border-emerald-900/30">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
          title="SpaceGeoAI Portal Dashboard"
        >
          {/* Neomorphic / Glassmorphic Glowing Logo Capsule (as in Screenshot V22) */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 shadow-lg shadow-emerald-500/25 group-hover/sidebar:scale-105 transition-transform duration-300">
            <span className="font-mono text-base font-black text-slate-950 tracking-tighter">
              //
            </span>
          </div>

          <div className="flex flex-col min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75">
            <span className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5 truncate">
              SPACEGEOAI
              <span className="rounded-md bg-emerald-400/20 px-1 py-0.2 text-[8px] font-bold text-emerald-300 font-mono">
                V22
              </span>
            </span>
            <span className="text-[10px] text-emerald-300/70 font-mono truncate">Earth Science Portal</span>
          </div>
        </Link>
      </div>

      {/* ACTIVE LOCUS (Expands on Sidebar Hover) */}
      <div className="px-3 py-2.5 border-b border-emerald-900/30 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0b2922]/80 p-2.5 shadow-inner space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              Active Locus
            </span>
            <span className="shrink-0">{mainLocation.radiusKm} km</span>
          </div>
          <div className="text-xs font-bold text-white truncate" title={mainLocation.name}>
            {mainLocation.name.split(',')[0]}
          </div>
          <div className="flex items-center gap-1 pt-1">
            <Link
              href="/explore"
              className="flex-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 py-0.5 text-center text-[10px] font-semibold text-emerald-300 transition-colors"
            >
              Map
            </Link>
            <Link
              href="/analysis"
              className="flex-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 py-0.5 text-center text-[10px] font-semibold text-slate-200 transition-colors"
            >
              Analyze
            </Link>
          </div>
        </div>
      </div>

      {/* PRIMARY NAVIGATION ITEMS (Icon Pill in Rest State, Text on Hover) */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 scrollbar-none">
        {PORTAL_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/forecast' && pathname === '/prediction') ||
            (item.href === '/dashboard' && pathname === '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 text-slate-950 shadow-lg shadow-emerald-400/25 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 active:scale-98'
              }`}
              title={item.label}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                  isActive ? 'text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <span className="flex-1 truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75 whitespace-nowrap">
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold font-mono opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75 ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 border border-slate-950/30'
                      : 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* SAVED INVESTIGATIONS ACCORDION (Revealed on Hover) */}
        <div className="pt-3 border-t border-emerald-900/30 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 font-mono flex items-center gap-1.5">
              <FolderOpen className="h-3 w-3 text-amber-400" />
              Investigations ({savedInvestigations.length})
            </span>
            <Link
              href="/profile?tab=investigations"
              className="text-[10px] text-emerald-400 hover:underline"
            >
              All
            </Link>
          </div>

          {!user ? (
            <div className="rounded-xl border border-emerald-500/20 bg-[#092b23]/70 p-2 text-center space-y-1">
              <div className="text-[10px] font-bold text-amber-300">Guest Mode (Read-Only)</div>
              <p className="text-[9px] text-slate-300 leading-tight">
                Register to save customized investigations.
              </p>
              <Link
                href="/auth/sign-up"
                className="inline-block w-full rounded-lg bg-emerald-500/20 border border-emerald-400/30 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all mt-1"
              >
                Register to Save
              </Link>
            </div>
          ) : savedInvestigations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-900/50 p-2 text-center">
              <p className="text-[10px] text-slate-400">No saved studies</p>
              <Link
                href="/explore"
                className="text-[10px] text-emerald-400 hover:underline font-semibold"
              >
                + Start Study
              </Link>
            </div>
          ) : (
            <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-none">
              {savedInvestigations.slice(0, 3).map(inv => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => {
                    loadInvestigation(inv.id);
                    setAsMainLocation(
                      inv.mainLocation.name,
                      inv.mainLocation.coordinates,
                      inv.mainLocation.radiusKm
                    );
                    router.push('/explore');
                  }}
                  className="w-full text-left rounded-xl border border-emerald-900/40 bg-slate-900/40 p-1.5 hover:border-emerald-400/40 hover:bg-slate-900 transition-colors"
                >
                  <div className="text-[10px] font-semibold text-white truncate">{inv.title}</div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {inv.mainLocation.name.split(',')[0]}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TELEMETRY STATUS MICRO WIDGET */}
        <div className="pt-2 border-t border-emerald-900/30 px-2 space-y-1 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
          <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
            Live NASA Feeds
          </div>
          <div className="flex items-center justify-between text-slate-400 font-mono text-[9px]">
            <span>NASA CMR</span>
            <span className="text-emerald-400">● LIVE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 font-mono text-[9px]">
            <span>NOAA CDO</span>
            <span className="text-emerald-400">● LIVE</span>
          </div>
        </div>
      </div>

      {/* FOOTER: USER / GUEST PROFILE CAPSULE */}
      <div className="mt-auto border-t border-emerald-900/30 p-2.5 bg-[#051a15]/90">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="shrink-0" title="Manage Profile">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-xl object-cover border border-emerald-400/40 shadow-sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-300">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </Link>

            <div className="flex flex-col min-w-0 flex-1 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75">
              <Link
                href="/profile"
                className="text-xs font-semibold text-white truncate hover:text-emerald-300 transition-colors"
              >
                {user.name}
              </Link>
              <span className="text-[9px] text-slate-400 truncate">{user.email}</span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors opacity-0 group-hover/sidebar:opacity-100"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/auth/sign-in"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:scale-105 transition-transform"
              title="Sign In"
            >
              <LogIn className="h-4 w-4" />
            </Link>

            <div className="flex flex-col min-w-0 flex-1 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75">
              <Link
                href="/auth/sign-up"
                className="text-[11px] font-bold text-emerald-300 hover:underline truncate"
              >
                Register Account
              </Link>
              <span className="text-[9px] text-slate-400 truncate">Guest Mode</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
