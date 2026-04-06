/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useCallback } from "react";
import { Text, View, TextInput, ScrollView, Pressable, ActivityIndicator, StyleSheet, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

const INTERESTS = [
  "National Parks", "Beaches", "Mountains", "Fishing",
  "Hiking", "Photography", "Wine Country", "History",
  "Wildlife", "Hot Springs", "Stargazing", "Waterfalls",
];

const RV_TYPES = ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel", "Truck Camper", "Pop-Up", "Van"];
const BUDGETS = ["Budget ($50/day)", "Moderate ($100/day)", "Comfortable ($150/day)", "Premium ($200+/day)"];

type TripStop = {
  day: number;
  location: string;
  campground: string;
  campgroundType: string;
  pricePerNight: number;
  nights: number;
  drivingMiles: number;
  drivingTime: string;
  highlights: string[];
  notes: string;
};

type TripPlan = {
  tripName: string;
  totalMiles: number;
  estimatedFuelCost: number;
  estimatedCampingCost: number;
  estimatedFoodCost: number;
  totalEstimatedCost: number;
  stops: TripStop[];
  tips: string[];
  warnings: string[];
};

export default function AITripPlannerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [duration, setDuration] = useState("7");
  const [rvType, setRvType] = useState("");
  const [rvLength, setRvLength] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [pets, setPets] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [showForm, setShowForm] = useState(true);

  const planTripMutation = trpc.ai.planTrip.useMutation();

  const toggleInterest = (interest: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handlePlanTrip = useCallback(async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert("Missing Info", "Please enter both start and end locations.");
      return;
    }
    const dur = parseInt(duration) || 7;
    if (dur < 1 || dur > 90) {
      Alert.alert("Invalid Duration", "Trip duration must be 1-90 days.");
      return;
    }

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    setShowForm(false);

    try {
      const result = await planTripMutation.mutateAsync({
        startLocation: startLocation.trim(),
        endLocation: endLocation.trim(),
        duration: dur,
        rvType: rvType || undefined,
        rvLength: rvLength || undefined,
        budget: budget || undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
        travelers: parseInt(travelers) || 2,
        pets,
      });
      setTripPlan(result as TripPlan);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to generate trip plan. Please try again.");
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  }, [startLocation, endLocation, duration, rvType, rvLength, budget, selectedInterests, travelers, pets]);

  const getCampTypeIcon = (type: string) => {
    switch (type) {
      case "rv_park": return "🏕️";
      case "state_park": return "🌲";
      case "national_park": return "🏔️";
      case "boondocking": return "⛺";
      default: return "📍";
    }
  };

  const getCampTypeLabel = (type: string) => {
    switch (type) {
      case "rv_park": return "RV Park";
      case "state_park": return "State Park";
      case "national_park": return "National Park";
      case "boondocking": return "Boondocking";
      default: return type;
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>🤖 AI Trip Planner</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Plan Your Dream RV Trip</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
              Our AI will create a personalized itinerary with campgrounds, costs, and route tips.
            </Text>

            {/* Start & End */}
            <Text style={[styles.label, { color: colors.foreground }]}>Start Location *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g., Denver, CO"
              placeholderTextColor={colors.muted}
              value={startLocation}
              onChangeText={setStartLocation}
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.foreground }]}>End Location *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g., San Diego, CA"
              placeholderTextColor={colors.muted}
              value={endLocation}
              onChangeText={setEndLocation}
              returnKeyType="next"
            />

            {/* Duration & Travelers */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.foreground }]}>Days</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="7"
                  placeholderTextColor={colors.muted}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.foreground }]}>Travelers</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="2"
                  placeholderTextColor={colors.muted}
                  value={travelers}
                  onChangeText={setTravelers}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>

            {/* RV Type */}
            <Text style={[styles.label, { color: colors.foreground }]}>RV Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {RV_TYPES.map(type => (
                <Pressable
                  key={type}
                  onPress={() => { setRvType(rvType === type ? "" : type); }}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: rvType === type ? colors.primary : colors.surface },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: rvType === type ? "#fff" : colors.foreground }]}>{type}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* RV Length */}
            <Text style={[styles.label, { color: colors.foreground }]}>RV Length</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g., 32 ft"
              placeholderTextColor={colors.muted}
              value={rvLength}
              onChangeText={setRvLength}
            />

            {/* Budget */}
            <Text style={[styles.label, { color: colors.foreground }]}>Budget</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {BUDGETS.map(b => (
                <Pressable
                  key={b}
                  onPress={() => setBudget(budget === b ? "" : b)}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: budget === b ? colors.primary : colors.surface },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: budget === b ? "#fff" : colors.foreground }]}>{b}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Interests */}
            <Text style={[styles.label, { color: colors.foreground }]}>Interests</Text>
            <View style={styles.chipWrap}>
              {INTERESTS.map(interest => (
                <Pressable
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: selectedInterests.includes(interest) ? colors.primary : colors.surface },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: selectedInterests.includes(interest) ? "#fff" : colors.foreground }]}>
                    {interest}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Pets toggle */}
            <Pressable
              onPress={() => { setPets(!pets); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={({ pressed }) => [
                styles.petToggle,
                { backgroundColor: pets ? colors.primary : colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.petToggleText, { color: pets ? "#fff" : colors.foreground }]}>
                🐾 Traveling with Pets
              </Text>
            </Pressable>

            {/* Generate Button */}
            <Pressable
              onPress={handlePlanTrip}
              style={({ pressed }) => [
                styles.generateBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.generateBtnText}>🤖 Generate My Trip Plan</Text>
            </Pressable>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.foreground }]}>Planning your perfect trip...</Text>
            <Text style={[styles.loadingSubtext, { color: colors.muted }]}>
              Our AI is finding the best campgrounds, calculating costs, and checking for route hazards.
            </Text>
          </View>
        )}

        {/* Trip Plan Results */}
        {tripPlan && !loading && (
          <View style={styles.resultsSection}>
            <Text style={[styles.tripName, { color: colors.foreground }]}>{tripPlan.tripName}</Text>

            {/* Cost Summary */}
            <View style={[styles.costCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.costTitle, { color: colors.foreground }]}>💰 Trip Cost Estimate</Text>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.muted }]}>⛽ Fuel</Text>
                <Text style={[styles.costValue, { color: colors.foreground }]}>${tripPlan.estimatedFuelCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.muted }]}>🏕️ Camping</Text>
                <Text style={[styles.costValue, { color: colors.foreground }]}>${tripPlan.estimatedCampingCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.muted }]}>🍔 Food</Text>
                <Text style={[styles.costValue, { color: colors.foreground }]}>${tripPlan.estimatedFoodCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <View style={[styles.costRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Estimated</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>${tripPlan.totalEstimatedCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <Text style={[styles.costNote, { color: colors.muted }]}>
                {tripPlan.totalMiles?.toLocaleString() ?? "—"} total miles
              </Text>
            </View>

            {/* Warnings */}
            {tripPlan.warnings && tripPlan.warnings.length > 0 && (
              <View style={[styles.warningsCard, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
                <Text style={[styles.warningsTitle, { color: "#92400E" }]}>⚠️ Route Warnings</Text>
                {tripPlan.warnings.map((w, i) => (
                  <Text key={i} style={[styles.warningText, { color: "#92400E" }]}>• {w}</Text>
                ))}
              </View>
            )}

            {/* Stops */}
            <Text style={[styles.stopsTitle, { color: colors.foreground }]}>📍 Your Itinerary</Text>
            {tripPlan.stops?.map((stop, i) => (
              <View key={i} style={[styles.stopCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.stopHeader}>
                  <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.dayBadgeText}>Day {stop.day}</Text>
                  </View>
                  <View style={styles.stopMeta}>
                    <Text style={[styles.stopDriving, { color: colors.muted }]}>
                      {stop.drivingMiles} mi • {stop.drivingTime}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stopLocation, { color: colors.foreground }]}>{stop.location}</Text>
                <View style={styles.campRow}>
                  <Text style={styles.campIcon}>{getCampTypeIcon(stop.campgroundType)}</Text>
                  <View style={styles.campInfo}>
                    <Text style={[styles.campName, { color: colors.foreground }]}>{stop.campground}</Text>
                    <Text style={[styles.campType, { color: colors.muted }]}>
                      {getCampTypeLabel(stop.campgroundType)} • Est. ${stop.pricePerNight}/night • {stop.nights} night{stop.nights !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                {stop.highlights && stop.highlights.length > 0 && (
                  <View style={styles.highlightsSection}>
                    <Text style={[styles.highlightsLabel, { color: colors.foreground }]}>Things to do:</Text>
                    {stop.highlights.map((h, j) => (
                      <Text key={j} style={[styles.highlightItem, { color: colors.muted }]}>✦ {h}</Text>
                    ))}
                  </View>
                )}
                {stop.notes && (
                  <Text style={[styles.stopNotes, { color: colors.muted }]}>💡 {stop.notes}</Text>
                )}
              </View>
            ))}

            {/* Tips */}
            {tripPlan.tips && tripPlan.tips.length > 0 && (
              <View style={[styles.tipsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.tipsTitle, { color: colors.foreground }]}>💡 Pro Tips</Text>
                {tripPlan.tips.map((tip, i) => (
                  <Text key={i} style={[styles.tipText, { color: colors.muted }]}>• {tip}</Text>
                ))}
              </View>
            )}

            {/* New Plan Button */}
            <Pressable
              onPress={() => { setTripPlan(null); setShowForm(true); }}
              style={({ pressed }) => [
                styles.newPlanBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.newPlanBtnText}>🔄 Plan Another Trip</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 70 },
  backText: { fontSize: 16, fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  formSection: { gap: 4 },
  sectionTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  chipScroll: { marginBottom: 4 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 4 },
  chipText: { fontSize: 13, fontWeight: "500" },
  petToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  petToggleText: { fontSize: 16, fontWeight: "600" },
  generateBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 20 },
  generateBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 16 },
  loadingText: { fontSize: 20, fontWeight: "700" },
  loadingSubtext: { fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  resultsSection: { gap: 16 },
  tripName: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  costCard: { borderRadius: 16, padding: 20, borderWidth: 1, gap: 10 },
  costTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costLabel: { fontSize: 15 },
  costValue: { fontSize: 15, fontWeight: "600" },
  totalRow: { borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 17, fontWeight: "700" },
  totalValue: { fontSize: 22, fontWeight: "800" },
  costNote: { fontSize: 13, textAlign: "center", marginTop: 4 },
  warningsCard: { borderRadius: 12, padding: 16, borderWidth: 1, gap: 6 },
  warningsTitle: { fontSize: 16, fontWeight: "700" },
  warningText: { fontSize: 14, lineHeight: 20 },
  stopsTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  stopCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  stopHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  dayBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stopMeta: {},
  stopDriving: { fontSize: 13 },
  stopLocation: { fontSize: 18, fontWeight: "700" },
  campRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  campIcon: { fontSize: 24, marginTop: 2 },
  campInfo: { flex: 1 },
  campName: { fontSize: 15, fontWeight: "600" },
  campType: { fontSize: 13, marginTop: 2 },
  highlightsSection: { gap: 4 },
  highlightsLabel: { fontSize: 14, fontWeight: "600" },
  highlightItem: { fontSize: 13, lineHeight: 18, paddingLeft: 4 },
  stopNotes: { fontSize: 13, fontStyle: "italic", lineHeight: 18 },
  tipsCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  tipsTitle: { fontSize: 18, fontWeight: "700" },
  tipText: { fontSize: 14, lineHeight: 20 },
  newPlanBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 8 },
  newPlanBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
