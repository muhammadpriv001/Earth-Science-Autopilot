// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — LIVE BENCHMARK STUDIES API ROUTE
// ==============================================================================
// Computes the NASA challenge case studies directly from live measurements
// (NASA POWER and NSIDC). Values are never hard-coded.
// ==============================================================================

import { NextResponse } from 'next/server';
import { getLiveDataset } from '@/lib/providers/live-earth-data';
import { analyzeTimeSeries } from '@/lib/science/time-series-pipeline';

export const revalidate = 86400;

interface BenchmarkStudy {
  id: string;
  title: string;
  variable: string;
  region: string;
  provider: string;
  period: string;
  unit: string;
  trendPerYear: number | null;
  pValue: number | null;
  significant: boolean;
  direction: 'INCREASING' | 'DECREASING' | 'NO_TREND';
  error?: string;
}

async function buildStudy(config: {
  id: string;
  title: string;
  variableId: string;
  region: string;
  coordinates: [number, number];
  startDate: string;
  endDate: string;
}): Promise<BenchmarkStudy> {
  try {
    const dataset = await getLiveDataset({
      variableId: config.variableId,
      region: {
        name: config.region,
        geometryType: 'point',
        coordinates: config.coordinates,
        center: config.coordinates,
      },
      startDate: config.startDate,
      endDate: config.endDate,
    });

    const trend = analyzeTimeSeries(dataset.observations);
    const years = dataset.observations
      .filter(o => o.qualityFlag === 'VALID')
      .map(o => Number(o.date.slice(0, 4)));

    return {
      id: config.id,
      title: config.title,
      variable: dataset.variableName,
      region: config.region,
      provider: dataset.provider,
      period:
        years.length > 0
          ? `${Math.min(...years)}–${Math.max(...years)}`
          : `${config.startDate.slice(0, 4)}–${config.endDate.slice(0, 4)}`,
      unit: dataset.unit,
      trendPerYear: trend.sensSlopePerYear,
      pValue: trend.mannKendallPValue,
      significant: trend.isSignificant,
      direction: trend.trendDirection,
    };
  } catch (err: any) {
    return {
      id: config.id,
      title: config.title,
      variable: config.variableId,
      region: config.region,
      provider: 'Live source unavailable',
      period: `${config.startDate.slice(0, 4)}–${config.endDate.slice(0, 4)}`,
      unit: '',
      trendPerYear: null,
      pValue: null,
      significant: false,
      direction: 'NO_TREND',
      error: err?.message || 'Live measurements could not be retrieved.',
    };
  }
}

export async function GET() {
  const studies = await Promise.all([
    buildStudy({
      id: 'lahore',
      title: 'Lahore 30-Year Temperature Warming',
      variableId: 'air-temperature',
      region: 'Lahore, Punjab, Pakistan',
      coordinates: [74.3587, 31.5204],
      startDate: '1994-01-01',
      endDate: '2024-12-31',
    }),
    buildStudy({
      id: 'amazon',
      title: 'Southern Amazon Basin Precipitation Trend',
      variableId: 'precipitation',
      region: 'Southern Amazon Basin, Brazil',
      coordinates: [-57.5, -10.0],
      startDate: '2000-01-01',
      endDate: '2024-12-31',
    }),
    buildStudy({
      id: 'arctic',
      title: 'Arctic September Sea Ice Minimum',
      variableId: 'sea-ice-extent',
      region: 'Northern Hemisphere Arctic Ocean',
      coordinates: [0.0, 85.0],
      startDate: '1980-01-01',
      endDate: '2024-12-31',
    }),
  ]);

  return NextResponse.json({ studies, computedAt: new Date().toISOString() });
}
