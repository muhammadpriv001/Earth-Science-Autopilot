// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — NOAA DATA API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { fetchNoaaData } from '@/lib/providers/noaa-cdo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stationId = searchParams.get('stationId');
  const datatype = (searchParams.get('datatype') || 'TMAX') as 'TAVG' | 'TMAX' | 'TMIN' | 'PRCP';
  const startDate = searchParams.get('startDate') || '2023-01-01';
  const endDate = searchParams.get('endDate') || '2023-12-31';

  if (!stationId) {
    return NextResponse.json(
      { error: 'stationId parameter is required' },
      { status: 400 }
    );
  }

  const observations = await fetchNoaaData(stationId, datatype, startDate, endDate);

  return NextResponse.json({
    stationId,
    datatype,
    startDate,
    endDate,
    count: observations.length,
    observations,
  });
}

