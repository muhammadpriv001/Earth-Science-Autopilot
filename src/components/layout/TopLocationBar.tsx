'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@/context/LocationContext';
import { useAuth, SavedInvestigation } from '@/context/AuthAndInvestigationContext';
import {
  Search,
  MapPin,
  Lock,
  Unlock,
  Sliders,
  ChevronDown,
  Cloud,
  BookmarkCheck,
  Check,
  X,
  Compass,
  User,
  Settings,
  LogOut,
  FolderOpen,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const QUICK_PRESETS = [
  { name: 'Lahore, Pakistan', coords: [74.3587, 31.5204] as [number, number], radius: 50 },
  { name: 'Amazon Basin, Brazil', coords: [-57.5, -10.0] as [number, number], radius: 250 },
  { name: 'Arctic Ocean', coords: [0.0, 85.0] as [number, number], radius: 500 },
  { name: 'Sahel Belt, Africa', coords: [15.0, 14.5] as [number, number], radius: 200 },
  { name: 'California, USA', coords: [-121.5, 38.5] as [number, number], radius: 100 },
];

const RADIUS_OPTIONS = [10, 25, 50, 100, 250, 500];

export function TopLocationBar() {
  const router = useRouter();
  const { mainLocation, setMainLocation, setAsMainLocation, toggleRadiusLock, setRadiusKm } = useLocation();
  const { user, isAuthenticated, signOut, saveInvestigation, savedInvestigations } = useAuth();

  const [query, setQuery] = useState(mainLocation.name || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [radiusDropdownOpen, setRadiusDropdownOpen] = useState(false);

  // Save Modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const radiusRef = useRef<HTMLDivElement>(null);

  // Sync input value whenever mainLocation.name changes from elsewhere (e.g. map click)
  useEffect(() => {
    if (mainLocation.name) {
      setQuery(mainLocation.name);
    }
  }, [mainLocation.name]);

  // Handle autocomplete with debounce
  useEffect(() => {
    if (!query || query.trim().length < 2 || !dropdownOpen) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, dropdownOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (radiusRef.current && !radiusRef.current.contains(e.target as Node)) {
        setRadiusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (item: any) => {
    setAsMainLocation(
      item.displayName,
      [item.lon, item.lat],
      mainLocation.radiusKm,
      item.boundingBox
    );
    setQuery(item.displayName);
    setDropdownOpen(false);
  };

  const handleSelectPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setAsMainLocation(preset.name, preset.coords, preset.radius);
    setQuery(preset.name);
  };

  const handleTriggerSave = () => {
    setSaveTitle(`Investigation: ${mainLocation.name.split(',')[0]} (${new Date().toLocaleDateString()})`);
    setSaveNotes(`Geospatial research footprint locked at ${mainLocation.coordinates[1].toFixed(4)}°N, ${mainLocation.coordinates[0].toFixed(4)}°E with ${mainLocation.radiusKm} km radius.`);
    setSaveSuccessMsg('');
    setSaveModalOpen(true);
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveInvestigation({
      title: saveTitle,
      mainLocation,
      notes: saveNotes,
    });
    setSaveSuccessMsg('Investigation saved successfully to your profile!');
    setTimeout(() => {
      setSaveModalOpen(false);
      setSaveSuccessMsg('');
    }, 1200);
  };

  return (
    <>
      <div className="w-full bg-[#06211b] border-b border-emerald-900/60 backdrop-blur-xl sticky top-0 z-[120] px-3 sm:px-6 py-2 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="mx-auto max-w-6xl flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
          {/* LEFT: Main Location Search Bar (Google Maps style) */}
          <div className="flex-1 min-w-0 max-w-md relative" ref={searchRef}>
            <div className="relative flex items-center rounded-xl border border-emerald-500/30 bg-[#0b2b23]/90 shadow-inner hover:border-emerald-400/60 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/40 transition-all">
              <div className="pl-3 pr-2 text-emerald-400 flex items-center">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search city, coordinates, country or biome..."
                className="w-full bg-transparent py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Radius / Proximity Pill inside Search Bar */}
              <div className="relative border-l border-slate-800 pl-2 pr-2" ref={radiusRef}>
                <button
                  type="button"
                  onClick={() => setRadiusDropdownOpen(!radiusDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 px-2 py-1 text-[11px] font-medium text-emerald-300 transition-colors"
                  title="Analysis Radius / Proximity"
                >
                  <span className="font-mono">{mainLocation.radiusKm} km</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {/* Radius Dropdown */}
                {radiusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-slate-700 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-[130]">
                    <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Proximity Radius
                    </div>
                    {RADIUS_OPTIONS.map(km => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => {
                          setRadiusKm(km);
                          setRadiusDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-left transition-colors ${
                          mainLocation.radiusKm === km
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{km} km</span>
                        {mainLocation.radiusKm === km && <Check className="h-3 w-3 text-emerald-300" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Radius Lock/Unlock button */}
              <button
                type="button"
                onClick={toggleRadiusLock}
                className={`p-2 mr-1 rounded-lg transition-colors ${
                  mainLocation.isRadiusLocked
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={mainLocation.isRadiusLocked ? 'Radius locked' : 'Click to lock radius'}
              >
                {mainLocation.isRadiusLocked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Unlock className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Autocomplete Dropdown List */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden z-[130] max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    Searching global database...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-1">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectLocation(item)}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors border-b border-slate-800/40 last:border-b-0"
                      >
                        <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate">
                            {item.displayName.split(',')[0]}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.displayName}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
                            {item.lat.toFixed(4)}°N, {item.lon.toFixed(4)}°E
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query.trim().length >= 2 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No exact coordinates match &quot;{query}&quot;. Try a nearby city or country name.
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Quick Benchmark Presets
                    </div>
                    {QUICK_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleSelectPreset(preset);
                          setDropdownOpen(false);
                        }}
                        className="w-full px-2 py-1.5 text-left rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{preset.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {preset.radius} km
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CENTER: Coordinates & Active Footprint Badge */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-xs shrink-0">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300">
              <span className="text-emerald-400">Lat:</span> {mainLocation.coordinates[1].toFixed(4)}°
              <span className="text-emerald-400 ml-1">Lng:</span> {mainLocation.coordinates[0].toFixed(4)}°
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-950/30 px-2 py-1 text-[11px] font-semibold text-emerald-300">
              <span>ACTIVE FOOTPRINT</span>
            </div>
          </div>

          {/* RIGHT: Quick Presets, Save Button & User Profile Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Presets Pills (Medium+ screens) */}
            <div className="hidden lg:flex items-center gap-1">
              {QUICK_PRESETS.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                    mainLocation.name.includes(p.name.split(',')[0])
                      ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {p.name.split(',')[0]}
                </button>
              ))}
            </div>

            {/* SAVE INVESTIGATION BUTTON: Warm Orange CTA */}
            <button
              type="button"
              onClick={handleTriggerSave}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
              title="Save current investigation, location and chat state"
            >
              <Cloud className="h-3.5 w-3.5 text-white" />
              <span className="hidden sm:inline">Save Investigation</span>
            </button>

            {/* USER PROFILE PILL */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 p-1.5 sm:px-2.5 sm:py-1.5 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-emerald-400/40"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user?.name || 'Guest User'}
                  </span>
                  <span className="text-[10px] text-emerald-400 leading-tight">
                    {savedInvestigations.length} Projects
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl z-[140]">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <div className="text-xs font-bold text-white">{user?.name || 'Guest Researcher'}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email || 'guest@spacegeoai.com'}</div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-1">{user?.role || 'Lead Researcher'}</div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-emerald-400" />
                      Researcher Profile
                    </Link>
                    <Link
                      href="/profile?tab=investigations"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                      Saved Investigations ({savedInvestigations.length})
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      Platform Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-800/80 mt-1.5 pt-1.5">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          setProfileDropdownOpen(false);
                          router.push('/');
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    ) : (
                      <Link
                        href="/auth/sign-in"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-400/30 px-2.5 py-1.5 text-xs font-semibold hover:bg-orange-500/30 transition-colors"
                      >
                        Sign In / Register
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SAVE INVESTIGATION MODAL */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Save Current Investigation</h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!user ? (
              <div className="space-y-4 py-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mx-auto border border-amber-500/30 shadow-lg shadow-amber-500/10">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="text-center space-y-1.5">
                  <h4 className="text-sm font-bold text-white">Researcher Registration Required</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    Guest researchers can explore global datasets, compute Mann-Kendall statistics, and test forecasts freely. However, persisting investigations to your cloud research portfolio requires a registered account.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setSaveModalOpen(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500"
                  >
                    <span>Create Free Researcher Account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setSaveModalOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <span>Sign In to Existing Account</span>
                  </Link>
                </div>
              </div>
            ) : saveSuccessMsg ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center">
                <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-emerald-300">{saveSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleConfirmSave} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Investigation Title
                  </label>
                  <input
                    type="text"
                    required
                    value={saveTitle}
                    onChange={e => setSaveTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Location Snapshot
                  </label>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs space-y-1 font-mono">
                    <div className="text-white font-semibold truncate">{mainLocation.name}</div>
                    <div className="text-emerald-400 text-[11px]">
                      {mainLocation.coordinates[1].toFixed(4)}°N, {mainLocation.coordinates[0].toFixed(4)}°E (Radius: {mainLocation.radiusKm} km)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Scientific Notes / Hypothesis
                  </label>
                  <textarea
                    rows={3}
                    value={saveNotes}
                    onChange={e => setSaveNotes(e.target.value)}
                    placeholder="Add observations, detected trends, or next steps..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500"
                  >
                    Confirm & Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
