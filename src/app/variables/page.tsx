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
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Layers className="h-4 w-4 text-emerald-600" /> Earth Observation Library
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Earth Science Variables Catalog
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          NASA Space Apps Challenge 2026: Explore physical variables across Atmosphere, Land, Hydrology, Ocean, and Cryosphere systems with rigorous units and sensor provenance.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        {/* System Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SYSTEMS.map(sys => (
            <button
              key={sys}
              onClick={() => setActiveSystem(sys)}
              className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeSystem === sys
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 text-slate-950 shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-xs'
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
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-xs"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Variables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(variable => (
          <div
            key={variable.id}
            className="v22-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 font-mono">
                  {variable.system}
                </span>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                  {variable.unit}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {variable.name}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {variable.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3 text-[11px] text-slate-600">
                <div>
                  <strong className="text-slate-800 font-semibold">Measurement Principle:</strong>{' '}
                  {variable.measurementPrinciple}
                </div>
                <div>
                  <strong className="text-slate-800 font-semibold">Resolution:</strong>{' '}
                  {variable.spatialResolution} • {variable.temporalResolution}
                </div>
                <div>
                  <strong className="text-slate-800 font-semibold">Physical Range:</strong>{' '}
                  <span className="font-mono font-bold text-emerald-700">{variable.typicalRange}</span>
                </div>
              </div>

              {/* Limitations Notice */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3 text-[11px] text-amber-900">
                <div className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 text-amber-600" /> Data Limitations
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  {variable.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                href={`/analysis?variable=${variable.id}`}
                className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500 transition-all hover:scale-[1.01]"
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

