/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export type BadgeCategory = "explorer" | "collector" | "social" | "milestone" | "special";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirement: number;
  trackingKey: string;
  color: string;
}

export interface EarnedBadge { badgeId: string; earnedAt: string; }
export interface VisitedSite { siteId: string; siteName: string; state: string; category: string; visitedAt: string; }

export interface PassportStats {
  totalVisited: number;
  statesVisited: string[];
  categoriesVisited: string[];
  photosAdded: number;
  reviewsWritten: number;
  signalReports: number;
  tripsPlanned: number;
  caravansJoined: number;
}

const BADGES_KEY = "rv_nomad_badges_earned";
const VISITED_KEY = "rv_nomad_visited_sites";
const STATS_KEY = "rv_nomad_passport_stats";

export const ALL_BADGES: Badge[] = [
  // Explorer
  { id: "first_camp", name: "First Camp", description: "Visit your first campground", icon: "flag", category: "explorer", requirement: 1, trackingKey: "totalVisited", color: "#22C55E" },
  { id: "trailblazer", name: "Trailblazer", description: "Visit 10 campgrounds", icon: "hiking", category: "explorer", requirement: 10, trackingKey: "totalVisited", color: "#3B82F6" },
  { id: "road_warrior", name: "Road Warrior", description: "Visit 25 campgrounds", icon: "directions-car", category: "explorer", requirement: 25, trackingKey: "totalVisited", color: "#8B5CF6" },
  { id: "nomad_legend", name: "Nomad Legend", description: "Visit 50 campgrounds", icon: "auto-awesome", category: "explorer", requirement: 50, trackingKey: "totalVisited", color: "#F59E0B" },
  { id: "ultimate_nomad", name: "Ultimate Nomad", description: "Visit 100 campgrounds", icon: "military-tech", category: "explorer", requirement: 100, trackingKey: "totalVisited", color: "#EF4444" },
  // State collector
  { id: "state_starter", name: "State Starter", description: "Camp in 5 different states", icon: "map", category: "collector", requirement: 5, trackingKey: "statesVisited", color: "#06B6D4" },
  { id: "state_hopper", name: "State Hopper", description: "Camp in 10 different states", icon: "public", category: "collector", requirement: 10, trackingKey: "statesVisited", color: "#14B8A6" },
  { id: "coast_to_coast", name: "Coast to Coast", description: "Camp in 25 different states", icon: "flight", category: "collector", requirement: 25, trackingKey: "statesVisited", color: "#F97316" },
  { id: "all_50", name: "All 50 States", description: "Camp in all 50 states", icon: "emoji-events", category: "collector", requirement: 50, trackingKey: "statesVisited", color: "#EAB308" },
  // Category collector
  { id: "park_ranger", name: "Park Ranger", description: "Visit 10 National Park campgrounds", icon: "park", category: "collector", requirement: 10, trackingKey: "cat_national_park", color: "#16A34A" },
  { id: "forest_dweller", name: "Forest Dweller", description: "Visit 10 National Forest campgrounds", icon: "forest", category: "collector", requirement: 10, trackingKey: "cat_national_forest", color: "#15803D" },
  { id: "boondocker", name: "Boondocker", description: "Visit 5 BLM camping areas", icon: "terrain", category: "collector", requirement: 5, trackingKey: "cat_blm", color: "#CA8A04" },
  { id: "army_camper", name: "Corps Camper", description: "Visit 5 Army Corps campgrounds", icon: "water", category: "collector", requirement: 5, trackingKey: "cat_army_corps", color: "#2563EB" },
  { id: "military_fam", name: "Military Family", description: "Visit 3 Military FamCamps", icon: "security", category: "collector", requirement: 3, trackingKey: "cat_military", color: "#4338CA" },
  // Social
  { id: "shutterbug", name: "Shutterbug", description: "Add 5 campground photos", icon: "camera-alt", category: "social", requirement: 5, trackingKey: "photosAdded", color: "#EC4899" },
  { id: "photographer", name: "Photographer", description: "Add 25 campground photos", icon: "photo-library", category: "social", requirement: 25, trackingKey: "photosAdded", color: "#DB2777" },
  { id: "reviewer", name: "Reviewer", description: "Write 5 campground reviews", icon: "rate-review", category: "social", requirement: 5, trackingKey: "reviewsWritten", color: "#7C3AED" },
  { id: "signal_scout", name: "Signal Scout", description: "Submit 5 cell signal reports", icon: "signal-cellular-alt", category: "social", requirement: 5, trackingKey: "signalReports", color: "#0EA5E9" },
  { id: "signal_hero", name: "Signal Hero", description: "Submit 25 cell signal reports", icon: "cell-tower", category: "social", requirement: 25, trackingKey: "signalReports", color: "#0284C7" },
  // Milestone
  { id: "trip_planner", name: "Trip Planner", description: "Plan 3 trips with AI", icon: "explore", category: "milestone", requirement: 3, trackingKey: "tripsPlanned", color: "#6366F1" },
  { id: "caravan_leader", name: "Caravan Leader", description: "Create a caravan group", icon: "groups", category: "milestone", requirement: 1, trackingKey: "caravansJoined", color: "#D946EF" },
  // Special
  { id: "early_adopter", name: "Early Adopter", description: "Join RV Nomad in 2026", icon: "star", category: "special", requirement: 1, trackingKey: "special_early", color: "#F59E0B" },
  { id: "night_owl", name: "Night Owl", description: "Check in after 10 PM", icon: "nightlight", category: "special", requirement: 1, trackingKey: "special_night", color: "#6366F1" },
];

