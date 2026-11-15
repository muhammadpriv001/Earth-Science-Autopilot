'use client';

import React, { useEffect, useState } from 'react';
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
  GitCompare,
  Trees,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { useAuth, SavedInvestigation } from '@/context/AuthAndInvestigationContext';
import { useLocation } from '@/context/LocationContext';
import { useRouter } from 'next/navigation';

interface BenchmarkStudy {
  id: string;
  title: string;
  variable: string;
  region: string;
  provider: string;
  period: string;
  unit: string;
  trendPerYear: number | null;
  pValue: number | null;
  significant: boolean;
  direction: 'INCREASING' | 'DECREASING' | 'NO_TREND';
  error?: string;
}

function formatPValue(p: number | null): string {
  if (p === null || !Number.isFinite(p)) return 'p unavailable';
  return p < 0.0001 ? 'p < 0.0001' : `p = ${p.toFixed(4)}`;
}

function formatTrend(study: BenchmarkStudy): string {
  if (study.error || study.trendPerYear === null) return 'Live data unavailable';
  const sign = study.trendPerYear > 0 ? '+' : '';
  return `${sign}${study.trendPerYear.toFixed(3)} ${study.unit}/year`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, savedInvestigations, loadInvestigation } = useAuth();
  const { setAsMainLocation } = useLocation();

  const [studies, setStudies] = useState<BenchmarkStudy[]>([]);
  const [benchmarkLoading, setBenchmarkLoading] = useState(true);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/benchmarks')
      .then(res => res.json())
      .then((data: { studies?: BenchmarkStudy[]; error?: string }) => {
        if (!active) return;
        if (data.studies) {
          setStudies(data.studies);
        } else {
          setBenchmarkError(data.error || 'Live benchmark studies could not be loaded.');
        }
      })
      .catch(() => {
        if (active) setBenchmarkError('Live benchmark studies could not be loaded.');
      })
      .finally(() => {
        if (active) setBenchmarkLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleReopen = (inv: SavedInvestigation) => {
    loadInvestigation(inv.id);
    setAsMainLocation(inv.mainLocation.name, inv.mainLocation.coordinates, inv.mainLocation.radiusKm);
    router.push('/explore');
  };

  return (
    <div className="mx-auto max-w-[1920px] space-y-6 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      {/* Top Banner / Welcome: Dashboard V22 Deep Pine Green Hero Card with Coral Accent CTA */}
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-emerald-900/40 bg-gradient-to-r from-[#06211b] via-[#07241e] to-[#0a2e26] p-5 shadow-2xl backdrop-blur-xl sm:gap-6 sm:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">
              SPACEGEOAI PORTAL • OPERATIONAL V22
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Earth Science Research Command
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            {user ? (
              <>Welcome back, <strong className="text-emerald-300">{user.name}</strong>. </>
            ) : (
              <>Welcome to the Earth-System Intelligence System. </>
            )}
            Investigate environmental variables, run Sen&apos;s slope &amp; Mann-Kendall statistics, and explore multi-decade trends across the globe.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:gap-3">
          {/* Coral / Peach Accent Button (as in Dashboard V22 screenshot "Add member") */}
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Compass className="h-4 w-4" />
            Launch Explore &amp; AI
          </Link>
          <Link
            href="/forecast"
            className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Forecast AI Lab
          </Link>
        </div>
      </div>

      {/* Metrics Row: Pure White Neomorphic Cards on #edf2ef Canvas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">11 Earth Domains</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {EARTH_VARIABLES.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Curated Scientific Variables
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Data Providers</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">4 Live</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            NASA CMR, ERA5, NOAA, SWOT
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Statistical Rigor</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">Mann-Kendall</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Tie Variance + Sen Slope Estimator
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Saved Projects</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">{savedInvestigations.length} Projects</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Saved to User Profile
          </div>
        </div>
      </div>

      {/* Main Grid: Saved Investigations + Benchmark Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Saved Investigations & Guided Benchmarks (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Saved Projects Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-bold text-slate-900">
                <FolderGit2 className="h-5 w-5 shrink-0 text-amber-500" />
                Your Active Investigations ({savedInvestigations.length})
              </h2>
              <Link
                href="/profile?tab=investigations"
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                View all in profile →
              </Link>
            </div>

            {savedInvestigations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-[#f8faf9] p-8 text-center space-y-2">
                <FolderGit2 className="h-8 w-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No saved investigations yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Explore global variables, calculate Sen&apos;s slope &amp; Mann-Kendall statistics, and click &quot;Save Investigation&quot; in the top bar to persist your research.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition-all mt-2"
                >
                  <Compass className="h-4 w-4" /> Start Exploring
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {savedInvestigations.map(inv => (
                  <div
                    key={inv.id}
                    className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4.5 hover:border-emerald-500/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono text-emerald-700 text-[10px] font-bold uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {inv.selectedVariable.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(inv.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{inv.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {inv.description || inv.notes}
                      </p>
                    </div>
                    <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                        {inv.mainLocation.name.split(',')[0]}
                      </span>
                      <button
                        onClick={() => handleReopen(inv)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                      >
                        Reopen Project →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Benchmark Guided Studies Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-bold text-slate-900">
                <LineChart className="h-5 w-5 shrink-0 text-teal-600" />
                NASA Challenge Guided Benchmark Studies
              </h2>
            </div>

            <div className="space-y-2.5">
              {benchmarkLoading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-[#f8faf9] p-6 text-center text-xs text-slate-500">
                  Loading live NASA POWER and NSIDC measurements…
                </div>
              ) : benchmarkError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  {benchmarkError}
                </div>
              ) : (
                studies.map(study => (
                  <Link
                    key={study.id}
                    href={`/analysis?preset=${study.id}`}
                    className="block rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4 hover:border-emerald-500/50 hover:bg-white hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {study.title} ({study.period})
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {study.variable} • {study.region}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {study.provider}
                          {!study.error && ` • ${formatPValue(study.pValue)}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-mono font-bold ${
                            study.error
                              ? 'border-slate-300 bg-slate-100 text-slate-500'
                              : 'border-emerald-300 bg-emerald-100/80 text-emerald-800'
                          }`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          {formatTrend(study)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Navigation & Telemetry */}
        <div className="space-y-6">
          {/* Quick Launch Cards */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Direct Portal Navigation
            </h3>
            <div className="space-y-2">
              <Link
                href="/explore"
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3.5 hover:border-emerald-500/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Explore &amp; AI GIS</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
              <Link
                href="/forecast"
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3.5 hover:border-purple-500/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Forecast AI Engine</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
              <Link
                href="/analysis"
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3.5 hover:border-teal-500/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                    <LineChart className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Time-Series &amp; Vegetation</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
              <Link
                href="/compare"
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3.5 hover:border-orange-500/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
                    <GitCompare className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Regional Comparison</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* NASA & Telemetry Status Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              Data Source Connectivity
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">NASA Earthdata CMR</span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Online (v2 API)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">OpenStreetMap Nominatim</span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Connected (0 API Keys)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">NOAA GHCND Weather</span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">ESRI World Dark Canvas</span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
