'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import { RegionalComparisonResult } from '@/types';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthAndInvestigationContext';
import {
  GitCompare,
  MapPin,
  RefreshCw,
  ArrowRight,
  Search,
  Check,
  ChevronDown,
  Trees,
  CloudSun,
  Droplets,
  Activity,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

const PRESET_LOCATIONS_B = [
  { name: 'Northern Hemisphere Arctic Ocean', coords: [0.0, 85.0] as [number, number] },
  { name: 'Southern Amazon Basin, Brazil', coords: [-57.5, -10.0] as [number, number] },
  { name: 'Sahel Semi-Arid Belt, Africa', coords: [15.0, 14.5] as [number, number] },
  { name: 'California Sierra Foothills, USA', coords: [-121.5, 38.5] as [number, number] },
  { name: 'Lahore, Punjab, Pakistan', coords: [74.3587, 31.5204] as [number, number] },
];

export default function ComparePage() {
  const { mainLocation, secondaryLocation, setAsSecondaryLocation } = useLocation();
  const { saveInvestigation } = useAuth();

  // Secondary location search state
  const [queryB, setQueryB] = useState(secondaryLocation.name || 'Northern Hemisphere Arctic Ocean');
  const [suggestionsB, setSuggestionsB] = useState<any[]>([]);
  const [isSearchingB, setIsSearchingB] = useState(false);
  const [dropdownOpenB, setDropdownOpenB] = useState(false);
  const searchBRef = useRef<HTMLDivElement>(null);

  // Comparison State
  const [comparison, setComparison] = useState<RegionalComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedVariable, setSelectedVariable] = useState('air-temperature');

  // Autocomplete for Secondary Location B
  useEffect(() => {
    if (!queryB || queryB.trim().length < 2 || !dropdownOpenB) {
      setSuggestionsB([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingB(true);
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(queryB)}`);
        const data = await res.json();
        setSuggestionsB(data.results || []);
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsSearchingB(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [queryB, dropdownOpenB]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBRef.current && !searchBRef.current.contains(e.target as Node)) {
        setDropdownOpenB(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocationB = (loc: any) => {
    setAsSecondaryLocation(loc.displayName, [loc.lon, loc.lat], 25);
    setQueryB(loc.displayName);
    setDropdownOpenB(false);
  };

  const handleSelectPresetB = (preset: typeof PRESET_LOCATIONS_B[0]) => {
    setAsSecondaryLocation(preset.name, preset.coords, 50);
    setQueryB(preset.name);
    setDropdownOpenB(false);
  };

  const runComparison = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/analysis/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableId: selectedVariable,
          regionA: {
            name: mainLocation.name,
            geometryType: 'point',
            coordinates: mainLocation.coordinates,
            center: mainLocation.coordinates,
          },
          regionB: {
            name: secondaryLocation.name,
            geometryType: 'point',
            coordinates: secondaryLocation.coordinates,
            center: secondaryLocation.coordinates,
          },
          startDate: '1994-01-01',
          endDate: '2024-12-31',
        }),
      });
      const data = await res.json();
      if (res.ok && data.comparison) {
        setComparison(data.comparison);
      } else {
        setComparison(null);
        setErrorMsg(data.error || 'Live comparison data is unavailable for these regions.');
      }
    } catch (err) {
      console.error(err);
      setComparison(null);
      setErrorMsg('Live comparison data could not be retrieved.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [mainLocation.name, secondaryLocation.name, selectedVariable]);

  return (
    <div className="mx-auto max-w-[1920px] px-3 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <GitCompare className="h-4 w-4" /> Multi-Region Divergence Laboratory
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            Regional Environmental Trend Comparison
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-mono font-bold text-emerald-800">
              Dual-Region Divergence
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Compare environmental trends, vegetation phenology, and climate sensitivities between Primary Region A and Comparative Region B to detect spatial divergence or resilience.
          </p>
        </div>

        <Link
          href="/analysis"
          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all"
        >
          Back to Single-Region Analysis →
        </Link>
      </div>

      {/* SECONDARY LOCATION SELECTOR BAR: Pure White Neomorphic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md">
        {/* Primary Region A Display (Inherited from Main Location Selector) */}
        <div className="lg:col-span-5 rounded-2xl border border-teal-200/80 bg-[#f8faf9] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-600" /> Primary Region (A)
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">Locked to Main Search</span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">{mainLocation.name}</div>
          <div className="text-[11px] font-mono text-teal-700 font-semibold">
            {mainLocation.coordinates[1].toFixed(4)}°N, {mainLocation.coordinates[0].toFixed(4)}°E (Radius: {mainLocation.radiusKm} km)
          </div>
        </div>

        {/* COMPARATIVE REGION B SELECTOR (Interactive Search & Presets) */}
        <div className="lg:col-span-7 rounded-2xl border border-orange-200/80 bg-orange-50/30 p-4 space-y-2.5" ref={searchBRef}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-orange-600" /> Comparative Region (B)
            </span>
            <div className="flex items-center gap-1.5">
              {PRESET_LOCATIONS_B.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPresetB(p)}
                  className={`rounded-xl px-2.5 py-1 text-[10px] font-bold transition-all ${
                    secondaryLocation.name.includes(p.name.split(',')[0])
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs'
                  }`}
                >
                  {p.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
              <Search className="h-4 w-4 text-orange-600 mr-2 shrink-0" />
              <input
                type="text"
                value={queryB}
                onChange={e => {
                  setQueryB(e.target.value);
                  setDropdownOpenB(true);
                }}
                onFocus={() => setDropdownOpenB(true)}
                placeholder="Search secondary comparison location (e.g. Arctic Ocean, Amazon Basin, California)..."
                className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Dropdown Suggestions for Secondary Location */}
            {dropdownOpenB && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-2xl overflow-hidden z-[130] max-h-60 overflow-y-auto">
                {isSearchingB ? (
                  <div className="p-3 text-center text-xs text-orange-600 flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
                    Searching comparison locations...
                  </div>
                ) : suggestionsB.length > 0 ? (
                  <div className="py-1">
                    {suggestionsB.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectLocationB(item)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <MapPin className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {item.displayName.split(',')[0]}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {item.displayName}
                          </div>
                          <div className="text-[10px] font-mono text-orange-600 font-semibold mt-0.5">
                            {item.lat.toFixed(4)}°N, {item.lon.toFixed(4)}°E
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Popular Benchmark Comparisons
                    </div>
                    {PRESET_LOCATIONS_B.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleSelectPresetB(preset);
                          setDropdownOpenB(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                      >
                        <span>{preset.name}</span>
                        <span className="font-mono text-[10px] text-orange-600 font-bold">Select →</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: MULTI-VARIABLE DIVERGENCE CHART & STATISTICS */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Multi-Variable Trend Divergence &amp; Statistical Contrast
              </h2>
              <p className="text-[11px] text-slate-500">
                Contrast rates of change between Region A and Region B using audited Mann-Kendall statistics.
              </p>
            </div>
          </div>
        </div>

        {comparison ? (
          <div className="space-y-4">
            <ComparisonChart comparison={comparison} />

            {/* Contrast Metrics Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-2xl border border-teal-200/80 bg-[#f8faf9] p-4">
                <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Region A Trend Rate
                </div>
                <div className="text-lg font-black font-mono text-slate-900 mt-1">
                  {comparison.regionA.trend.sensSlopePerYear > 0 ? '+' : ''}
                  {comparison.regionA.trend.sensSlopePerYear.toFixed(3)}{' '}
                  <span className="text-xs text-slate-500 font-sans font-normal">{comparison.variable?.unit || 'units'}/yr</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  MK Z = {comparison.regionA.trend.mannKendallZ.toFixed(2)} ({comparison.regionA.trend.trendDirection})
                </div>
              </div>

              <div className="rounded-2xl border border-orange-200/80 bg-[#f8faf9] p-4">
                <div className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                  Region B Trend Rate
                </div>
                <div className="text-lg font-black font-mono text-slate-900 mt-1">
                  {comparison.regionB.trend.sensSlopePerYear > 0 ? '+' : ''}
                  {comparison.regionB.trend.sensSlopePerYear.toFixed(3)}{' '}
                  <span className="text-xs text-slate-500 font-sans font-normal">{comparison.variable?.unit || 'units'}/yr</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  MK Z = {comparison.regionB.trend.mannKendallZ.toFixed(2)} ({comparison.regionB.trend.trendDirection})
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-200/80 bg-[#f8faf9] p-4">
                <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Divergence Metric (Δ Slope)
                </div>
                <div className="text-lg font-black font-mono text-indigo-700 mt-1">
                  {comparison.divergenceSummary.rateDifference > 0 ? '+' : ''}
                  {comparison.divergenceSummary.rateDifference.toFixed(3)}{' '}
                  <span className="text-xs text-slate-500 font-sans font-normal">{comparison.variable?.unit || 'units'}/yr</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  {comparison.divergenceSummary.scientificInterpretation}
                </div>
              </div>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">Live comparison unavailable:</strong> {errorMsg} No benchmark
            series are substituted.
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-emerald-700">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Computing regional trend divergence from live measurements...
          </div>
        )}
      </section>

      {/* SECTION 2: VEGETATION & BIOSPHERE COMPARATIVE SECTION */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trees className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Vegetation Dynamics &amp; Biosphere Contrast
              </h2>
              <p className="text-[11px] text-slate-500">
                Comparing photosynthetic growing season profiles, VCI drought vulnerability, and canopy density between both regions.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Trees className="h-4 w-4 text-amber-500" />
            Live vegetation comparison is not available
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Summer peak NDVI, growing-season duration, VCI drought status and greening/browning rates
            require MODIS/VIIRS vegetation-index products. No keyless live NDVI source is currently
            configured, so these comparative metrics are not shown rather than filled with benchmark
            values.
          </p>
        </div>
      </section>

      {/* SECTION 3: TIME-STAMPED SATELLITE VISUAL COMPARISON ACROSS BOTH REGIONS */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Side-by-Side Satellite Earth-Observation Visual Comparator
              </h2>
              <p className="text-[11px] text-slate-500">
                Visualizing landscape transformations between Region A and Region B across time-stamped epochs.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Eye className="h-4 w-4 text-amber-500" />
            Satellite visual comparator is not connected
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Region A ({mainLocation.name}) and Region B ({secondaryLocation.name}) surface-reflectance
            mosaics require an authenticated NASA Earthdata or Copernicus download. No imagery or
            interpreted land-cover change is shown until that connection is configured.
          </p>
        </div>
      </section>
    </div>
  );
}
