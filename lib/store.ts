import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext } from "react";

// ── RV Profile ──
export interface RVProfile {
  nickname: string;
  type: string; // "Class A" | "Class B" | "Class C" | "Travel Trailer" | "Fifth Wheel" | "Pop-Up" | "Truck Camper" | "Van"
  year: string;
  make: string;
  model: string;
  length: string; // feet
  height: string; // feet
  weight: string; // lbs
}

export const DEFAULT_RV_PROFILE: RVProfile = {
  nickname: "My RV",
  type: "Class C Motorhome",
  year: "",
  make: "",
  model: "",
  length: "",
  height: "",
  weight: "",
};

// ── App Settings ──
export interface AppSettings {
  distanceUnit: "miles" | "km";
  isPremium: boolean;
  premiumPlan: "monthly" | "yearly" | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  distanceUnit: "miles",
  isPremium: false,
  premiumPlan: null,
};

// ── Stats ──
export interface UserStats {
  spotsVisited: number;
  reviewsWritten: number;
  milesTraveled: number;
}

export const DEFAULT_STATS: UserStats = {
  spotsVisited: 0,
  reviewsWritten: 0,
  milesTraveled: 0,
};

// ── Maintenance Log ──
export interface MaintenanceEntry {
  id: string;
  date: string;
  type: string;
  description: string;
  mileage: string;
  cost: string;
}

// ── Packing Item ──
export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

// ── Trip ──
export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  stops: TripStop[];
  notes: string;
}

export interface TripStop {
  id: string;
  siteId: string;
  siteName: string;
  state: string;
  nights: number;
  order: number;
}

// ── Fuel Log ──
export interface FuelEntry {
  id: string;
  date: string;
  gallons: string;
  pricePerGallon: string;
  totalCost: string;
  odometer: string;
  location: string;
}

// ── Review ──
export interface UserReview {
  id: string;
  siteId: string;
  siteName: string;
  rating: number;
  text: string;
  date: string;
}

// ── Community Post ──
export interface CommunityPost {
  id: string;
  author: string;
  text: string;
  date: string;
  likes: number;
  replies: number;
  category: string;
}

// ── Discount Memberships ──
export interface DiscountMemberships {
  military: boolean;
  senior: boolean;
  goodSam: boolean;
  passportAmerica: boolean;
  escapees: boolean;
  koaValueKard: boolean;
  aaa: boolean;
  aarp: boolean;
}

export const DEFAULT_MEMBERSHIPS: DiscountMemberships = {
  military: false,
  senior: false,
  goodSam: false,
  passportAmerica: false,
  escapees: false,
  koaValueKard: false,
  aaa: false,
  aarp: false,
};

// ── Equipment Report ──
export interface EquipmentReport {
  id: string;
  parkName: string;
  state: string;
  equipmentType: string; // "Track Chair" | "Beach Wheelchair" | "Mobility Scooter" | "All-Terrain Wheelchair" | "Other"
  description: string;
  cost: string; // "Free" | "$10/day" etc.
  contactInfo: string;
  submittedDate: string;
  submittedBy: string;
}

// ── RV Problem Report ──
export interface RVProblemReport {
  id: string;
  make: string;
  model: string;
  year: string;
  category: string; // "Water Leak" | "Electrical" | "Slide-Out" | "Roof" | "Plumbing" | "HVAC" | "Tires" | "Other"
  severity: "minor" | "moderate" | "severe";
  description: string;
  fixCost: string;
  submittedDate: string;
  submittedBy: string;
}

// ── Storage Keys ──
const KEYS = {
  RV_PROFILE: "rv_nomad_rv_profile",
  SETTINGS: "rv_nomad_settings",
  STATS: "rv_nomad_stats",
  SAVED_SITES: "rv_nomad_saved_sites",
  TRIPS: "rv_nomad_trips",
  MAINTENANCE: "rv_nomad_maintenance",
  PACKING: "rv_nomad_packing",
  FUEL_LOG: "rv_nomad_fuel_log",
  REVIEWS: "rv_nomad_reviews",
  CHECKLISTS: "rv_nomad_checklists",
  MEMBERSHIPS: "rv_nomad_memberships",
  SEARCH_HISTORY: "rv_nomad_search_history",
  EQUIPMENT_REPORTS: "rv_nomad_equipment_reports",
  RV_PROBLEMS: "rv_nomad_rv_problems",
};

