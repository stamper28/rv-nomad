import { useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  calculateTripCost,
  RV_MPG_PRESETS,
  DEFAULT_FUEL_PRICES,
  FOOD_BUDGET_PRESETS,
  type TripCostBreakdown,
} from "@/lib/trip-cost-calculator";

export default function TripCostCalculatorScreen() {
  const colors = useColors();
  const router = useRouter();

  const [distance, setDistance] = useState("500");
  const [selectedRV, setSelectedRV] = useState(0);
  const [customMpg, setCustomMpg] = useState("");
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_FUEL_PRICES.regular.toString());
  const [nights, setNights] = useState("5");
  const [campingCost, setCampingCost] = useState("35");
  const [travelers, setTravelers] = useState("2");
  const [selectedFood, setSelectedFood] = useState(1);
  const [includeExtras, setIncludeExtras] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const mpg = customMpg ? parseFloat(customMpg) : RV_MPG_PRESETS[selectedRV].mpg;

  const result: TripCostBreakdown | null = useMemo(() => {
    const d = parseFloat(distance) || 0;
    const n = parseInt(nights) || 0;
    const t = parseInt(travelers) || 1;
    const f = parseFloat(fuelPrice) || DEFAULT_FUEL_PRICES.regular;
    const c = parseFloat(campingCost) || 0;
    const foodBudget = FOOD_BUDGET_PRESETS[selectedFood].amount;
    if (d <= 0 || n <= 0) return null;
    return calculateTripCost({
      distanceMiles: d,
      mpg: mpg || 10,
      fuelPricePerGallon: f,
      nights: n,
      avgCampingCostPerNight: c,
      travelers: t,
      foodBudgetPerPersonPerDay: foodBudget,
      includeExtras,
    });
  }, [distance, mpg, fuelPrice, nights, campingCost, travelers, selectedFood, includeExtras]);

  const handleCalculate = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowResults(true);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Trip Cost Calculator</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          {/* Distance */}
          <View style={[styles.inputGroup, { borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Total Distance (miles)</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
            />
          </View>

          {/* RV Type */}
          <View style={[styles.inputGroup, { borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>RV Type (MPG)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={styles.chipRow}>
                {RV_MPG_PRESETS.map((preset, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selectedRV === i && !customMpg ? colors.primary : colors.surface,
                        borderColor: selectedRV === i && !customMpg ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedRV(i);
                      setCustomMpg("");
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selectedRV === i && !customMpg ? "#fff" : colors.foreground },
                      ]}
                    >
                      {preset.label} ({preset.mpg} mpg)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Custom MPG:</Text>
              <TextInput
                style={[styles.smallInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={customMpg}
                onChangeText={setCustomMpg}
                keyboardType="numeric"
                placeholder={RV_MPG_PRESETS[selectedRV].mpg.toString()}
                placeholderTextColor={colors.muted}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Fuel Price */}
          <View style={[styles.inputGroup, { borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Fuel Price ($/gallon)</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[styles.fuelChip, { backgroundColor: fuelPrice === DEFAULT_FUEL_PRICES.regular.toString() ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setFuelPrice(DEFAULT_FUEL_PRICES.regular.toString())}
              >
                <Text style={{ color: fuelPrice === DEFAULT_FUEL_PRICES.regular.toString() ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>
                  Regular ${DEFAULT_FUEL_PRICES.regular}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fuelChip, { backgroundColor: fuelPrice === DEFAULT_FUEL_PRICES.diesel.toString() ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setFuelPrice(DEFAULT_FUEL_PRICES.diesel.toString())}
              >
                <Text style={{ color: fuelPrice === DEFAULT_FUEL_PRICES.diesel.toString() ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>
                  Diesel ${DEFAULT_FUEL_PRICES.diesel}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.smallInput, { flex: 1, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={fuelPrice}
                onChangeText={setFuelPrice}
                keyboardType="numeric"
                placeholder="3.49"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Nights & Camping Cost */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={[styles.inputGroup, { borderColor: colors.border, flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Nights</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={nights}
                onChangeText={setNights}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
              />
            </View>
            <View style={[styles.inputGroup, { borderColor: colors.border, flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>$/Night (avg)</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={campingCost}
                onChangeText={setCampingCost}
                keyboardType="numeric"
                placeholder="35"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Travelers */}
          <View style={[styles.inputGroup, { borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Travelers</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  const n = Math.max(1, parseInt(travelers) - 1);
                  setTravelers(n.toString());
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <IconSymbol name="minus" size={18} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: colors.foreground }]}>{travelers}</Text>
              <TouchableOpacity
                onPress={() => {
                  const n = parseInt(travelers) + 1;
                  setTravelers(n.toString());
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <IconSymbol name="plus" size={18} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Food Budget */}
          <View style={[styles.inputGroup, { borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Food Budget</Text>
            {FOOD_BUDGET_PRESETS.map((preset, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.foodOption,
                  {
                    backgroundColor: selectedFood === i ? colors.primary + "12" : colors.surface,
                    borderColor: selectedFood === i ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedFood(i);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.foodLabel, { color: colors.foreground }]}>{preset.label}</Text>
                </View>
                <Text style={[styles.foodAmount, { color: selectedFood === i ? colors.primary : colors.muted }]}>
                  ${preset.amount}/person/day
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Include Extras Toggle */}
          <TouchableOpacity
            style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              setIncludeExtras(!includeExtras);
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Include Extras</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Propane, laundry, entertainment, maintenance, tolls</Text>
            </View>
            <MaterialIcons
              name={includeExtras ? "check-box" : "check-box-outline-blank"}
              size={24}
              color={includeExtras ? colors.primary : colors.muted}
            />
          </TouchableOpacity>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.calcBtn, { backgroundColor: colors.primary }]}
            onPress={handleCalculate}
            activeOpacity={0.8}
          >
            <MaterialIcons name="calculate" size={20} color="#fff" />
            <Text style={styles.calcBtnText}>Calculate Trip Cost</Text>
          </TouchableOpacity>

          {/* Results */}
          {showResults && result && (
            <View style={[styles.resultsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.resultsTitle, { color: colors.foreground }]}>Estimated Trip Cost</Text>

              {/* Total */}
              <View style={[styles.totalRow, { borderColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>${result.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>

              {/* Per day / per mile */}
              <View style={styles.perRow}>
                <View style={[styles.perBox, { backgroundColor: colors.background }]}>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Per Day</Text>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>${result.perDay.toFixed(2)}</Text>
                </View>
                <View style={[styles.perBox, { backgroundColor: colors.background }]}>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Per Mile</Text>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>${result.perMile.toFixed(2)}</Text>
                </View>
              </View>

              {/* Breakdown */}
              <Text style={[styles.breakdownTitle, { color: colors.foreground }]}>Breakdown</Text>
              {[
                { label: "Fuel", value: result.fuel, icon: "local-gas-station" as const, color: "#EF4444" },
                { label: "Camping", value: result.camping, icon: "holiday-village" as const, color: "#22C55E" },
                { label: "Food", value: result.food, icon: "restaurant" as const, color: "#F59E0B" },
                ...(includeExtras
                  ? [
                      { label: "Propane", value: result.propane, icon: "whatshot" as const, color: "#EA580C" },
                      { label: "Laundry", value: result.laundry, icon: "local-laundry-service" as const, color: "#8B5CF6" },
                      { label: "Entertainment", value: result.entertainment, icon: "attractions" as const, color: "#06B6D4" },
                      { label: "Maintenance Reserve", value: result.maintenance, icon: "build" as const, color: "#64748B" },
                      { label: "Tolls", value: result.tolls, icon: "toll" as const, color: "#78716C" },
                    ]
                  : []),
              ].map((item, i) => (
                <View key={i} style={[styles.breakdownRow, { borderColor: colors.border }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialIcons name={item.icon} size={16} color={item.color} />
                    <Text style={{ color: colors.foreground, fontSize: 14 }}>{item.label}</Text>
                  </View>
                  <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                    ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}

              {/* Tip */}
              <View style={[styles.tipBox, { backgroundColor: colors.primary + "08" }]}>
                <MaterialIcons name="lightbulb" size={16} color={colors.primary} />
                <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }}>
                  Save money by boondocking on BLM/National Forest land (free), cooking meals in your RV, and using discount programs like Passport America (50% off).
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { padding: 16, gap: 16 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 15, fontWeight: "700" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  smallInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, width: 80 },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "600" },
  fuelChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  stepperBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  stepperValue: { fontSize: 22, fontWeight: "700", minWidth: 30, textAlign: "center" },
  foodOption: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, marginBottom: 4 },
  foodLabel: { fontSize: 14, fontWeight: "600" },
  foodAmount: { fontSize: 13, fontWeight: "700" },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  toggleLabel: { fontSize: 14, fontWeight: "700" },
  calcBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 12 },
  calcBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  resultsTitle: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  totalRow: { alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  totalLabel: { fontSize: 14, fontWeight: "600" },
  totalValue: { fontSize: 32, fontWeight: "800" },
  perRow: { flexDirection: "row", gap: 10 },
  perBox: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  breakdownTitle: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 0.5 },
  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, marginTop: 4 },
});
