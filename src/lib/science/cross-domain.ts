// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — CROSS-DOMAIN DISCOVERY ENGINE
// ==============================================================================
// Computes bivariate & multivariate relationships across Earth-system domains:
// 1. Date alignment & missing data harmonization
// 2. Pearson & Spearman rank correlation coefficients
// 3. Significance testing (t-distribution p-value)
// 4. Lagged cross-correlation (-6 to +6 months) to detect environmental leads/lags
// 5. OLS linear regression fit
// 6. Explicit scientific caveats on Correlation vs. Causation
// ==============================================================================

import {
  EarthVariable,
  GeographicRegion,
  TimeSeriesObservation,
  CrossDomainCorrelationResult,
} from '@/types';

/**
 * Computes Pearson correlation coefficient between two numeric arrays.
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return 0;

  return Math.max(-1, Math.min(1, numerator / denom));
}

/**
 * Computes two-tailed p-value for Pearson correlation using t-distribution approximation.
 */
export function calculateCorrelationPValue(r: number, n: number): number {
  if (n <= 2 || Math.abs(r) >= 1) return 0;
  const t = (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
  const df = n - 2;

  // Standard normal approximation for large df or exact t transform
  const z = Math.abs(t);
  // Approximation of complementary error function for two-tailed normal
  const p = Math.exp(-0.5 * z * z) / (z * Math.sqrt(2 * Math.PI));
  return Math.max(0.0001, Math.min(1.0, parseFloat((2 * p).toFixed(4))));
}

/**
 * Computes Spearman rank correlation coefficient.
 */
export function calculateSpearmanCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;

  const rank = (arr: number[]) => {
    const indexed = arr.map((v, i) => ({ v, i }));
    indexed.sort((a, b) => a.v - b.v);
    const ranks = new Array(n);
    for (let r = 0; r < n; r++) {
      ranks[indexed[r].i] = r + 1;
    }
    return ranks;
  };

  const rankX = rank(x);
  const rankY = rank(y);
  return calculatePearsonCorrelation(rankX, rankY);
}

/**
 * Computes lagged cross-correlation across +/- maxLag months.
 * Negative lag: X leads Y; Positive lag: Y leads X.
 */
export function calculateLaggedCorrelation(
  x: number[],
  y: number[],
  maxLag: number = 6
): { lagMonths: number; correlation: number }[] {
  const lags: { lagMonths: number; correlation: number }[] = [];
  const n = x.length;

  for (let k = -maxLag; k <= maxLag; k++) {
    let subsetX: number[] = [];
    let subsetY: number[] = [];

    if (k < 0) {
      // X leads Y by |k| periods: compare X[0 .. n-|k|-1] with Y[|k| .. n-1]
      const absK = Math.abs(k);
      subsetX = x.slice(0, n - absK);
      subsetY = y.slice(absK);
    } else if (k > 0) {
      // Y leads X by k periods: compare X[k .. n-1] with Y[0 .. n-k-1]
      subsetX = x.slice(k);
      subsetY = y.slice(0, n - k);
    } else {
      subsetX = x;
      subsetY = y;
    }

    if (subsetX.length >= 5) {
      const r = calculatePearsonCorrelation(subsetX, subsetY);
      lags.push({
        lagMonths: k,
        correlation: parseFloat(r.toFixed(3)),
      });
    }
  }

  return lags;
}

/**
 * Master Cross-Domain Discovery Pipeline.
 */
