/** All site categories in the app */
export type SiteCategory =
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
  | "dump_station"
  | "rest_area"
  | "weight_scale";

export interface WeightScale {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  city: string;
  address: string;
  type: "cat_scale" | "public_weigh_station" | "truck_stop_scale";
  cost: string; // e.g. "$12.50" or "Free"
  hours: string; // e.g. "24/7" or "6am-10pm"
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
  discounts?: string[]; // "passport_america" | "good_sam" | "military"
  isPremium?: boolean; // requires subscription to view details
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
  dump_station: "Dump Station",
  rest_area: "Rest Area",
  weight_scale: "Weight Scale",
};

export const CATEGORY_COLORS: Record<SiteCategory, string> = {
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
  dump_station: "#455A64",
  rest_area: "#6A1B9A",
  weight_scale: "#FF6F00",
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
