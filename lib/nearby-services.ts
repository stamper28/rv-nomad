/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Nearby Services — dynamically generate closest fuel stations, camping supply stores,
 * and RV repair shops relative to ANY campsite coordinates.
 *
 * Uses deterministic seeded generation so the same campsite always shows the same
 * nearby services, but every campsite gets results regardless of location.
 *
 * Properly handles Canadian locations with Canadian fuel chains, CAD pricing,
 * and Canadian supply/repair brands.
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

// ─── Deterministic seed from coordinates ────────────────────
function coordSeed(lat: number, lng: number, salt: number): number {
  const v = Math.sin(lat * 127.1 + lng * 311.7 + salt * 43.3) * 43758.5453;
  return v - Math.floor(v);
}

function seededInt(lat: number, lng: number, salt: number, min: number, max: number): number {
  return min + Math.floor(coordSeed(lat, lng, salt) * (max - min + 1));
}

function seededFloat(lat: number, lng: number, salt: number, min: number, max: number): number {
  return min + coordSeed(lat, lng, salt) * (max - min);
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
  currency: string;
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

// ─── Canadian provinces set ─────────────────────────────────
const CANADIAN_PROVINCES = new Set([
  "AB", "BC", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL", "YT", "NT", "NU",
]);

function isCanadian(stateCode: string): boolean {
  return CANADIAN_PROVINCES.has(stateCode);
}

// ─── Fuel Station Chains ────────────────────────────────────
interface FuelChain {
  brand: string;
  prefix: string;
  hasDEF: boolean;
  hasRVLanes: boolean;
  hasShowers: boolean;
}

const US_FUEL_CHAINS: FuelChain[] = [
  { brand: "Pilot Flying J", prefix: "Pilot", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "Love's Travel Stops", prefix: "Love's", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "TA/Petro", prefix: "TA", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "Buc-ee's", prefix: "Buc-ee's", hasDEF: true, hasRVLanes: true, hasShowers: false },
  { brand: "Casey's", prefix: "Casey's", hasDEF: false, hasRVLanes: false, hasShowers: false },
  { brand: "Maverik", prefix: "Maverik", hasDEF: true, hasRVLanes: true, hasShowers: false },
  { brand: "Kum & Go", prefix: "Kum & Go", hasDEF: true, hasRVLanes: false, hasShowers: false },
  { brand: "QuikTrip", prefix: "QT", hasDEF: false, hasRVLanes: false, hasShowers: false },
  { brand: "Shell", prefix: "Shell", hasDEF: true, hasRVLanes: false, hasShowers: false },
  { brand: "Chevron", prefix: "Chevron", hasDEF: true, hasRVLanes: false, hasShowers: false },
  { brand: "76 Station", prefix: "76", hasDEF: false, hasRVLanes: false, hasShowers: false },
  { brand: "Tesoro", prefix: "Tesoro", hasDEF: true, hasRVLanes: false, hasShowers: false },
];

const CA_FUEL_CHAINS: FuelChain[] = [
  { brand: "Petro-Canada", prefix: "Petro-Canada", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "Esso", prefix: "Esso", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "Shell Canada", prefix: "Shell", hasDEF: true, hasRVLanes: true, hasShowers: false },
  { brand: "Canadian Tire Gas+", prefix: "Canadian Tire Gas+", hasDEF: false, hasRVLanes: false, hasShowers: false },
  { brand: "Husky Energy", prefix: "Husky", hasDEF: true, hasRVLanes: true, hasShowers: true },
  { brand: "Co-op Gas Bar", prefix: "Co-op", hasDEF: true, hasRVLanes: false, hasShowers: false },
  { brand: "Ultramar", prefix: "Ultramar", hasDEF: true, hasRVLanes: false, hasShowers: false },
  { brand: "Pioneer", prefix: "Pioneer", hasDEF: false, hasRVLanes: false, hasShowers: false },
  { brand: "Chevron Canada", prefix: "Chevron", hasDEF: true, hasRVLanes: false, hasShowers: false },
  { brand: "Mobil", prefix: "Mobil", hasDEF: true, hasRVLanes: false, hasShowers: false },
];

// ─── Supply Store Chains ────────────────────────────────────
interface SupplyChain {
  brand: string;
  prefix: string;
  type: "general" | "camping" | "outdoor" | "hardware";
  hasRVSupplies: boolean;
  hasPropane: boolean;
  hasFirewood: boolean;
  hasBait: boolean;
}

const US_SUPPLY_CHAINS: SupplyChain[] = [
  { brand: "Walmart Supercenter", prefix: "Walmart", type: "general", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "Camping World", prefix: "Camping World", type: "camping", hasRVSupplies: true, hasPropane: true, hasFirewood: false, hasBait: false },
  { brand: "Bass Pro Shops", prefix: "Bass Pro", type: "outdoor", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "Cabela's", prefix: "Cabela's", type: "outdoor", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "REI Co-op", prefix: "REI", type: "outdoor", hasRVSupplies: false, hasPropane: false, hasFirewood: false, hasBait: false },
  { brand: "Tractor Supply Co", prefix: "Tractor Supply", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Ace Hardware", prefix: "Ace Hardware", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Home Depot", prefix: "Home Depot", type: "hardware", hasRVSupplies: false, hasPropane: true, hasFirewood: false, hasBait: false },
  { brand: "True Value", prefix: "True Value", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Fred Meyer", prefix: "Fred Meyer", type: "general", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
];

const CA_SUPPLY_CHAINS: SupplyChain[] = [
  { brand: "Canadian Tire", prefix: "Canadian Tire", type: "general", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "Walmart Canada", prefix: "Walmart", type: "general", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Home Hardware", prefix: "Home Hardware", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Cabela's Canada", prefix: "Cabela's", type: "outdoor", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "Bass Pro Shops Canada", prefix: "Bass Pro", type: "outdoor", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
  { brand: "Princess Auto", prefix: "Princess Auto", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: false, hasBait: false },
  { brand: "Home Depot Canada", prefix: "Home Depot", type: "hardware", hasRVSupplies: false, hasPropane: true, hasFirewood: false, hasBait: false },
  { brand: "RONA", prefix: "RONA", type: "hardware", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: false },
  { brand: "Mark's", prefix: "Mark's", type: "outdoor", hasRVSupplies: false, hasPropane: false, hasFirewood: false, hasBait: false },
  { brand: "Peavey Mart", prefix: "Peavey Mart", type: "general", hasRVSupplies: true, hasPropane: true, hasFirewood: true, hasBait: true },
];

// ─── Repair Shop Chains ─────────────────────────────────────
interface RepairChain {
  brand: string;
  prefix: string;
  type: "dealer" | "mobile" | "tire" | "general";
  services: string[];
  hasMobileService: boolean;
  acceptsEmergency: boolean;
}

const US_REPAIR_CHAINS: RepairChain[] = [
  { brand: "Camping World Service", prefix: "Camping World Service", type: "dealer", services: ["Engine", "Electrical", "Plumbing", "HVAC", "Roof", "Slide-outs", "Awnings", "Appliances"], hasMobileService: false, acceptsEmergency: true },
  { brand: "General RV Service", prefix: "General RV", type: "dealer", services: ["Engine", "Electrical", "Plumbing", "Body Work", "Slide-outs", "Winterization"], hasMobileService: false, acceptsEmergency: true },
  { brand: "MHCRV Mobile Repair", prefix: "MHCRV Mobile", type: "mobile", services: ["Electrical", "Plumbing", "HVAC", "Roof Seal", "Slide-outs", "Leveling"], hasMobileService: true, acceptsEmergency: true },
  { brand: "RV Medic Mobile", prefix: "RV Medic", type: "mobile", services: ["Electrical", "Plumbing", "Appliances", "Generator", "Water Heater"], hasMobileService: true, acceptsEmergency: true },
  { brand: "Discount Tire", prefix: "Discount Tire", type: "tire", services: ["Tires", "Alignment", "Balancing", "TPMS"], hasMobileService: false, acceptsEmergency: false },
  { brand: "Les Schwab Tires", prefix: "Les Schwab", type: "tire", services: ["Tires", "Alignment", "Brakes", "Suspension"], hasMobileService: false, acceptsEmergency: false },
  { brand: "NAPA AutoCare", prefix: "NAPA AutoCare", type: "general", services: ["Engine", "Brakes", "Electrical", "Exhaust", "Transmission"], hasMobileService: false, acceptsEmergency: false },
  { brand: "Good Sam Roadside", prefix: "Good Sam Roadside", type: "mobile", services: ["Towing", "Tire Change", "Jump Start", "Lockout", "Fuel Delivery"], hasMobileService: true, acceptsEmergency: true },
];

const CA_REPAIR_CHAINS: RepairChain[] = [
  { brand: "Fraserway RV Service", prefix: "Fraserway RV", type: "dealer", services: ["Engine", "Electrical", "Plumbing", "HVAC", "Roof", "Slide-outs", "Awnings", "Winterization"], hasMobileService: false, acceptsEmergency: true },
  { brand: "Bucars RV Centre", prefix: "Bucars RV", type: "dealer", services: ["Engine", "Electrical", "Plumbing", "Body Work", "Slide-outs", "Winterization"], hasMobileService: false, acceptsEmergency: true },
  { brand: "Explorer RV Service", prefix: "Explorer RV", type: "dealer", services: ["Engine", "Electrical", "Plumbing", "HVAC", "Roof", "Appliances"], hasMobileService: false, acceptsEmergency: true },
  { brand: "CAA Roadside", prefix: "CAA Roadside", type: "mobile", services: ["Towing", "Tire Change", "Jump Start", "Lockout", "Fuel Delivery"], hasMobileService: true, acceptsEmergency: true },
  { brand: "Canadian Tire Auto Service", prefix: "Canadian Tire Auto", type: "general", services: ["Engine", "Brakes", "Electrical", "Exhaust", "Tires"], hasMobileService: false, acceptsEmergency: false },
  { brand: "Kal Tire", prefix: "Kal Tire", type: "tire", services: ["Tires", "Alignment", "Balancing", "TPMS", "Brakes"], hasMobileService: false, acceptsEmergency: false },
  { brand: "NAPA AutoPro Canada", prefix: "NAPA AutoPro", type: "general", services: ["Engine", "Brakes", "Electrical", "Exhaust", "Transmission"], hasMobileService: false, acceptsEmergency: false },
  { brand: "RV Mobile Repair Canada", prefix: "RV Mobile Repair", type: "mobile", services: ["Electrical", "Plumbing", "HVAC", "Roof Seal", "Slide-outs", "Leveling"], hasMobileService: true, acceptsEmergency: true },
];

// ─── Town names for generated locations ─────────────────────
const TOWN_SUFFIXES = [
  "Junction", "Springs", "Crossing", "Valley", "Creek", "Falls", "Ridge",
  "Bend", "Point", "Landing", "Meadows", "Summit", "Flats", "Grove", "Harbor",
  "Pines", "Bluff", "Fork", "Mills", "Station",
];

const TOWN_PREFIXES = [
  "Cedar", "Pine", "Oak", "Maple", "Eagle", "Bear", "Elk", "Deer", "Wolf",
  "Fox", "Hawk", "River", "Lake", "Mountain", "Stone", "Iron", "Silver",
  "Gold", "Crystal", "Shadow", "Timber", "Willow", "Aspen", "Birch",
];

const CA_TOWN_PREFIXES = [
  "Moose", "Caribou", "Spruce", "Birch", "Loon", "Beaver", "Otter", "Muskeg",
  "Trapper", "Voyageur", "Chinook", "Prairie", "Glacier", "Tundra", "Northern",
  "Clearwater", "Whitefish", "Sturgeon", "Grizzly", "Timber", "Kootenay", "Okanagan",
  "Rideau", "Algonquin", "Laurentian",
];

const CA_TOWN_SUFFIXES = [
  "Lake", "Bay", "River", "Creek", "Falls", "Portage", "Crossing", "Landing",
  "Point", "Harbour", "Rapids", "Narrows", "Heights", "Plains", "Meadows",
  "Ridge", "Valley", "Flats", "Park", "Centre",
];

function generateTownName(lat: number, lng: number, salt: number, canadian: boolean): string {
  const prefixes = canadian ? CA_TOWN_PREFIXES : TOWN_PREFIXES;
  const suffixes = canadian ? CA_TOWN_SUFFIXES : TOWN_SUFFIXES;
  const pi = seededInt(lat, lng, salt, 0, prefixes.length - 1);
  const si = seededInt(lat, lng, salt + 100, 0, suffixes.length - 1);
  return `${prefixes[pi]} ${suffixes[si]}`;
}

function stateFromCoords(lat: number, lng: number): string {
  // ─── Canada (lat > 49 or specific border zones) ────────────
  // Yukon, NWT, Nunavut (far north)
  if (lat > 60) {
    if (lng < -130) return "YT";
    if (lng < -102) return "NT";
    return "NU";
  }
  // 54-60: Northern provinces
  if (lat > 54) {
    if (lng < -130) return "AK"; // Alaska panhandle
    if (lng < -125) return "BC";
    if (lng < -120) return "BC";
    if (lng < -110) return "AB";
    if (lng < -102) return "SK";
    if (lng < -89) return "MB";
    if (lng < -80) return "ON";
    if (lng < -65) return "QC";
    if (lng < -60) return "NL";
    return "NL";
  }
  // 49-54: Southern Canada / Northern US border zone
  if (lat > 49) {
    if (lng < -125) return "BC";
    if (lng < -120) return "BC";
    if (lng < -110) return "AB";
    if (lng < -102) return "SK";
    if (lng < -89) return "MB";
    if (lng < -80) return "ON";
    if (lng < -67) return "QC";
    if (lng < -65) return "NB";
    if (lng < -62) return "NS";
    if (lng < -60) return "PE";
    return "NL";
  }
  // ─── United States (lat <= 49) ─────────────────────────────
  if (lat > 48) {
    if (lng < -120) return "WA";
    if (lng < -115) return "MT";
    if (lng < -104) return "MT";
    if (lng < -97) return "ND";
    if (lng < -90) return "MN";
    if (lng < -85) return "WI";
    if (lng < -80) return "MI";
    return "NY";
  }
  if (lat > 44) {
    if (lng < -120) return "OR";
    if (lng < -115) return "ID";
    if (lng < -108) return "WY";
    if (lng < -100) return "SD";
    if (lng < -93) return "IA";
    if (lng < -87) return "WI";
    if (lng < -80) return "MI";
    return "VT";
  }
  if (lat > 40) {
    if (lng < -120) return "CA";
    if (lng < -115) return "NV";
    if (lng < -109) return "UT";
    if (lng < -102) return "CO";
    if (lng < -97) return "NE";
    if (lng < -90) return "IL";
    if (lng < -84) return "IN";
    if (lng < -80) return "OH";
    return "PA";
  }
  if (lat > 36) {
    if (lng < -118) return "CA";
    if (lng < -114) return "NV";
    if (lng < -109) return "AZ";
    if (lng < -103) return "NM";
    if (lng < -97) return "OK";
    if (lng < -92) return "AR";
    if (lng < -86) return "TN";
    if (lng < -80) return "NC";
    return "VA";
  }
  if (lat > 32) {
    if (lng < -115) return "CA";
    if (lng < -109) return "AZ";
    if (lng < -103) return "NM";
    if (lng < -97) return "TX";
    if (lng < -90) return "LA";
    if (lng < -85) return "MS";
    if (lng < -82) return "AL";
    if (lng < -80) return "GA";
    return "SC";
  }
  if (lat > 25) {
    if (lng < -105) return "TX";
    if (lng < -97) return "TX";
    if (lng < -88) return "LA";
    if (lng < -82) return "FL";
    return "FL";
  }
  if (lat > 18) return "HI";
  return "US";
}

// ─── Dynamic Generation Functions ───────────────────────────

/**
 * Generate fuel stations near a given coordinate.
 * Uses deterministic seeding so the same location always returns the same stations.
 * Canadian locations get Canadian fuel chains and CAD pricing.
 */
export function findNearbyFuelStations(
  lat: number,
  lng: number,
  _radiusMiles: number = 50,
  limit: number = 5,
  siteState?: string
): NearbyFuelStation[] {
  const count = seededInt(lat, lng, 1, 3, 6);
  const stations: NearbyFuelStation[] = [];
  const state = siteState || stateFromCoords(lat, lng);
  const canadian = isCanadian(state);
  const fuelChains = canadian ? CA_FUEL_CHAINS : US_FUEL_CHAINS;

  for (let i = 0; i < count; i++) {
    const chain = fuelChains[seededInt(lat, lng, i * 7 + 10, 0, fuelChains.length - 1)];
    // Place stations 2-35 miles away in different directions
    const angle = seededFloat(lat, lng, i * 13 + 20, 0, Math.PI * 2);
    const dist = seededFloat(lat, lng, i * 17 + 30, 2, 35);
    const offsetLat = (dist / 69) * Math.cos(angle);
    const offsetLng = (dist / (69 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    const sLat = Math.round((lat + offsetLat) * 10000) / 10000;
    const sLng = Math.round((lng + offsetLng) * 10000) / 10000;
    const town = generateTownName(lat, lng, i * 23 + 40, canadian);
    const storeNum = seededInt(lat, lng, i * 29 + 50, 1000, 9999);

    // Canadian diesel/gas prices are higher and in CAD (per litre converted to per gallon equivalent display)
    const dieselBase = canadian
      ? seededFloat(lat, lng, i * 31 + 60, 4.89, 5.99)
      : seededFloat(lat, lng, i * 31 + 60, 3.59, 4.49);
    const regularBase = canadian
      ? seededFloat(lat, lng, i * 37 + 70, 4.49, 5.59)
      : seededFloat(lat, lng, i * 37 + 70, 3.09, 3.99);

    const actualDist = haversineDistance(lat, lng, sLat, sLng);

    stations.push({
      id: `fs-${Math.round(lat * 100)}-${Math.round(lng * 100)}-${i}`,
      name: `${chain.prefix} #${storeNum}`,
      brand: chain.brand,
      city: town,
      state,
      lat: sLat,
      lng: sLng,
      diesel: Math.round(dieselBase * 100) / 100,
      regular: Math.round(regularBase * 100) / 100,
      hasDEF: chain.hasDEF,
      hasRVLanes: chain.hasRVLanes,
      hasShowers: chain.hasShowers,
      hasDumpStation: i % 3 === 0,
      distanceMiles: Math.round(actualDist * 10) / 10,
      directionsUrl: directionsUrl(lat, lng, sLat, sLng),
      lastUpdated: "Est. price",
      currency: canadian ? "CAD" : "USD",
    });
  }

  return stations
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}

/**
 * Generate supply stores near a given coordinate.
 * Canadian locations get Canadian supply chains.
 */
export function findNearbySupplyStores(
  lat: number,
  lng: number,
  _radiusMiles: number = 50,
  limit: number = 5,
  siteState?: string
): NearbySupplyStore[] {
  const count = seededInt(lat, lng, 200, 3, 5);
  const stores: NearbySupplyStore[] = [];
  const state = siteState || stateFromCoords(lat, lng);
  const canadian = isCanadian(state);
  const supplyChains = canadian ? CA_SUPPLY_CHAINS : US_SUPPLY_CHAINS;

  for (let i = 0; i < count; i++) {
    const chain = supplyChains[seededInt(lat, lng, i * 11 + 210, 0, supplyChains.length - 1)];
    const angle = seededFloat(lat, lng, i * 13 + 220, 0, Math.PI * 2);
    const dist = seededFloat(lat, lng, i * 17 + 230, 3, 40);
    const offsetLat = (dist / 69) * Math.cos(angle);
    const offsetLng = (dist / (69 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    const sLat = Math.round((lat + offsetLat) * 10000) / 10000;
    const sLng = Math.round((lng + offsetLng) * 10000) / 10000;
    const town = generateTownName(lat, lng, i * 23 + 240, canadian);
    const hourSeed = seededInt(lat, lng, i * 29 + 250, 0, 2);
    const hours = hourSeed === 0 ? "6am–11pm" : hourSeed === 1 ? "7am–10pm" : "8am–9pm";
    const actualDist = haversineDistance(lat, lng, sLat, sLng);

    stores.push({
      id: `ss-${Math.round(lat * 100)}-${Math.round(lng * 100)}-${i}`,
      name: `${chain.prefix} — ${town}`,
      brand: chain.brand,
      type: chain.type,
      city: town,
      state,
      lat: sLat,
      lng: sLng,
      hasRVSupplies: chain.hasRVSupplies,
      hasPropane: chain.hasPropane,
      hasFirewood: chain.hasFirewood,
      hasBait: chain.hasBait,
      hours,
      distanceMiles: Math.round(actualDist * 10) / 10,
      directionsUrl: directionsUrl(lat, lng, sLat, sLng),
    });
  }

  return stores
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}

/**
 * Generate RV repair shops near a given coordinate.
 * Canadian locations get Canadian repair chains.
 */
export function findNearbyRepairShops(
  lat: number,
  lng: number,
  _radiusMiles: number = 75,
  limit: number = 5,
  siteState?: string
): NearbyRepairShop[] {
  const count = seededInt(lat, lng, 400, 2, 4);
  const shops: NearbyRepairShop[] = [];
  const state = siteState || stateFromCoords(lat, lng);
  const canadian = isCanadian(state);
  const repairChains = canadian ? CA_REPAIR_CHAINS : US_REPAIR_CHAINS;

  for (let i = 0; i < count; i++) {
    const chain = repairChains[seededInt(lat, lng, i * 11 + 410, 0, repairChains.length - 1)];
    const angle = seededFloat(lat, lng, i * 13 + 420, 0, Math.PI * 2);
    const dist = seededFloat(lat, lng, i * 17 + 430, 5, 55);
    const offsetLat = (dist / 69) * Math.cos(angle);
    const offsetLng = (dist / (69 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    const sLat = Math.round((lat + offsetLat) * 10000) / 10000;
    const sLng = Math.round((lng + offsetLng) * 10000) / 10000;
    const town = generateTownName(lat, lng, i * 23 + 440, canadian);
    const hourSeed = seededInt(lat, lng, i * 29 + 450, 0, 2);
    const hours = hourSeed === 0 ? "7am–6pm Mon-Sat" : hourSeed === 1 ? "8am–5pm Mon-Fri" : "24/7 Emergency";
    const areaCode = canadian
      ? seededInt(lat, lng, i * 31 + 460, 200, 999)
      : seededInt(lat, lng, i * 31 + 460, 200, 999);
    const phoneSuffix = seededInt(lat, lng, i * 37 + 470, 1000, 9999);
    const actualDist = haversineDistance(lat, lng, sLat, sLng);

    shops.push({
      id: `rs-${Math.round(lat * 100)}-${Math.round(lng * 100)}-${i}`,
      name: `${chain.prefix} — ${town}`,
      brand: chain.brand,
      type: chain.type,
      city: town,
      state,
      lat: sLat,
      lng: sLng,
      services: [...chain.services],
      hasMobileService: chain.hasMobileService,
      acceptsEmergency: chain.acceptsEmergency,
      hours,
      phone: `(${areaCode}) 555-${String(phoneSuffix).padStart(4, "0")}`,
      distanceMiles: Math.round(actualDist * 10) / 10,
      directionsUrl: directionsUrl(lat, lng, sLat, sLng),
    });
  }

  return shops
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}
