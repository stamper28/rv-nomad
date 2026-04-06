/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CaravanMember { id: string; name: string; rig: string; joinedAt: string; isLeader: boolean; }
export interface CaravanStop { id: string; siteId: string; siteName: string; state: string; arrivalDate: string; departureDate: string; notes: string; }
export interface Caravan { id: string; name: string; code: string; createdAt: string; members: CaravanMember[]; stops: CaravanStop[]; status: "planning" | "active" | "completed"; }

const KEY = "rv_nomad_caravans";
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export async function getCaravans(): Promise<Caravan[]> {
  try { const r = await AsyncStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
async function save(c: Caravan[]) { await AsyncStorage.setItem(KEY, JSON.stringify(c)); }

export async function createCaravan(name: string, leaderName: string, leaderRig: string): Promise<Caravan> {
  const caravans = await getCaravans();
  const c: Caravan = {
    id: genId(), name, code: genCode(), createdAt: new Date().toISOString(), status: "planning",
    members: [{ id: genId(), name: leaderName, rig: leaderRig, joinedAt: new Date().toISOString(), isLeader: true }],
    stops: [],
  };
  caravans.push(c);
  await save(caravans);
  return c;
}

export async function joinCaravan(code: string, memberName: string, memberRig: string): Promise<Caravan | null> {
  const caravans = await getCaravans();
  const c = caravans.find((cv) => cv.code === code);
  if (!c) return null;
  if (c.members.some((m) => m.name === memberName)) return c;
  c.members.push({ id: genId(), name: memberName, rig: memberRig, joinedAt: new Date().toISOString(), isLeader: false });
  await save(caravans);
  return c;
}

export async function addStop(caravanId: string, stop: Omit<CaravanStop, "id">): Promise<void> {
  const caravans = await getCaravans();
  const c = caravans.find((cv) => cv.id === caravanId);
  if (!c) return;
  c.stops.push({ ...stop, id: genId() });
  await save(caravans);
}

export async function removeStop(caravanId: string, stopId: string): Promise<void> {
  const caravans = await getCaravans();
  const c = caravans.find((cv) => cv.id === caravanId);
  if (!c) return;
  c.stops = c.stops.filter((s) => s.id !== stopId);
  await save(caravans);
}

export async function updateCaravanStatus(caravanId: string, status: Caravan["status"]): Promise<void> {
  const caravans = await getCaravans();
  const c = caravans.find((cv) => cv.id === caravanId);
  if (!c) return;
  c.status = status;
  await save(caravans);
}

export async function deleteCaravan(caravanId: string): Promise<void> {
  const caravans = await getCaravans();
  await save(caravans.filter((c) => c.id !== caravanId));
}
