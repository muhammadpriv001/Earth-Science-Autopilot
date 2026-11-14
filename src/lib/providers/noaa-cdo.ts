// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — NOAA CDO v2 PROVIDER ADAPTER
// ==============================================================================
// Documentation: https://www.ncei.noaa.gov/cdo-web/webservices/v2
// ==============================================================================

import { env } from '@/lib/env';

export interface NoaaStation {
  id: string;
  name: string;
  elevation: number;
  elevationUnit: string;
  latitude: number;
  longitude: number;
  datacoverage: number;
  mindate: string;
  maxdate: string;
}

export interface NoaaObservation {
  date: string;
  datatype: string;
  station: string;
  value: number;
  attributes: string;
}

const NOAA_BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2';

/**
 * Searches NOAA weather and climate stations by geographic bounding box
 */
export async function searchNoaaStations(bbox: [number, number, number, number]): Promise<NoaaStation[]> {
  const token = env.NOAA_CDO_TOKEN;
  if (!token) {
    console.warn('NOAA CDO token not configured. Skipping live NOAA station query.');
    return [];
  }

  try {
    const url = new URL(`${NOAA_BASE_URL}/stations`);
    // NOAA CDO expects extent=minLat,minLon,maxLat,maxLon
    const extent = `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`;
    url.searchParams.set('extent', extent);
    url.searchParams.set('datasetid', 'GHCND');
    url.searchParams.set('limit', '25');

    const res = await fetch(url.toString(), {
      headers: {
        'token': token,
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }, // 24hr cache
    });

    if (!res.ok) {
      console.warn(`NOAA CDO API returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.results || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      elevation: s.elevation,
      elevationUnit: s.elevationUnit,
      latitude: s.latitude,
      longitude: s.longitude,
      datacoverage: s.datacoverage,
      mindate: s.mindate,
      maxdate: s.maxdate,
    }));
  } catch (err) {
    console.error('Error fetching NOAA stations:', err);
    return [];
  }
}

/**
 * Fetches time-series observations from NOAA CDO v2 for a given station and date range
 */
export async function fetchNoaaData(
  stationId: string,
  datatype: 'TAVG' | 'TMAX' | 'TMIN' | 'PRCP',
  startDate: string,
  endDate: string
): Promise<NoaaObservation[]> {
  const token = env.NOAA_CDO_TOKEN;
  if (!token) return [];

  try {
    const url = new URL(`${NOAA_BASE_URL}/data`);
    url.searchParams.set('datasetid', 'GHCND');
    url.searchParams.set('stationid', stationId);
    url.searchParams.set('datatypeid', datatype);
    url.searchParams.set('startdate', startDate);
    url.searchParams.set('enddate', endDate);
    url.searchParams.set('limit', '1000');
    url.searchParams.set('units', 'metric');

    const res = await fetch(url.toString(), {
      headers: { token, 'Accept': 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      date: item.date.split('T')[0],
      datatype: item.datatype,
      station: item.station,
      // GHCND temperature values in tenths of degrees Celsius unless units=metric
      value: item.value,
      attributes: item.attributes || '',
    }));
  } catch (err) {
    console.error('Error querying NOAA CDO data:', err);
    return [];
  }
}

