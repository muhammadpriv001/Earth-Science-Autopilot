// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — REGIONAL COMPARISON ENGINE API ROUTE
// ==============================================================================
// Both regions are retrieved from live measurement archives. No demonstration
// series are substituted when a live source is unavailable.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTimeSeries } from '@/lib/science/time-series-pipeline';
import { TimeSeriesDataset, RegionalComparisonResult, GeographicRegion } from '@/types';
import { getVariableById } from '@/lib/science/earth-variables';
import {
  getLiveDataset,
  LiveDataUnavailableError,
  normaliseVariableId,
} from '@/lib/providers/live-earth-data';

const DEFAULT_REGION_A: GeographicRegion = {
  name: 'Lahore, Punjab, Pakistan',
  geometryType: 'point',
  coordinates: [74.3587, 31.5204],
  center: [74.3587, 31.5204],
};

const DEFAULT_REGION_B: GeographicRegion = {
  name: 'Southern Amazon Basin, Brazil',
  geometryType: 'point',
  coordinates: [-57.5, -10.0],
  center: [-57.5, -10.0],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const variableId = normaliseVariableId(body.variableId || 'air-temperature');
    const {
      regionA = DEFAULT_REGION_A,
      regionB = DEFAULT_REGION_B,
      startDate = '1994-01-01',
      endDate = '2024-12-31',
    } = body;

    try {
      const datasetA: TimeSeriesDataset =
        body.datasetA ||
        (await getLiveDataset({ variableId, region: regionA, startDate, endDate }));
      const datasetB: TimeSeriesDataset =
        body.datasetB ||
        (await getLiveDataset({ variableId, region: regionB, startDate, endDate }));

      if (!datasetA?.observations?.length || !datasetB?.observations?.length) {
        return NextResponse.json(
          { error: 'Valid time-series observations are required for both regions.' },
          { status: 400 }
        );
      }

      const variable = getVariableById(datasetA.variableId) || {
        id: datasetA.variableId,
        name: datasetA.variableName,
        system: 'Atmosphere',
        unit: datasetA.unit,
        description: '',
        measurementPrinciple: '',
        typicalRange: '',
        temporalResolution: '',
        spatialResolution: '',
        availableDateRange: '',
        limitations: [],
        recommendedDatasets: [],
      };

      const trendA = analyzeTimeSeries(datasetA.observations);
      const trendB = analyzeTimeSeries(datasetB.observations);

      const rateDiff = Number((trendA.sensSlopePerYear - trendB.sensSlopePerYear).toFixed(4));
      const areOpposite =
        (trendA.trendDirection === 'INCREASING' && trendB.trendDirection === 'DECREASING') ||
        (trendA.trendDirection === 'DECREASING' && trendB.trendDirection === 'INCREASING');

      let interpretation = `Comparison between ${datasetA.region.name} and ${datasetB.region.name} demonstrates `;

      if (areOpposite) {
        interpretation += `a striking spatial divergence in ${variable.name}: `;
        interpretation += `${datasetA.region.name} exhibits an ${trendA.trendDirection.toLowerCase()} trend (${trendA.sensSlopePerYear > 0 ? '+' : ''}${trendA.sensSlopePerYear} ${variable.unit}/year, p=${trendA.mannKendallPValue}), `;
        interpretation += `whereas ${datasetB.region.name} displays an opposite ${trendB.trendDirection.toLowerCase()} trend (${trendB.sensSlopePerYear > 0 ? '+' : ''}${trendB.sensSlopePerYear} ${variable.unit}/year, p=${trendB.mannKendallPValue}). `;
        interpretation += `This illustrates how broad global climate changes can manifest with contrasting regional signatures.`;
      } else {
        interpretation += `both regions sharing a ${trendA.trendDirection.toLowerCase()} tendency, with ${datasetA.region.name} changing at ${trendA.sensSlopePerYear} ${variable.unit}/year `;
        interpretation += `versus ${trendB.sensSlopePerYear} ${variable.unit}/year in ${datasetB.region.name} (rate differential of ${rateDiff > 0 ? '+' : ''}${rateDiff} ${variable.unit}/year).`;
      }

      const comparisonResult: RegionalComparisonResult = {
        variable,
        regionA: {
          region: datasetA.region,
          timeSeries: datasetA,
          trend: trendA,
        },
        regionB: {
          region: datasetB.region,
          timeSeries: datasetB,
          trend: trendB,
        },
        divergenceSummary: {
          rateDifference: rateDiff,
          areOppositeDirections: areOpposite,
          scientificInterpretation: interpretation,
        },
      };

      return NextResponse.json({ comparison: comparisonResult });
    } catch (providerError: any) {
      if (providerError instanceof LiveDataUnavailableError) {
        return NextResponse.json(
          { error: providerError.message, code: 'LIVE_DATA_UNAVAILABLE' },
          { status: 422 }
        );
      }
      throw providerError;
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process regional comparison', details: err.message },
      { status: 500 }
    );
  }
}
