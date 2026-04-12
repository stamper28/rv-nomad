/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

/**
 * Find the closest RV parks or campgrounds to a given location.
 * Used on scenic views, attractions, and other non-campsite detail pages
 * so users know where they can park their RV nearby.
 */

import { ALL_SITES } from "@/lib/all-sites-data";
import type { CampSite } from "@/lib/types";

// Campsite categories that have actual parking/camping spots
const CAMPSITE_CATEGORIES = new Set([
  "rv_park", "state_park", "national_park", "national_forest",
  "blm", "county_park", "military", "harvest_host",
  "passport_america", "thousand_trails", "koa",
]);

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearbyRVPark {
  site: CampSite;
  distanceMiles: number;
  directionsUrl: string;
}

export function findNearbyRVParks(
  lat: number,
  lng: number,
  limit: number = 3,
  maxDistanceMiles: number = 50
): NearbyRVPark[] {
  const results: NearbyRVPark[] = [];

  for (const site of ALL_SITES) {
    if (!CAMPSITE_CATEGORIES.has(site.category)) continue;
    const dist = haversineDistance(lat, lng, site.latitude, site.longitude);
    if (dist <= maxDistanceMiles) {
      results.push({
        site,
        distanceMiles: Math.round(dist * 10) / 10,
        directionsUrl: `https://www.google.com/maps/dir/${lat},${lng}/${site.latitude},${site.longitude}`,
      });
    }
  }

  return results
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}
