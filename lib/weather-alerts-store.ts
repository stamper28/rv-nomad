/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AlertSeverity = "extreme" | "severe" | "moderate" | "minor";
export type AlertType = "wind" | "storm" | "flood" | "heat" | "cold" | "fire" | "tornado" | "snow" | "fog" | "other";

export interface WeatherAlert {
  id: string; siteId: string; siteName: string; state: string;
  alertType: AlertType; severity: AlertSeverity; title: string; description: string;
  issuedAt: string; expiresAt: string; source: string;
}

export interface MonitoredCampground { siteId: string; siteName: string; state: string; lat: number; lng: number; addedAt: string; }

const MONITORED_KEY = "rv_nomad_weather_monitored";
const ALERTS_KEY = "rv_nomad_weather_alerts";

export async function getMonitoredCampgrounds(): Promise<MonitoredCampground[]> {
  try { const r = await AsyncStorage.getItem(MONITORED_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function addMonitoredCampground(c: MonitoredCampground): Promise<void> {
  const list = await getMonitoredCampgrounds();
  if (list.some((m) => m.siteId === c.siteId)) return;
  list.push(c); await AsyncStorage.setItem(MONITORED_KEY, JSON.stringify(list));
}
export async function removeMonitoredCampground(siteId: string): Promise<void> {
  const list = await getMonitoredCampgrounds();
  await AsyncStorage.setItem(MONITORED_KEY, JSON.stringify(list.filter((m) => m.siteId !== siteId)));
}
export async function getWeatherAlerts(): Promise<WeatherAlert[]> {
  try { const r = await AsyncStorage.getItem(ALERTS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function saveWeatherAlerts(alerts: WeatherAlert[]): Promise<void> {
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function generateSimulatedAlerts(campgrounds: MonitoredCampground[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date();
  const templates: { type: AlertType; severity: AlertSeverity; title: string; desc: string; states: string[] }[] = [
    { type: "wind", severity: "severe", title: "High Wind Warning", desc: "Sustained winds 40-55 mph with gusts to 70 mph. Secure all outdoor items and awnings.", states: ["WY", "MT", "KS", "NE", "SD", "ND", "OK", "TX", "NM", "CO"] },
    { type: "storm", severity: "moderate", title: "Thunderstorm Watch", desc: "Scattered thunderstorms possible. Lightning and heavy rain expected.", states: ["FL", "GA", "AL", "MS", "LA", "TX", "AR", "MO", "TN", "SC"] },
    { type: "heat", severity: "moderate", title: "Excessive Heat Warning", desc: "Temperatures exceeding 105F. Limit outdoor activity. Ensure AC and hydration.", states: ["AZ", "NV", "CA", "TX", "NM", "UT"] },
    { type: "flood", severity: "severe", title: "Flash Flood Warning", desc: "Heavy rainfall may cause flash flooding in low-lying areas. Move to higher ground.", states: ["WV", "KY", "TN", "NC", "VA", "PA"] },
    { type: "fire", severity: "extreme", title: "Red Flag Warning", desc: "Critical fire weather conditions. No open flames. Check evacuation routes.", states: ["CA", "OR", "WA", "MT", "CO", "ID"] },
    { type: "cold", severity: "moderate", title: "Freeze Warning", desc: "Temperatures dropping below 28F. Protect water lines and disconnect hoses.", states: ["MN", "WI", "MI", "ND", "SD", "ME", "VT", "NH"] },
    { type: "tornado", severity: "extreme", title: "Tornado Watch", desc: "Conditions favorable for tornado development. Seek shelter immediately if warned.", states: ["OK", "KS", "TX", "NE", "IA", "MO", "AR", "AL", "MS"] },
    { type: "snow", severity: "moderate", title: "Winter Storm Warning", desc: "Heavy snow expected. 6-12 inches accumulation. Travel not recommended.", states: ["CO", "WY", "MT", "UT", "MN", "WI", "MI", "NY", "VT"] },
  ];
  for (const cg of campgrounds) {
    const matching = templates.filter((t) => t.states.includes(cg.state));
    if (matching.length > 0) {
      const tmpl = matching[Math.floor(Math.random() * matching.length)];
      const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      alerts.push({
        id: `wa_${cg.siteId}_${Date.now()}`, siteId: cg.siteId, siteName: cg.siteName, state: cg.state,
        alertType: tmpl.type, severity: tmpl.severity, title: tmpl.title, description: tmpl.desc,
        issuedAt: now.toISOString(), expiresAt: expires.toISOString(), source: "NWS Simulated",
      });
    }
  }
  return alerts;
}

export const SEVERITY_INFO: Record<AlertSeverity, { label: string; color: string; icon: string }> = {
  extreme: { label: "Extreme", color: "#DC2626", icon: "error" },
  severe: { label: "Severe", color: "#EA580C", icon: "warning" },
  moderate: { label: "Moderate", color: "#D97706", icon: "info" },
  minor: { label: "Minor", color: "#65A30D", icon: "info-outline" },
};

export const ALERT_TYPE_INFO: Record<AlertType, { label: string; icon: string; color: string }> = {
  wind: { label: "Wind", icon: "air", color: "#6366F1" },
  storm: { label: "Storm", icon: "thunderstorm", color: "#3B82F6" },
  flood: { label: "Flood", icon: "water", color: "#0EA5E9" },
  heat: { label: "Heat", icon: "whatshot", color: "#EF4444" },
  cold: { label: "Cold", icon: "ac-unit", color: "#06B6D4" },
  fire: { label: "Fire", icon: "local-fire-department", color: "#F97316" },
  tornado: { label: "Tornado", icon: "tornado", color: "#8B5CF6" },
  snow: { label: "Snow", icon: "cloudy-snowing", color: "#94A3B8" },
  fog: { label: "Fog", icon: "cloud", color: "#9CA3AF" },
  other: { label: "Other", icon: "warning", color: "#6B7280" },
};
