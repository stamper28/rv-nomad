/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const STORAGE_KEY = "@rv_nomad_tire_pressure";

interface TireConfig {
  rvType: string;
  tires: TireEntry[];
  lastChecked: string;
}

interface TireEntry {
  id: string;
  position: string;
  recommendedPsi: string;
  currentPsi: string;
  treadDepth: string;
  brand: string;
  dateInstalled: string;
  mileageInstalled: string;
}

const RV_TYPES = [
  { label: "Class A Motorhome", tires: ["Front Left", "Front Right", "Rear Left Outer", "Rear Left Inner", "Rear Right Inner", "Rear Right Outer"] },
  { label: "Class B Van", tires: ["Front Left", "Front Right", "Rear Left", "Rear Right"] },
  { label: "Class C Motorhome", tires: ["Front Left", "Front Right", "Rear Left Outer", "Rear Left Inner", "Rear Right Inner", "Rear Right Outer"] },
  { label: "Travel Trailer", tires: ["Left Front", "Left Rear", "Right Front", "Right Rear"] },
  { label: "Fifth Wheel", tires: ["Left Front", "Left Rear", "Right Front", "Right Rear"] },
  { label: "Truck (Tow Vehicle)", tires: ["Front Left", "Front Right", "Rear Left", "Rear Right"] },
  { label: "Truck (Dually)", tires: ["Front Left", "Front Right", "Rear Left Outer", "Rear Left Inner", "Rear Right Inner", "Rear Right Outer"] },
];

const PRESSURE_TIPS = [
  { icon: "thermostat", title: "Check When Cold", desc: "Always check tire pressure when tires are cold (before driving or 3+ hours after driving)." },
  { icon: "warning", title: "Temperature Changes", desc: "Tire pressure drops ~1 PSI for every 10°F drop in temperature. Check more often in fall/spring." },
  { icon: "speed", title: "Don't Over-Inflate", desc: "Over-inflation causes uneven wear in the center. Under-inflation wears the edges and increases blowout risk." },
  { icon: "calendar-today", title: "Check Weekly", desc: "Check all tire pressures at least once a week during travel, and before every trip." },
  { icon: "swap-vert", title: "Rotate Tires", desc: "Rotate trailer tires every 5,000-8,000 miles. RV tires should be replaced every 5-7 years regardless of tread." },
];

