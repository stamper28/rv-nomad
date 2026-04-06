/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Platform, Switch } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getWeatherAlerts, saveWeatherAlerts, getMonitoredCampgrounds, removeMonitoredCampground,
  type WeatherAlert, type MonitoredCampground,
} from "@/lib/weather-alerts-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "rv_nomad_weather_alert_settings";
interface AlertSettings { enabledTypes: string[]; }
async function getAlertSettings(): Promise<AlertSettings> {
  try { const r = await AsyncStorage.getItem(SETTINGS_KEY); return r ? JSON.parse(r) : { enabledTypes: ["highWind", "tornado", "flood", "winter", "heat", "fire", "lightning"] }; } catch { return { enabledTypes: ["highWind", "tornado", "flood", "winter", "heat", "fire", "lightning"] }; }
}
async function toggleAlertType(type: string): Promise<void> {
  const s = await getAlertSettings();
  if (s.enabledTypes.includes(type)) s.enabledTypes = s.enabledTypes.filter((t) => t !== type);
  else s.enabledTypes.push(type);
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
async function dismissAlert(id: string): Promise<void> {
  const all = await getWeatherAlerts();
  await saveWeatherAlerts(all.filter((a) => a.id !== id));
}

type Tab = "alerts" | "monitored" | "settings";

const SEVERITY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  extreme: { bg: "#FEE2E2", text: "#DC2626", icon: "error" },
  severe: { bg: "#FEF3C7", text: "#D97706", icon: "warning" },
  moderate: { bg: "#DBEAFE", text: "#2563EB", icon: "info" },
  minor: { bg: "#F3F4F6", text: "#6B7280", icon: "info-outline" },
};

export default function WeatherAlertsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("alerts");
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [monitored, setMonitored] = useState<MonitoredCampground[]>([]);

  const load = useCallback(async () => {
    const [a, s, m] = await Promise.all([getWeatherAlerts(), getAlertSettings(), getMonitoredCampgrounds()]);
    setAlerts(a); setSettings(s); setMonitored(m);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleDismiss = async (id: string) => {
    await dismissAlert(id);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    load();
  };

  const handleToggle = async (type: string) => {
    await toggleAlertType(type);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    load();
  };

  const handleRemoveSite = async (siteId: string) => {
    await removeMonitoredCampground(siteId);
    load();
  };

  const renderAlert = ({ item }: { item: WeatherAlert }) => {
    const sev = SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.minor;
    return (
      <View style={[styles.alertCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: sev.text, borderLeftWidth: 4 }]}>
        <View style={styles.alertHeader}>
          <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
            <MaterialIcons name={sev.icon as any} size={14} color={sev.text} />
            <Text style={{ color: sev.text, fontSize: 11, fontWeight: "700" }}>{item.severity.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDismiss(item.id)}>
            <MaterialIcons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.alertTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.alertSite, { color: colors.primary }]}>{item.siteName}</Text>
        <Text style={[styles.alertDesc, { color: colors.muted }]}>{item.description}</Text>
        <View style={styles.alertMeta}>
          <MaterialIcons name="schedule" size={14} color={colors.muted} />
          <Text style={[styles.alertTime, { color: colors.muted }]}>
            {new Date(item.issuedAt).toLocaleDateString()} · Expires {new Date(item.expiresAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  const alertTypes = [
    { key: "highWind", label: "High Wind Warnings", desc: "Wind gusts over 40 mph — dangerous for RVs", icon: "air" },
    { key: "tornado", label: "Tornado Warnings", desc: "Tornado watches and warnings", icon: "cyclone" },
    { key: "flood", label: "Flood Warnings", desc: "Flash flood and flood advisories", icon: "water" },
    { key: "winter", label: "Winter Storm", desc: "Snow, ice, and freezing conditions", icon: "ac-unit" },
    { key: "heat", label: "Extreme Heat", desc: "Heat advisories and excessive heat warnings", icon: "whatshot" },
    { key: "fire", label: "Wildfire / Red Flag", desc: "Fire weather warnings and red flag conditions", icon: "local-fire-department" },
    { key: "lightning", label: "Severe Thunderstorm", desc: "Lightning, hail, and severe storms", icon: "flash-on" },
  ];

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Weather Alerts</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary */}
      <View style={[styles.summaryBar, { backgroundColor: alerts.length > 0 ? "#FEF3C7" : "#DCFCE7" }]}>
        <MaterialIcons name={alerts.length > 0 ? "warning" : "check-circle"} size={20} color={alerts.length > 0 ? "#D97706" : "#16A34A"} />
        <Text style={{ color: alerts.length > 0 ? "#92400E" : "#166534", fontWeight: "600", fontSize: 14 }}>
          {alerts.length > 0 ? `${alerts.length} active alert${alerts.length > 1 ? "s" : ""} for your campgrounds` : "No active weather alerts"}
        </Text>
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["alerts", "monitored", "settings"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.muted }]}>
              {t === "alerts" ? `Alerts (${alerts.length})` : t === "monitored" ? `Sites (${monitored.length})` : "Settings"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "alerts" && (
        <FlatList data={alerts} renderItem={renderAlert} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="wb-sunny" size={48} color="#F59E0B" />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All Clear!</Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>No weather alerts for your monitored campgrounds. Add campgrounds to monitor in the Sites tab.</Text>
            </View>
          }
        />
      )}

      {tab === "monitored" && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
          {monitored.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="add-location" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Monitored Sites</Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>Save campgrounds as favorites to automatically monitor their weather.</Text>
            </View>
          )}
          {monitored.map((s) => (
            <View key={s.siteId} style={[styles.siteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="place" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.siteName, { color: colors.foreground }]}>{s.siteName}</Text>
                <Text style={[styles.siteState, { color: colors.muted }]}>{s.state}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveSite(s.siteId)}>
                <MaterialIcons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {tab === "settings" && settings && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Alert Types</Text>
          <Text style={[styles.sectionDesc, { color: colors.muted }]}>Choose which weather alerts you want to receive for your monitored campgrounds.</Text>
          {alertTypes.map((at) => (
            <View key={at.key} style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name={at.icon as any} size={22} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{at.label}</Text>
                <Text style={[styles.settingDesc, { color: colors.muted }]}>{at.desc}</Text>
              </View>
              <Switch
                value={settings.enabledTypes.includes(at.key)}
                onValueChange={() => handleToggle(at.key)}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={settings.enabledTypes.includes(at.key) ? colors.primary : "#f4f3f4"}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  summaryBar: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10 },
  tabs: { flexDirection: "row", borderBottomWidth: 0.5, marginTop: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
  alertCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  alertHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sevBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  alertTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  alertSite: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  alertDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  alertMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  alertTime: { fontSize: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  siteCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 10, borderWidth: 1, gap: 10 },
  siteName: { fontSize: 15, fontWeight: "600" },
  siteState: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  sectionDesc: { fontSize: 13, marginBottom: 4 },
  settingRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: "600" },
  settingDesc: { fontSize: 12, marginTop: 2 },
});
