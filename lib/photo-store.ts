/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SitePhoto {
  id: string;
  siteId: string;
  uri: string;
  caption?: string;
  siteNumber?: string;
  rigType?: string;
  createdAt: string;
  authorName?: string;
}

const PHOTOS_KEY = "rv_nomad_site_photos";

/**
 * Get all photos for a specific campground site
 */
export async function getPhotosForSite(siteId: string): Promise<SitePhoto[]> {
  try {
    const raw = await AsyncStorage.getItem(PHOTOS_KEY);
    if (!raw) return [];
    const all: SitePhoto[] = JSON.parse(raw);
    return all.filter((p) => p.siteId === siteId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Get total photo count for a site (for badge display)
 */
export async function getPhotoCountForSite(siteId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(PHOTOS_KEY);
    if (!raw) return 0;
    const all: SitePhoto[] = JSON.parse(raw);
    return all.filter((p) => p.siteId === siteId).length;
  } catch {
    return 0;
  }
}

/**
 * Get all photos across all sites
 */
export async function getAllPhotos(): Promise<SitePhoto[]> {
  try {
    const raw = await AsyncStorage.getItem(PHOTOS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Add a new photo for a campground site
 */
export async function addPhoto(photo: Omit<SitePhoto, "id" | "createdAt">): Promise<SitePhoto> {
  const newPhoto: SitePhoto = {
    ...photo,
    id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  try {
    const raw = await AsyncStorage.getItem(PHOTOS_KEY);
    const all: SitePhoto[] = raw ? JSON.parse(raw) : [];
    all.push(newPhoto);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(all));
  } catch {
    // silently fail
  }
  return newPhoto;
}

/**
 * Delete a photo by ID
 */
export async function deletePhoto(photoId: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PHOTOS_KEY);
    if (!raw) return;
    const all: SitePhoto[] = JSON.parse(raw);
    const filtered = all.filter((p) => p.id !== photoId);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(filtered));
  } catch {
    // silently fail
  }
}

/**
 * Get photo counts for multiple sites at once (for cards/lists)
 */
export async function getPhotoCountsForSites(siteIds: string[]): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(PHOTOS_KEY);
    if (!raw) return {};
    const all: SitePhoto[] = JSON.parse(raw);
    const counts: Record<string, number> = {};
    for (const photo of all) {
      if (siteIds.includes(photo.siteId)) {
        counts[photo.siteId] = (counts[photo.siteId] || 0) + 1;
      }
    }
    return counts;
  } catch {
    return {};
  }
}
