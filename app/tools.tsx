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
  Modal,
  Alert,
  StyleSheet,
  Platform,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { formatDateInput, isoToDisplay, formatDate } from "@/lib/date-utils";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Storage Keys ──
const FUEL_KEY = "@rv_nomad_fuel_logs";
const MAINT_KEY = "@rv_nomad_maintenance";
const PACK_KEY = "@rv_nomad_packing";
const CHECK_KEY = "@rv_nomad_checklists";

// ── Types ──
interface FuelEntry {
  id: string;
  date: string;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  odometer: number;
  mpg: number | null;
  location: string;
}

interface MaintenanceEntry {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  odometerMiles: number;
  nextDueMiles: number | null;
  nextDueDate: string;
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

type ToolTab = "fuel" | "maintenance" | "packing" | "checklists" | "weight" | "tires";

// ── Default Checklists ──
const DEFAULT_CHECKLISTS: Checklist[] = [
  {
    id: "pre-departure",
    name: "Pre-Departure",
    items: [
      { id: "pd1", text: "Retract slides", checked: false },
      { id: "pd2", text: "Disconnect water hose", checked: false },
      { id: "pd3", text: "Disconnect electric", checked: false },
      { id: "pd4", text: "Disconnect sewer", checked: false },
      { id: "pd5", text: "Retract leveling jacks", checked: false },
      { id: "pd6", text: "Retract awning", checked: false },
      { id: "pd7", text: "Secure all cabinets/drawers", checked: false },
      { id: "pd8", text: "Check tire pressure", checked: false },
      { id: "pd9", text: "Check all lights", checked: false },
      { id: "pd10", text: "Secure roof vents", checked: false },
      { id: "pd11", text: "Turn off propane (if required)", checked: false },
      { id: "pd12", text: "Check mirrors", checked: false },
      { id: "pd13", text: "Stow antenna/satellite", checked: false },
      { id: "pd14", text: "Walk around inspection", checked: false },
    ],
  },
  {
    id: "arrival-setup",
    name: "Arrival Setup",
    items: [
      { id: "as1", text: "Level the RV", checked: false },
      { id: "as2", text: "Deploy slides", checked: false },
      { id: "as3", text: "Connect electric hookup", checked: false },
      { id: "as4", text: "Connect water hookup", checked: false },
      { id: "as5", text: "Connect sewer hookup", checked: false },
      { id: "as6", text: "Deploy awning", checked: false },
      { id: "as7", text: "Set up outdoor furniture", checked: false },
      { id: "as8", text: "Turn on water heater", checked: false },
      { id: "as9", text: "Turn on A/C or heat", checked: false },
      { id: "as10", text: "Check for leaks", checked: false },
    ],
  },
  {
    id: "monthly-maintenance",
    name: "Monthly Maintenance",
    items: [
      { id: "mm1", text: "Check roof seals", checked: false },
      { id: "mm2", text: "Inspect tires for wear", checked: false },
      { id: "mm3", text: "Test smoke/CO detectors", checked: false },
      { id: "mm4", text: "Check battery water levels", checked: false },
      { id: "mm5", text: "Lubricate slide mechanisms", checked: false },
      { id: "mm6", text: "Clean A/C filters", checked: false },
      { id: "mm7", text: "Check generator oil", checked: false },
      { id: "mm8", text: "Inspect plumbing connections", checked: false },
    ],
  },
  {
    id: "winterization",
    name: "Winterization",
    items: [
      { id: "wz1", text: "Drain fresh water tank", checked: false },
      { id: "wz2", text: "Drain hot water heater", checked: false },
      { id: "wz3", text: "Bypass water heater", checked: false },
      { id: "wz4", text: "Add RV antifreeze to lines", checked: false },
      { id: "wz5", text: "Drain gray/black tanks", checked: false },
      { id: "wz6", text: "Disconnect batteries", checked: false },
      { id: "wz7", text: "Cover exterior vents", checked: false },
      { id: "wz8", text: "Cover tires", checked: false },
      { id: "wz9", text: "Use RV cover or store indoors", checked: false },
      { id: "wz10", text: "Add fuel stabilizer to generator", checked: false },
    ],
  },
];

const PACKING_CATEGORIES = ["Kitchen", "Bedroom", "Bathroom", "Outdoor", "Tools", "Electronics", "Safety", "Other"];

export default function ToolsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<ToolTab>("fuel");

