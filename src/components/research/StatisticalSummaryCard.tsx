'use client';

import React from 'react';
import { StatisticalTrendResult } from '@/types';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Binary,
  Layers,
  Calculator,
} from 'lucide-react';

interface Props {
  trend: StatisticalTrendResult;
  unit: string;
}

export function StatisticalSummaryCard({ trend, unit }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6">
      {/* Title & Significance status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Calculator className="h-5 w-5 text-cyan-400" />
            Statistical Significance & Trend Decomposition
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic evaluations using Mann-Kendall S-Test and Theil-Sen Robust Regression
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold border ${
            trend.isSignificant
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          }`}
        >
          {trend.isSignificant ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Statistically Significant (p &lt; {trend.significanceThreshold})
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Not Significant (p ≥ {trend.significanceThreshold})
            </>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Sen's Slope */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sen&apos;s Slope</span>
            <Scale className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {trend.sensSlopePerYear > 0 ? '+' : ''}{trend.sensSlopePerYear}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {unit}/year (median pairwise)
          </div>
        </div>

        {/* Mann-Kendall p-value */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>p-value</span>
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {trend.mannKendallPValue < 0.0001 ? '<0.0001' : trend.mannKendallPValue}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Threshold α = {trend.significanceThreshold}
          </div>
        </div>

        {/* Mann-Kendall Z-score & S */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>MK Z-Score (S)</span>
            <Binary className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {trend.mannKendallZ}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            S = {trend.mannKendallS} (Var={trend.mannKendallVarS})
          </div>
        </div>

        {/* OLS Linear R-Squared */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>OLS R² (Fit)</span>
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {trend.rSquared}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Slope = {trend.linearSlopePerYear} {unit}/yr
          </div>
        </div>
      </div>

      {/* Observation Summary Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs">
        <h4 className="font-semibold text-slate-300 mb-2">Descriptive Metrics & Quality Control</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-400">
          <div>Sample Count: <strong className="text-white font-mono">{trend.validObservations}</strong></div>
          <div>Missing Observations: <strong className="text-white font-mono">{trend.missingObservations}</strong></div>
          <div>Mean Value: <strong className="text-white font-mono">{trend.meanValue} {unit}</strong></div>
          <div>Std Deviation: <strong className="text-white font-mono">{trend.standardDeviation} {unit}</strong></div>
        </div>
      </div>

      {/* Scientific Limitations Notice */}
      <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-4 text-xs text-slate-300 space-y-2">
        <div className="font-semibold text-cyan-300">Methodological Notes & Interpretation:</div>
        <p className="leading-relaxed">{trend.limitationsNotice}</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
          {trend.assumptions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

