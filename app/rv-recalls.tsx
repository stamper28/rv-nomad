import { useState, useMemo } from "react";
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet, TextInput, Linking, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  RV_MANUFACTURERS, RECENT_RECALLS, COMMON_PROBLEMS,
  SEVERITY_CONFIG, FREQUENCY_LABELS, DIY_LABELS,
  type RVRecall, type RVProblem, type RVManufacturer,
} from "@/lib/rv-recalls-data";

type TabType = "recalls" | "problems" | "lookup";

export default function RVRecallsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("recalls");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [expandedRecall, setExpandedRecall] = useState<string | null>(null);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);

  const filteredRecalls = useMemo(() => {
    let results = RECENT_RECALLS;
    if (selectedManufacturer) {
      results = results.filter((r) => r.manufacturer === selectedManufacturer);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.manufacturer.toLowerCase().includes(q) ||
          r.models.some((m) => m.toLowerCase().includes(q)) ||
          r.component.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      );
    }
    return results;
  }, [searchQuery, selectedManufacturer]);

  const filteredProblems = useMemo(() => {
    if (!searchQuery.trim()) return COMMON_PROBLEMS;
    const q = searchQuery.toLowerCase();
    return COMMON_PROBLEMS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.affectedBrands.some((b) => b.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredManufacturers = useMemo(() => {
    if (!searchQuery.trim()) return RV_MANUFACTURERS;
    const q = searchQuery.toLowerCase();
    return RV_MANUFACTURERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.types.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const renderRecallCard = (recall: RVRecall) => {
    const severity = SEVERITY_CONFIG[recall.severity];
    const isExpanded = expandedRecall === recall.id;
    return (
      <TouchableOpacity
        key={recall.id}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpandedRecall(isExpanded ? null : recall.id);
        }}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.severityBadge, { backgroundColor: severity.bgColor }]}>
            <MaterialIcons name={severity.icon as any} size={14} color={severity.color} />
            <Text style={[styles.severityText, { color: severity.color }]}>{severity.label}</Text>
          </View>
          <Text style={[styles.recallDate, { color: colors.muted }]}>{recall.recallDate}</Text>
        </View>

        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          {recall.manufacturer} — {recall.component}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
          {recall.models.join(", ")} ({recall.modelYears})
        </Text>
        <Text style={[styles.cardDesc, { color: colors.foreground }]} numberOfLines={isExpanded ? undefined : 2}>
          {recall.summary}
        </Text>

        {isExpanded && (
          <View style={{ marginTop: 12, gap: 10 }}>
            <View style={[styles.detailBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.error }]}>Consequence</Text>
              <Text style={[styles.detailText, { color: colors.foreground }]}>{recall.consequence}</Text>
            </View>
            <View style={[styles.detailBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.success }]}>Remedy</Text>
              <Text style={[styles.detailText, { color: colors.foreground }]}>{recall.remedy}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[styles.metaText, { color: colors.muted }]}>
                Campaign: {recall.nhtsaCampaignNumber}
              </Text>
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {recall.affectedUnits.toLocaleString()} units affected
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://www.nhtsa.gov/recalls`)}
              style={[styles.nhtsaBtn, { backgroundColor: "#1a365d" }]}
              activeOpacity={0.8}
            >
              <MaterialIcons name="open-in-new" size={16} color="#fff" />
              <Text style={styles.nhtsaBtnText}>View on NHTSA.gov</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={20} color={colors.muted} />
          <Text style={[styles.expandText, { color: colors.muted }]}>{isExpanded ? "Show less" : "Tap for details"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProblemCard = (problem: RVProblem) => {
    const severity = SEVERITY_CONFIG[problem.severity];
    const isExpanded = expandedProblem === problem.id;
    return (
      <TouchableOpacity
        key={problem.id}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpandedProblem(isExpanded ? null : problem.id);
        }}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.severityBadge, { backgroundColor: severity.bgColor }]}>
            <MaterialIcons name={severity.icon as any} size={14} color={severity.color} />
            <Text style={[styles.severityText, { color: severity.color }]}>{severity.label}</Text>
          </View>
          <View style={[styles.freqBadge, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.freqText, { color: colors.primary }]}>{FREQUENCY_LABELS[problem.frequency]}</Text>
          </View>
        </View>

        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{problem.title}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{problem.category}</Text>
        <Text style={[styles.cardDesc, { color: colors.foreground }]} numberOfLines={isExpanded ? undefined : 2}>
          {problem.description}
        </Text>

        {isExpanded && (
          <View style={{ marginTop: 12, gap: 10 }}>
            {/* Cost & DIY */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={[styles.infoChip, { backgroundColor: colors.background, borderColor: colors.border, flex: 1 }]}>
                <MaterialIcons name="attach-money" size={16} color={colors.warning} />
                <Text style={[styles.infoChipText, { color: colors.foreground }]}>{problem.estimatedCost}</Text>
              </View>
              <View style={[styles.infoChip, { backgroundColor: colors.background, borderColor: colors.border, flex: 1 }]}>
                <MaterialIcons name="build" size={16} color={colors.primary} />
                <Text style={[styles.infoChipText, { color: colors.foreground }]}>{DIY_LABELS[problem.diyDifficulty]}</Text>
              </View>
            </View>

            {/* Symptoms */}
            <View style={[styles.detailBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.warning }]}>Warning Signs</Text>
              {problem.symptoms.map((s, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={{ color: colors.warning, fontSize: 12 }}>⚠️</Text>
                  <Text style={[styles.bulletText, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Prevention */}
            <View style={[styles.detailBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.success }]}>Prevention Tips</Text>
              {problem.preventionTips.map((tip, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={{ color: colors.success, fontSize: 12 }}>✅</Text>
                  <Text style={[styles.bulletText, { color: colors.foreground }]}>{tip}</Text>
                </View>
              ))}
            </View>

            {/* Affected Brands */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {problem.affectedBrands.map((brand, i) => (
                <View key={i} style={[styles.brandChip, { backgroundColor: colors.muted + "15" }]}>
                  <Text style={[styles.brandChipText, { color: colors.muted }]}>{brand}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={20} color={colors.muted} />
          <Text style={[styles.expandText, { color: colors.muted }]}>{isExpanded ? "Show less" : "Tap for details & prevention tips"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderManufacturerCard = (mfr: RVManufacturer) => (
    <View key={mfr.name} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.mfrHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{mfr.name}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{mfr.types.join(" • ")}</Text>
        </View>
        <View style={[styles.recallCountBadge, { backgroundColor: colors.error + "15" }]}>
          <Text style={[styles.recallCountText, { color: colors.error }]}>{mfr.recallCount}</Text>
          <Text style={[styles.recallCountLabel, { color: colors.error }]}>recalls</Text>
        </View>
      </View>

      <Text style={[styles.mfrIssuesLabel, { color: colors.muted }]}>Common Issues:</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {mfr.commonIssues.map((issue, i) => (
          <View key={i} style={[styles.brandChip, { backgroundColor: colors.warning + "15" }]}>
            <Text style={[styles.brandChipText, { color: colors.warning }]}>{issue}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openURL(mfr.nhtsaSearchUrl);
          }}
          style={[styles.mfrBtn, { backgroundColor: "#1a365d" }]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="search" size={16} color="#fff" />
          <Text style={styles.mfrBtnText}>NHTSA Recalls</Text>
        </TouchableOpacity>
        {mfr.vinLookupUrl && (
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL(mfr.vinLookupUrl!);
            }}
            style={[styles.mfrBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="qr-code" size={16} color="#fff" />
            <Text style={styles.mfrBtnText}>VIN Lookup</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>RV Problems & Recalls</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://www.nhtsa.gov/recalls")}
          activeOpacity={0.7}
        >
          <MaterialIcons name="open-in-new" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder={tab === "recalls" ? "Search recalls by manufacturer, model, or component..." : tab === "problems" ? "Search common problems..." : "Search manufacturer..."}
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {([
          { key: "recalls" as TabType, label: "Recalls", icon: "warning" },
          { key: "problems" as TabType, label: "Problems", icon: "build" },
          { key: "lookup" as TabType, label: "VIN Lookup", icon: "search" },
        ]).map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab(t.key);
              setSearchQuery("");
              setSelectedManufacturer(null);
            }}
            style={[styles.tab, { borderBottomColor: tab === t.key ? colors.primary : "transparent" }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name={t.icon as any} size={18} color={tab === t.key ? colors.primary : colors.muted} />
            <Text style={[styles.tabText, { color: tab === t.key ? colors.primary : colors.muted }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}>
        {tab === "recalls" && (
          <>
            {/* Manufacturer Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => setSelectedManufacturer(null)}
                style={[styles.filterChip, { backgroundColor: !selectedManufacturer ? colors.primary : colors.surface, borderColor: !selectedManufacturer ? colors.primary : colors.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, { color: !selectedManufacturer ? "#fff" : colors.foreground }]}>All</Text>
              </TouchableOpacity>
              {[...new Set(RECENT_RECALLS.map((r) => r.manufacturer))].map((mfr) => (
                <TouchableOpacity
                  key={mfr}
                  onPress={() => setSelectedManufacturer(selectedManufacturer === mfr ? null : mfr)}
                  style={[styles.filterChip, { backgroundColor: selectedManufacturer === mfr ? colors.primary : colors.surface, borderColor: selectedManufacturer === mfr ? colors.primary : colors.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, { color: selectedManufacturer === mfr ? "#fff" : colors.foreground }]}>{mfr}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* NHTSA Banner */}
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.nhtsa.gov/recalls")}
              style={[styles.nhtsaBanner, { backgroundColor: "#1a365d15", borderColor: "#1a365d30" }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="verified-user" size={24} color="#1a365d" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#1a365d", fontSize: 13, fontWeight: "700" }}>Check Your RV on NHTSA.gov</Text>
                <Text style={{ color: "#1a365d", fontSize: 11, opacity: 0.7, marginTop: 2 }}>Enter your VIN to see all recalls for your specific vehicle</Text>
              </View>
              <MaterialIcons name="open-in-new" size={16} color="#1a365d" />
            </TouchableOpacity>

            {/* Recall Cards */}
            {filteredRecalls.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="check-circle" size={48} color={colors.success} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Recalls Found</Text>
                <Text style={[styles.emptyDesc, { color: colors.muted }]}>
                  {searchQuery ? "Try a different search term" : "No recalls match the selected filter"}
                </Text>
              </View>
            ) : (
              filteredRecalls.map(renderRecallCard)
            )}
          </>
        )}

        {tab === "problems" && (
          <>
            {/* Summary Banner */}
            <View style={[styles.summaryBanner, { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" }]}>
              <MaterialIcons name="lightbulb" size={20} color={colors.warning} />
              <Text style={{ color: colors.foreground, fontSize: 12, flex: 1, lineHeight: 18 }}>
                These are the most common RV problems reported by owners. Tap any issue for symptoms, prevention tips, and estimated repair costs.
              </Text>
            </View>

            {filteredProblems.map(renderProblemCard)}
          </>
        )}

        {tab === "lookup" && (
          <>
            {/* VIN Lookup Banner */}
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.nhtsa.gov/recalls")}
              style={[styles.nhtsaBanner, { backgroundColor: "#1a365d15", borderColor: "#1a365d30" }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="verified-user" size={24} color="#1a365d" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#1a365d", fontSize: 13, fontWeight: "700" }}>Free VIN Recall Check</Text>
                <Text style={{ color: "#1a365d", fontSize: 11, opacity: 0.7, marginTop: 2 }}>Enter your VIN on NHTSA.gov to see all recalls and safety issues for your specific RV</Text>
              </View>
              <MaterialIcons name="open-in-new" size={16} color="#1a365d" />
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
              Manufacturer Recall Lookup ({filteredManufacturers.length})
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.muted }]}>
              Search for recalls by manufacturer or use their VIN lookup tool
            </Text>

            {filteredManufacturers.map(renderManufacturerCard)}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800" },
  searchContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB", marginBottom: 12 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: "600" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  severityBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityText: { fontSize: 11, fontWeight: "700" },
  recallDate: { fontSize: 11 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cardSubtitle: { fontSize: 12, marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 19 },
  detailBox: { borderRadius: 8, borderWidth: 1, padding: 10 },
  detailLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  detailText: { fontSize: 13, lineHeight: 19 },
  metaText: { fontSize: 11 },
  nhtsaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
  nhtsaBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  expandText: { fontSize: 12, marginLeft: 4 },
  freqBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  freqText: { fontSize: 11, fontWeight: "600" },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  infoChipText: { fontSize: 12, fontWeight: "600" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 4 },
  bulletText: { fontSize: 12, lineHeight: 18, flex: 1 },
  brandChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  brandChipText: { fontSize: 11, fontWeight: "600" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: "600" },
  nhtsaBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  summaryBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  mfrHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  recallCountBadge: { alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  recallCountText: { fontSize: 18, fontWeight: "800" },
  recallCountLabel: { fontSize: 10, fontWeight: "600" },
  mfrIssuesLabel: { fontSize: 11, fontWeight: "600", marginBottom: 6 },
  mfrBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: "center" },
  mfrBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sectionLabel: { fontSize: 16, fontWeight: "700", marginTop: 4, marginBottom: 4 },
  sectionDesc: { fontSize: 12, marginBottom: 12 },
});