  // ── Fuel State ──
  const [fuelLogs, setFuelLogs] = useState<FuelEntry[]>([]);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelDate, setFuelDate] = useState("");
  const [fuelGallons, setFuelGallons] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelOdometer, setFuelOdometer] = useState("");
  const [fuelLocation, setFuelLocation] = useState("");

  // ── Maintenance State ──
  const [maintLogs, setMaintLogs] = useState<MaintenanceEntry[]>([]);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintDate, setMaintDate] = useState("");
  const [maintType, setMaintType] = useState("");
  const [maintDesc, setMaintDesc] = useState("");
  const [maintCost, setMaintCost] = useState("");
  const [maintOdo, setMaintOdo] = useState("");
  const [maintNextDate, setMaintNextDate] = useState("");

  // ── Packing State ──
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [showPackModal, setShowPackModal] = useState(false);
  const [packName, setPackName] = useState("");
  const [packCategory, setPackCategory] = useState("Other");

  // ── Checklists State ──
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);

  // ── Load Data ──
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [f, m, p, c] = await Promise.all([
          AsyncStorage.getItem(FUEL_KEY),
          AsyncStorage.getItem(MAINT_KEY),
          AsyncStorage.getItem(PACK_KEY),
          AsyncStorage.getItem(CHECK_KEY),
        ]);
        if (f) setFuelLogs(JSON.parse(f));
        if (m) setMaintLogs(JSON.parse(m));
        if (p) setPackingItems(JSON.parse(p));
        setChecklists(c ? JSON.parse(c) : DEFAULT_CHECKLISTS);
      })();
    }, [])
  );

  // ── Fuel Actions ──
  const addFuelEntry = async () => {
    const gallons = parseFloat(fuelGallons);
    const price = parseFloat(fuelPrice);
    const odo = parseInt(fuelOdometer);
    if (!gallons || !price || !odo) { Alert.alert("Error", "Fill in all required fields"); return; }

    let mpg: number | null = null;
    if (fuelLogs.length > 0) {
      const lastOdo = fuelLogs[0].odometer;
      if (odo > lastOdo) mpg = Math.round(((odo - lastOdo) / gallons) * 10) / 10;
    }

    const entry: FuelEntry = {
      id: Date.now().toString(),
      date: fuelDate || formatDate(new Date()),
      gallons, pricePerGallon: price,
      totalCost: Math.round(gallons * price * 100) / 100,
      odometer: odo, mpg,
      location: fuelLocation,
    };
    const updated = [entry, ...fuelLogs];
    setFuelLogs(updated);
    await AsyncStorage.setItem(FUEL_KEY, JSON.stringify(updated));
    setFuelDate(""); setFuelGallons(""); setFuelPrice(""); setFuelOdometer(""); setFuelLocation("");
    setShowFuelModal(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const fuelStats = useMemo(() => {
    if (fuelLogs.length === 0) return { totalGallons: 0, totalCost: 0, avgMpg: 0, avgPrice: 0 };
    const totalGallons = fuelLogs.reduce((s, e) => s + e.gallons, 0);
    const totalCost = fuelLogs.reduce((s, e) => s + e.totalCost, 0);
    const mpgEntries = fuelLogs.filter((e) => e.mpg !== null);
    const avgMpg = mpgEntries.length > 0 ? mpgEntries.reduce((s, e) => s + (e.mpg || 0), 0) / mpgEntries.length : 0;
    const avgPrice = totalCost / totalGallons;
    return { totalGallons: Math.round(totalGallons * 10) / 10, totalCost: Math.round(totalCost * 100) / 100, avgMpg: Math.round(avgMpg * 10) / 10, avgPrice: Math.round(avgPrice * 100) / 100 };
  }, [fuelLogs]);

  // ── Maintenance Actions ──
  const addMaintEntry = async () => {
    if (!maintType.trim()) { Alert.alert("Error", "Enter maintenance type"); return; }
    const entry: MaintenanceEntry = {
      id: Date.now().toString(),
      date: maintDate || formatDate(new Date()),
      type: maintType.trim(), description: maintDesc.trim(),
      cost: parseFloat(maintCost) || 0,
      odometerMiles: parseInt(maintOdo) || 0,
      nextDueMiles: null, nextDueDate: maintNextDate,
    };
    const updated = [entry, ...maintLogs];
    setMaintLogs(updated);
    await AsyncStorage.setItem(MAINT_KEY, JSON.stringify(updated));
    setMaintDate(""); setMaintType(""); setMaintDesc(""); setMaintCost(""); setMaintOdo(""); setMaintNextDate("");
    setShowMaintModal(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── Packing Actions ──
  const addPackingItem = async () => {
    if (!packName.trim()) return;
    const item: PackingItem = { id: Date.now().toString(), name: packName.trim(), category: packCategory, packed: false };
    const updated = [...packingItems, item];
    setPackingItems(updated);
    await AsyncStorage.setItem(PACK_KEY, JSON.stringify(updated));
    setPackName(""); setShowPackModal(false);
  };

  const togglePacked = async (itemId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = packingItems.map((i) => i.id === itemId ? { ...i, packed: !i.packed } : i);
    setPackingItems(updated);
    await AsyncStorage.setItem(PACK_KEY, JSON.stringify(updated));
  };

  const deletePackingItem = async (itemId: string) => {
    const updated = packingItems.filter((i) => i.id !== itemId);
    setPackingItems(updated);
    await AsyncStorage.setItem(PACK_KEY, JSON.stringify(updated));
  };

  // ── Checklist Actions ──
  const toggleChecklistItem = async (checklistId: string, itemId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = checklists.map((cl) =>
      cl.id === checklistId
        ? { ...cl, items: cl.items.map((i) => i.id === itemId ? { ...i, checked: !i.checked } : i) }
        : cl
    );
    setChecklists(updated);
    await AsyncStorage.setItem(CHECK_KEY, JSON.stringify(updated));
  };

  const resetChecklist = async (checklistId: string) => {
    const updated = checklists.map((cl) =>
      cl.id === checklistId ? { ...cl, items: cl.items.map((i) => ({ ...i, checked: false })) } : cl
    );
    setChecklists(updated);
    await AsyncStorage.setItem(CHECK_KEY, JSON.stringify(updated));
  };

  const packedCount = packingItems.filter((i) => i.packed).length;
  const groupedPacking = useMemo(() => {
    const groups: Record<string, PackingItem[]> = {};
    packingItems.forEach((i) => {
      if (!groups[i.category]) groups[i.category] = [];
      groups[i.category].push(i);
    });
    return groups;
  }, [packingItems]);

  // ── Tab Icons ──
  const tabs: { key: ToolTab; icon: string; label: string }[] = [
    { key: "fuel", icon: "local-gas-station", label: "Fuel" },
    { key: "maintenance", icon: "build", label: "Maint." },
    { key: "packing", icon: "inventory-2", label: "Packing" },
    { key: "checklists", icon: "checklist", label: "Lists" },
    { key: "weight", icon: "scale", label: "Weight" },
    { key: "tires", icon: "tire-repair", label: "Tires" },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>RV Tools</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderColor: colors.border }]}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tabItem, tab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <MaterialIcons name={t.icon as any} size={20} color={tab === t.key ? colors.primary : colors.muted} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? colors.primary : colors.muted }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ═══ FUEL TAB ═══ */}
      {tab === "fuel" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Stats */}
          <View style={styles.statsGrid}>
            {[
              { label: "Avg MPG", value: fuelStats.avgMpg.toString(), icon: "speed" },
              { label: "Total Gallons", value: fuelStats.totalGallons.toString(), icon: "local-gas-station" },
              { label: "Total Spent", value: `$${fuelStats.totalCost}`, icon: "attach-money" },
              { label: "Avg $/gal", value: `$${fuelStats.avgPrice}`, icon: "trending-up" },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialIcons name={s.icon as any} size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value || "—"}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowFuelModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Log Fill-Up</Text>
          </TouchableOpacity>

          {fuelLogs.map((entry) => (
            <View key={entry.id} style={[styles.logCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.logRow}>
                <Text style={[styles.logDate, { color: colors.foreground }]}>{isoToDisplay(entry.date)}</Text>
                <Text style={[styles.logCost, { color: colors.primary }]}>${entry.totalCost.toFixed(2)}</Text>
              </View>
              <View style={styles.logRow}>
                <Text style={[styles.logDetail, { color: colors.muted }]}>
                  {entry.gallons} gal @ ${entry.pricePerGallon}/gal
                </Text>
                {entry.mpg !== null && (
                  <Text style={[styles.logMpg, { color: colors.success }]}>{entry.mpg} MPG</Text>
                )}
              </View>
              {entry.location ? (
                <Text style={[styles.logLocation, { color: colors.muted }]}>{entry.location}</Text>
              ) : null}
            </View>
          ))}

          {fuelLogs.length === 0 && (
            <View style={styles.emptySmall}>
              <MaterialIcons name="local-gas-station" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No fuel logs yet</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ═══ MAINTENANCE TAB ═══ */}
      {tab === "maintenance" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowMaintModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Log Maintenance</Text>
          </TouchableOpacity>

          {maintLogs.map((entry) => (
            <View key={entry.id} style={[styles.logCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.logRow}>
                <Text style={[styles.logDate, { color: colors.foreground }]}>{entry.type}</Text>
                <Text style={[styles.logCost, { color: colors.primary }]}>${entry.cost.toFixed(2)}</Text>
              </View>
              <Text style={[styles.logDetail, { color: colors.muted }]}>{isoToDisplay(entry.date)} · {entry.odometerMiles} mi</Text>
              {entry.description ? <Text style={[styles.logDetail, { color: colors.muted }]}>{entry.description}</Text> : null}
              {entry.nextDueDate ? (
                <Text style={[styles.logMpg, { color: colors.warning }]}>Next due: {isoToDisplay(entry.nextDueDate)}</Text>
              ) : null}
            </View>
          ))}

          {maintLogs.length === 0 && (
            <View style={styles.emptySmall}>
              <MaterialIcons name="build" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No maintenance records</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ═══ PACKING TAB ═══ */}
      {tab === "packing" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.packingHeader}>
            <Text style={[styles.packingCount, { color: colors.foreground }]}>
              {packedCount}/{packingItems.length} packed
            </Text>
            <TouchableOpacity
              style={[styles.addBtnSmall, { backgroundColor: colors.primary }]}
              onPress={() => setShowPackModal(true)}
            >
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnSmallText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {packingItems.length > 0 && (
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.success, width: `${packingItems.length > 0 ? (packedCount / packingItems.length) * 100 : 0}%` }]} />
            </View>
          )}

          {Object.entries(groupedPacking).map(([category, items]) => (
            <View key={category} style={styles.packGroup}>
              <Text style={[styles.packGroupTitle, { color: colors.foreground }]}>{category}</Text>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => togglePacked(item.id)}
                  onLongPress={() => {
                    Alert.alert("Delete", `Remove "${item.name}"?`, [
                      { text: "Cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deletePackingItem(item.id) },
                    ]);
                  }}
                  style={[styles.packItem, { borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={item.packed ? "check-box" : "check-box-outline-blank"}
                    size={22}
                    color={item.packed ? colors.success : colors.muted}
                  />
                  <Text style={[styles.packItemText, { color: item.packed ? colors.muted : colors.foreground }, item.packed && styles.packedText]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {packingItems.length === 0 && (
            <View style={styles.emptySmall}>
              <MaterialIcons name="inventory-2" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No packing items yet</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ═══ CHECKLISTS TAB ═══ */}
      {tab === "checklists" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {checklists.map((cl) => {
            const done = cl.items.filter((i) => i.checked).length;
            const isExpanded = expandedChecklist === cl.id;
            return (
              <View key={cl.id} style={[styles.checklistCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setExpandedChecklist(isExpanded ? null : cl.id)}
                  style={styles.checklistHeader}
                  activeOpacity={0.7}
                >
                  <View style={styles.checklistInfo}>
                    <Text style={[styles.checklistName, { color: colors.foreground }]}>{cl.name}</Text>
                    <Text style={[styles.checklistProgress, { color: done === cl.items.length ? colors.success : colors.muted }]}>
                      {done}/{cl.items.length} complete
                    </Text>
                  </View>
                  <View style={styles.checklistActions}>
                    {done > 0 && (
                      <TouchableOpacity onPress={() => resetChecklist(cl.id)} style={{ padding: 4 }}>
                        <MaterialIcons name="refresh" size={20} color={colors.muted} />
                      </TouchableOpacity>
                    )}
                    <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={24} color={colors.muted} />
                  </View>
                </TouchableOpacity>

                {/* Progress bar */}
                <View style={[styles.clProgress, { backgroundColor: colors.border }]}>
                  <View style={[styles.clProgressFill, { backgroundColor: colors.success, width: `${cl.items.length > 0 ? (done / cl.items.length) * 100 : 0}%` }]} />
                </View>

                {isExpanded && (
                  <View style={[styles.checklistItems, { borderTopColor: colors.border }]}>
                    {cl.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => toggleChecklistItem(cl.id, item.id)}
                        style={styles.checkItem}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name={item.checked ? "check-box" : "check-box-outline-blank"}
                          size={22}
                          color={item.checked ? colors.success : colors.muted}
                        />
                        <Text style={[styles.checkItemText, { color: item.checked ? colors.muted : colors.foreground }, item.checked && styles.checkedText]}>
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ═══ WEIGHT TAB ═══ */}
      {tab === "weight" && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 }}>
          <MaterialIcons name="scale" size={48} color={colors.primary} />
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, textAlign: "center" }}>Weight Calculator</Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>Track your GVWR, cargo, water tanks & passenger weight to stay safe on the road.</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 }}
            onPress={() => router.push("/weight-calculator" as any)}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Open Weight Calculator</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ═══ TIRES TAB ═══ */}
      {tab === "tires" && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 }}>
          <MaterialIcons name="tire-repair" size={48} color={colors.primary} />
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, textAlign: "center" }}>Tire Pressure Monitor</Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>Track PSI readings, tread depth & get safety tips for every tire on your rig.</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 }}
            onPress={() => router.push("/tire-pressure" as any)}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Open Tire Pressure</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ═══ FUEL MODAL ═══ */}
      <Modal visible={showFuelModal} transparent animationType="slide" onRequestClose={() => setShowFuelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Log Fill-Up</Text>
              <TouchableOpacity onPress={() => setShowFuelModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>
            {[
              { label: "Date", value: fuelDate, set: (t: string) => setFuelDate(formatDateInput(t)), placeholder: "MM-DD-YYYY", kb: "number-pad" as const },
              { label: "Gallons", value: fuelGallons, set: setFuelGallons, placeholder: "e.g., 25.5", kb: "numeric" as const },
              { label: "Price per Gallon", value: fuelPrice, set: setFuelPrice, placeholder: "e.g., 3.49", kb: "numeric" as const },
              { label: "Odometer (miles)", value: fuelOdometer, set: setFuelOdometer, placeholder: "e.g., 45230", kb: "numeric" as const },
              { label: "Location (optional)", value: fuelLocation, set: setFuelLocation, placeholder: "e.g., Shell, Flagstaff AZ", kb: "default" as const },
            ].map((f, i) => (
              <View key={i} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.kb}
                  returnKeyType="done"
                />
              </View>
            ))}
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={addFuelEntry} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══ MAINTENANCE MODAL ═══ */}
      <Modal visible={showMaintModal} transparent animationType="slide" onRequestClose={() => setShowMaintModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Log Maintenance</Text>
              <TouchableOpacity onPress={() => setShowMaintModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>
            {[
              { label: "Type", value: maintType, set: setMaintType, placeholder: "e.g., Oil Change", kb: "default" as const },
              { label: "Date", value: maintDate, set: (t: string) => setMaintDate(formatDateInput(t)), placeholder: "MM-DD-YYYY", kb: "number-pad" as const },
              { label: "Cost ($)", value: maintCost, set: setMaintCost, placeholder: "e.g., 85.00", kb: "numeric" as const },
              { label: "Odometer (miles)", value: maintOdo, set: setMaintOdo, placeholder: "e.g., 45230", kb: "numeric" as const },
              { label: "Next Due Date", value: maintNextDate, set: (t: string) => setMaintNextDate(formatDateInput(t)), placeholder: "MM-DD-YYYY", kb: "number-pad" as const },
            ].map((f, i) => (
              <View key={i} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.kb}
                  returnKeyType="done"
                />
              </View>
            ))}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Notes..."
                placeholderTextColor={colors.muted}
                value={maintDesc}
                onChangeText={setMaintDesc}
                multiline
              />
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={addMaintEntry} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══ PACKING MODAL ═══ */}
      <Modal visible={showPackModal} transparent animationType="slide" onRequestClose={() => setShowPackModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Packing Item</Text>
              <TouchableOpacity onPress={() => setShowPackModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Item Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g., Sleeping bag"
                placeholderTextColor={colors.muted}
                value={packName}
                onChangeText={setPackName}
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {PACKING_CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setPackCategory(c)}
                    style={[styles.catChip, { borderColor: packCategory === c ? colors.primary : colors.border, backgroundColor: packCategory === c ? colors.primary + "15" : "transparent" }]}
                  >
                    <Text style={[styles.catChipText, { color: packCategory === c ? colors.primary : colors.muted }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={addPackingItem} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 4 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  tabBar: { flexDirection: "row", marginHorizontal: 16, borderBottomWidth: 1 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10, gap: 2, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabLabel: { fontSize: 11, fontWeight: "600" },
  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, paddingTop: 12, gap: 8 },
  statCard: { width: "47%", borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11 },
  // Buttons
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginTop: 12, paddingVertical: 12, borderRadius: 12, gap: 6 },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  addBtnSmall: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 4 },
  addBtnSmallText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  // Log cards
  logCard: { marginHorizontal: 16, marginTop: 8, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  logRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logDate: { fontSize: 15, fontWeight: "600" },
  logCost: { fontSize: 16, fontWeight: "700" },
  logDetail: { fontSize: 13 },
  logMpg: { fontSize: 13, fontWeight: "600" },
  logLocation: { fontSize: 12, marginTop: 2 },
  // Packing
  packingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 12 },
  packingCount: { fontSize: 16, fontWeight: "700" },
  progressBar: { height: 6, borderRadius: 3, marginHorizontal: 16, marginTop: 8 },
  progressFill: { height: 6, borderRadius: 3 },
  packGroup: { paddingHorizontal: 16, marginTop: 16 },
  packGroupTitle: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  packItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  packItemText: { fontSize: 15, flex: 1 },
  packedText: { textDecorationLine: "line-through" },
  // Checklists
  checklistCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  checklistHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  checklistInfo: { flex: 1, gap: 2 },
  checklistName: { fontSize: 17, fontWeight: "700" },
  checklistProgress: { fontSize: 13 },
  checklistActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  clProgress: { height: 4, marginHorizontal: 16 },
  clProgressFill: { height: 4 },
  checklistItems: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 8 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  checkItemText: { fontSize: 15, flex: 1 },
  checkedText: { textDecorationLine: "line-through" },
  // Empty
  emptySmall: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 13, fontWeight: "600" },
  input: { height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  textArea: { height: 70, paddingTop: 10, textAlignVertical: "top" },
  saveBtn: { height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  catScroll: { marginTop: 4 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  catChipText: { fontSize: 13, fontWeight: "500" },
});
