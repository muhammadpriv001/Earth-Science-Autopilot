
'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import Link from 'next/link';

import {
  Trees,
  Leaf,
  ArrowRight,
  Database,
  ShieldCheck,
  Droplets,
  CloudSun,
  Activity,
  AlertTriangle,
  Satellite,
} from 'lucide-react';

import { HistoricalImageryComparison } from '@/components/vegetation/HistoricalImageryComparison';
import { VegetationTrendCharts } from '@/components/vegetation/VegetationTrendCharts';

const CURRENT_YEAR = new Date().getUTCFullYear();

const DEFAULT_WINDOW = {
  startDate: CURRENT_YEAR - 10,
  endDate: CURRENT_YEAR,
};

const LIVE_ALTERNATIVES = [
  {
    title: 'Air & Land-Surface Temperature',
    description:
      'NASA POWER monthly reanalysis for any point on land or ocean.',
    href: '/analysis',
    icon: CloudSun,
  },
  {
    title: 'Precipitation & Soil Moisture',
    description:
      'Couple rainfall with root-zone soil moisture to study water availability.',
    href: '/cross-domain',
    icon: Droplets,
  },
  {
    title: 'Sea-Ice Extent',
    description:
      'NSIDC Sea Ice Index monthly extent for the Arctic and Antarctic.',
    href: '/forecast',
    icon: Activity,
  },
];

type NDVISample = {
  date?: string;
  ndvi?: number | null;
  evi?: number | null;
  usable?: boolean;
  quality?: string;
};

type IndexPoint = {
  date: string;
  value: number;
};

type NDVIResponse = {
  configured: boolean;
  status: string;
  taskId?: string;
  pollAfterMs?: number;
  progress?: number;
  message?: string;
  series?: {
    samples?: NDVISample[];
    ndvi?: IndexPoint[];
    evi?: IndexPoint[];
    usableCount?: number;
    totalCount?: number;
    startDate?: string;
    endDate?: string;
    product?: string;
    productLabel?: string;
    retrievedAt?: string;
  };
};

