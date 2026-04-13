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

const STORAGE_KEY = "@rv_nomad_weight_calc";

interface WeightProfile {
  gvwr: string;
  gcwr: string;
  uvw: string;
  hitchWeight: string;
  cargo: WeightItem[];
}

interface WeightItem {
  id: string;
  name: string;
  weight: string;
  category: string;
}

const CATEGORIES = [
  "Water & Tanks",
  "Passengers",
  "Gear & Equipment",
  "Food & Supplies",
  "Clothing",
  "Electronics",
  "Tools",
  "Other",
];

const WATER_WEIGHT_PER_GAL = 8.34; // lbs per gallon

export default function WeightCalculatorScreen() {
  const colors = useColors();
  const router = useRouter();

  const [gvwr, setGvwr] = useState("");
  const [gcwr, setGcwr] = useState("");
  const [uvw, setUvw] = useState("");
  const [hitchWeight, setHitchWeight] = useState("");
  const [cargo, setCargo] = useState<WeightItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newCategory, setNewCategory] = useState("Other");

  // Water calculator
  const [freshGallons, setFreshGallons] = useState("");
  const [grayGallons, setGrayGallons] = useState("");
  const [blackGallons, setBlackGallons] = useState("");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data: WeightProfile = JSON.parse(saved);
          setGvwr(data.gvwr);
          setGcwr(data.gcwr);
          setUvw(data.uvw);
          setHitchWeight(data.hitchWeight);
          setCargo(data.cargo || []);
        }
      })();
    }, [])
  );

  const save = async (items?: WeightItem[]) => {
    const data: WeightProfile = {
      gvwr,
      gcwr,
      uvw,
      hitchWeight,
      cargo: items ?? cargo,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addItem = async () => {
    if (!newName.trim() || !newWeight.trim()) {
      Alert.alert("Missing Info", "Enter item name and weight.");
      return;
    }
    const item: WeightItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      weight: newWeight.trim(),
      category: newCategory,
    };
    const updated = [...cargo, item];
    setCargo(updated);
    await save(updated);
    setNewName("");
    setNewWeight("");
    setShowAddItem(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const removeItem = async (id: string) => {
    const updated = cargo.filter((c) => c.id !== id);
    setCargo(updated);
    await save(updated);
  };

  const waterWeight = useMemo(() => {
    const fresh = (parseFloat(freshGallons) || 0) * WATER_WEIGHT_PER_GAL;
    const gray = (parseFloat(grayGallons) || 0) * WATER_WEIGHT_PER_GAL;
    const black = (parseFloat(blackGallons) || 0) * WATER_WEIGHT_PER_GAL;
    return { fresh: Math.round(fresh), gray: Math.round(gray), black: Math.round(black), total: Math.round(fresh + gray + black) };
  }, [freshGallons, grayGallons, blackGallons]);

  const cargoWeight = useMemo(() => {
    return cargo.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
  }, [cargo]);

  const totalWeight = useMemo(() => {
    const base = parseFloat(uvw) || 0;
    return Math.round(base + cargoWeight + waterWeight.total);
  }, [uvw, cargoWeight, waterWeight.total]);

  const gvwrNum = parseFloat(gvwr) || 0;
  const remaining = gvwrNum > 0 ? gvwrNum - totalWeight : 0;
  const overweight = gvwrNum > 0 && totalWeight > gvwrNum;
  const usagePercent = gvwrNum > 0 ? Math.min((totalWeight / gvwrNum) * 100, 100) : 0;

  const groupedCargo = useMemo(() => {
    const groups: Record<string, WeightItem[]> = {};
    cargo.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [cargo]);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Weight Calculator</Text>
        <TouchableOpacity onPress={() => save()} style={styles.backBtn}>
          <MaterialIcons name="save" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}>
        {/* Weight Gauge */}
        <View style={[styles.gaugeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.gaugeLabel, { color: colors.muted }]}>Estimated Total Weight</Text>
          <Text style={[styles.gaugeValue, { color: overweight ? colors.error : colors.foreground }]}>
            {totalWeight.toLocaleString()} lbs
          </Text>
          {gvwrNum > 0 && (
            <>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${usagePercent}%`,
                      backgroundColor: overweight ? colors.error : usagePercent > 80 ? colors.warning : colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.gaugeRemaining, { color: overweight ? colors.error : colors.success }]}>
                {overweight
                  ? `Over GVWR by ${Math.abs(remaining).toLocaleString()} lbs`
                  : `${remaining.toLocaleString()} lbs remaining`}
              </Text>
            </>
          )}
        </View>

        {/* RV Specs */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>RV Specifications</Text>
        <Text style={[styles.sectionHint, { color: colors.muted }]}>
          Find these on your RV's Federal Weight Label (usually inside the driver's door frame)
        </Text>
        <View style={styles.specGrid}>
          {[
            { label: "GVWR (lbs)", value: gvwr, setter: setGvwr, hint: "Gross Vehicle Weight Rating" },
            { label: "GCWR (lbs)", value: gcwr, setter: setGcwr, hint: "Gross Combined Weight Rating" },
            { label: "UVW (lbs)", value: uvw, setter: setUvw, hint: "Unloaded Vehicle Weight" },
            { label: "Hitch Weight (lbs)", value: hitchWeight, setter: setHitchWeight, hint: "Tongue/pin weight" },
          ].map((spec) => (
            <View key={spec.label} style={[styles.specInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.specLabel, { color: colors.muted }]}>{spec.label}</Text>
              <TextInput
                style={[styles.specValue, { color: colors.foreground }]}
                value={spec.value}
                onChangeText={spec.setter}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.border}
                returnKeyType="done"
              />
            </View>
          ))}
        </View>

        {/* Water Weight Calculator */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Water Weight</Text>
        <Text style={[styles.sectionHint, { color: colors.muted }]}>
          Water weighs {WATER_WEIGHT_PER_GAL} lbs/gallon. Enter current tank levels.
        </Text>
        <View style={[styles.waterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { label: "Fresh Water (gal)", value: freshGallons, setter: setFreshGallons, weight: waterWeight.fresh, color: "#3B82F6" },
            { label: "Gray Water (gal)", value: grayGallons, setter: setGrayGallons, weight: waterWeight.gray, color: "#6B7280" },
            { label: "Black Water (gal)", value: blackGallons, setter: setBlackGallons, weight: waterWeight.black, color: "#1F2937" },
          ].map((tank) => (
            <View key={tank.label} style={styles.waterRow}>
              <View style={[styles.waterDot, { backgroundColor: tank.color }]} />
              <Text style={[styles.waterLabel, { color: colors.foreground }]}>{tank.label}</Text>
              <TextInput
                style={[styles.waterInput, { color: colors.foreground, borderColor: colors.border }]}
                value={tank.value}
                onChangeText={tank.setter}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.border}
                returnKeyType="done"
              />
              <Text style={[styles.waterWeight, { color: colors.muted }]}>{tank.weight} lbs</Text>
            </View>
          ))}
          <View style={[styles.waterTotalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.waterTotalLabel, { color: colors.foreground }]}>Total Water Weight</Text>
            <Text style={[styles.waterTotalValue, { color: colors.primary }]}>{waterWeight.total.toLocaleString()} lbs</Text>
          </View>
        </View>

        {/* Cargo Items */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cargo & Passengers</Text>
          <Text style={[styles.cargoTotal, { color: colors.primary }]}>{cargoWeight.toLocaleString()} lbs</Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddItem(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>

        {showAddItem && (
          <View style={[styles.addForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              placeholder="Item name (e.g., Generator)"
              placeholderTextColor={colors.muted}
              value={newName}
              onChangeText={setNewName}
              returnKeyType="done"
            />
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              placeholder="Weight in lbs"
              placeholderTextColor={colors.muted}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: newCategory === cat ? colors.primary : colors.background,
                      borderColor: newCategory === cat ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: newCategory === cat ? "#fff" : colors.muted, fontSize: 12 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.formBtns}>
              <TouchableOpacity onPress={() => setShowAddItem(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.muted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addItem} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {Object.entries(groupedCargo).map(([category, items]) => (
          <View key={category} style={{ marginTop: 12 }}>
            <Text style={[styles.catTitle, { color: colors.muted }]}>{category}</Text>
            {items.map((item) => (
              <View key={item.id} style={[styles.cargoItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cargoName, { color: colors.foreground }]}>{item.name}</Text>
                </View>
                <Text style={[styles.cargoWeight, { color: colors.primary }]}>{parseFloat(item.weight).toLocaleString()} lbs</Text>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                  <MaterialIcons name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {cargo.length === 0 && (
          <View style={styles.empty}>
            <MaterialIcons name="inventory" size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>No cargo items added yet</Text>
            <Text style={[styles.emptyHint, { color: colors.muted }]}>Add items to track your total weight</Text>
          </View>
        )}

        {/* Quick Reference */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Common Weights Reference</Text>
        <View style={[styles.refCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { item: "Adult passenger", weight: "150-200 lbs" },
            { item: "Full propane tank (30 lb)", weight: "55 lbs" },
            { item: "Portable generator", weight: "50-150 lbs" },
            { item: "Full cooler", weight: "40-60 lbs" },
            { item: "Camping chairs (2)", weight: "15-25 lbs" },
            { item: "Outdoor grill", weight: "20-40 lbs" },
            { item: "Bike rack + 2 bikes", weight: "80-120 lbs" },
            { item: "Kayak", weight: "40-80 lbs" },
            { item: "Leveling blocks set", weight: "15-30 lbs" },
            { item: "Tool kit", weight: "20-40 lbs" },
          ].map((ref, i) => (
            <View key={i} style={[styles.refRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
              <Text style={[styles.refItem, { color: colors.foreground }]}>{ref.item}</Text>
              <Text style={[styles.refWeight, { color: colors.muted }]}>{ref.weight}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  gaugeCard: { borderRadius: 16, padding: 20, borderWidth: 0.5, alignItems: "center", marginBottom: 20 },
  gaugeLabel: { fontSize: 13, marginBottom: 4 },
  gaugeValue: { fontSize: 36, fontWeight: "800" },
  progressBar: { width: "100%", height: 8, borderRadius: 4, marginTop: 12 },
  progressFill: { height: 8, borderRadius: 4 },
  gaugeRemaining: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 4 },
  sectionHint: { fontSize: 12, marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 4 },
  cargoTotal: { fontSize: 16, fontWeight: "700" },
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specInput: { width: "48%", borderRadius: 12, padding: 12, borderWidth: 0.5 },
  specLabel: { fontSize: 11, marginBottom: 4 },
  specValue: { fontSize: 18, fontWeight: "700" },
  waterCard: { borderRadius: 12, padding: 16, borderWidth: 0.5 },
  waterRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  waterDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  waterLabel: { flex: 1, fontSize: 13 },
  waterInput: { width: 60, borderWidth: 0.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, textAlign: "center", fontSize: 14, fontWeight: "600" },
  waterWeight: { width: 70, textAlign: "right", fontSize: 13 },
  waterTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, marginTop: 6, borderTopWidth: 0.5 },
  waterTotalLabel: { fontSize: 14, fontWeight: "600" },
  waterTotalValue: { fontSize: 14, fontWeight: "700" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, gap: 6, marginTop: 8 },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  addForm: { borderRadius: 12, padding: 16, borderWidth: 0.5, marginTop: 12 },
  input: { borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 10 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 0.5, marginRight: 6 },
  formBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 0.5, alignItems: "center" },
  saveBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  catTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  cargoItem: { flexDirection: "row", alignItems: "center", borderRadius: 10, padding: 12, borderWidth: 0.5, marginBottom: 6 },
  cargoName: { fontSize: 14, fontWeight: "500" },
  cargoWeight: { fontSize: 14, fontWeight: "700", marginRight: 8 },
  removeBtn: { padding: 4 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "500" },
  emptyHint: { fontSize: 12 },
  refCard: { borderRadius: 12, padding: 12, borderWidth: 0.5, marginBottom: 20 },
  refRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  refItem: { fontSize: 13 },
  refWeight: { fontSize: 13 },
});
