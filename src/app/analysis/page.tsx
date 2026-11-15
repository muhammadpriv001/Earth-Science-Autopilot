'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InteractiveTimeSeriesChart } from '@/components/charts/InteractiveTimeSeriesChart';
import { StatisticalSummaryCard } from '@/components/research/StatisticalSummaryCard';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { TimeSeriesDataset, StatisticalTrendResult, CrossDomainCorrelationResult } from '@/types';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  GitCompare,
  Download,
  Info,
  Layers,
  Calendar,
  MapPin,
  RefreshCw,
  Trees,
  CloudSun,
  Droplets,
  Activity,
  Maximize2,
  ChevronRight,
  Flame,
  Clock,
  ShieldCheck,
  Eye,
  Snowflake,
  Satellite,
} from 'lucide-react';
import Link from 'next/link';

import { LIVE_VARIABLE_IDS, LIVE_VARIABLE_GROUPS, getLiveVariable } from '@/lib/science/live-capabilities';
import { getAllEpochImagery, getEpochImagery, IMAGERY_EPOCHS, EpochImagery } from '@/lib/providers/imagery';
import { GibsImage } from '@/components/imagery/GibsImage';

const ANALYSIS_CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Layers },
  { id: 'vegetation', label: 'Vegetation & Biosphere', icon: Trees },
  { id: 'climate', label: 'Atmosphere & Climate', icon: CloudSun },
  { id: 'water', label: 'Precipitation & Hydrology', icon: Droplets },
  { id: 'cross-domain', label: 'Cross-Domain Coupling', icon: Activity },
];

