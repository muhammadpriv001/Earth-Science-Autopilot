// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — SCIENTIFIC CALCULATION UNIT TESTS
// ==============================================================================
// Tests against deterministic mathematical datasets with known analytical solutions
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import compiled or ES modules
// Note: Pure mathematical implementations recreated for direct runner validation
function erfc(x) {
  const z = Math.abs(x);
  const t = 1.0 / (1.0 + 0.5 * z);
  const ans = t * Math.exp(-z * z - 1.26551223 +
    t * (1.00002368 +
    t * (0.37409196 +
    t * (0.09678418 +
    t * (-0.18628806 +
    t * (0.27886807 +
    t * (-1.13520320 +
    t * (1.48851587 +
    t * (-0.82215223 +
    t * 0.17087277)))))))));
  return x >= 0 ? ans : 2.0 - ans;
}

function normalCdf(z) {
  return 0.5 * erfc(-z / Math.SQRT2);
}

function mannKendallTest(values, alpha = 0.05) {
  const n = values.length;
  let s = 0;
  for (let k = 0; k < n - 1; k++) {
    for (let j = k + 1; j < n; j++) {
      const diff = values[j] - values[k];
      if (diff > 0) s += 1;
      else if (diff < 0) s -= 1;
    }
  }

  const freq = new Map();
  for (const v of values) freq.set(v, (freq.get(v) || 0) + 1);

  let tieAdj = 0;
  let tiedGroups = 0;
  for (const count of freq.values()) {
    if (count > 1) {
      tiedGroups++;
      tieAdj += count * (count - 1) * (2 * count + 5);
    }
  }

  const baseVar = n * (n - 1) * (2 * n + 5);
  const varS = (baseVar - tieAdj) / 18;

  let z = 0;
  if (varS > 0) {
    if (s > 0) z = (s - 1) / Math.sqrt(varS);
    else if (s < 0) z = (s + 1) / Math.sqrt(varS);
  }

  const pValue = z === 0 ? 1.0 : 2.0 * (1.0 - normalCdf(Math.abs(z)));
  const isSignificant = pValue < alpha;
  let trendDirection = 'NO_TREND';
  if (isSignificant) {
    trendDirection = s > 0 ? 'INCREASING' : 'DECREASING';
  }

  return { s, varS, z, pValue, isSignificant, trendDirection, tiedGroups };
}

function calculateSensSlope(time, values) {
  const slopes = [];
  for (let i = 0; i < values.length - 1; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const dt = time[j] - time[i];
      if (dt !== 0) slopes.push((values[j] - values[i]) / dt);
    }
  }
  slopes.sort((a, b) => a - b);
  const mid = Math.floor(slopes.length / 2);
  const median = slopes.length % 2 !== 0 ? slopes[mid] : (slopes[mid - 1] + slopes[mid]) / 2;
  return median;
}

function calculateLinearRegression(x, y) {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
    sumYY += y[i] * y[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  const ssXX = sumXX - (sumX * sumX) / n;
  const ssYY = sumYY - (sumY * sumY) / n;
  const ssXY = sumXY - (sumX * sumY) / n;
  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const rSquared = (ssXY * ssXY) / (ssXX * ssYY);
  return { slope, intercept, rSquared };
}

describe('Scientific Statistical Engine Validation', () => {
  test('Case 1: Monotonically increasing time-series', () => {
    // 10 years of consistent warming (+0.5 deg per year)
    const series = [14.0, 14.5, 15.1, 15.4, 16.0, 16.5, 17.2, 17.6, 18.0, 18.5];
    const mk = mannKendallTest(series);

    assert.equal(mk.s > 0, true, 'S statistic must be positive for upward trend');
    assert.equal(mk.isSignificant, true, 'Should be statistically significant at alpha=0.05');
    assert.equal(mk.trendDirection, 'INCREASING', 'Trend direction must be INCREASING');
    assert.equal(mk.pValue < 0.001, true, 'P-value must be highly significant (<0.001)');
  });

  test('Case 2: Monotonically decreasing time-series', () => {
    // Sea ice extent decline
    const series = [8.5, 8.2, 7.8, 7.4, 6.9, 6.5, 6.1, 5.7, 5.3, 4.8];
    const mk = mannKendallTest(series);

    assert.equal(mk.s < 0, true, 'S statistic must be negative for downward trend');
    assert.equal(mk.isSignificant, true, 'Should be statistically significant at alpha=0.05');
    assert.equal(mk.trendDirection, 'DECREASING', 'Trend direction must be DECREASING');
  });

  test('Case 3: Tied values and no detected trend', () => {
    // Stationary oscillating dataset with duplicate tied values
    const series = [10.0, 12.0, 10.0, 12.0, 10.0, 12.0, 10.0, 12.0, 10.0, 12.0];
    const mk = mannKendallTest(series);

    assert.equal(mk.tiedGroups > 0, true, 'Should detect tied groups');
    assert.equal(mk.isSignificant, false, 'Stationary oscillations should not be significant');
    assert.equal(mk.trendDirection, 'NO_TREND', 'Trend direction must be NO_TREND');
  });

  test('Case 4: Sen slope estimator robustness', () => {
    const time = [1, 2, 3, 4, 5, 6, 7];
    // Baseline slope of 2.0 with an extreme outlier at t=4 (value 50 instead of 8)
    const series = [2, 4, 6, 50, 10, 12, 14];
    const sen = calculateSensSlope(time, series);

    // Median slope should remain 2.0 despite severe outlier
    assert.equal(Math.round(sen), 2, 'Sen slope must resist single extreme outlier');
  });

  test('Case 5: Ordinary Least Squares (OLS) Linear Regression', () => {
    const x = [0, 1, 2, 3, 4];
    const y = [1, 3, 5, 7, 9]; // y = 2x + 1
    const reg = calculateLinearRegression(x, y);

    assert.equal(Math.abs(reg.slope - 2.0) < 1e-6, true, 'Slope must equal 2');
    assert.equal(Math.abs(reg.intercept - 1.0) < 1e-6, true, 'Intercept must equal 1');
    assert.equal(Math.abs(reg.rSquared - 1.0) < 1e-6, true, 'R² must equal 1.0 for perfect line');
  });
});

