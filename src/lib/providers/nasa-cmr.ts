// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — NASA CMR PROVIDER ADAPTER
// ==============================================================================
// Interfaces directly with NASA Common Metadata Repository (CMR) REST API:
// https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html
// ==============================================================================

export interface CmrCollection {
  id: string;
  title: string;
  summary: string;
  version: string;
  platforms: string[];
  instruments: string[];
  timeStart?: string;
  timeEnd?: string;
  spatialCoverage?: string;
  dataCenter: string;
  links: {
    href: string;
    rel: string;
    title?: string;
  }[];
}

export interface CmrSearchParams {
  keyword?: string;
  variable?: string;
  platform?: string;
  instrument?: string;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  temporal?: [string, string]; // [startDate, endDate] in ISO
  pageSize?: number;
  pageNum?: number;
}

const CMR_BASE_URL = 'https://cmr.earthdata.nasa.gov/search';

/**
 * Searches NASA Earth Science Collections via the CMR Search API
 */
export async function searchCmrCollections(params: CmrSearchParams): Promise<{
  hits: number;
  collections: CmrCollection[];
}> {
  try {
    const url = new URL(`${CMR_BASE_URL}/collections.json`);

    if (params.keyword) {
      url.searchParams.set('keyword', params.keyword);
    }

    if (params.platform) {
      url.searchParams.set('platform', params.platform);
    }

    if (params.instrument) {
      url.searchParams.set('instrument', params.instrument);
    }

    if (params.bbox) {
      // CMR expects min-lon, min-lat, max-lon, max-lat
      url.searchParams.set('bounding_box', params.bbox.join(','));
    }

    if (params.temporal && params.temporal[0] && params.temporal[1]) {
      // CMR expects start_date,end_date
      url.searchParams.set('temporal', `${params.temporal[0]},${params.temporal[1]}`);
    }

    url.searchParams.set('page_size', String(params.pageSize || 10));
    url.searchParams.set('page_num', String(params.pageNum || 1));

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Earth-Science-Autopilot/1.0 (NASA-Space-Apps-2026)',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.warn(`NASA CMR responded with HTTP ${res.status}: ${res.statusText}`);
      return { hits: 0, collections: [] };
    }

    const data = await res.json();
    const hits = parseInt(res.headers.get('CMR-Hits') || '0', 10) || (data.feed?.entry?.length || 0);

    const collections: CmrCollection[] = (data.feed?.entry || []).map((entry: any) => ({
      id: entry.id,
      title: entry.title || 'Untitled NASA Collection',
      summary: entry.summary || 'No description provided.',
      version: entry.version_id || '1.0',
      platforms: (entry.platforms || []).map((p: any) => p.short_name || p),
      instruments: (entry.instruments || []).map((i: any) => i.short_name || i),
      timeStart: entry.time_start,
      timeEnd: entry.time_end,
      dataCenter: entry.data_center || 'NASA EOSDIS',
      links: (entry.links || []).map((l: any) => ({
        href: l.href,
        rel: l.rel,
        title: l.title,
      })),
    }));

    return { hits, collections };
  } catch (err) {
    console.error('Error fetching NASA CMR collections:', err);
    return { hits: 0, collections: [] };
  }
}

