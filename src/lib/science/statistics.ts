// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — SCIENTIFIC STATISTICS ENGINE
// ==============================================================================
// Deterministic implementation of descriptive stats and OLS linear regression
// ==============================================================================

export interface DescriptiveStats {
  count: number;
  validCount: number;
  missingCount: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  variance: number;
  stdDev: number;
}

export interface LinearRegressionResult {
  slope: number;           // change per index unit
  slopePerYear: number;    // annualized slope
  intercept: number;
  rSquared: number;
  standardError: number;
  predict: (x: number) => number;
  confidenceIntervalSlope: [number, number]; // 95% CI [lower, upper]
}

/**
 * Calculates descriptive statistical metrics for a numeric array, ignoring NaN/null values.
 */
export function calculateDescriptiveStats(values: (number | null | undefined)[]): DescriptiveStats {
  const validValues = values.filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const missingCount = values.length - validValues.length;

  if (validValues.length === 0) {
    return {
      count: values.length,
      validCount: 0,
      missingCount,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      variance: 0,
      stdDev: 0,
    };
  }

  const sum = validValues.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / validValues.length;

  const sorted = [...validValues].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const sumSqDiff = validValues.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
  const variance = validValues.length > 1 ? sumSqDiff / (validValues.length - 1) : 0;
  const stdDev = Math.sqrt(variance);

  return {
    count: values.length,
    validCount: validValues.length,
    missingCount,
    mean,
    median,
    min,
    max,
    variance,
    stdDev,
  };
}

/**
 * Computes Ordinary Least Squares (OLS) Linear Regression: y = slope * x + intercept
 * @param x Array of independent variables (e.g. time in years or decimal years)
 * @param y Array of dependent observations (e.g. temperature in °C)
 */
export function calculateLinearRegression(x: number[], y: number[]): LinearRegressionResult {
  if (x.length !== y.length || x.length < 2) {
    throw new Error('Linear regression requires at least two paired numeric observations.');
  }

  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

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

  if (ssXX === 0) {
    return {
      slope: 0,
      slopePerYear: 0,
      intercept: meanY,
      rSquared: 0,
      standardError: 0,
      predict: () => meanY,
      confidenceIntervalSlope: [0, 0],
    };
  }

  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;

  // Residual sum of squares & R-squared
  let ssResidual = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * x[i] + intercept;
    ssResidual += Math.pow(y[i] - yPred, 2);
  }

  const rSquared = ssYY > 0 ? Math.max(0, 1 - ssResidual / ssYY) : 0;
  const degreesOfFreedom = n - 2;
  const residualVariance = degreesOfFreedom > 0 ? ssResidual / degreesOfFreedom : 0;
  const standardError = Math.sqrt(residualVariance / ssXX);

  // Critical t-value for 95% two-tailed confidence interval (approx 1.96 for n > 30)
  const tCritical = n > 30 ? 1.96 : (n > 10 ? 2.228 : 2.571);
  const marginOfError = tCritical * standardError;
  const confidenceIntervalSlope: [number, number] = [slope - marginOfError, slope + marginOfError];

  return {
    slope,
    slopePerYear: slope,
    intercept,
    rSquared,
    standardError,
    predict: (xVal: number) => slope * xVal + intercept,
    confidenceIntervalSlope,
  };
}

