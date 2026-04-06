/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Nearby Services — find closest fuel stations, camping supply stores, and RV repair shops
 * relative to a campsite's coordinates using Haversine distance.
 */

// ─── Haversine ───────────────────────────────────────────────
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function directionsUrl(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
}

// ─── Types ───────────────────────────────────────────────────
export interface NearbyFuelStation {
  id: string;
  name: string;
  brand: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  diesel: number;
  regular: number;
  hasDEF: boolean;
  hasRVLanes: boolean;
  hasShowers: boolean;
  hasDumpStation: boolean;
  distanceMiles: number;
  directionsUrl: string;
  lastUpdated: string;
}

export interface NearbySupplyStore {
  id: string;
  name: string;
  brand: string;
  type: "general" | "camping" | "outdoor" | "hardware";
  city: string;
  state: string;
  lat: number;
  lng: number;
  hasRVSupplies: boolean;
  hasPropane: boolean;
  hasFirewood: boolean;
  hasBait: boolean;
  hours: string;
  distanceMiles: number;
  directionsUrl: string;
}

export interface NearbyRepairShop {
  id: string;
  name: string;
  brand: string;
  type: "dealer" | "mobile" | "tire" | "general";
  city: string;
  state: string;
  lat: number;
  lng: number;
  services: string[];
  hasMobileService: boolean;
  acceptsEmergency: boolean;
  hours: string;
  phone: string;
  distanceMiles: number;
  directionsUrl: string;
}

// ─── Fuel Station Data ───────────────────────────────────────
interface RawFuelStation {
  brand: string;
  prefix: string;
  hasDEF: boolean;
  hasRVLanes: boolean;
  hasShowers: boolean;
}

const FUEL_CHAINS: RawFuelStation[] = [
  { brand: "Pilot Flying J", prefix: "Pilot", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "Love's Travel Stops", prefix: "Love's", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "TA/Petro", prefix: "TA", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "Buc-ee's", prefix: "Buc-ee's", hasDEF: true, hasRVLanes: true, hasShowers: false },
  { brand: "Casey's", prefix: "Casey's", hasDEF: false, hasRVLanes: false, hasShowers: false },
  { brand: "Maverik", prefix: "Maverik", hasDEF: true, hasRVLanes: true, hasShowers: false },
  { brand: "Kum & Go", prefix: "Kum & Go", hasDEF: true, hasRVLanes: false, hasShowers: false },
  { brand: "QuikTrip", prefix: "QT", hasDEF: false, hasRVLanes: false, hasShowers: false },
];

