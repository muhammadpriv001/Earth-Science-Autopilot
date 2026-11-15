
'use client';

import React, { useEffect, useState } from 'react';
import { Satellite, CalendarDays, RefreshCw, AlertTriangle } from 'lucide-react';

type Scene = {
    id: string;
    date: string;
    platform: string;
    cloudCover: number | null;
    previewUrl: string;
};

type SceneResponse = {
    status: string;
    year: number;
    message?: string;
    scene?: Scene | null;
    candidatesFound?: number;
};

type Props = {
    lat: number;
    lng: number;
    radiusKm?: number;
};

type SceneState = {
    year: number;
    loading: boolean;
    data?: SceneResponse;
    error?: string;
};

export function HistoricalImageryComparison({
    lat,
    lng,
    radiusKm = 25,
}: Props) {
    const currentYear = new Date().getUTCFullYear();

    const [month, setMonth] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [scenes, setScenes] = useState<SceneState[]>([]);

    const years = [1996, 2006, 2016, currentYear];

    useEffect(() => {
        let cancelled = false;
        const controllers: AbortController[] = [];

        setScenes(
            years.map((year) => ({
                year,
                loading: true,
            }))
        );

        async function loadScenes() {
            const results = await Promise.all(
                years.map(async (year): Promise<SceneState> => {
                    const controller = new AbortController();
                    controllers.push(controller);

                    try {
                        const params = new URLSearchParams({
                            lat: String(lat),
                            lng: String(lng),
                            year: String(year),
                            month: String(month),
                            radiusKm: String(radiusKm),
                        });

                        const response = await fetch(
                            `/api/vegetation/imagery?${params.toString()}`,
                            {
                                cache: 'no-store',
                                signal: controller.signal,
                            }
                        );

                        const data: SceneResponse = await response.json();

                        if (!response.ok) {
                            throw new Error(
                                data.message || `Request failed (${response.status})`
                            );
                        }

                        return {
                            year,
                            loading: false,
                            data,
                        };
                    } catch (error) {
                        return {
                            year,
                            loading: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'Could not load this year.',
                        };
                    }
                })
            );

            if (!cancelled) {
                setScenes(results);
            }
        }

        void loadScenes();

        return () => {
            cancelled = true;
            controllers.forEach((controller) => controller.abort());
        };
    }, [lat, lng, radiusKm, month, refreshKey]);

    const loadedCount = scenes.filter(
        (item) => item.data?.status === 'done'
    ).length;

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-emerald-700">
                        <Satellite className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Landsat historical archive
                        </span>
                    </div>

                    <h2 className="mt-2 text-xl font-black text-slate-900">
                        Historical Satellite Comparison
                    </h2>

                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                        Compare real Landsat scene previews intersecting your selected
                        study area. The clearest available scene is selected for each year.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setRefreshKey((value) => value + 1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-emerald-400"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    Acquisition period
                </label>

                <select
                    value={month}
                    onChange={(event) => setMonth(Number(event.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                >
                    <option value={0}>Entire year</option>
                    {Array.from({ length: 12 }, (_, index) => (
                        <option key={index + 1} value={index + 1}>
                            {new Date(2000, index, 1).toLocaleString('en', {
                                month: 'long',
                            })}
                        </option>
                    ))}
                </select>

                <span className="text-[11px] text-slate-500">
                    {loadedCount} of {years.length} scenes loaded
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {years.map((year) => {
                    const item = scenes.find((scene) => scene.year === year);

                    return (
                        <article
                            key={year}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        {year}
                                    </h3>
                                    <p className="text-[10px] text-slate-500">
                                        Landsat Collection 2 Level-2
                                    </p>
                                </div>

                                {item?.loading && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                                )}

                                {item?.data?.status === 'done' && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                                        Scene found
                                    </span>
                                )}
                            </div>

                            <div className="relative aspect-[4/3] bg-slate-900">
                                {item?.loading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
                                        <RefreshCw className="h-6 w-6 animate-spin" />
                                        <span className="text-xs">Searching archive...</span>
                                    </div>
                                )}

                                {item?.data?.scene?.previewUrl && (
                                    <a
                                        href={item.data.scene.previewUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block h-full w-full"
                                        title={`Open original Landsat preview for ${year}`}
                                    >
                                        <img
                                            src={item.data.scene.previewUrl}
                                            alt={`Landsat scene preview for ${year}`}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </a>
                                )}

                                {item?.data?.status === 'empty' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center text-slate-300">
                                        <AlertTriangle className="h-6 w-6 text-amber-400" />
                                        <p className="text-xs">
                                            {item.data.message || 'No scene found for this period.'}
                                        </p>
                                    </div>
                                )}

                                {item?.error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center text-slate-300">
                                        <AlertTriangle className="h-6 w-6 text-red-400" />
                                        <p className="text-xs">{item.error}</p>
                                    </div>
                                )}

                                {!item && (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                                        Preparing request...
                                    </div>
                                )}
                            </div>

                            {item?.data?.scene && (
                                <div className="space-y-1 px-4 py-3">
                                    <p className="text-xs font-bold text-slate-800">
                                        {new Date(item.data.scene.date).toLocaleDateString()}
                                    </p>

                                    <div className="flex flex-wrap justify-between gap-2 text-[10px] text-slate-500">
                                        <span>{item.data.scene.platform}</span>
                                        <span>
                                            Cloud cover:{' '}
                                            {item.data.scene.cloudCover == null
                                                ? 'Not reported'
                                                : `${item.data.scene.cloudCover.toFixed(1)}%`}
                                        </span>
                                    </div>

                                    <p className="break-all text-[9px] text-slate-400">
                                        {item.data.scene.id}
                                    </p>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
                <strong>Interpretation note:</strong> these are individual scene
                previews, not annual cloud-free composites. Different acquisition dates,
                seasonal conditions and sensors can affect visual comparisons. The
                preview may show the full satellite scene rather than a crop of your
                selected footprint.
            </div>

            <p className="text-[10px] text-slate-400">
                Source: USGS Landsat Collection 2 Level-2, discovered through Microsoft
                Planetary Computer STAC.
            </p>
        </section>
    );
}
