'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InteractiveTimeSeriesChart } from '@/components/charts/InteractiveTimeSeriesChart';
import { StatisticalSummaryCard } from '@/components/research/StatisticalSummaryCard';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { TimeSeriesDataset, StatisticalTrendResult } from '@/types';
import {
  LineChart,
  Sliders,
  Sparkles,
  GitCompare,
  Download,
  Info,
  Layers,
  Calendar,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const preset = searchParams.get('preset');
  const variableParam = searchParams.get('variable') || 'air-temperature';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const [selectedVariable, setSelectedVariable] = useState(variableParam);
  const [selectedRegionName, setSelectedRegionName] = useState(
    preset === 'amazon'
      ? 'Southern Amazon Basin, Brazil'
      : preset === 'arctic'
      ? 'Northern Hemisphere Arctic Ocean'
      : 'Lahore, Punjab, Pakistan'
  );
  const [coordinates, setCoordinates] = useState<[number, number]>(
    latParam && lngParam
      ? [parseFloat(lngParam), parseFloat(latParam)]
      : preset === 'amazon'
      ? [-57.5, -10.0]
      : preset === 'arctic'
      ? [0.0, 85.0]
      : [74.3587, 31.5204]
  );

  const [startDate, setStartDate] = useState('1994-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState<TimeSeriesDataset | null>(null);
  const [trendResult, setTrendResult] = useState<StatisticalTrendResult | null>(null);
  const [explanation, setExplanation] = useState<string>('');

  const runAnalysis = async () => {
    setLoading(true);
    try {
      // 1. Fetch time series
      const tsRes = await fetch('/api/analysis/timeseries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableId: selectedVariable,
          region: {
            name: selectedRegionName,
            geometryType: 'point',
            coordinates,
            center: coordinates,
          },
          startDate,
          endDate,
          useBenchmark: Boolean(preset),
        }),
      });

      const tsData = await tsRes.json();
      if (!tsData.dataset) return;

      const loadedDataset: TimeSeriesDataset = tsData.dataset;
      setDataset(loadedDataset);

      // 2. Compute statistical trend test
      const trendRes = await fetch('/api/analysis/trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observations: loadedDataset.observations,
          variableName: loadedDataset.variableName,
          unit: loadedDataset.unit,
          alpha: 0.05,
        }),
      });

      const trendData = await trendRes.json();
      if (trendData.results) {
        setTrendResult(trendData.results);
        setExplanation(trendData.explanation || '');
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [preset, selectedVariable]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <LineChart className="h-4 w-4" /> Time-Series Laboratory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Environmental Trend Detective
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Examine decadal time-series observations, calculate Mann-Kendall monotonic trend tests with tie corrections, estimate Sen&apos;s slopes, and review data provenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/compare"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <GitCompare className="h-4 w-4 text-cyan-400" />
            Compare Two Regions
          </Link>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-500/20"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Re-run Analysis
          </button>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        {/* Variable Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">
            Earth Variable
          </label>
          <select
            value={selectedVariable}
            onChange={e => setSelectedVariable(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            {EARTH_VARIABLES.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Region / Study Area */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">
            Study Location
          </label>
          <input
            type="text"
            value={selectedRegionName}
            onChange={e => setSelectedRegionName(e.target.value)}
            placeholder="Location name..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Start Year */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* End Year */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Time-Series Chart */}
      {dataset && (
        <InteractiveTimeSeriesChart
          dataset={dataset}
          trend={trendResult || undefined}
        />
      )}

      {/* Scientific Explanation Panel */}
      {explanation && (
        <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/20 via-slate-950 to-slate-950 p-6 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            AI & Statistical Assistant Interpretation:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* Statistical Summary Decomposition */}
      {trendResult && dataset && (
        <StatisticalSummaryCard
          trend={trendResult}
          unit={dataset.unit}
        />
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-400" />
        <p>Loading Earth Observation trend analysis environment...</p>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}

