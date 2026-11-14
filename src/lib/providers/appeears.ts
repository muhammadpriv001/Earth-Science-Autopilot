// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — NASA AppEEARS PROVIDER
// ==============================================================================
// AppEEARS is the NASA service that extracts point/area samples from LP DAAC
// and NSIDC products. It is the only keyless-free route to a real MODIS NDVI /
// EVI time series, which NASA POWER does not serve.
//
// Auth: AppEEARS issues a short-lived bearer token from a Basic login using the
// NASA Earthdata username/password. The token is cached in-process. A pasted
// static token (NASA_APPEARS_TOKEN) is used only as a fallback because those
// tokens expire.
//
// Task flow: create point task → poll status → download bundle CSV → parse.
// Everything here is server-only.
// ==============================================================================

const BASE_URL = (process.env.NASA_APPEARS_BASE_URL || 'https://appeears.earthdatacloud.nasa.gov/api').replace(/\/$/, '');

const TOKEN_TTL_MS = 40 * 60 * 1000;

export const MODIS_VEGETATION_PRODUCT = {
  product: 'MOD13Q1.061',
  label: 'MODIS Terra Vegetation Indices (MOD13Q1 v061, 250 m, 16-day)',
  ndviLayer: '_250m_16_days_NDVI',
  eviLayer: '_250m_16_days_EVI',
  qualityLayer: '_250m_16_days_VI_Quality',
} as const;

let tokenCache: { token: string; obtainedAt: number } | null = null;
let productLayerCache: { layers: string[]; fetchedAt: number } | null = null;

export class AppeearsError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AppeearsError';
    this.status = status;
  }
}

export function isAppeearsConfigured(): boolean {
  return Boolean(
    (process.env.NASA_EARTHDATA_USERNAME && process.env.NASA_EARTHDATA_PASSWORD) ||
      process.env.NASA_APPEARS_TOKEN
  );
}

/** Default extraction window shared by the UI, the API route and the AI chat. */
export function defaultVegetationWindow(): { startDate: string; endDate: string } {
  const now = new Date();
  return {
    startDate: `${now.getUTCFullYear() - 10}-01-01`,
    endDate: now.toISOString().slice(0, 10),
  };
}

/** Fetches with a hard timeout and a couple of retries for flaky NASA gateways. */
async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  attempts = 3,
  timeoutMs = 30000
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      // Retry transient gateway errors only.
      if ([502, 503, 504].includes(res.status) && attempt < attempts - 1) {
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < attempts - 1) {
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
    }
  }
  throw new AppeearsError(
    `NASA AppEEARS could not be reached: ${lastError instanceof Error ? lastError.message : 'network error'}`
  );
}

async function login(): Promise<string> {
  const username = process.env.NASA_EARTHDATA_USERNAME;
  const password = process.env.NASA_EARTHDATA_PASSWORD;
  if (!username || !password) {
    throw new AppeearsError('NASA Earthdata credentials are not configured.');
  }

  const basic = Buffer.from(`${username}:${password}`).toString('base64');
  const res = await fetchWithRetry(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
  });

  if (!res.ok) {
    throw new AppeearsError(
      `AppEEARS login rejected with HTTP ${res.status}. Check NASA_EARTHDATA_USERNAME/PASSWORD.`,
      res.status
    );
  }

  const data = await res.json();
  if (!data?.token) {
    throw new AppeearsError('AppEEARS login succeeded but returned no token.');
  }
  return data.token as string;
}

export async function getAppeearsToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && Date.now() - tokenCache.obtainedAt < TOKEN_TTL_MS) {
    return tokenCache.token;
  }

  if (process.env.NASA_EARTHDATA_USERNAME && process.env.NASA_EARTHDATA_PASSWORD) {
    try {
      const token = await login();
      tokenCache = { token, obtainedAt: Date.now() };
      return token;
    } catch (err) {
      if (!process.env.NASA_APPEARS_TOKEN) throw err;
      console.warn('AppEEARS login failed; falling back to static token:', err instanceof Error ? err.message : err);
    }
  }

  const staticToken = process.env.NASA_APPEARS_TOKEN;
  if (staticToken) {
    tokenCache = { token: staticToken, obtainedAt: Date.now() };
    return staticToken;
  }

  throw new AppeearsError('No AppEEARS credentials are configured.');
}

async function authedFetch(path: string, init: RequestInit = {}, retryOnAuth = true): Promise<Response> {
  const token = await getAppeearsToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetchWithRetry(`${BASE_URL}${path}`, { ...init, headers });
  if ((res.status === 401 || res.status === 403) && retryOnAuth) {
    tokenCache = null;
    const fresh = await getAppeearsToken(true);
    const retryHeaders = new Headers(init.headers);
    retryHeaders.set('Authorization', `Bearer ${fresh}`);
    return fetchWithRetry(`${BASE_URL}${path}`, { ...init, headers: retryHeaders });
  }
  return res;
}

