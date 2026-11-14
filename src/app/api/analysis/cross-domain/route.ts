// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — CROSS-DOMAIN DISCOVERY API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { runCrossDomainAnalysis } from '@/lib/science/cross-domain';
import { getVariableById } from '@/lib/science/earth-variables';
import {
  SAHEL_VEGETATION_BENCHMARK,
  SAHEL_PRECIPITATION_BENCHMARK,
} from '@/lib/providers/mock-datasets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      variableIdA = 'precipitation',
      variableIdB = 'ndvi',
      region,
      seriesA,
      seriesB,
    } = body;

    const varA = getVariableById(variableIdA) || {
      id: variableIdA,
      name: 'Driver Variable',
      system: 'Precipitation & Meteorology',
      unit: 'mm/month',
      description: 'Atmospheric Driver',
      measurementPrinciple: 'Satellite Radar/Radiometer',
      typicalRange: '0 - 500',
      temporalResolution: 'Monthly',
      spatialResolution: '10km',
      availableDateRange: '2000-Present',
      limitations: [],
      recommendedDatasets: [],
    };

    const varB = getVariableById(variableIdB) || {
      id: variableIdB,
      name: 'Response Variable',
      system: 'Vegetation & Biosphere',
      unit: 'Index (-1 to +1)',
      description: 'Biosphere Response',
      measurementPrinciple: 'Optical Reflectance',
      typicalRange: '0 - 1',
      temporalResolution: 'Monthly',
      spatialResolution: '250m',
      availableDateRange: '2000-Present',
      limitations: [],
      recommendedDatasets: [],
    };

    const targetRegion = region || SAHEL_VEGETATION_BENCHMARK.region;

    // Use passed series or default to aligned Sahel Precipitation vs NDVI benchmarks
    const activeSeriesA = seriesA || SAHEL_PRECIPITATION_BENCHMARK.observations;
    const activeSeriesB = seriesB || SAHEL_VEGETATION_BENCHMARK.observations;

    const result = runCrossDomainAnalysis(varA, activeSeriesA, varB, activeSeriesB, targetRegion);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Cross-domain analysis failed' },
      { status: 400 }
    );
  }
}

