// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — TIME-SERIES PROCESSING PIPELINE
// ==============================================================================
// Orchestrates data parsing, missing-value filtering, temporal aggregation,
// and statistical trend tests into a unified, reproducible pipeline.
// ==============================================================================

import { TimeSeriesObservation, StatisticalTrendResult } from '@/types';
import { calculateDescriptiveStats, calculateLinearRegression } from './statistics';
import { mannKendallTest } from './mann-kendall';
import { calculateSensSlope } from './sens-slope';

export interface PipelineOptions {
  alpha?: number; // Significance threshold, default 0.05
  aggregation?: 'Daily' | 'Monthly' | 'Annual';
  handleMissing?: 'drop' | 'zero';
}

/**
 * Converts ISO dates (YYYY-MM-DD) into fractional decimal years (e.g. 2024.5)
 * for accurate temporal regression and slope scaling.
 */
export function dateToDecimalYear(dateStr: string): number {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
  const day = parts[2] ? parseInt(parts[2], 10) : 1;

  const date = new Date(Date.UTC(year, month, day));
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

  const fraction = (date.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime());
  return year + fraction;
}

/**
 * Executes the complete scientific trend analysis pipeline on a series of observations
 */
export function analyzeTimeSeries(
  observations: TimeSeriesObservation[],
  options: PipelineOptions = {}
): StatisticalTrendResult {
  const alpha = options.alpha || 0.05;

  // 1. Filter and clean valid observations
  const validObservations = observations.filter(
    obs => obs.qualityFlag !== 'MISSING' && typeof obs.value === 'number' && !isNaN(obs.value)
  );

  const rawValues = observations.map(o => o.value);
  const stats = calculateDescriptiveStats(rawValues);

  if (validObservations.length < 4) {
    return {
      linearSlopePerYear: 0,
      linearIntercept: stats.mean,
      rSquared: 0,
      standardError: 0,
      mannKendallS: 0,
      mannKendallVarS: 0,
      mannKendallZ: 0,
      mannKendallPValue: 1.0,
      isSignificant: false,
      significanceThreshold: alpha,
      trendDirection: 'NO_TREND',
      sensSlopePerYear: 0,
      totalObservations: observations.length,
      validObservations: validObservations.length,
      missingObservations: observations.length - validObservations.length,
      meanValue: stats.mean,
      minValue: stats.min,
      maxValue: stats.max,
      standardDeviation: stats.stdDev,
      assumptions: ['Insufficient data (<4 valid observations) to compute statistically sound trend.'],
      limitationsNotice: 'Analysis could not be computed due to inadequate sample size.',
    };
  }

  // 2. Extract decimal years (t) and observed values (y)
  const timeYears = validObservations.map(o => dateToDecimalYear(o.date));
  const values = validObservations.map(o => o.value);

  // 3. Compute OLS Linear Regression
  const regression = calculateLinearRegression(timeYears, values);

  // 4. Compute Mann-Kendall Non-parametric Trend Test
  const mk = mannKendallTest(values, alpha);

  // 5. Compute Sen's Slope Estimator
  const sens = calculateSensSlope(timeYears, values, alpha);

  // 6. Formulate methodological caveats & assumptions
  const assumptions: string[] = [
    'Mann-Kendall test assumes independent observations without strong high-frequency serial autocorrelation.',
    'Sen slope assumes monotonic linear or piece-wise trend; robust against non-normal outliers.',
    'Linear regression assumes normally distributed residuals and homoscedastic variance.',
  ];

  let limitationsNotice = `Evaluated across ${validObservations.length} observations (${stats.missingCount} missing excluded). `;
  if (mk.isSignificant) {
    limitationsNotice += `Statistically significant ${mk.trendDirection.toLowerCase()} trend detected at alpha = ${alpha} (p = ${mk.pValue < 0.001 ? '<0.001' : mk.pValue.toFixed(4)}).`;
  } else {
    limitationsNotice += `No statistically significant monotonic trend detected at alpha = ${alpha} (p = ${mk.pValue.toFixed(4)}). Observed variations may represent natural variability or noise.`;
  }

  return {
    linearSlopePerYear: Number(regression.slopePerYear.toFixed(4)),
    linearIntercept: Number(regression.intercept.toFixed(4)),
    rSquared: Number(regression.rSquared.toFixed(4)),
    standardError: Number(regression.standardError.toFixed(4)),
    mannKendallS: mk.s,
    mannKendallVarS: Number(mk.varS.toFixed(2)),
    mannKendallZ: Number(mk.z.toFixed(4)),
    mannKendallPValue: Number(mk.pValue.toFixed(5)),
    isSignificant: mk.isSignificant,
    significanceThreshold: alpha,
    trendDirection: mk.trendDirection,
    sensSlopePerYear: Number(sens.slopePerYear.toFixed(4)),
    sensSlopeConfidenceInterval: [
      Number(sens.confidenceInterval[0].toFixed(4)),
      Number(sens.confidenceInterval[1].toFixed(4)),
    ],
    totalObservations: observations.length,
    validObservations: validObservations.length,
    missingObservations: stats.missingCount,
    meanValue: Number(stats.mean.toFixed(2)),
    minValue: Number(stats.min.toFixed(2)),
    maxValue: Number(stats.max.toFixed(2)),
    standardDeviation: Number(stats.stdDev.toFixed(2)),
    assumptions,
    limitationsNotice,
  };
}

