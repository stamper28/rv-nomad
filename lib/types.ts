/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/** All site categories in the app — AllStays + Roadtrippers coverage */
export type SiteCategory =
  // === Camping & Overnight ===
  | "rv_park"
  | "national_park"
  | "state_park"
  | "boondocking"
  | "blm"
  | "national_forest"
  | "military"
  | "harvest_host"
  | "walmart"
  | "cracker_barrel"
  | "rest_area"
  | "casino_parking"
  | "cabelas_bass_pro"
  | "truck_stop"
  | "elks_moose"
  | "army_corps"
  | "county_park"
  | "provincial_park"
  // === RV Services ===
  | "dump_station"
  | "weight_scale"
  | "fuel_station"
  | "propane"
  | "rv_repair"
  | "water_fill"
  | "laundromat"
  | "rv_wash"
  | "rv_tires"
  | "rv_dealer"
  // === Road Safety ===
  | "low_clearance"
  | "weigh_station"
  | "road_condition"
  // === Supplies & Essentials ===
  | "rv_grocery"
  | "rv_supply_store"
  | "outdoor_store"
  // === Connectivity ===
  | "cell_coverage"
  | "free_wifi"
  // === Roadtrippers POI ===
  | "attraction"
  | "scenic_view"
  | "restaurant"
  | "roadside_oddity"
  | "historic_site"
  | "visitor_center";

export interface WeightScale {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  city: string;
  address: string;
  type: "cat_scale" | "public_weigh_station" | "truck_stop_scale";
  cost: string;
  hours: string;
  hasCertified: boolean;
  notes?: string;
}

export interface SiteReview {
  id: string;
  author: string;
  date: string; // e.g. "2025-09-15"
  rating: number; // 1-5
  title: string;
  body: string;
  rigType?: string; // e.g. "Class A 38ft", "Travel Trailer 28ft"
  helpful?: number;
}

export interface CampSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string; // 2-letter code
  city: string;
  category: SiteCategory;
  rating: number;
  reviewCount: number;
  pricePerNight: number | null; // null = free
  amenities: string[];
  description: string;
  phone?: string;
  website?: string;
  discounts?: string[];
  isPremium?: boolean;
  reviews?: SiteReview[];
  // Low clearance specific
  clearanceHeight?: string;
  // Cell coverage specific
  carriers?: string[];
  signalStrength?: string;
  // Overnight parking specific
  overnightPolicy?: string;
  // Road condition specific
  roadGrade?: string;
  // RV size limits
  maxRVLength?: string;    // e.g. "45 ft", "No limit"
  maxTrailerLength?: string; // e.g. "35 ft"
  maxRVHeight?: string;    // e.g. "13 ft 6 in"
  maxRVWidth?: string;     // e.g. "8 ft 6 in"
  pullThrough?: boolean;   // has pull-through sites
  bigRigFriendly?: boolean; // suitable for 40ft+ rigs
  // === New competitive fields ===
  petFriendly?: boolean | "leash_only" | "off_leash_area"; // pet policy
  noiseLevel?: "quiet" | "moderate" | "noisy"; // campground noise
  cellSignal?: { att?: number; verizon?: number; tmobile?: number }; // 0-5 bars
  elevation?: number; // feet above sea level
  waterQuality?: "potable" | "non_potable" | "bring_own" | "unknown";
  crowdLevel?: "low" | "moderate" | "high"; // typical crowd level
  bestSeason?: string; // e.g. "May-October", "Year-round"
  // === Membership & Affiliate ===
  membershipRequired?: string; // e.g. "Harvest Hosts ($99/yr)", "Good Sam ($29/yr)"
  affiliateUrl?: string; // affiliate link for membership signup
  bookingUrl?: string; // direct booking URL (Recreation.gov, KOA, etc.)
  bookingPlatform?: string; // e.g. "Recreation.gov", "KOA", "Hipcamp"
  // === Hookup & Facility Details ===
  hookupType?: "full" | "water_electric" | "electric_only" | "dry" | "none"; // 50A/30A/20A
  ampService?: "50" | "30" | "20" | "50_30" | "30_20"; // amp service available
  sewerHookup?: boolean;
  waterHookup?: boolean;
  // === Contact & Booking ===
  phoneNumber?: string; // tap to call
  checkInTime?: string; // e.g. "2:00 PM"
  checkOutTime?: string; // e.g. "11:00 AM"
  // === Seasonal & Availability ===
  seasonalDates?: string; // e.g. "May 1 - Oct 15", "Year-round"
  isOpen?: boolean; // currently open?
  reservationRequired?: boolean;
  // === Accessibility ===
  adaAccessible?: boolean; // ADA/wheelchair accessible sites
  adaDetails?: string; // e.g. "2 ADA sites, paved paths, accessible restrooms"
  adaEquipmentRental?: string[]; // e.g. ["Beach wheelchair", "Track chair", "All-terrain wheelchair"]
  adaMapUrl?: string; // Google Maps link to the accessible area/campground
  // === Quiet Hours & Rules ===
  generatorHours?: string; // e.g. "8 AM - 8 PM", "No generators"
  quietHours?: string; // e.g. "10 PM - 7 AM"
  // === New Gap-Closing Fields ===
  ageRestriction?: string; // e.g. "55+", "None", "21+ only"
  boatLaunch?: boolean; // has boat ramp/launch
  firewood?: string; // e.g. "Sold on-site $7/bundle", "Gathering allowed", "Bring your own"
  // === Social & Check-in ===
  checkedInUsers?: number; // current users checked in
}

