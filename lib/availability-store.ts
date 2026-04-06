/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AvailabilityStatus = "open" | "few_left" | "full" | "closed" | "unknown";

export interface AvailabilityReport {
  id: string; siteId: string; status: AvailabilityStatus; reportedAt: string;
  reporterName: string; notes: string; sitesAvailable: number;
}

const KEY = "rv_nomad_availability";
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export async function getReports(siteId: string): Promise<AvailabilityReport[]> {
  try {
    const r = await AsyncStorage.getItem(KEY);
    const all: AvailabilityReport[] = r ? JSON.parse(r) : [];
    return all.filter((a) => a.siteId === siteId).sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  } catch { return []; }
}

export async function addReport(report: Omit<AvailabilityReport, "id" | "reportedAt">): Promise<AvailabilityReport> {
  try {
    const r = await AsyncStorage.getItem(KEY);
    const all: AvailabilityReport[] = r ? JSON.parse(r) : [];
    const nr: AvailabilityReport = { ...report, id: genId(), reportedAt: new Date().toISOString() };
    all.push(nr);
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    return nr;
  } catch { return { ...report, id: genId(), reportedAt: new Date().toISOString() }; }
}

export function getLatestStatus(reports: AvailabilityReport[]): { status: AvailabilityStatus; reportedAt: string; reporterName: string } | null {
  if (reports.length === 0) return null;
  return { status: reports[0].status, reportedAt: reports[0].reportedAt, reporterName: reports[0].reporterName };
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date(); const d = new Date(dateStr);
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const STATUS_INFO: Record<AvailabilityStatus, { label: string; color: string; icon: string; bg: string }> = {
  open: { label: "Sites Available", color: "#16A34A", icon: "check-circle", bg: "#DCFCE7" },
  few_left: { label: "Few Sites Left", color: "#D97706", icon: "warning", bg: "#FEF3C7" },
  full: { label: "Full / No Sites", color: "#DC2626", icon: "cancel", bg: "#FEE2E2" },
  closed: { label: "Closed", color: "#6B7280", icon: "block", bg: "#F3F4F6" },
  unknown: { label: "Unknown", color: "#9CA3AF", icon: "help-outline", bg: "#F9FAFB" },
};