function AnalysisContent() {
  const searchParams = useSearchParams();
  const { mainLocation, setAsMainLocation } = useLocation();
  const { saveInvestigation } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVariable, setSelectedVariable] = useState<string>('air-temperature');
  const [startDate, setStartDate] = useState('1994-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Time-stamped imagery epoch comparator
  const [imageryEpoch, setImageryEpoch] = useState<'historical' | 'intermediate' | 'recent'>('recent');
  const [radiusKm, setRadiusKm] = useState(100);

  // Datasets and results
  const [dataset, setDataset] = useState<TimeSeriesDataset | null>(null);
  const [trendResult, setTrendResult] = useState<StatisticalTrendResult | null>(null);
  const [explanation, setExplanation] = useState<string>('');

  // Cross domain result
  const [crossDomainResult, setCrossDomainResult] = useState<CrossDomainCorrelationResult | null>(null);

  // Imagery data
  const [imageryData, setImageryData] = useState<EpochImagery[] | null>(null);

  // Fetch imagery when location or epoch changes
  useEffect(() => {
    setImageryData(null); // reset while computing
    const center = mainLocation.coordinates;
    const imagery = getAllEpochImagery(center, radiusKm);
    setImageryData(imagery);
  }, [mainLocation.name, mainLocation.coordinates, imageryEpoch, radiusKm]);

  // Fetch Time Series and Trend
  const runAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch primary time series
      const tsRes = await fetch('/api/analysis/timeseries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableId: selectedVariable,
          region: {
            name: mainLocation.name,
            geometryType: 'point',
            coordinates: mainLocation.coordinates,
            center: mainLocation.coordinates,
          },
          startDate,
          endDate,
          temporalResolution: 'monthly',
        }),
      });
      const tsData = await tsRes.json();
      if (!tsRes.ok || !tsData.dataset) {
        setDataset(null);
        setTrendResult(null);
        setCrossDomainResult(null);
        setErrorMsg(tsData.error || 'Live measurements are unavailable for this variable.');
        return;
      }
      setDataset(tsData.dataset);

      // 2. Fetch statistical trend (Mann-Kendall + Sen's Slope)
      const trendRes = await fetch('/api/analysis/trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset: tsData.dataset,
          significanceThreshold: 0.05,
        }),
      });
      const trendData = await trendRes.json();
      setTrendResult(trendData.trend || null);

      // 3. Fetch cross-domain correlation if requested
      const crossRes = await fetch('/api/analysis/cross-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverVariableId: 'precipitation',
          responseVariableId: 'soil-moisture',
          region: {
            name: mainLocation.name,
            geometryType: 'point',
            coordinates: mainLocation.coordinates,
            center: mainLocation.coordinates,
          },
          startDate,
          endDate,
        }),
      });
      const crossData = await crossRes.json();
      setCrossDomainResult(crossRes.ok ? crossData.correlation || null : null);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMsg('Live measurements could not be retrieved. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or when location changes
  useEffect(() => {
    // Check preset query param if present
    const preset = searchParams.get('preset');
    if (preset === 'lahore') {
      setSelectedVariable('air-temperature');
      setAsMainLocation('Lahore, Punjab, Pakistan', [74.3587, 31.5204], 25);
    } else if (preset === 'amazon') {
      setSelectedVariable('precipitation');
      setAsMainLocation('Southern Amazon Basin, Brazil', [-57.5, -10.0], 50);
    } else if (preset === 'arctic') {
      setSelectedVariable('sea-ice-extent');
      setAsMainLocation('Northern Hemisphere Arctic Ocean', [0.0, 85.0], 100);
    }

    const varParam = searchParams.get('variable');
    if (varParam && EARTH_VARIABLES.some(v => v.id === varParam)) {
      setSelectedVariable(varParam);
    }

    runAnalysis();
  }, [mainLocation.name, selectedVariable]);

  const currentVar = EARTH_VARIABLES.find(v => v.id === selectedVariable) || EARTH_VARIABLES[0];

  const handleExportCSV = () => {
    if (!dataset) return;
    const headers = ['Date', `${dataset.variableName} (${dataset.unit})`, 'QualityFlag'];
    const rows = dataset.observations.map(o => [o.date, o.value, o.qualityFlag || 'VALID']);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataset.variableId}_${dataset.region.name.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-[1920px] px-3 sm:px-6 py-6 space-y-6">
      {/* Header & Global Footprint */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="h-4 w-4" /> Earth-System Investigation Laboratory
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            Statistical Analysis &amp; Environmental Trends
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-mono font-bold text-emerald-800">
              {mainLocation.radiusKm} km Footprint
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Location locked to <strong className="text-slate-800">{mainLocation.name}</strong> ({mainLocation.coordinates[1].toFixed(4)}°N, {mainLocation.coordinates[0].toFixed(4)}°E).
            Audited Mann-Kendall non-parametric tests, Sen&apos;s slope estimator, and cross-domain environmental couplings.
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={!dataset}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-emerald-700" />
            Export CSV
          </button>
          <Link
            href={`/compare`}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <GitCompare className="h-4 w-4" />
            Compare With Another Location →
          </Link>
        </div>
      </div>

      {/* CATEGORY SELECTOR TABS (Dashboard V22 Style) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {ANALYSIS_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'border border-slate-200/80 bg-white/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: MAIN TIME-SERIES LAB & CONTROLS */}
      {(selectedCategory === 'all' || selectedCategory === 'vegetation' || selectedCategory === 'climate' || selectedCategory === 'water') && (
        <section className="space-y-4">
          {/* Controls Bar: Clean White Neomorphic Container */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Active Variable
              </label>
              <select
                value={selectedVariable}
                onChange={e => setSelectedVariable(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] p-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
              >
                {EARTH_VARIABLES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Start Observation
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] p-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                End Observation
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] p-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Calculating...' : 'Recalculate Trends'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold">Live data unavailable:</strong> {errorMsg} No demonstration
              or synthetic numbers are substituted.
            </div>
          )}

          {/* Interactive Chart + Statistical Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              {dataset && trendResult ? (
                <InteractiveTimeSeriesChart
                  dataset={dataset}
                  trend={trendResult}
                />
              ) : errorMsg ? (
                <div className="h-80 flex flex-col items-center justify-center text-xs text-amber-800 rounded-3xl border border-amber-200 bg-amber-50 px-6 text-center">
                  <span className="font-bold mb-1">Live series unavailable for {currentVar.name}</span>
                  <span>Select one of the variables backed by NASA POWER or NSIDC to compute a trend.</span>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-xs text-slate-500 rounded-3xl border border-slate-200 bg-white/95">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2 text-emerald-600" />
                  Extracting live reanalysis time series...
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              {trendResult ? (
                <StatisticalSummaryCard
                  trend={trendResult}
                  unit={dataset?.unit || currentVar.unit}
                />
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: TIME-STAMPED SATELLITE IMAGERY & DIFFERENCE COMPARISON */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Time-Stamped Satellite Imagery &amp; Surface Difference
              </h2>
              <p className="text-[11px] text-slate-500">
                Multi-spectral true-color and vegetation anomaly composite comparison for {mainLocation.name} across decadal epochs.
              </p>
            </div>
          </div>

          {/* Epoch Selector Pills */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-[#f8faf9] p-1">
            <button
              onClick={() => setImageryEpoch('historical')}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                imageryEpoch === 'historical'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Baseline (2000)
            </button>
            <button
              onClick={() => setImageryEpoch('intermediate')}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                imageryEpoch === 'intermediate'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mid-Period (2012)
            </button>
            <button
              onClick={() => setImageryEpoch('recent')}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                imageryEpoch === 'recent'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Recent (2024–2026)
            </button>
          </div>
        </div>

        {/* Imagery Display */}
        {imageryData ? (
          <div className="grid grid-cols-3 gap-4">
            {imageryData.map((img, i) => (
              <div key={img.epoch.id} className="rounded-xl border p-3 bg-white/95">
                <img
                  src={img.trueColorUrl}
                  alt={`True-color ${img.epoch.shortLabel} imagery`}
                  loading="lazy"
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="p-2 text-xs font-bold text-emerald-800">
                  True Color ({img.epoch.shortLabel})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] p-6 text-center space-y-2">
            <Eye className="h-7 w-7 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Imagery mosaics are not connected</h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
              Landsat, MODIS and Sentinel-2 surface-reflectance composites require an authenticated NASA
              Earthdata / Copernicus download.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 3: VEGETATION & BIOSPHERE COMPREHENSIVE SUB-LABS */}
      {(selectedCategory === 'all' || selectedCategory === 'vegetation') && (
        <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trees className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Vegetation Intelligence &amp; Biosphere Dynamics
                </h2>
                <p className="text-[11px] text-slate-500">
                  Land Surface Phenology (SOS/POS/EOS), Vegetation Condition Index (VCI) drought anomalies, and wildfire post-burn trajectory.
                </p>
              </div>
            </div>
            <Link
              href="/vegetation"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              Open Dedicated Vegetation Lab <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Info className="h-4 w-4 text-amber-500" />
              Live vegetation indices are not yet connected
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Land-surface phenology (SOS/POS/EOS), the Vegetation Condition Index and post-fire
              recovery all require MODIS/VIIRS NDVI and EVI products. The tested keyless endpoint
              (ORNL DAAC MODIS subset) did not return a usable series, and NASA POWER does not serve
              NDVI. These metrics are therefore reported as unavailable rather than filled with
              demonstration values.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add NASA Earthdata credentials (AppEEARS / LP DAAC) to enable measured vegetation
              products. Measured climate and cryosphere trends remain available in the sections above.
            </p>
          </div>
        </section>
      )}

      {/* SECTION 4: CROSS-DOMAIN ENVIRONMENTAL COUPLING */}
      {(selectedCategory === 'all' || selectedCategory === 'cross-domain') && (
        <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cross-Domain Earth-System Coupling &amp; Lead-Lag Correlations
                </h2>
                <p className="text-[11px] text-slate-500">
                  Bivariate correlation matrix and lagged cross-correlation (-6 to +6 months) between Precipitation and Root-Zone Soil Moisture for {mainLocation.name}.
                </p>
              </div>
            </div>
            <Link
              href="/cross-domain"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
            >
              Open Full Cross-Domain Lab <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Correlation Metrics */}
            <div className="md:col-span-5 rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4.5 space-y-3">
              <div className="text-xs font-bold text-slate-900">Bivariate Coupling Statistics</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Pearson r (Zero-Lag):</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {crossDomainResult?.pearsonR !== undefined
                      ? (crossDomainResult.pearsonR > 0 ? `+${crossDomainResult.pearsonR.toFixed(3)}` : crossDomainResult.pearsonR.toFixed(3))
                      : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Spearman Rank ρ:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {crossDomainResult?.spearmanRho !== undefined
                      ? (crossDomainResult.spearmanRho > 0 ? `+${crossDomainResult.spearmanRho.toFixed(3)}` : crossDomainResult.spearmanRho.toFixed(3))
                      : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Peak Lag Offset:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {crossDomainResult
                      ? `${crossDomainResult.optimalLagMonths > 0 ? '+' : ''}${crossDomainResult.optimalLagMonths} Month(s)`
                      : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">P-Value Significance:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {crossDomainResult?.pValue !== undefined
                      ? `p = ${crossDomainResult.pValue.toExponential(2)}`
                      : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lagged Bar Visualizer */}
            <div className="md:col-span-7 rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4.5 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Lagged Correlation Bar Matrix (-6 to +6 Months)</span>
                <span className="text-[10px] text-indigo-700 font-mono font-bold">r(τ)</span>
              </div>
              <div className="h-32 flex items-end justify-between gap-1 pt-4">
                {crossDomainResult?.lagAnalysis?.length ? (
                  crossDomainResult.lagAnalysis.map(lag => {
                    const r = Math.abs(lag.correlation);
                    const isOptimal = lag.lagMonths === crossDomainResult.optimalLagMonths;
                    return (
                      <div key={lag.lagMonths} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          style={{ height: `${Math.max(2, r * 90)}px` }}
                          className={`w-full rounded-t-sm transition-all ${
                            isOptimal ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-300 hover:bg-slate-400'
                          }`}
                          title={`Lag ${lag.lagMonths}m: r = ${lag.correlation.toFixed(3)}`}
                        />
                        <span className={`text-[9px] font-mono ${isOptimal ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                          {lag.lagMonths > 0 ? `+${lag.lagMonths}` : lag.lagMonths}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center text-[11px] text-slate-500 self-center">
                    Lag correlations available once a live cross-domain pair is computed.
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-500 text-center pt-1 font-mono">
                Lag τ (Months) — Positive indicates Driver leads Response
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 flex items-center justify-center text-xs text-emerald-700">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading scientific analytics...
        </div>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