export function runCrossDomainAnalysis(
  variableA: EarthVariable,
  seriesA: TimeSeriesObservation[],
  variableB: EarthVariable,
  seriesB: TimeSeriesObservation[],
  region: GeographicRegion
): CrossDomainCorrelationResult {
  // 1. Align observations by matching identical date strings
  const cleanA = seriesA.filter(o => o.qualityFlag !== 'MISSING' && Number.isFinite(o.value));
  const cleanB = seriesB.filter(o => o.qualityFlag !== 'MISSING' && Number.isFinite(o.value));

  const mapB = new Map<string, number>();
  for (const obs of cleanB) {
    // Match by year-month
    const ym = obs.date.slice(0, 7);
    mapB.set(ym, obs.value);
  }

  const alignedPoints: {
    date: string;
    valueA: number;
    valueB: number;
    anomalyA: number;
    anomalyB: number;
  }[] = [];

  for (const obs of cleanA) {
    const ym = obs.date.slice(0, 7);
    if (mapB.has(ym)) {
      alignedPoints.push({
        date: obs.date,
        valueA: obs.value,
        valueB: mapB.get(ym)!,
        anomalyA: 0,
        anomalyB: 0,
      });
    }
  }

  if (alignedPoints.length < 5) {
    throw new Error(
      `Insufficient overlapping temporal coverage between ${variableA.name} and ${variableB.name} (only ${alignedPoints.length} matching timestamps).`
    );
  }

  const valuesA = alignedPoints.map(p => p.valueA);
  const valuesB = alignedPoints.map(p => p.valueB);
  const n = alignedPoints.length;

  // 2. Compute Climatological Means & Standardized Anomalies
  const meanA = valuesA.reduce((a, b) => a + b, 0) / n;
  const meanB = valuesB.reduce((a, b) => a + b, 0) / n;
  const stdA = Math.sqrt(valuesA.reduce((s, v) => s + (v - meanA) ** 2, 0) / n) || 1;
  const stdB = Math.sqrt(valuesB.reduce((s, v) => s + (v - meanB) ** 2, 0) / n) || 1;

  for (const p of alignedPoints) {
    p.anomalyA = parseFloat(((p.valueA - meanA) / stdA).toFixed(3));
    p.anomalyB = parseFloat(((p.valueB - meanB) / stdB).toFixed(3));
  }

  // 3. Correlations & Significance
  const pearsonR = calculatePearsonCorrelation(valuesA, valuesB);
  const spearmanRho = calculateSpearmanCorrelation(valuesA, valuesB);
  const pValue = calculateCorrelationPValue(pearsonR, n);
  const rSquared = parseFloat((pearsonR * pearsonR).toFixed(4));
  const isSig = pValue < 0.05;

  // 4. OLS Linear Fit (Y = slope * X + intercept)
  let sumProd = 0;
  let sumSqA = 0;
  for (let i = 0; i < n; i++) {
    const da = valuesA[i] - meanA;
    const db = valuesB[i] - meanB;
    sumProd += da * db;
    sumSqA += da * da;
  }
  const slope = sumSqA > 0 ? sumProd / sumSqA : 0;
  const intercept = meanB - slope * meanA;

  // 5. Lag Analysis
  const lagAnalysis = calculateLaggedCorrelation(valuesA, valuesB, 6);
  let optimalLagMonths = 0;
  let maxAbsLagCorr = Math.abs(pearsonR);
  let optimalLagCorrelation = pearsonR;

  for (const lag of lagAnalysis) {
    if (Math.abs(lag.correlation) > maxAbsLagCorr) {
      maxAbsLagCorr = Math.abs(lag.correlation);
      optimalLagMonths = lag.lagMonths;
      optimalLagCorrelation = lag.correlation;
    }
  }

  // 6. Scientific Interpretation
  let interpretation = '';
  if (!isSig) {
    interpretation = `No statistically significant linear relationship detected (r = ${pearsonR.toFixed(2)}, p = ${pValue.toFixed(3)}). Variations in ${variableA.name} appear decoupled from ${variableB.name} over this study period.`;
  } else if (pearsonR > 0.5) {
    interpretation = `Strong positive correlation (r = ${pearsonR.toFixed(2)}, p < ${pValue.toFixed(3)}). Increases in ${variableA.name} co-occur with higher ${variableB.name}.`;
  } else if (pearsonR < -0.5) {
    interpretation = `Strong negative correlation (r = ${pearsonR.toFixed(2)}, p < ${pValue.toFixed(3)}). As ${variableA.name} increases, ${variableB.name} experiences systematic declines.`;
  } else {
    interpretation = `Moderate correlation (r = ${pearsonR.toFixed(2)}, p = ${pValue.toFixed(3)}). Explains ${Math.round(rSquared * 100)}% of mutual variance (R² = ${rSquared.toFixed(2)}).`;
  }

  if (optimalLagMonths !== 0) {
    const leader = optimalLagMonths < 0 ? variableA.name : variableB.name;
    const follower = optimalLagMonths < 0 ? variableB.name : variableA.name;
    interpretation += ` Optimal cross-correlation peak occurs at a ${Math.abs(optimalLagMonths)}-month lag (r = ${optimalLagCorrelation.toFixed(2)}), suggesting ${leader} leads ${follower} by ${Math.abs(optimalLagMonths)} month(s).`;
  }

  return {
    variableA,
    variableB,
    region,
    pearsonR: parseFloat(pearsonR.toFixed(3)),
    spearmanRho: parseFloat(spearmanRho.toFixed(3)),
    pValue: parseFloat(pValue.toFixed(4)),
    isStatisticallySignificant: isSig,
    rSquared,
    lagAnalysis,
    optimalLagMonths,
    optimalLagCorrelation: parseFloat(optimalLagCorrelation.toFixed(3)),
    linearFit: {
      slope: parseFloat(slope.toFixed(4)),
      intercept: parseFloat(intercept.toFixed(4)),
    },
    alignedPoints,
    causationWarning:
      'Scientific Epistemology Caveat: Correlation measures statistical co-variation, not physical causation. External confounding drivers (e.g. seasonal solar radiation, El Niño Southern Oscillation, atmospheric circulation regimes) may govern both variables simultaneously.',
    scientificInterpretation: interpretation,
  };
}

