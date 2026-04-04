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
  // Low clearance specific
  clearanceHeight?: string;
  // Cell coverage specific
  carriers?: string[];
  signalStrength?: string;
  // Overnight parking specific
  overnightPolicy?: string;
  // Road condition specific
  roadGrade?: string;
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