/** Confirms which layer names the product actually exposes (cached). */
export async function getVegetationLayers(): Promise<string[]> {
  if (productLayerCache && Date.now() - productLayerCache.fetchedAt < 24 * 60 * 60 * 1000) {
    return productLayerCache.layers;
  }
  const res = await authedFetch(`/product/${MODIS_VEGETATION_PRODUCT.product}`);
  if (!res.ok) {
    throw new AppeearsError(`Could not read ${MODIS_VEGETATION_PRODUCT.product} metadata (HTTP ${res.status}).`, res.status);
  }
  const detail = await res.json();
  const layers = Object.keys(detail || {});
  productLayerCache = { layers, fetchedAt: Date.now() };
  return layers;
}

export interface VegetationSample {
  date: string;
  ndvi?: number;
  evi?: number;
  quality?: string;
  usable: boolean;
}

export interface VegetationTaskState {
  taskId: string;
  status: 'pending' | 'queued' | 'processing' | 'done' | 'error' | 'unknown';
  progress?: number;
  message?: string;
}

export interface VegetationSeries {
  taskId: string;
  product: string;
  productLabel: string;
  samples: VegetationSample[];
  ndvi: Array<{ date: string; value: number }>;
  evi: Array<{ date: string; value: number }>;
  usableCount: number;
  totalCount: number;
  startDate: string;
  endDate: string;
  retrievedAt: string;
}

const seriesCache = new Map<string, VegetationSeries>();

function toAppeearsDate(yyyyMmDd: string): string {
  const [year, month, day] = yyyyMmDd.split('-');
  return `${month}-${day}-${year}`;
}

function taskNameFor(lat: number, lng: number, startDate: string, endDate: string): string {
  return `esa-veg-${lat.toFixed(3)}_${lng.toFixed(3)}_${startDate}_${endDate}`.replace(/[^A-Za-z0-9_.-]/g, '');
}

export async function findExistingTask(lat: number, lng: number, startDate: string, endDate: string) {
  const name = taskNameFor(lat, lng, startDate, endDate);
  const res = await authedFetch('/task');
  if (!res.ok) return null;

  const tasks = await res.json();
  const list: Array<{ task_id: string; task_name: string; status: string }> = Array.isArray(tasks)
    ? tasks
    : Array.isArray(tasks?.tasks)
      ? tasks.tasks
      : [];

  return (
    list.find(t => t.task_name === name && ['done', 'processing', 'queued', 'pending'].includes(t.status)) ||
    list.find(t => t.task_name === name) ||
    null
  );
}

export async function createVegetationTask(params: {
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  label?: string;
}): Promise<string> {
  const { lat, lng, startDate, endDate } = params;

  const layers = await getVegetationLayers();
  const ndviLayer = layers.includes(MODIS_VEGETATION_PRODUCT.ndviLayer)
    ? MODIS_VEGETATION_PRODUCT.ndviLayer
    : layers.find(l => /NDVI$/i.test(l));
  const eviLayer = layers.includes(MODIS_VEGETATION_PRODUCT.eviLayer)
    ? MODIS_VEGETATION_PRODUCT.eviLayer
    : layers.find(l => /EVI$/i.test(l));

  if (!ndviLayer || !eviLayer) {
    throw new AppeearsError(
      `${MODIS_VEGETATION_PRODUCT.product} did not expose NDVI/EVI layers. Available: ${layers.slice(0, 8).join(', ')}`
    );
  }

  const payload = {
    task_type: 'point',
    task_name: taskNameFor(lat, lng, startDate, endDate),
    params: {
      coordinates: [
        {
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lng.toFixed(4)),
          id: params.label || 'Study Point',
          category: 'research',
        },
      ],
      dates: [{ startDate: toAppeearsDate(startDate), endDate: toAppeearsDate(endDate) }],
      layers: [
        { product: MODIS_VEGETATION_PRODUCT.product, layer: ndviLayer },
        { product: MODIS_VEGETATION_PRODUCT.product, layer: eviLayer },
      ],
      output: { format: { type: 'csv' } },
    },
  };

  const res = await authedFetch('/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new AppeearsError(
      `AppEEARS rejected the vegetation task (HTTP ${res.status}). ${detail.slice(0, 300)}`,
      res.status
    );
  }

  const created = await res.json();
  if (!created?.task_id) {
    throw new AppeearsError('AppEEARS accepted the request but returned no task id.');
  }
  return created.task_id as string;
}

