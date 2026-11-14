'use client';

import React, { useState, useEffect } from 'react';
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
import { useLocation } from '@/context/LocationContext';

export default function ExplorePage() {
  const { mainLocation, setAsMainLocation, setRadiusKm, toggleRadiusLock } = useLocation();

  const [selectedRegion, setSelectedRegion] = useState<GeographicRegion>({
    name: mainLocation.name,
    geometryType: 'point',
    coordinates: mainLocation.coordinates,
    center: mainLocation.coordinates,
    areaKm2: Math.round(Math.PI * Math.pow(mainLocation.radiusKm, 2)),
  });

  const [selectedVariable, setSelectedVariable] = useState(EARTH_VARIABLES[0].id);

  // Guarantee page starts scrolled to the very top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync with global mainLocation when changed from top search bar
  useEffect(() => {
    setSelectedRegion(prev => ({
      ...prev,
      name: mainLocation.name,
      coordinates: mainLocation.coordinates,
      center: mainLocation.coordinates,
      areaKm2: Math.round(Math.PI * Math.pow(mainLocation.radiusKm, 2)),
    }));
  }, [mainLocation.name, mainLocation.coordinates[0], mainLocation.coordinates[1], mainLocation.radiusKm]);

  // When map clicks/moves a region, sync back to global mainLocation
  const handleRegionSelect = (region: GeographicRegion) => {
    setSelectedRegion(region);
    setAsMainLocation(region.name, region.center, mainLocation.radiusKm);
  };

  const currentVar = EARTH_VARIABLES.find(v => v.id === selectedVariable) || EARTH_VARIABLES[0];

  return (
    <div className="mx-auto max-w-[1920px] px-3 sm:px-6 py-4 space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              Explore &amp; AI Autopilot
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                Interactive GIS
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Click anywhere on the map to pin coordinates. Location updates automatically in the global search bar and across all analytical modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Variable Selector */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <Layers className="h-4 w-4 text-emerald-600" />
            <select
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {EARTH_VARIABLES.map(v => (
                <option key={v.id} value={v.id} className="bg-white text-slate-900">
                  {v.name} ({v.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Launch Full Analysis CTA (Warm Coral Accent Button) */}
          <Link
            href={`/analysis?variable=${selectedVariable}&lat=${(selectedRegion.center || selectedRegion.coordinates)?.[1] ?? 31.5204}&lng=${(selectedRegion.center || selectedRegion.coordinates)?.[0] ?? 74.3587}`}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            Investigate Analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Two-Panel Layout: Map (Left) + AI Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-175px)] min-h-[640px]">
        {/* Left: Map Panel (8 cols) */}
        <div className="lg:col-span-8 h-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] bg-white/95">
          <MapLibreMap
            selectedRegion={selectedRegion}
            onRegionSelect={handleRegionSelect}
            radiusKm={mainLocation.radiusKm}
            onRadiusChange={setRadiusKm}
            isRadiusLocked={mainLocation.isRadiusLocked}
            onToggleRadiusLock={toggleRadiusLock}
          />
        </div>

        {/* Right: AI Chat Panel (4 cols) */}
        <div className="lg:col-span-4 h-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] bg-white/95">
          <ExploreChatPanel
            region={selectedRegion}
            variable={selectedVariable}
            variableName={currentVar.name}
            radiusKm={mainLocation.radiusKm}
            isRadiusLocked={mainLocation.isRadiusLocked}
          />
        </div>
      </div>
    </div>
  );
}
