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
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { CrossDomainCorrelationResult } from '@/types';

export default function CrossDomainDiscoveryPage() {
  const [varA, setVarA] = useState('precipitation');
  const [varB, setVarB] = useState('ndvi');
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
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cross-domain analysis failed');
      }

      const data: CrossDomainCorrelationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [varA, varB]);

  // SVG Scatter plot dimensions
  const scatterW = 460;
  const scatterH = 300;
  const sPad = { top: 20, right: 20, bottom: 40, left: 50 };
  const sInnerW = scatterW - sPad.left - sPad.right;
  const sInnerH = scatterH - sPad.top - sPad.bottom;

  let minA = 0;
  let maxA = 100;
  let minB = 0;
  let maxB = 1;

  if (result && result.alignedPoints.length > 0) {
    const valsA = result.alignedPoints.map(p => p.valueA);
    const valsB = result.alignedPoints.map(p => p.valueB);
    minA = Math.min(...valsA);
    maxA = Math.max(...valsA);
    minB = Math.min(...valsB);
    maxB = Math.max(...valsB);
  }

  const rangeA = maxA - minA || 1;
  const rangeB = maxB - minB || 1;

  const getScatterX = (val: number) => sPad.left + ((val - minA) / rangeA) * sInnerW;
  const getScatterY = (val: number) => sPad.top + sInnerH - ((val - minB) / rangeB) * sInnerH;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Activity className="h-4 w-4" /> Multi-Sphere Discovery
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Cross-Domain Earth-System Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
            Detect empirical coupling, lead-lag relationships, and mutual anomalies between distinct atmospheric, biospheric, oceanic, and hydrologic systems.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/domains"
            className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            All 11 Domains
          </Link>
          <Link
            href="/vegetation"
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/30 transition-colors"
          >
            Vegetation Intelligence
          </Link>
        </div>
      </div>

      {/* Preset Case Studies Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Scientific Presets:</span>
        <button
          onClick={() => {
            setVarA('precipitation');
            setVarB('ndvi');
          }}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
            varA === 'precipitation' && varB === 'ndvi'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'border border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
          }`}
        >
          Rainfall vs. Sahel Greening (Lagged Monsoon)
        </button>
        <button
          onClick={() => {
            setVarA('air-temperature');
            setVarB('sea-ice-extent');
          }}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
            varA === 'air-temperature' && varB === 'sea-ice-extent'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'border border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
          }`}
        >
          Air Warming vs. Arctic Sea Ice Retreat
        </button>
      </div>

      {/* Variable Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
        <div>
          <label className="text-[11px] font-semibold text-cyan-400 block mb-1.5 uppercase tracking-wider">
            Driver Variable (A)
          </label>
          <select
            value={varA}
            onChange={e => setVarA(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            {EARTH_VARIABLES.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.system})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-emerald-400 block mb-1.5 uppercase tracking-wider">
            Response Variable (B)
          </label>
          <select
            value={varB}
            onChange={e => setVarB(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            {EARTH_VARIABLES.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.system})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-[11px] text-slate-400">Pearson Correlation (r)</div>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                {result.pearsonR >= 0 ? `+${result.pearsonR}` : result.pearsonR}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Linear Covariation</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-[11px] text-slate-400">Spearman Rank (ρ)</div>
              <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
                {result.spearmanRho >= 0 ? `+${result.spearmanRho}` : result.spearmanRho}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Monotonic Association</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-[11px] text-slate-400">Variance Explained (R²)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {(result.rSquared * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Shared Variance</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-[11px] text-slate-400">Optimal Lag Peak</div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                {result.optimalLagMonths === 0
                  ? 'Synchronous'
                  : `${Math.abs(result.optimalLagMonths)} Mo ${
                      result.optimalLagMonths < 0 ? 'Lead' : 'Lag'
                    }`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                r = {result.optimalLagCorrelation}
              </div>
            </div>
          </div>

          {/* Bivariate Scatter Plot & Lagged Correlation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scatter Plot */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Bivariate Scatter & OLS Linear Fit</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Y = {result.linearFit.slope} * X + {result.linearFit.intercept}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                  {result.isStatisticallySignificant ? 'p < 0.05 Significant' : 'p ≥ 0.05 Not Sig'}
                </span>
              </div>

              <div className="w-full flex justify-center overflow-x-auto">
                <svg viewBox={`0 0 ${scatterW} ${scatterH}`} className="w-full max-w-[460px] h-auto">
                  {/* Scatter points */}
                  {result.alignedPoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={getScatterX(pt.valueA)}
                      cy={getScatterY(pt.valueB)}
                      r="3.5"
                      fill="#06b6d4"
                      opacity="0.65"
                    />
                  ))}

                  {/* Regression Line */}
                  <line
                    x1={getScatterX(minA)}
                    y1={getScatterY(result.linearFit.slope * minA + result.linearFit.intercept)}
                    x2={getScatterX(maxA)}
                    y2={getScatterY(result.linearFit.slope * maxA + result.linearFit.intercept)}
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-2">
                <span>X-Axis: {result.variableA.name} ({result.variableA.unit})</span>
                <span>Y-Axis: {result.variableB.name} ({result.variableB.unit})</span>
              </div>
            </div>

            {/* Lagged Correlation Bar Chart */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Lagged Cross-Correlation (-6 to +6 Months)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Negative months indicate Variable A leads Variable B (preceding driver).
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {result.lagAnalysis.map(lag => {
                  const pct = Math.abs(lag.correlation) * 100;
                  const isOptimal = lag.lagMonths === result.optimalLagMonths;
                  return (
                    <div key={lag.lagMonths} className="flex items-center gap-2 text-xs font-mono">
                      <span className={`w-14 text-right ${isOptimal ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                        {lag.lagMonths === 0 ? '0' : lag.lagMonths > 0 ? `+${lag.lagMonths}m` : `${lag.lagMonths}m`}
                      </span>

                      <div className="flex-1 bg-slate-900 rounded-full h-4 relative overflow-hidden flex items-center">
                        <div
                          className={`h-full ${
                            isOptimal
                              ? 'bg-amber-400'
                              : lag.correlation >= 0
                              ? 'bg-cyan-500/70'
                              : 'bg-rose-500/70'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <span className={`w-12 text-right ${isOptimal ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                        {lag.correlation >= 0 ? `+${lag.correlation}` : lag.correlation}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scientific Interpretation & Epistemological Caveat */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Scientific Epistemology & Causation Advisory
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {result.scientificInterpretation}
            </p>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 leading-relaxed">
              <span className="font-bold text-amber-400">Critical Scientific Principle: </span>
              {result.causationWarning}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