export default function VegetationWorkspacePage() {
  const { mainLocation } = useLocation();

  const [liveNDVI, setLiveNDVI] = useState<NDVIResponse | null>(null);
  const [isLoadingNDVI, setIsLoadingNDVI] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const lat = mainLocation.coordinates?.[1];
  const lng = mainLocation.coordinates?.[0];

  const validLocation =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat as number) <= 90 &&
    Math.abs(lng as number) <= 180;

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;

    const pollLiveNDVI = async (taskId?: string): Promise<void> => {
      if (cancelled) return;

      setIsLoadingNDVI(true);

      try {
        const today = new Date().toISOString().slice(0, 10);

        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          start: `${DEFAULT_WINDOW.startDate}-01-01`,
          end: today,
        });

        if (taskId) {
          params.set('task', taskId);
        }

        const response = await fetch(
          `/api/vegetation/ndvi?${params.toString()}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        const data: NDVIResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `Vegetation API error (${response.status})`
          );
        }

        if (cancelled) return;

        setLiveNDVI(data);

        if (
          data.status === 'done' ||
          data.status === 'unavailable' ||
          data.status === 'error'
        ) {
          setIsLoadingNDVI(false);
          return;
        }

        const nextTaskId = data.taskId || taskId;

        if (!nextTaskId) {
          throw new Error(
            'AppEEARS returned a processing status without a task ID.'
          );
        }

        pollTimer = setTimeout(() => {
          void pollLiveNDVI(nextTaskId);
        }, Math.max(data.pollAfterMs || 8000, 3000));
      } catch (error) {
        if (!cancelled) {
          setLiveNDVI({
            configured: true,
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'An unknown vegetation data error occurred.',
          });

          setIsLoadingNDVI(false);
        }
      }
    };

    if (!validLocation) {
      setLiveNDVI({
        configured: false,
        status: 'error',
        message:
          'Please select a valid location before requesting vegetation data.',
      });

      setIsLoadingNDVI(false);

      return () => {
        cancelled = true;
      };
    }

    setLiveNDVI(null);
    void pollLiveNDVI();

    return () => {
      cancelled = true;

      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, [lat, lng, retryKey, validLocation]);

  const samples = liveNDVI?.series?.samples ?? [];

  const ndviSeries = liveNDVI?.series?.ndvi ?? [];
  const eviSeries = liveNDVI?.series?.evi ?? [];

  const usableCount = liveNDVI?.series?.usableCount ?? 0;
  const totalCount = liveNDVI?.series?.totalCount ?? 0;

  const isUnavailable =
    liveNDVI?.status === 'unavailable' ||
    (liveNDVI?.configured === false && liveNDVI?.status !== 'error');

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">

      {/* Page header */}
      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
          <Trees className="h-4 w-4" />
          Biosphere Intelligence System
        </div>

        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
          Vegetation Intelligence Workspace
        </h1>

        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-sm">
          Investigate historical land-surface changes and vegetation dynamics
          using archived Landsat satellite scenes and MODIS vegetation-index
          measurements.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">
            Landsat historical archive
          </span>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-800">
            MODIS NDVI / EVI
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
            Active study location
          </span>
        </div>
      </header>

      {/* Active study location */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active study location
            </p>
            <h2 className="mt-1 text-sm font-bold text-slate-900">
              {mainLocation.name || 'Selected location'}
            </h2>
          </div>

          <div className="text-right font-mono text-xs text-slate-600">
            <p>Lat: {validLocation ? Number(lat).toFixed(4) : '—'}</p>
            <p>Lng: {validLocation ? Number(lng).toFixed(4) : '—'}</p>
          </div>
        </div>
      </section>

      {/* Historical Landsat comparison */}
      {validLocation && (
        <HistoricalImageryComparison
          lat={Number(lat)}
          lng={Number(lng)}
          radiusKm={25}
        />
      )}

      {/* MODIS vegetation data */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100 text-emerald-800">
            <Trees className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              MODIS Vegetation Indices
            </h2>

            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-500">
              Retrieve satellite-derived NDVI and EVI observations for the
              active study coordinate through NASA AppEEARS.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoadingNDVI && (
          <div className="space-y-3 rounded-2xl border border-emerald-200/80 bg-[#f8faf9] p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-sm font-semibold text-slate-900">
                Loading NDVI/EVI data...
              </span>
            </div>

            <p className="text-xs text-slate-500">
              NASA AppEEARS is processing MODIS vegetation observations.
              This may take several minutes.
            </p>

            {liveNDVI?.taskId && (
              <p className="break-all text-[11px] text-slate-400">
                Task ID: {liveNDVI.taskId}
              </p>
            )}

            {typeof liveNDVI?.progress === 'number' && (
              <div className="mx-auto max-w-xs space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Processing progress</span>
                  <span>{liveNDVI.progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, liveNDVI.progress))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Successful result */}
        {!isLoadingNDVI && liveNDVI?.status === 'done' && (
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-900">
                Vegetation data retrieved successfully
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  NDVI observations
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {ndviSeries.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Included in the returned NDVI series
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  EVI observations
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {eviSeries.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Included in the returned EVI series
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Usable samples
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {usableCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Out of {totalCount} parsed samples
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              Date range: {liveNDVI.series?.startDate || 'Unknown'}
              {' → '}
              {liveNDVI.series?.endDate || 'Unknown'}
            </div>

            {samples.length === 0 && (
              <p className="text-xs text-amber-800">
                The task completed, but no observations were returned.
              </p>
            )}

            <p className="text-[10px] text-slate-500">
              Product: {liveNDVI.series?.productLabel || 'MOD13Q1.061'}
            </p>
          </div>
        )}

        {/* Actual charts */}
        {!isLoadingNDVI && liveNDVI?.status === 'done' && (
          <VegetationTrendCharts
            ndvi={ndviSeries}
            evi={eviSeries}
          />
        )}

        {/* Unavailable */}
        {!isLoadingNDVI && isUnavailable && (
          <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <strong className="text-sm font-bold text-amber-900">
                Vegetation data unavailable
              </strong>
            </div>

            <p className="text-xs leading-relaxed text-amber-900">
              {liveNDVI?.message ||
                'Add NASA Earthdata credentials for AppEEARS to request MODIS vegetation-index subsets.'}
            </p>

            <p className="text-xs text-amber-800">
              No synthetic NDVI or EVI values are displayed.
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoadingNDVI && liveNDVI?.status === 'error' && (
          <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <strong className="text-sm font-bold text-red-900">
                Vegetation request failed
              </strong>
            </div>

            <p className="text-xs leading-relaxed text-red-800">
              {liveNDVI.message ||
                'An unexpected error occurred while retrieving vegetation data.'}
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              Retry request
            </button>
          </div>
        )}

        {/* Initial */}
        {!isLoadingNDVI && !liveNDVI && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Preparing vegetation data request...
            </p>
          </div>
        )}
      </section>

      {/* Other workspaces */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Other measured environmental variables
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {LIVE_ALTERNATIVES.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-400 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>

                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-orange-600">
                  Open workspace
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Data integrity */}
      <section className="space-y-2 rounded-2xl border border-slate-200 bg-[#f8faf9] p-5 text-xs leading-relaxed text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Database className="h-4 w-4 text-emerald-600" />
          Data provenance and limitations
        </div>

        <p>
          Historical imagery is retrieved from the Landsat Collection 2
          Level-2 archive through Microsoft Planetary Computer. Vegetation
          charts use the existing NASA AppEEARS MOD13Q1.061 time series.
        </p>

        <p>
          Landsat scene previews and MODIS point measurements are different
          data products. The MODIS time series is not a 30-year Landsat
          vegetation record. Scene previews are not annual composites, and
          point observations are not area-wide averages.
        </p>

        <p className="text-slate-500">
          Previously displayed demonstration benchmarks have been removed.
          This page does not create substitute satellite measurements when a
          provider has no data.
        </p>
      </section>

      {/* Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/analysis"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-amber-500"
        >
          <Leaf className="h-4 w-4" />
          Analyse live climate variables
        </Link>

        <Link
          href="/resources"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-emerald-400"
        >
          Browse data resources
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
