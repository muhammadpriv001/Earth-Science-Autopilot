// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — CORE TYPES
// ==============================================================================

export type EarthSystem =
  | 'Vegetation & Biosphere'
  | 'Atmosphere & Climate'
  | 'Precipitation & Meteorology'
  | 'Soil & Land Moisture'
  | 'Hydrology & Freshwater'
  | 'Oceans & Marine Ecosystems'
  | 'Cryosphere'
  | 'Land Surface & Land Use'
  | 'Fire & Environmental Disasters'
  | 'Solid Earth & Geophysical Changes'
  | 'Human Dimensions & Exposure'
  // Backward compatibility aliases
  | 'Atmosphere'
  | 'Land'
  | 'Ocean'
  | 'Hydrology'
  | 'Ecosystems';

export interface EarthVariable {
  id: string;
  name: string;
  system: EarthSystem;
  unit: string;
  description: string;
  simpleExplanation?: string;
  measurementPrinciple: string;
  typicalRange: string;
  temporalResolution: string;
  spatialResolution: string;
  availableDateRange: string;
  limitations: string[];
  recommendedDatasets: string[];
}

export type GeometryType = 'point' | 'bbox' | 'polygon' | 'buffer';

export interface GeographicRegion {
  id?: string;
  name: string;
  geometryType: GeometryType;
  coordinates: number[][] | number[]; // [lng, lat] for point, [minLng, minLat, maxLng, maxLat] for bbox, or polygon ring
  center: [number, number]; // [lng, lat]
  radiusKm?: number; // for circular buffer
  areaKm2?: number;
  bbox?: number[]; // [minLng, minLat, maxLng, maxLat]
}

export interface TimeSeriesObservation {
  date: string; // YYYY-MM-DD
  value: number;
  qualityFlag?: 'VALID' | 'ESTIMATED' | 'MISSING' | 'SUSPECT';
}

export interface TimeSeriesDataset {
  variableId: string;
  variableName: string;
  unit: string;
  region: GeographicRegion;
  provider: string;
  datasetName: string;
  temporalAggregation: 'Daily' | 'Monthly' | 'Annual';
  isDemonstration: boolean;
  provenance: {
    sourceUrl: string;
    retrievalDate: string;
    citation: string;
    transformationSteps: string[];
  };
  observations: TimeSeriesObservation[];
}

export interface StatisticalTrendResult {
  // Linear Regression
  linearSlopePerYear: number;
  linearIntercept: number;
  rSquared: number;
  standardError: number;

  // Mann-Kendall Test
  mannKendallS: number;
  mannKendallVarS: number;
  mannKendallZ: number;
  mannKendallPValue: number;
  isSignificant: boolean;
  significanceThreshold: number; // usually 0.05
  trendDirection: 'INCREASING' | 'DECREASING' | 'NO_TREND';

  // Sen's Slope Estimator
  sensSlopePerYear: number;
  sensSlopeConfidenceInterval?: [number, number];

  // Data Quality & Metrics
  totalObservations: number;
  validObservations: number;
  missingObservations: number;
  meanValue: number;
  minValue: number;
  maxValue: number;
  standardDeviation: number;

  // Methodological caveats
  assumptions: string[];
  limitationsNotice: string;
}

export interface RegionalComparisonResult {
  variable: EarthVariable;
  regionA: {
    region: GeographicRegion;
    timeSeries: TimeSeriesDataset;
    trend: StatisticalTrendResult;
  };
  regionB: {
    region: GeographicRegion;
    timeSeries: TimeSeriesDataset;
    trend: StatisticalTrendResult;
  };
  divergenceSummary: {
    rateDifference: number; // regionA - regionB
    areOppositeDirections: boolean;
    scientificInterpretation: string;
  };
}

