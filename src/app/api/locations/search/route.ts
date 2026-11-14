// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — LOCATION SEARCH & GEOCODING API
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', q.trim());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Earth-Science-Autopilot/1.0 (spacegeoai.com; NASA-Space-Apps)',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const results = (data || []).map((item: any) => ({
      placeId: item.place_id,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      importance: item.importance,
      boundingBox: item.boundingbox ? [
        parseFloat(item.boundingbox[2]), // minLng
        parseFloat(item.boundingbox[0]), // minLat
        parseFloat(item.boundingbox[3]), // maxLng
        parseFloat(item.boundingbox[1]), // maxLat
      ] : null,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Geocoding error:', err);
    return NextResponse.json({ results: [] });
  }
}