export default function TirePressureScreen() {
  const colors = useColors();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [tires, setTires] = useState<TireEntry[]>([]);
  const [lastChecked, setLastChecked] = useState("");
  const [editingTire, setEditingTire] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data: TireConfig = JSON.parse(saved);
          setSelectedType(data.rvType);
          setTires(data.tires);
          setLastChecked(data.lastChecked);
        }
      })();
    }, [])
  );

  const save = async (type: string, entries: TireEntry[], checked: string) => {
    const data: TireConfig = { rvType: type, tires: entries, lastChecked: checked };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const selectRvType = async (typeLabel: string) => {
    const rvType = RV_TYPES.find((t) => t.label === typeLabel);
    if (!rvType) return;

    const newTires: TireEntry[] = rvType.tires.map((pos, i) => ({
      id: `tire-${i}`,
      position: pos,
      recommendedPsi: "",
      currentPsi: "",
      treadDepth: "",
      brand: "",
      dateInstalled: "",
      mileageInstalled: "",
    }));

    setSelectedType(typeLabel);
    setTires(newTires);
    setShowTypeSelector(false);
    await save(typeLabel, newTires, "");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const updateTire = async (tireId: string, field: keyof TireEntry, value: string) => {
    const updated = tires.map((t) => (t.id === tireId ? { ...t, [field]: value } : t));
    setTires(updated);
  };

  const saveTire = async (tireId: string) => {
    setEditingTire(null);
    await save(selectedType || "", tires, lastChecked);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const markAllChecked = async () => {
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setLastChecked(now);
    await save(selectedType || "", tires, now);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Pressure Check Logged", `All tires marked as checked on ${now}`);
  };

  const getStatus = (tire: TireEntry): { color: string; label: string; icon: string } => {
    const rec = parseFloat(tire.recommendedPsi);
    const cur = parseFloat(tire.currentPsi);
    if (!rec || !cur) return { color: colors.muted, label: "Not Set", icon: "help-outline" };
    const diff = cur - rec;
    if (Math.abs(diff) <= 3) return { color: colors.success, label: "Good", icon: "check-circle" };
    if (diff < -3) return { color: colors.error, label: "Low", icon: "arrow-downward" };
    return { color: colors.warning, label: "High", icon: "arrow-upward" };
  };

  const alertCount = useMemo(() => {
    return tires.filter((t) => {
      const rec = parseFloat(t.recommendedPsi);
      const cur = parseFloat(t.currentPsi);
      return rec && cur && Math.abs(cur - rec) > 3;
    }).length;
  }, [tires]);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Tire Pressure</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}>
        {/* Status Banner */}
        {selectedType && (
          <View style={[styles.statusBanner, { backgroundColor: alertCount > 0 ? colors.error + "15" : colors.success + "15", borderColor: alertCount > 0 ? colors.error + "40" : colors.success + "40" }]}>
            <MaterialIcons name={alertCount > 0 ? "warning" : "check-circle"} size={24} color={alertCount > 0 ? colors.error : colors.success} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.statusTitle, { color: alertCount > 0 ? colors.error : colors.success }]}>
                {alertCount > 0 ? `${alertCount} tire${alertCount > 1 ? "s" : ""} need attention` : "All tires look good"}
              </Text>
              {lastChecked ? (
                <Text style={[styles.statusSub, { color: colors.muted }]}>Last checked: {lastChecked}</Text>
              ) : (
                <Text style={[styles.statusSub, { color: colors.muted }]}>Enter current PSI readings below</Text>
              )}
            </View>
          </View>
        )}

        {/* RV Type Selector */}
        <TouchableOpacity
          style={[styles.typeSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowTypeSelector(!showTypeSelector)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="directions-car" size={22} color={colors.primary} />
          <Text style={[styles.typeSelectorText, { color: selectedType ? colors.foreground : colors.muted }]}>
            {selectedType || "Select your RV type"}
          </Text>
          <MaterialIcons name={showTypeSelector ? "expand-less" : "expand-more"} size={22} color={colors.muted} />
        </TouchableOpacity>

        {showTypeSelector && (
          <View style={[styles.typeList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {RV_TYPES.map((type) => (
              <TouchableOpacity
                key={type.label}
                style={[styles.typeOption, selectedType === type.label && { backgroundColor: colors.primary + "15" }]}
                onPress={() => selectRvType(type.label)}
              >
                <Text style={[styles.typeOptionText, { color: selectedType === type.label ? colors.primary : colors.foreground }]}>
                  {type.label}
                </Text>
                <Text style={[styles.typeOptionCount, { color: colors.muted }]}>{type.tires.length} tires</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tire Cards */}
        {selectedType && tires.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tire Pressures</Text>
              <TouchableOpacity onPress={markAllChecked} style={[styles.checkAllBtn, { backgroundColor: colors.primary + "15" }]}>
                <MaterialIcons name="done-all" size={16} color={colors.primary} />
                <Text style={[styles.checkAllText, { color: colors.primary }]}>Log Check</Text>
              </TouchableOpacity>
            </View>

            {tires.map((tire) => {
              const status = getStatus(tire);
              const isEditing = editingTire === tire.id;

              return (
                <TouchableOpacity
                  key={tire.id}
                  style={[styles.tireCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setEditingTire(isEditing ? null : tire.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tireHeader}>
                    <View style={styles.tireHeaderLeft}>
                      <MaterialIcons name="radio-button-checked" size={16} color={status.color} />
                      <Text style={[styles.tirePosition, { color: colors.foreground }]}>{tire.position}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
                      <MaterialIcons name={status.icon as any} size={14} color={status.color} />
                      <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>

                  <View style={styles.tirePsiRow}>
                    <View style={styles.psiBlock}>
                      <Text style={[styles.psiLabel, { color: colors.muted }]}>Recommended</Text>
                      {isEditing ? (
                        <TextInput
                          style={[styles.psiInput, { color: colors.foreground, borderColor: colors.border }]}
                          value={tire.recommendedPsi}
                          onChangeText={(v) => updateTire(tire.id, "recommendedPsi", v)}
                          keyboardType="numeric"
                          placeholder="PSI"
                          placeholderTextColor={colors.border}
                          returnKeyType="done"
                        />
                      ) : (
                        <Text style={[styles.psiValue, { color: colors.foreground }]}>
                          {tire.recommendedPsi ? `${tire.recommendedPsi} PSI` : "—"}
                        </Text>
                      )}
                    </View>
                    <View style={styles.psiBlock}>
                      <Text style={[styles.psiLabel, { color: colors.muted }]}>Current</Text>
                      {isEditing ? (
                        <TextInput
                          style={[styles.psiInput, { color: colors.foreground, borderColor: colors.border }]}
                          value={tire.currentPsi}
                          onChangeText={(v) => updateTire(tire.id, "currentPsi", v)}
                          keyboardType="numeric"
                          placeholder="PSI"
                          placeholderTextColor={colors.border}
                          returnKeyType="done"
                        />
                      ) : (
                        <Text style={[styles.psiValue, { color: status.color }]}>
                          {tire.currentPsi ? `${tire.currentPsi} PSI` : "—"}
                        </Text>
                      )}
                    </View>
                  </View>

                  {isEditing && (
                    <View style={styles.tireExtra}>
                      <View style={styles.tireExtraRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.psiLabel, { color: colors.muted }]}>Tread Depth (32nds)</Text>
                          <TextInput
                            style={[styles.psiInput, { color: colors.foreground, borderColor: colors.border }]}
                            value={tire.treadDepth}
                            onChangeText={(v) => updateTire(tire.id, "treadDepth", v)}
                            keyboardType="numeric"
                            placeholder="e.g., 8"
                            placeholderTextColor={colors.border}
                            returnKeyType="done"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.psiLabel, { color: colors.muted }]}>Tire Brand</Text>
                          <TextInput
                            style={[styles.psiInput, { color: colors.foreground, borderColor: colors.border }]}
                            value={tire.brand}
                            onChangeText={(v) => updateTire(tire.id, "brand", v)}
                            placeholder="e.g., Michelin"
                            placeholderTextColor={colors.border}
                            returnKeyType="done"
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.saveTireBtn, { backgroundColor: colors.primary }]}
                        onPress={() => saveTire(tire.id)}
                      >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Tips Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Tire Safety Tips</Text>
        {PRESSURE_TIPS.map((tip, i) => (
          <View key={i} style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name={tip.icon as any} size={22} color={colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.tipTitle, { color: colors.foreground }]}>{tip.title}</Text>
              <Text style={[styles.tipDesc, { color: colors.muted }]}>{tip.desc}</Text>
            </View>
          </View>
        ))}

        {!selectedType && (
          <View style={styles.empty}>
            <MaterialIcons name="tire-repair" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>Select your RV type above to get started</Text>
            <Text style={[styles.emptyHint, { color: colors.muted }]}>Track pressure for every tire on your rig</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  statusBanner: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, borderWidth: 0.5, marginBottom: 16 },
  statusTitle: { fontSize: 15, fontWeight: "600" },
  statusSub: { fontSize: 12, marginTop: 2 },
  typeSelector: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, borderWidth: 0.5, gap: 10, marginBottom: 4 },
  typeSelectorText: { flex: 1, fontSize: 15, fontWeight: "500" },
  typeList: { borderRadius: 12, borderWidth: 0.5, marginBottom: 12, overflow: "hidden" },
  typeOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "rgba(128,128,128,0.15)" },
  typeOptionText: { fontSize: 15 },
  typeOptionCount: { fontSize: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  checkAllBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  checkAllText: { fontSize: 13, fontWeight: "600" },
  tireCard: { borderRadius: 12, padding: 14, borderWidth: 0.5, marginBottom: 8 },
  tireHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  tireHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  tirePosition: { fontSize: 15, fontWeight: "600" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  tirePsiRow: { flexDirection: "row", gap: 12 },
  psiBlock: { flex: 1 },
  psiLabel: { fontSize: 11, marginBottom: 4 },
  psiValue: { fontSize: 18, fontWeight: "700" },
  psiInput: { borderWidth: 0.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 16, fontWeight: "600" },
  tireExtra: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: "rgba(128,128,128,0.2)" },
  tireExtraRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  saveTireBtn: { paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tipCard: { flexDirection: "row", borderRadius: 12, padding: 14, borderWidth: 0.5, marginBottom: 8 },
  tipTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  tipDesc: { fontSize: 12, lineHeight: 17 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "500" },
  emptyHint: { fontSize: 12 },
});
