'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import { EarthSystem } from '@/types';
import { Layers, Search, ArrowRight, AlertTriangle, Cpu, Activity, Globe } from 'lucide-react';

const SYSTEMS: (EarthSystem | 'All')[] = [
  'All',
  'Atmosphere',
  'Land',
  'Hydrology',
  'Ocean',
  'Cryosphere',
];

export default function VariablesPage() {
  const [activeSystem, setActiveSystem] = useState<EarthSystem | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = EARTH_VARIABLES.filter(v => {
    const matchesSystem = activeSystem === 'All' || v.system === activeSystem;
    const matchesQuery =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.unit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSystem && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Layers className="h-4 w-4" /> Earth Observation Library
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Earth Science Variables Catalog
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          NASA Space Apps Challenge 2026: Explore physical variables across Atmosphere, Land, Hydrology, Ocean, and Cryosphere systems with rigorous units and sensor provenance.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        {/* System Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SYSTEMS.map(sys => (
            <button
              key={sys}
              onClick={() => setActiveSystem(sys)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSystem === sys
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search variables or units..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Variables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(variable => (
          <div
            key={variable.id}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl group"
          >
            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300 font-mono">
                  {variable.system}
                </span>
                <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                  {variable.unit}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {variable.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {variable.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2 rounded-xl border border-slate-900 bg-slate-900/40 p-3 text-[11px] text-slate-400">
                <div>
                  <strong className="text-slate-300">Measurement Principle:</strong>{' '}
                  {variable.measurementPrinciple}
                </div>
                <div>
                  <strong className="text-slate-300">Resolution:</strong>{' '}
                  {variable.spatialResolution} • {variable.temporalResolution}
                </div>
                <div>
                  <strong className="text-slate-300">Physical Range:</strong>{' '}
                  <span className="font-mono text-cyan-400">{variable.typicalRange}</span>
                </div>
              </div>

              {/* Limitations Notice */}
              <div className="rounded-xl border border-amber-950/40 bg-amber-950/10 p-3 text-[11px] text-amber-300/80">
                <div className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3" /> Data Limitations
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                  {variable.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 mt-4 border-t border-slate-900">
              <Link
                href={`/analysis?variable=${variable.id}`}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all shadow-md"
              >
                Launch Time-Series Lab <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

