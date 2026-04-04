import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  type RVClass,
  type RVGuidePayload,
  getGuideData,
  BUNDLED_GUIDE,
} from "@/lib/rv-guide-data";

export default function RVGuideScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<RVClass>("class_a");
  const [showBest, setShowBest] = useState(true);
  const [guideData, setGuideData] = useState<RVGuidePayload>(BUNDLED_GUIDE);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getGuideData();
      setGuideData(data);
    } catch {
      // Keep bundled data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const category = guideData.categories.find((c) => c.key === selectedClass)!;
  const models = showBest ? category.best : category.worst;
  const lastUpdated = new Date(guideData.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < full; i++) stars.push(<MaterialIcons key={`f${i}`} name="star" size={14} color={colors.warning} />);
    if (half) stars.push(<MaterialIcons key="h" name="star-half" size={14} color={colors.warning} />);
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) stars.push(<MaterialIcons key={`e${i}`} name="star-border" size={14} color={colors.border} />);
    return stars;
  };

  if (loading) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>RV Buying Guide</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.subtitleRow}>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Expert ratings to help you buy smart
        </Text>
        <View style={[styles.updatedBadge, { backgroundColor: colors.primary + "15" }]}>
          <MaterialIcons name="update" size={12} color={colors.primary} />
          <Text style={[styles.updatedText, { color: colors.primary }]}>
            Updated {lastUpdated}
          </Text>
        </View>
      </View>

      {/* Class Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {guideData.categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setSelectedClass(cat.key)}
            style={[
              styles.classChip,
              {
                backgroundColor: selectedClass === cat.key ? colors.primary : colors.surface,
                borderColor: selectedClass === cat.key ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={cat.icon as any}
              size={18}
              color={selectedClass === cat.key ? "#fff" : colors.muted}
            />
            <Text
              style={[
                styles.classChipText,
                { color: selectedClass === cat.key ? "#fff" : colors.foreground },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Class Description */}
      <Text style={[styles.classDesc, { color: colors.muted }]}>{category.description}</Text>

      {/* Best / Worst Toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, showBest && { backgroundColor: colors.success }]}
          onPress={() => setShowBest(true)}
        >
          <MaterialIcons name="thumb-up" size={16} color={showBest ? "#fff" : colors.muted} />
          <Text style={[styles.toggleText, { color: showBest ? "#fff" : colors.muted }]}>
            Best to Buy ({category.best.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !showBest && { backgroundColor: colors.error }]}
          onPress={() => setShowBest(false)}
        >
          <MaterialIcons name="thumb-down" size={16} color={!showBest ? "#fff" : colors.muted} />
          <Text style={[styles.toggleText, { color: !showBest ? "#fff" : colors.muted }]}>
            Worst to Avoid ({category.worst.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Model Cards — pull to refresh */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {models.map((model, index) => (
          <View key={index} style={[styles.modelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Rank Badge */}
            <View style={[styles.rankBadge, { backgroundColor: showBest ? colors.success + "20" : colors.error + "20" }]}>
              <Text style={[styles.rankText, { color: showBest ? colors.success : colors.error }]}>
                #{index + 1} {showBest ? "BEST" : "AVOID"}
              </Text>
            </View>

            {/* Model Header */}
            <Text style={[styles.modelName, { color: colors.foreground }]}>{model.name}</Text>
            <Text style={[styles.modelMaker, { color: colors.muted }]}>
              {model.maker} {"\u00B7"} {model.year}
            </Text>

            {/* Rating & Price */}
            <View style={styles.modelMeta}>
              <View style={styles.ratingRow}>
                {renderStars(model.rating)}
                <Text style={[styles.ratingNum, { color: colors.foreground }]}>{model.rating}</Text>
              </View>
              <Text style={[styles.priceRange, { color: colors.primary }]}>{model.priceRange}</Text>
            </View>

            {/* Pros */}
            <View style={styles.prosConsSection}>
              <Text style={[styles.prosConsTitle, { color: colors.success }]}>
                <MaterialIcons name="check-circle" size={14} color={colors.success} /> Pros
              </Text>
              {model.pros.map((pro, i) => (
                <View key={i} style={styles.prosConsItem}>
                  <Text style={[styles.prosConsDot, { color: colors.success }]}>+</Text>
                  <Text style={[styles.prosConsText, { color: colors.foreground }]}>{pro}</Text>
                </View>
              ))}
            </View>

            {/* Cons */}
            <View style={styles.prosConsSection}>
              <Text style={[styles.prosConsTitle, { color: colors.error }]}>
                <MaterialIcons name="cancel" size={14} color={colors.error} /> Cons
              </Text>
              {model.cons.map((con, i) => (
                <View key={i} style={styles.prosConsItem}>
                  <Text style={[styles.prosConsDot, { color: colors.error }]}>-</Text>
                  <Text style={[styles.prosConsText, { color: colors.foreground }]}>{con}</Text>
                </View>
              ))}
            </View>

            {/* Verdict */}
            <View style={[styles.verdictBox, { backgroundColor: (showBest ? colors.success : colors.error) + "10", borderColor: (showBest ? colors.success : colors.error) + "30" }]}>
              <Text style={[styles.verdictLabel, { color: showBest ? colors.success : colors.error }]}>
                <MaterialIcons name="gavel" size={13} color={showBest ? colors.success : colors.error} /> Verdict
              </Text>
              <Text style={[styles.verdictText, { color: colors.foreground }]}>{model.verdict}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingBottom: 2,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, marginBottom: 8,
  },
  subtitle: { fontSize: 14, flex: 1 },
  updatedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  updatedText: { fontSize: 11, fontWeight: "600" },
  classScroll: { marginBottom: 8 },
  classChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  classChipText: { fontSize: 13, fontWeight: "600" },
  classDesc: { fontSize: 13, paddingHorizontal: 16, marginBottom: 10 },
  toggleRow: {
    flexDirection: "row", marginHorizontal: 16, borderRadius: 12, borderWidth: 1,
    overflow: "hidden", marginBottom: 8,
  },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10,
  },
  toggleText: { fontSize: 13, fontWeight: "600" },
  modelCard: {
    marginHorizontal: 16, marginTop: 10, borderRadius: 14, borderWidth: 1,
    padding: 16, gap: 10,
  },
  rankBadge: {
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  rankText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  modelName: { fontSize: 20, fontWeight: "800" },
  modelMaker: { fontSize: 14, marginTop: -4 },
  modelMeta: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingNum: { fontSize: 14, fontWeight: "700", marginLeft: 4 },
  priceRange: { fontSize: 15, fontWeight: "700" },
  prosConsSection: { gap: 4 },
  prosConsTitle: { fontSize: 14, fontWeight: "700" },
  prosConsItem: { flexDirection: "row", gap: 6, paddingLeft: 4 },
  prosConsDot: { fontSize: 16, fontWeight: "800", width: 14 },
  prosConsText: { fontSize: 14, flex: 1, lineHeight: 20 },
  verdictBox: {
    borderRadius: 10, borderWidth: 1, padding: 12, gap: 4,
  },
  verdictLabel: { fontSize: 13, fontWeight: "700" },
  verdictText: { fontSize: 14, lineHeight: 20 },
});
