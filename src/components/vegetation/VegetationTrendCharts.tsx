
'use client';

import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';

type Point = {
    date: string;
    value: number;
};

type Props = {
    ndvi: Point[];
    evi: Point[];
};

function makePath(points: Point[]) {
    if (points.length === 0) return '';

    const width = 700;
    const height = 220;
    const padding = 34;

    const min = -0.2;
    const max = 1;

    const x = (index: number) =>
        padding +
        (index / Math.max(points.length - 1, 1)) * (width - padding * 2);

    const y = (value: number) =>
        padding +
        ((max - value) / (max - min)) * (height - padding * 2);

    return points
        .map((point, index) => {
            const px = x(index);
            const py = y(point.value);
            return `${index === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
        })
        .join(' ');
}

function average(points: Point[]) {
    if (points.length === 0) return null;
    return points.reduce((sum, point) => sum + point.value, 0) / points.length;
}

function IndexChart({
    title,
    description,
    points,
}: {
    title: string;
    description: string;
    points: Point[];
}) {
    const mean = average(points);
    const path = makePath(points);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h3 className="text-sm font-black text-slate-900">{title}</h3>
                    <p className="mt-1 text-[11px] text-slate-500">{description}</p>
                </div>

                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Mean observed value
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-900 tabular-nums">
                        {mean === null ? '—' : mean.toFixed(3)}
                    </p>
                </div>
            </div>

            {points.length === 0 ? (
                <div className="mt-5 flex h-48 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
                    No usable observations available for this index.
                </div>
            ) : (
                <>
                    <div className="mt-4 overflow-hidden rounded-xl bg-slate-50 p-2">
                        <svg
                            viewBox="0 0 700 220"
                            className="h-auto w-full"
                            role="img"
                            aria-label={`${title} observations over time`}
                        >
                            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                                const y = 34 + fraction * 152;
                                const value = 1 - fraction * 1.2;

                                return (
                                    <g key={fraction}>
                                        <line
                                            x1="34"
                                            y1={y}
                                            x2="666"
                                            y2={y}
                                            stroke="#e2e8f0"
                                            strokeDasharray="4 4"
                                        />
                                        <text
                                            x="27"
                                            y={y + 3}
                                            fontSize="10"
                                            textAnchor="end"
                                            fill="#64748b"
                                        >
                                            {value.toFixed(2)}
                                        </text>
                                    </g>
                                );
                            })}

                            <path
                                d={path}
                                fill="none"
                                stroke="#059669"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />

                            {points.map((point, index) => {
                                const x =
                                    34 +
                                    (index / Math.max(points.length - 1, 1)) * 632;

                                const y =
                                    34 + ((1 - point.value) / 1.2) * 152;

                                return (
                                    <circle
                                        key={`${point.date}-${index}`}
                                        cx={x}
                                        cy={y}
                                        r={points.length > 100 ? 1.5 : 3}
                                        fill="#047857"
                                    >
                                        <title>
                                            {point.date}: {point.value.toFixed(4)}
                                        </title>
                                    </circle>
                                );
                            })}

                            <text
                                x="34"
                                y="210"
                                fontSize="10"
                                fill="#64748b"
                            >
                                {points[0]?.date || ''}
                            </text>

                            <text
                                x="666"
                                y="210"
                                fontSize="10"
                                textAnchor="end"
                                fill="#64748b"
                            >
                                {points[points.length - 1]?.date || ''}
                            </text>
                        </svg>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-between gap-2 text-[10px] text-slate-500">
                        <span>{points.length} plotted observations</span>
                        <span>
                            {points[0]?.date} to {points[points.length - 1]?.date}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

export function VegetationTrendCharts({ ndvi, evi }: Props) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-700" />
                <div>
                    <h2 className="text-lg font-black text-slate-900">
                        Historical Vegetation Trends
                    </h2>
                    <p className="text-xs text-slate-500">
                        Observed MODIS measurements from NASA AppEEARS
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <IndexChart
                    title="Normalized Difference Vegetation Index"
                    description="NDVI · MOD13Q1.061 · 250 m · 16-day product"
                    points={ndvi}
                />

                <IndexChart
                    title="Enhanced Vegetation Index"
                    description="EVI · MOD13Q1.061 · 250 m · 16-day product"
                    points={evi}
                />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-600">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <p>
                    These charts show retrieved observations, not a forecast. Gaps
                    represent periods without a plotted observation. A mean is calculated
                    from the observations shown and should not be interpreted as an
                    area-wide average.
                </p>
            </div>
        </section>
    );
}
