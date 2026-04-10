/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * RIDB Photo Service
 *
 * Fetches real campground photos from the Recreation Information Database (RIDB)
 * API for federal campgrounds (National Parks, National Forests, BLM, Army Corps).
 * Falls back to existing scenic placeholder images when RIDB has no photos.
 *
 * API: https://ridb.recreation.gov/api/v1/
 * Key: Free tier, 1000 requests/hour
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SiteCategory } from "./types";

const RIDB_API_KEY = "bddc88d1-6661-4b63-8331-7fbc88a415c2";
const RIDB_BASE_URL = "https://ridb.recreation.gov/api/v1";
const CACHE_PREFIX = "ridb_photos_";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FACILITY_CACHE_PREFIX = "ridb_fac_";

/** Categories that may have RIDB photos (federal campgrounds) */
const RIDB_CATEGORIES: SiteCategory[] = [
  "national_park",
  "national_forest",
  "blm",
  "army_corps",
];

export interface RIDBPhoto {
  url: string;
  title: string;
  description: string;
  credits: string;
  isPrimary: boolean;
}

interface CachedPhotos {
  photos: RIDBPhoto[];
  timestamp: number;
}

interface CachedFacilityId {
  facilityId: string | null;
  timestamp: number;
}

/**
 * Check if a campground category supports RIDB photos
 */
export function supportsRIDBPhotos(category: SiteCategory): boolean {
  return RIDB_CATEGORIES.includes(category);
}

/**
 * Search RIDB for a facility by name and get its facility ID.
 * Uses caching to avoid repeated API calls.
 */
async function findFacilityId(
  campgroundName: string,
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const cacheKey = `${FACILITY_CACHE_PREFIX}${campgroundName}`;

  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed: CachedFacilityId = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
        return parsed.facilityId;
      }
    }
  } catch {
    // Cache miss, continue
  }

  try {
    // Strip common prefixes for better search results
    const searchName = campgroundName
      .replace(/^(Denali|Yellowstone|Yosemite|Glacier|Zion|Grand Canyon)\s+(National Park\s+)?/i, "")
      .replace(/\s+Campground$/i, "")
      .trim();

    const query = encodeURIComponent(searchName);
    const url = `${RIDB_BASE_URL}/facilities?query=${query}&latitude=${latitude}&longitude=${longitude}&radius=25&apikey=${RIDB_API_KEY}&limit=5`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`RIDB API error: ${response.status}`);
    }

    const data = await response.json();
    const facilities = data.RECDATA || [];

    let facilityId: string | null = null;

    if (facilities.length > 0) {
      // Pick the closest match by name similarity or just the first result
      facilityId = facilities[0].FacilityID;
    }

    // Cache the result (even null, to avoid repeated failed lookups)
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ facilityId, timestamp: Date.now() }),
    );

    return facilityId;
  } catch {
    return null;
  }
}

/**
 * Fetch photos for a facility from RIDB API.
 */
async function fetchFacilityPhotos(facilityId: string): Promise<RIDBPhoto[]> {
  try {
    const url = `${RIDB_BASE_URL}/facilities/${facilityId}/media?apikey=${RIDB_API_KEY}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const media = data.RECDATA || [];

    // Filter to images only and map to our format
    return media
      .filter((m: any) => m.MediaType === "Image" && m.URL)
      .map((m: any) => ({
        url: m.URL,
        title: m.Title || "",
        description: m.Description || "",
        credits: m.Credits || "",
        isPrimary: m.IsPrimary === true,
      }))
      .slice(0, 10); // Max 10 photos
  } catch {
    return [];
  }
}

/**
 * Get RIDB photos for a campground. Returns cached photos if available,
 * otherwise fetches from the API. Returns empty array if no photos found.
 *
 * @param siteId - The campsite ID (used for caching)
 * @param campgroundName - Name of the campground to search
 * @param category - Site category (only federal categories are searched)
 * @param latitude - Campground latitude
 * @param longitude - Campground longitude
 */
export async function getRIDBPhotos(
  siteId: string,
  campgroundName: string,
  category: SiteCategory,
  latitude: number,
  longitude: number,
): Promise<RIDBPhoto[]> {
  // Only fetch for federal campground categories
  if (!supportsRIDBPhotos(category)) {
    return [];
  }

  const cacheKey = `${CACHE_PREFIX}${siteId}`;

  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed: CachedPhotos = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
        return parsed.photos;
      }
    }
  } catch {
    // Cache miss, continue
  }

  // Find the facility ID
  const facilityId = await findFacilityId(campgroundName, latitude, longitude);
  if (!facilityId) {
    // Cache empty result to avoid repeated lookups
    try {
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ photos: [], timestamp: Date.now() }),
      );
    } catch {
      // Ignore cache write errors
    }
    return [];
  }

  // Fetch photos
  const photos = await fetchFacilityPhotos(facilityId);

  // Cache the result
  try {
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ photos, timestamp: Date.now() }),
    );
  } catch {
    // Ignore cache write errors
  }

  return photos;
}

/**
 * Clear all RIDB photo caches (useful for debugging or forced refresh)
 */
export async function clearRIDBCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const ridbKeys = allKeys.filter(
      (k) => k.startsWith(CACHE_PREFIX) || k.startsWith(FACILITY_CACHE_PREFIX),
    );
    if (ridbKeys.length > 0) {
      await AsyncStorage.multiRemove(ridbKeys);
    }
  } catch {
    // Ignore errors
  }
}
