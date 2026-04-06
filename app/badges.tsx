/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  ALL_BADGES, CATEGORY_INFO, getEarnedBadges, getPassportStats, getVisitedSites,
  checkAndAwardBadges, type Badge, type BadgeCategory, type EarnedBadge, type PassportStats, type VisitedSite,
} from "@/lib/badges-store";

type Tab = "badges" | "passport" | "stats";

export default function BadgesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("badges");
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [stats, setStats] = useState<PassportStats | null>(null);
  const [visited, setVisited] = useState<VisitedSite[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | "all">("all");

  const load = useCallback(async () => {
    const [e, s, v] = await Promise.all([getEarnedBadges(), getPassportStats(), getVisitedSites()]);
    setEarned(e); setStats(s); setVisited(v);
    await checkAndAwardBadges();
    const e2 = await getEarnedBadges(); setEarned(e2);
  }, []);
  useEffect(() => { load(); }, [load]);

  const earnedIds = new Set(earned.map((e) => e.badgeId));
  const filteredBadges = selectedCategory === "all" ? ALL_BADGES : ALL_BADGES.filter((b) => b.category === selectedCategory);
  const earnedCount = earned.length;
  const totalCount = ALL_BADGES.length;
  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
  const categories: (BadgeCategory | "all")[] = ["all", "explorer", "collector", "social", "milestone", "special"];

  const renderBadge = ({ item }: { item: Badge }) => {
    const isEarned = earnedIds.has(item.id);
    return (
      <View style={[styles.badgeCard, { backgroundColor: colors.surface, borderColor: isEarned ? item.color : colors.border, opacity: isEarned ? 1 : 0.5 }]}>
        <View style={[styles.badgeIcon, { backgroundColor: isEarned ? item.color + "20" : colors.background }]}>
          <MaterialIcons name={item.icon as any} size={32} color={isEarned ? item.color : colors.muted} />
        </View>
        <Text style={[styles.badgeName, { color: isEarned ? colors.foreground : colors.muted }]}>{item.name}</Text>
        <Text style={[styles.badgeDesc, { color: colors.muted }]} numberOfLines={2}>{item.description}</Text>
        {isEarned ? (
          <View style={[styles.earnedTag, { backgroundColor: item.color + "20" }]}>
            <MaterialIcons name="check-circle" size={12} color={item.color} />
            <Text style={[styles.earnedText, { color: item.color }]}>Earned</Text>
          </View>
        ) : (
          <View style={[styles.earnedTag, { backgroundColor: colors.background }]}>
            <MaterialIcons name="lock" size={12} color={colors.muted} />
            <Text style={[styles.earnedText, { color: colors.muted }]}>Locked</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Badges & Passport</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.foreground }]}>{earnedCount} / {totalCount} Badges</Text>
          <Text style={[styles.progressPct, { color: colors.primary }]}>{pct}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["badges", "passport", "stats"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.muted }]}>
              {t === "badges" ? "Badges" : t === "passport" ? "Passport" : "Stats"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === "badges" && (
        <View style={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {categories.map((c) => (
              <TouchableOpacity key={c} onPress={() => setSelectedCategory(c)}
                style={[styles.catChip, { backgroundColor: selectedCategory === c ? colors.primary : colors.surface, borderColor: colors.border }]}>
                <Text style={{ color: selectedCategory === c ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>
                  {c === "all" ? "All" : CATEGORY_INFO[c].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList data={filteredBadges} renderItem={renderBadge} keyExtractor={(i) => i.id} numColumns={2} columnWrapperStyle={styles.badgeRow} contentContainerStyle={styles.badgeList} />
        </View>
      )}
      {tab === "passport" && (
        <FlatList data={visited} keyExtractor={(i) => i.siteId} contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="explore" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Visits Yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>Mark campgrounds as visited to build your passport!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.visitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="place" size={20} color={colors.primary} />
              <View style={styles.visitInfo}>
                <Text style={[styles.visitName, { color: colors.foreground }]}>{item.siteName}</Text>
                <Text style={[styles.visitMeta, { color: colors.muted }]}>{item.state} · {new Date(item.visitedAt).toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        />
      )}
      {tab === "stats" && stats && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {[
            { label: "Campgrounds Visited", value: stats.totalVisited, icon: "place", color: "#3B82F6" },
            { label: "States Visited", value: stats.statesVisited.length, icon: "map", color: "#22C55E" },
            { label: "Photos Added", value: stats.photosAdded, icon: "camera-alt", color: "#EC4899" },
            { label: "Reviews Written", value: stats.reviewsWritten, icon: "rate-review", color: "#8B5CF6" },
            { label: "Signal Reports", value: stats.signalReports, icon: "signal-cellular-alt", color: "#0EA5E9" },
            { label: "Trips Planned", value: stats.tripsPlanned, icon: "explore", color: "#F59E0B" },
            { label: "Caravans Joined", value: stats.caravansJoined, icon: "groups", color: "#D946EF" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <MaterialIcons name={s.icon as any} size={24} color={s.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{s.label}</Text>
              </View>
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
  progressSection: { margin: 16, padding: 16, borderRadius: 12 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressTitle: { fontSize: 16, fontWeight: "600" },
  progressPct: { fontSize: 16, fontWeight: "700" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  tabs: { flexDirection: "row", borderBottomWidth: 0.5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
  content: { flex: 1 },
  catScroll: { maxHeight: 48, marginTop: 8 },
  catContent: { paddingHorizontal: 16, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  badgeRow: { justifyContent: "space-between", paddingHorizontal: 16 },
  badgeList: { paddingTop: 12, paddingBottom: 100 },
  badgeCard: { width: "48%", padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12, alignItems: "center" },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  badgeName: { fontSize: 14, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  badgeDesc: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  earnedTag: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  earnedText: { fontSize: 11, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  visitCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8, gap: 12 },
  visitInfo: { flex: 1 },
  visitName: { fontSize: 15, fontWeight: "600" },
  visitMeta: { fontSize: 12, marginTop: 2 },
  statCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: 1, gap: 14 },
  statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  statInfo: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 13, marginTop: 2 },
});
