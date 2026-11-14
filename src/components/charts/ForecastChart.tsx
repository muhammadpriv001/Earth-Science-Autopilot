'use client';

import React from 'react';
import { ForecastResult } from '@/types';

interface Props {
  forecast: ForecastResult;
  /** Maximum number of historical monthly observations to draw for context. */
  historyWindow?: number;
}

/**
 * Draws the observed, hindcast and projected series returned by the forecasting
 * pipeline. Every coordinate is derived from the model output — there are no
 * hard-coded curve paths.
 */
export function ForecastChart({ forecast, historyWindow = 60 }: Props) {
  const history = forecast.historicalObservations.slice(-historyWindow);
  const forecastPoints = forecast.forecastPoints;
  const hindcast = forecast.hindcastObservations.slice(-history.length);

  if (history.length === 0 || forecastPoints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] text-xs text-slate-500">
        The model returned no drawable observations.
      </div>
    );
  }

  const width = 620;
  const height = 220;
  const margin = { top: 18, right: 52, bottom: 28, left: 46 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const total = history.length + forecastPoints.length;
  const getX = (index: number) =>
    margin.left + (total <= 1 ? 0 : (index / (total - 1)) * innerWidth);

  const values: number[] = [
    ...history.map(o => o.value),
    ...forecastPoints.map(p => p.predictedValue),
    ...forecastPoints.map(p => p.confidenceLower95),
    ...forecastPoints.map(p => p.confidenceUpper95),
  ];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const yMin = minVal - range * 0.08;
  const yMax = maxVal + range * 0.08;
  const getY = (value: number) =>
    margin.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

  const historyPath = history
    .map((o, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(2)},${getY(o.value).toFixed(2)}`)
    .join(' ');

  const offset = history.length;
  const forecastPath = forecastPoints
    .map((p, i) => {
      const x = getX(offset + i);
      const y = getY(p.predictedValue);
      const prefix = i === 0 ? 'M' : 'L';
      return `${prefix} ${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const hindcastPath = hindcast
    .map((h, i) => {
      const historyIndex = history.length - hindcast.length + i;
      const prefix = i === 0 ? 'M' : 'L';
      return `${prefix} ${getX(historyIndex).toFixed(2)},${getY(h.predicted).toFixed(2)}`;
    })
    .join(' ');

  const bandPolygon = (lower: (p: typeof forecastPoints[number]) => number, upper: (p: typeof forecastPoints[number]) => number) => {
    const upperPoints = forecastPoints.map((p, i) => `${getX(offset + i).toFixed(2)},${getY(upper(p)).toFixed(2)}`);
    const lowerPoints = forecastPoints
      .map((p, i) => `${getX(offset + i).toFixed(2)},${getY(lower(p)).toFixed(2)}`)
      .reverse();
    return [...upperPoints, ...lowerPoints].join(' ');
  };

  const band95 = bandPolygon(p => p.confidenceLower95, p => p.confidenceUpper95);
  const band80 = bandPolygon(p => p.confidenceLower80, p => p.confidenceUpper80);

  const gridValues = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) / 4) * i);
  const separatorX = getX(offset);
  const shortDate = (iso: string) => iso.slice(0, 7);

  return (
    <svg
      className="w-full h-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Observed and projected ${forecast.variableName} trajectory`}
    >
      {/* Horizontal grid and y-axis labels */}
      {gridValues.map((value, idx) => {
        const y = getY(value);
        return (
          <g key={idx}>
            <line
              x1={margin.left}
              y1={y}
              x2={width - margin.right}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={margin.left - 6}
              y={y + 3}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="8"
              fontFamily="monospace"
            >
              {value.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* 95% prediction band */}
      <polygon points={band95} fill="rgba(249, 115, 22, 0.12)" />
      {/* 80% prediction band */}
      <polygon points={band80} fill="rgba(249, 115, 22, 0.22)" />

      {/* Forecast/hindcast split */}
      <line
        x1={separatorX}
        y1={margin.top}
        x2={separatorX}
        y2={margin.top + innerHeight}
        stroke="#f97316"
        strokeDasharray="2 2"
        strokeWidth="1.2"
      />

      {/* Historical observations */}
      <path d={historyPath} fill="none" stroke="#0d9488" strokeWidth="2.2" strokeLinejoin="round" />

      {/* Hindcast validation (dashed amber) */}
      {hindcast.length > 1 && (
        <path
          d={hindcastPath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />
      )}

      {/* Projected trajectory */}
      <path d={forecastPath} fill="none" stroke="#ea580c" strokeWidth="2.8" strokeLinejoin="round" />

      {/* X-axis labels */}
      <text
        x={margin.left}
        y={height - 8}
        textAnchor="start"
        fill="#94a3b8"
        fontSize="8"
        fontFamily="monospace"
      >
        {shortDate(history[0].date)}
      </text>
      <text
        x={separatorX}
        y={height - 8}
        textAnchor="middle"
        fill="#ea580c"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {shortDate(forecastPoints[0].date)}
      </text>
      <text
        x={width - margin.right}
        y={height - 8}
        textAnchor="end"
        fill="#94a3b8"
        fontSize="8"
        fontFamily="monospace"
      >
        {shortDate(forecastPoints[forecastPoints.length - 1].date)}
      </text>
    </svg>
  );
}
