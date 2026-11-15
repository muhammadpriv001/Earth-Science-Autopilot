'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import {
  getLiveVariable,
  LIVE_VARIABLE_GROUPS,
  LIVE_VARIABLES,
} from '@/lib/science/live-capabilities';
import type { ForecastResult, GeographicRegion } from '@/types';
import { ForecastChart } from '@/components/charts/ForecastChart';
import { ExploreChatPanel } from '@/components/research/ExploreChatPanel';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export default function ForecastAIPage() {
  const { mainLocation } = useLocation();

  const [selectedVariable, setSelectedVariable] = useState('air-temperature');
  const [horizonMonths, setHorizonMonths] = useState<number>(24);
  const [modelType, setModelType] = useState<'holt-winters' | 'seasonal-naive'>('holt-winters');
  const [climateScenario, setClimateScenario] = useState<'baseline' | 'stress'>('baseline');

  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentVar = getLiveVariable(selectedVariable) || LIVE_VARIABLES[0];
  const radiusKm = mainLocation.radiusKm || 100;
  const isRadiusLocked = Boolean(mainLocation.isRadiusLocked);

  const region: GeographicRegion = {
    name: mainLocation.name,
    geometryType: 'point',
    coordinates: mainLocation.coordinates,
    center: mainLocation.coordinates,
    areaKm2: Math.round(Math.PI * radiusKm * radiusKm),
  };

  const fetchForecast = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/prediction/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          variableId: selectedVariable,
          region: {
            name: region.name,
            geometryType: region.geometryType,
            coordinates: region.coordinates,
            center: region.center,
          },
          startDate: '1994-01-01',
          endDate: new Date().toISOString().slice(0, 10),
          horizonMonths,
          modelType,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.forecast) {
        throw new Error(data.error || data.message || `Forecast API returned HTTP ${response.status}`);
      }

      setForecast(data.forecast as ForecastResult);
    } catch (error) {
      if (signal?.aborted) return;
      console.error('Forecast request failed:', error);
      setForecast(null);
      setErrorMsg(error instanceof Error ? error.message : 'Live observations could not be retrieved.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [
    selectedVariable,
    horizonMonths,
    modelType,
    region.name,
    region.geometryType,
    region.coordinates[0],
    region.coordinates[1],
  ]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchForecast(controller.signal);
    return () => controller.abort();
  }, [fetchForecast]);

  return (
    <div className="mx-auto max-w-[1920px] space-y-5 px-3 py-4 sm:px-6 sm:py-5">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="flex flex-wrap items-center gap-2.5 text-lg font-black text-slate-900 sm:text-2xl">
              Forecast AI Laboratory
              <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-0.5 text-xs font-mono font-bold text-emerald-800">
                80% &amp; 95% Confidence Intervals
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic Holt-Winters exponential smoothing and climate risk scenarios for {mainLocation.name}.
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:flex-nowrap">
          {/* Variable Selector */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <Layers className="h-4 w-4 text-emerald-600" />
            <select
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {LIVE_VARIABLE_GROUPS.map(group => (
                <optgroup key={group.id} label={group.label}>
                  {group.variableIds.map(id => {
                    const variable = getLiveVariable(id);
                    if (!variable) return null;
                    return (
                      <option key={id} value={id} className="bg-white text-slate-900">
                        {variable.name} ({variable.unit})
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>

          <button
            onClick={() => void fetchForecast()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            Re-Forecast
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout: Forecast Analytics (Left) + AI Forecast Chat (Right) */}
      <div className="workspace-forecast grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Forecast Analytics Panel (8 cols) */}
        <div className="lg:col-span-8 h-full rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md flex flex-col justify-between overflow-y-auto space-y-4">
          {/* Parameter Tuning Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3.5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Forecast Horizon
              </label>
              <select
                value={horizonMonths}
                onChange={e => setHorizonMonths(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value={6}>6 Months (Near-Term)</option>
                <option value={12}>12 Months (1 Seasonal Cycle)</option>
                <option value={24}>24 Months (2 Seasonal Cycles)</option>
                <option value={36}>36 Months (3 Seasonal Cycles)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Mathematical Model
              </label>
              <select
                value={modelType}
                onChange={e => setModelType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="holt-winters">Holt-Winters Additive (Triple Exponential)</option>
                <option value="seasonal-naive">Seasonal Naive Baseline (Lag-12)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Climate Forcing Scenario
              </label>
              <select
                value={climateScenario}
                onChange={e => setClimateScenario(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="baseline">Historical Climatology Baseline</option>
                <option value="stress">+1.5 °C Thermal &amp; Precipitation Stress</option>
              </select>
            </div>
          </div>
          <p className="-mt-2 px-1 text-[10px] text-slate-500">
            Scenario is a planning context only; the current forecast API uses the selected statistical model and does not yet apply scenario forcing.
          </p>

          {/* Interactive Forecast Chart */}
          <div className="flex-1 min-h-[300px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{currentVar.name} Predictive Trajectory</span>
                <span className="font-mono text-emerald-700 font-bold text-[11px]">({currentVar.unit})</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono font-semibold">
                <div className="flex items-center gap-1.5 text-teal-800">
                  <span className="h-2 w-3 rounded-sm bg-teal-600" /> Historical
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <span className="h-2 w-3 rounded-sm bg-amber-500" /> Backtest
                </div>
                <div className="flex items-center gap-1.5 text-orange-700">
                  <span className="h-2 w-3 rounded-sm bg-orange-500" /> Forecast (80%/95% CI)
                </div>
              </div>
            </div>

            {/* SVG Forecast Visualization */}
            <div className="relative w-full h-[260px] rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3 flex items-center justify-center">
              {loading ? (
                <div className="text-center text-xs text-emerald-700 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Holt-Winters optimization...
                </div>
              ) : errorMsg ? (
                <div className="px-6 text-center space-y-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
                  <div className="text-xs font-bold text-amber-900">Live forecast unavailable</div>
                  <p className="text-[11px] text-amber-800 leading-relaxed max-w-md">
                    {errorMsg} Choose a variable backed by NASA POWER or NSIDC. No synthetic curve
                    is drawn in place of real observations.
                  </p>
                </div>
              ) : forecast ? (
                <ForecastChart forecast={forecast} />
              ) : (
                <div className="text-xs text-slate-500">
                  Select a variable and run a forecast to plot measured observations.
                </div>
              )}
            </div>
          </div>

          {/* Validation Metrics & Anomaly Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3">
              <div className="text-[10px] text-slate-500 font-semibold">Out-of-Sample MAE</div>
              <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                {forecast?.validationMetrics?.mae !== undefined
                  ? forecast.validationMetrics.mae.toFixed(3)
                  : '—'}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3">
              <div className="text-[10px] text-slate-500 font-semibold">RMSE Accuracy</div>
              <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                {forecast?.validationMetrics?.rmse !== undefined
                  ? forecast.validationMetrics.rmse.toFixed(3)
                  : '—'}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3">
              <div className="text-[10px] text-slate-500 font-semibold">Backtest R² Score</div>
              <div className="text-sm font-black font-mono text-emerald-700 mt-0.5">
                {forecast?.validationMetrics?.rSquared !== undefined
                  ? forecast.validationMetrics.rSquared.toFixed(2)
                  : '—'}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3">
              <div className="text-[10px] text-slate-500 font-semibold">Directional Accuracy</div>
              <div className="text-sm font-black font-mono text-teal-700 mt-0.5">
                {forecast?.validationMetrics?.directionalAccuracy !== undefined
                  ? `${forecast.validationMetrics.directionalAccuracy.toFixed(1)}%`
                  : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: shared Earth Science AI chat panel */}
        <div className="h-[75dvh] min-h-[320px] lg:col-span-4 lg:h-[86%] lg:max-h-[560px] lg:min-h-[360px] lg:self-center">
          <ExploreChatPanel
            mode="forecast"
            region={region}
            variable={selectedVariable}
            variableName={currentVar.name}
            variableUnit={currentVar.unit}
            radiusKm={radiusKm}
            isRadiusLocked={isRadiusLocked}
            horizonMonths={horizonMonths}
            modelType={modelType}
            forecast={forecast}
          />
        </div>
      </div>
    </div>
  );
}
