'use client';

import React, { useState, useEffect } from 'react';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import {
  LAHORE_TEMPERATURE_BENCHMARK,
  ARCTIC_SEA_ICE_BENCHMARK,
  AMAZON_PRECIPITATION_BENCHMARK,
} from '@/lib/providers/mock-datasets';
import { RegionalComparisonResult } from '@/types';
import { GitCompare, MapPin, RefreshCw, ArrowRight } from 'lucide-react';

export default function ComparePage() {
  const [regionAIndex, setRegionAIndex] = useState(0); // Lahore
  const [regionBIndex, setRegionBIndex] = useState(1); // Arctic

  const presets = [
    { label: 'Lahore (Warming Anomaly)', dataset: LAHORE_TEMPERATURE_BENCHMARK },
    { label: 'Arctic (Sea Ice Extent)', dataset: ARCTIC_SEA_ICE_BENCHMARK },
    { label: 'Amazon Basin (Precipitation)', dataset: AMAZON_PRECIPITATION_BENCHMARK },
  ];

  const [comparison, setComparison] = useState<RegionalComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analysis/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetA: presets[regionAIndex].dataset,
          datasetB: presets[regionBIndex].dataset,
        }),
      });
      const data = await res.json();
      if (data.comparison) {
        setComparison(data.comparison);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [regionAIndex, regionBIndex]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <GitCompare className="h-4 w-4" /> Multi-Region Divergence Laboratory
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Regional Trend Comparison
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          NASA Space Apps Challenge 2026: Compare environmental trends between two distinct geographic locations to examine spatial divergence, localized resilience, or contrasting climate signatures.
        </p>
      </div>

      {/* Region Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-cyan-400" /> Primary Region (A)
          </label>
          <select
            value={regionAIndex}
            onChange={e => setRegionAIndex(parseInt(e.target.value, 10))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            {presets.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-rose-400" /> Comparative Region (B)
          </label>
          <select
            value={regionBIndex}
            onChange={e => setRegionBIndex(parseInt(e.target.value, 10))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
          >
            {presets.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Chart Display */}
      {comparison && <ComparisonChart comparison={comparison} />}

      {/* Side-by-Side Statistics Grid */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Region A Metrics */}
          <div className="rounded-2xl border border-cyan-900/40 bg-slate-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="font-bold text-cyan-300 text-sm">
                Region A: {comparison.regionA.region.name}
              </h3>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] text-cyan-400 font-mono">
                {comparison.regionA.trend.trendDirection}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-xl bg-slate-900/60 p-3">
                <div className="text-slate-400 text-[10px]">Sen&apos;s Slope</div>
                <div className="text-white text-base font-bold mt-1">
                  {comparison.regionA.trend.sensSlopePerYear} /yr
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/60 p-3">
                <div className="text-slate-400 text-[10px]">p-value</div>
                <div className="text-white text-base font-bold mt-1">
                  {comparison.regionA.trend.mannKendallPValue}
                </div>
              </div>
            </div>
          </div>

          {/* Region B Metrics */}
          <div className="rounded-2xl border border-rose-900/40 bg-slate-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="font-bold text-rose-300 text-sm">
                Region B: {comparison.regionB.region.name}
              </h3>
              <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] text-rose-400 font-mono">
                {comparison.regionB.trend.trendDirection}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-xl bg-slate-900/60 p-3">
                <div className="text-slate-400 text-[10px]">Sen&apos;s Slope</div>
                <div className="text-white text-base font-bold mt-1">
                  {comparison.regionB.trend.sensSlopePerYear} /yr
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/60 p-3">
                <div className="text-slate-400 text-[10px]">p-value</div>
                <div className="text-white text-base font-bold mt-1">
                  {comparison.regionB.trend.mannKendallPValue}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

