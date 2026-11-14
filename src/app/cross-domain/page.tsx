'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { EARTH_VARIABLES, getPowerSupportedVariables } from '@/lib/science/earth-variables';
import { CrossDomainCorrelationResult } from '@/types';
import { useLocation } from '@/context/LocationContext';

export default function CrossDomainDiscoveryPage() {
  const { mainLocation } = useLocation();
  const [varA, setVarA] = useState('precipitation');
  const [varB, setVarB] = useState('soil-moisture');
  const [result, setResult] = useState<CrossDomainCorrelationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalysis = async (driverId = varA, responseId = varB) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/analysis/cross-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableIdA: driverId,
          variableIdB: responseId,
          region: {
            name: mainLocation.name,
            geometryType: 'point',
            coordinates: mainLocation.coordinates,
            center: mainLocation.coordinates,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cross-domain analysis failed');
      }

      const data: CrossDomainCorrelationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult(null);
      setErrorMsg(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [varA, varB, mainLocation.name]);

  // SVG Scatter plot dimensions
  const scatterW = 460;
  const scatterH = 260;
  const pad = 35;

  const alignedX = result?.alignedPoints?.map(p => p.valueA) ?? [];
  const alignedY = result?.alignedPoints?.map(p => p.valueB) ?? [];
  const minX = alignedX.length ? Math.min(...alignedX) : 0;
  const maxX = alignedX.length ? Math.max(...alignedX) : 1;
  const minY = alignedY.length ? Math.min(...alignedY) : 0;
  const maxY = alignedY.length ? Math.max(...alignedY) : 1;
  const xScale = (v: number) =>
    pad + ((v - minX) / (maxX - minX || 1)) * (scatterW - pad * 2);
  const yScale = (v: number) =>
    scatterH - pad - ((v - minY) / (maxY - minY || 1)) * (scatterH - pad * 2);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Activity className="h-4 w-4" /> Earth System Science
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
            Cross-Domain Coupling &amp; Lag Discovery
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Uncover lead-lag relationships, teleconnections, and bivariate coupling between any two atmospheric, hydrologic, oceanic, or biosphere variables.
          </p>
        </div>

        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 transition-all hover:scale-[1.02]"
        >
          <Compass className="h-4 w-4" /> Return to Map GIS
        </Link>
      </div>

      {/* Preset Pairings Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-1">Live Pairings:</span>
        {[
          { label: 'Precipitation ➔ Soil Moisture', a: 'precipitation', b: 'soil-moisture' },
          { label: 'Air Temp ➔ Soil Moisture', a: 'air-temperature', b: 'soil-moisture' },
          { label: 'Air Temp ➔ Precipitation', a: 'air-temperature', b: 'precipitation' },
          { label: 'Surface Temp ➔ Air Temp', a: 'land-surface-temperature', b: 'air-temperature' },
        ].map((pair, idx) => (
          <button
            key={idx}
            onClick={() => {
              setVarA(pair.a);
              setVarB(pair.b);
            }}
            className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              varA === pair.a && varB === pair.b
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            {pair.label}
          </button>
        ))}
      </div>

      {/* Variable Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
        <div>
          <label className="text-[11px] font-bold text-teal-800 block mb-1.5 uppercase tracking-wider">
            Driver Variable (A)
          </label>
          <select
            value={varA}
            onChange={e => setVarA(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
          >
            {getPowerSupportedVariables().map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.system})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-emerald-800 block mb-1.5 uppercase tracking-wider">
            Response Variable (B)
          </label>
          <select
            value={varB}
            onChange={e => setVarB(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
          >
            {getPowerSupportedVariables().map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.system})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Analysis Results */}
      {errorMsg && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Live coupling unavailable:</strong> {errorMsg} Both variables
          must be backed by a live measurement source (air temperature, land-surface temperature,
          precipitation, soil moisture or sea-ice extent). No synthetic series are substituted.
        </div>
      )}

      {isLoading && !result && !errorMsg && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Retrieving live measurements and computing lagged cross-correlations…
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)]">
              <div className="text-[11px] text-slate-500 font-semibold">Pearson Correlation (r)</div>
              <div className="text-2xl font-black font-mono text-indigo-700 mt-1">
                {result.pearsonR >= 0 ? `+${result.pearsonR}` : result.pearsonR}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Linear Covariation</div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)]">
              <div className="text-[11px] text-slate-500 font-semibold">Spearman Rank (ρ)</div>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {result.spearmanRho >= 0 ? `+${result.spearmanRho}` : result.spearmanRho}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Monotonic Association</div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)]">
              <div className="text-[11px] text-slate-500 font-semibold">Variance Explained (R²)</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {(result.rSquared * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Shared Variance</div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)]">
              <div className="text-[11px] text-slate-500 font-semibold">Optimal Lag Peak</div>
              <div className="text-2xl font-black font-mono text-amber-700 mt-1">
                {result.optimalLagMonths === 0
                  ? 'Synchronous'
                  : `${Math.abs(result.optimalLagMonths)} Mo ${
                      result.optimalLagMonths < 0 ? 'Lead' : 'Lag'
                    }`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                r = {result.optimalLagCorrelation}
              </div>
            </div>
          </div>

          {/* Bivariate Scatter Plot & Lagged Correlation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scatter Plot */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 space-y-4 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bivariate Scatter &amp; OLS Linear Fit</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Y = {result.linearFit.slope} * X + {result.linearFit.intercept}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800">
                  {result.isStatisticallySignificant ? 'p < 0.05 Significant' : 'p ≥ 0.05 Not Sig'}
                </span>
              </div>

              <div className="w-full flex justify-center overflow-x-auto">
                <svg viewBox={`0 0 ${scatterW} ${scatterH}`} className="w-full max-w-[460px] h-auto">
                  {/* Grid */}
                  <rect x={pad} y={pad} width={scatterW - pad * 2} height={scatterH - pad * 2} fill="#f8faf9" stroke="#e2e8f0" />
                  
                  {/* Scatter points */}
                  {result.alignedPoints.map((pt, i) => {
                    const cx = xScale(pt.valueA);
                    const cy = yScale(pt.valueB);
                    return (
                      <circle
                        key={i}
                        cx={Math.max(pad + 4, Math.min(scatterW - pad - 4, cx))}
                        cy={Math.max(pad + 4, Math.min(scatterH - pad - 4, cy))}
                        r={4}
                        fill="#0d9488"
                        opacity={0.8}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Lagged Correlation Bar Plot */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 space-y-4 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Lagged Cross-Correlation Function</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Evaluated from -6 months (response leads) to +6 months (driver leads)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Max: {result.optimalLagCorrelation}
                </span>
              </div>

              <div className="h-52 flex items-end justify-between gap-1.5 pt-4 border-b border-slate-200">
                {(result.lagAnalysis || []).map((lag: { lagMonths: number; correlation: number }) => {
                  const isOptimal = lag.lagMonths === result.optimalLagMonths;
                  const barH = Math.max(6, Math.abs(lag.correlation) * 140);
                  return (
                    <div key={lag.lagMonths} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        style={{ height: `${barH}px` }}
                        className={`w-full rounded-t-lg transition-all ${
                          isOptimal
                            ? 'bg-emerald-500 shadow-md shadow-emerald-500/25'
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={`Lag ${lag.lagMonths}m: r = ${lag.correlation}`}
                      />
                      <span className={`text-[10px] font-mono ${isOptimal ? 'text-emerald-800 font-bold' : 'text-slate-500'}`}>
                        {lag.lagMonths > 0 ? `+${lag.lagMonths}` : lag.lagMonths}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-500 text-center font-mono">
                Offset in Months (Negative = Response Leads | Positive = Driver Leads)
              </div>
            </div>
          </div>

          {/* Scientific Interpretation Card */}
          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-6 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-700" /> Statistical Interpretation &amp; Physical Mechanism
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {result.scientificInterpretation || (result as any).interpretation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
