
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAC_URL =
    'https://planetarycomputer.microsoft.com/api/stac/v1/search';

const SIGN_URL =
    'https://planetarycomputer.microsoft.com/api/sas/v1/sign';

const COLLECTION = 'landsat-c2-l2';

type StacAsset = {
    href?: string;
    type?: string;
    title?: string;
};

type StacFeature = {
    id: string;
    collection?: string;
    properties?: {
        datetime?: string;
        'eo:cloud_cover'?: number;
        platform?: string;
        'landsat:collection_category'?: string;
    };
    assets?: Record<string, StacAsset>;
};

function jsonError(message: string, status: number) {
    return NextResponse.json(
        { status: 'error', message },
        { status, headers: { 'Cache-Control': 'no-store' } }
    );
}

function makeBbox(lat: number, lng: number, radiusKm: number) {
    const safeRadius = Math.min(Math.max(radiusKm, 1), 100);
    const dLat = safeRadius / 111.32;
    const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
    const dLng = safeRadius / (111.32 * cosLat);

    return [
        lng - dLng,
        Math.max(-90, lat - dLat),
        lng + dLng,
        Math.min(90, lat + dLat),
    ];
}

async function signAsset(href: string): Promise<string> {
    const url = new URL(SIGN_URL);
    url.searchParams.set('href', href);

    const response = await fetch(url.toString(), {
        cache: 'no-store',
        signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
        throw new Error(`Planetary Computer asset signing failed (${response.status}).`);
    }

    const data = await response.json();

    if (typeof data?.href !== 'string') {
        throw new Error('Planetary Computer did not return a signed asset URL.');
    }

    return data.href;
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const lat = Number(params.get('lat'));
    const lng = Number(params.get('lng'));
    const year = Number(params.get('year'));
    const month = Number(params.get('month') || 0);
    const radiusKm = Number(params.get('radiusKm') || 25);

    const currentYear = new Date().getUTCFullYear();

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180
    ) {
        return jsonError('Valid latitude and longitude are required.', 400);
    }

    if (
        !Number.isInteger(year) ||
        year < 1984 ||
        year > currentYear
    ) {
        return jsonError(`Year must be between 1984 and ${currentYear}.`, 400);
    }

    if (!Number.isInteger(month) || month < 0 || month > 12) {
        return jsonError('Month must be between 0 and 12.', 400);
    }

    const startDate =
        month === 0
            ? `${year}-01-01T00:00:00Z`
            : `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`;

    const endDate =
        month === 0
            ? year === currentYear
                ? new Date().toISOString()
                : `${year}-12-31T23:59:59Z`
            : month === 12
                ? `${year}-12-31T23:59:59Z`
                : new Date(Date.UTC(year, month, 0, 23, 59, 59)).toISOString();

    const bbox = makeBbox(lat, lng, radiusKm);

    try {
        const searchResponse = await fetch(STAC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/geo+json',
            },
            body: JSON.stringify({
                collections: [COLLECTION],
                bbox,
                datetime: `${startDate}/${endDate}`,
                limit: 50,
                query: {
                    'eo:cloud_cover': {
                        lt: 80,
                    },
                },
            }),
            cache: 'no-store',
            signal: AbortSignal.timeout(30000),
        });

        if (!searchResponse.ok) {
            return jsonError(
                `Landsat archive search failed (${searchResponse.status}).`,
                502
            );
        }

        const result = await searchResponse.json();
        const features: StacFeature[] = Array.isArray(result?.features)
            ? result.features
            : [];

        const candidates = features
            .filter((feature) => {
                const assets = feature.assets || {};
                const preview = assets.rendered_preview || assets.thumbnail;

                return (
                    typeof preview?.href === 'string' &&
                    Boolean(feature.properties?.datetime)
                );
            })
            .sort((a, b) => {
                const cloudA = a.properties?.['eo:cloud_cover'] ?? 100;
                const cloudB = b.properties?.['eo:cloud_cover'] ?? 100;
                return cloudA - cloudB;
            });

        if (candidates.length === 0) {
            return NextResponse.json(
                {
                    status: 'empty',
                    year,
                    message:
                        'No suitable Landsat scene preview was found for this location and period. Try another month or a larger search radius.',
                    scene: null,
                },
                { headers: { 'Cache-Control': 'no-store' } }
            );
        }

        const best = candidates[0];
        const preview =
            best.assets?.rendered_preview || best.assets?.thumbnail;

        if (!preview?.href) {
            return jsonError('The selected Landsat scene has no preview asset.', 502);
        }

        const signedPreview = await signAsset(preview.href);

        return NextResponse.json(
            {
                status: 'done',
                year,
                collection: COLLECTION,
                scene: {
                    id: best.id,
                    date: best.properties?.datetime,
                    platform: best.properties?.platform || 'Landsat',
                    cloudCover: best.properties?.['eo:cloud_cover'] ?? null,
                    previewUrl: signedPreview,
                },
                candidatesFound: candidates.length,
                selectionMethod: 'Lowest reported scene cloud cover',
                source: 'Microsoft Planetary Computer / USGS Landsat Collection 2 Level-2',
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                },
            }
        );
    } catch (error) {
        console.error('Landsat imagery error:', error);

        return jsonError(
            error instanceof Error
                ? error.message
                : 'Could not retrieve Landsat imagery.',
            502
        );
    }
}
