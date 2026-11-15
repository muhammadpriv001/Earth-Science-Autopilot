'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapLibreMap } from '@/components/maps/MapLibreMap';
import { ExploreChatPanel } from '@/components/research/ExploreChatPanel';
import type { ForecastResult, GeographicRegion } from '@/types';
import {
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import {
  getLiveVariable,
  getLiveVariables,
  LIVE_VARIABLES,
} from '@/lib/science/live-capabilities';
import { useLocation } from '@/context/LocationContext';

export default function ExplorePage() {
  const {
    mainLocation,
    setAsMainLocation,
    setRadiusKm,
    toggleRadiusLock,
  } = useLocation();

  const [selectedRegion, setSelectedRegion] = useState<GeographicRegion>({
    name: mainLocation.name,
    geometryType: 'point',
    coordinates: mainLocation.coordinates,
    center: mainLocation.coordinates,
    areaKm2: Math.round(Math.PI * mainLocation.radiusKm * mainLocation.radiusKm),
  });
  const [selectedVariable, setSelectedVariable] = useState('air-temperature');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [forecast, setForecast] = useState<ForecastResult | null>(null);

  const horizonMonths = 24;
  const modelType = 'holt-winters' as const;
  const radiusKm = mainLocation.radiusKm || 100;
  const isRadiusLocked = Boolean(mainLocation.isRadiusLocked);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Keep the map selection synchronized with the application's global location.
  useEffect(() => {
    setSelectedRegion(previous => ({
      ...previous,
      name: mainLocation.name,
      coordinates: mainLocation.coordinates,
      center: mainLocation.coordinates,
      areaKm2: Math.round(Math.PI * radiusKm * radiusKm),
    }));
  }, [
    mainLocation.name,
    mainLocation.coordinates[0],
    mainLocation.coordinates[1],
    radiusKm,
  ]);

  const handleRegionSelect = (region: GeographicRegion) => {
    setSelectedRegion(region);
    setAsMainLocation(region.name, region.center ?? region.coordinates, radiusKm);
  };

  const currentVar = getLiveVariable(selectedVariable) || LIVE_VARIABLES[0];
  const categoryVariables = getLiveVariables(selectedCategory);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const available = getLiveVariables(categoryId);
    if (available.length > 0 && !available.some(variable => variable.id === selectedVariable)) {
      setSelectedVariable(available[0].id);
    }
  };

  // Keep the same forecast service used by the Forecast Laboratory. The map
  // and variable are the only inputs that change this Explore-page forecast.
  useEffect(() => {
    const controller = new AbortController();

    const loadForecast = async () => {
      setForecast(null);
      try {
        const response = await fetch('/api/prediction/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            variableId: selectedVariable,
            region: {
              name: selectedRegion.name,
              geometryType: selectedRegion.geometryType,
              coordinates: selectedRegion.coordinates,
              center: selectedRegion.center ?? selectedRegion.coordinates,
            },
            startDate: '1994-01-01',
            endDate: new Date().toISOString().slice(0, 10),
            horizonMonths,
            modelType,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.forecast) {
          throw new Error(data.error || data.message || `Forecast API returned HTTP ${response.status}`);
        }
        setForecast(data.forecast as ForecastResult);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Explore forecast request failed:', error);
          setForecast(null);
        }
      }
    };

    void loadForecast();
    return () => controller.abort();
  }, [
    selectedRegion.name,
    selectedRegion.geometryType,
    selectedRegion.coordinates[0],
    selectedRegion.coordinates[1],
    selectedVariable,
  ]);

  const regionCenter = selectedRegion.center ?? selectedRegion.coordinates;

  return (
    <div className="mx-auto max-w-[1920px] space-y-4 px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100 text-emerald-800">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              Explore &amp; AI Autopilot
              <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                Interactive GIS
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Click anywhere on the map to pin coordinates. Location updates automatically in the global search bar and across analytical modules.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex min-w-0 max-w-[11rem] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-xs">
            <Sliders className="h-4 w-4 shrink-0 text-emerald-600" />
            <select
              value={selectedCategory}
              onChange={event => handleCategoryChange(event.target.value)}
              className="w-full min-w-0 cursor-pointer truncate bg-transparent pr-1 text-xs font-bold text-slate-800 focus:outline-none"
              aria-label="Earth-system category"
            >
              <option value="all">All live categories</option>
              <option value="climate">Atmosphere &amp; Climate</option>
              <option value="water">Water &amp; Soil Moisture</option>
              <option value="cryosphere">Cryosphere &amp; Sea Ice</option>
            </select>
          </div>

          <div className="flex min-w-0 max-w-[13rem] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-xs">
            <Layers className="h-4 w-4 shrink-0 text-emerald-600" />
            <select
              value={selectedVariable}
              onChange={event => setSelectedVariable(event.target.value)}
              className="w-full min-w-0 cursor-pointer truncate bg-transparent pr-1 text-xs font-bold text-slate-800 focus:outline-none"
              aria-label="Live variable"
            >
              {categoryVariables.map(variable => (
                <option key={variable.id} value={variable.id}>
                  {variable.name} ({variable.unit})
                </option>
              ))}
            </select>
          </div>

          <Link
            href={`/analysis?variable=${selectedVariable}&lat=${regionCenter[1] ?? 31.5204}&lng=${regionCenter[0] ?? 74.3587}`}
            className="flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] hover:from-orange-400 hover:to-amber-500"
          >
            <Sparkles className="h-4 w-4" />
            Investigate Analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="workspace-explore grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="h-[56vh] min-h-[300px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] lg:col-span-8 lg:h-full lg:min-h-0">
          <MapLibreMap
            selectedRegion={selectedRegion}
            onRegionSelect={handleRegionSelect}
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            isRadiusLocked={isRadiusLocked}
            onToggleRadiusLock={toggleRadiusLock}
          />
        </div>

        <div className="h-[75dvh] min-h-[360px] lg:col-span-4 lg:h-[86%] lg:max-h-[560px] lg:min-h-[360px] lg:self-center">
          <ExploreChatPanel
            mode="explore"
            region={selectedRegion}
            variable={selectedVariable}
            variableName={currentVar.name}
            variableUnit={currentVar.unit}
            radiusKm={radiusKm}
            isRadiusLocked={isRadiusLocked}
            horizonMonths={horizonMonths}
            modelType={modelType}
            forecast={forecast}
          />
        </div>
      </div>
    </div>
  );
}
