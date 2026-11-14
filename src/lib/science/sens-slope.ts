// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — SEN'S NON-PARAMETRIC SLOPE ESTIMATOR
// ==============================================================================
// Formulated according to:
// Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall's tau.
// J. Amer. Statist. Assoc., 63(324), 1379-1389.
// Theil, H. (1950). A rank-invariant method of linear and polynomial regression analysis.
// ==============================================================================

export interface SensSlopeResult {
  medianSlope: number;                  // Median of all pairwise slopes
  slopePerYear: number;                 // Annualized slope
  intercept: number;                    // Median intercept based on median slope
  confidenceInterval: [number, number]; // 95% Confidence interval for slope
  slopesCount: number;                  // Total pairs evaluated
}

/**
 * Computes Sen's slope estimator for sequential time-series data.
 * @param time Array of time indices (or decimal years)
 * @param values Array of observations corresponding to each time index
 * @param alpha Significance level for confidence interval (default 0.05 for 95% CI)
 */
export function calculateSensSlope(
  time: number[],
  values: number[],
  alpha: number = 0.05
): SensSlopeResult {
  const n = values.length;

  if (n !== time.length || n < 2) {
    throw new Error("Sen's slope requires at least two paired numeric observations.");
  }

  // 1. Calculate pairwise slopes: Q_ij = (y_j - y_i) / (t_j - t_i) for all j > i
  const slopes: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dt = time[j] - time[i];
      if (dt !== 0) {
        slopes.push((values[j] - values[i]) / dt);
      }
    }
  }

  if (slopes.length === 0) {
    return {
      medianSlope: 0,
      slopePerYear: 0,
      intercept: values[0] || 0,
      confidenceInterval: [0, 0],
      slopesCount: 0,
    };
  }

  // 2. Sort slopes to find median
  slopes.sort((a, b) => a - b);
  const mid = Math.floor(slopes.length / 2);
  const medianSlope =
    slopes.length % 2 !== 0
      ? slopes[mid]
      : (slopes[mid - 1] + slopes[mid]) / 2;

  // 3. Compute 95% confidence interval using Mann-Kendall variance
  const baseVar = (n * (n - 1) * (2 * n + 5)) / 18;
  const zScore = alpha === 0.05 ? 1.96 : 2.576;
  const cAlpha = zScore * Math.sqrt(baseVar);

  const nPairs = slopes.length;
  const m1 = Math.max(0, Math.floor((nPairs - cAlpha) / 2));
  const m2 = Math.min(nPairs - 1, Math.floor((nPairs + cAlpha) / 2));

  const lowerCi = slopes[m1];
  const upperCi = slopes[m2];

  // 4. Compute median intercept: median(y_i - medianSlope * t_i)
  const intercepts = values.map((y, i) => y - medianSlope * time[i]).sort((a, b) => a - b);
  const midInt = Math.floor(intercepts.length / 2);
  const intercept =
    intercepts.length % 2 !== 0
      ? intercepts[midInt]
      : (intercepts[midInt - 1] + intercepts[midInt]) / 2;

  return {
    medianSlope,
    slopePerYear: medianSlope,
    intercept,
    confidenceInterval: [lowerCi, upperCi],
    slopesCount: slopes.length,
  };
}

