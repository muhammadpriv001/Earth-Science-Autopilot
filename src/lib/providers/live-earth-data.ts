// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — LIVE EARTH-OBSERVATION PROVIDERS
// ==============================================================================
// All series returned by this module originate from real, publicly accessible
// measurement archives. No synthetic or hard-coded observations are generated.
//
//  • NASA POWER (MERRA-2 / CERES assimilation)  — monthly climate & land variables
//  • NSIDC Sea Ice Index (G02135)               — September Arctic ice extent
//
// If a variable has no keyless live source, callers receive a
// LiveDataUnavailableError instead of fabricated numbers.
// ==============================================================================

import { TimeSeriesDataset, GeographicRegion, TimeSeriesObservation } from '@/types';
import { getVariableById } from '@/lib/science/earth-variables';

export class LiveDataUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LiveDataUnavailableError';
  }
}

interface PowerParameterSpec {
  parameter: string;
  unit: string;
  /** How monthly values are interpreted. POWER returns monthly means. */
  aggregation: 'mean' | 'sum';
}

/**
 * Variables with a verified, keyless live measurement source.
 * Everything else must be surfaced to the user as unavailable rather than
 * being silently replaced with a demonstration dataset.
 */
const POWER_VARIABLE_MAP: Record<string, PowerParameterSpec> = {
  'air-temperature': { parameter: 'T2M', unit: '°C', aggregation: 'mean' },
  'land-surface-temperature': { parameter: 'TS', unit: '°C', aggregation: 'mean' },
  precipitation: { parameter: 'PRECTOTCORR', unit: 'mm/month', aggregation: 'sum' },
  'soil-moisture': { parameter: 'GWETROOT', unit: 'fraction (0–1)', aggregation: 'mean' },
};

const POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/monthly/point';
const NSIDC_SEPTEMBER_ICE_URL =
  'https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_09_extent_v4.0.csv';

const VARIABLE_ALIASES: Record<string, string> = {
  temperature: 'air-temperature',
  sea_ice: 'sea-ice-extent',
  'sea-ice': 'sea-ice-extent',
};

export function normaliseVariableId(variableId: string): string {
  return VARIABLE_ALIASES[variableId] || variableId;
}

export const LIVE_SUPPORTED_VARIABLE_IDS = [
  ...Object.keys(POWER_VARIABLE_MAP),
  'sea-ice-extent',
] as const;

export function isLiveVariableSupported(variableId: string): boolean {
  return (LIVE_SUPPORTED_VARIABLE_IDS as readonly string[]).includes(normaliseVariableId(variableId));
}

function monthKeyToDate(key: string): string {
  const year = key.slice(0, 4);
  const month = key.slice(4, 6);
  return `${year}-${month}-01`;
}

function daysInMonth(dateStr: string): number {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getCenter(region?: GeographicRegion): [number, number] {
  if (region?.center) return region.center;
  if (Array.isArray(region?.coordinates) && typeof region.coordinates[0] === 'number') {
    return region.coordinates as [number, number];
  }
  // Lahore, Pakistan is the platform's default investigation footprint.
  return [74.3587, 31.5204];
}

async function fetchPowerMonthly(
  latitude: number,
  longitude: number,
  startYear: number,
  endYear: number,
  parameter: string
): Promise<Record<string, number>> {
  const url = new URL(POWER_BASE_URL);
  url.searchParams.set('parameters', parameter);
  url.searchParams.set('community', 'AG');
  url.searchParams.set('longitude', longitude.toFixed(4));
  url.searchParams.set('latitude', latitude.toFixed(4));
  url.searchParams.set('start', String(startYear));
  url.searchParams.set('end', String(endYear));
  url.searchParams.set('format', 'JSON');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json', 'User-Agent': 'Earth-Science-Autopilot/1.0' },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new LiveDataUnavailableError(
      `NASA POWER returned HTTP ${res.status} for ${parameter} at ${latitude.toFixed(3)}, ${longitude.toFixed(3)}.`
    );
  }

  const json = await res.json();
  const series = json?.properties?.parameter?.[parameter];
  if (!series || typeof series !== 'object') {
    throw new LiveDataUnavailableError(
      `NASA POWER did not return a usable ${parameter} series for this location.`
    );
  }

  return series;
}

