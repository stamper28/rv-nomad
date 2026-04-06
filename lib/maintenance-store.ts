/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MaintenanceCategory = "engine" | "tires" | "generator" | "slides" | "roof" | "plumbing" | "electrical" | "brakes" | "other";

export interface MaintenanceItem {
  id: string; category: MaintenanceCategory; title: string; description: string;
  lastDoneDate: string; lastDoneMileage: number; intervalMonths: number; intervalMiles: number;
  cost: number; notes: string;
}

export interface RVProfile { name: string; year: string; make: string; model: string; currentMileage: number; fuelType: "diesel" | "gas" | "electric"; length: number; }

const ITEMS_KEY = "rv_nomad_maintenance_items";
const PROFILE_KEY = "rv_nomad_rv_profile";
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export const DEFAULT_ITEMS: Omit<MaintenanceItem, "id" | "lastDoneDate" | "lastDoneMileage" | "cost" | "notes">[] = [
  { category: "engine", title: "Oil Change", description: "Engine oil and filter", intervalMonths: 6, intervalMiles: 5000 },
  { category: "engine", title: "Air Filter", description: "Engine air filter replacement", intervalMonths: 12, intervalMiles: 15000 },
  { category: "engine", title: "Fuel Filter", description: "Fuel filter replacement", intervalMonths: 12, intervalMiles: 15000 },
  { category: "engine", title: "Coolant Flush", description: "Cooling system flush", intervalMonths: 24, intervalMiles: 30000 },
  { category: "tires", title: "Tire Rotation", description: "Rotate all tires", intervalMonths: 6, intervalMiles: 6000 },
  { category: "tires", title: "Tire Inspection", description: "Check tread depth and pressure", intervalMonths: 3, intervalMiles: 3000 },
  { category: "generator", title: "Generator Oil Change", description: "Generator oil and filter", intervalMonths: 6, intervalMiles: 0 },
  { category: "generator", title: "Generator Service", description: "Full generator service", intervalMonths: 12, intervalMiles: 0 },
  { category: "slides", title: "Slide-Out Lubrication", description: "Lubricate slide mechanisms", intervalMonths: 6, intervalMiles: 0 },
  { category: "slides", title: "Slide Seal Inspection", description: "Check slide-out seals", intervalMonths: 6, intervalMiles: 0 },
  { category: "roof", title: "Roof Inspection", description: "Check for leaks and damage", intervalMonths: 6, intervalMiles: 0 },
  { category: "roof", title: "Roof Sealant", description: "Reseal roof seams", intervalMonths: 12, intervalMiles: 0 },
  { category: "plumbing", title: "Water Heater Flush", description: "Flush water heater anode", intervalMonths: 12, intervalMiles: 0 },
  { category: "plumbing", title: "Sanitize Fresh Water", description: "Bleach sanitize fresh water system", intervalMonths: 6, intervalMiles: 0 },
  { category: "electrical", title: "Battery Check", description: "Test house and chassis batteries", intervalMonths: 3, intervalMiles: 0 },
  { category: "brakes", title: "Brake Inspection", description: "Check pads, rotors, and fluid", intervalMonths: 12, intervalMiles: 12000 },
];

export const CATEGORY_INFO: Record<MaintenanceCategory, { label: string; icon: string; color: string }> = {
  engine: { label: "Engine", icon: "settings", color: "#EF4444" },
  tires: { label: "Tires", icon: "trip-origin", color: "#3B82F6" },
  generator: { label: "Generator", icon: "bolt", color: "#F59E0B" },
  slides: { label: "Slides", icon: "swap-horiz", color: "#8B5CF6" },
  roof: { label: "Roof", icon: "roofing", color: "#06B6D4" },
  plumbing: { label: "Plumbing", icon: "plumbing", color: "#14B8A6" },
  electrical: { label: "Electrical", icon: "electrical-services", color: "#EC4899" },
  brakes: { label: "Brakes", icon: "disc-full", color: "#F97316" },
  other: { label: "Other", icon: "build", color: "#6B7280" },
};

export async function getMaintenanceItems(): Promise<MaintenanceItem[]> {
  try { const r = await AsyncStorage.getItem(ITEMS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function saveMaintenanceItems(items: MaintenanceItem[]): Promise<void> { await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items)); }
export async function addMaintenanceItem(item: Omit<MaintenanceItem, "id">): Promise<MaintenanceItem> {
  const items = await getMaintenanceItems(); const n = { ...item, id: genId() }; items.push(n); await saveMaintenanceItems(items); return n;
}
export async function updateMaintenanceItem(id: string, updates: Partial<MaintenanceItem>): Promise<void> {
  const items = await getMaintenanceItems(); const i = items.findIndex((x) => x.id === id);
  if (i >= 0) { items[i] = { ...items[i], ...updates }; await saveMaintenanceItems(items); }
}
export async function deleteMaintenanceItem(id: string): Promise<void> {
  const items = await getMaintenanceItems(); await saveMaintenanceItems(items.filter((i) => i.id !== id));
}
export async function initDefaultItems(): Promise<void> {
  const existing = await getMaintenanceItems(); if (existing.length > 0) return;
  const items: MaintenanceItem[] = DEFAULT_ITEMS.map((d) => ({ ...d, id: genId(), lastDoneDate: "", lastDoneMileage: 0, cost: 0, notes: "" }));
  await saveMaintenanceItems(items);
}
export async function getRVProfile(): Promise<RVProfile | null> {
  try { const r = await AsyncStorage.getItem(PROFILE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export async function saveRVProfile(p: RVProfile): Promise<void> { await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }

export function isDue(item: MaintenanceItem, currentMileage: number): boolean {
  if (!item.lastDoneDate) return true;
  const ld = new Date(item.lastDoneDate); const now = new Date();
  const md = (now.getFullYear() - ld.getFullYear()) * 12 + (now.getMonth() - ld.getMonth());
  if (item.intervalMonths > 0 && md >= item.intervalMonths) return true;
  if (item.intervalMiles > 0 && item.lastDoneMileage > 0 && currentMileage - item.lastDoneMileage >= item.intervalMiles) return true;
  return false;
}
export function isOverdue(item: MaintenanceItem, currentMileage: number): boolean {
  if (!item.lastDoneDate) return true;
  const ld = new Date(item.lastDoneDate); const now = new Date();
  const md = (now.getFullYear() - ld.getFullYear()) * 12 + (now.getMonth() - ld.getMonth());
  if (item.intervalMonths > 0 && md >= item.intervalMonths * 1.25) return true;
  if (item.intervalMiles > 0 && item.lastDoneMileage > 0 && currentMileage - item.lastDoneMileage >= item.intervalMiles * 1.25) return true;
  return false;
}
