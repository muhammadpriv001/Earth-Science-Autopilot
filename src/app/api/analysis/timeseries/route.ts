// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — TIME-SERIES ACQUISITION API ROUTE
// ==============================================================================
// Returns real measured observations only. Demonstration/benchmark series are
// never substituted for a live measurement.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getLiveDataset,
  LiveDataUnavailableError,
  normaliseVariableId,
} from '@/lib/providers/live-earth-data';
import { getVariableById } from '@/lib/science/earth-variables';
import { GeographicRegion } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const variableId = normaliseVariableId(body.variableId || 'air-temperature');
    const {
      region,
      startDate = '1994-01-01',
      endDate = '2024-12-31',
    } = body;

    const variable = getVariableById(variableId);
    if (!variable) {
      return NextResponse.json({ error: `Unknown variable: ${variableId}` }, { status: 400 });
    }

    const targetRegion: GeographicRegion = region || {
      name: 'Lahore, Punjab, Pakistan',
      geometryType: 'point',
      coordinates: [74.3587, 31.5204],
      center: [74.3587, 31.5204],
    };

    try {
      const dataset = await getLiveDataset({
        variableId,
        region: targetRegion,
        startDate,
        endDate,
      });
      return NextResponse.json({ dataset });
    } catch (providerError: any) {
      if (providerError instanceof LiveDataUnavailableError) {
        return NextResponse.json(
          {
            error: providerError.message,
            code: 'LIVE_DATA_UNAVAILABLE',
            variableId,
          },
          { status: 422 }
        );
      }
      throw providerError;
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve time-series dataset', details: err.message },
      { status: 500 }
    );
  }
}
