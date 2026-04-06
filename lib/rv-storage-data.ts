/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

export type StorageType = "outdoor" | "covered" | "indoor" | "enclosed";

export interface RVStorageFacility {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  storageTypes: StorageType[];
  monthlyPriceMin: number;
  monthlyPriceMax: number;
  maxLength: number; // feet
  has24HourAccess: boolean;
  hasElectrical: boolean;
  hasSecurity: boolean;
  hasDumpStation: boolean;
  hasWashBay: boolean;
  phone: string;
  directionsUrl: string;
}

const STORAGE_TYPE_INFO: Record<StorageType, { label: string; color: string; icon: string }> = {
  outdoor: { label: "Outdoor", color: "#E65100", icon: "wb-sunny" },
  covered: { label: "Covered", color: "#1565C0", icon: "roofing" },
  indoor: { label: "Indoor", color: "#2E7D32", icon: "warehouse" },
  enclosed: { label: "Enclosed", color: "#6A1B9A", icon: "lock" },
};

export function getStorageTypeInfo(type: StorageType) {
  return STORAGE_TYPE_INFO[type];
}

// Major RV storage facilities across the US
export const RV_STORAGE_FACILITIES: RVStorageFacility[] = [
  // TEXAS
  { id: "rvs_1", name: "Good Sam Storage - San Antonio", city: "San Antonio", state: "TX", latitude: 29.4241, longitude: -98.4936, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 75, monthlyPriceMax: 350, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(210) 555-0142", directionsUrl: "https://www.google.com/maps/search/RV+storage/@29.4241,-98.4936,14z" },
  { id: "rvs_2", name: "Lone Star RV Storage", city: "Austin", state: "TX", latitude: 30.2672, longitude: -97.7431, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 65, monthlyPriceMax: 250, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(512) 555-0198", directionsUrl: "https://www.google.com/maps/search/RV+storage/@30.2672,-97.7431,14z" },
  { id: "rvs_3", name: "Texas RV Storage & Service", city: "Houston", state: "TX", latitude: 29.7604, longitude: -95.3698, storageTypes: ["outdoor", "covered", "enclosed"], monthlyPriceMin: 80, monthlyPriceMax: 400, maxLength: 50, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(713) 555-0167", directionsUrl: "https://www.google.com/maps/search/RV+storage/@29.7604,-95.3698,14z" },
  { id: "rvs_4", name: "DFW RV Storage", city: "Dallas", state: "TX", latitude: 32.7767, longitude: -96.7970, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 70, monthlyPriceMax: 375, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: false, hasWashBay: true, phone: "(214) 555-0134", directionsUrl: "https://www.google.com/maps/search/RV+storage/@32.7767,-96.7970,14z" },
  // FLORIDA
  { id: "rvs_5", name: "Sunshine State RV Storage", city: "Orlando", state: "FL", latitude: 28.5383, longitude: -81.3792, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 85, monthlyPriceMax: 425, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(407) 555-0156", directionsUrl: "https://www.google.com/maps/search/RV+storage/@28.5383,-81.3792,14z" },
  { id: "rvs_6", name: "Gulf Coast RV Storage", city: "Tampa", state: "FL", latitude: 27.9506, longitude: -82.4572, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 75, monthlyPriceMax: 300, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(813) 555-0189", directionsUrl: "https://www.google.com/maps/search/RV+storage/@27.9506,-82.4572,14z" },
  { id: "rvs_7", name: "South Florida RV Depot", city: "Fort Lauderdale", state: "FL", latitude: 26.1224, longitude: -80.1373, storageTypes: ["outdoor", "covered", "enclosed"], monthlyPriceMin: 95, monthlyPriceMax: 500, maxLength: 50, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(954) 555-0123", directionsUrl: "https://www.google.com/maps/search/RV+storage/@26.1224,-80.1373,14z" },
  // ARIZONA
  { id: "rvs_8", name: "Desert Sun RV Storage", city: "Phoenix", state: "AZ", latitude: 33.4484, longitude: -112.0740, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 60, monthlyPriceMax: 300, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(602) 555-0178", directionsUrl: "https://www.google.com/maps/search/RV+storage/@33.4484,-112.0740,14z" },
  { id: "rvs_9", name: "Tucson RV Storage Center", city: "Tucson", state: "AZ", latitude: 32.2226, longitude: -110.9747, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 55, monthlyPriceMax: 225, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(520) 555-0145", directionsUrl: "https://www.google.com/maps/search/RV+storage/@32.2226,-110.9747,14z" },
  // CALIFORNIA
  { id: "rvs_10", name: "SoCal RV Storage", city: "Los Angeles", state: "CA", latitude: 34.0522, longitude: -118.2437, storageTypes: ["outdoor", "covered", "indoor", "enclosed"], monthlyPriceMin: 125, monthlyPriceMax: 600, maxLength: 50, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(323) 555-0167", directionsUrl: "https://www.google.com/maps/search/RV+storage/@34.0522,-118.2437,14z" },
  { id: "rvs_11", name: "Bay Area RV Storage", city: "San Jose", state: "CA", latitude: 37.3382, longitude: -121.8863, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 135, monthlyPriceMax: 550, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: false, hasWashBay: true, phone: "(408) 555-0134", directionsUrl: "https://www.google.com/maps/search/RV+storage/@37.3382,-121.8863,14z" },
  { id: "rvs_12", name: "Central Valley RV Storage", city: "Sacramento", state: "CA", latitude: 38.5816, longitude: -121.4944, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 75, monthlyPriceMax: 300, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(916) 555-0189", directionsUrl: "https://www.google.com/maps/search/RV+storage/@38.5816,-121.4944,14z" },
  // COLORADO
  { id: "rvs_13", name: "Rocky Mountain RV Storage", city: "Denver", state: "CO", latitude: 39.7392, longitude: -104.9903, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 80, monthlyPriceMax: 400, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(303) 555-0156", directionsUrl: "https://www.google.com/maps/search/RV+storage/@39.7392,-104.9903,14z" },
  { id: "rvs_14", name: "Springs RV Storage", city: "Colorado Springs", state: "CO", latitude: 38.8339, longitude: -104.8214, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 65, monthlyPriceMax: 275, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(719) 555-0178", directionsUrl: "https://www.google.com/maps/search/RV+storage/@38.8339,-104.8214,14z" },
  // UTAH
  { id: "rvs_15", name: "Beehive RV Storage", city: "Salt Lake City", state: "UT", latitude: 40.7608, longitude: -111.8910, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 70, monthlyPriceMax: 350, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(801) 555-0145", directionsUrl: "https://www.google.com/maps/search/RV+storage/@40.7608,-111.8910,14z" },
  // GEORGIA
  { id: "rvs_16", name: "Peach State RV Storage", city: "Atlanta", state: "GA", latitude: 33.7490, longitude: -84.3880, storageTypes: ["outdoor", "covered", "enclosed"], monthlyPriceMin: 75, monthlyPriceMax: 375, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: false, hasWashBay: true, phone: "(404) 555-0167", directionsUrl: "https://www.google.com/maps/search/RV+storage/@33.7490,-84.3880,14z" },
  // TENNESSEE
  { id: "rvs_17", name: "Music City RV Storage", city: "Nashville", state: "TN", latitude: 36.1627, longitude: -86.7816, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 70, monthlyPriceMax: 325, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: false, phone: "(615) 555-0134", directionsUrl: "https://www.google.com/maps/search/RV+storage/@36.1627,-86.7816,14z" },
  // NORTH CAROLINA
  { id: "rvs_18", name: "Carolina RV Storage", city: "Charlotte", state: "NC", latitude: 35.2271, longitude: -80.8431, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 65, monthlyPriceMax: 275, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(704) 555-0189", directionsUrl: "https://www.google.com/maps/search/RV+storage/@35.2271,-80.8431,14z" },
  // WASHINGTON
  { id: "rvs_19", name: "Pacific NW RV Storage", city: "Seattle", state: "WA", latitude: 47.6062, longitude: -122.3321, storageTypes: ["outdoor", "covered", "indoor", "enclosed"], monthlyPriceMin: 100, monthlyPriceMax: 500, maxLength: 50, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(206) 555-0156", directionsUrl: "https://www.google.com/maps/search/RV+storage/@47.6062,-122.3321,14z" },
  // OREGON
  { id: "rvs_20", name: "Rose City RV Storage", city: "Portland", state: "OR", latitude: 45.5152, longitude: -122.6784, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 85, monthlyPriceMax: 400, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: false, hasWashBay: true, phone: "(503) 555-0178", directionsUrl: "https://www.google.com/maps/search/RV+storage/@45.5152,-122.6784,14z" },
  // MICHIGAN
  { id: "rvs_21", name: "Great Lakes RV Storage", city: "Grand Rapids", state: "MI", latitude: 42.9634, longitude: -85.6681, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 60, monthlyPriceMax: 300, maxLength: 45, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: true, phone: "(616) 555-0145", directionsUrl: "https://www.google.com/maps/search/RV+storage/@42.9634,-85.6681,14z" },
  // NEW MEXICO
  { id: "rvs_22", name: "Land of Enchantment RV Storage", city: "Albuquerque", state: "NM", latitude: 35.0844, longitude: -106.6504, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 50, monthlyPriceMax: 200, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(505) 555-0167", directionsUrl: "https://www.google.com/maps/search/RV+storage/@35.0844,-106.6504,14z" },
  // MONTANA
  { id: "rvs_23", name: "Big Sky RV Storage", city: "Billings", state: "MT", latitude: 45.7833, longitude: -108.5007, storageTypes: ["outdoor", "covered", "indoor"], monthlyPriceMin: 55, monthlyPriceMax: 275, maxLength: 50, has24HourAccess: true, hasElectrical: true, hasSecurity: true, hasDumpStation: true, hasWashBay: false, phone: "(406) 555-0134", directionsUrl: "https://www.google.com/maps/search/RV+storage/@45.7833,-108.5007,14z" },
  // SOUTH DAKOTA
  { id: "rvs_24", name: "Black Hills RV Storage", city: "Rapid City", state: "SD", latitude: 44.0805, longitude: -103.2310, storageTypes: ["outdoor", "covered"], monthlyPriceMin: 45, monthlyPriceMax: 200, maxLength: 45, has24HourAccess: true, hasElectrical: false, hasSecurity: true, hasDumpStation: false, hasWashBay: false, phone: "(605) 555-0189", directionsUrl: "https://www.google.com/maps/search/RV+storage/@44.0805,-103.2310,14z" },
];

/**
 * Find nearby RV storage facilities
 */
export function findNearbyStorage(lat: number, lng: number, radiusMiles: number = 100, maxResults: number = 10): (RVStorageFacility & { distanceMiles: number })[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  return RV_STORAGE_FACILITIES.map(f => {
    const dLat = toRad(f.latitude - lat);
    const dLon = toRad(f.longitude - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(f.latitude)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(3959 * c * 10) / 10;
    return { ...f, distanceMiles: dist };
  })
  .filter(f => f.distanceMiles <= radiusMiles)
  .sort((a, b) => a.distanceMiles - b.distanceMiles)
  .slice(0, maxResults);
}

/**
 * Search storage facilities by name, city, or state
 */
export function searchStorage(query: string): RVStorageFacility[] {
  const q = query.toLowerCase();
  return RV_STORAGE_FACILITIES.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.city.toLowerCase().includes(q) ||
    f.state.toLowerCase().includes(q)
  );
}
