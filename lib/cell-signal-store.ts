/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBlockedContentIds } from "@/lib/content-moderation";

export type Carrier = "Verizon" | "AT&T" | "T-Mobile" | "US Cellular" | "Other";
export type SignalStrength = 0 | 1 | 2 | 3 | 4 | 5; // 0 = no signal, 5 = excellent

export interface CellSignalReport {
  id: string;
  siteId: string;
  carrier: Carrier;
  signalStrength: SignalStrength;
  dataSpeed?: "none" | "slow" | "moderate" | "fast" | "very_fast";
  canStream?: boolean;
  canVideoCall?: boolean;
  boosterUsed?: boolean;
  boosterBrand?: string;
  notes?: string;
  createdAt: string;
  authorName?: string;
}

export interface SiteSignalSummary {
  siteId: string;
  totalReports: number;
  byCarrier: Record<string, { avgSignal: number; reportCount: number; canStream: number; canVideoCall: number }>;
  bestCarrier: string;
  worstCarrier: string;
  overallAvg: number;
}

const SIGNAL_KEY = "rv_nomad_cell_signals";

export const CARRIERS: Carrier[] = ["Verizon", "AT&T", "T-Mobile", "US Cellular", "Other"];

export const SIGNAL_LABELS: Record<SignalStrength, string> = {
  0: "No Signal",
  1: "Very Weak",
  2: "Weak",
  3: "Fair",
  4: "Good",
  5: "Excellent",
};

export const SIGNAL_COLORS: Record<SignalStrength, string> = {
  0: "#B71C1C",
  1: "#E65100",
  2: "#F57F17",
  3: "#F9A825",
  4: "#558B2F",
  5: "#2E7D32",
};

export const DATA_SPEED_LABELS: Record<string, string> = {
  none: "No Data",
  slow: "Slow (email only)",
  moderate: "Moderate (browsing OK)",
  fast: "Fast (streaming OK)",
  very_fast: "Very Fast (HD streaming)",
};

/**
 * Get all signal reports for a specific site
 */
export async function getSignalReportsForSite(siteId: string): Promise<CellSignalReport[]> {
  try {
    const raw = await AsyncStorage.getItem(SIGNAL_KEY);
    if (!raw) return [];
    const all: CellSignalReport[] = JSON.parse(raw);
    const blockedIds = await getBlockedContentIds("signal_report");
    return all
      .filter((r) => r.siteId === siteId && !blockedIds.has(r.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

/**
 * Get a summary of signal reports for a site
 */
export async function getSignalSummaryForSite(siteId: string): Promise<SiteSignalSummary | null> {
  const reports = await getSignalReportsForSite(siteId);
  if (reports.length === 0) return null;

  const byCarrier: Record<string, { totalSignal: number; reportCount: number; canStream: number; canVideoCall: number }> = {};

  for (const r of reports) {
    if (!byCarrier[r.carrier]) {
      byCarrier[r.carrier] = { totalSignal: 0, reportCount: 0, canStream: 0, canVideoCall: 0 };
    }
    byCarrier[r.carrier].totalSignal += r.signalStrength;
    byCarrier[r.carrier].reportCount++;
    if (r.canStream) byCarrier[r.carrier].canStream++;
    if (r.canVideoCall) byCarrier[r.carrier].canVideoCall++;
  }

  const summary: SiteSignalSummary["byCarrier"] = {};
  let bestCarrier = "";
  let worstCarrier = "";
  let bestAvg = -1;
  let worstAvg = 6;

  for (const [carrier, data] of Object.entries(byCarrier)) {
    const avg = Math.round((data.totalSignal / data.reportCount) * 10) / 10;
    summary[carrier] = {
      avgSignal: avg,
      reportCount: data.reportCount,
      canStream: data.canStream,
      canVideoCall: data.canVideoCall,
    };
    if (avg > bestAvg) { bestAvg = avg; bestCarrier = carrier; }
    if (avg < worstAvg) { worstAvg = avg; worstCarrier = carrier; }
  }

  const totalSignal = reports.reduce((sum, r) => sum + r.signalStrength, 0);

  return {
    siteId,
    totalReports: reports.length,
    byCarrier: summary,
    bestCarrier,
    worstCarrier,
    overallAvg: Math.round((totalSignal / reports.length) * 10) / 10,
  };
}

/**
 * Add a new signal report
 */
export async function addSignalReport(report: Omit<CellSignalReport, "id" | "createdAt">): Promise<CellSignalReport> {
  const newReport: CellSignalReport = {
    ...report,
    id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  try {
    const raw = await AsyncStorage.getItem(SIGNAL_KEY);
    const all: CellSignalReport[] = raw ? JSON.parse(raw) : [];
    all.push(newReport);
    await AsyncStorage.setItem(SIGNAL_KEY, JSON.stringify(all));
  } catch {
    // silently fail
  }
  return newReport;
}

/**
 * Delete a signal report
 */
export async function deleteSignalReport(reportId: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SIGNAL_KEY);
    if (!raw) return;
    const all: CellSignalReport[] = JSON.parse(raw);
    const filtered = all.filter((r) => r.id !== reportId);
    await AsyncStorage.setItem(SIGNAL_KEY, JSON.stringify(filtered));
  } catch {
    // silently fail
  }
}
