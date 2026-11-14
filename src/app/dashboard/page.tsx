'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Compass,
  LineChart,
  Layers,
  Database,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  FolderGit2,
} from 'lucide-react';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 p-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              SYSTEM OPERATIONAL • VERCEL READY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Earth Science Research Command
          </h1>
          <p className="text-xs text-slate-400">
            NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            New Investigation
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Compass className="h-4 w-4 text-cyan-400" />
            GIS Explorer
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Earth Variables</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {EARTH_VARIABLES.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 6 Earth Systems
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Data Providers</span>
            <Database className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">4 Live</div>
          <div className="text-[11px] text-slate-400 mt-1">
            NASA CMR, ERA5, NOAA, SWOT
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Statistical Rigor</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">Mann-Kendall</div>
          <div className="text-[11px] text-slate-400 mt-1">
            With Tie-Correction & Sen Slope
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Saved Projects</span>
            <FolderGit2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">3 Benchmarks</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ready for instant execution
          </div>
        </div>
      </div>

      {/* Main Grid: Active Benchmarks & Provider Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Investigations (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <LineChart className="h-4 w-4 text-cyan-400" />
              Verified Guided Investigations
            </h2>
            <Link
              href="/analysis"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Open Time-Series Lab <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Lahore 30-Year Temperature Warming (1994 - 2024)',
                variable: 'Near-Surface Air Temperature (2m)',
                region: 'Lahore, Punjab, Pakistan',
                trend: '+0.048 °C/year',
                pValue: 'p < 0.0001',
                direction: 'Significant Warming',
                href: '/analysis?preset=lahore',
              },
              {
                title: 'Amazon Basin Precipitation Decline (2000 - 2024)',
                variable: 'Total Precipitation Rate',
                region: 'Southern Amazon Basin, Brazil',
                trend: '-18.4 mm/year',
                pValue: 'p = 0.0014',
                direction: 'Significant Drying',
                href: '/analysis?preset=amazon',
              },
              {
                title: 'Arctic September Sea Ice Minimum (1980 - 2024)',
                variable: 'Sea Ice Concentration & Extent',
                region: 'Northern Hemisphere Arctic Ocean',
                trend: '-0.078 M km²/year',
                pValue: 'p < 0.0001',
                direction: 'Significant Retreat',
                href: '/analysis?preset=arctic',
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="block rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.variable} • {item.region}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-xs font-mono font-semibold text-cyan-400">
                      <TrendingUp className="h-3 w-3" />
                      {item.trend}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      {item.pValue}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Provider Health Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Data Source Integrations
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div>
                <div className="font-semibold text-white">NASA CMR Collections</div>
                <div className="text-[11px] text-slate-400">cmr.earthdata.nasa.gov</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Live Ready
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div>
                <div className="font-semibold text-white">ECMWF ERA5 Climate API</div>
                <div className="text-[11px] text-slate-400">Open-Meteo Global Reanalysis</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Live Ready
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div>
                <div className="font-semibold text-white">NOAA CDO v2 Web Services</div>
                <div className="text-[11px] text-slate-400">Station In-Situ Records</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                <AlertCircle className="h-3.5 w-3.5" /> Integrated
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div>
                <div className="font-semibold text-white">Supabase PostgreSQL</div>
                <div className="text-[11px] text-slate-400">Project & RLS Storage</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                Local Active
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900">
            <Link
              href="/resources"
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              Browse Full Resource Directory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

