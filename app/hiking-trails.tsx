/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useMemo, useState } from "react";
import {
  ScrollView, Text, View, TouchableOpacity, TextInput, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  HIKING_TRAILS, DIFFICULTY_COLORS, DIFFICULTY_LABELS,
  type HikingTrail, type TrailDifficulty,
} from "@/lib/hiking-trails";

type DifficultyFilter = "all" | TrailDifficulty;

export default function HikingTrailsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>("all");
  const [dogOnly, setDogOnly] = useState(false);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);

  const filtered = useMemo(() => {
    let results = [...HIKING_TRAILS];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.siteName.toLowerCase().includes(q) ||
          t.state.toLowerCase().includes(q) ||
          t.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    if (diffFilter !== "all") {
      results = results.filter((t) => t.difficulty === diffFilter);
    }
    if (dogOnly) results = results.filter((t) => t.dogFriendly);
    if (wheelchairOnly) results = results.filter((t) => t.wheelchairAccessible);
    return results;
  }, [search, diffFilter, dogOnly, wheelchairOnly]);

  // Stats
  const stats = useMemo(() => ({
    total: HIKING_TRAILS.length,
    easy: HIKING_TRAILS.filter((t) => t.difficulty === "easy").length,
    moderate: HIKING_TRAILS.filter((t) => t.difficulty === "moderate").length,
    hard: HIKING_TRAILS.filter((t) => t.difficulty === "hard").length,
    expert: HIKING_TRAILS.filter((t) => t.difficulty === "expert").length,
  }), []);

  const diffFilters: { key: DifficultyFilter; label: string; color: string }[] = [
    { key: "all", label: `All (${stats.total})`, color: colors.primary },
    { key: "easy", label: `Easy (${stats.easy})`, color: DIFFICULTY_COLORS.easy },
    { key: "moderate", label: `Moderate (${stats.moderate})`, color: DIFFICULTY_COLORS.moderate },
    { key: "hard", label: `Hard (${stats.hard})`, color: DIFFICULTY_COLORS.hard },
    { key: "expert", label: `Expert (${stats.expert})`, color: DIFFICULTY_COLORS.expert },
  ];

  const renderTrailCard = (trail: HikingTrail) => {
    const diffColor = DIFFICULTY_COLORS[trail.difficulty];
    return (
      <View key={trail.id} style={[styles.trailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.trailHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.trailName, { color: colors.foreground }]}>{trail.name}</Text>
            <TouchableOpacity onPress={() => router.push(`/site-detail?id=${trail.siteId}` as any)} activeOpacity={0.7}>
              <Text style={[styles.trailSite, { color: colors.primary }]}>
                <MaterialIcons name="place" size={12} color={colors.primary} /> {trail.siteName}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + "15", borderColor: diffColor + "40" }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{DIFFICULTY_LABELS[trail.difficulty]}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialIcons name="straighten" size={16} color={colors.muted} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{trail.distanceMiles} mi</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{trail.trailType === "loop" ? "Loop" : trail.trailType === "out_and_back" ? "Out & Back" : "Point to Point"}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={16} color={colors.muted} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{trail.elevationGainFt.toLocaleString()} ft</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Elevation</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={16} color={colors.muted} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{trail.estimatedHours}h</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Est. Time</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={16} color="#F9A825" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{trail.scenicRating}/5</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Scenic</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.trailDesc, { color: colors.muted }]}>{trail.description}</Text>

        {/* Highlights */}
        <View style={styles.highlightsRow}>
          {trail.highlights.map((h, i) => (
            <View key={i} style={[styles.highlightChip, { backgroundColor: colors.primary + "10" }]}>
              <Text style={[styles.highlightText, { color: colors.primary }]}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {trail.dogFriendly && (
            <View style={[styles.tagChip, { backgroundColor: "#8D6E6315" }]}>
              <MaterialIcons name="pets" size={12} color="#8D6E63" />
              <Text style={[styles.tagText, { color: "#8D6E63" }]}>Dog Friendly</Text>
            </View>
          )}
          {trail.wheelchairAccessible && (
            <View style={[styles.tagChip, { backgroundColor: "#1565C015" }]}>
              <MaterialIcons name="accessible" size={12} color="#1565C0" />
              <Text style={[styles.tagText, { color: "#1565C0" }]}>Wheelchair OK</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Hiking Trails</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: "#1B5E20" }]}>
          <MaterialIcons name="terrain" size={36} color="#A5D6A7" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Best Trails Near Campgrounds</Text>
            <Text style={styles.heroSubtitle}>{HIKING_TRAILS.length} trails across {new Set(HIKING_TRAILS.map(t => t.state)).size} states & provinces</Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search trails, parks, or highlights..."
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

        {/* Difficulty Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.diffFilters}>
          {diffFilters.map((df) => (
            <TouchableOpacity
              key={df.key}
              onPress={() => setDiffFilter(df.key)}
              style={[
                styles.diffChip,
                {
                  backgroundColor: diffFilter === df.key ? df.color + "15" : colors.surface,
                  borderColor: diffFilter === df.key ? df.color : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.diffChipText, { color: diffFilter === df.key ? df.color : colors.foreground }]}>
                {df.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Extra Filters */}
        <View style={styles.extraFilters}>
          <TouchableOpacity
            onPress={() => setDogOnly(!dogOnly)}
            style={[styles.filterChip, { backgroundColor: dogOnly ? "#8D6E6315" : colors.surface, borderColor: dogOnly ? "#8D6E63" : colors.border }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="pets" size={14} color={dogOnly ? "#8D6E63" : colors.muted} />
            <Text style={[styles.filterChipText, { color: dogOnly ? "#8D6E63" : colors.foreground }]}>Dog Friendly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWheelchairOnly(!wheelchairOnly)}
            style={[styles.filterChip, { backgroundColor: wheelchairOnly ? "#1565C015" : colors.surface, borderColor: wheelchairOnly ? "#1565C0" : colors.border }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="accessible" size={14} color={wheelchairOnly ? "#1565C0" : colors.muted} />
            <Text style={[styles.filterChipText, { color: wheelchairOnly ? "#1565C0" : colors.foreground }]}>Wheelchair Accessible</Text>
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <Text style={[styles.resultsCount, { color: colors.muted }]}>
          {filtered.length} trail{filtered.length !== 1 ? "s" : ""} found
        </Text>

        {/* Trail Cards */}
        {filtered.map(renderTrailCard)}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="terrain" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Trails Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Try adjusting your search or filters</Text>
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
  heroBanner: { marginHorizontal: 16, padding: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  heroTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  heroSubtitle: { fontSize: 12, color: "#A5D6A7", marginTop: 2 },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  diffFilters: { paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  diffChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1 },
  diffChipText: { fontSize: 12, fontWeight: "600" },
  extraFilters: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: "500" },
  resultsCount: { paddingHorizontal: 16, fontSize: 12, marginBottom: 8 },
  trailCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 10 },
  trailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  trailName: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  trailSite: { fontSize: 12, marginTop: 4 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  diffText: { fontSize: 11, fontWeight: "700" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  statLabel: { fontSize: 10, marginTop: 1 },
  statDivider: { width: 1, height: 30 },
  trailDesc: { fontSize: 13, lineHeight: 18 },
  highlightsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  highlightChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  highlightText: { fontSize: 11, fontWeight: "500" },
  tagsRow: { flexDirection: "row", gap: 8 },
  tagChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 10, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySubtitle: { fontSize: 13 },
});
