// ==============================================================================
// NASA GIBS SATELLITE IMAGERY HELPERS
// ==============================================================================
// NASA's Global Imagery Browse Services (GIBS) publishes pre-rendered satellite
// tiles through an open WMS endpoint. No API key, Earthdata login or Copernicus
// account is required for true-colour or MODIS NDVI browse imagery, so the
// portal can display measured satellite scenes immediately.
//
// This module is client-safe: it only builds URLs and never fetches data.
// ==============================================================================

export type ImageryEpochId = 'historical' | 'intermediate' | 'recent';

export interface ImageryEpoch {
  id: ImageryEpochId;
  label: string;
  shortLabel: string;
  date: string;
  year: number;
}

export interface EpochImagery {
  epoch: ImageryEpoch;
  bbox: string;
  trueColorUrl: string;
  ndviUrl: string;
  worldViewUrl: string;
}

export const GIBS_WMS_ENDPOINT =
  'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';

/** MODIS Terra true colour is available from February 2000 to present. */
export const GIBS_TRUE_COLOR_LAYER = 'MODIS_Terra_CorrectedReflectance_TrueColor';

/** Monthly MODIS Terra NDVI composite (2000 → present). */
export const GIBS_NDVI_LAYER = 'MODIS_Terra_L3_NDVI_Monthly';

const RECENT_YEAR = Math.max(2001, new Date().getUTCFullYear() - 1);

/**
 * June scenes are used so every epoch captures the same phenological window
 * (northern-hemisphere peak growing season) and differences are comparable.
 */
export const IMAGERY_EPOCHS: ImageryEpoch[] = [
  {
    id: 'historical',
    label: 'Baseline (2000)',
    shortLabel: '2000',
    date: '2000-06-15',
    year: 2000,
  },
  {
    id: 'intermediate',
    label: 'Mid-Period (2012)',
    shortLabel: '2012',
    date: '2012-06-15',
    year: 2012,
  },
  {
    id: 'recent',
    label: `Recent (${RECENT_YEAR})`,
    shortLabel: String(RECENT_YEAR),
    date: `${RECENT_YEAR}-06-15`,
    year: RECENT_YEAR,
  },
];

export function getImageryEpoch(epochId: ImageryEpochId): ImageryEpoch {
  return IMAGERY_EPOCHS.find(epoch => epoch.id === epochId) || IMAGERY_EPOCHS[2];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Build a WGS84 bounding box around a point footprint. A minimum span keeps
 * small radii legible at 512 px and guarantees a non-degenerate WMS request.
 */
export function getImageryBBox(
  center: [number, number],
  radiusKm: number,
  minimumSpanDeg = 1.5
): string {
  const [lon, lat] = center;
  const latPad = Math.max(minimumSpanDeg / 2, radiusKm / 110.574);
  const lonPad = Math.max(
    minimumSpanDeg / 2,
    radiusKm / (111.32 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))
  );

  const minLon = clamp(lon - lonPad, -179.99, 179.99);
  const maxLon = clamp(lon + lonPad, -179.99, 179.99);
  const minLat = clamp(lat - latPad, -85, 85);
  const maxLat = clamp(lat + latPad, -85, 85);

  return [minLon, minLat, maxLon, maxLat].map(value => value.toFixed(4)).join(',');
}

export function buildGibsWmsUrl(options: {
  layer: string;
  date: string;
  bbox: string;
  width?: number;
  height?: number;
  format?: 'image/jpeg' | 'image/png';
  transparent?: boolean;
}): string {
  const {
    layer,
    date,
    bbox,
    width = 512,
    height = 512,
    format = 'image/jpeg',
    transparent = false,
  } = options;

  const params = new URLSearchParams({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: '1.1.1',
    LAYERS: layer,
    STYLES: '',
    FORMAT: format,
    TRANSPARENT: transparent ? 'TRUE' : 'FALSE',
    SRS: 'EPSG:4326',
    BBOX: bbox,
    WIDTH: String(width),
    HEIGHT: String(height),
    TIME: date,
  });

  return `${GIBS_WMS_ENDPOINT}?${params.toString()}`;
}

function buildWorldViewUrl(center: [number, number], date: string): string {
  const [lon, lat] = center;
  const params = new URLSearchParams({
    v: `${lon.toFixed(3)},${lat.toFixed(3)},4`,
    t: date,
    l: GIBS_TRUE_COLOR_LAYER,
  });
  return `https://worldview.earthdata.nasa.gov/?${params.toString()}`;
}

export function getEpochImagery(
  epochId: ImageryEpochId,
  center: [number, number],
  radiusKm: number
): EpochImagery {
  const epoch = getImageryEpoch(epochId);
  const bbox = getImageryBBox(center, radiusKm);

  return {
    epoch,
    bbox,
    trueColorUrl: buildGibsWmsUrl({
      layer: GIBS_TRUE_COLOR_LAYER,
      date: epoch.date,
      bbox,
      format: 'image/jpeg',
    }),
    ndviUrl: buildGibsWmsUrl({
      layer: GIBS_NDVI_LAYER,
      date: epoch.date,
      bbox,
      format: 'image/png',
      transparent: true,
    }),
    worldViewUrl: buildWorldViewUrl(center, epoch.date),
  };
}

export function getAllEpochImagery(
  center: [number, number],
  radiusKm: number
): EpochImagery[] {
  return IMAGERY_EPOCHS.map(epoch => getEpochImagery(epoch.id, center, radiusKm));
}
