/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

/**
 * Nearby Hotels — deterministically generate hotels near RV repair shops
 * so users know where to stay if their RV is in the shop overnight.
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

// ─── Deterministic seed ─────────────────────────────────────
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

// ─── Types ──────────────────────────────────────────────────
export interface NearbyHotel {
  id: string;
  name: string;
  brand: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  rating: number;
  petFriendly: boolean;
  hasShuttle: boolean;
  hasBreakfast: boolean;
  hasPool: boolean;
  hasLaundry: boolean;
  phone: string;
  distanceMiles: number;
  directionsUrl: string;
  bookingUrl: string;
}

// ─── Hotel Chains ───────────────────────────────────────────
interface HotelChain {
  brand: string;
  prefix: string;
  priceMin: number;
  priceMax: number;
  ratingMin: number;
  ratingMax: number;
  petFriendly: boolean;
  hasShuttle: boolean;
  hasBreakfast: boolean;
  hasPool: boolean;
  hasLaundry: boolean;
}

const US_HOTEL_CHAINS: HotelChain[] = [
  { brand: "Holiday Inn Express", prefix: "Holiday Inn Express", priceMin: 109, priceMax: 169, ratingMin: 38, ratingMax: 44, petFriendly: true, hasShuttle: true, hasBreakfast: true, hasPool: true, hasLaundry: true },
  { brand: "Hampton Inn", prefix: "Hampton Inn", priceMin: 119, priceMax: 179, ratingMin: 40, ratingMax: 46, petFriendly: false, hasShuttle: true, hasBreakfast: true, hasPool: true, hasLaundry: true },
  { brand: "Comfort Inn", prefix: "Comfort Inn", priceMin: 89, priceMax: 139, ratingMin: 35, ratingMax: 42, petFriendly: true, hasShuttle: false, hasBreakfast: true, hasPool: true, hasLaundry: true },
  { brand: "La Quinta", prefix: "La Quinta Inn & Suites", priceMin: 79, priceMax: 129, ratingMin: 34, ratingMax: 41, petFriendly: true, hasShuttle: false, hasBreakfast: true, hasPool: true, hasLaundry: true },
  { brand: "Super 8", prefix: "Super 8", priceMin: 59, priceMax: 99, ratingMin: 28, ratingMax: 36, petFriendly: true, hasShuttle: false, hasBreakfast: true, hasPool: false, hasLaundry: true },
  { brand: "Motel 6", prefix: "Motel 6", priceMin: 49, priceMax: 79, ratingMin: 25, ratingMax: 33, petFriendly: true, hasShuttle: false, hasBreakfast: false, hasPool: false, hasLaundry: true },
  { brand: "Best Western", prefix: "Best Western", priceMin: 99, priceMax: 159, ratingMin: 36, ratingMax: 43, petFriendly: true, hasShuttle: false, hasBreakfast: true, hasPool: true, hasLaundry: true },
  { brand: "Fairfield Inn", prefix: "Fairfield Inn & Suites", priceMin: 109, priceMax: 169, ratingMin: 39, ratingMax: 45, petFriendly: true, hasShuttle: true, hasBreakfast: true, hasPool: true, hasLaundry: true },
];

const CA_HOTEL_CHAINS: HotelChain[] = [
  { brand: "Holiday Inn Express", prefix: "Holiday Inn Express", priceMin: 139, priceMax: 219, ratingMin: 38, ratingMax: 44, petFriendly: true, hasShuttle: true, hasBreakfast: true, hasPool: true, hasLaundry: true },
  { brand: "Comfort Inn", prefix: "Comfort Inn", priceMin: 109, priceMax: 179, ratingMin: 35, ratingMax: 42, petFriendly: true, hasShuttle: false, hasBreakfast: true, hasPool: true, hasLaundry: true },
  { brand: "Super 8", prefix: "Super 8", priceMin: 79, priceMax: 129, ratingMin: 28, ratingMax: 36, petFriendly: true, hasShuttle: false, hasBreakfast: true, hasPool: false, hasLaundry: true },
  { brand: "Best Western", prefix: "Best Western", priceMin: 119, priceMax: 189, ratingMin: 36, ratingMax: 43, petFriendly: true, hasShuttle: false, hasBreakfast: true, hasPool: true, hasLaundry: true },
];

const CANADIAN_PROVINCES = new Set([
  "AB", "BC", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL", "YT", "NT", "NU",
]);

function isCanadian(stateCode: string): boolean {
  return CANADIAN_PROVINCES.has(stateCode);
}

function generateTownName(lat: number, lng: number, salt: number, canadian: boolean): string {
  const usTowns = [
    "Springfield", "Riverside", "Fairview", "Georgetown", "Madison",
    "Clinton", "Franklin", "Greenville", "Bristol", "Salem",
    "Chester", "Marion", "Ashland", "Dover", "Oxford",
    "Burlington", "Lexington", "Milton", "Clayton", "Troy",
  ];
  const caTowns = [
    "Maple Ridge", "Cedar Grove", "Pine Valley", "Lakeside", "Clearwater",
    "Birchwood", "Stonebridge", "Millbrook", "Oakville", "Riverside",
  ];
  const towns = canadian ? caTowns : usTowns;
  return towns[seededInt(lat, lng, salt, 0, towns.length - 1)];
}

// ─── Main Function ──────────────────────────────────────────
export function findNearbyHotels(
  lat: number,
  lng: number,
  radiusMiles: number = 30,
  limit: number = 3,
  siteState?: string
): NearbyHotel[] {
  const state = siteState || "US";
  const canadian = isCanadian(state);
  const chains = canadian ? CA_HOTEL_CHAINS : US_HOTEL_CHAINS;
  const currency = canadian ? "CAD" : "USD";
  const hotels: NearbyHotel[] = [];

  const count = Math.min(limit + 1, chains.length);

  for (let i = 0; i < count; i++) {
    const chain = chains[seededInt(lat, lng, i * 7 + 800, 0, chains.length - 1)];
    const angle = seededFloat(lat, lng, i * 11 + 810, 0, Math.PI * 2);
    const dist = seededFloat(lat, lng, i * 13 + 820, 0.5, radiusMiles * 0.6);
    const offsetLat = (dist / 69) * Math.cos(angle);
    const offsetLng = (dist / (69 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    const hLat = Math.round((lat + offsetLat) * 10000) / 10000;
    const hLng = Math.round((lng + offsetLng) * 10000) / 10000;
    const town = generateTownName(lat, lng, i * 17 + 830, canadian);
    const price = seededInt(lat, lng, i * 19 + 840, chain.priceMin, chain.priceMax);
    const ratingRaw = seededInt(lat, lng, i * 23 + 850, chain.ratingMin, chain.ratingMax);
    const rating = ratingRaw / 10;
    const areaCode = seededInt(lat, lng, i * 29 + 860, 200, 999);
    const phoneSuffix = seededInt(lat, lng, i * 31 + 870, 1000, 9999);
    const actualDist = haversineDistance(lat, lng, hLat, hLng);

    const searchName = encodeURIComponent(`${chain.prefix} ${town} ${state}`);
    const bookingUrl = `https://www.google.com/travel/hotels?q=${searchName}`;

    hotels.push({
      id: `htl-${Math.round(lat * 100)}-${Math.round(lng * 100)}-${i}`,
      name: `${chain.prefix} — ${town}`,
      brand: chain.brand,
      city: town,
      state,
      lat: hLat,
      lng: hLng,
      pricePerNight: price,
      rating,
      petFriendly: chain.petFriendly,
      hasShuttle: chain.hasShuttle,
      hasBreakfast: chain.hasBreakfast,
      hasPool: chain.hasPool,
      hasLaundry: chain.hasLaundry,
      phone: `(${areaCode}) 555-${String(phoneSuffix).padStart(4, "0")}`,
      distanceMiles: Math.round(actualDist * 10) / 10,
      directionsUrl: directionsUrl(lat, lng, hLat, hLng),
      bookingUrl,
    });
  }

  return hotels
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}