// ── Storage Helpers ──
async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ── Public API ──
export const Store = {
  // RV Profile
  getRVProfile: () => getJSON<RVProfile>(KEYS.RV_PROFILE, DEFAULT_RV_PROFILE),
  setRVProfile: (p: RVProfile) => setJSON(KEYS.RV_PROFILE, p),

  // Settings
  getSettings: () => getJSON<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  setSettings: (s: AppSettings) => setJSON(KEYS.SETTINGS, s),

  // Stats
  getStats: () => getJSON<UserStats>(KEYS.STATS, DEFAULT_STATS),
  setStats: (s: UserStats) => setJSON(KEYS.STATS, s),

  // Saved Sites (favorites)
  getSavedSites: () => getJSON<string[]>(KEYS.SAVED_SITES, []),
  setSavedSites: (ids: string[]) => setJSON(KEYS.SAVED_SITES, ids),
  toggleSavedSite: async (id: string) => {
    const saved = await Store.getSavedSites();
    const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
    await Store.setSavedSites(next);
    return next;
  },

  // Trips
  getTrips: () => getJSON<Trip[]>(KEYS.TRIPS, []),
  setTrips: (t: Trip[]) => setJSON(KEYS.TRIPS, t),

  // Maintenance
  getMaintenanceLog: () => getJSON<MaintenanceEntry[]>(KEYS.MAINTENANCE, []),
  setMaintenanceLog: (m: MaintenanceEntry[]) => setJSON(KEYS.MAINTENANCE, m),

  // Packing
  getPackingItems: () => getJSON<PackingItem[]>(KEYS.PACKING, []),
  setPackingItems: (p: PackingItem[]) => setJSON(KEYS.PACKING, p),

  // Fuel Log
  getFuelLog: () => getJSON<FuelEntry[]>(KEYS.FUEL_LOG, []),
  setFuelLog: (f: FuelEntry[]) => setJSON(KEYS.FUEL_LOG, f),

  // Reviews
  getReviews: () => getJSON<UserReview[]>(KEYS.REVIEWS, []),
  setReviews: (r: UserReview[]) => setJSON(KEYS.REVIEWS, r),

  // Checklists
  getChecklists: () => getJSON<Record<string, boolean[]>>(KEYS.CHECKLISTS, {}),
  setChecklists: (c: Record<string, boolean[]>) => setJSON(KEYS.CHECKLISTS, c),

  // Discount Memberships
  getMemberships: () => getJSON<DiscountMemberships>(KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIPS),
  setMemberships: (m: DiscountMemberships) => setJSON(KEYS.MEMBERSHIPS, m),

  // Search History
  getSearchHistory: () => getJSON<string[]>(KEYS.SEARCH_HISTORY, []),
  addSearchTerm: async (term: string) => {
    const history = await Store.getSearchHistory();
    const filtered = history.filter((t) => t.toLowerCase() !== term.toLowerCase());
    const next = [term, ...filtered].slice(0, 10);
    await setJSON(KEYS.SEARCH_HISTORY, next);
    return next;
  },
  clearSearchHistory: () => setJSON(KEYS.SEARCH_HISTORY, []),

  // Equipment Reports
  getEquipmentReports: () => getJSON<EquipmentReport[]>(KEYS.EQUIPMENT_REPORTS, []),
  addEquipmentReport: async (report: EquipmentReport) => {
    const reports = await Store.getEquipmentReports();
    await setJSON(KEYS.EQUIPMENT_REPORTS, [report, ...reports]);
  },

  // RV Problem Reports
  getRVProblems: () => getJSON<RVProblemReport[]>(KEYS.RV_PROBLEMS, []),
  addRVProblem: async (problem: RVProblemReport) => {
    const problems = await Store.getRVProblems();
    await setJSON(KEYS.RV_PROBLEMS, [problem, ...problems]);
  },
};
