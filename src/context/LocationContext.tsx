'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GeographicRegion } from '@/types';

export interface LocationState {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  radiusKm: number;
  isRadiusLocked: boolean;
  boundingBox?: [number, number, number, number] | null; // [minLng, minLat, maxLng, maxLat]
}

interface LocationContextType {
  mainLocation: LocationState;
  setMainLocation: (location: Partial<LocationState> | ((prev: LocationState) => LocationState)) => void;
  secondaryLocation: LocationState;
  setSecondaryLocation: (location: Partial<LocationState> | ((prev: LocationState) => LocationState)) => void;
  setRadiusKm: (radiusKm: number) => void;
  toggleRadiusLock: () => void;
  setAsMainLocation: (name: string, coordinates: [number, number], radiusKm?: number, bbox?: [number, number, number, number] | null) => void;
  setAsSecondaryLocation: (name: string, coordinates: [number, number], radiusKm?: number) => void;
}

const DEFAULT_MAIN: LocationState = {
  name: 'Lahore, Punjab, Pakistan',
  coordinates: [74.3587, 31.5204],
  radiusKm: 100,
  isRadiusLocked: false,
  boundingBox: [74.15, 31.35, 74.55, 31.70],
};

const DEFAULT_SECONDARY: LocationState = {
  name: 'Northern Hemisphere Arctic Ocean',
  coordinates: [0.0, 85.0],
  radiusKm: 250,
  isRadiusLocked: true,
  boundingBox: [-180, 75, 180, 90],
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [mainLocation, setMainLocationState] = useState<LocationState>(DEFAULT_MAIN);
  const [secondaryLocation, setSecondaryLocationState] = useState<LocationState>(DEFAULT_SECONDARY);

  // Load from localStorage on mount and fetch user's current location for primary location
  useEffect(() => {
    try {
      const savedMain = localStorage.getItem('esa_main_location');
      if (savedMain) {
        setMainLocationState(JSON.parse(savedMain));
      }
      const savedSec = localStorage.getItem('esa_secondary_location');
      if (savedSec) {
        setSecondaryLocationState(JSON.parse(savedSec));
      }
    } catch {
      // Ignore localStorage errors
    }

    // On startup, fetch user's current location for primary location
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`/api/locations/reverse?lat=${latitude}&lon=${longitude}`);
            let locationName = `Current Location (${latitude >= 0 ? `${latitude.toFixed(2)}°N` : `${Math.abs(latitude).toFixed(2)}°S`}, ${longitude >= 0 ? `${longitude.toFixed(2)}°E` : `${Math.abs(longitude).toFixed(2)}°W`})`;
            let bbox: [number, number, number, number] | undefined = undefined;

            if (res.ok) {
              const data = await res.json();
              if (data.displayName) {
                locationName = data.displayName;
              }
              if (data.bbox) {
                bbox = data.bbox;
              }
            }

            const newLoc: LocationState = {
              name: locationName,
              coordinates: [longitude, latitude],
              radiusKm: 100,
              isRadiusLocked: false,
              boundingBox: bbox || [longitude - 0.2, latitude - 0.2, longitude + 0.2, latitude + 0.2],
            };
            setMainLocationState(newLoc);
            try {
              localStorage.setItem('esa_main_location', JSON.stringify(newLoc));
            } catch {}
          } catch (err) {
            console.warn('Geolocation reverse geocoding error:', err);
          }
        },
        (error) => {
          console.debug('Geolocation startup check:', error.message);
        },
        { timeout: 8000, maximumAge: 600000 }
      );
    }
  }, []);

  const setMainLocation = (
    update: Partial<LocationState> | ((prev: LocationState) => LocationState)
  ) => {
    setMainLocationState(prev => {
      const next = typeof update === 'function' ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem('esa_main_location', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setSecondaryLocation = (
    update: Partial<LocationState> | ((prev: LocationState) => LocationState)
  ) => {
    setSecondaryLocationState(prev => {
      const next = typeof update === 'function' ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem('esa_secondary_location', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setRadiusKm = (radiusKm: number) => {
    setMainLocation(prev => ({ ...prev, radiusKm }));
  };

  const toggleRadiusLock = () => {
    setMainLocation(prev => ({ ...prev, isRadiusLocked: !prev.isRadiusLocked }));
  };

  const setAsMainLocation = (
    name: string,
    coordinates: [number, number],
    radiusKm?: number,
    bbox?: [number, number, number, number] | null
  ) => {
    setMainLocation(prev => ({
      ...prev,
      name,
      coordinates,
      radiusKm: radiusKm !== undefined ? radiusKm : prev.radiusKm,
      boundingBox: bbox !== undefined ? bbox : prev.boundingBox,
    }));
  };

  const setAsSecondaryLocation = (
    name: string,
    coordinates: [number, number],
    radiusKm?: number
  ) => {
    setSecondaryLocation(prev => ({
      ...prev,
      name,
      coordinates,
      radiusKm: radiusKm !== undefined ? radiusKm : prev.radiusKm,
    }));
  };

  return (
    <LocationContext.Provider
      value={{
        mainLocation,
        setMainLocation,
        secondaryLocation,
        setSecondaryLocation,
        setRadiusKm,
        toggleRadiusLock,
        setAsMainLocation,
        setAsSecondaryLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
