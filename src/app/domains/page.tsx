'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ALL_EARTH_SYSTEMS,
  EARTH_VARIABLES,
  getVariablesBySystem,
} from '@/lib/science/earth-variables';
import {
  Globe2,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Database,
  Activity,
  Trees,
  CloudRain,
  Flame,
  Snowflake,
  Waves,
  Mountain,
  Users,
  Sun,
  Droplets,
} from 'lucide-react';
import { EarthSystem } from '@/types';

const SYSTEM_ICONS: Record<string, any> = {
  'Vegetation & Biosphere': Trees,
  'Atmosphere & Climate': Sun,
  'Precipitation & Meteorology': CloudRain,
  'Soil & Land Moisture': Droplets,
  'Hydrology & Freshwater': Waves,
  'Oceans & Marine Ecosystems': Waves,
  'Cryosphere': Snowflake,
  'Land Surface & Land Use': Mountain,
  'Fire & Environmental Disasters': Flame,
  'Solid Earth & Geophysical Changes': Activity,
  'Human Dimensions & Exposure': Users,
};

export default function DomainsPage() {
  const [selectedSystem, setSelectedSystem] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVariables = EARTH_VARIABLES.filter(v => {
    const matchesSystem = selectedSystem === 'All' || v.system === selectedSystem;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.unit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSystem && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Globe2 className="h-4 w-4 text-emerald-600" /> Earth System Architecture
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
            Complete Earth-System Domains
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            11 interconnected planetary spheres observed across NASA, NOAA, and ESA satellite sensor constellations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/vegetation"
            className="flex items-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Trees className="h-3.5 w-3.5 text-emerald-600" />
            Vegetation Intelligence
          </Link>
          <Link
            href="/cross-domain"
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Cross-Domain Discovery
          </Link>
        </div>
      </div>

      {/* Domain Quick Select Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedSystem('All')}
          className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedSystem === 'All'
              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 text-slate-950 shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-xs'
          }`}
        >
          All Domains ({EARTH_VARIABLES.length})
        </button>

        {ALL_EARTH_SYSTEMS.map(sys => {
          const Icon = SYSTEM_ICONS[sys] || Layers;
          const count = getVariablesBySystem(sys).length;
          return (
            <button
              key={sys}
              onClick={() => setSelectedSystem(sys)}
              className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedSystem === sys
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 text-slate-950 shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-xs'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{sys}</span>
              <span className="ml-0.5 rounded-full bg-slate-100 px-2 py-0.2 text-[10px] text-slate-500 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter variables by name, unit, sensor, or keyword..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Variables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVariables.map(v => {
          const Icon = SYSTEM_ICONS[v.system] || Layers;
          return (
            <div
              key={v.id}
              className="v22-card rounded-3xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* System Badge & Unit */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Icon className="h-3.5 w-3.5 text-emerald-600" />
                    {v.system}
                  </span>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                    {v.unit}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {v.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {v.description}
                </p>

                {v.simpleExplanation && (
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3 text-[11px] text-emerald-900">
                    <span className="font-bold text-emerald-700">In Simple Terms: </span>
                    {v.simpleExplanation}
                  </div>
                )}

                {/* Sensor Lineage & Resolution Specs */}
                <div className="rounded-2xl border border-slate-200/80 bg-[#f8faf9] p-3 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Resolution:</span>
                    <span className="font-mono font-bold text-slate-800">{v.spatialResolution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Cadence:</span>
                    <span className="font-mono font-bold text-slate-800">{v.temporalResolution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Data Coverage:</span>
                    <span className="font-mono font-bold text-slate-800">{v.availableDateRange}</span>
                  </div>
                </div>

                {/* Primary Satellites */}
                <div className="text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700">Datasets: </span>
                  {v.recommendedDatasets.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/explore?variable=${v.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors"
                >
                  Map Explorer <ArrowRight className="h-3 w-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/analysis?variable=${v.id}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-emerald-400 transition-all shadow-2xs"
                  >
                    Time-Series Lab
                  </Link>
                  <Link
                    href={`/forecast?variable=${v.id}`}
                    className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-1.5 text-[11px] font-bold text-orange-800 hover:bg-orange-100 transition-colors"
                  >
                    Predictions
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

