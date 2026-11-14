// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — REGIONAL COMPARISON ENGINE API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTimeSeries } from '@/lib/science/time-series-pipeline';
import { TimeSeriesDataset, RegionalComparisonResult } from '@/types';
import { getVariableById } from '@/lib/science/earth-variables';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const datasetA: TimeSeriesDataset = body.datasetA;
    const datasetB: TimeSeriesDataset = body.datasetB;

    if (!datasetA || !datasetB) {
      return NextResponse.json(
        { error: 'Both datasetA and datasetB are required for regional comparison.' },
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
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process regional comparison', details: err.message },
      { status: 500 }
    );
  }
}

