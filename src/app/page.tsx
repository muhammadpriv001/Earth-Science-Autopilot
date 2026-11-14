import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Database,
  ShieldCheck,
  Globe2,
  Cpu,
  BarChart3,
  GitCompare,
  FileText,
} from 'lucide-react';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';

export default function LandingPage() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-600/20 via-blue-600/10 to-transparent blur-3xl opacity-70" />

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
        {/* Challenge Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!
        </div>

        {/* Main Headings */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          ASK THE EARTH
          <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Search. Investigate. Discover.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The AI-assisted Earth-science research platform that transforms natural-language inquiries into rigorous geospatial time series, non-parametric trend detections, and reproducible scientific reports.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/autopilot"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Launch Research Autopilot
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Globe2 className="h-4 w-4 text-cyan-400" />
            Explore Global Map
          </Link>
          <Link
            href="/analysis"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            Time-Series Lab
          </Link>
        </div>

        {/* Quick Guided Investigations Banner */}
        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 max-w-3xl mx-auto backdrop-blur-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Try a Guided Scientific Investigation:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <Link
              href="/analysis?preset=lahore"
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-colors"
            >
              <div className="font-semibold text-cyan-300">Lahore Warming</div>
              <div className="text-[11px] text-slate-400 mt-0.5">30-Year Temperature Anomalies</div>
            </Link>
            <Link
              href="/analysis?preset=amazon"
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-colors"
            >
              <div className="font-semibold text-cyan-300">Amazon Drying</div>
              <div className="text-[11px] text-slate-400 mt-0.5">25-Year Precipitation Trends</div>
            </Link>
            <Link
              href="/analysis?preset=arctic"
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-colors"
            >
              <div className="font-semibold text-cyan-300">Arctic Sea Ice</div>
              <div className="text-[11px] text-slate-400 mt-0.5">September Minimum Decline</div>
            </Link>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Answers Grounded in Scientific Data, Not AI Hallucinations
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Every statistic is calculated deterministically with audited mathematical routines: Mann-Kendall test with tie variance adjustments and Sen&apos;s non-parametric slope estimator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl hover:border-cyan-500/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Research Autopilot</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Ask natural questions like &quot;Has surface temperature increased in Lahore over the last 30 years?&quot; The AI translates your question into a verifiable plan.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl hover:border-cyan-500/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">NASA CMR & NOAA Discovery</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Live programmatic discovery of NASA Earth-observation collections (MODIS, GPM, SMAP, SWOT) and NOAA Global Historical Climatology Network daily station records.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl hover:border-cyan-500/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
              <GitCompare className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Regional Comparison Engine</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Compare two distinct geographic regions to discover spatial divergences—demonstrating that a parameter may increase in one basin while declining in another.
            </p>
          </div>
        </div>
      </section>

      {/* 6 EARTH SYSTEMS PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Earth System Variable Library
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Curated variables with units, measurement principles, and satellite sensor lineage
            </p>
          </div>
          <Link
            href="/variables"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View all {EARTH_VARIABLES.length} variables <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EARTH_VARIABLES.slice(0, 6).map(variable => (
            <div
              key={variable.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-cyan-400 font-semibold">{variable.system}</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                  {variable.unit}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">{variable.name}</h4>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {variable.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
