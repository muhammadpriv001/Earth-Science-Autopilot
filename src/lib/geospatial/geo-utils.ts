// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — GEOSPATIAL UTILITIES
// ==============================================================================

import { GeographicRegion } from '@/types';

/**
 * Calculates the bounding box [minLng, minLat, maxLng, maxLat] for any GeographicRegion
 */
export function getBoundingBox(region: GeographicRegion): [number, number, number, number] {
  if (region.geometryType === 'bbox' && Array.isArray(region.coordinates) && region.coordinates.length === 4) {
    return region.coordinates as [number, number, number, number];
  }

  if (region.geometryType === 'point') {
    const [lng, lat] = region.center;
    // Buffer by ~0.1 deg (~11 km)
    const delta = 0.1;
    return [lng - delta, lat - delta, lng + delta, lat + delta];
  }

  if (region.geometryType === 'buffer' && region.radiusKm) {
    const [lng, lat] = region.center;
    // 1 deg lat ~ 111 km, 1 deg lng ~ 111 * cos(lat) km
    const latDelta = region.radiusKm / 111.0;
    const lngDelta = region.radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180.0));
    return [lng - lngDelta, lat - latDelta, lng + lngDelta, lat + latDelta];
  }

  if (region.geometryType === 'polygon' && Array.isArray(region.coordinates)) {
    const coords = region.coordinates as number[][];
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    for (const pt of coords) {
      if (Array.isArray(pt) && pt.length >= 2) {
        minLng = Math.min(minLng, pt[0]);
        minLat = Math.min(minLat, pt[1]);
        maxLng = Math.max(maxLng, pt[0]);
        maxLat = Math.max(maxLat, pt[1]);
      }
    }
    return [minLng, minLat, maxLng, maxLat];
  }

  return [-180, -90, 180, 90];
}

/**
 * Calculates Haversine great-circle distance between two coordinates in kilometers
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats coordinates into standard human-readable DMS or decimal degrees string
 */
export function formatCoordinates(lng: number, lat: number): string {
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

