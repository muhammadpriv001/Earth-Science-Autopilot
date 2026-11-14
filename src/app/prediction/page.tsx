'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  ShieldAlert,
  BarChart2,
  Info,
} from 'lucide-react';
import { ForecastResult, ForecastPoint } from '@/types';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';

export default function PredictionLaboratoryPage() {
  const [selectedVariable, setSelectedVariable] = useState('ndvi');
  const [horizonMonths, setHorizonMonths] = useState(24);
  const [modelType, setModelType] = useState<'Holt-Winters' | 'Seasonal-Naive' | 'AR-Ridge'>('Holt-Winters');
  const [isLoading, setIsLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchForecast = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/prediction/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableId: selectedVariable,
          horizonMonths,
          modelType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Forecasting failed');
      }

      const data: ForecastResult = await res.json();
      setForecastResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to compute forecast');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedVariable, horizonMonths, modelType]);

  // SVG Chart rendering dimensions
  const chartWidth = 960;
  const chartHeight = 360;
  const padding = { top: 30, right: 40, bottom: 40, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Compute unified scale for historical + hindcast + forecast
  let allChartValues: number[] = [];
  if (forecastResult) {
    allChartValues = [
      ...forecastResult.historicalObservations.map(o => o.value),
      ...forecastResult.forecastPoints.map(f => f.confidenceUpper95),
      ...forecastResult.forecastPoints.map(f => f.confidenceLower95),
    ];
  }

  const minY = allChartValues.length > 0 ? Math.min(...allChartValues) * 0.95 : 0;
  const maxY = allChartValues.length > 0 ? Math.max(...allChartValues) * 1.05 : 1;
  const rangeY = maxY - minY || 1;

  const totalPointsCount = forecastResult
    ? forecastResult.historicalObservations.length + forecastResult.forecastPoints.length
    : 100;

  const getX = (index: number) => padding.left + (index / (totalPointsCount - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minY) / rangeY) * innerHeight;

  // Path generators
  let histPath = '';
  let hindcastOffset = 0;
  let hindcastActualPath = '';
  let hindcastPredPath = '';
  let forecastPath = '';
  let area80Path = '';
  let area95Path = '';

  if (forecastResult) {
    const hist = forecastResult.historicalObservations;
    const splitIndex = hist.length - forecastResult.hindcastObservations.length;
    hindcastOffset = splitIndex;

    // Full historical line
    histPath = hist.reduce(
      (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.value).toFixed(1)}`,
      ''
    );

    // Hindcast comparison path
    forecastResult.hindcastObservations.forEach((pt, i) => {
      const idx = splitIndex + i;
      hindcastActualPath += `${i === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(pt.actual).toFixed(1)} `;
      hindcastPredPath += `${i === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(pt.predicted).toFixed(1)} `;
    });

    // Future forecast path
    const fPoints = forecastResult.forecastPoints;
    const startX = hist.length - 1;
    const lastHistVal = hist[startX].value;

    forecastPath = `M ${getX(startX).toFixed(1)} ${getY(lastHistVal).toFixed(1)} `;
    fPoints.forEach((f, i) => {
      forecastPath += `L ${getX(startX + 1 + i).toFixed(1)} ${getY(f.predictedValue).toFixed(1)} `;
    });

    // 80% CI Polygon
    let top80 = `M ${getX(startX).toFixed(1)} ${getY(lastHistVal).toFixed(1)} `;
    let bot80 = `L ${getX(startX).toFixed(1)} ${getY(lastHistVal).toFixed(1)} `;
    fPoints.forEach((f, i) => {
      top80 += `L ${getX(startX + 1 + i).toFixed(1)} ${getY(f.confidenceUpper80).toFixed(1)} `;
    });
    for (let i = fPoints.length - 1; i >= 0; i--) {
      bot80 += `L ${getX(startX + 1 + i).toFixed(1)} ${getY(fPoints[i].confidenceLower80).toFixed(1)} `;
    }
    area80Path = `${top80} ${bot80} Z`;

    // 95% CI Polygon
    let top95 = `M ${getX(startX).toFixed(1)} ${getY(lastHistVal).toFixed(1)} `;
    let bot95 = `L ${getX(startX).toFixed(1)} ${getY(lastHistVal).toFixed(1)} `;
    fPoints.forEach((f, i) => {
      top95 += `L ${getX(startX + 1 + i).toFixed(1)} ${getY(f.confidenceUpper95).toFixed(1)} `;
    });
    for (let i = fPoints.length - 1; i >= 0; i--) {
      bot95 += `L ${getX(startX + 1 + i).toFixed(1)} ${getY(fPoints[i].confidenceLower95).toFixed(1)} `;
    }
    area95Path = `${top95} ${bot95} Z`;
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Predictive Earth-System Modeling
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Prediction & Forecasting Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
            Empirical time-series forecasting with chronological out-of-sample backtesting, naive skill comparisons, and audited 80% / 95% uncertainty bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vegetation"
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/30 transition-colors"
          >
            Vegetation Intelligence
          </Link>
          <Link
            href="/cross-domain"
            className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cross-Domain Engine
          </Link>
        </div>
      </div>

      {/* Control Panel: Variable, Horizon, Model */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
        {/* Variable Selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Target Earth Variable
          </label>
          <select
            value={selectedVariable}
            onChange={e => setSelectedVariable(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="ndvi">NDVI — Vegetation Canopy Index</option>
            <option value="air-temperature">Air Temperature (2m Anomaly)</option>
            <option value="sea-ice-extent">Arctic Sea Ice Extent</option>
            <option value="precipitation">Precipitation Accumulation</option>
          </select>
        </div>

        {/* Horizon Pills */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Forecast Horizon ({horizonMonths} Months)
          </label>
          <div className="flex items-center gap-1.5">
            {[12, 24, 36, 48, 60].map(h => (
              <button
                key={h}
                onClick={() => setHorizonMonths(h)}
                className={`flex-1 rounded-xl py-2 text-xs font-mono font-bold transition-all ${
                  horizonMonths === h
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'border border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                {h}m
              </button>
            ))}
          </div>
        </div>

        {/* Model Selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Forecasting Model
          </label>
          <select
            value={modelType}
            onChange={e => setModelType(e.target.value as any)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="Holt-Winters">Holt-Winters (Level + Trend + Season)</option>
            <option value="Seasonal-Naive">Seasonal Naive Baseline (y_t-12)</option>
            <option value="AR-Ridge">Autoregressive Ridge</option>
          </select>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {forecastResult?.variableName || 'Empirical Forecast Trajectory'}
              </h2>
              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.2 text-[9px] font-bold text-cyan-300">
                {forecastResult?.modelType || modelType}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {forecastResult?.region.name} • Out-of-sample backtesting + {horizonMonths}-month projection
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-5 bg-slate-400 rounded-full" /> Historical Observations
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-0.5 w-5 border-t-2 border-dashed border-amber-400" /> Out-of-Sample Backtest
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="h-2 w-5 bg-cyan-400 rounded-full" /> Future Forecast
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400/80">
              <span className="h-3 w-5 bg-cyan-500/20 border border-cyan-400/40 rounded" /> 80% / 95% Bounds
            </span>
          </div>
        </div>

        {/* SVG Forecast Chart */}
        <div className="relative w-full overflow-x-auto">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                Computing chronological backtest and confidence intervals...
              </div>
            </div>
          )}

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none">
            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const y = padding.top + innerHeight * (1 - frac);
              const val = (minY + frac * rangeY).toFixed(2);
              return (
                <g key={frac}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Split boundary vertical line */}
            {forecastResult && (
              <line
                x1={getX(forecastResult.historicalObservations.length - 1)}
                y1={padding.top}
                x2={getX(forecastResult.historicalObservations.length - 1)}
                y2={chartHeight - padding.bottom}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* 95% Uncertainty Shaded Area */}
            {area95Path && <path d={area95Path} fill="rgba(6, 182, 212, 0.10)" />}

            {/* 80% Uncertainty Shaded Area */}
            {area80Path && <path d={area80Path} fill="rgba(6, 182, 212, 0.22)" />}

            {/* Historical Observations Line */}
            {histPath && (
              <path d={histPath} fill="none" stroke="#94a3b8" strokeWidth="1.8" />
            )}

            {/* Out-of-sample Backtest Predicted Line */}
            {hindcastPredPath && (
              <path
                d={hindcastPredPath}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
            )}

            {/* Future Forecast Line */}
            {forecastPath && (
              <path
                d={forecastPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />
            )}
          </svg>
        </div>

        {/* Split Legend Bar */}
        {forecastResult && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-2 border-t border-slate-900 font-mono">
            <div>
              Training Split: <span className="text-slate-200">{forecastResult.trainPeriod.start}</span> to{' '}
              <span className="text-slate-200">{forecastResult.trainPeriod.end}</span>
            </div>
            <div>
              Backtest Holdout: <span className="text-amber-400">{forecastResult.testPeriod.start}</span> to{' '}
              <span className="text-amber-400">{forecastResult.testPeriod.end}</span>
            </div>
            <div>
              Forecast Window: <span className="text-cyan-400 font-bold">{horizonMonths} Months Forward</span>
            </div>
          </div>
        )}
      </div>

      {/* Scorecard: Validation Metrics & Baseline Comparison */}
      {forecastResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Validation Metrics Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              Out-of-Sample Backtesting Metrics ({forecastResult.testPeriod.start} – {forecastResult.testPeriod.end})
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated strictly on held-out observations that were unseen during parameter estimation.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-3">
                <div className="text-[10px] text-slate-400">RMSE</div>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                  {forecastResult.validationMetrics.rmse}
                </div>
                <div className="text-[9px] text-slate-400">{forecastResult.unit}</div>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-3">
                <div className="text-[10px] text-slate-400">MAE</div>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                  {forecastResult.validationMetrics.mae}
                </div>
                <div className="text-[9px] text-slate-400">Mean Abs Error</div>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-3">
                <div className="text-[10px] text-slate-400">R² Score</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {forecastResult.validationMetrics.rSquared}
                </div>
                <div className="text-[9px] text-slate-400">Variance Explained</div>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-3">
                <div className="text-[10px] text-slate-400">Directional Skill</div>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                  {forecastResult.validationMetrics.directionalAccuracy}%
                </div>
                <div className="text-[9px] text-slate-400">Trend Signs</div>
              </div>
            </div>

            {/* Comparison vs Naive Baseline */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/60 p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Holt-Winters RMSE:</span>
                <span className="font-mono text-cyan-300 font-bold">{forecastResult.validationMetrics.rmse}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Seasonal Naive Baseline RMSE:</span>
                <span className="font-mono text-amber-400">{forecastResult.baselineMetrics.rmse}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-300 font-semibold">Error Reduction vs. Naive:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {forecastResult.baselineMetrics.rmse > 0
                    ? `+${(
                        ((forecastResult.baselineMetrics.rmse - forecastResult.validationMetrics.rmse) /
                          forecastResult.baselineMetrics.rmse) *
                        100
                      ).toFixed(1)}% Improvement`
                    : 'Comparable'}
                </span>
              </div>
            </div>
          </div>

          {/* Scientific Caveats & Methodology Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Epistemological Notice & Methodological Assumptions
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              {forecastResult.scientificAssumptions.map((assump, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span className="leading-relaxed">{assump}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-xs text-amber-200">
              <span className="font-bold text-amber-400">Advisory: </span>
              {forecastResult.uncertaintyNotice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

