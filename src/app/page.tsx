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
  UserCheck,
  Trees,
  CloudSun,
  Droplets,
  Waves,
  MountainSnow,
  Flame,
  Activity,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { ParallaxGlobe } from '@/components/landing/ParallaxGlobe';
import { LiveBenchmarkCards } from '@/components/landing/LiveBenchmarkCards';

const DOMAIN_ICONS: Record<string, any> = {
  'Vegetation & Biosphere': Trees,
  'Atmosphere & Climate': CloudSun,
  'Precipitation & Meteorology': Droplets,
  'Soil & Land Moisture': Layers,
  'Hydrology & Freshwater': Droplets,
  'Oceans & Marine Ecosystems': Waves,
  Cryosphere: MountainSnow,
  'Land Surface & Land Use': Globe2,
  'Fire & Environmental Disasters': Flame,
  'Solid Earth & Geophysical Changes': Activity,
  'Human Dimensions & Exposure': Users,
};

export default function LandingPage() {
  return (
    <div className="relative w-full">
      {/* =========================================================================
          HERO SECTION: PRIMARY FOREST GREEN THEME WITH PARALLAX GLOBE BACKGROUND
          ========================================================================= */}
      <section className="relative min-h-[76vh] flex flex-col justify-center bg-gradient-to-b from-[#06211b] via-[#07261f] to-[#0a332a] px-4 pt-10 pb-16 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* PARALLAX GLOBE (CANVAS 3D PARALLAX EFFECT ONLY IN HERO) */}
        <ParallaxGlobe />

        {/* Ambient Top Glow (Celestial Azure & Coral, contrasts sharply with forest background) */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-indigo-500/10 to-transparent blur-3xl opacity-75" />

        {/* CONTENT LAYER OVER GLOBE */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-7">
          {/* Main Title Heading directly on top of the Parallax Globe */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-lg">
            ASK THE EARTH
            <span className="block mt-2 bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              Search. Investigate. Discover.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl mx-auto leading-relaxed drop-shadow">
            The autonomous Earth-science research platform transforming natural-language inquiries into rigorous geospatial time series, deterministic trend detection (Mann-Kendall &amp; Sen&apos;s slope), and reproducible scientific reports.
          </p>

          {/* Call-to-Action Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {/* Warm Coral/Orange Accent Button (as in Dashboard V22 screenshot) */}
            <Link
              href="/auth/sign-up"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/30 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.02] active:scale-98 transition-all duration-200"
            >
              <UserCheck className="h-4 w-4" />
              <span>Create Researcher Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Glowing Mint Glass Button */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 hover:bg-emerald-500/30 px-6 py-4 text-sm font-bold text-emerald-200 hover:text-white shadow-lg shadow-emerald-950/40 backdrop-blur-xl hover:scale-[1.02] active:scale-98 transition-all duration-200"
            >
              <Compass className="h-4 w-4 text-emerald-300" />
              <span>Explore Portal as Guest</span>
            </Link>

            {/* Subtle Glass Sign In Button */}
            <Link
              href="/auth/sign-in"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 hover:bg-black/50 px-5 py-4 text-sm font-semibold text-white backdrop-blur-md transition-colors"
            >
              <span>Sign In</span>
            </Link>
          </div>

          {/* Guest Account vs Registered Researcher Notice */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs text-emerald-200/80 bg-black/30 border border-emerald-500/20 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="text-amber-300 font-bold font-mono">Notice:</span>
              <span>Guests enjoy full read-only analytics &amp; maps. Registering unlocks persistent cloud saves and custom bookmarks.</span>
            </span>
          </div>

          {/* Quick Guided Benchmarks Glass Capsule */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#06211b]/80 p-5 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl text-left">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Featured Case Studies:
                </span>
                {/* Links removed - not redirecting users from the ribbon */}
              </div>

              <LiveBenchmarkCards />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BODY SECTIONS: CLEAN WHITE NEOMORPHISM & GLASSMORPHISM (User Requested)
          ========================================================================= */}
      <div className="bg-[#f8faf9] text-slate-800 transition-colors">
        {/* SECTION 1: MISSION & VISION */}
        <section id="vision" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-200">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              Scientific Vision &amp; Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#07241e] tracking-tight">
              Grounded in Observable Physics, Not Hallucinations
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Earth science inquiries require deterministic statistical rigor. Rather than asking language models to invent climate numbers, SpaceGeoAI queries satellite archives, executes non-parametric statistical tests, and visualizes reproducible trends.
            </p>
          </div>

          {/* 3 Neomorphic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white p-7 border border-emerald-200 shadow-xl shadow-emerald-900/5 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-400/70 transition-all space-y-3">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-orange-400" />
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 flex items-center justify-center font-bold text-sm font-mono shadow-lg shadow-emerald-500/10">
                01
              </div>
              <h3 className="text-base font-bold text-[#07241e]">Non-Parametric Trend Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mann-Kendall test with tie variance adjustments and Sen&apos;s non-parametric slope estimator protect against outliers and skewed non-Gaussian distributions typical of environmental data.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-white p-7 border border-orange-200 shadow-xl shadow-orange-900/5 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-400/70 transition-all space-y-3">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-500" />
              <div className="h-11 w-11 rounded-2xl bg-orange-500/15 border border-orange-500/40 text-orange-700 flex items-center justify-center font-bold text-sm font-mono shadow-lg shadow-orange-500/10">
                02
              </div>
              <h3 className="text-base font-bold text-[#07241e]">Verified Satellite Telemetry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct integration with NASA CMR (MODIS, GPM, SMAP, SWOT) and NOAA Global Historical Climatology Network. Every single data point carries provenance, citation, and resolution metadata.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-orange-50/60 p-7 border border-emerald-200 shadow-xl shadow-emerald-900/5 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-400/60 transition-all space-y-3">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-orange-400" />
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 flex items-center justify-center font-bold text-sm font-mono shadow-lg shadow-emerald-500/10">
                03
              </div>
              <h3 className="text-base font-bold text-[#07241e]">Persistent Research Portfolios</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registered researchers save multi-variable investigations, compare regional divergences, export JSON/CSV snapshots, and resume their studies across sessions seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: 11 EARTH-SYSTEM DOMAINS */}
        <section id="domains" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-200/70">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
                Exhaustive Earth-System Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#07241e] mt-1">
                11 Earth-System Domains &amp; {EARTH_VARIABLES.length} Curated Variables
              </h2>
            </div>
            <Link
              href="/auth/sign-in"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              Browse complete scientific catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EARTH_VARIABLES.slice(0, 9).map((v, index) => {
              const Icon = DOMAIN_ICONS[v.system] || Globe2;
              const isWarm = index % 2 === 1;
              return (
                <div
                  key={v.id}
                  className={`group relative overflow-hidden rounded-3xl p-6 border shadow-xl transition-all flex flex-col justify-between ${isWarm
                    ? 'bg-gradient-to-br from-orange-50 via-white to-white border-orange-200 shadow-orange-900/5 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-400/70'
                    : 'bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-200 shadow-emerald-900/5 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-400/70'
                    }`}
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${isWarm ? 'from-orange-400 via-amber-300 to-emerald-500' : 'from-emerald-500 via-teal-400 to-orange-400'
                      }`}
                  />
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span
                        className={`font-mono font-bold text-[11px] flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${isWarm
                          ? 'text-orange-700 bg-orange-100/80 border-orange-200'
                          : 'text-emerald-700 bg-emerald-100/80 border-emerald-200'
                          }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isWarm ? 'text-orange-600' : 'text-emerald-600'}`} />
                        {v.system}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-mono font-semibold">
                        {v.unit}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#07241e] text-base">{v.name}</h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {v.description}
                    </p>
                  </div>

                  <div
                    className={`pt-4 mt-4 border-t flex items-center justify-between text-[11px] ${isWarm ? 'border-orange-100' : 'border-emerald-100'
                      }`}
                  >
                    <span className="text-slate-500 font-mono text-[10px]">
                      {v.temporalResolution}
                    </span>
                    <Link
                      href="/auth/sign-in"
                      className={`font-bold flex items-center gap-1 ${isWarm ? 'text-orange-700 hover:text-orange-900' : 'text-emerald-700 hover:text-emerald-900'
                        }`}
                    >
                      Run Analytics →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: SCIENTIFIC FORMULATION RIGOR */}
        <section id="science" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-200/70">
          <div className="rounded-3xl bg-gradient-to-tr from-white via-emerald-50/60 to-orange-50/50 p-8 sm:p-12 border border-emerald-200/80 shadow-xl shadow-emerald-900/5 space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
                Audited Statistical Pipeline
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#07241e] mt-1">
                Sen&apos;s Slope Estimator &amp; Holt-Winters Forecasting
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Every calculation executed inside The Earth Science Autopilot is verified by standard scientific packages:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-white p-5 border border-emerald-200 shadow-lg shadow-emerald-900/5 space-y-2">
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-orange-400" />
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#07241e]">Sen&apos;s Non-Parametric Slope</h4>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    O(n²) Median
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-mono">
                  Q = median &#123; (x_j - x_k) / (j - k) &#125; for all 1 ≤ k &lt; j ≤ n
                </p>
                <p className="text-[11px] text-slate-500">
                  Robust against gross data errors, instrument drift, and missing seasonal points.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50/80 via-white to-white p-5 border border-orange-200 shadow-lg shadow-orange-900/5 space-y-2">
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-500" />
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#07241e]">Triple Exponential Smoothing</h4>
                  <span className="text-[10px] font-mono text-orange-700 bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded font-bold">
                    Holt-Winters
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-mono">
                  ŷ_(t+h) = l_t + h·b_t + s_(t - m + h_m)
                </p>
                <p className="text-[11px] text-slate-500">
                  Captures baseline level, annual seasonal amplitude, and non-linear trend components.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CALL TO ACTION BANNER */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-200/70 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-[#06211b] p-10 sm:p-14 shadow-2xl text-white space-y-6 max-w-4xl mx-auto border border-emerald-500/30">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-orange-400" />
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Investigating Earth Systems
            </h2>
            <p className="text-sm text-emerald-100/80 max-w-lg mx-auto leading-relaxed">
              Create your researcher account to unlock persistent cloud saves, or launch directly into the portal as a guest.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/auth/sign-up"
                className="rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-8 py-3.5 text-xs font-bold text-white shadow-xl shadow-orange-500/30 hover:from-orange-400 hover:to-amber-500 transition-all hover:scale-[1.02]"
              >
                Register Free Researcher Account
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 hover:bg-emerald-500/30 px-8 py-3.5 text-xs font-bold text-emerald-200 hover:text-white transition-colors"
              >
                Open Portal as Guest
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
