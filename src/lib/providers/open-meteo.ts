// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — OPEN-METEO ERA5 CLIMATE PROVIDER
// ==============================================================================
// Real-time access to ECMWF ERA5 reanalysis and global historical observations
// Keyless, open API covering 1940 to present day for any global coordinate.
// Docs: https://open-meteo.com/en/docs/historical-weather-api
// ==============================================================================

import { TimeSeriesObservation } from '@/types';

export interface OpenMeteoHistoricalParams {
  latitude: number;
  longitude: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  dailyVariables?: string[]; // e.g. 'temperature_2m_mean', 'precipitation_sum', 'soil_moisture_0_to_7cm_mean'
}

const HISTORICAL_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

/**
 * Fetches real historical climate time-series from ECMWF ERA5 reanalysis
 */
export async function fetchHistoricalClimateData(
  params: OpenMeteoHistoricalParams
): Promise<{
  observations: TimeSeriesObservation[];
  unit: string;
  variableName: string;
}> {
  try {
    const url = new URL(HISTORICAL_API_URL);
    url.searchParams.set('latitude', params.latitude.toFixed(4));
    url.searchParams.set('longitude', params.longitude.toFixed(4));
    url.searchParams.set('start_date', params.startDate);
    url.searchParams.set('end_date', params.endDate);

    const variable = params.dailyVariables?.[0] || 'temperature_2m_mean';
    url.searchParams.set('daily', variable);
    url.searchParams.set('timezone', 'UTC');

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Earth-Science-Autopilot/1.0',
      },
      next: { revalidate: 86400 }, // 24-hr cache
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo ERA5 API responded with status ${res.status}`);
    }

    const data = await res.json();
    const dates: string[] = data.daily?.time || [];
    const values: (number | null)[] = data.daily?.[variable] || [];
    const unit = data.daily_units?.[variable] || '°C';

    const observations: TimeSeriesObservation[] = [];
    for (let i = 0; i < dates.length; i++) {
      const val = values[i];
      if (val !== null && typeof val === 'number' && !isNaN(val)) {
        observations.push({
          date: dates[i],
          value: Number(val.toFixed(2)),
          qualityFlag: 'VALID',
        });
      } else {
        observations.push({
          date: dates[i],
          value: 0,
          qualityFlag: 'MISSING',
        });
      }
    }

    return {
      observations,
      unit,
      variableName: variable.replace(/_/g, ' '),
    };
  } catch (err) {
    console.error('Error querying Open-Meteo ERA5 climate API:', err);
    throw err;
  }
}

