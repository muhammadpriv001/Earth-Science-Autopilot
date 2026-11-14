'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GeographicRegion } from '@/types';
import {
  MapPin,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Sliders,
  Crosshair,
  Compass,
  Globe2,
} from 'lucide-react';

interface Props {
  selectedRegion: GeographicRegion;
  onRegionSelect: (region: GeographicRegion) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  isRadiusLocked: boolean;
  onToggleRadiusLock: () => void;
}

const BASEMAP_TILES = {
  osm: {
    name: 'OpenStreetMap (Free)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
    maxNativeZoom: 19,
    className: '',
  },
  dark: {
    name: 'Dark Basemap',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    subdomains: '',
    maxZoom: 19,
    maxNativeZoom: 16,
    className: '',
  },
  cyberDark: {
    name: 'Cyber Dark (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
    maxNativeZoom: 19,
    className: 'dark-tiles',
  },
  satellite: {
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    subdomains: '',
    maxZoom: 19,
    maxNativeZoom: 18,
    className: '',
  },
};

export function MapLibreMap({
  selectedRegion,
  onRegionSelect,
  radiusKm,
  onRadiusChange,
  isRadiusLocked,
  onToggleRadiusLock,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const refLayerRef = useRef<any>(null);

  const [basemapType, setBasemapType] = useState<'osm' | 'dark' | 'cyberDark' | 'satellite'>('osm');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Dynamically Load Leaflet in Browser
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletReady(true);
      return;
    }

    // Add Leaflet CSS if not already in document
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Add Leaflet JS with fallback CDN
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.async = true;
      script.onload = () => {
        setLeafletReady(true);
      };
      script.onerror = () => {
        // Fallback to cdnjs if unpkg is slow or blocked
        console.warn('Primary Leaflet CDN failed, trying cdnjs...');
        const fallback = document.createElement('script');
        fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        fallback.crossOrigin = '';
        fallback.async = true;
        fallback.onload = () => setLeafletReady(true);
        document.head.appendChild(fallback);
      };
      document.head.appendChild(script);
    }

    const checkTimer = setInterval(() => {
      if ((window as any).L) {
        setLeafletReady(true);
        clearInterval(checkTimer);
      }
    }, 150);

    return () => clearInterval(checkTimer);
  }, []);

  // Compute Bounding Box from Center and Radius
  const calculateBBox = useCallback((center: [number, number], radiusInKm: number): number[] => {
    const [lng, lat] = center;
    const dLat = radiusInKm / 111.32;
    const dLng = radiusInKm / (111.32 * Math.cos((lat * Math.PI) / 180) || 1);
    return [
      parseFloat((lng - dLng).toFixed(4)),
      parseFloat((lat - dLat).toFixed(4)),
      parseFloat((lng + dLng).toFixed(4)),
      parseFloat((lat + dLat).toFixed(4)),
    ];
  }, []);

  // Update Region Center Callback with instant coord update + async Nominatim reverse geocoding
  const handleLocationUpdate = useCallback(
    (lat: number, lng: number, placeName?: string) => {
      const coords: [number, number] = [parseFloat(lng.toFixed(4)), parseFloat(lat.toFixed(4))];
      const bbox = calculateBBox(coords, radiusKm);

      // Clean instant location label while reverse lookup is in flight
      const initialName =
        placeName ||
        `Location (${lat >= 0 ? `${lat.toFixed(3)}°N` : `${Math.abs(lat).toFixed(3)}°S`}, ${
          lng >= 0 ? `${lng.toFixed(3)}°E` : `${Math.abs(lng).toFixed(3)}°W`
        })`;

      // 1. Immediately update region state so UI and AI assistant react instantly
      onRegionSelect({
        name: initialName,
        geometryType: 'point',
        coordinates: coords,
        center: coords,
        bbox,
        areaKm2: Math.round(Math.PI * radiusKm * radiusKm),
      });

      if (placeName) {
        setSearchQuery(placeName);
        return;
      }

      setSearchQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);

      // 2. Fetch human place name from free OpenStreetMap Nominatim reverse geocoding
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      fetch(`/api/locations/reverse?lat=${lat}&lon=${lng}`, {
        signal: abortControllerRef.current.signal,
      })
        .then(res => res.json())
        .then(data => {
          if (data?.displayName) {
            setSearchQuery(data.displayName);
            onRegionSelect({
              name: data.displayName,
              geometryType: 'point',
              coordinates: coords,
              center: coords,
              bbox,
              areaKm2: Math.round(Math.PI * radiusKm * radiusKm),
            });
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.warn('Reverse geocoding error:', err);
          }
        });
    },
    [calculateBBox, onRegionSelect, radiusKm]
  );

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const [lng, lat] = selectedRegion.center;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 6,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // Add Tile Layer
    const activeTile = BASEMAP_TILES[basemapType];
    tileLayerRef.current = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      subdomains: activeTile.subdomains || 'abc',
      maxZoom: activeTile.maxZoom || 19,
      maxNativeZoom: activeTile.maxNativeZoom || 19,
      className: activeTile.className || '',
    }).addTo(map);

    if (basemapType === 'dark') {
      refLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          maxNativeZoom: 16,
        }
      ).addTo(map);
    }

    // Custom Glowing Radar DivIcon with high contrast on OpenStreetMap
    const customIcon = L.divIcon({
      className: 'custom-radar-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(2, 132, 199, 0.35); border: 2.5px solid #0284c7; box-shadow: 0 0 14px rgba(2, 132, 199, 0.9), 0 3px 8px rgba(0,0,0,0.65);"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #ffffff; border: 2.5px solid #0284c7; box-shadow: 0 0 8px #0284c7;"></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    // Add Marker
    const marker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      handleLocationUpdate(pos.lat, pos.lng);
    });

    // Add Proximity Circle Buffer
    const circle = L.circle([lat, lng], {
      radius: radiusKm * 1000,
      color: isRadiusLocked ? '#0284c7' : '#0ea5e9',
      fillColor: '#0284c7',
      fillOpacity: 0.22,
      weight: isRadiusLocked ? 3 : 2,
      dashArray: isRadiusLocked ? undefined : '5, 5',
    }).addTo(map);
    circleRef.current = circle;

    // Map Click Handler
    map.on('click', (e: any) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      circle.setLatLng([clickLat, clickLng]);
      handleLocationUpdate(clickLat, clickLng);
    });

    // Multiple invalidateSize calls to guarantee tile painting after DOM mount
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) resizeObserver.disconnect();
      if (refLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(refLayerRef.current);
        refLayerRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletReady]);

  // 3. Synchronize Center & Radius Updates with Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;

    const [lng, lat] = selectedRegion.center;
    const currentLatLng = markerRef.current.getLatLng();

    if (
      Math.abs(currentLatLng.lat - lat) > 0.0001 ||
      Math.abs(currentLatLng.lng - lng) > 0.0001
    ) {
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.6 });
    }

    circleRef.current.setRadius(radiusKm * 1000);
    circleRef.current.setStyle({
      color: isRadiusLocked ? '#0284c7' : '#0ea5e9',
      weight: isRadiusLocked ? 3 : 2,
      dashArray: isRadiusLocked ? undefined : '5, 5',
    });
  }, [selectedRegion.center, radiusKm, isRadiusLocked]);

  // 4. Switch Basemap Tiles
  const handleBasemapChange = (type: 'osm' | 'dark' | 'cyberDark' | 'satellite') => {
    setBasemapType(type);
    if (!mapInstanceRef.current || !(window as any).L) return;

    const L = (window as any).L;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (refLayerRef.current) {
      mapInstanceRef.current.removeLayer(refLayerRef.current);
      refLayerRef.current = null;
    }

    const targetTile = BASEMAP_TILES[type];
    tileLayerRef.current = L.tileLayer(targetTile.url, {
      attribution: targetTile.attribution,
      subdomains: targetTile.subdomains || 'abc',
      maxZoom: targetTile.maxZoom || 19,
      maxNativeZoom: targetTile.maxNativeZoom || 19,
      className: targetTile.className || '',
    }).addTo(mapInstanceRef.current);

    // If ESRI Dark, also add crisp labels layer
    if (type === 'dark') {
      refLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          maxNativeZoom: 16,
        }
      ).addTo(mapInstanceRef.current);
    }
  };

  // 5. Geocoding Search Handler
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
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setSearchResults([]);
    setSearchQuery(place.displayName);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 8, { animate: true, duration: 1.2 });
    }
    handleLocationUpdate(lat, lon, place.displayName.split(',')[0]);
  };

  return (
    <div className="relative w-full h-full min-h-[560px] rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search Input Box */}
        <div className="pointer-events-auto relative w-72 sm:w-80">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search city, lake, coordinate..."
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/85 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 shadow-xl backdrop-blur-xl focus:border-cyan-500 focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            {isSearching && (
              <div className="absolute right-3.5 top-3 h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-2xl z-30">
              {searchResults.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocation(r)}
                  className="w-full text-left rounded-xl p-2 hover:bg-slate-800/80 text-xs text-slate-200 transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{r.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Basemap Style Switcher Pills */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-950/85 p-1 shadow-xl backdrop-blur-xl">
          {(['osm', 'dark', 'cyberDark', 'satellite'] as const).map(style => (
            <button
              key={style}
              onClick={() => handleBasemapChange(style)}
              className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-colors capitalize ${
                basemapType === style
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {style === 'osm'
                ? 'OpenStreetMap'
                : style === 'dark'
                ? 'Dark Map'
                : style === 'cyberDark'
                ? 'Cyber Dark'
                : 'Satellite'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[460px]">
        {!leafletReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
            <Globe2 className="h-8 w-8 text-cyan-400 animate-spin-slow" />
            <p className="text-xs">Loading OpenStreetMap Geolocation Tiles...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full h-full min-h-[460px] z-0"
          style={{ minHeight: '460px', height: '100%', width: '100%' }}
        />
      </div>

      {/* Bottom Proximity & Radius Lock Bar */}
      <div className="relative z-10 border-t border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        {/* Selected Coordinates & Name Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 shrink-0">
            <Crosshair className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{selectedRegion.name}</span>
              {isRadiusLocked && (
                <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.2 text-[9px] font-bold text-cyan-300 flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> LOCKED RADIUS
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Lat: <span className="text-cyan-300">{selectedRegion.center[1].toFixed(4)}°</span>, Lng:{' '}
              <span className="text-cyan-300">{selectedRegion.center[0].toFixed(4)}°</span> | Footprint:{' '}
              <span className="text-slate-200">~{Math.round(Math.PI * radiusKm * radiusKm).toLocaleString()} km²</span>
            </div>
          </div>
        </div>

        {/* Proximity Radius Slider & Lock Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Proximity:</span>
            <span className="font-mono font-bold text-cyan-300 w-16 text-right">{radiusKm} km</span>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              disabled={isRadiusLocked}
              value={radiusKm}
              onChange={e => onRadiusChange(parseInt(e.target.value, 10))}
              className={`w-28 sm:w-36 accent-cyan-400 cursor-pointer ${
                isRadiusLocked ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Quick Radius Chips */}
          <div className="hidden sm:flex items-center gap-1">
            {[25, 50, 100, 250, 500].map(r => (
              <button
                key={r}
                disabled={isRadiusLocked}
                onClick={() => onRadiusChange(r)}
                className={`rounded-lg px-2 py-1 text-[10px] font-mono transition-colors ${
                  radiusKm === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                } ${isRadiusLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {r}km
              </button>
            ))}
          </div>

          {/* Lock/Unlock Button */}
          <button
            type="button"
            onClick={onToggleRadiusLock}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shadow-md ${
              isRadiusLocked
                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
            title={isRadiusLocked ? 'Unlock proximity radius' : 'Lock proximity radius'}
          >
            {isRadiusLocked ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Unlock className="h-3.5 w-3.5" />
                <span>Lock Radius</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
