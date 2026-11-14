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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Database className="h-4 w-4" /> NASA Common Metadata Repository (CMR)
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Dataset Discovery & Suitability
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Live querying of NASA Earth-observation collections, granules, missions, and spatial resolutions directly from NASA EOSDIS.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Search NASA datasets (e.g., MODIS, GPM, SMAP, temperature)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none shadow-xl"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>

        <select
          value={platform}
          onChange={e => {
            setPlatform(e.target.value);
            fetchCollections(keyword, e.target.value);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
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
          className="rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shrink-0 shadow-md shadow-cyan-500/20"
        >
          {loading ? 'Searching NASA...' : 'Search CMR'}
        </button>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
        <div>
          Showing {collections.length} of <strong className="text-white font-mono">{totalHits.toLocaleString()}</strong> NASA collections
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-emerald-400 font-mono">Live CMR Connection</span>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map(col => (
          <div
            key={col.id}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-cyan-400 font-mono">
                  {col.id}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {col.dataCenter}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                {col.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {col.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {col.platforms.map((p, i) => (
                  <span
                    key={i}
                    className="rounded bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 text-[10px] text-cyan-300 font-mono"
                  >
                    {p}
                  </span>
                ))}
                {col.instruments.map((inst, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 font-mono"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between">
              {col.links?.[0]?.href ? (
                <Link
                  href={col.links[0].href}
                  target="_blank"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  NASA Access Link <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-xs text-slate-500">Metadata Only</span>
              )}

              <Link
                href={`/analysis?dataset=${encodeURIComponent(col.id)}`}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
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

