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
  INTERSTATES,
  ALL_EXITS,
  getExitsForInterstate,
  searchExits,
  getServiceIcon,
  type InterstateExit,
  type InterstateInfo,
} from "@/lib/exit-guide-data";

type ViewMode = "browse" | "search" | "interstate";

export default function ExitGuideScreen() {
  const colors = useColors();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterstate, setSelectedInterstate] = useState<InterstateInfo | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchExits(searchQuery.trim()).slice(0, 50);
  }, [searchQuery]);

  const interstateExits = useMemo(() => {
    if (!selectedInterstate) return [];
    return getExitsForInterstate(selectedInterstate.id);
  }, [selectedInterstate]);

  const handleSelectInterstate = (info: InterstateInfo) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterstate(info);
    setViewMode("interstate");
  };

  const openDirections = (exit: InterstateExit) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${exit.latitude},${exit.longitude}`;
    openUrl(url);
  };

  const renderExitCard = ({ item }: { item: InterstateExit }) => {
    const gasServices = item.services.filter(s => s.type === "gas");
    const foodServices = item.services.filter(s => s.type === "food");
    const otherServices = item.services.filter(s => s.type !== "gas" && s.type !== "food");

    return (
      <TouchableOpacity
        style={[styles.exitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => openDirections(item)}
        activeOpacity={0.7}
      >
        <View style={styles.exitHeader}>
          <View style={[styles.exitBadge, { backgroundColor: item.rvFriendly ? "#2E7D3220" : colors.muted + "15" }]}>
            <Text style={[styles.exitNumber, { color: item.rvFriendly ? "#2E7D32" : colors.muted }]}>
              Exit {item.exitNumber}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.exitName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.exitCity, { color: colors.muted }]}>{item.city}, {item.state}</Text>
          </View>
          {item.rvFriendly && (
            <View style={[styles.rvTag, { backgroundColor: "#2E7D3215" }]}>
              <MaterialIcons name="rv-hookup" size={14} color="#2E7D32" />
              <Text style={styles.rvTagText}>RV OK</Text>
            </View>
          )}
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          {gasServices.length > 0 && (
            <View style={styles.serviceGroup}>
              <View style={styles.serviceGroupHeader}>
                <MaterialIcons name="local-gas-station" size={14} color="#E65100" />
                <Text style={[styles.serviceGroupTitle, { color: "#E65100" }]}>Fuel</Text>
              </View>
              {gasServices.map((s, i) => (
                <View key={i} style={styles.serviceItem}>
                  <Text style={[styles.serviceName, { color: colors.foreground }]}>{s.name}</Text>
                  <View style={styles.serviceTags}>
                    {s.hasDiesel && <Text style={[styles.miniTag, { backgroundColor: "#E6510015", color: "#E65100" }]}>Diesel</Text>}
                    {s.hasRVParking && <Text style={[styles.miniTag, { backgroundColor: "#2E7D3215", color: "#2E7D32" }]}>RV Parking</Text>}
                    {s.hasShowers && <Text style={[styles.miniTag, { backgroundColor: "#1565C015", color: "#1565C0" }]}>Showers</Text>}
                    {s.hasDumpStation && <Text style={[styles.miniTag, { backgroundColor: "#6A1B9A15", color: "#6A1B9A" }]}>Dump</Text>}
                    {s.open24Hours && <Text style={[styles.miniTag, { backgroundColor: colors.muted + "15", color: colors.muted }]}>24hr</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {foodServices.length > 0 && (
            <View style={styles.serviceGroup}>
              <View style={styles.serviceGroupHeader}>
                <MaterialIcons name="restaurant" size={14} color="#1565C0" />
                <Text style={[styles.serviceGroupTitle, { color: "#1565C0" }]}>Food</Text>
              </View>
              {foodServices.map((s, i) => (
                <View key={i} style={styles.serviceItem}>
                  <Text style={[styles.serviceName, { color: colors.foreground }]}>{s.name}</Text>
                  {s.open24Hours && <Text style={[styles.miniTag, { backgroundColor: colors.muted + "15", color: colors.muted }]}>24hr</Text>}
                </View>
              ))}
            </View>
          )}

          {otherServices.length > 0 && (
            <View style={styles.serviceGroup}>
              <View style={styles.serviceGroupHeader}>
                <MaterialIcons name="more-horiz" size={14} color={colors.muted} />
                <Text style={[styles.serviceGroupTitle, { color: colors.muted }]}>More</Text>
              </View>
              {otherServices.map((s, i) => {
                const icon = getServiceIcon(s.type);
                return (
                  <View key={i} style={styles.serviceItem}>
                    <MaterialIcons name={icon.icon as any} size={12} color={icon.color} />
                    <Text style={[styles.serviceName, { color: colors.foreground, marginLeft: 4 }]}>{s.name}</Text>
                    {s.hasRVParking && <Text style={[styles.miniTag, { backgroundColor: "#2E7D3215", color: "#2E7D32" }]}>RV</Text>}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {item.notes && (
          <View style={[styles.notesRow, { backgroundColor: colors.primary + "08" }]}>
            <MaterialIcons name="info-outline" size={14} color={colors.primary} />
            <Text style={[styles.notesText, { color: colors.primary }]}>{item.notes}</Text>
          </View>
        )}

        <View style={styles.directionsRow}>
          <MaterialIcons name="directions" size={16} color={colors.primary} />
          <Text style={[styles.directionsText, { color: colors.primary }]}>Get Directions</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (viewMode === "interstate") {
              setViewMode("browse");
              setSelectedInterstate(null);
            } else {
              router.back();
            }
          }}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {viewMode === "interstate" && selectedInterstate ? selectedInterstate.name : "Interstate Exit Guide"}
          </Text>
          {viewMode === "interstate" && selectedInterstate && (
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {selectedInterstate.direction} · {selectedInterstate.states.join(", ")}
            </Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search exits, cities, or services..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.trim()) setViewMode("search");
            else if (selectedInterstate) setViewMode("interstate");
            else setViewMode("browse");
          }}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => {
            setSearchQuery("");
            if (selectedInterstate) setViewMode("interstate");
            else setViewMode("browse");
          }}>
            <MaterialIcons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Content */}
      {viewMode === "browse" && (
        <FlatList
          data={INTERSTATES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select an Interstate</Text>
              <Text style={[styles.sectionSub, { color: colors.muted }]}>
                Browse services at exits along major US interstates
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.interstateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleSelectInterstate(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.interstateShield, { backgroundColor: "#1565C0" }]}>
                <Text style={styles.shieldText}>{item.name}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.interstateName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.interstateInfo, { color: colors.muted }]}>
                  {item.direction} · {item.states.join(" → ")}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        />
      )}

      {viewMode === "search" && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            searchResults.length > 0 ? (
              <Text style={[styles.resultCount, { color: colors.muted }]}>
                {searchResults.length} exit{searchResults.length !== 1 ? "s" : ""} found
              </Text>
            ) : null
          }
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={48} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No exits found</Text>
                <Text style={[styles.emptySub, { color: colors.muted }]}>Try a different search term</Text>
              </View>
            ) : null
          }
          renderItem={renderExitCard}
        />
      )}

      {viewMode === "interstate" && (
        <FlatList
          data={interstateExits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.muted }]}>
              {interstateExits.length} exits on {selectedInterstate?.name}
            </Text>
          }
          renderItem={renderExitCard}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  sectionLabel: { fontSize: 18, fontWeight: "700" },
  sectionSub: { fontSize: 13, marginTop: 4 },
  resultCount: { fontSize: 13, marginBottom: 12 },
  // Interstate card
  interstateCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  interstateShield: {
    width: 48,
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  shieldText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  interstateName: { fontSize: 16, fontWeight: "700" },
  interstateInfo: { fontSize: 12, marginTop: 2 },
  // Exit card
  exitCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  exitHeader: { flexDirection: "row", alignItems: "center" },
  exitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  exitNumber: { fontSize: 13, fontWeight: "800" },
  exitName: { fontSize: 15, fontWeight: "700" },
  exitCity: { fontSize: 12, marginTop: 1 },
  rvTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rvTagText: { color: "#2E7D32", fontSize: 11, fontWeight: "700" },
  // Services
  servicesContainer: { marginTop: 10, gap: 8 },
  serviceGroup: { gap: 4 },
  serviceGroupHeader: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  serviceGroupTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  serviceItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 18 },
  serviceName: { fontSize: 13, fontWeight: "500" },
  serviceTags: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  miniTag: {
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  notesText: { fontSize: 12, fontWeight: "500", flex: 1 },
  directionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  directionsText: { fontSize: 13, fontWeight: "600" },
  // Empty
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptySub: { fontSize: 14 },
});