export interface StateLaws {
  stateCode: string;
  stateName: string;
  overnightParking: string;
  boondockingLegality: string;
  walmartParking: string;
  maxRVLength: string;
  maxRVHeight: string;
  maxRVWeight: string;
  propaneTunnels: string;
  speedLimits: string;
  specialNotes: string;
}

export interface StateInfo {
  code: string;
  name: string;
  region: string;
  siteCount: number;
  laws: StateLaws;
}

export const CATEGORY_LABELS: Record<SiteCategory, string> = {
  // Camping & Overnight
  rv_park: "RV Park",
  national_park: "National Park",
  state_park: "State Park",
  boondocking: "Boondocking",
  blm: "BLM Land",
  national_forest: "National Forest",
  military: "Military FamCamp",
  harvest_host: "Harvest Host",
  walmart: "Walmart",
  cracker_barrel: "Cracker Barrel",
  rest_area: "Rest Area",
  casino_parking: "Casino Parking",
  cabelas_bass_pro: "Cabela's / Bass Pro",
  truck_stop: "Truck Stop",
  elks_moose: "Elks / Moose Lodge",
  army_corps: "Army Corps of Engineers",
  county_park: "County/City Park",
  provincial_park: "Provincial Park",
  // RV Services
  dump_station: "Dump Station",
  weight_scale: "Weight Scale",
  fuel_station: "RV Fuel",
  propane: "Propane Refill",
  rv_repair: "RV Repair",
  water_fill: "Water Fill",
  laundromat: "Laundromat",
  rv_wash: "RV Wash",
  rv_tires: "RV Tires",
  rv_dealer: "RV Dealer",
  // Road Safety
  low_clearance: "Low Clearance",
  weigh_station: "Weigh Station",
  road_condition: "Road Condition",
  // Supplies
  rv_grocery: "Grocery Store",
  rv_supply_store: "RV Supply Store",
  outdoor_store: "Outdoor Store",
  // Connectivity
  cell_coverage: "Cell Coverage",
  free_wifi: "Free WiFi",
  // Roadtrippers POI
  attraction: "Attraction",
  scenic_view: "Scenic View",
  restaurant: "Restaurant",
  roadside_oddity: "Roadside Oddity",
  historic_site: "Historic Site",
  visitor_center: "Visitor Center",
};

export const CATEGORY_COLORS: Record<SiteCategory, string> = {
  // Camping & Overnight
  rv_park: "#1565C0",
  national_park: "#2E7D32",
  state_park: "#558B2F",
  boondocking: "#E65100",
  blm: "#BF360C",
  national_forest: "#1B5E20",
  military: "#4A148C",
  harvest_host: "#F9A825",
  walmart: "#0071CE",
  cracker_barrel: "#8D6E63",
  rest_area: "#6A1B9A",
  casino_parking: "#AD1457",
  cabelas_bass_pro: "#33691E",
  truck_stop: "#E64A19",
  elks_moose: "#283593",
  army_corps: "#00695C",
  county_park: "#7CB342",
  provincial_park: "#43A047",
  // RV Services
  dump_station: "#455A64",
  weight_scale: "#FF6F00",
  fuel_station: "#D32F2F",
  propane: "#F57C00",
  rv_repair: "#5D4037",
  water_fill: "#0288D1",
  laundromat: "#7B1FA2",
  rv_wash: "#00838F",
  rv_tires: "#37474F",
  rv_dealer: "#0D47A1",
  // Road Safety
  low_clearance: "#C62828",
  weigh_station: "#FF8F00",
  road_condition: "#B71C1C",
  // Supplies
  rv_grocery: "#388E3C",
  rv_supply_store: "#1976D2",
  outdoor_store: "#2E7D32",
  // Connectivity
  cell_coverage: "#1976D2",
  free_wifi: "#00695C",
  // Roadtrippers POI
  attraction: "#E91E63",
  scenic_view: "#00BCD4",
  restaurant: "#FF5722",
  roadside_oddity: "#9C27B0",
  historic_site: "#795548",
  visitor_center: "#607D8B",
};

export const REGIONS = [
  "Northeast",
  "Southeast",
  "Midwest",
  "Southwest",
  "West",
  "Pacific Northwest",
] as const;

export type Region = (typeof REGIONS)[number];

export const STATE_REGIONS: Record<string, Region> = {
  ME: "Northeast", NH: "Northeast", VT: "Northeast", MA: "Northeast",
  RI: "Northeast", CT: "Northeast", NY: "Northeast", NJ: "Northeast",
  PA: "Northeast", DE: "Northeast", MD: "Northeast",
  VA: "Southeast", WV: "Southeast", NC: "Southeast", SC: "Southeast",
  GA: "Southeast", FL: "Southeast", AL: "Southeast", MS: "Southeast",
  TN: "Southeast", KY: "Southeast", LA: "Southeast", AR: "Southeast",
  OH: "Midwest", MI: "Midwest", IN: "Midwest", IL: "Midwest",
  WI: "Midwest", MN: "Midwest", IA: "Midwest", MO: "Midwest",
  ND: "Midwest", SD: "Midwest", NE: "Midwest", KS: "Midwest",
  TX: "Southwest", OK: "Southwest", NM: "Southwest", AZ: "Southwest",
  CO: "Southwest", UT: "Southwest",
  WA: "Pacific Northwest", OR: "Pacific Northwest", ID: "Pacific Northwest",
  CA: "West", NV: "West", MT: "West", WY: "West", HI: "West", AK: "West",
};
