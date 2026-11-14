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
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-6">
      {/* Title & Significance status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            Statistical Significance &amp; Trend Decomposition
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic evaluations using Mann-Kendall S-Test and Theil-Sen Robust Regression
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold border ${
            trend.isSignificant
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {trend.isSignificant ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Statistically Significant (p &lt; {trend.significanceThreshold})
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Not Significant (p ≥ {trend.significanceThreshold})
            </>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Sen's Slope */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Sen&apos;s Slope</span>
            <Scale className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {trend.sensSlopePerYear > 0 ? '+' : ''}{trend.sensSlopePerYear}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-medium">
            {unit}/year (median pairwise)
          </div>
        </div>

        {/* Mann-Kendall p-value */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">p-value</span>
            <Activity className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {trend.mannKendallPValue < 0.0001 ? '<0.0001' : trend.mannKendallPValue}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-medium">
            Threshold α = {trend.significanceThreshold}
          </div>
        </div>

        {/* Mann-Kendall Z-score & S */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">MK Z-Score (S)</span>
            <Binary className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {trend.mannKendallZ}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-medium">
            S = {trend.mannKendallS} (Var={trend.mannKendallVarS})
          </div>
        </div>

        {/* OLS Linear R-Squared */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">OLS R² (Fit)</span>
            <Layers className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {trend.rSquared}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-medium">
            Slope = {trend.linearSlopePerYear} {unit}/yr
          </div>
        </div>
      </div>

      {/* Observation Summary Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-4 text-xs">
        <h4 className="font-bold text-slate-900 mb-2">Descriptive Metrics &amp; Quality Control</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-600">
          <div>Sample Count: <strong className="text-slate-900 font-mono">{trend.validObservations}</strong></div>
          <div>Missing Observations: <strong className="text-slate-900 font-mono">{trend.missingObservations}</strong></div>
          <div>Mean Value: <strong className="text-slate-900 font-mono">{trend.meanValue} {unit}</strong></div>
          <div>Std Deviation: <strong className="text-slate-900 font-mono">{trend.standardDeviation} {unit}</strong></div>
        </div>
      </div>

      {/* Scientific Limitations Notice */}
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-emerald-900">Methodological Notes &amp; Interpretation:</div>
        <p className="leading-relaxed">{trend.limitationsNotice}</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
          {trend.assumptions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