export async function getTaskState(taskId: string): Promise<VegetationTaskState> {
  const res = await authedFetch(`/task/${taskId}`);
  if (!res.ok) {
    return { taskId, status: 'unknown', message: `Status check failed (HTTP ${res.status}).` };
  }
  const data = await res.json();
  return {
    taskId,
    status: (data?.status as VegetationTaskState['status']) || 'unknown',
    progress: typeof data?.progress === 'number' ? data.progress : undefined,
    message: data?.status === 'error' ? 'NASA AppEEARS reported a task error.' : undefined,
  };
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(cell);
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells;
}

export function parseVegetationCsv(csv: string): VegetationSample[] {
  const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const findColumn = (suffix: string) =>
    header.findIndex(h => h.toLowerCase().endsWith(suffix.toLowerCase()));

  const dateIdx = header.findIndex(h => h.toLowerCase() === 'date');
  const ndviIdx = findColumn('__250m_16_days_NDVI');
  const eviIdx = findColumn('__250m_16_days_EVI');
  const qualityIdx = findColumn('VI_Quality_MODLAND_Description');

  if (dateIdx < 0 || (ndviIdx < 0 && eviIdx < 0)) return [];

  const samples: VegetationSample[] = [];
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const date = cells[dateIdx]?.trim();
    if (!date) continue;

    const ndvi = ndviIdx >= 0 ? Number(cells[ndviIdx]) : NaN;
    const evi = eviIdx >= 0 ? Number(cells[eviIdx]) : NaN;
    const quality = qualityIdx >= 0 ? cells[qualityIdx]?.trim() : undefined;

    const ndviValid = Number.isFinite(ndvi) && ndvi > -2 && ndvi < 2;
    const eviValid = Number.isFinite(evi) && evi > -2 && evi < 2;
    if (!ndviValid && !eviValid) continue;

    // Cloud-contaminated or snow-covered pixels distort vegetation trends, so
    // they are retained for transparency but excluded from the plotted series.
    const qualityText = (quality || '').toLowerCase();
    const unusableQuality = /cloud|snow|ice|shadow/.test(qualityText);

    samples.push({
      date,
      ndvi: ndviValid ? Number(ndvi.toFixed(4)) : undefined,
      evi: eviValid ? Number(evi.toFixed(4)) : undefined,
      quality,
      usable: !unusableQuality,
    });
  }

  return samples.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getVegetationSeries(taskId: string): Promise<VegetationSeries | null> {
  const cached = seriesCache.get(taskId);
  if (cached) return cached;

  const bundleRes = await authedFetch(`/bundle/${taskId}`);
  if (!bundleRes.ok) return null;
  const bundle = await bundleRes.json();
  const files: Array<{ file_id: string; file_name: string }> = bundle?.files || [];
  const csvFile = files.find(f => (f.file_name || '').toLowerCase().endsWith('.csv'));
  if (!csvFile) return null;

  const csvRes = await authedFetch(`/bundle/${taskId}/${csvFile.file_id}`);
  if (!csvRes.ok) return null;
  const csv = await csvRes.text();

  const samples = parseVegetationCsv(csv);
  if (samples.length === 0) return null;

  const ndvi = samples.filter(s => s.usable && s.ndvi !== undefined).map(s => ({ date: s.date, value: s.ndvi as number }));
  const evi = samples.filter(s => s.usable && s.evi !== undefined).map(s => ({ date: s.date, value: s.evi as number }));

  const series: VegetationSeries = {
    taskId,
    product: MODIS_VEGETATION_PRODUCT.product,
    productLabel: MODIS_VEGETATION_PRODUCT.label,
    samples,
    ndvi,
    evi,
    usableCount: samples.filter(s => s.usable).length,
    totalCount: samples.length,
    startDate: samples[0]?.date || '',
    endDate: samples[samples.length - 1]?.date || '',
    retrievedAt: new Date().toISOString(),
  };

  seriesCache.set(taskId, series);
  return series;
}

/**
 * Ensures a task exists and returns its current state. Never waits for
 * completion — callers poll so the HTTP request stays short.
 */
export async function ensureVegetationTask(params: {
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  label?: string;
}): Promise<VegetationTaskState> {
  const existing = await findExistingTask(params.lat, params.lng, params.startDate, params.endDate);
  if (existing) {
    const state = await getTaskState(existing.task_id);
    // A previously failed task is recreated once so the user is not stuck.
    if (state.status !== 'error') return state;
  }

  const taskId = await createVegetationTask(params);
  return { taskId, status: 'pending' };
}
