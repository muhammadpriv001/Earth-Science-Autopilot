'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapLibreMap } from '@/components/maps/MapLibreMap';
import { ExploreChatPanel } from '@/components/research/ExploreChatPanel';
import { GeographicRegion } from '@/types';
import {
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';

export default function ExplorePage() {
  const [selectedRegion, setSelectedRegion] = useState<GeographicRegion>({
    name: 'Lahore, Punjab, Pakistan',
    geometryType: 'point',
    coordinates: [74.3587, 31.5204],
    center: [74.3587, 31.5204],
    areaKm2: 1772,
  });

  const [selectedVariable, setSelectedVariable] = useState(EARTH_VARIABLES[0].id);
  const [radiusKm, setRadiusKm] = useState(100);
  const [isRadiusLocked, setIsRadiusLocked] = useState(false);

  const currentVar = EARTH_VARIABLES.find(v => v.id === selectedVariable) || EARTH_VARIABLES[0];

  return (
    <div className="mx-auto max-w-[1800px] px-3 sm:px-4 lg:px-6 py-4 space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
            <Compass className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Explore & Investigate</h1>
            <p className="text-[11px] text-slate-400">
              Select a region on the map. The AI assistant automatically uses your location as context.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Variable Selector */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
            >
              {EARTH_VARIABLES.map(v => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                  {v.name} ({v.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Launch Full Analysis CTA */}
          <Link
            href={`/analysis?variable=${selectedVariable}&lat=${selectedRegion.center[1]}&lng=${selectedRegion.center[0]}`}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Investigate This Region
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Two-Panel Layout: Map (Left) + AI Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-140px)] min-h-[600px]">
        {/* Left: Map Panel (8 cols) */}
        <div className="lg:col-span-8 h-[600px] lg:h-full">
          <MapLibreMap
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            isRadiusLocked={isRadiusLocked}
            onToggleRadiusLock={() => setIsRadiusLocked(!isRadiusLocked)}
          />
        </div>

        {/* Right: AI Chat Panel (4 cols) */}
        <div className="lg:col-span-4 h-[600px] lg:h-full">
          <ExploreChatPanel
            region={selectedRegion}
            variable={selectedVariable}
            variableName={currentVar.name}
            radiusKm={radiusKm}
            isRadiusLocked={isRadiusLocked}
          />
        </div>
      </div>
    </div>
  );
}
