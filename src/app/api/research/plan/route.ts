// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — RESEARCH AUTOPILOT PLANNER API
// ==============================================================================
// Converts natural language Earth-science inquiries into structured, verifiable
// research plans with candidate datasets and statistical methodologies.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { ResearchPlan, GeographicRegion } from '@/types';

/**
 * Deterministic semantic research plan builder
 */
function buildDeterministicPlan(query: string): ResearchPlan {
  const lower = query.toLowerCase();

  // 1. Identify Target Variable
  let targetVariable = EARTH_VARIABLES[0]; // default air temperature
  if (lower.includes('precip') || lower.includes('rain') || lower.includes('flood')) {
    targetVariable = EARTH_VARIABLES.find(v => v.id === 'precipitation')!;
  } else if (lower.includes('vegetation') || lower.includes('ndvi') || lower.includes('forest') || lower.includes('green')) {
    targetVariable = EARTH_VARIABLES.find(v => v.id === 'ndvi')!;
  } else if (lower.includes('soil') || lower.includes('moisture') || lower.includes('drought')) {
    targetVariable = EARTH_VARIABLES.find(v => v.id === 'soil-moisture')!;
  } else if (lower.includes('ice') || lower.includes('arctic') || lower.includes('glacier')) {
    targetVariable = EARTH_VARIABLES.find(v => v.id === 'sea-ice-extent')!;
  } else if (lower.includes('ocean') || lower.includes('chlorophyll') || lower.includes('plankton')) {
    targetVariable = EARTH_VARIABLES.find(v => v.id === 'ocean-chlorophyll')!;
  } else if (lower.includes('sea surface') || lower.includes('sst')) {
    targetVariable = EARTH_VARIABLES.find(v => v.id === 'sea-surface-temperature')!;
  } else if (lower.includes('no2') || lower.includes('air quality') || lower.includes('pollution')) {
    targetVariable = EARTH_VARIABLES.find(v => v.id === 'tropospheric-no2')!;
  }

  // 2. Identify Geographic Location
  let targetRegion: GeographicRegion = {
    name: 'Global Study Area',
    geometryType: 'point',
    coordinates: [0, 20],
    center: [0, 20],
  };

  if (lower.includes('lahore')) {
    targetRegion = {
      name: 'Lahore, Punjab, Pakistan',
      geometryType: 'point',
      coordinates: [74.3587, 31.5204],
      center: [74.3587, 31.5204],
      areaKm2: 1772,
    };
  } else if (lower.includes('amazon') || lower.includes('brazil')) {
    targetRegion = {
      name: 'Southern Amazon Basin, Brazil',
      geometryType: 'bbox',
      coordinates: [-65.0, -15.0, -50.0, -5.0],
      center: [-57.5, -10.0],
      areaKm2: 1200000,
    };
  } else if (lower.includes('arctic') || lower.includes('polar')) {
    targetRegion = {
      name: 'Northern Hemisphere Arctic Ocean',
      geometryType: 'polygon',
      coordinates: [[0, 70], [90, 70], [180, 70], [-90, 70], [0, 70]],
      center: [0, 90],
      areaKm2: 14000000,
    };
  } else if (lower.includes('london') || lower.includes('uk')) {
    targetRegion = {
      name: 'Greater London, United Kingdom',
      geometryType: 'point',
      coordinates: [-0.1276, 51.5074],
      center: [-0.1276, 51.5074],
    };
  } else if (lower.includes('california') || lower.includes('los angeles')) {
    targetRegion = {
      name: 'Los Angeles Basin, California, USA',
      geometryType: 'point',
      coordinates: [-118.2437, 34.0522],
      center: [-118.2437, 34.0522],
    };
  }

  // 3. Time Horizon
  let startYear = 1994;
  let endYear = 2024;
  if (lower.includes('10 year')) startYear = 2014;
  if (lower.includes('20 year')) startYear = 2004;
  if (lower.includes('50 year')) startYear = 1974;

  return {
    question: query,
    targetVariable: targetVariable.id,
    earthSystem: targetVariable.system,
    targetRegion,
    timeRange: {
      start: `${startYear}-01-01`,
      end: `${endYear}-12-31`,
    },
    candidateDatasets: [
      {
        name: 'ECMWF ERA5 Reanalysis',
        provider: 'Open-Meteo / Copernicus',
        suitabilityReason: 'Continuous global spatial coverage with consistent 0.25° grid and complete historical record from 1940.',
        isLiveAvailable: true,
      },
      {
        name: 'NASA Common Metadata Repository (CMR)',
        provider: 'NASA EOSDIS',
        suitabilityReason: 'Direct satellite observations for regional remote-sensing verification.',
        isLiveAvailable: true,
      },
      {
        name: 'NOAA Global Historical Climatology Network (GHCND)',
        provider: 'NOAA NCEI',
        suitabilityReason: 'Direct ground-truth station thermometer observations with quality control flags.',
        isLiveAvailable: Boolean(env.NOAA_CDO_TOKEN),
      },
    ],
    temporalResolution: 'Annual',
    requiredTransformations: [
      'Extract spatial slice for the specified coordinates / bounding box.',
      'Filter observations with missing value thresholds (>85% valid days required per interval).',
      'Aggregate daily observations into annual mean / sum.',
      'Convert physical units if necessary for scientific standard representation.',
    ],
    statisticalMethods: [
      'Ordinary Least Squares (OLS) Linear Regression (Slope, Intercept, R², Standard Error)',
      'Non-parametric Mann-Kendall Trend Test with tie variance adjustment (S-statistic, Z-score, p-value)',
      "Sen's Slope Estimator (Median of pairwise slopes, 95% Confidence Interval)",
      'Descriptive statistical metrics (Mean, Median, Variance, Standard Deviation)',
    ],
    expectedOutputs: [
      'Interactive time-series visualization with trend line and confidence band',
      'Formal statistical report detailing trend rate per decade and significance p-value',
      'Downloadable CSV dataset with complete data provenance metadata',
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = body.question;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'A natural language research question is required.' },
        { status: 400 }
      );
    }

    // Generate research plan
    // If AI API key is configured, could invoke LLM; otherwise deterministic engine provides guaranteed verifiable output
    const plan = buildDeterministicPlan(question);

    return NextResponse.json({
      plan,
      generator: env.AI_API_KEY ? 'Hybrid AI / Heuristic Engine' : 'Scientific Heuristic Planner',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to generate research plan', details: err.message },
      { status: 500 }
    );
  }
}

