// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — NASA CMR COLLECTIONS API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { searchCmrCollections } from '@/lib/providers/nasa-cmr';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword') || undefined;
  const platform = searchParams.get('platform') || undefined;
  const instrument = searchParams.get('instrument') || undefined;
  const bboxStr = searchParams.get('bbox');
  const temporalStr = searchParams.get('temporal');
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const pageNum = parseInt(searchParams.get('pageNum') || '1', 10);

  let bbox: [number, number, number, number] | undefined = undefined;
  if (bboxStr) {
    const parts = bboxStr.split(',').map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      bbox = parts as [number, number, number, number];
    }
  }

  let temporal: [string, string] | undefined = undefined;
  if (temporalStr) {
    const parts = temporalStr.split(',');
    if (parts.length === 2) {
      temporal = [parts[0], parts[1]];
    }
  }

  try {
    const result = await searchCmrCollections({
      keyword,
      platform,
      instrument,
      bbox,
      temporal,
      pageSize,
      pageNum,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to query NASA CMR collections', details: err.message },
      { status: 500 }
    );
  }
}

