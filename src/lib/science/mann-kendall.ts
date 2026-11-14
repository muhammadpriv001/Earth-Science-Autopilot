// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — MANN-KENDALL NON-PARAMETRIC TREND TEST
// ==============================================================================
// Formulated according to:
// Mann, H. B. (1945). Nonparametric tests against trend. Econometrica.
// Kendall, M. G. (1975). Rank Correlation Methods. Griffin, London.
// Accounts for tied values and calculates two-tailed statistical significance.
// ==============================================================================

export interface MannKendallResult {
  s: number;                        // S-statistic
  varS: number;                     // Variance of S with tie adjustment
  z: number;                        // Standard normal test statistic
  pValue: number;                   // Two-tailed p-value
  tau: number;                      // Kendall's tau rank correlation
  isSignificant: boolean;           // pValue < alpha (default 0.05)
  alpha: number;                    // Significance threshold used (0.05)
  trendDirection: 'INCREASING' | 'DECREASING' | 'NO_TREND';
  n: number;                        // Number of observations
  tiedGroupsCount: number;          // Number of tied groups detected
}

/**
 * Standard Normal Complementary Error Function approximation (Hart's algorithm)
 * Accurate to within 1e-7 across all positive z values.
 */
function erfc(x: number): number {
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

/**
 * Standard Normal Cumulative Distribution Function Phi(z)
 */
function normalCdf(z: number): number {
  return 0.5 * erfc(-z / Math.SQRT2);
}

/**
 * Executes the Mann-Kendall non-parametric trend test.
 * @param values Array of sequential time-series observations
 * @param alpha Significance threshold (default 0.05)
 */
export function mannKendallTest(values: number[], alpha: number = 0.05): MannKendallResult {
  const n = values.length;

  if (n < 4) {
    throw new Error('Mann-Kendall test requires at least 4 observations for meaningful calculation.');
  }

  // 1. Calculate Mann-Kendall S statistic: sum of sgn(x_j - x_k) for j > k
  let s = 0;
  for (let k = 0; k < n - 1; k++) {
    for (let j = k + 1; j < n; j++) {
      const diff = values[j] - values[k];
      if (diff > 0) s += 1;
      else if (diff < 0) s -= 1;
    }
  }

  // 2. Identify tied value groups and adjust variance
  const frequencyMap = new Map<number, number>();
  for (const val of values) {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  }

  let tieAdjustment = 0;
  let tiedGroupsCount = 0;
  for (const count of frequencyMap.values()) {
    if (count > 1) {
      tiedGroupsCount++;
      tieAdjustment += count * (count - 1) * (2 * count + 5);
    }
  }

  // Baseline variance: [n(n-1)(2n+5) - sum(t*(t-1)*(2t+5))] / 18
  const baseVar = n * (n - 1) * (2 * n + 5);
  const varS = (baseVar - tieAdjustment) / 18;

  // 3. Compute standardized test statistic Z with continuity correction
  let z = 0;
  if (varS > 0) {
    if (s > 0) {
      z = (s - 1) / Math.sqrt(varS);
    } else if (s < 0) {
      z = (s + 1) / Math.sqrt(varS);
    } else {
      z = 0;
    }
  }

  // 4. Two-tailed p-value calculation
  const pValue = z === 0 ? 1.0 : 2.0 * (1.0 - normalCdf(Math.abs(z)));

  // 5. Kendall's Tau: S / [n(n-1)/2]
  const maxPossiblePairs = (n * (n - 1)) / 2;
  const tau = maxPossiblePairs > 0 ? s / maxPossiblePairs : 0;

  // 6. Trend interpretation
  const isSignificant = pValue < alpha;
  let trendDirection: 'INCREASING' | 'DECREASING' | 'NO_TREND' = 'NO_TREND';

  if (isSignificant) {
    if (s > 0) trendDirection = 'INCREASING';
    else if (s < 0) trendDirection = 'DECREASING';
  }

  return {
    s,
    varS,
    z,
    pValue,
    tau,
    isSignificant,
    alpha,
    trendDirection,
    n,
    tiedGroupsCount,
  };
}