async function fetchPowerDataset(
  variableId: string,
  region: GeographicRegion,
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataset> {
  const variable = getVariableById(variableId);
  const spec = POWER_VARIABLE_MAP[variableId];

  if (!variable || !spec) {
    throw new LiveDataUnavailableError(`No live NASA POWER mapping exists for ${variableId}.`);
  }

  const [lng, lat] = getCenter(region);
  const startYear = Math.max(1981, parseInt(startDate.slice(0, 4), 10) || 1981);
  const endYear = Math.min(new Date().getUTCFullYear(), parseInt(endDate.slice(0, 4), 10) || new Date().getUTCFullYear());

  if (endYear < startYear) {
    throw new LiveDataUnavailableError('The requested end date precedes the start date.');
  }

  const series = await fetchPowerMonthly(lat, lng, startYear, endYear, spec.parameter);

  const observations: TimeSeriesObservation[] = [];
  for (const [key, rawValue] of Object.entries(series)) {
    // POWER appends a YYYY13 annual aggregate; only keep real calendar months.
    if (!/^\d{6}$/.test(key)) continue;
    const monthPart = parseInt(key.slice(4, 6), 10);
    if (monthPart < 1 || monthPart > 12) continue;

    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= -900) {
      // POWER emits fill values for months outside the current archive window.
      // Skipping them keeps the series strictly measured rather than inserting
      // a zero that would distort trends and forecasts.
      continue;
    }

    const date = monthKeyToDate(key);
    const normalised =
      spec.aggregation === 'sum'
        ? Number((value * daysInMonth(date)).toFixed(2))
        : Number(value.toFixed(3));

    observations.push({ date, value: normalised, qualityFlag: 'VALID' });
  }

  observations.sort((a, b) => a.date.localeCompare(b.date));

  if (!observations.some(o => o.qualityFlag === 'VALID')) {
    throw new LiveDataUnavailableError(
      `No valid ${variable.name} measurements were returned by NASA POWER for this footprint.`
    );
  }

  return {
    variableId: variable.id,
    variableName: variable.name,
    unit: spec.unit,
    region: { ...region, center: [lng, lat] },
    provider: 'NASA POWER (MERRA-2 / CERES)',
    datasetName: `NASA POWER Monthly Point API — ${spec.parameter}`,
    temporalAggregation: 'Monthly',
    isDemonstration: false,
    provenance: {
      sourceUrl: 'https://power.larc.nasa.gov/docs/services/api/temporal/monthly/',
      retrievalDate: new Date().toISOString(),
      citation:
        'NASA Prediction Of Worldwide Energy Resources (POWER) Project, NASA Langley Research Center. MERRA-2 & CERES assimilated observations.',
      transformationSteps: [
        `Queried monthly ${spec.parameter} at ${lat.toFixed(4)}°, ${lng.toFixed(4)}° for ${startYear}–${endYear}.`,
        spec.aggregation === 'sum'
          ? 'Converted monthly mean daily totals to calendar-month accumulations.'
          : 'Retained NASA POWER monthly means without alteration.',
        'Excluded POWER annual aggregate rows (month 13) and fill values.',
      ],
    },
    observations,
  };
}

async function fetchNsidcSeaIceDataset(region: GeographicRegion, endDate: string): Promise<TimeSeriesDataset> {
  const res = await fetch(NSIDC_SEPTEMBER_ICE_URL, {
    headers: { Accept: 'text/csv', 'User-Agent': 'Earth-Science-Autopilot/1.0' },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new LiveDataUnavailableError(`NSIDC Sea Ice Index returned HTTP ${res.status}.`);
  }

  const csv = await res.text();
  const endYear = parseInt(endDate.slice(0, 4), 10) || new Date().getUTCFullYear();
  const observations: TimeSeriesObservation[] = [];

  for (const line of csv.split(/\r?\n/).slice(1)) {
    const columns = line.split(',').map(c => c.trim());
    if (columns.length < 5) continue;
    const year = parseInt(columns[0], 10);
    const extent = Number(columns[4]);
    if (!Number.isFinite(year) || !Number.isFinite(extent) || year > endYear) continue;
    observations.push({
      date: `${year}-09-01`,
      value: Number(extent.toFixed(2)),
      qualityFlag: 'VALID',
    });
  }

  observations.sort((a, b) => a.date.localeCompare(b.date));
  if (observations.length < 4) {
    throw new LiveDataUnavailableError('NSIDC returned an insufficient September sea-ice record.');
  }

  return {
    variableId: 'sea-ice-extent',
    variableName: 'Arctic September Sea Ice Extent',
    unit: 'million km²',
    region: {
      ...region,
      name: region.name || 'Northern Hemisphere Arctic Ocean',
      center: region.center || [0, 85],
    },
    provider: 'NSIDC Sea Ice Index, Version 3 (G02135)',
    datasetName: 'N_09_extent_v4.0.csv — September monthly mean extent',
    temporalAggregation: 'Annual',
    isDemonstration: false,
    provenance: {
      sourceUrl: 'https://nsidc.org/data/g02135/versions/3',
      retrievalDate: new Date().toISOString(),
      citation:
        'Fetterer, F., Knowles, K., Meier, W., Savoie, M., Windnagel, A. K. (2017). Sea Ice Index, Version 3. NSIDC.',
      transformationSteps: [
        'Downloaded the NSIDC Sea Ice Index September monthly extent CSV.',
        'Parsed the measured September mean extent (million km²) for each year.',
      ],
    },
    observations,
  };
}

/**
 * Returns a real, measured time series for the requested variable. Throws a
 * LiveDataUnavailableError when no keyless live source is available.
 */
export async function getLiveDataset(params: {
  variableId: string;
  region?: GeographicRegion;
  startDate?: string;
  endDate?: string;
}): Promise<TimeSeriesDataset> {
  const variableId = normaliseVariableId(params.variableId);
  const region: GeographicRegion = params.region || {
    name: 'Lahore, Punjab, Pakistan',
    geometryType: 'point',
    coordinates: [74.3587, 31.5204],
    center: [74.3587, 31.5204],
  };
  const startDate = params.startDate || '1994-01-01';
  const endDate = params.endDate || new Date().toISOString().slice(0, 10);

  if (variableId === 'sea-ice-extent') {
    return fetchNsidcSeaIceDataset(region, endDate);
  }

  if (POWER_VARIABLE_MAP[variableId]) {
    return fetchPowerDataset(variableId, region, startDate, endDate);
  }

  const variable = getVariableById(variableId);
  throw new LiveDataUnavailableError(
    `No keyless live measurement source is configured for ${variable?.name || variableId}. ` +
      `Connect NASA Earthdata credentials (AppEEARS) to retrieve this product instead of using demonstration data.`
  );
}
