'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { ForecastResult } from '@/types';
import { ForecastChart } from '@/components/charts/ForecastChart';
import {
  Sparkles,
  Sliders,
  Send,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Layers,
  MapPin,
  Calendar,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function ForecastAIPage() {
  const { mainLocation } = useLocation();
  const { saveInvestigation } = useAuth();

  const [selectedVariable, setSelectedVariable] = useState('air-temperature');
  const [horizonMonths, setHorizonMonths] = useState<number>(24);
  const [modelType, setModelType] = useState<'holt-winters' | 'seasonal-naive'>('holt-winters');
  const [climateScenario, setClimateScenario] = useState<'baseline' | 'stress'>('baseline');

  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forecast AI Chat
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Hello! I am your Earth-Science Forecast Assistant. I evaluate time-series trajectories, Holt-Winters exponential smoothing forecasts, and out-of-sample confidence intervals for ${mainLocation.name}. Ask me about future seasonal cycles, drought probabilities, or environmental tipping points.`,
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/prediction/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableId: selectedVariable,
          region: {
            name: mainLocation.name,
            geometryType: 'point',
            coordinates: mainLocation.coordinates,
            center: mainLocation.coordinates,
          },
          startDate: '1994-01-01',
          endDate: new Date().toISOString().slice(0, 10),
          horizonMonths,
          modelType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.forecast) {
        setForecast(data.forecast);
      } else {
        setForecast(null);
        setErrorMsg(data.error || 'Live observations are unavailable for this variable.');
      }
    } catch (err) {
      console.error('Forecast error:', err);
      setForecast(null);
      setErrorMsg('Live observations could not be retrieved.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [mainLocation.name, selectedVariable, horizonMonths, modelType]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const newMessages = [
      ...messages,
      { role: 'user' as const, text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch('/api/explore/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `[FORECAST INVESTIGATION FOR ${mainLocation.name}] Variable: ${selectedVariable}. Horizon: ${horizonMonths} months. User Question: ${userText}`,
          region: {
            name: mainLocation.name,
            geometryType: 'point',
            coordinates: mainLocation.coordinates,
            center: mainLocation.coordinates,
          },
          variable: selectedVariable,
        }),
      });

      const data = await res.json();
      const latestPoint = forecast?.forecastPoints?.[
        Math.min(horizonMonths - 1, (forecast?.forecastPoints?.length || 1) - 1)
      ];
      const reply =
        data.answer ||
        (forecast && latestPoint
          ? `The ${modelType} forecast for ${selectedVariable} in ${mainLocation.name} projects ` +
            `${latestPoint.predictedValue?.toFixed(3)} ${currentVar.unit} at the ${horizonMonths}-month horizon. ` +
            `The 95% prediction interval spans ${latestPoint.confidenceLower95?.toFixed(3)} to ${latestPoint.confidenceUpper95?.toFixed(3)} ${currentVar.unit}. ` +
            `Out-of-sample RMSE is ${forecast.validationMetrics?.rmse?.toFixed(3) ?? 'not reported'}.`
          : `I can only discuss live-model output. No forecast is currently available for ${selectedVariable} at ${mainLocation.name}, so I will not invent projected values.`);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'The forecast assistant is unreachable right now. No projected values are being shown rather than estimating them.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentVar = EARTH_VARIABLES.find(v => v.id === selectedVariable) || EARTH_VARIABLES[0];

  return (
    <div className="mx-auto max-w-[1920px] px-3 sm:px-6 py-5 space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              Forecast AI Laboratory
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-mono font-bold text-emerald-800">
                80% &amp; 95% Confidence Intervals
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic Holt-Winters exponential smoothing and climate risk scenarios for {mainLocation.name}.
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Variable Selector */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <Layers className="h-4 w-4 text-emerald-600" />
            <select
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {EARTH_VARIABLES.map(v => (
                <option key={v.id} value={v.id} className="bg-white text-slate-900">
                  {v.name} ({v.unit})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchForecast}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            Re-Forecast
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout: Forecast Analytics (Left) + AI Forecast Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-185px)] min-h-[640px]">
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

        {/* Right: Integrated Forecast AI Chat Panel (4 cols) */}
        <div className="lg:col-span-4 h-full rounded-3xl border border-slate-200/80 bg-white/95 flex flex-col justify-between overflow-hidden shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
          {/* Chat Header */}
          <div className="border-b border-slate-100 p-4 flex items-center justify-between bg-[#f8faf9]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Forecast AI Detective</h3>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ground Truth Context Active
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 font-medium truncate max-w-[120px]">
              {mainLocation.name.split(',')[0]}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                      : 'border border-slate-200 bg-[#f8faf9] text-slate-800 shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`mt-1.5 text-[9px] font-mono ${
                      m.role === 'user' ? 'text-orange-100 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div className="h-7 w-7 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-800 shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Computing model likelihood &amp; seasonal confidence...
                </div>
              </div>
            )}
          </div>

          {/* Chat Quick Prompts */}
          <div className="px-3.5 py-2 border-t border-slate-100 bg-[#f8faf9] flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setInputMessage(`What are the primary climate risks projected for ${mainLocation.name} in the next 24 months?`)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:text-slate-900 shadow-xs whitespace-nowrap"
            >
              Future Climate Risks?
            </button>
            <button
              type="button"
              onClick={() => setInputMessage(`How reliable is the 95% confidence interval for ${selectedVariable}?`)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:text-slate-900 shadow-xs whitespace-nowrap"
            >
              CI Confidence Analysis?
            </button>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-100 bg-white">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask Forecast AI about future trends, scenarios or risks..."
                className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none pr-10 shadow-inner"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 shadow-sm transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
