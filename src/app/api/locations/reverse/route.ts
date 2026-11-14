// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — REVERSE GEOCODING API
// ==============================================================================
// Uses OpenStreetMap Nominatim to resolve coordinates to real human places.
// 100% Free, no API key required.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon') || searchParams.get('lng');

  if (!latStr || !lonStr) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('zoom', '14');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Earth-Science-Autopilot/1.0 (spacegeoai.com; NASA-Space-Apps)',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      // Fallback to formatted coordinates string if Nominatim rate-limits or is offline
      const fallbackName = `Location (${lat >= 0 ? `${lat.toFixed(3)}°N` : `${Math.abs(lat).toFixed(3)}°S`}, ${lon >= 0 ? `${lon.toFixed(3)}°E` : `${Math.abs(lon).toFixed(3)}°W`})`;
      return NextResponse.json({
        displayName: fallbackName,
        lat,
        lon,
      });
    }

    const data = await res.json();
    
    // Construct a concise, clean place name (e.g. City, State, Country or Ocean)
    let displayName = data.display_name;
    const addr = data.address;
    if (addr) {
      const parts = [
        addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.suburb,
        addr.state || addr.province || addr.region,
        addr.country,
      ].filter(Boolean);
      
      if (parts.length > 0) {
        displayName = parts.join(', ');
      }
    }

    if (!displayName) {
      displayName = `Coordinates (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;
    }

    return NextResponse.json({
      displayName,
      fullAddress: data.display_name,
      lat,
      lon,
      address: data.address,
    });
  } catch (err: any) {
    const fallbackName = `Location (${lat >= 0 ? `${lat.toFixed(3)}°N` : `${Math.abs(lat).toFixed(3)}°S`}, ${lon >= 0 ? `${lon.toFixed(3)}°E` : `${Math.abs(lon).toFixed(3)}°W`})`;
    return NextResponse.json({
      displayName: fallbackName,
      lat,
      lon,
    });
  }
}

