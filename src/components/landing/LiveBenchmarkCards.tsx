'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface BenchmarkStudy {
  id: string;
  title: string;
  variable: string;
  region: string;
  provider: string;
  period: string;
  unit: string;
  trendPerYear: number | null;
  pValue: number | null;
  significant: boolean;
  direction: 'INCREASING' | 'DECREASING' | 'NO_TREND';
  error?: string;
}

function trendLabel(study: BenchmarkStudy): string {
  if (study.error || study.trendPerYear === null) return 'Unavailable';
  const sign = study.trendPerYear > 0 ? '+' : '';
  return `${sign}${study.trendPerYear.toFixed(3)} ${study.unit}/yr`;
}

function pLabel(study: BenchmarkStudy): string {
  if (study.error || study.pValue === null) return 'Live data unavailable';
  return study.pValue < 0.0001 ? 'Mann-Kendall p < 0.0001' : `Mann-Kendall p = ${study.pValue.toFixed(4)}`;
}

export function LiveBenchmarkCards() {
  const [studies, setStudies] = useState<BenchmarkStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/benchmarks')
      .then(res => res.json())
      .then((data: { studies?: BenchmarkStudy[]; error?: string }) => {
        if (!active) return;
        if (data.studies) setStudies(data.studies);
        else setError(data.error || 'Live measurements are currently unavailable.');
      })
      .catch(() => {
        if (active) setError('Live measurements are currently unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="rounded-2xl border border-emerald-500/25 bg-[#092b23]/60 p-4 animate-pulse"
          >
            <div className="h-3 w-24 rounded bg-emerald-500/20 mb-3" />
            <div className="h-2.5 w-32 rounded bg-emerald-500/10 mb-2" />
            <div className="h-2.5 w-20 rounded bg-emerald-500/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error || studies.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200">
        {error || 'No live benchmark measurements are available right now.'}
      </div>
    );
  }

  const accents = [
    {
      card: 'border-emerald-500/35 bg-gradient-to-br from-emerald-500/15 via-[#092b23]/80 to-[#092b23]/70 hover:border-emerald-400/70 hover:from-emerald-500/25',
      strip: 'from-emerald-400 via-teal-300 to-orange-400',
      title: 'text-emerald-200',
      value: 'text-emerald-300',
      meta: 'text-emerald-400/70',
    },
    {
      card: 'border-orange-500/35 bg-gradient-to-br from-orange-500/15 via-[#092b23]/80 to-[#092b23]/70 hover:border-orange-400/70 hover:from-orange-500/25',
      strip: 'from-emerald-400 via-amber-300 to-orange-400',
      title: 'text-orange-200',
      value: 'text-orange-300',
      meta: 'text-orange-300/70',
    },
    {
      card: 'border-emerald-500/35 bg-gradient-to-br from-emerald-500/15 via-[#092b23]/80 to-[#092b23]/70 hover:border-orange-400/70 hover:from-emerald-500/25',
      strip: 'from-emerald-400 via-teal-300 to-orange-400',
      title: 'text-emerald-200',
      value: 'text-orange-300',
      meta: 'text-emerald-400/70',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      {studies.map((study, index) => {
        const accent = accents[index % accents.length];
        return (
          <div
            key={study.id}
            className={`group relative overflow-hidden rounded-2xl border p-3 transition-all hover:shadow-lg ${accent.card}`}
          >
            <span className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent.strip}`} />
            <div className={`font-bold ${accent.title} group-hover:text-white flex items-center justify-between gap-2`}>
              <span className="truncate">{study.title.replace(/\s*\([^)]*\)\s*$/, '')}</span>
              <span className={`text-[10px] font-mono shrink-0 ${accent.value}`}>{trendLabel(study)}</span>
            </div>
            <div className="text-[11px] text-emerald-200/70 mt-1">{study.period} • {study.region}</div>
            <div className={`text-[10px] mt-1 font-mono ${accent.meta}`}>{pLabel(study)}</div>
          </div>
        );
      })}
    </div>
  );
}