const FUEL_LOCATIONS: { city: string; state: string; lat: number; lng: number }[] = [
  { city: "Amarillo", state: "TX", lat: 35.22, lng: -101.83 },
  { city: "Flagstaff", state: "AZ", lat: 35.20, lng: -111.65 },
  { city: "Barstow", state: "CA", lat: 34.90, lng: -117.02 },
  { city: "Boise", state: "ID", lat: 43.62, lng: -116.21 },
  { city: "Cheyenne", state: "WY", lat: 41.14, lng: -104.82 },
  { city: "Denver", state: "CO", lat: 39.74, lng: -104.99 },
  { city: "El Paso", state: "TX", lat: 31.76, lng: -106.49 },
  { city: "Jacksonville", state: "FL", lat: 30.33, lng: -81.66 },
  { city: "Kansas City", state: "MO", lat: 39.10, lng: -94.58 },
  { city: "Las Vegas", state: "NV", lat: 36.17, lng: -115.14 },
  { city: "Little Rock", state: "AR", lat: 34.75, lng: -92.29 },
  { city: "Memphis", state: "TN", lat: 35.15, lng: -90.05 },
  { city: "Nashville", state: "TN", lat: 36.16, lng: -86.78 },
  { city: "Oklahoma City", state: "OK", lat: 35.47, lng: -97.52 },
  { city: "Omaha", state: "NE", lat: 41.26, lng: -95.94 },
  { city: "Phoenix", state: "AZ", lat: 33.45, lng: -112.07 },
  { city: "Portland", state: "OR", lat: 45.52, lng: -122.68 },
  { city: "Reno", state: "NV", lat: 39.53, lng: -119.81 },
  { city: "Sacramento", state: "CA", lat: 38.58, lng: -121.49 },
  { city: "Salt Lake City", state: "UT", lat: 40.76, lng: -111.89 },
  { city: "San Antonio", state: "TX", lat: 29.42, lng: -98.49 },
  { city: "Savannah", state: "GA", lat: 32.08, lng: -81.09 },
  { city: "Sioux Falls", state: "SD", lat: 43.55, lng: -96.73 },
  { city: "Spokane", state: "WA", lat: 47.66, lng: -117.43 },
  { city: "St. Louis", state: "MO", lat: 38.63, lng: -90.20 },
  { city: "Tallahassee", state: "FL", lat: 30.44, lng: -84.28 },
  { city: "Tucson", state: "AZ", lat: 32.22, lng: -110.97 },
  { city: "Tulsa", state: "OK", lat: 36.15, lng: -95.99 },
  { city: "Wichita", state: "KS", lat: 37.69, lng: -97.34 },
  { city: "Billings", state: "MT", lat: 45.78, lng: -108.50 },
  { city: "Rapid City", state: "SD", lat: 44.08, lng: -103.23 },
  { city: "Albuquerque", state: "NM", lat: 35.08, lng: -106.65 },
  { city: "Charlotte", state: "NC", lat: 35.23, lng: -80.84 },
  { city: "Atlanta", state: "GA", lat: 33.75, lng: -84.39 },
  { city: "Dallas", state: "TX", lat: 32.78, lng: -96.80 },
  { city: "Houston", state: "TX", lat: 29.76, lng: -95.37 },
  { city: "Indianapolis", state: "IN", lat: 39.77, lng: -86.16 },
  { city: "Louisville", state: "KY", lat: 38.25, lng: -85.76 },
  { city: "Minneapolis", state: "MN", lat: 44.98, lng: -93.27 },
  { city: "Richmond", state: "VA", lat: 37.54, lng: -77.44 },
  { city: "Knoxville", state: "TN", lat: 35.96, lng: -83.92 },
  { city: "Birmingham", state: "AL", lat: 33.52, lng: -86.80 },
  { city: "Mobile", state: "AL", lat: 30.69, lng: -88.04 },
  { city: "Pensacola", state: "FL", lat: 30.44, lng: -87.22 },
  { city: "New Orleans", state: "LA", lat: 29.95, lng: -90.07 },
  { city: "Baton Rouge", state: "LA", lat: 30.45, lng: -91.19 },
  { city: "Jackson", state: "MS", lat: 32.30, lng: -90.18 },
  { city: "Columbia", state: "SC", lat: 34.00, lng: -81.03 },
  { city: "Raleigh", state: "NC", lat: 35.78, lng: -78.64 },
  { city: "Harrisburg", state: "PA", lat: 40.27, lng: -76.88 },
  { city: "Columbus", state: "OH", lat: 39.96, lng: -82.99 },
  { city: "Des Moines", state: "IA", lat: 41.59, lng: -93.62 },
  { city: "Springfield", state: "MO", lat: 37.22, lng: -93.29 },
  { city: "Lubbock", state: "TX", lat: 33.58, lng: -101.85 },
  { city: "Missoula", state: "MT", lat: 46.87, lng: -114.00 },
  { city: "Bozeman", state: "MT", lat: 45.68, lng: -111.04 },
  { city: "Twin Falls", state: "ID", lat: 42.56, lng: -114.46 },
  { city: "Elko", state: "NV", lat: 40.83, lng: -115.76 },
  { city: "Kingman", state: "AZ", lat: 35.19, lng: -114.05 },
  { city: "Grants Pass", state: "OR", lat: 42.44, lng: -123.33 },
  { city: "Redding", state: "CA", lat: 40.59, lng: -122.39 },
  { city: "Bakersfield", state: "CA", lat: 35.37, lng: -119.02 },
  { city: "Yuma", state: "AZ", lat: 32.69, lng: -114.62 },
  { city: "Las Cruces", state: "NM", lat: 32.35, lng: -106.76 },
  { city: "Laramie", state: "WY", lat: 41.31, lng: -105.59 },
  { city: "Rock Springs", state: "WY", lat: 41.59, lng: -109.23 },
  { city: "Casper", state: "WY", lat: 42.87, lng: -106.31 },
  { city: "Grand Junction", state: "CO", lat: 39.07, lng: -108.55 },
  { city: "Pueblo", state: "CO", lat: 38.25, lng: -104.61 },
  { city: "Fargo", state: "ND", lat: 46.88, lng: -96.79 },
  { city: "Bismarck", state: "ND", lat: 46.81, lng: -100.78 },
];

