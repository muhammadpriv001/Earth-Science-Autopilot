'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import Link from 'next/link';
import {
  Trees,
  Leaf,
  AlertTriangle,
  ArrowRight,
  Database,
  ShieldCheck,
  Droplets,
  CloudSun,
  Activity,
} from 'lucide-react';

const DEFAULT_WINDOW = {
  startDate: new Date().getUTCFullYear() - 10,
  endDate: new Date().getUTCFullYear(),
};

const LIVE_ALTERNATIVES = [
  {
    title: 'Air & Land-Surface Temperature',
    description: 'NASA POWER monthly reanalysis for any point on land or ocean.',
    href: '/analysis',
    icon: CloudSun,
  },
  {
    title: 'Precipitation & Soil Moisture',
    description: 'Couple rainfall with root-zone soil moisture to study water availability.',
    href: '/cross-domain',
    icon: Droplets,
  },
  {
    title: 'Sea-Ice Extent',
    description: 'NSIDC Sea Ice Index monthly extent for the Arctic and Antarctic.',
    href: '/forecast',
    icon: Activity,
  },
];

export default function VegetationWorkspacePage() {
  const [liveNDVI, setLiveNDVI] = useState<{ configured: boolean; status: string; series?: any } | null>(null);
  const [isLoadingNDVI, setIsLoadingNDVI] = useState(false);
  const {
    mainLocation,
    setAsMainLocation,
    setRadiusKm,
    toggleRadiusLock,
  } = useLocation();

  // Fetch live NDVI/EVI series from the AppEEARS-enabled API route
  useEffect(() => {
    let cancelled = false;
    const loadLiveNDVI = async () => {
      setIsLoadingNDVI(true);
      try {
        const lat = mainLocation.coordinates?.[1];
        const lng = mainLocation.coordinates?.[0];
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const response = await fetch(`/api/vegetation/ndvi?lat=${lat}&lng=${lng}&start=${DEFAULT_WINDOW.startDate}-01-01&end=${DEFAULT_WINDOW.endDate}-12-31`, {
            cache: 'no-store',
          });
          const data = await response.json();
          if (!cancelled) {
            setLiveNDVI(data);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLiveNDVI({
            configured: false,
            status: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      } finally {
        if (!cancelled) setIsLoadingNDVI(false);
      }
    };
    void loadLiveNDVI();
    return () => { cancelled = true; };
  }, [mainLocation.coordinates]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
          <Trees className="h-4 w-4" /> Biosphere Intelligence System
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Vegetation Intelligence Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Canopy greening, seasonal phenology, drought stress and post-wildfire regrowth all require a
          vegetation-index product. This workspace reports honestly when that measurement source is
          not connected.
        </p>
      </div>

      {/* Primary unavailable notice / live NDVI status */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100 text-emerald-800">
            <Trees className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Vegetation Indices Workspace
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              Canopy greening, seasonal phenology, drought stress and post-wildfire regrowth all require a
              vegetation-index product. This workspace reports honestly when that measurement source is
              not connected.
            </p>
          </div>
        </div>

        {/* Live NDVI status */}
        {isLoadingNDVI ? (
          <div className="rounded-2xl border border-emerald-200/80 bg-[#f8faf9] p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 animate-spin" />
              <span className="text-sm font-semibold text-slate-900">Loading NDVI/EVI data...</span>
            </div>
            <p className="text-xs text-slate-500">Fetching MODIS NDVI/EVI from NASA AppEEARS. This typically takes 1–4 minutes.</p>
          </div>
        ) : liveNDVI ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-2xl border border-emerald-200/80 bg-[#f8faf9] p-4">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Configured: {liveNDVI.configured ? 'Yes' : 'No'}
              </div>
              <div className="text-sm font-bold text-slate-900">Status: {liveNDVI.status}</div>
              {liveNDVI.series && liveNDVI.series.samples.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-slate-700">Samples collected: {liveNDVI.series.usableCount}/{liveNDVI.series.totalCount}</div>
                  <div className="text-[11px] text-slate-500">Date range: {liveNDVI.series.startDate} → {liveNDVI.series.endDate}</div>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-[#f8faf9] p-4">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                EVI Available: {liveNDVI.configured ? (liveNDVI.status === 'done' ? 'Yes' : 'Pending') : 'N/A'}
              </div>
              <div className="text-sm font-bold text-slate-900">NDVI Usable: {liveNDVI.series?.usableCount > 0 ? liveNDVI.series.usableCount : '0'} samples</div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">To enable this workspace:</strong> add NASA Earthdata
            credentials for AppEEARS or LP DAAC so that MODIS/VIIRS NDVI and EVI subsets can be
            requested for the active footprint. Until then, every vegetation metric on this page stays
            explicitly unavailable.
          </div>
        )}

        {/* What is live today */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Measured variables that are available now
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LIVE_ALTERNATIVES.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-orange-600">
                    Open workspace <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Data integrity statement */}
        <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-5 space-y-2 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Database className="h-4 w-4 text-emerald-600" />
            Why this page does not show charts
          </div>
          <p>
            The platform only displays measurements retrieved from a named provider at request time.
            When a provider cannot supply a series, the interface returns an explicit unavailable state
            instead of a synthetic curve. This keeps every trend, confidence interval and report in the
            portal traceable to an actual archive.
          </p>
          <p className="text-slate-500">
            Previously this workspace displayed hard-coded Sahel NDVI and California fire-recovery
            benchmarks. Those values were demonstration data and have been removed from the production
            path.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/analysis"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 transition-all"
          >
            <Leaf className="h-4 w-4" /> Analyse live climate variables
          </Link>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:border-emerald-400 transition-all"
          >
            Browse data resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}