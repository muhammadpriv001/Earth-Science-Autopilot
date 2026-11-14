// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — CORE TYPES
// ==============================================================================

export type EarthSystem = 'Atmosphere' | 'Land' | 'Ocean' | 'Hydrology' | 'Cryosphere' | 'Ecosystems';

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

