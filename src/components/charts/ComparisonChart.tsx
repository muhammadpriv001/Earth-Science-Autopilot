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
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              Regional Divergence: {variable.name}
            </h3>
            <p className="text-[11px] text-slate-400">
              Comparative trend analysis between two distinct geographic regimes
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">{regionA.region.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="text-rose-300">{regionB.region.name}</span>
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
              stroke="#1e293b"
              strokeDasharray="3 3"
            />
            <text
              x={margin.left - 8}
              y={getY(val) + 3}
              textAnchor="end"
              className="fill-slate-500 text-[10px] font-mono"
            >
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Series A Path */}
        <path
          d={pathA}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.5"
          className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
        />

        {/* Series B Path */}
        <path
          d={pathB}
          fill="none"
          stroke="#fb7185"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          className="drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]"
        />
      </svg>

      {/* Divergence Interpretation Banner */}
      <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-4">
        <h4 className="font-semibold text-indigo-300 text-xs mb-1">
          Scientific Synthesis:
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {divergenceSummary.scientificInterpretation}
        </p>
      </div>
    </div>
  );
}

