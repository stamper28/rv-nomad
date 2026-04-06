/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  TRACK_CHAIR_STATES,
  TRACK_CHAIR_LOCATIONS,
  TRACK_CHAIR_SUMMARY,
  type TrackChairLocation,
  type TrackChairState,
} from "@/lib/track-chair-data";
import { openUrl } from "@/lib/open-url";

type ViewMode = "states" | "locations";

export default function TrackChairFinderScreen() {
  const colors = useColors();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("states");
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  const filteredStates = useMemo(() => {
    if (!search.trim()) return TRACK_CHAIR_STATES;
    const q = search.toLowerCase();
    return TRACK_CHAIR_STATES.filter(
      (s) =>
        s.stateName.toLowerCase().includes(q) ||
        s.stateCode.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredLocations = useMemo(() => {
    let locs = TRACK_CHAIR_LOCATIONS;
    if (selectedState) {
      locs = locs.filter((l) => l.stateCode === selectedState);
    }
    if (!search.trim()) return locs;
    const q = search.toLowerCase();
    return locs.filter(
      (l) =>
        l.parkName.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.terrainTypes.some((t) => t.includes(q))
    );
  }, [search, selectedState]);

  const handleCall = useCallback((phone: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    openUrl(`tel:${phone}`);
  }, []);

  const handleMap = useCallback((url: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    openUrl(url);
  }, []);

  const handleReserve = useCallback((url: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    openUrl(url);
  }, []);

  const handleStateSelect = useCallback((stateCode: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedState(stateCode);
    setViewMode("locations");
    setSearch("");
  }, []);

  const renderStateCard = useCallback(
    ({ item }: { item: TrackChairState }) => (
      <TouchableOpacity
        style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => handleStateSelect(item.stateCode)}
      >
        <View style={styles.stateHeader}>
          <View style={[styles.stateCodeBadge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.stateCodeText, { color: colors.primary }]}>{item.stateCode}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stateName, { color: colors.foreground }]}>{item.stateName}</Text>
            <Text style={[styles.stateStats, { color: colors.muted }]}>
              {item.totalLocations} parks  ·  {item.totalChairs} chairs
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
        </View>
        <Text style={[styles.stateHighlights, { color: colors.muted }]} numberOfLines={2}>
          {item.highlights}
        </Text>
        {item.programName && (
          <View style={[styles.programBadge, { backgroundColor: "#22C55E20" }]}>
            <MaterialIcons name="verified" size={14} color="#22C55E" />
            <Text style={[styles.programText, { color: "#22C55E" }]}>{item.programName}</Text>
          </View>
        )}
      </TouchableOpacity>
    ),
    [colors, handleStateSelect]
  );

  const renderLocationCard = useCallback(
    ({ item }: { item: TrackChairLocation }) => {
      const isExpanded = expandedLocation === item.id;
      return (
        <TouchableOpacity
          style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setExpandedLocation(isExpanded ? null : item.id);
          }}
        >
          <View style={styles.locationHeader}>
            <View style={[styles.wheelchairIcon, { backgroundColor: "#3B82F620" }]}>
              <MaterialIcons name="accessible" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.parkName, { color: colors.foreground }]}>{item.parkName}</Text>
              <Text style={[styles.parkState, { color: colors.muted }]}>
                {item.state} {item.region ? `· ${item.region}` : ""}
              </Text>
            </View>
            <View style={[styles.freeBadge, { backgroundColor: "#22C55E20" }]}>
              <Text style={[styles.freeText, { color: "#22C55E" }]}>{item.cost}</Text>
            </View>
          </View>

          {/* Quick info row */}
          <View style={styles.quickInfo}>
            <View style={styles.infoChip}>
              <MaterialIcons name="event-seat" size={14} color={colors.muted} />
              <Text style={[styles.infoChipText, { color: colors.muted }]}>
                {item.chairCount} chair{item.chairCount > 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.infoChip}>
              <MaterialIcons name="schedule" size={14} color={colors.muted} />
              <Text style={[styles.infoChipText, { color: colors.muted }]}>{item.maxDuration}</Text>
            </View>
            {item.terrainTypes.map((t) => (
              <View key={t} style={[styles.terrainChip, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.terrainChipText, { color: colors.primary }]}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Expanded details */}
          {isExpanded && (
            <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Chair Type</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.chairType}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Reservation</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.reservationMethod}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Advance Notice</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.advanceNotice}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Availability</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.availability}</Text>
              </View>
              {item.accessibleTrails && item.accessibleTrails.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Accessible Trails</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]}>
                    {item.accessibleTrails.join(", ")}
                  </Text>
                </View>
              )}
              {item.notes && (
                <Text style={[styles.noteText, { color: colors.muted }]}>{item.notes}</Text>
              )}

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleCall(item.phone)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="phone" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Call to Reserve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#22C55E" }]}
                  onPress={() => handleMap(item.mapUrl)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="map" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Directions</Text>
                </TouchableOpacity>
                {item.reservationUrl && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#8B5CF6" }]}
                    onPress={() => handleReserve(item.reservationUrl!)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="open-in-new" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Reserve Online</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [colors, expandedLocation, handleCall, handleMap, handleReserve]
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Track Chair Finder</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            All-terrain wheelchairs for hiking
          </Text>
        </View>
        <MaterialIcons name="accessible" size={28} color={colors.primary} />
      </View>

      {/* Summary banner */}
      <View style={[styles.summaryBanner, { backgroundColor: "#3B82F610" }]}>
        <MaterialIcons name="info-outline" size={18} color="#3B82F6" />
        <Text style={[styles.summaryText, { color: "#3B82F6" }]}>
          {TRACK_CHAIR_SUMMARY.totalStates} states · {TRACK_CHAIR_SUMMARY.totalLocations}+ parks · All FREE to use
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder={viewMode === "states" ? "Search states..." : "Search parks..."}
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="done"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <MaterialIcons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* View mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === "states" && { backgroundColor: colors.primary },
            viewMode !== "states" && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={() => {
            setViewMode("states");
            setSelectedState(null);
            setSearch("");
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="map"
            size={16}
            color={viewMode === "states" ? "#fff" : colors.muted}
          />
          <Text
            style={[
              styles.toggleText,
              { color: viewMode === "states" ? "#fff" : colors.muted },
            ]}
          >
            By State
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === "locations" && { backgroundColor: colors.primary },
            viewMode !== "locations" && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={() => {
            setViewMode("locations");
            setSelectedState(null);
            setSearch("");
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="place"
            size={16}
            color={viewMode === "locations" ? "#fff" : colors.muted}
          />
          <Text
            style={[
              styles.toggleText,
              { color: viewMode === "locations" ? "#fff" : colors.muted },
            ]}
          >
            All Parks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected state filter */}
      {selectedState && viewMode === "locations" && (
        <View style={styles.filterRow}>
          <View style={[styles.filterChip, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.filterChipText, { color: colors.primary }]}>
              {TRACK_CHAIR_STATES.find((s) => s.stateCode === selectedState)?.stateName}
            </Text>
            <TouchableOpacity onPress={() => setSelectedState(null)}>
              <MaterialIcons name="close" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.resultCount, { color: colors.muted }]}>
            {filteredLocations.length} park{filteredLocations.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Content */}
      {viewMode === "states" ? (
        <FlatList
          data={filteredStates}
          keyExtractor={(item) => item.stateCode}
          renderItem={renderStateCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.keyFactsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.keyFactsTitle, { color: colors.foreground }]}>
                What Are Track Chairs?
              </Text>
              <Text style={[styles.keyFactsDesc, { color: colors.muted }]}>
                Battery-powered all-terrain wheelchairs that handle trails, sand, mud, snow, and water up to 8 inches deep. They let people with mobility challenges explore nature trails, beaches, and campgrounds that regular wheelchairs can't reach.
              </Text>
              {TRACK_CHAIR_SUMMARY.keyFacts.map((fact, i) => (
                <View key={i} style={styles.factRow}>
                  <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                  <Text style={[styles.factText, { color: colors.foreground }]}>{fact}</Text>
                </View>
              ))}
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item.id}
          renderItem={renderLocationCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No parks found matching your search
              </Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 2 },
  summaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  summaryText: { fontSize: 13, fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  toggleRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  toggleText: { fontSize: 14, fontWeight: "600" },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  filterChipText: { fontSize: 13, fontWeight: "600" },
  resultCount: { fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 100 },
  // State cards
  stateCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  stateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stateCodeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stateCodeText: { fontSize: 16, fontWeight: "800" },
  stateName: { fontSize: 17, fontWeight: "700" },
  stateStats: { fontSize: 13, marginTop: 2 },
  stateHighlights: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  programBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  programText: { fontSize: 12, fontWeight: "600" },
  // Location cards
  locationCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wheelchairIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  parkName: { fontSize: 15, fontWeight: "700" },
  parkState: { fontSize: 13, marginTop: 2 },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeText: { fontSize: 12, fontWeight: "700" },
  quickInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoChipText: { fontSize: 12 },
  terrainChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  terrainChipText: { fontSize: 11, fontWeight: "600" },
  // Expanded section
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: { fontSize: 13, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: "600", flex: 1.5, textAlign: "right" },
  noteText: { fontSize: 12, fontStyle: "italic", marginTop: 4, marginBottom: 8 },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  // Key facts card
  keyFactsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  keyFactsTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  keyFactsDesc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  factRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  factText: { fontSize: 13, flex: 1, lineHeight: 18 },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 15, textAlign: "center" },
});
