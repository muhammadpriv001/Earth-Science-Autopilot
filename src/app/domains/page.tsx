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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Globe2 className="h-4 w-4" /> Earth System Architecture
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Complete Earth-System Domains
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
            11 interconnected planetary spheres observed across NASA, NOAA, and ESA satellite sensor constellations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vegetation"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-colors"
          >
            <Trees className="h-3.5 w-3.5 text-emerald-400" />
            Vegetation Intelligence
          </Link>
          <Link
            href="/cross-domain"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
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
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            selectedSystem === 'All'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white'
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
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedSystem === sys
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{sys}</span>
              <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono">
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
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none shadow-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
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
              className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl hover:border-cyan-500/40 transition-all group"
            >
              <div className="space-y-3">
                {/* System Badge & Unit */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                    <Icon className="h-3.5 w-3.5" />
                    {v.system}
                  </span>
                  <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                    {v.unit}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {v.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {v.description}
                </p>

                {v.simpleExplanation && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-[11px] text-cyan-200">
                    <span className="font-semibold text-cyan-400">In Simple Terms: </span>
                    {v.simpleExplanation}
                  </div>
                )}

                {/* Sensor Lineage & Resolution Specs */}
                <div className="rounded-2xl border border-slate-900 bg-slate-900/50 p-3 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Resolution:</span>
                    <span className="font-mono text-slate-200">{v.spatialResolution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cadence:</span>
                    <span className="font-mono text-slate-200">{v.temporalResolution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Data Coverage:</span>
                    <span className="font-mono text-slate-200">{v.availableDateRange}</span>
                  </div>
                </div>

                {/* Primary Satellites */}
                <div className="text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">Datasets: </span>
                  {v.recommendedDatasets.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-900 flex items-center justify-between gap-2">
                <Link
                  href={`/explore?variable=${v.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Map Explorer <ArrowRight className="h-3 w-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/analysis?variable=${v.id}`}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Time-Series Lab
                  </Link>
                  <Link
                    href={`/prediction?variable=${v.id}`}
                    className="rounded-xl bg-cyan-600/20 border border-cyan-500/30 px-3 py-1.5 text-[11px] font-medium text-cyan-300 hover:bg-cyan-600/30 transition-colors"
                  >
                    Forecast
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

