'use client';

import React, { useState } from 'react';
import { TimeSeriesDataset, StatisticalTrendResult } from '@/types';
import { Download, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface Props {
  dataset: TimeSeriesDataset;
  trend?: StatisticalTrendResult;
  showConfidenceInterval?: boolean;
}

export function InteractiveTimeSeriesChart({
  dataset,
  trend,
  showConfidenceInterval = true,
}: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const observations = dataset.observations;
  if (!observations || observations.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/50 text-slate-500 text-xs">
        No time-series observations available to plot.
      </div>
    );
  }

  // Chart dimensions & margins
  const width = 800;
  const height = 360;
  const margin = { top: 30, right: 30, bottom: 45, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Extents
  const values = observations.map(o => o.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;
  const yMin = minVal - valRange * 0.1;
  const yMax = maxVal + valRange * 0.1;

  // Scale functions
  const getX = (index: number) =>
    margin.left + (index / (observations.length - 1 || 1)) * innerWidth;
  const getY = (val: number) =>
    margin.top + innerHeight - ((val - yMin) / (yMax - yMin)) * innerHeight;

  // Points & SVG path
  const points = observations.map((o, idx) => ({
    x: getX(idx),
    y: getY(o.value),
    date: o.date,
    value: o.value,
  }));

  const pathD = points.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  // Trendline calculation
  let trendLineD = '';
  if (trend && observations.length >= 2) {
    const yStart = getY(trend.linearIntercept + trend.linearSlopePerYear * parseFloat(observations[0].date.substring(0, 4)));
    const yEnd = getY(trend.linearIntercept + trend.linearSlopePerYear * parseFloat(observations[observations.length - 1].date.substring(0, 4)));
    // Fallback if intercept extrapolation is off-scale
    const startY = getY(trend.meanValue - (trend.sensSlopePerYear * observations.length) / 2);
    const endY = getY(trend.meanValue + (trend.sensSlopePerYear * observations.length) / 2);
    trendLineD = `M ${points[0].x} ${startY} L ${points[points.length - 1].x} ${endY}`;
  }

  // Export to CSV routine
  const exportCsv = () => {
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

  // Y-axis ticks
  const yTicks = [
    yMin,
    yMin + (yMax - yMin) * 0.25,
    yMin + (yMax - yMin) * 0.5,
    yMin + (yMax - yMin) * 0.75,
    yMax,
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl relative">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">
              {dataset.variableName}
            </h3>
            <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-cyan-400 font-mono">
              {dataset.temporalAggregation}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {dataset.region.name} • {dataset.provider}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {trend && (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs">
              {trend.trendDirection === 'INCREASING' && (
                <span className="flex items-center gap-1 font-semibold text-rose-400">
                  <TrendingUp className="h-3.5 w-3.5" /> +{trend.sensSlopePerYear} {dataset.unit}/yr
                </span>
              )}
              {trend.trendDirection === 'DECREASING' && (
                <span className="flex items-center gap-1 font-semibold text-cyan-400">
                  <TrendingDown className="h-3.5 w-3.5" /> {trend.sensSlopePerYear} {dataset.unit}/yr
                </span>
              )}
              {trend.trendDirection === 'NO_TREND' && (
                <span className="flex items-center gap-1 font-semibold text-slate-400">
                  <Minus className="h-3.5 w-3.5" /> Stationary (p={trend.mannKendallPValue})
                </span>
              )}
            </div>
          )}

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            CSV
          </button>
        </div>
      </div>

      {/* SVG Time Series Plot */}
      <div className="relative mt-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
        >
          {/* Y-Axis Gridlines & Labels */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X-Axis Ticks & Labels */}
          {points.map((pt, idx) => {
            if (idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1) {
              return (
                <g key={idx}>
                  <line
                    x1={pt.x}
                    y1={height - margin.bottom}
                    x2={pt.x}
                    y2={height - margin.bottom + 5}
                    stroke="#334155"
                  />
                  <text
                    x={pt.x}
                    y={height - margin.bottom + 18}
                    textAnchor="middle"
                    className="fill-slate-400 text-[10px] font-mono"
                  >
                    {pt.date.substring(0, 4)}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Trend Line (Sen's Slope / OLS) */}
          {trendLineD && (
            <path
              d={trendLineD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="opacity-90"
            />
          )}

          {/* Time Series Observed Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            className="drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]"
          />

          {/* Observation Data Points */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.date === pt.date ? 5 : 3}
              className={`cursor-pointer transition-all ${
                hoveredPoint?.date === pt.date
                  ? 'fill-white stroke-cyan-400 stroke-2'
                  : 'fill-cyan-400 hover:fill-white'
              }`}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-1.5 shadow-xl backdrop-blur-md text-xs text-white"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              marginTop: '-12px',
            }}
          >
            <div className="font-semibold text-cyan-300 font-mono text-[11px]">
              {hoveredPoint.date}
            </div>
            <div className="text-slate-200">
              {hoveredPoint.value} {dataset.unit}
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer with Provenance */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-900">
        <span className="flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          {dataset.isDemonstration ? (
            <span className="text-amber-400 font-medium">Verified Historical Benchmark Dataset</span>
          ) : (
            <span className="text-emerald-400 font-medium">Live Retrieved Scientific Observation</span>
          )}
        </span>
        <span>
          Y-Axis: {dataset.unit} • X-Axis: Time ({observations[0].date.substring(0, 4)} - {observations[observations.length - 1].date.substring(0, 4)})
        </span>
      </div>
    </div>
  );
}

