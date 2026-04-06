/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  RV_ROUTE_WARNINGS,
  getWarningsNearLocation,
  getWarningsForState,
  getSeverityColor,
  getTypeIcon,
  getTypeLabel,
  type RouteWarning,
} from "@/lib/rv-route-warnings";

const STATES_WITH_WARNINGS = [...new Set(RV_ROUTE_WARNINGS.map(w => w.state))].sort();

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "low_bridge", label: "Low Bridge" },
  { key: "tunnel", label: "Tunnel" },
  { key: "steep_grade", label: "Steep Grade" },
  { key: "narrow_road", label: "Narrow Road" },
  { key: "weight_limit", label: "Weight Limit" },
  { key: "no_rv", label: "No RVs" },
] as const;

export default function RVRouteWarningsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [nearMeMode, setNearMeMode] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [rvHeight, setRvHeight] = useState("13");

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLat(loc.coords.latitude);
          setUserLng(loc.coords.longitude);
        }
      } catch {}
    })();
  }, []);

  const filteredWarnings = useMemo(() => {
    let warnings = [...RV_ROUTE_WARNINGS];

    if (nearMeMode && userLat != null && userLng != null) {
      warnings = getWarningsNearLocation(userLat, userLng, 100);
    } else if (selectedState) {
      warnings = getWarningsForState(selectedState);
    }

    if (typeFilter !== "all") {
      warnings = warnings.filter(w => w.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      warnings = warnings.filter(
        w => w.location.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.state.toLowerCase().includes(q)
      );
    }

    // Sort: critical first, then warning, then info
    warnings.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    return warnings;
  }, [selectedState, typeFilter, searchQuery, nearMeMode, userLat, userLng]);

  // Warnings that affect the user's RV height
  const heightWarnings = useMemo(() => {
    const h = parseFloat(rvHeight) || 13;
    return filteredWarnings.filter(w => w.clearanceFt != null && w.clearanceFt < h);
  }, [filteredWarnings, rvHeight]);

  const renderWarning = ({ item }: { item: RouteWarning }) => {
    const sevColor = getSeverityColor(item.severity);
    const h = parseFloat(rvHeight) || 13;
    const isHeightDanger = item.clearanceFt != null && item.clearanceFt < h;

    return (
      <View style={[styles.warningCard, { backgroundColor: colors.surface, borderColor: isHeightDanger ? colors.error : colors.border }]}>
        <View style={styles.warningHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <Text style={{ fontSize: 20 }}>{getTypeIcon(item.type)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningLocation, { color: colors.foreground }]}>{item.location}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{item.state}</Text>
            </View>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: sevColor + "15" }]}>
            <Text style={[styles.severityText, { color: sevColor }]}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={[styles.warningDesc, { color: colors.muted }]}>{item.description}</Text>

        <View style={styles.warningMeta}>
          <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>{getTypeLabel(item.type)}</Text>
          </View>
          {item.clearanceFt != null && (
            <View style={[styles.metaChip, { backgroundColor: isHeightDanger ? colors.error + "15" : colors.background }]}>
              <MaterialIcons name="height" size={12} color={isHeightDanger ? colors.error : colors.foreground} />
              <Text style={{ color: isHeightDanger ? colors.error : colors.foreground, fontSize: 12, fontWeight: "700" }}>
                {item.clearanceFt}' clearance
              </Text>
            </View>
          )}
          {item.weightLimitTons != null && (
            <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
              <MaterialIcons name="monitor-weight" size={12} color={colors.foreground} />
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>{item.weightLimitTons} ton limit</Text>
            </View>
          )}
          {item.gradePct != null && (
            <View style={[styles.metaChip, { backgroundColor: colors.warning + "15" }]}>
              <MaterialIcons name="trending-up" size={12} color={colors.warning} />
              <Text style={{ color: colors.warning, fontSize: 12, fontWeight: "700" }}>{item.gradePct}% grade</Text>
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>RV Route Warnings</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* RV Height Input */}
      <View style={[styles.heightBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="height" size={18} color={colors.primary} />
        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Your RV Height:</Text>
        <TextInput
          style={[styles.heightInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          value={rvHeight}
          onChangeText={setRvHeight}
          keyboardType="numeric"
          returnKeyType="done"
        />
        <Text style={{ color: colors.muted, fontSize: 13 }}>feet</Text>
        {heightWarnings.length > 0 && (
          <View style={[styles.dangerBadge, { backgroundColor: colors.error + "15" }]}>
            <MaterialIcons name="warning" size={12} color={colors.error} />
            <Text style={{ color: colors.error, fontSize: 11, fontWeight: "700" }}>{heightWarnings.length} too low</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search locations, tunnels, bridges..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
      </View>

      {/* Near Me + State Filter */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: nearMeMode ? colors.primary : colors.surface, borderColor: nearMeMode ? colors.primary : colors.border }]}
              onPress={() => {
                setNearMeMode(!nearMeMode);
                setSelectedState(null);
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="my-location" size={14} color={nearMeMode ? "#fff" : colors.foreground} />
              <Text style={{ color: nearMeMode ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>Near Me</Text>
            </TouchableOpacity>
            {STATES_WITH_WARNINGS.map(state => (
              <TouchableOpacity
                key={state}
                style={[styles.filterChip, { backgroundColor: selectedState === state ? colors.primary : colors.surface, borderColor: selectedState === state ? colors.primary : colors.border }]}
                onPress={() => {
                  setSelectedState(selectedState === state ? null : state);
                  setNearMeMode(false);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: selectedState === state ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{state}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Type Filter */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {TYPE_FILTERS.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, { backgroundColor: typeFilter === f.key ? colors.warning : colors.surface, borderColor: typeFilter === f.key ? colors.warning : colors.border }]}
                onPress={() => {
                  setTypeFilter(typeFilter === f.key ? "all" : f.key);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: typeFilter === f.key ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {filteredWarnings.length} warning{filteredWarnings.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {/* Warnings List */}
      <FlatList
        data={filteredWarnings}
        renderItem={renderWarning}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <MaterialIcons name="check-circle" size={48} color={colors.success} />
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginTop: 12 }}>No Warnings Found</Text>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center", marginTop: 4 }}>
              No known route hazards in this area. Always check local signage.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  heightBar: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  heightInput: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, fontWeight: "700", width: 50, textAlign: "center" },
  dangerBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { flexDirection: "row", gap: 6 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  warningCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  warningHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  warningLocation: { fontSize: 14, fontWeight: "700" },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityText: { fontSize: 10, fontWeight: "800" },
  warningDesc: { fontSize: 13, lineHeight: 18 },
  warningMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
