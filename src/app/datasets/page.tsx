'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Search, ExternalLink, Filter, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { CmrCollection } from '@/lib/providers/nasa-cmr';

export default function DatasetsPage() {
  const [keyword, setKeyword] = useState('precipitation');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<CmrCollection[]>([]);
  const [totalHits, setTotalHits] = useState(0);

  const fetchCollections = async (searchKw: string, plat: string) => {
    setLoading(true);
    try {
      const url = new URL('/api/nasa/collections', window.location.origin);
      if (searchKw) url.searchParams.set('keyword', searchKw);
      if (plat) url.searchParams.set('platform', plat);
      url.searchParams.set('pageSize', '12');

      const res = await fetch(url.toString());
      const data = await res.json();
      setCollections(data.collections || []);
      setTotalHits(data.hits || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections(keyword, platform);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCollections(keyword, platform);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Database className="h-4 w-4 text-emerald-600" /> NASA Common Metadata Repository (CMR)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Dataset Discovery &amp; Suitability
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Live querying of NASA Earth-observation collections, granules, missions, and spatial resolutions directly from NASA EOSDIS.
        </p>
      </div>

      {/* Search & Filter Toolbar: Pure White Neomorphic Card */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Search NASA datasets (e.g., MODIS, GPM, SMAP, temperature)..."
            className="w-full rounded-2xl border border-slate-200 bg-[#f8faf9] py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </div>

        <select
          value={platform}
          onChange={e => {
            setPlatform(e.target.value);
            fetchCollections(keyword, e.target.value);
          }}
          className="rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
        >
          <option value="">All Platforms</option>
          <option value="Terra">Terra (MODIS)</option>
          <option value="Aqua">Aqua (MODIS / AIRS)</option>
          <option value="GPM">GPM (Precipitation)</option>
          <option value="SMAP">SMAP (Soil Moisture)</option>
          <option value="LANDSAT-8">Landsat-8</option>
          <option value="SENTINEL-1">Sentinel-1 (SAR)</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-6 py-2.5 text-xs font-bold text-white hover:from-orange-400 hover:to-amber-500 transition-all shrink-0 shadow-md shadow-orange-500/20"
        >
          {loading ? 'Searching NASA...' : 'Search CMR'}
        </button>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
        <div>
          Showing {collections.length} of <strong className="text-slate-900 font-mono">{totalHits.toLocaleString()}</strong> NASA collections
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-emerald-700 font-bold font-mono">Live CMR Connection</span>
        </div>
      </div>

      {/* Collections Grid: White Neomorphic Cards with Hover Glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map(col => (
          <div
            key={col.id}
            className="v22-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] text-emerald-800 font-bold font-mono">
                  {col.id}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-semibold">
                  {col.dataCenter}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                {col.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {col.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {col.platforms.map((p, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] text-orange-800 font-mono font-bold"
                  >
                    {p}
                  </span>
                ))}
                {col.instruments.map((inst, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-mono font-semibold"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              {col.links?.[0]?.href ? (
                <Link
                  href={col.links[0].href}
                  target="_blank"
                  className="text-xs font-bold text-orange-600 hover:text-orange-500 flex items-center gap-1"
                >
                  NASA Access Link <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-xs text-slate-400">Metadata Only</span>
              )}

              <Link
                href={`/analysis?dataset=${encodeURIComponent(col.id)}`}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-emerald-400 transition-all shadow-xs"
              >
                Use in Analysis
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

