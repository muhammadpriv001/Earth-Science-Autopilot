// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — CROSS-DOMAIN DISCOVERY API ROUTE
// ==============================================================================
// Bivariate coupling is computed from live measurements for both variables.
// No demonstration series are injected when a live source is unavailable.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { runCrossDomainAnalysis } from '@/lib/science/cross-domain';
import { getVariableById } from '@/lib/science/earth-variables';
import {
  getLiveDataset,
  LiveDataUnavailableError,
  normaliseVariableId,
} from '@/lib/providers/live-earth-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const variableIdA = normaliseVariableId(body.variableIdA || body.driverVariableId || 'precipitation');
    const variableIdB = normaliseVariableId(body.variableIdB || body.responseVariableId || 'soil-moisture');
    const {
      region,
      seriesA,
      seriesB,
      startDate = '2000-01-01',
      endDate = new Date().toISOString().slice(0, 10),
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

    const targetRegion = region || {
      name: 'Lahore, Punjab, Pakistan',
      geometryType: 'point',
      coordinates: [74.3587, 31.5204],
      center: [74.3587, 31.5204],
    };

    let activeSeriesA = seriesA;
    let activeSeriesB = seriesB;

    try {
      if (!activeSeriesA) {
        const datasetA = await getLiveDataset({
          variableId: variableIdA,
          region: targetRegion,
          startDate,
          endDate,
        });
        activeSeriesA = datasetA.observations;
      }
      if (!activeSeriesB) {
        const datasetB = await getLiveDataset({
          variableId: variableIdB,
          region: targetRegion,
          startDate,
          endDate,
        });
        activeSeriesB = datasetB.observations;
      }
    } catch (providerError: any) {
      if (providerError instanceof LiveDataUnavailableError) {
        return NextResponse.json(
          { error: providerError.message, code: 'LIVE_DATA_UNAVAILABLE' },
          { status: 422 }
        );
      }
      throw providerError;
    }

    const result = runCrossDomainAnalysis(varA, activeSeriesA, varB, activeSeriesB, targetRegion);

    return NextResponse.json({
      correlation: result,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Cross-domain analysis failed' },
      { status: 400 }
    );
  }
}
