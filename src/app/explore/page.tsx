'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapLibreMap } from '@/components/maps/MapLibreMap';
import { GeographicRegion } from '@/types';
import { Compass, MapPin, ArrowRight, Layers, Sparkles } from 'lucide-react';
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="h-6 w-6 text-cyan-400" />
            Global GIS Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search places, enter coordinates, or select study regions for environmental trend detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/analysis?variable=${selectedVariable}&lat=${selectedRegion.center[1]}&lng=${selectedRegion.center[0]}`}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
          >
            Investigate This Region <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Layout: Map + Control Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map (3 Cols) */}
        <div className="lg:col-span-3">
          <MapLibreMap
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            interactive={true}
          />
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          {/* Selected Region Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
              <MapPin className="h-4 w-4" /> Selected Region
            </h3>
            <div>
              <div className="text-base font-bold text-white">
                {selectedRegion.name}
              </div>
              <div className="text-xs font-mono text-cyan-300 mt-1">
                Lat: {selectedRegion.center[1].toFixed(4)}°, Lng: {selectedRegion.center[0].toFixed(4)}°
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900 space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">
                Target Variable
              </label>
              <select
                value={selectedVariable}
                onChange={e => setSelectedVariable(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {EARTH_VARIABLES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.unit})
                  </option>
                ))}
              </select>
            </div>

            <Link
              href={`/analysis?variable=${selectedVariable}&lat=${selectedRegion.center[1]}&lng=${selectedRegion.center[0]}`}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cyan-500 transition-colors"
            >
              Analyze Time-Series <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick Presets */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Benchmark Hotspots
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Lahore, Pakistan', coords: [74.3587, 31.5204] },
                { name: 'Amazon Rainforest', coords: [-57.5, -10.0] },
                { name: 'Arctic Ocean', coords: [0.0, 85.0] },
                { name: 'Aral Sea Basin', coords: [59.5, 45.0] },
              ].map((spot, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setSelectedRegion({
                      name: spot.name,
                      geometryType: 'point',
                      coordinates: spot.coords,
                      center: spot.coords as [number, number],
                    })
                  }
                  className="w-full text-left rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>{spot.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Select</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

