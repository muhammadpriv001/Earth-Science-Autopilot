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
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#f8faf9] text-slate-400 text-xs">
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
    <div className="w-full rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md relative">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              {dataset.variableName}
            </h3>
            <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-800 font-mono font-bold">
              {dataset.temporalAggregation}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {dataset.region.name} • {dataset.provider}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {trend && (
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#f8faf9] px-3 py-1 text-xs">
              {trend.trendDirection === 'INCREASING' && (
                <span className="flex items-center gap-1 font-bold text-rose-600">
                  <TrendingUp className="h-3.5 w-3.5" /> +{trend.sensSlopePerYear} {dataset.unit}/yr
                </span>
              )}
              {trend.trendDirection === 'DECREASING' && (
                <span className="flex items-center gap-1 font-bold text-teal-700">
                  <TrendingDown className="h-3.5 w-3.5" /> {trend.sensSlopePerYear} {dataset.unit}/yr
                </span>
              )}
              {trend.trendDirection === 'NO_TREND' && (
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Minus className="h-3.5 w-3.5" /> Stationary (p={trend.mannKendallPValue})
                </span>
              )}
            </div>
          )}

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            CSV
          </button>
        </div>
      </div>

      {/* SVG Time Series Plot */}
      <div className="relative mt-3 overflow-x-auto">
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
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={margin.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono font-medium"
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
                    stroke="#cbd5e1"
                  />
                  <text
                    x={pt.x}
                    y={height - margin.bottom + 18}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-mono font-medium"
                  >
                    {pt.date.substring(0, 4)}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Trend Line (Sen's Slope / OLS - Coral / Orange Accent) */}
          {trendLineD && (
            <path
              d={trendLineD}
              fill="none"
              stroke="#ea580c"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="opacity-85"
            />
          )}

          {/* Time Series Observed Path - Deep Teal / Emerald */}
          <path
            d={pathD}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.2"
          />

          {/* Observation Data Points */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.date === pt.date ? 5.5 : 3.5}
              className={`cursor-pointer transition-all ${
                hoveredPoint?.date === pt.date
                  ? 'fill-orange-500 stroke-white stroke-2'
                  : 'fill-teal-600 hover:fill-teal-800'
              }`}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 pointer-events-none rounded-xl border border-slate-200 bg-white/95 p-2.5 text-xs text-slate-800 shadow-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              marginTop: '-12px',
            }}
          >
            <div className="font-bold text-slate-900">{hoveredPoint.date}</div>
            <div className="text-emerald-700 font-mono font-bold">
              {hoveredPoint.value.toFixed(3)} {dataset.unit}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Observed Satellite Series
          </span>
          {trendLineD && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-0.5 w-4 bg-orange-600" /> Sen&apos;s Slope Robust Fit
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 font-medium">
          <Info className="h-3 w-3 text-slate-400" />
          <span>Calculated via NASA CMR &amp; ERA5 Reanalysis</span>
        </div>
      </div>
    </div>
  );
}
