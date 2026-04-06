/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CampSite, StateLaws } from "./types";

const CACHE_PREFIX = "rv_nomad_offline_";
const CACHE_META_KEY = CACHE_PREFIX + "meta";

interface CacheMeta {
  /** Map of state code → { count, sizeKB, cachedAt } */
  states: Record<string, { count: number; sizeKB: number; cachedAt: number }>;
}

/**
 * Save sites for a specific state to offline cache.
 */
export async function cacheStateData(
  stateCode: string,
  sites: CampSite[],
  laws?: StateLaws
): Promise<{ sizeKB: number }> {
  const data = JSON.stringify({ sites, laws });
  const sizeKB = Math.round(data.length / 1024);

  await AsyncStorage.setItem(CACHE_PREFIX + stateCode, data);

  // Update meta
  const meta = await getCacheMeta();
  meta.states[stateCode] = { count: sites.length, sizeKB, cachedAt: Date.now() };
  await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));

  return { sizeKB };
}

/**
 * Load cached sites for a state.
 */
export async function loadCachedState(
  stateCode: string
): Promise<{ sites: CampSite[]; laws?: StateLaws } | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + stateCode);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Remove cached data for a state.
 */
export async function removeCachedState(stateCode: string): Promise<void> {
  await AsyncStorage.removeItem(CACHE_PREFIX + stateCode);
  const meta = await getCacheMeta();
  delete meta.states[stateCode];
  await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
}

/**
 * Get cache metadata (which states are cached, sizes, etc.).
 */
export async function getCacheMeta(): Promise<CacheMeta> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_META_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { states: {} };
}

/**
 * Get total cache size in MB.
 */
export async function getCacheSizeMB(): Promise<number> {
  const meta = await getCacheMeta();
  const totalKB = Object.values(meta.states).reduce((sum, s) => sum + s.sizeKB, 0);
  return Math.round((totalKB / 1024) * 10) / 10;
}

/**
 * Clear all cached data.
 */
export async function clearAllCache(): Promise<void> {
  const meta = await getCacheMeta();
  const keys = Object.keys(meta.states).map((code) => CACHE_PREFIX + code);
  keys.push(CACHE_META_KEY);
  await AsyncStorage.multiRemove(keys);
}

/**
 * Get count of cached states.
 */
export async function getCachedStateCount(): Promise<number> {
  const meta = await getCacheMeta();
  return Object.keys(meta.states).length;
}