function seedVal(seed: number): number {
  return ((Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1);
}

function buildFuelStations(): NearbyFuelStation[] {
  const stations: NearbyFuelStation[] = [];
  let id = 0;
  for (const loc of FUEL_LOCATIONS) {
    const count = 2 + (id % 3);
    for (let s = 0; s < count; s++) {
      const chain = FUEL_CHAINS[(id + s) % FUEL_CHAINS.length];
      const seed = id * 17 + s * 31;
      const dieselBase = 3.89 + seedVal(seed) * 0.60 - 0.30;
      const regularBase = 3.29 + seedVal(seed + 1) * 0.50 - 0.25;
      stations.push({
        id: `fs-${id}-${s}`,
        name: `${chain.prefix} #${1000 + id + s}`,
        brand: chain.brand,
        city: loc.city,
        state: loc.state,
        lat: loc.lat + s * 0.018 - 0.009,
        lng: loc.lng + s * 0.014 - 0.007,
        diesel: Math.round(dieselBase * 100) / 100,
        regular: Math.round(regularBase * 100) / 100,
        hasDEF: chain.hasDEF,
        hasRVLanes: chain.hasRVLanes,
        hasShowers: chain.hasShowers,
        hasDumpStation: s % 4 === 0,
        distanceMiles: 0,
        directionsUrl: "",
        lastUpdated: "Est. price",
      });
      id++;
    }
  }
  return stations;
}

const ALL_FUEL_STATIONS = buildFuelStations();

// ─── Supply Store Data ───────────────────────────────────────
interface SupplyChain {
  brand: string;
  prefix: string;
  type: "general" | "camping" | "outdoor" | "hardware";
  hasRVSupplies: boolean;
  hasPropane: boolean;
  hasFirewood: boolean;
  hasBait: boolean;
}

const SUPPLY_CHAINS: SupplyChain[] = [
  { brand: "Walmart Supercenter", prefix: "Walmart", type: "general", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "Camping World", prefix: "Camping World", type: "camping", hasRVSupplies: true, hasPropane: true, hasFirewood: false, hasBait: false },
  { brand: "Bass Pro Shops", prefix: "Bass Pro", type: "outdoor", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "Cabela's", prefix: "Cabela's", type: "outdoor", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "REI Co-op", prefix: "REI", type: "outdoor", hasRVSupplies: false, hasPropane: false, hasFirewood: false, hasBait: false },
  { brand: "Tractor Supply Co", prefix: "Tractor Supply", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Ace Hardware", prefix: "Ace Hardware", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Home Depot", prefix: "Home Depot", type: "hardware", hasRVSupplies: false, hasPropane: true, hasFirewood: false, hasBait: false },
];

const SUPPLY_LOCATIONS: { city: string; state: string; lat: number; lng: number }[] = [
  { city: "Amarillo", state: "TX", lat: 35.20, lng: -101.81 },
  { city: "Flagstaff", state: "AZ", lat: 35.18, lng: -111.63 },
  { city: "Barstow", state: "CA", lat: 34.88, lng: -117.00 },
  { city: "Boise", state: "ID", lat: 43.60, lng: -116.19 },
  { city: "Denver", state: "CO", lat: 39.72, lng: -104.97 },
  { city: "Jacksonville", state: "FL", lat: 30.31, lng: -81.64 },
  { city: "Kansas City", state: "MO", lat: 39.08, lng: -94.56 },
  { city: "Las Vegas", state: "NV", lat: 36.15, lng: -115.12 },
  { city: "Nashville", state: "TN", lat: 36.14, lng: -86.76 },
  { city: "Phoenix", state: "AZ", lat: 33.43, lng: -112.05 },
  { city: "Portland", state: "OR", lat: 45.50, lng: -122.66 },
  { city: "Sacramento", state: "CA", lat: 38.56, lng: -121.47 },
  { city: "Salt Lake City", state: "UT", lat: 40.74, lng: -111.87 },
  { city: "San Antonio", state: "TX", lat: 29.40, lng: -98.47 },
  { city: "Savannah", state: "GA", lat: 32.06, lng: -81.07 },
  { city: "Spokane", state: "WA", lat: 47.64, lng: -117.41 },
  { city: "Atlanta", state: "GA", lat: 33.73, lng: -84.37 },
  { city: "Dallas", state: "TX", lat: 32.76, lng: -96.78 },
  { city: "Houston", state: "TX", lat: 29.74, lng: -95.35 },
  { city: "Indianapolis", state: "IN", lat: 39.75, lng: -86.14 },
  { city: "Minneapolis", state: "MN", lat: 44.96, lng: -93.25 },
  { city: "Charlotte", state: "NC", lat: 35.21, lng: -80.82 },
  { city: "Columbus", state: "OH", lat: 39.94, lng: -82.97 },
  { city: "Albuquerque", state: "NM", lat: 35.06, lng: -106.63 },
  { city: "Tucson", state: "AZ", lat: 32.20, lng: -110.95 },
  { city: "Raleigh", state: "NC", lat: 35.76, lng: -78.62 },
  { city: "Louisville", state: "KY", lat: 38.23, lng: -85.74 },
  { city: "Memphis", state: "TN", lat: 35.13, lng: -90.03 },
  { city: "Oklahoma City", state: "OK", lat: 35.45, lng: -97.50 },
  { city: "El Paso", state: "TX", lat: 31.74, lng: -106.47 },
  { city: "Billings", state: "MT", lat: 45.76, lng: -108.48 },
  { city: "Rapid City", state: "SD", lat: 44.06, lng: -103.21 },
  { city: "Knoxville", state: "TN", lat: 35.94, lng: -83.90 },
  { city: "Birmingham", state: "AL", lat: 33.50, lng: -86.78 },
  { city: "New Orleans", state: "LA", lat: 29.93, lng: -90.05 },
  { city: "Bakersfield", state: "CA", lat: 35.35, lng: -119.00 },
  { city: "Redding", state: "CA", lat: 40.57, lng: -122.37 },
  { city: "Grand Junction", state: "CO", lat: 39.05, lng: -108.53 },
  { city: "Fargo", state: "ND", lat: 46.86, lng: -96.77 },
  { city: "Sioux Falls", state: "SD", lat: 43.53, lng: -96.71 },
];

function buildSupplyStores(): NearbySupplyStore[] {
  const stores: NearbySupplyStore[] = [];
  let id = 0;
  for (const loc of SUPPLY_LOCATIONS) {
    const count = 2 + (id % 3);
    for (let s = 0; s < count; s++) {
      const chain = SUPPLY_CHAINS[(id + s) % SUPPLY_CHAINS.length];
      const hourSeed = (id + s) % 3;
      const hours = hourSeed === 0 ? "6am–11pm" : hourSeed === 1 ? "7am–10pm" : "8am–9pm";
      stores.push({
        id: `ss-${id}-${s}`,
        name: `${chain.prefix} — ${loc.city}`,
        brand: chain.brand,
        type: chain.type,
        city: loc.city,
        state: loc.state,
        lat: loc.lat + s * 0.015 - 0.008,
        lng: loc.lng + s * 0.012 - 0.006,
        hasRVSupplies: chain.hasRVSupplies,
        hasPropane: chain.hasPropane,
        hasFirewood: chain.hasFirewood,
        hasBait: chain.hasBait,
        hours,
        distanceMiles: 0,
        directionsUrl: "",
      });
      id++;
    }
  }
  return stores;
}

const ALL_SUPPLY_STORES = buildSupplyStores();

// ─── RV Repair Shop Data ────────────────────────────────────
interface RepairChain {
  brand: string;
  prefix: string;
  type: "dealer" | "mobile" | "tire" | "general";
  services: string[];
  hasMobileService: boolean;
  acceptsEmergency: boolean;
}

const REPAIR_CHAINS: RepairChain[] = [
  { brand: "Camping World Service", prefix: "Camping World Service", type: "dealer", services: ["Engine", "Electrical", "Plumbing", "HVAC", "Roof", "Slide-outs", "Awnings", "Appliances"], hasMobileService: false, acceptsEmergency: true },
  { brand: "General RV Service", prefix: "General RV", type: "dealer", services: ["Engine", "Electrical", "Plumbing", "Body Work", "Slide-outs", "Winterization"], hasMobileService: false, acceptsEmergency: true },
  { brand: "MHCRV Mobile Repair", prefix: "MHCRV Mobile", type: "mobile", services: ["Electrical", "Plumbing", "HVAC", "Roof Seal", "Slide-outs", "Leveling"], hasMobileService: true, acceptsEmergency: true },
  { brand: "RV Medic Mobile", prefix: "RV Medic", type: "mobile", services: ["Electrical", "Plumbing", "Appliances", "Generator", "Water Heater"], hasMobileService: true, acceptsEmergency: true },
  { brand: "Discount Tire", prefix: "Discount Tire", type: "tire", services: ["Tires", "Alignment", "Balancing", "TPMS"], hasMobileService: false, acceptsEmergency: false },
  { brand: "Les Schwab Tires", prefix: "Les Schwab", type: "tire", services: ["Tires", "Alignment", "Brakes", "Suspension"], hasMobileService: false, acceptsEmergency: false },
  { brand: "NAPA AutoCare", prefix: "NAPA AutoCare", type: "general", services: ["Engine", "Brakes", "Electrical", "Exhaust", "Transmission"], hasMobileService: false, acceptsEmergency: false },
  { brand: "Good Sam Roadside", prefix: "Good Sam Roadside", type: "mobile", services: ["Towing", "Tire Change", "Jump Start", "Lockout", "Fuel Delivery"], hasMobileService: true, acceptsEmergency: true },
];

const REPAIR_LOCATIONS: { city: string; state: string; lat: number; lng: number }[] = [
  { city: "Amarillo", state: "TX", lat: 35.23, lng: -101.85 },
  { city: "Flagstaff", state: "AZ", lat: 35.21, lng: -111.67 },
  { city: "Boise", state: "ID", lat: 43.63, lng: -116.23 },
  { city: "Denver", state: "CO", lat: 39.75, lng: -105.01 },
  { city: "Jacksonville", state: "FL", lat: 30.34, lng: -81.68 },
  { city: "Kansas City", state: "MO", lat: 39.11, lng: -94.60 },
  { city: "Las Vegas", state: "NV", lat: 36.18, lng: -115.16 },
  { city: "Nashville", state: "TN", lat: 36.17, lng: -86.80 },
  { city: "Phoenix", state: "AZ", lat: 33.46, lng: -112.09 },
  { city: "Portland", state: "OR", lat: 45.53, lng: -122.70 },
  { city: "Sacramento", state: "CA", lat: 38.59, lng: -121.51 },
  { city: "Salt Lake City", state: "UT", lat: 40.77, lng: -111.91 },
  { city: "San Antonio", state: "TX", lat: 29.43, lng: -98.51 },
  { city: "Atlanta", state: "GA", lat: 33.76, lng: -84.41 },
  { city: "Dallas", state: "TX", lat: 32.79, lng: -96.82 },
  { city: "Houston", state: "TX", lat: 29.77, lng: -95.39 },
  { city: "Indianapolis", state: "IN", lat: 39.78, lng: -86.18 },
  { city: "Minneapolis", state: "MN", lat: 44.99, lng: -93.29 },
  { city: "Charlotte", state: "NC", lat: 35.24, lng: -80.86 },
  { city: "Columbus", state: "OH", lat: 39.97, lng: -83.01 },
  { city: "Albuquerque", state: "NM", lat: 35.09, lng: -106.67 },
  { city: "Tucson", state: "AZ", lat: 32.23, lng: -110.99 },
  { city: "Louisville", state: "KY", lat: 38.26, lng: -85.78 },
  { city: "Memphis", state: "TN", lat: 35.16, lng: -90.07 },
  { city: "Oklahoma City", state: "OK", lat: 35.48, lng: -97.54 },
  { city: "Billings", state: "MT", lat: 45.79, lng: -108.52 },
  { city: "Rapid City", state: "SD", lat: 44.09, lng: -103.25 },
  { city: "Knoxville", state: "TN", lat: 35.97, lng: -83.94 },
  { city: "Birmingham", state: "AL", lat: 33.53, lng: -86.82 },
  { city: "New Orleans", state: "LA", lat: 29.96, lng: -90.09 },
  { city: "Bakersfield", state: "CA", lat: 35.38, lng: -119.04 },
  { city: "Redding", state: "CA", lat: 40.60, lng: -122.41 },
  { city: "Grand Junction", state: "CO", lat: 39.08, lng: -108.57 },
  { city: "El Paso", state: "TX", lat: 31.77, lng: -106.51 },
  { city: "Spokane", state: "WA", lat: 47.67, lng: -117.45 },
  { city: "Reno", state: "NV", lat: 39.54, lng: -119.83 },
  { city: "Sioux Falls", state: "SD", lat: 43.56, lng: -96.75 },
  { city: "Fargo", state: "ND", lat: 46.89, lng: -96.81 },
  { city: "Savannah", state: "GA", lat: 32.09, lng: -81.11 },
  { city: "Pensacola", state: "FL", lat: 30.45, lng: -87.24 },
];

function buildRepairShops(): NearbyRepairShop[] {
  const shops: NearbyRepairShop[] = [];
  let id = 0;
  for (const loc of REPAIR_LOCATIONS) {
    const count = 2 + (id % 2);
    for (let s = 0; s < count; s++) {
      const chain = REPAIR_CHAINS[(id + s) % REPAIR_CHAINS.length];
      const hourSeed = (id + s) % 3;
      const hours = hourSeed === 0 ? "7am–6pm Mon-Sat" : hourSeed === 1 ? "8am–5pm Mon-Fri" : "24/7 Emergency";
      const phoneSeed = 2000 + id * 7 + s * 3;
      const areaCode = 200 + (id % 800);
      shops.push({
        id: `rs-${id}-${s}`,
        name: `${chain.prefix} — ${loc.city}`,
        brand: chain.brand,
        type: chain.type,
        city: loc.city,
        state: loc.state,
        lat: loc.lat + s * 0.016 - 0.008,
        lng: loc.lng + s * 0.013 - 0.007,
        services: chain.services,
        hasMobileService: chain.hasMobileService,
        acceptsEmergency: chain.acceptsEmergency,
        hours,
        phone: `(${areaCode}) 555-${String(phoneSeed).padStart(4, "0")}`,
        distanceMiles: 0,
        directionsUrl: "",
      });
      id++;
    }
  }
  return shops;
}

const ALL_REPAIR_SHOPS = buildRepairShops();

// ─── Finder Functions ────────────────────────────────────────

/**
 * Find nearest fuel stations to a campsite
 * @param lat campsite latitude
 * @param lng campsite longitude
 * @param radiusMiles search radius (default 50)
 * @param limit max results (default 5)
 */
export function findNearbyFuelStations(
  lat: number,
  lng: number,
  radiusMiles: number = 50,
  limit: number = 5
): NearbyFuelStation[] {
  return ALL_FUEL_STATIONS
    .map((s) => {
      const d = haversineDistance(lat, lng, s.lat, s.lng);
      return {
        ...s,
        distanceMiles: Math.round(d * 10) / 10,
        directionsUrl: directionsUrl(lat, lng, s.lat, s.lng),
      };
    })
    .filter((s) => s.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}

/**
 * Find nearest camping supply stores to a campsite
 */
export function findNearbySupplyStores(
  lat: number,
  lng: number,
  radiusMiles: number = 50,
  limit: number = 5
): NearbySupplyStore[] {
  return ALL_SUPPLY_STORES
    .map((s) => {
      const d = haversineDistance(lat, lng, s.lat, s.lng);
      return {
        ...s,
        distanceMiles: Math.round(d * 10) / 10,
        directionsUrl: directionsUrl(lat, lng, s.lat, s.lng),
      };
    })
    .filter((s) => s.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}

/**
 * Find nearest RV repair shops to a campsite
 */
export function findNearbyRepairShops(
  lat: number,
  lng: number,
  radiusMiles: number = 75,
  limit: number = 5
): NearbyRepairShop[] {
  return ALL_REPAIR_SHOPS
    .map((s) => {
      const d = haversineDistance(lat, lng, s.lat, s.lng);
      return {
        ...s,
        distanceMiles: Math.round(d * 10) / 10,
        directionsUrl: directionsUrl(lat, lng, s.lat, s.lng),
      };
    })
    .filter((s) => s.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}
