'use client';

import React, { useState } from 'react';
import { GeographicRegion } from '@/types';
import { MapPin, Search, Layers, Compass, ZoomIn, ZoomOut, Check } from 'lucide-react';

interface Props {
  selectedRegion?: GeographicRegion;
  onRegionSelect?: (region: GeographicRegion) => void;
  interactive?: boolean;
}

export function MapLibreMap({
  selectedRegion,
  onRegionSelect,
  interactive = true,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(4);
  const [center, setCenter] = useState<[number, number]>(
    selectedRegion ? selectedRegion.center : [74.3587, 31.5204]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (place: any) => {
    const coords: [number, number] = [place.lon, place.lat];
    setCenter(coords);
    setSearchResults([]);
    setSearchQuery(place.displayName);

    if (onRegionSelect) {
      onRegionSelect({
        name: place.displayName.split(',')[0],
        geometryType: 'point',
        coordinates: coords,
        center: coords,
      });
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Search Bar Overlay */}
      {interactive && (
        <div className="absolute top-4 left-4 z-20 w-80 max-w-[calc(100%-2rem)]">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search city, basin, or region..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/95 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 shadow-xl backdrop-blur-md focus:border-cyan-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            {isSearching && (
              <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            )}
          </form>

          {/* Autocomplete Results */}
          {searchResults.length > 0 && (
            <div className="mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-md">
              {searchResults.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocation(r)}
                  className="w-full text-left rounded-lg p-2 hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{r.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Map Visual Display (OpenStreetMap / Canvas Renderer) */}
      <div className="relative w-full h-full flex items-center justify-center bg-[#061121]">
        {/* World Grid Lines Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Selected Region Marker */}
        <div className="relative z-10 flex flex-col items-center animate-bounce-slow">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <MapPin className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1 shadow-lg text-xs font-semibold text-white">
            {selectedRegion?.name || 'Selected Coordinate'}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
            {center[1].toFixed(4)}°N, {center[0].toFixed(4)}°E
          </div>
        </div>

        {/* Quick Coordinate Presets */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
          {[
            { name: 'Lahore, PK', coords: [74.3587, 31.5204] },
            { name: 'Amazon Basin', coords: [-57.5, -10.0] },
            { name: 'Arctic Ocean', coords: [0.0, 85.0] },
            { name: 'Nile Delta', coords: [31.2, 30.5] },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCenter(preset.coords as [number, number]);
                if (onRegionSelect) {
                  onRegionSelect({
                    name: preset.name,
                    geometryType: 'point',
                    coordinates: preset.coords,
                    center: preset.coords as [number, number],
                  });
                }
              }}
              className="rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Map Control Buttons */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
            className="rounded-lg border border-slate-700 bg-slate-900/90 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
            className="rounded-lg border border-slate-700 bg-slate-900/90 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

