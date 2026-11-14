'use client';

import React from 'react';
import { RegionalComparisonResult } from '@/types';
import { GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  comparison: RegionalComparisonResult;
}

export function ComparisonChart({ comparison }: Props) {
  const { regionA, regionB, divergenceSummary, variable } = comparison;

  const obsA = regionA.timeSeries.observations;
  const obsB = regionB.timeSeries.observations;

  if (!obsA.length || !obsB.length) {
    return <div className="text-slate-500 text-xs p-4">Insufficient comparative data.</div>;
  }

  const width = 800;
  const height = 360;
  const margin = { top: 30, right: 30, bottom: 45, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Global extents across both series
  const allVals = [...obsA.map(o => o.value), ...obsB.map(o => o.value)];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const valRange = maxVal - minVal || 1;
  const yMin = minVal - valRange * 0.1;
  const yMax = maxVal + valRange * 0.1;

  const maxLen = Math.max(obsA.length, obsB.length);
  const getX = (idx: number, len: number) =>
    margin.left + (idx / (len - 1 || 1)) * innerWidth;
  const getY = (val: number) =>
    margin.top + innerHeight - ((val - yMin) / (yMax - yMin)) * innerHeight;

  const pathA = obsA.reduce(
    (acc, o, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i, obsA.length)} ${getY(o.value)}`,
    ''
  );
  const pathB = obsB.reduce(
    (acc, o, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i, obsB.length)} ${getY(o.value)}`,
    ''
  );

  return (
    <div className="w-full rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Regional Divergence: {variable.name}
            </h3>
            <p className="text-[11px] text-slate-500">
              Comparative trend analysis between two distinct geographic regimes
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-teal-600" />
            <span className="text-teal-800">{regionA.region.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-orange-800">{regionB.region.name}</span>
          </div>
        </div>
      </div>

      {/* SVG Dual Series */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Y Gridlines */}
        {[yMin, (yMin + yMax) / 2, yMax].map((val, idx) => (
          <g key={idx}>
            <line
              x1={margin.left}
              y1={getY(val)}
              x2={width - margin.right}
              y2={getY(val)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <text
              x={margin.left - 8}
              y={getY(val) + 3}
              textAnchor="end"
              className="fill-slate-400 text-[10px] font-mono font-medium"
            >
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Series A Path (Primary - Deep Teal) */}
        <path
          d={pathA}
          fill="none"
          stroke="#0d9488"
          strokeWidth="2.5"
        />

        {/* Series B Path (Comparative - Warm Coral/Orange) */}
        <path
          d={pathB}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />
      </svg>

      {/* Divergence Interpretation Banner */}
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
        <h4 className="font-bold text-emerald-900 text-xs mb-1">
          Scientific Synthesis:
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed">
          {divergenceSummary.scientificInterpretation}
        </p>
      </div>
    </div>
  );
}
