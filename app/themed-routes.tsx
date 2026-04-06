/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useMemo } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { openUrl } from "@/lib/open-url";
import {
  THEMED_ROUTES,
  ROUTE_CATEGORIES,
  getRoutesByCategory,
  searchRoutes,
  type ThemedRoute,
  type RouteCategory,
} from "@/lib/themed-routes-data";

type ViewMode = "categories" | "list" | "detail";

export default function ThemedRoutesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RouteCategory | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<ThemedRoute | null>(null);

  const filteredRoutes = useMemo(() => {
    if (searchQuery.trim()) return searchRoutes(searchQuery.trim());
    if (selectedCategory) return getRoutesByCategory(selectedCategory);
    return THEMED_ROUTES;
  }, [searchQuery, selectedCategory]);

  const openStop = (lat: number, lng: number, name: string) => {
    openUrl(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  };

  const renderRouteCard = ({ item }: { item: ThemedRoute }) => {
    const catInfo = ROUTE_CATEGORIES.find(c => c.id === item.category);
    return (
      <TouchableOpacity
        style={[styles.routeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedRoute(item);
          setViewMode("detail");
        }}
        activeOpacity={0.7}
      >
        <View style={styles.routeCardHeader}>
          <Text style={styles.routeEmoji}>{item.imageEmoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.routeName, { color: colors.foreground }]}>{item.name}</Text>
            <Text style={[styles.routeTagline, { color: colors.muted }]}>{item.tagline}</Text>
          </View>
        </View>

        <View style={styles.routeStats}>
          <View style={[styles.statChip, { backgroundColor: catInfo?.color + "15" || colors.primary + "15" }]}>
            <Text style={[styles.statText, { color: catInfo?.color || colors.primary }]}>{item.totalMiles} mi</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.statText, { color: colors.primary }]}>{item.estimatedDays} days</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: item.difficulty === "easy" ? "#2E7D3215" : item.difficulty === "moderate" ? "#F57F1715" : "#D32F2F15" }]}>
            <Text style={[styles.statText, { color: item.difficulty === "easy" ? "#2E7D32" : item.difficulty === "moderate" ? "#F57F17" : "#D32F2F" }]}>
              {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={[styles.routeStates, { color: colors.muted }]}>
          {item.states.join(" → ")} · Best: {item.bestSeason}
        </Text>
      </TouchableOpacity>
    );
  };

  // Detail view
  if (viewMode === "detail" && selectedRoute) {
    const catInfo = ROUTE_CATEGORIES.find(c => c.id === selectedRoute.category);
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setViewMode("list")} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>{selectedRoute.name}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Hero */}
          <View style={[styles.heroCard, { backgroundColor: catInfo?.color + "10" || colors.surface, borderColor: catInfo?.color + "30" || colors.border }]}>
            <Text style={{ fontSize: 48, textAlign: "center" }}>{selectedRoute.imageEmoji}</Text>
            <Text style={[styles.heroName, { color: colors.foreground }]}>{selectedRoute.name}</Text>
            <Text style={[styles.heroTagline, { color: catInfo?.color || colors.primary }]}>{selectedRoute.tagline}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{selectedRoute.totalMiles}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Miles</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{selectedRoute.estimatedDays}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Days</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{selectedRoute.stops.length}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Stops</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.foreground }]}>{selectedRoute.description}</Text>

          {/* Best Season & Difficulty */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <View style={[styles.infoBadge, { backgroundColor: "#2E7D3215" }]}>
              <MaterialIcons name="event" size={14} color="#2E7D32" />
              <Text style={{ color: "#2E7D32", fontSize: 12, fontWeight: "600" }}>Best: {selectedRoute.bestSeason}</Text>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: catInfo?.color + "15" || colors.primary + "15" }]}>
              <MaterialIcons name="route" size={14} color={catInfo?.color || colors.primary} />
              <Text style={{ color: catInfo?.color || colors.primary, fontSize: 12, fontWeight: "600" }}>
                {selectedRoute.states.join(" → ")}
              </Text>
            </View>
          </View>

          {/* Highlights */}
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20 }]}>Highlights</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {selectedRoute.highlights.map((h, i) => (
              <View key={i} style={[styles.highlightChip, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                <MaterialIcons name="star" size={12} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Stops */}
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20 }]}>Route Stops</Text>
          {selectedRoute.stops.map((stop, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.stopCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openStop(stop.latitude, stop.longitude, stop.name)}
              activeOpacity={0.7}
            >
              <View style={styles.stopNumber}>
                <View style={[styles.stopDot, { backgroundColor: catInfo?.color || colors.primary }]}>
                  <Text style={styles.stopDotText}>{i + 1}</Text>
                </View>
                {i < selectedRoute.stops.length - 1 && (
                  <View style={[styles.stopLine, { backgroundColor: catInfo?.color + "30" || colors.border }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.stopName, { color: colors.foreground }]}>{stop.name}</Text>
                  {stop.nightsRecommended && (
                    <View style={[styles.nightsBadge, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "700" }}>{stop.nightsRecommended}N</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.stopDesc, { color: colors.muted }]}>{stop.description}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <MaterialIcons name={stop.type === "campground" ? "night-shelter" : stop.type === "attraction" ? "attractions" : stop.type === "viewpoint" ? "visibility" : "location-city"} size={12} color={colors.muted} />
                  <Text style={{ color: colors.muted, fontSize: 11 }}>{stop.type.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</Text>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600", marginLeft: 8 }}>Open in Maps →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* RV Notes */}
          <View style={[styles.rvNotesBox, { backgroundColor: "#E6510010", borderColor: "#E6510030" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <MaterialIcons name="rv-hookup" size={18} color="#E65100" />
              <Text style={{ color: "#E65100", fontSize: 15, fontWeight: "700" }}>RV Notes</Text>
            </View>
            <Text style={{ color: "#E65100", fontSize: 13, lineHeight: 20 }}>{selectedRoute.rvNotes}</Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (viewMode === "list") { setViewMode("categories"); setSelectedCategory(null); }
            else router.back();
          }}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {selectedCategory ? ROUTE_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Routes" : "Themed Routes"}
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search routes, states, or highlights..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.trim()) setViewMode("list");
            else if (!selectedCategory) setViewMode("categories");
          }}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => { setSearchQuery(""); if (!selectedCategory) setViewMode("categories"); }}>
            <MaterialIcons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {viewMode === "categories" && !searchQuery.trim() ? (
        <FlatList
          data={ROUTE_CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Explore by Category</Text>
              <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
                {THEMED_ROUTES.length} curated road trips across America
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const count = getRoutesByCategory(item.id).length;
            return (
              <TouchableOpacity
                style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(item.id);
                  setViewMode("list");
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: item.color + "15" }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.categoryName, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{count} route{count !== 1 ? "s" : ""}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <FlatList
          data={filteredRoutes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 12 }}>
              {filteredRoutes.length} route{filteredRoutes.length !== 1 ? "s" : ""}
            </Text>
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 8 }}>
              <MaterialIcons name="map" size={48} color={colors.muted} />
              <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "700" }}>No routes found</Text>
              <Text style={{ color: colors.muted, fontSize: 14 }}>Try a different search</Text>
            </View>
          }
          renderItem={renderRouteCard}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", flex: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  // Category
  categoryCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  categoryIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  categoryName: { fontSize: 16, fontWeight: "700" },
  // Route card
  routeCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  routeCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  routeEmoji: { fontSize: 36 },
  routeName: { fontSize: 16, fontWeight: "700" },
  routeTagline: { fontSize: 13, marginTop: 2 },
  routeStats: { flexDirection: "row", gap: 8, marginTop: 10 },
  statChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statText: { fontSize: 12, fontWeight: "700" },
  routeStates: { fontSize: 12, marginTop: 8 },
  // Detail
  heroCard: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", gap: 8 },
  heroName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  heroTagline: { fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  statBox: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  description: { fontSize: 15, lineHeight: 22, marginTop: 16 },
  infoBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  highlightChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  // Stops
  stopCard: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 8, gap: 12 },
  stopNumber: { alignItems: "center", width: 28 },
  stopDot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  stopDotText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  stopLine: { width: 2, flex: 1, marginTop: 4 },
  stopName: { fontSize: 14, fontWeight: "700" },
  nightsBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  stopDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  // RV Notes
  rvNotesBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 20, marginBottom: 20 },
});
