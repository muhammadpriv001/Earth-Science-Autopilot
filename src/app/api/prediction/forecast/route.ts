// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — SCIENTIFIC FORECASTING API ROUTE
// ==============================================================================
// Deterministic forecasting with out-of-sample backtesting, naive benchmark,
// and 80% / 95% uncertainty prediction intervals. When observations are not
// supplied, they are fetched from a live measurement archive.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { runScientificForecast } from '@/lib/science/forecasting';
import { getVariableById } from '@/lib/science/earth-variables';
import {
  getLiveDataset,
  LiveDataUnavailableError,
  normaliseVariableId,
} from '@/lib/providers/live-earth-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const variableId = normaliseVariableId(body.variableId || 'air-temperature');
    const {
      region,
      observations,
      horizonMonths = 24,
      modelType = 'Holt-Winters',
    } = body;

    const variable = getVariableById(variableId) || {
      id: variableId,
      name: 'Environmental Parameter',
      unit: 'Standard Unit',
      system: 'Vegetation & Biosphere',
    };

    let activeObs = observations;
    let targetRegion = region;

    if (!activeObs || activeObs.length < 6) {
      try {
        const dataset = await getLiveDataset({
          variableId,
          region,
          startDate: body.startDate || '2000-01-01',
          endDate: body.endDate || new Date().toISOString().slice(0, 10),
        });
        activeObs = dataset.observations;
        targetRegion = dataset.region;
      } catch (providerError: any) {
        if (providerError instanceof LiveDataUnavailableError) {
          return NextResponse.json(
            { error: providerError.message, code: 'LIVE_DATA_UNAVAILABLE' },
            { status: 422 }
          );
        }
        throw providerError;
      }
    }

    const forecastResult = runScientificForecast(
      {
        variableId: variable.id,
        variableName: variable.name,
        unit: variable.unit,
        region: targetRegion || {
          name: 'Study Region',
          geometryType: 'point',
          coordinates: [0, 0],
          center: [0, 0],
        },
        observations: activeObs,
      },
      {
        horizonMonths: Math.min(60, Math.max(6, parseInt(horizonMonths, 10))),
        modelType,
      }
    );

    return NextResponse.json({
      forecast: forecastResult,
      ...forecastResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to compute scientific forecast' },
      { status: 400 }
    );
  }
}
