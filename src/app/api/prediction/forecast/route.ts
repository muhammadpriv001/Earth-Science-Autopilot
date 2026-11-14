// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — SCIENTIFIC FORECASTING API ROUTE
// ==============================================================================
// Deterministic forecasting with out-of-sample backtesting, naive benchmark,
// and 80% / 95% uncertainty prediction intervals.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { runScientificForecast } from '@/lib/science/forecasting';
import { SAHEL_VEGETATION_BENCHMARK, LAHORE_TEMPERATURE_BENCHMARK } from '@/lib/providers/mock-datasets';
import { getVariableById } from '@/lib/science/earth-variables';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      variableId = 'ndvi',
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

    // Use passed observations, or fallback to appropriate high-fidelity benchmark
    let activeObs = observations;
    let targetRegion = region;

    if (!activeObs || activeObs.length < 24) {
      if (variableId === 'ndvi' || variableId === 'evi') {
        activeObs = SAHEL_VEGETATION_BENCHMARK.observations;
        targetRegion = targetRegion || SAHEL_VEGETATION_BENCHMARK.region;
      } else {
        activeObs = LAHORE_TEMPERATURE_BENCHMARK.observations;
        targetRegion = targetRegion || LAHORE_TEMPERATURE_BENCHMARK.region;
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

    return NextResponse.json(forecastResult);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to compute scientific forecast' },
      { status: 400 }
    );
  }
}

