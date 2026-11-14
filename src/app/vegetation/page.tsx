'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trees,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Flame,
  Leaf,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Info,
} from 'lucide-react';
import {
  SAHEL_VEGETATION_BENCHMARK,
  CALIFORNIA_FIRE_RECOVERY_BENCHMARK,
} from '@/lib/providers/mock-datasets';
import {
  extractVegetationPhenology,
  calculateVCI,
  analyzeFireRecovery,
} from '@/lib/science/vegetation';
import { mannKendallTest } from '@/lib/science/mann-kendall';
import { calculateSensSlope } from '@/lib/science/sens-slope';
import { calculateLinearRegression } from '@/lib/science/statistics';
import { InteractiveTimeSeriesChart } from '@/components/charts/InteractiveTimeSeriesChart';
import { StatisticalSummaryCard } from '@/components/research/StatisticalSummaryCard';
import { PhenologyCycle, FireRecoveryAnalysis } from '@/types';

type ActiveTab = 'trends' | 'phenology' | 'vci' | 'fire' | 'forest' | 'crops';

export default function VegetationWorkspacePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('trends');
  const [activeBenchmark, setActiveBenchmark] = useState<'sahel' | 'fire'>('sahel');

  const dataset = activeBenchmark === 'sahel' ? SAHEL_VEGETATION_BENCHMARK : CALIFORNIA_FIRE_RECOVERY_BENCHMARK;
  const values = dataset.observations.map(o => o.value);
  const timeIndices = values.map((_, i) => i);

  // 1. Trend Analysis
  const mkResult = mannKendallTest(values);
  const sensSlope = calculateSensSlope(timeIndices, values);
  const linReg = calculateLinearRegression(timeIndices, values);

  const annualSlope = sensSlope.medianSlope * 12; // monthly to annual
  const isGreening = annualSlope > 0 && mkResult.pValue < 0.05;
  const isBrowning = annualSlope < 0 && mkResult.pValue < 0.05;

  // 2. Phenology
  const phenologyCycles = extractVegetationPhenology(dataset.observations);

  // 3. VCI
  const vciPoints = calculateVCI(dataset.observations);
  const recentVCI = vciPoints.slice(-12);

  // 4. Fire Recovery
  const fireAnalysis = analyzeFireRecovery(
    CALIFORNIA_FIRE_RECOVERY_BENCHMARK.observations,
    '2018-11-08'
  );

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Trees className="h-4 w-4" /> Biosphere Intelligence System
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Vegetation Intelligence Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
            Autonomous Earth-observation biosystem laboratory: canopy greening, seasonal phenology, drought stress, and post-wildfire regrowth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/prediction?variable=ndvi"
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Forecast Vegetation
          </Link>
          <Link
            href="/cross-domain?varA=precipitation&varB=ndvi"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-[1.02]"
          >
            <Activity className="h-3.5 w-3.5" />
            Rainfall vs. Greening
          </Link>
        </div>
      </div>

      {/* Dataset & Study Region Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{dataset.region.name}</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-mono font-bold text-emerald-300">
                {dataset.provider}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {dataset.datasetName} • {dataset.observations.length} observations ({dataset.observations[0].date} to {dataset.observations[dataset.observations.length - 1].date})
            </div>
          </div>
        </div>

        {/* Quick Benchmark Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Benchmark:</span>
          <button
            onClick={() => setActiveBenchmark('sahel')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeBenchmark === 'sahel'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'border border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            Sahel Greening (2000-2024)
          </button>
          <button
            onClick={() => setActiveBenchmark('fire')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeBenchmark === 'fire'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'border border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            California Camp Fire Recovery
          </button>
        </div>
      </div>

      {/* Workspace Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-900 pb-2">
        {[
          { id: 'trends', label: '1. Trends & Detection', icon: TrendingUp },
          { id: 'phenology', label: '2. Land Phenology (SOS/EOS)', icon: Calendar },
          { id: 'vci', label: '3. Health & Drought Stress (VCI)', icon: Activity },
          { id: 'fire', label: '4. Fire & Post-Fire Recovery', icon: Flame },
          { id: 'forest', label: '5. Forest Canopy & Biomass', icon: Trees },
          { id: 'crops', label: '6. Agricultural Crops', icon: Leaf },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: TRENDS & STATISTICAL DETECTION */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Classification Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold ${
                  isGreening
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isBrowning
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {isGreening ? '🌱' : isBrowning ? '🍂' : '⚖️'}
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isGreening
                    ? 'Statistically Significant Greening Trend'
                    : isBrowning
                    ? 'Statistically Significant Browning Trend'
                    : 'Stable / Non-Significant Trend'}
                </div>
                <div className="text-xs text-slate-400">
                  Sen&apos;s Slope: <span className="font-mono text-emerald-300 font-bold">{annualSlope >= 0 ? `+${annualSlope.toFixed(4)}` : annualSlope.toFixed(4)} NDVI/year</span> • Mann-Kendall p-value: <span className="font-mono text-cyan-300 font-bold">{mkResult.pValue < 0.001 ? 'p < 0.001' : `p = ${mkResult.pValue.toFixed(3)}`}</span>
                </div>
              </div>
            </div>

            <Link
              href="/prediction?variable=ndvi"
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Extrapolate Future Trajectory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Time Series Chart */}
          <InteractiveTimeSeriesChart
            dataset={dataset}
            trend={{
              linearSlopePerYear: parseFloat(annualSlope.toFixed(4)),
              linearIntercept: linReg.intercept,
              rSquared: linReg.rSquared,
              standardError: linReg.standardError,
              mannKendallS: mkResult.s,
              mannKendallVarS: mkResult.varS,
              mannKendallZ: mkResult.z,
              mannKendallPValue: mkResult.pValue,
              isSignificant: mkResult.pValue < 0.05,
              significanceThreshold: 0.05,
              trendDirection: isGreening ? 'INCREASING' : isBrowning ? 'DECREASING' : 'NO_TREND',
              sensSlopePerYear: parseFloat(annualSlope.toFixed(4)),
              sensSlopeConfidenceInterval: [
                sensSlope.confidenceInterval[0] * 12,
                sensSlope.confidenceInterval[1] * 12,
              ],
              totalObservations: values.length,
              validObservations: values.length,
              missingObservations: 0,
              meanValue: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3)),
              minValue: Math.min(...values),
              maxValue: Math.max(...values),
              standardDeviation: parseFloat(
                Math.sqrt(
                  values.reduce((s, v) => s + (v - values.reduce((a, b) => a + b, 0) / values.length) ** 2, 0) /
                    values.length
                ).toFixed(3)
              ),
              assumptions: [
                'Non-parametric Sen slope estimator is immune to severe single-month cloud and sensor dropouts.',
                'Mann-Kendall test accounts for tied values within identical reflectance quantizations.',
              ],
              limitationsNotice: 'Sub-pixel cloud shadow can introduce downward noise spikes in optical vegetation indices.',
            }}
          />
        </div>
      )}

      {/* TAB CONTENT 2: PHENOLOGY */}
      {activeTab === 'phenology' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Land Surface Phenology Cycles ({phenologyCycles.length} Annual Seasons Analyzed)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Dynamic 25% amplitude threshold detection identifying Start of Season (SOS), Peak of Season (POS), and End of Season (EOS).
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3 py-1.5 text-xs text-emerald-300 font-mono">
                Avg Season: ~{Math.round(phenologyCycles.reduce((s, c) => s + c.lengthOfSeasonDays, 0) / (phenologyCycles.length || 1))} days
              </div>
            </div>

            {/* Phenology Cycles Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Start (SOS)</th>
                    <th className="py-2.5 px-3">Peak (POS)</th>
                    <th className="py-2.5 px-3">End (EOS)</th>
                    <th className="py-2.5 px-3">Length</th>
                    <th className="py-2.5 px-3">Base NDVI</th>
                    <th className="py-2.5 px-3">Peak NDVI</th>
                    <th className="py-2.5 px-3">Amplitude</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-mono text-slate-300">
                  {phenologyCycles.slice(-10).map(c => (
                    <tr key={c.year} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-bold text-white">{c.year}</td>
                      <td className="py-2.5 px-3 text-emerald-400">{c.startOfSeason}</td>
                      <td className="py-2.5 px-3 text-cyan-300">{c.peakOfSeason}</td>
                      <td className="py-2.5 px-3 text-amber-400">{c.endOfSeason}</td>
                      <td className="py-2.5 px-3 text-slate-200">{c.lengthOfSeasonDays} days</td>
                      <td className="py-2.5 px-3 text-slate-400">{c.baseLevel.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-emerald-300 font-bold">{c.maximumValue.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-teal-300">+{c.seasonalAmplitude.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: VCI & DROUGHT STRESS */}
      {activeTab === 'vci' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Vegetation Condition Index (VCI) Drought Monitoring
            </h3>
            <p className="text-xs text-slate-400">
              VCI evaluates where the current month&apos;s NDVI stands relative to the historical absolute minimum and maximum for that exact calendar month.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {recentVCI.map((p, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 flex flex-col justify-between ${
                    p.condition === 'Extreme Stress'
                      ? 'border-rose-500/40 bg-rose-950/20'
                      : p.condition === 'Moderate Drought'
                      ? 'border-amber-500/40 bg-amber-950/20'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{p.date.slice(0, 7)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        p.condition === 'Extreme Stress'
                          ? 'bg-rose-500/20 text-rose-300'
                          : p.condition === 'Moderate Drought'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {p.condition}
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="text-2xl font-bold font-mono text-white">
                      {p.vci}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Observed NDVI: <span className="font-mono text-slate-200">{p.ndvi}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        p.vci < 20 ? 'bg-rose-500' : p.vci < 35 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${p.vci}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FIRE RECOVERY */}
      {activeTab === 'fire' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  Post-Wildfire Canopy Regrowth & Regeneration Trajectory
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Analyzes post-burn canopy loss and fits an asymptotic regrowth curve to estimate full ecological recovery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                  {fireAnalysis.status} ({fireAnalysis.recoveryPercentage}% Recovered)
                </span>
              </div>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                <div className="text-[11px] text-slate-400">Pre-Fire Baseline</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {fireAnalysis.preFireBaselineNDVI} NDVI
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                <div className="text-[11px] text-slate-400">Burn Minimum Scar</div>
                <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                  {fireAnalysis.postFireMinNDVI} NDVI
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                <div className="text-[11px] text-slate-400">Current Regrowth</div>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                  {fireAnalysis.currentNDVI} NDVI
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                <div className="text-[11px] text-slate-400">Estimated Full Recovery</div>
                <div className="text-sm font-bold font-mono text-amber-300 mt-1">
                  {fireAnalysis.estimatedFullRecoveryDate || 'Projected ~2027'}
                </div>
              </div>
            </div>

            {/* Trajectory Table */}
            <div className="rounded-xl border border-slate-900 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Observed NDVI</th>
                    <th className="py-2.5 px-3">Modeled Recovery Target</th>
                    <th className="py-2.5 px-3">Net Deficit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-mono text-slate-300">
                  {fireAnalysis.recoveryTrajectory.map(t => (
                    <tr key={t.date} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 font-semibold text-white">{t.date}</td>
                      <td className="py-2 px-3 text-cyan-300">{t.ndvi}</td>
                      <td className="py-2 px-3 text-emerald-400">{t.expectedRecovery}</td>
                      <td className="py-2 px-3 text-rose-400">
                        -{(fireAnalysis.preFireBaselineNDVI - t.ndvi).toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: FOREST & BIOMASS */}
      {activeTab === 'forest' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trees className="h-4 w-4 text-emerald-400" />
              Forest Canopy Closure & GEDI Lidar Biomass Density
            </h3>
            <p className="text-xs text-slate-400">
              Global forest change indicators combining Hansen Global Forest Change (UMD) with NASA GEDI waveform lidar aboveground biomass estimates.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
                <div className="text-xs text-slate-400 font-semibold">Tree Canopy Closure</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">68.4%</div>
                <p className="text-[11px] text-slate-400">
                  Landsat 30m multi-spectral spectral unmixing baseline.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
                <div className="text-xs text-slate-400 font-semibold">Aboveground Biomass Density</div>
                <div className="text-3xl font-extrabold font-mono text-cyan-300">142.8 Mg/ha</div>
                <p className="text-[11px] text-slate-400">
                  NASA GEDI L4A waveform lidar footprints (±18.2 Mg/ha uncertainty).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
                <div className="text-xs text-slate-400 font-semibold">Cumulative Canopy Loss (2000-2024)</div>
                <div className="text-3xl font-extrabold font-mono text-rose-400">-4.2%</div>
                <p className="text-[11px] text-slate-400">
                  Selective clearing and fire disturbances across study radius.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: CROPS */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-400" />
              Agricultural Vegetation & Crop Season Monitoring
            </h3>
            <p className="text-xs text-slate-400">
              Observing crop emergence, peak biomass, and senescence cycles across cropland pixels. Note: Crop condition monitoring does not estimate yield without calibrated agro-meteorological crop models.
            </p>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Kharif / Summer Monsoon Crop Profile
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vegetation green-up accelerates sharply in late July following the onset of monsoon rains, reaching seasonal maximum in mid-September (NDVI ~0.55), followed by rapid harvesting dry-down in late October.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/cross-domain?varA=precipitation&varB=ndvi"
                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                >
                  Analyze Rainfall-Yield Cross Correlation
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