export async function getVisitedSites(): Promise<VisitedSite[]> {
  try { const r = await AsyncStorage.getItem(VISITED_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function markSiteVisited(site: VisitedSite): Promise<void> {
  const sites = await getVisitedSites();
  if (sites.some((s) => s.siteId === site.siteId)) return;
  sites.push(site);
  await AsyncStorage.setItem(VISITED_KEY, JSON.stringify(sites));
}
export async function getEarnedBadges(): Promise<EarnedBadge[]> {
  try { const r = await AsyncStorage.getItem(BADGES_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function saveEarnedBadges(b: EarnedBadge[]): Promise<void> { await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(b)); }

const defaultStats: PassportStats = { totalVisited: 0, statesVisited: [], categoriesVisited: [], photosAdded: 0, reviewsWritten: 0, signalReports: 0, tripsPlanned: 0, caravansJoined: 0 };
export async function getPassportStats(): Promise<PassportStats> {
  try { const r = await AsyncStorage.getItem(STATS_KEY); return r ? { ...defaultStats, ...JSON.parse(r) } : { ...defaultStats }; } catch { return { ...defaultStats }; }
}
export async function updatePassportStats(u: Partial<PassportStats>): Promise<void> {
  const c = await getPassportStats(); await AsyncStorage.setItem(STATS_KEY, JSON.stringify({ ...c, ...u }));
}
export async function incrementStat(key: keyof PassportStats): Promise<void> {
  const s = await getPassportStats(); const v = s[key]; if (typeof v === "number") { (s as any)[key] = v + 1; await AsyncStorage.setItem(STATS_KEY, JSON.stringify(s)); }
}

export async function checkAndAwardBadges(): Promise<Badge[]> {
  const stats = await getPassportStats();
  const visited = await getVisitedSites();
  const earned = await getEarnedBadges();
  const earnedIds = new Set(earned.map((e) => e.badgeId));
  const tv: Record<string, number> = {
    totalVisited: stats.totalVisited, statesVisited: stats.statesVisited.length,
    photosAdded: stats.photosAdded, reviewsWritten: stats.reviewsWritten,
    signalReports: stats.signalReports, tripsPlanned: stats.tripsPlanned,
    caravansJoined: stats.caravansJoined,
    special_early: new Date().getFullYear() <= 2026 ? 1 : 0,
    special_night: new Date().getHours() >= 22 ? 1 : 0,
  };
  const cc: Record<string, number> = {};
  visited.forEach((v) => { cc[v.category] = (cc[v.category] || 0) + 1; });
  Object.entries(cc).forEach(([cat, count]) => { tv[`cat_${cat}`] = count; });
  const newBadges: Badge[] = [];
  for (const badge of ALL_BADGES) {
    if (earnedIds.has(badge.id)) continue;
    if ((tv[badge.trackingKey] || 0) >= badge.requirement) {
      earned.push({ badgeId: badge.id, earnedAt: new Date().toISOString() });
      newBadges.push(badge);
    }
  }
  if (newBadges.length > 0) await saveEarnedBadges(earned);
  return newBadges;
}

export const CATEGORY_INFO: Record<BadgeCategory, { label: string; color: string }> = {
  explorer: { label: "Explorer", color: "#3B82F6" },
  collector: { label: "Collector", color: "#22C55E" },
  social: { label: "Social", color: "#EC4899" },
  milestone: { label: "Milestone", color: "#8B5CF6" },
  special: { label: "Special", color: "#F59E0B" },
};
