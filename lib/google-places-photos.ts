/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Google Places Photos Service
 *
 * Fetches real photos of campsites, truck stops, and other RV locations
 * using the Google Places API (New).
 *
 * Uses a two-step process:
 * 1. Text Search to find the place and get its place ID
 * 2. Place Details to get photo references
 * 3. Construct photo URLs from photo references
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Try to load from expo-constants at runtime, fallback to process.env
let API_KEY = "";
try {
  const Constants = require("expo-constants").default;
  API_KEY = Constants?.expoConfig?.extra?.GOOGLE_PLACES_API_KEY ?? "";
} catch {
  // Not in Expo runtime
}
if (!API_KEY) {
  API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";
}

const CACHE_PREFIX = "gp_photos_";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PlacePhoto {
  name: string; // e.g. "places/xxx/photos/yyy"
  widthPx: number;
  heightPx: number;
  authorAttributions: { displayName: string; uri: string }[];
}

interface CachedPhotos {
  urls: string[];
  attributions: string[];
  timestamp: number;
}

/**
 * Search for a place by name and location, return photo URLs.
 */
export async function fetchPlacePhotos(
  placeName: string,
  lat?: number,
  lng?: number,
  maxPhotos: number = 5
): Promise<{ urls: string[]; attributions: string[] }> {
  if (!API_KEY) {
    return { urls: [], attributions: [] };
  }

  // Check cache first
  const cacheKey = `${CACHE_PREFIX}${placeName}_${lat}_${lng}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed: CachedPhotos = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return { urls: parsed.urls, attributions: parsed.attributions };
      }
    }
  } catch {
    // Cache miss, continue
  }

  try {
    // Step 1: Text Search to find the place
    const searchBody: any = {
      textQuery: placeName,
      maxResultCount: 1,
      languageCode: "en",
    };

    if (lat && lng) {
      searchBody.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 50000, // 50km radius
        },
      };
    }

    const searchResponse = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "places.id,places.photos",
        },
        body: JSON.stringify(searchBody),
      }
    );

    if (!searchResponse.ok) {
      return { urls: [], attributions: [] };
    }

    const searchData = await searchResponse.json();
    const place = searchData.places?.[0];
    if (!place?.photos?.length) {
      return { urls: [], attributions: [] };
    }

    // Step 2: Build photo URLs from the photo references
    const photos: PlacePhoto[] = place.photos.slice(0, maxPhotos);
    const urls: string[] = [];
    const attributions: string[] = [];

    for (const photo of photos) {
      // Google Places API (New) photo URL format
      const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=1200&key=${API_KEY}`;
      urls.push(photoUrl);

      if (photo.authorAttributions?.length) {
        const attr = photo.authorAttributions[0];
        if (attr.displayName && !attributions.includes(attr.displayName)) {
          attributions.push(attr.displayName);
        }
      }
    }

    // Cache the results
    try {
      const cacheData: CachedPhotos = {
        urls,
        attributions,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch {
      // Cache write failure is non-critical
    }

    return { urls, attributions };
  } catch {
    return { urls: [], attributions: [] };
  }
}

/**
 * Build a search query from site data for better Google Places matching.
 */
export function buildPlaceQuery(
  siteName: string,
  city?: string,
  state?: string,
  category?: string
): string {
  let query = siteName;

  // Add category context for better matching
  if (category) {
    const categoryHints: Record<string, string> = {
      truck_stop: "truck stop",
      dump_station: "RV dump station",
      rv_park: "RV park",
      campground: "campground",
      state_park: "state park",
      national_park: "national park campground",
      blm: "BLM camping",
      national_forest: "national forest campground",
      propane: "propane refill",
      rv_repair: "RV repair shop",
      water_fill: "water fill station",
      laundromat: "laundromat",
      grocery: "grocery store",
      rv_wash: "RV wash",
      rv_tire: "tire shop",
    };
    if (categoryHints[category] && !siteName.toLowerCase().includes(categoryHints[category].toLowerCase())) {
      query += ` ${categoryHints[category]}`;
    }
  }

  // Add location for better accuracy
  if (city && state) {
    query += ` ${city}, ${state}`;
  } else if (state) {
    query += ` ${state}`;
  }

  return query;
}
