/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Platform } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type FuelType = "diesel" | "gas";

const AVG_PRICES: Record<FuelType, Record<string, number>> = {
  diesel: { national: 3.89, west: 4.29, midwest: 3.59, south: 3.49, northeast: 4.09 },
  gas: { national: 3.29, west: 3.89, midwest: 3.09, south: 2.99, northeast: 3.49 },
};

const RV_PRESETS = [
  { label: "Class A (Gas)", mpg: 7, fuel: "gas" as FuelType },
  { label: "Class A (Diesel)", mpg: 9, fuel: "diesel" as FuelType },
  { label: "Class B Van", mpg: 18, fuel: "gas" as FuelType },
  { label: "Class C", mpg: 10, fuel: "gas" as FuelType },
  { label: "Travel Trailer", mpg: 12, fuel: "gas" as FuelType },
  { label: "5th Wheel", mpg: 10, fuel: "diesel" as FuelType },
  { label: "Truck Camper", mpg: 14, fuel: "gas" as FuelType },
  { label: "Pop-Up Camper", mpg: 16, fuel: "gas" as FuelType },
];

export default function FuelCalculatorScreen() {
  const colors = useColors();
  const router = useRouter();
  const [distance, setDistance] = useState("");
  const [mpg, setMpg] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("diesel");
  const [region, setRegion] = useState("national");
  const [calculated, setCalculated] = useState(false);

  const dist = parseFloat(distance) || 0;
  const mpgVal = parseFloat(mpg) || 0;
  const price = parseFloat(fuelPrice) || AVG_PRICES[fuelType][region];
  const gallons = mpgVal > 0 ? dist / mpgVal : 0;
  const totalCost = gallons * price;
  const costPerMile = mpgVal > 0 ? price / mpgVal : 0;

  const handleCalculate = () => {
    if (dist <= 0 || mpgVal <= 0) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCalculated(true);
  };

  const applyPreset = (preset: typeof RV_PRESETS[0]) => {
    setMpg(String(preset.mpg));
    setFuelType(preset.fuel);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const regions = [
    { key: "national", label: "National Avg" },
    { key: "west", label: "West" },
    { key: "midwest", label: "Midwest" },
    { key: "south", label: "South" },
    { key: "northeast", label: "Northeast" },
  ];

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Fuel Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}>
        {/* RV Presets */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Select Your RV Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {RV_PRESETS.map((p) => (
            <TouchableOpacity key={p.label} onPress={() => applyPreset(p)}
              style={[styles.presetChip, { backgroundColor: mpg === String(p.mpg) && fuelType === p.fuel ? colors.primary : colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: mpg === String(p.mpg) && fuelType === p.fuel ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>{p.label}</Text>
              <Text style={{ color: mpg === String(p.mpg) && fuelType === p.fuel ? "#ffffffaa" : colors.muted, fontSize: 11 }}>{p.mpg} MPG</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Distance */}
        <Text style={[styles.formLabel, { color: colors.foreground }]}>Trip Distance (miles)</Text>
        <TextInput value={distance} onChangeText={(v) => { setDistance(v); setCalculated(false); }} placeholder="e.g., 500" keyboardType="numeric"
          placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />

        {/* MPG */}
        <Text style={[styles.formLabel, { color: colors.foreground }]}>Your MPG</Text>
        <TextInput value={mpg} onChangeText={(v) => { setMpg(v); setCalculated(false); }} placeholder="e.g., 9" keyboardType="numeric"
          placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />

        {/* Fuel Type */}
        <Text style={[styles.formLabel, { color: colors.foreground }]}>Fuel Type</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {(["diesel", "gas"] as FuelType[]).map((ft) => (
            <TouchableOpacity key={ft} onPress={() => { setFuelType(ft); setCalculated(false); }}
              style={[styles.fuelBtn, { backgroundColor: fuelType === ft ? colors.primary : colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name={ft === "diesel" ? "local-gas-station" : "local-gas-station"} size={18} color={fuelType === ft ? "#fff" : colors.foreground} />
              <Text style={{ color: fuelType === ft ? "#fff" : colors.foreground, fontWeight: "600" }}>{ft === "diesel" ? "Diesel" : "Gasoline"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Region */}
        <Text style={[styles.formLabel, { color: colors.foreground }]}>Region (for avg price)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {regions.map((r) => (
            <TouchableOpacity key={r.key} onPress={() => { setRegion(r.key); setFuelPrice(""); setCalculated(false); }}
              style={[styles.regionChip, { backgroundColor: region === r.key ? colors.primary : colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: region === r.key ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>{r.label}</Text>
              <Text style={{ color: region === r.key ? "#ffffffaa" : colors.muted, fontSize: 11 }}>${AVG_PRICES[fuelType][r.key].toFixed(2)}/gal</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Custom Price */}
        <Text style={[styles.formLabel, { color: colors.foreground }]}>Custom Fuel Price ($/gal) — optional</Text>
        <TextInput value={fuelPrice} onChangeText={(v) => { setFuelPrice(v); setCalculated(false); }} placeholder={`Using avg: $${AVG_PRICES[fuelType][region].toFixed(2)}`}
          keyboardType="numeric" placeholderTextColor={colors.muted}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />

        {/* Calculate Button */}
        <TouchableOpacity onPress={handleCalculate} style={[styles.calcBtn, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="calculate" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Calculate Fuel Cost</Text>
        </TouchableOpacity>

        {/* Results */}
        {calculated && dist > 0 && mpgVal > 0 && (
          <View style={[styles.resultsCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.resultsTitle, { color: colors.foreground }]}>Trip Fuel Estimate</Text>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.muted }]}>Total Cost</Text>
              <Text style={[styles.resultValue, { color: colors.primary }]}>${totalCost.toFixed(2)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.muted }]}>Gallons Needed</Text>
              <Text style={[styles.resultValueSm, { color: colors.foreground }]}>{gallons.toFixed(1)} gal</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.muted }]}>Cost Per Mile</Text>
              <Text style={[styles.resultValueSm, { color: colors.foreground }]}>${costPerMile.toFixed(2)}/mi</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.muted }]}>Fuel Stops (~25 gal tank)</Text>
              <Text style={[styles.resultValueSm, { color: colors.foreground }]}>{Math.ceil(gallons / 25)} stops</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.muted }]}>Fuel Price Used</Text>
              <Text style={[styles.resultValueSm, { color: colors.foreground }]}>${price.toFixed(2)}/gal ({fuelType})</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  formLabel: { fontSize: 14, fontWeight: "600" },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, fontSize: 15 },
  presetChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  regionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  fuelBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  calcBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 12, marginTop: 4 },
  resultsCard: { padding: 20, borderRadius: 14, borderWidth: 2 },
  resultsTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  resultLabel: { fontSize: 14 },
  resultValue: { fontSize: 32, fontWeight: "800" },
  resultValueSm: { fontSize: 16, fontWeight: "700" },
  divider: { height: 1, marginVertical: 8 },
});
