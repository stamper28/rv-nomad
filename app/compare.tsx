/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite } from "@/lib/types";
import { getCardPriceText } from "@/lib/price-labels";
import { getSiteImageUrl } from "@/lib/site-images";

const MAX_COMPARE = 3;

export default function CompareScreen() {
  const colors = useColors();
  const router = useRouter();
  const [allSites, setAllSites] = useState<CampSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<CampSite[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPicker, setShowPicker] = useState(true);

  useEffect(() => {
    import("@/lib/all-sites-data").then((mod) => {
      setAllSites(mod.ALL_SITES);
    });
  }, []);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const lower = searchQuery.toLowerCase();
    return allSites
      .filter(
        (s) =>
          !selectedSites.find((ss) => ss.id === s.id) &&
          (s.name.toLowerCase().includes(lower) ||
            s.city.toLowerCase().includes(lower) ||
            s.state.toLowerCase().includes(lower))
      )
      .slice(0, 10);
  }, [searchQuery, allSites, selectedSites]);

  function addSite(site: CampSite) {
    if (selectedSites.length >= MAX_COMPARE) return;
    setSelectedSites((prev) => [...prev, site]);
    setSearchQuery("");
    Keyboard.dismiss();
    if (selectedSites.length + 1 >= 2) setShowPicker(false);
  }

  function removeSite(id: string) {
    setSelectedSites((prev) => prev.filter((s) => s.id !== id));
    setShowPicker(true);
  }

  const comparisonRows: { label: string; icon: string; getValue: (s: CampSite) => string; highlight?: (s: CampSite, all: CampSite[]) => boolean }[] = [
    {
      label: "Category",
      icon: "category",
      getValue: (s) => CATEGORY_LABELS[s.category],
    },
    {
      label: "Price/Night",
      icon: "attach-money",
      getValue: (s) => s.pricePerNight ? `Est. $${s.pricePerNight}` : "Free",
      highlight: (s, all) => {
        const prices = all.map((a) => a.pricePerNight ?? 0).filter((p) => p > 0);
        return prices.length > 0 && (s.pricePerNight ?? 0) === Math.min(...prices);
      },
    },
    {
      label: "Rating",
      icon: "star",
      getValue: (s) => s.rating ? `${s.rating}/5` : "N/A",
      highlight: (s, all) => {
        const ratings = all.map((a) => a.rating ?? 0).filter((r) => r > 0);
        return ratings.length > 0 && (s.rating ?? 0) === Math.max(...ratings);
      },
    },
    {
      label: "Total Sites",
      icon: "grid-view",
      getValue: (s) => (s as any).totalSites?.toString() || "N/A",
    },
    {
      label: "Hookups",
      icon: "power",
      getValue: (s) => s.hookupType || "None",
    },
    {
      label: "Amp Service",
      icon: "bolt",
      getValue: (s) => s.ampService || "N/A",
    },
    {
      label: "Max RV Length",
      icon: "straighten",
      getValue: (s) => s.maxRVLength ? `${s.maxRVLength} ft` : "N/A",
    },
    {
      label: "Pull-Through",
      icon: "swap-horiz",
      getValue: (s) => s.pullThrough ? "Yes" : "No",
      highlight: (s) => s.pullThrough === true,
    },
    {
      label: "Big Rig Friendly",
      icon: "local-shipping",
      getValue: (s) => s.bigRigFriendly ? "Yes" : "No",
      highlight: (s) => s.bigRigFriendly === true,
    },
    {
      label: "ADA Accessible",
      icon: "accessible",
      getValue: (s) => s.adaAccessible ? "Yes" : "No",
      highlight: (s) => s.adaAccessible === true,
    },
    {
      label: "Equipment Rental",
      icon: "accessibility-new",
      getValue: (s) => s.adaEquipmentRental && s.adaEquipmentRental.length > 0 ? s.adaEquipmentRental.join(", ") : "None",
    },
    {
      label: "Season",
      icon: "date-range",
      getValue: (s) => {
        if ((s as any).openSeason && (s as any).closeSeason) return `${(s as any).openSeason} - ${(s as any).closeSeason}`;
        return "Year-round";
      },
    },
    {
      label: "Amenities",
      icon: "checklist",
      getValue: (s) => {
        const a = s.amenities || [];
        return a.length > 0 ? a.slice(0, 4).join(", ") + (a.length > 4 ? ` +${a.length - 4}` : "") : "None listed";
      },
    },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Compare Campgrounds</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Selected Sites */}
        <View style={styles.selectedRow}>
          {selectedSites.map((site) => (
            <View key={site.id} style={[styles.selectedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Image
                source={{ uri: getSiteImageUrl(site.id, site.category, site.state) }}
                style={styles.selectedImage}
                contentFit="cover"
              />
              <Text style={[styles.selectedName, { color: colors.foreground }]} numberOfLines={2}>
                {site.name}
              </Text>
              <Text style={[styles.selectedLocation, { color: colors.muted }]} numberOfLines={1}>
                {site.city}, {site.state}
              </Text>
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: colors.error + "15" }]}
                onPress={() => removeSite(site.id)}
              >
                <MaterialIcons name="close" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {selectedSites.length < MAX_COMPARE && (
            <TouchableOpacity
              style={[styles.addCard, { borderColor: colors.border }]}
              onPress={() => setShowPicker(true)}
            >
              <MaterialIcons name="add" size={28} color={colors.primary} />
              <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Picker */}
        {showPicker && selectedSites.length < MAX_COMPARE && (
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <MaterialIcons name="search" size={20} color={colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search campgrounds to compare..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>
            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 250 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.searchResult, { borderBottomColor: colors.border }]}
                    onPress={() => addSite(item)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: getSiteImageUrl(item.id, item.category, item.state) }}
                      style={styles.resultImage}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.resultName, { color: colors.foreground }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.resultLocation, { color: colors.muted }]}>
                        {item.city}, {item.state} - {getCardPriceText(item.category, item.pricePerNight)}
                      </Text>
                    </View>
                    <MaterialIcons name="add-circle-outline" size={22} color={colors.primary} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {/* Comparison Table */}
        {selectedSites.length >= 2 && (
          <View style={[styles.comparisonTable, { borderColor: colors.border }]}>
            <View style={[styles.tableHeader, { backgroundColor: colors.primary + "10" }]}>
              <View style={styles.labelCol}>
                <Text style={[styles.tableHeaderText, { color: colors.primary }]}>Feature</Text>
              </View>
              {selectedSites.map((site) => (
                <View key={site.id} style={styles.valueCol}>
                  <Text style={[styles.tableHeaderText, { color: colors.primary }]} numberOfLines={1}>
                    {site.name.length > 15 ? site.name.slice(0, 15) + "..." : site.name}
                  </Text>
                </View>
              ))}
            </View>

            {comparisonRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.tableRow,
                  { backgroundColor: i % 2 === 0 ? "transparent" : colors.surface },
                  { borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.labelCol}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialIcons name={row.icon as any} size={16} color={colors.muted} />
                    <Text style={[styles.rowLabel, { color: colors.foreground }]}>{row.label}</Text>
                  </View>
                </View>
                {selectedSites.map((site) => {
                  const isHighlighted = row.highlight?.(site, selectedSites);
                  return (
                    <View key={site.id} style={styles.valueCol}>
                      <Text
                        style={[
                          styles.rowValue,
                          { color: isHighlighted ? colors.success : colors.foreground },
                          isHighlighted && { fontWeight: "700" },
                        ]}
                        numberOfLines={2}
                      >
                        {row.getValue(site)}
                        {isHighlighted ? " \u2713" : ""}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {selectedSites.length < 2 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="compare-arrows" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Compare Campgrounds</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Add at least 2 campgrounds to compare them side by side. You can compare up to 3 at once.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  selectedRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  selectedCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  selectedImage: { width: "100%", height: 70 },
  selectedName: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingTop: 6 },
  selectedLocation: { fontSize: 10, paddingHorizontal: 8, paddingBottom: 8 },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  addCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },
  addText: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  pickerContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  resultImage: { width: 40, height: 40, borderRadius: 8 },
  resultName: { fontSize: 13, fontWeight: "600" },
  resultLocation: { fontSize: 11 },
  comparisonTable: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderText: { fontSize: 11, fontWeight: "700" },
  labelCol: { width: 100, paddingHorizontal: 6 },
  valueCol: { flex: 1, paddingHorizontal: 6 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    alignItems: "center",
  },
  rowLabel: { fontSize: 12, fontWeight: "600" },
  rowValue: { fontSize: 11 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
