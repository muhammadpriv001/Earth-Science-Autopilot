// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — NOAA STATIONS API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { searchNoaaStations } from '@/lib/providers/noaa-cdo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bboxStr = searchParams.get('bbox') || '-105.0,39.0,-104.0,40.0';

  const parts = bboxStr.split(',').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return NextResponse.json(
      { error: 'Invalid bbox query. Expected format: minLng,minLat,maxLng,maxLat' },
      { status: 400 }
    );
  }

  const bbox = parts as [number, number, number, number];
  const stations = await searchNoaaStations(bbox);

  return NextResponse.json({
    bbox,
    count: stations.length,
    stations,
  });
}

