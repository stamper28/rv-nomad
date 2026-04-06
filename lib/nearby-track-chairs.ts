// Utility to find track chair locations near a campsite within a given radius
import { TRACK_CHAIR_LOCATIONS, type TrackChairLocation } from "./track-chair-data";

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @returns distance in miles
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NearbyTrackChair extends TrackChairLocation {
  distanceMiles: number;
  /** Google Maps directions URL from campsite to track chair park */
  directionsUrl: string;
}

/**
 * Find track chair locations within a given radius of a campsite
 * @param latitude - campsite latitude
 * @param longitude - campsite longitude
 * @param radiusMiles - search radius in miles (default 75)
 * @returns array of nearby track chair locations sorted by distance
 */
export function findNearbyTrackChairs(
  latitude: number,
  longitude: number,
  radiusMiles: number = 75
): NearbyTrackChair[] {
  const nearby: NearbyTrackChair[] = [];

  for (const location of TRACK_CHAIR_LOCATIONS) {
    const distance = haversineDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );

    if (distance <= radiusMiles) {
      // Build Google Maps directions URL from campsite to track chair park
      const directionsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${location.latitude},${location.longitude}`;
      nearby.push({
        ...location,
        distanceMiles: Math.round(distance * 10) / 10,
        directionsUrl,
      });
    }
  }

  // Sort by distance (closest first)
  nearby.sort((a, b) => a.distanceMiles - b.distanceMiles);

  return nearby;
}

/**
 * Check if any track chairs are available near a campsite
 */
export function hasNearbyTrackChairs(
  latitude: number,
  longitude: number,
  radiusMiles: number = 75
): boolean {
  return findNearbyTrackChairs(latitude, longitude, radiusMiles).length > 0;
}
