/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useMemo, useState, useCallback } from "react";
import {
  ScrollView, Text, View, TouchableOpacity, TextInput, StyleSheet, Alert, Platform, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface InsiderSpot {
  id: string;
  name: string;
  description: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  submittedBy: string;
  submittedDate: string;
  upvotes: number;
  downvotes: number;
  cellSignal: number; // 0-5
  maxRVLength: number;
  isFree: boolean;
  hasWater: boolean;
  hasFirePit: boolean;
  isLevelGround: boolean;
  scenicRating: number;
  privacyRating: number;
  quietRating: number;
  tags: string[];
  warnings: string[];
  verified: boolean;
}

// User-submitted insider spots (simulated community data)
const INSIDER_SPOTS: InsiderSpot[] = [
  { id: "ins-1", name: "Hidden Mesa Overlook", description: "Stunning mesa overlook with 360-degree views. Completely flat, room for 4-5 rigs. No one around for miles. Best sunset spot in all of Utah.", state: "UT", city: "Moab", lat: 38.57, lng: -109.55, submittedBy: "DesertNomad_Rick", submittedDate: "01-15-2026", upvotes: 247, downvotes: 3, cellSignal: 2, maxRVLength: 40, isFree: true, hasWater: false, hasFirePit: true, isLevelGround: true, scenicRating: 5, privacyRating: 5, quietRating: 5, tags: ["mesa", "sunset", "remote", "desert"], warnings: ["No water", "4WD recommended last 0.5 mi"], verified: true },
  { id: "ins-2", name: "Coconino Forest Clearing", description: "Beautiful clearing in the pines off FR 525. Flat packed gravel, great cell signal from nearby tower. Quiet and cool even in summer.", state: "AZ", city: "Flagstaff", lat: 35.10, lng: -111.72, submittedBy: "PineTreeSally", submittedDate: "02-08-2026", upvotes: 189, downvotes: 5, cellSignal: 4, maxRVLength: 45, isFree: true, hasWater: false, hasFirePit: true, isLevelGround: true, scenicRating: 4, privacyRating: 4, quietRating: 5, tags: ["forest", "cool", "pines", "summer"], warnings: ["Check fire restrictions", "Snow possible Oct-Apr"], verified: true },
  { id: "ins-3", name: "Padre Island Beach Camp", description: "Drive right onto the beach and camp for free. Amazing shelling, fishing, and dolphin watching. 4WD essential — soft sand.", state: "TX", city: "Corpus Christi", lat: 27.43, lng: -97.30, submittedBy: "BeachBumBob", submittedDate: "03-12-2026", upvotes: 312, downvotes: 12, cellSignal: 1, maxRVLength: 35, isFree: true, hasWater: false, hasFirePit: false, isLevelGround: false, scenicRating: 5, privacyRating: 3, quietRating: 4, tags: ["beach", "ocean", "fishing", "dolphins"], warnings: ["4WD REQUIRED", "Soft sand", "No services", "Watch tides"], verified: true },
  { id: "ins-4", name: "Quartzsite BLM Long-Term", description: "The famous Quartzsite winter gathering spot. Free 14-day camping on BLM land. Thousands of RVers Oct-Mar. Swap meets, potlucks, community.", state: "AZ", city: "Quartzsite", lat: 33.66, lng: -114.23, submittedBy: "SnowbirdJane", submittedDate: "11-20-2025", upvotes: 456, downvotes: 8, cellSignal: 3, maxRVLength: 50, isFree: true, hasWater: false, hasFirePit: true, isLevelGround: true, scenicRating: 3, privacyRating: 1, quietRating: 2, tags: ["winter", "community", "swap meet", "BLM"], warnings: ["Very crowded Jan-Feb", "No shade", "Dusty"], verified: true },
  { id: "ins-5", name: "Salmon River Pulloff", description: "Gorgeous pulloff right along the Salmon River. Fall asleep to the sound of the river. Room for 2-3 rigs. Fishing right from camp.", state: "ID", city: "Stanley", lat: 44.20, lng: -114.93, submittedBy: "FlyFishMike", submittedDate: "07-22-2025", upvotes: 198, downvotes: 2, cellSignal: 0, maxRVLength: 30, isFree: true, hasWater: true, hasFirePit: true, isLevelGround: true, scenicRating: 5, privacyRating: 4, quietRating: 5, tags: ["river", "fishing", "mountain", "remote"], warnings: ["No cell signal", "Gravel road", "Bears — store food properly"], verified: true },
  { id: "ins-6", name: "Alabama Hills Movie Flat", description: "Camp among the famous rock formations where hundreds of westerns were filmed. Views of Mt. Whitney. Free BLM camping.", state: "CA", city: "Lone Pine", lat: 36.60, lng: -118.11, submittedBy: "SierraSteve", submittedDate: "04-05-2026", upvotes: 267, downvotes: 4, cellSignal: 3, maxRVLength: 40, isFree: true, hasWater: false, hasFirePit: true, isLevelGround: true, scenicRating: 5, privacyRating: 4, quietRating: 5, tags: ["mountains", "rocks", "movie location", "BLM"], warnings: ["Popular on weekends", "No water", "Hot in summer"], verified: true },
  { id: "ins-7", name: "Cascade Locks Waterfront", description: "Free overnight parking at the marine park right on the Columbia River. Walk to Bridge of the Gods. Thunder Island Brewing nearby.", state: "OR", city: "Cascade Locks", lat: 45.67, lng: -121.90, submittedBy: "PNWWanderer", submittedDate: "06-15-2025", upvotes: 134, downvotes: 7, cellSignal: 4, maxRVLength: 35, isFree: true, hasWater: true, hasFirePit: false, isLevelGround: true, scenicRating: 4, privacyRating: 2, quietRating: 3, tags: ["river", "town", "brewery", "PCT"], warnings: ["Train noise", "2-night limit", "Can be busy"], verified: true },
  { id: "ins-8", name: "Alvord Desert Hot Springs", description: "Camp on the playa next to natural hot springs with views of Steens Mountain. Surreal landscape — feels like another planet.", state: "OR", city: "Fields", lat: 42.53, lng: -118.53, submittedBy: "HotSpringHopper", submittedDate: "09-01-2025", upvotes: 345, downvotes: 6, cellSignal: 0, maxRVLength: 45, isFree: true, hasWater: false, hasFirePit: false, isLevelGround: true, scenicRating: 5, privacyRating: 5, quietRating: 5, tags: ["hot springs", "desert", "remote", "playa"], warnings: ["No cell signal", "No water", "Extreme heat in summer", "Mud when wet"], verified: true },
  { id: "ins-9", name: "Sawtooth NRA Dispersed", description: "Free dispersed camping along the Salmon River in the Sawtooth National Recreation Area. Jaw-dropping mountain scenery.", state: "ID", city: "Stanley", lat: 44.18, lng: -114.88, submittedBy: "MountainGoatMary", submittedDate: "08-10-2025", upvotes: 223, downvotes: 1, cellSignal: 1, maxRVLength: 35, isFree: true, hasWater: true, hasFirePit: true, isLevelGround: true, scenicRating: 5, privacyRating: 5, quietRating: 5, tags: ["mountains", "river", "dispersed", "national forest"], warnings: ["Bears", "Snow possible Sep-Jun", "Rough roads"], verified: true },
  { id: "ins-10", name: "Slab City", description: "The famous 'Last Free Place in America.' Off-grid community in the desert. Salvation Mountain, East Jesus art installation. Unique experience.", state: "CA", city: "Niland", lat: 33.26, lng: -115.46, submittedBy: "FreedomRider", submittedDate: "12-01-2025", upvotes: 178, downvotes: 34, cellSignal: 2, maxRVLength: 50, isFree: true, hasWater: false, hasFirePit: true, isLevelGround: true, scenicRating: 3, privacyRating: 2, quietRating: 2, tags: ["art", "community", "desert", "off-grid"], warnings: ["No services", "Extreme heat summer", "Unique social environment", "Not for everyone"], verified: true },
  { id: "ins-11", name: "Gila National Forest Dispersed", description: "Remote dispersed camping near the Gila Cliff Dwellings. Hot springs nearby. Dark sky paradise — Milky Way is incredible.", state: "NM", city: "Silver City", lat: 33.23, lng: -108.21, submittedBy: "StargazerDan", submittedDate: "10-18-2025", upvotes: 201, downvotes: 3, cellSignal: 0, maxRVLength: 30, isFree: true, hasWater: false, hasFirePit: true, isLevelGround: true, scenicRating: 5, privacyRating: 5, quietRating: 5, tags: ["dark sky", "hot springs", "cliff dwellings", "remote"], warnings: ["No cell signal", "Winding mountain roads", "Bears"], verified: true },
  { id: "ins-12", name: "Assateague Island Beach", description: "Camp right on the beach with wild horses roaming through camp. National Seashore — $30/night but worth every penny.", state: "MD", city: "Berlin", lat: 38.22, lng: -75.15, submittedBy: "WildHorseLover", submittedDate: "05-30-2025", upvotes: 289, downvotes: 5, cellSignal: 2, maxRVLength: 36, isFree: false, hasWater: true, hasFirePit: true, isLevelGround: false, scenicRating: 5, privacyRating: 3, quietRating: 4, tags: ["beach", "wild horses", "ocean", "national seashore"], warnings: ["Mosquitoes can be brutal", "Sand — 4WD helpful", "Horses will investigate food"], verified: true },
];

// Submit spot form state
interface SubmitForm {
  name: string;
  description: string;
  city: string;
  state: string;
}

export default function InsiderSpotsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [sortBy, setSortBy] = useState<"upvotes" | "recent" | "scenic">("upvotes");
  const [freeOnly, setFreeOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState<SubmitForm>({ name: "", description: "", city: "", state: "" });

  const filtered = useMemo(() => {
    let results = [...INSIDER_SPOTS];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q))
      );
    }
    if (freeOnly) results = results.filter((s) => s.isFree);
    results.sort((a, b) => {
      if (sortBy === "upvotes") return b.upvotes - a.upvotes;
      if (sortBy === "scenic") return b.scenicRating - a.scenicRating;
      return 0; // recent — already in order
    });
    return results;
  }, [search, sortBy, freeOnly]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.city || !form.state) {
      Alert.alert("Missing Info", "Please fill in all fields to submit your spot.");
      return;
    }
    Alert.alert("Spot Submitted!", "Your insider spot has been submitted for review. It will appear after verification by our team. Thank you for contributing!");
    setForm({ name: "", description: "", city: "", state: "" });
    setShowSubmitForm(false);
  };

  const renderSignalBars = (signal: number) => {
    const bars = [];
    for (let i = 0; i < 5; i++) {
      bars.push(
        <View
          key={i}
          style={{
            width: 4,
            height: 6 + i * 3,
            backgroundColor: i < signal ? colors.success : colors.border,
            borderRadius: 1,
          }}
        />
      );
    }
    return <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 1 }}>{bars}</View>;
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Insider Spots</Text>
        <TouchableOpacity onPress={() => setShowSubmitForm(!showSubmitForm)}>
          <MaterialIcons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Community Spots Banner */}
        <View style={[styles.premiumBanner, { backgroundColor: "#2E7D32" }]}>
          <MaterialIcons name="explore" size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumTitle}>Community Insider Spots</Text>
            <Text style={styles.premiumSubtitle}>Secret camping spots submitted by the RV Nomad community. Share your favorite hidden gems!</Text>
          </View>
        </View>

        {/* Submit Form */}
        {showSubmitForm && (
          <View style={[styles.submitForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.submitTitle, { color: colors.foreground }]}>Submit Your Secret Spot</Text>
            <Text style={[styles.submitDesc, { color: colors.muted }]}>Share a hidden gem with the community. All submissions are verified before publishing.</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Spot Name"
              placeholderTextColor={colors.muted}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={[styles.formInput, { flex: 1, backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="City"
                placeholderTextColor={colors.muted}
                value={form.city}
                onChangeText={(t) => setForm({ ...form, city: t })}
              />
              <TextInput
                style={[styles.formInput, { width: 80, backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="State"
                placeholderTextColor={colors.muted}
                value={form.state}
                onChangeText={(t) => setForm({ ...form, state: t })}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
            <TextInput
              style={[styles.formInput, { height: 80, backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Describe this spot — what makes it special?"
              placeholderTextColor={colors.muted}
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
              multiline
              textAlignVertical="top"
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setShowSubmitForm(false)}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Text style={styles.submitBtnText}>Submit Spot</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search spots, cities, or tags..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialIcons name="close" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            onPress={() => setFreeOnly(!freeOnly)}
            style={[styles.filterChip, { backgroundColor: freeOnly ? colors.success + "15" : colors.surface, borderColor: freeOnly ? colors.success : colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, { color: freeOnly ? colors.success : colors.foreground }]}>Free Only</Text>
          </TouchableOpacity>
          {(["upvotes", "scenic", "recent"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSortBy(s)}
              style={[styles.filterChip, { backgroundColor: sortBy === s ? colors.primary + "15" : colors.surface, borderColor: sortBy === s ? colors.primary : colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, { color: sortBy === s ? colors.primary : colors.foreground }]}>
                {s === "upvotes" ? "Most Popular" : s === "scenic" ? "Most Scenic" : "Recent"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        <Text style={[styles.resultsCount, { color: colors.muted }]}>{filtered.length} insider spots</Text>

        {filtered.map((spot) => (
          <View key={spot.id} style={[styles.spotCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.spotHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.spotName, { color: colors.foreground }]}>{spot.name}</Text>
                  {spot.verified && <MaterialIcons name="verified" size={16} color={colors.primary} />}
                </View>
                <Text style={[styles.spotLocation, { color: colors.muted }]}>
                  {spot.city}, {spot.state}
                </Text>
              </View>
              {spot.isFree && (
                <View style={[styles.freeBadge, { backgroundColor: colors.success + "15" }]}>
                  <Text style={[styles.freeText, { color: colors.success }]}>FREE</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={[styles.spotDesc, { color: colors.muted }]}>{spot.description}</Text>

            {/* Ratings */}
            <View style={styles.ratingsRow}>
              <View style={styles.ratingItem}>
                <MaterialIcons name="landscape" size={14} color="#F9A825" />
                <Text style={[styles.ratingText, { color: colors.foreground }]}>{spot.scenicRating}/5 Scenic</Text>
              </View>
              <View style={styles.ratingItem}>
                <MaterialIcons name="visibility-off" size={14} color="#7B1FA2" />
                <Text style={[styles.ratingText, { color: colors.foreground }]}>{spot.privacyRating}/5 Privacy</Text>
              </View>
              <View style={styles.ratingItem}>
                <MaterialIcons name="volume-off" size={14} color="#1565C0" />
                <Text style={[styles.ratingText, { color: colors.foreground }]}>{spot.quietRating}/5 Quiet</Text>
              </View>
            </View>

            {/* Info Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="signal-cellular-alt" size={14} color={colors.muted} />
                {renderSignalBars(spot.cellSignal)}
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="straighten" size={14} color={colors.muted} />
                <Text style={[styles.infoText, { color: colors.foreground }]}>Max {spot.maxRVLength}ft</Text>
              </View>
              {spot.hasWater && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="water-drop" size={14} color="#1565C0" />
                  <Text style={[styles.infoText, { color: "#1565C0" }]}>Water</Text>
                </View>
              )}
              {spot.hasFirePit && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="local-fire-department" size={14} color="#E65100" />
                  <Text style={[styles.infoText, { color: "#E65100" }]}>Fire Pit</Text>
                </View>
              )}
              {spot.isLevelGround && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="check-circle" size={14} color={colors.success} />
                  <Text style={[styles.infoText, { color: colors.success }]}>Level</Text>
                </View>
              )}
            </View>

            {/* Warnings */}
            {spot.warnings.length > 0 && (
              <View style={[styles.warningsBox, { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" }]}>
                <MaterialIcons name="warning" size={14} color={colors.warning} />
                <Text style={[styles.warningText, { color: colors.warning }]}>{spot.warnings.join(" • ")}</Text>
              </View>
            )}

            {/* Tags */}
            <View style={styles.tagsRow}>
              {spot.tags.map((tag, i) => (
                <View key={i} style={[styles.tagChip, { backgroundColor: colors.primary + "10" }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.spotFooter}>
              <View style={styles.voteRow}>
                <TouchableOpacity style={styles.voteBtn} activeOpacity={0.7}>
                  <MaterialIcons name="thumb-up" size={16} color={colors.success} />
                  <Text style={[styles.voteCount, { color: colors.success }]}>{spot.upvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.voteBtn} activeOpacity={0.7}>
                  <MaterialIcons name="thumb-down" size={16} color={colors.error} />
                  <Text style={[styles.voteCount, { color: colors.error }]}>{spot.downvotes}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.submittedBy, { color: colors.muted }]}>by {spot.submittedBy} • {spot.submittedDate}</Text>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="explore" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Spots Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Try adjusting your search or be the first to submit one!</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  premiumBanner: { marginHorizontal: 16, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  premiumTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  premiumSubtitle: { fontSize: 11, color: "#fff", opacity: 0.9, marginTop: 2 },
  submitForm: { marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 10 },
  submitTitle: { fontSize: 16, fontWeight: "700" },
  submitDesc: { fontSize: 12 },
  formInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "600" },
  submitBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  submitBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: "500" },
  resultsCount: { paddingHorizontal: 16, fontSize: 12, marginBottom: 8 },
  spotCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 10 },
  spotHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  spotName: { fontSize: 16, fontWeight: "700" },
  spotLocation: { fontSize: 12, marginTop: 2 },
  freeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  freeText: { fontSize: 11, fontWeight: "700" },
  spotDesc: { fontSize: 13, lineHeight: 18 },
  ratingsRow: { flexDirection: "row", gap: 12 },
  ratingItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 11, fontWeight: "600" },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 11, fontWeight: "500" },
  warningsBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 8, borderRadius: 8, borderWidth: 1 },
  warningText: { fontSize: 11, flex: 1, lineHeight: 16 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: "500" },
  spotFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  voteRow: { flexDirection: "row", gap: 12 },
  voteBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  voteCount: { fontSize: 12, fontWeight: "600" },
  submittedBy: { fontSize: 10 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySubtitle: { fontSize: 13 },
});