export interface ResearchPlan {
  id?: string;
  question: string;
  targetVariable: string;
  earthSystem: EarthSystem;
  targetRegion: GeographicRegion;
  comparisonRegion?: GeographicRegion;
  timeRange: {
    start: string;
    end: string;
  };
  candidateDatasets: {
    name: string;
    provider: string;
    suitabilityReason: string;
    isLiveAvailable: boolean;
  }[];
  temporalResolution: 'Daily' | 'Monthly' | 'Annual';
  requiredTransformations: string[];
  statisticalMethods: string[];
  expectedOutputs: string[];
}

export interface ExternalResource {
  id: string;
  name: string;
  organization: string;
  category: 'NASA Data' | 'Space Agency' | 'Climate & Hydrology' | 'Statistical Methods' | 'Scientific Tutorials';
  accessType: 'API' | 'Web Application' | 'Data Portal' | 'Literature / Paper';
  authRequirement: 'None (Open)' | 'Free Token Required' | 'Earthdata Login' | 'Restricted / Proposal';
  integrationStatus: 'Integrated' | 'Discovery Supported' | 'External Resource' | 'Authentication Required';
  url: string;
  description: string;
  challengeRelevance: string;
}

// ==============================================================================
// PREDICTION & FORECASTING TYPES
// ==============================================================================

export interface ForecastPoint {
  date: string;
  predictedValue: number;
  confidenceLower80: number;
  confidenceUpper80: number;
  confidenceLower95: number;
  confidenceUpper95: number;
}

export interface ModelValidationMetrics {
  mae: number;
  rmse: number;
  mape: number;
  rSquared: number;
  directionalAccuracy: number;
  sampleCount: number;
}

export interface ForecastResult {
  variableId: string;
  variableName: string;
  unit: string;
  region: GeographicRegion;
  modelType: 'Holt-Winters' | 'Seasonal-Naive' | 'AR-Ridge' | 'Multivariable-Ridge';
  horizonMonths: number;
  trainPeriod: { start: string; end: string };
  testPeriod: { start: string; end: string };
  validationMetrics: ModelValidationMetrics;
  baselineMetrics: ModelValidationMetrics;
  historicalObservations: TimeSeriesObservation[];
  hindcastObservations: { date: string; actual: number; predicted: number }[];
  forecastPoints: ForecastPoint[];
  covariatesUsed?: string[];
  scientificAssumptions: string[];
  uncertaintyNotice: string;
}

// ==============================================================================
// VEGETATION INTELLIGENCE TYPES
// ==============================================================================

export interface PhenologyCycle {
  year: number;
  startOfSeason: string; // SOS date (YYYY-MM-DD)
  peakOfSeason: string;  // POS date (YYYY-MM-DD)
  endOfSeason: string;   // EOS date (YYYY-MM-DD)
  lengthOfSeasonDays: number;
  baseLevel: number;
  maximumValue: number;
  seasonalAmplitude: number;
}

export interface FireRecoveryAnalysis {
  fireEventDate: string;
  preFireBaselineNDVI: number;
  postFireMinNDVI: number;
  currentNDVI: number;
  burnSeverityPercentage: number;
  recoveryPercentage: number;
  recoveryTrajectory: { date: string; ndvi: number; expectedRecovery: number }[];
  estimatedFullRecoveryDate: string | null;
  status: 'Critical' | 'Active Recovery' | 'Substantially Recovered';
}

// ==============================================================================
// CROSS-DOMAIN DISCOVERY TYPES
// ==============================================================================

export interface CrossDomainCorrelationResult {
  variableA: EarthVariable;
  variableB: EarthVariable;
  region: GeographicRegion;
  pearsonR: number;
  spearmanRho: number;
  pValue: number;
  isStatisticallySignificant: boolean;
  rSquared: number;
  lagAnalysis: {
    lagMonths: number; // negative = A leads B, positive = B leads A
    correlation: number;
  }[];
  optimalLagMonths: number;
  optimalLagCorrelation: number;
  linearFit: {
    slope: number;
    intercept: number;
  };
  alignedPoints: {
    date: string;
    valueA: number;
    valueB: number;
    anomalyA: number;
    anomalyB: number;
  }[];
  causationWarning: string;
  scientificInterpretation: string;
}

