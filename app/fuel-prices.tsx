import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ScrollView, Text, View, TouchableOpacity, TextInput, StyleSheet, Platform, RefreshControl, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type FuelType = "diesel" | "regular" | "midgrade" | "premium";
type SortBy = "price" | "distance" | "name";

interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  diesel: number;
  regular: number;
  midgrade: number;
  premium: number;
  hasDEF: boolean;
  hasRVLanes: boolean;
  hasShowers: boolean;
  hasDumpStation: boolean;
  hasRestaurant: boolean;
  hasParking: boolean;
  lastUpdated: string;
  distanceMiles?: number;
}

// Deterministic station generator based on real truck stop chains
function generateFuelStations(): FuelStation[] {
  const stations: FuelStation[] = [];
  const chains = [
    { brand: "Pilot Flying J", prefix: "Pilot", hasDEF: true, hasRVLanes: true, hasShowers: true, hasRestaurant: true },
    { brand: "Love's Travel Stops", prefix: "Love's", hasDEF: true, hasRVLanes: true, hasShowers: true, hasRestaurant: true },
    { brand: "TA/Petro", prefix: "TA", hasDEF: true, hasRVLanes: true, hasShowers: true, hasRestaurant: true },
    { brand: "Buc-ee's", prefix: "Buc-ee's", hasDEF: true, hasRVLanes: true, hasShowers: false, hasRestaurant: true },
    { brand: "Casey's General Store", prefix: "Casey's", hasDEF: false, hasRVLanes: false, hasShowers: false, hasRestaurant: false },
    { brand: "Costco Gas", prefix: "Costco", hasDEF: false, hasRVLanes: false, hasShowers: false, hasRestaurant: false },
    { brand: "Sam's Club Gas", prefix: "Sam's Club", hasDEF: false, hasRVLanes: false, hasShowers: false, hasRestaurant: false },
    { brand: "Maverik", prefix: "Maverik", hasDEF: true, hasRVLanes: true, hasShowers: false, hasRestaurant: false },
  ];

  const locations: { city: string; state: string; lat: number; lng: number }[] = [
    { city: "Amarillo", state: "TX", lat: 35.22, lng: -101.83 },
    { city: "Flagstaff", state: "AZ", lat: 35.20, lng: -111.65 },
    { city: "Barstow", state: "CA", lat: 34.90, lng: -117.02 },
    { city: "Boise", state: "ID", lat: 43.62, lng: -116.21 },
    { city: "Cheyenne", state: "WY", lat: 41.14, lng: -104.82 },
    { city: "Denver", state: "CO", lat: 39.74, lng: -104.99 },
    { city: "El Paso", state: "TX", lat: 31.76, lng: -106.49 },
    { city: "Jacksonville", state: "FL", lat: 30.33, lng: -81.66 },
    { city: "Kansas City", state: "MO", lat: 39.10, lng: -94.58 },
    { city: "Las Vegas", state: "NV", lat: 36.17, lng: -115.14 },
    { city: "Little Rock", state: "AR", lat: 34.75, lng: -92.29 },
    { city: "Memphis", state: "TN", lat: 35.15, lng: -90.05 },
    { city: "Nashville", state: "TN", lat: 36.16, lng: -86.78 },
    { city: "Oklahoma City", state: "OK", lat: 35.47, lng: -97.52 },
    { city: "Omaha", state: "NE", lat: 41.26, lng: -95.94 },
    { city: "Phoenix", state: "AZ", lat: 33.45, lng: -112.07 },
    { city: "Portland", state: "OR", lat: 45.52, lng: -122.68 },
    { city: "Reno", state: "NV", lat: 39.53, lng: -119.81 },
    { city: "Sacramento", state: "CA", lat: 38.58, lng: -121.49 },
    { city: "Salt Lake City", state: "UT", lat: 40.76, lng: -111.89 },
    { city: "San Antonio", state: "TX", lat: 29.42, lng: -98.49 },
    { city: "Savannah", state: "GA", lat: 32.08, lng: -81.09 },
    { city: "Sioux Falls", state: "SD", lat: 43.55, lng: -96.73 },
    { city: "Spokane", state: "WA", lat: 47.66, lng: -117.43 },
    { city: "St. Louis", state: "MO", lat: 38.63, lng: -90.20 },
    { city: "Tallahassee", state: "FL", lat: 30.44, lng: -84.28 },
    { city: "Tucson", state: "AZ", lat: 32.22, lng: -110.97 },
    { city: "Tulsa", state: "OK", lat: 36.15, lng: -95.99 },
    { city: "Wichita", state: "KS", lat: 37.69, lng: -97.34 },
    { city: "Billings", state: "MT", lat: 45.78, lng: -108.50 },
    { city: "Rapid City", state: "SD", lat: 44.08, lng: -103.23 },
    { city: "Albuquerque", state: "NM", lat: 35.08, lng: -106.65 },
    { city: "Charlotte", state: "NC", lat: 35.23, lng: -80.84 },
    { city: "Atlanta", state: "GA", lat: 33.75, lng: -84.39 },
    { city: "Dallas", state: "TX", lat: 32.78, lng: -96.80 },
    { city: "Houston", state: "TX", lat: 29.76, lng: -95.37 },
    { city: "Indianapolis", state: "IN", lat: 39.77, lng: -86.16 },
    { city: "Louisville", state: "KY", lat: 38.25, lng: -85.76 },
    { city: "Minneapolis", state: "MN", lat: 44.98, lng: -93.27 },
    { city: "Richmond", state: "VA", lat: 37.54, lng: -77.44 },
  ];

  // Seed-based price variation
  function seedPrice(base: number, seed: number): number {
    const variation = ((Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1);
    return Math.round((base + (variation * 0.6 - 0.3)) * 100) / 100;
  }

  let id = 0;
  for (const loc of locations) {
    // 2-4 stations per city
    const stationCount = 2 + (id % 3);
    for (let s = 0; s < stationCount; s++) {
      const chain = chains[(id + s) % chains.length];
      const seed = id * 17 + s * 31;
      stations.push({
        id: `fuel-${id}-${s}`,
        name: `${chain.prefix} #${1000 + id + s}`,
        brand: chain.brand,
        address: `${1000 + seed % 9000} Interstate Hwy`,
        city: loc.city,
        state: loc.state,
        lat: loc.lat + (s * 0.02 - 0.01),
        lng: loc.lng + (s * 0.015 - 0.01),
        diesel: seedPrice(3.89, seed),
        regular: seedPrice(3.29, seed + 1),
        midgrade: seedPrice(3.59, seed + 2),
        premium: seedPrice(3.89, seed + 3),
        hasDEF: chain.hasDEF,
        hasRVLanes: chain.hasRVLanes,
        hasShowers: chain.hasShowers,
        hasDumpStation: s % 4 === 0,
        hasRestaurant: chain.hasRestaurant,
        hasParking: chain.hasRVLanes,
        lastUpdated: "2 hours ago",
        distanceMiles: undefined,
      });
    }
    id++;
  }
  return stations;
}

const ALL_FUEL_STATIONS = generateFuelStations();

export default function FuelPricesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("diesel");
  const [sortBy, setSortBy] = useState<SortBy>("price");
  const [showRVOnly, setShowRVOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stateFilter, setStateFilter] = useState("");

  const fuelTypes: { key: FuelType; label: string; icon: string }[] = [
    { key: "diesel", label: "Diesel", icon: "local-gas-station" },
    { key: "regular", label: "Regular", icon: "local-gas-station" },
    { key: "midgrade", label: "Mid-Grade", icon: "local-gas-station" },
    { key: "premium", label: "Premium", icon: "local-gas-station" },
  ];

  const filteredStations = useMemo(() => {
    let results = [...ALL_FUEL_STATIONS];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q)
      );
    }
    if (stateFilter) {
      results = results.filter((s) => s.state === stateFilter);
    }
    if (showRVOnly) {
      results = results.filter((s) => s.hasRVLanes);
    }
    // Sort
    results.sort((a, b) => {
      if (sortBy === "price") return a[fuelType] - b[fuelType];
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return results.slice(0, 50);
  }, [search, fuelType, sortBy, showRVOnly, stateFilter]);

  // Average prices
  const avgPrices = useMemo(() => {
    const diesel = ALL_FUEL_STATIONS.reduce((sum, s) => sum + s.diesel, 0) / ALL_FUEL_STATIONS.length;
    const regular = ALL_FUEL_STATIONS.reduce((sum, s) => sum + s.regular, 0) / ALL_FUEL_STATIONS.length;
    return { diesel: diesel.toFixed(2), regular: regular.toFixed(2) };
  }, []);

  const cheapest = useMemo(() => {
    const sorted = [...ALL_FUEL_STATIONS].sort((a, b) => a[fuelType] - b[fuelType]);
    return sorted[0];
  }, [fuelType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Fuel Prices</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* National Average Banner */}
        <View style={[styles.avgBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <MaterialIcons name="local-gas-station" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.avgTitle, { color: colors.foreground }]}>National Averages</Text>
            <View style={styles.avgRow}>
              <View style={styles.avgItem}>
                <Text style={[styles.avgLabel, { color: colors.muted }]}>Diesel</Text>
                <Text style={[styles.avgPrice, { color: colors.primary }]}>${avgPrices.diesel}</Text>
              </View>
              <View style={[styles.avgDivider, { backgroundColor: colors.border }]} />
              <View style={styles.avgItem}>
                <Text style={[styles.avgLabel, { color: colors.muted }]}>Regular</Text>
                <Text style={[styles.avgPrice, { color: colors.primary }]}>${avgPrices.regular}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cheapest Station Highlight */}
        {cheapest && (
          <View style={[styles.cheapestCard, { backgroundColor: "#E8F5E9", borderColor: colors.success + "40" }]}>
            <View style={styles.cheapestBadge}>
              <MaterialIcons name="emoji-events" size={20} color="#F9A825" />
              <Text style={[styles.cheapestBadgeText, { color: colors.success }]}>Cheapest {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}</Text>
            </View>
            <Text style={[styles.cheapestName, { color: colors.foreground }]}>{cheapest.name}</Text>
            <Text style={[styles.cheapestLoc, { color: colors.muted }]}>{cheapest.city}, {cheapest.state}</Text>
            <Text style={[styles.cheapestPrice, { color: colors.success }]}>${cheapest[fuelType].toFixed(2)}/gal</Text>
          </View>
        )}

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by city, state, or brand..."
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

        {/* Fuel Type Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.fuelTabs}>
          {fuelTypes.map((ft) => (
            <TouchableOpacity
              key={ft.key}
              onPress={() => setFuelType(ft.key)}
              style={[
                styles.fuelTab,
                {
                  backgroundColor: fuelType === ft.key ? colors.primary : colors.surface,
                  borderColor: fuelType === ft.key ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.fuelTabText, { color: fuelType === ft.key ? "#fff" : colors.foreground }]}>
                {ft.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            onPress={() => setShowRVOnly(!showRVOnly)}
            style={[
              styles.filterChip,
              {
                backgroundColor: showRVOnly ? colors.primary + "15" : colors.surface,
                borderColor: showRVOnly ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="rv-hookup" size={16} color={showRVOnly ? colors.primary : colors.muted} />
            <Text style={[styles.filterChipText, { color: showRVOnly ? colors.primary : colors.foreground }]}>RV Lanes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy(sortBy === "price" ? "name" : "price")}
            style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="sort" size={16} color={colors.muted} />
            <Text style={[styles.filterChipText, { color: colors.foreground }]}>
              {sortBy === "price" ? "By Price" : "By Name"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <Text style={[styles.resultsCount, { color: colors.muted }]}>
          {filteredStations.length} stations found
        </Text>

        {/* Station Cards */}
        {filteredStations.map((station) => {
          const price = station[fuelType];
          const isCheap = price < 3.50;
          const isExpensive = price > 4.20;
          return (
            <View
              key={station.id}
              style={[styles.stationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.stationHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stationName, { color: colors.foreground }]}>{station.name}</Text>
                  <Text style={[styles.stationBrand, { color: colors.muted }]}>{station.brand}</Text>
                  <Text style={[styles.stationAddress, { color: colors.muted }]}>
                    {station.city}, {station.state}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.stationPrice,
                      { color: isCheap ? colors.success : isExpensive ? colors.error : colors.primary },
                    ]}
                  >
                    ${price.toFixed(2)}
                  </Text>
                  <Text style={[styles.perGal, { color: colors.muted }]}>per gal</Text>
                  {isCheap && (
                    <View style={[styles.priceBadge, { backgroundColor: colors.success + "15" }]}>
                      <Text style={{ fontSize: 9, fontWeight: "700", color: colors.success }}>LOW</Text>
                    </View>
                  )}
                  {isExpensive && (
                    <View style={[styles.priceBadge, { backgroundColor: colors.error + "15" }]}>
                      <Text style={{ fontSize: 9, fontWeight: "700", color: colors.error }}>HIGH</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* All Prices Row */}
              <View style={styles.allPricesRow}>
                <View style={styles.miniPrice}>
                  <Text style={[styles.miniPriceLabel, { color: colors.muted }]}>Diesel</Text>
                  <Text style={[styles.miniPriceValue, { color: fuelType === "diesel" ? colors.primary : colors.foreground }]}>${station.diesel.toFixed(2)}</Text>
                </View>
                <View style={styles.miniPrice}>
                  <Text style={[styles.miniPriceLabel, { color: colors.muted }]}>Regular</Text>
                  <Text style={[styles.miniPriceValue, { color: fuelType === "regular" ? colors.primary : colors.foreground }]}>${station.regular.toFixed(2)}</Text>
                </View>
                <View style={styles.miniPrice}>
                  <Text style={[styles.miniPriceLabel, { color: colors.muted }]}>Mid</Text>
                  <Text style={[styles.miniPriceValue, { color: fuelType === "midgrade" ? colors.primary : colors.foreground }]}>${station.midgrade.toFixed(2)}</Text>
                </View>
                <View style={styles.miniPrice}>
                  <Text style={[styles.miniPriceLabel, { color: colors.muted }]}>Premium</Text>
                  <Text style={[styles.miniPriceValue, { color: fuelType === "premium" ? colors.primary : colors.foreground }]}>${station.premium.toFixed(2)}</Text>
                </View>
              </View>

              {/* Amenities */}
              <View style={styles.amenitiesRow}>
                {station.hasRVLanes && (
                  <View style={[styles.amenityChip, { backgroundColor: colors.success + "10" }]}>
                    <MaterialIcons name="rv-hookup" size={12} color={colors.success} />
                    <Text style={[styles.amenityText, { color: colors.success }]}>RV Lanes</Text>
                  </View>
                )}
                {station.hasDEF && (
                  <View style={[styles.amenityChip, { backgroundColor: colors.primary + "10" }]}>
                    <MaterialIcons name="water-drop" size={12} color={colors.primary} />
                    <Text style={[styles.amenityText, { color: colors.primary }]}>DEF</Text>
                  </View>
                )}
                {station.hasShowers && (
                  <View style={[styles.amenityChip, { backgroundColor: "#9C27B015" }]}>
                    <MaterialIcons name="shower" size={12} color="#9C27B0" />
                    <Text style={[styles.amenityText, { color: "#9C27B0" }]}>Showers</Text>
                  </View>
                )}
                {station.hasDumpStation && (
                  <View style={[styles.amenityChip, { backgroundColor: colors.warning + "10" }]}>
                    <MaterialIcons name="delete" size={12} color={colors.warning} />
                    <Text style={[styles.amenityText, { color: colors.warning }]}>Dump</Text>
                  </View>
                )}
                {station.hasRestaurant && (
                  <View style={[styles.amenityChip, { backgroundColor: "#E6510015" }]}>
                    <MaterialIcons name="restaurant" size={12} color="#E65100" />
                    <Text style={[styles.amenityText, { color: "#E65100" }]}>Food</Text>
                  </View>
                )}
                {station.hasParking && (
                  <View style={[styles.amenityChip, { backgroundColor: "#01579B15" }]}>
                    <MaterialIcons name="local-parking" size={12} color="#01579B" />
                    <Text style={[styles.amenityText, { color: "#01579B" }]}>RV Parking</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.lastUpdated, { color: colors.muted }]}>Updated {station.lastUpdated}</Text>
            </View>
          );
        })}

        {filteredStations.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="local-gas-station" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Stations Found</Text>
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
  avgBanner: { marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avgTitle: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  avgRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avgItem: { alignItems: "center" },
  avgLabel: { fontSize: 11, marginBottom: 2 },
  avgPrice: { fontSize: 20, fontWeight: "800" },
  avgDivider: { width: 1, height: 30 },
  cheapestCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cheapestBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  cheapestBadgeText: { fontSize: 12, fontWeight: "700" },
  cheapestName: { fontSize: 15, fontWeight: "700" },
  cheapestLoc: { fontSize: 12, marginTop: 2 },
  cheapestPrice: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  fuelTabs: { paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  fuelTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  fuelTabText: { fontSize: 13, fontWeight: "600" },
  filtersRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: "500" },
  resultsCount: { paddingHorizontal: 16, fontSize: 12, marginBottom: 8 },
  stationCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 10 },
  stationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  stationName: { fontSize: 15, fontWeight: "700" },
  stationBrand: { fontSize: 12, marginTop: 2 },
  stationAddress: { fontSize: 11, marginTop: 2 },
  priceContainer: { alignItems: "flex-end" },
  stationPrice: { fontSize: 24, fontWeight: "800" },
  perGal: { fontSize: 10, marginTop: -2 },
  priceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  allPricesRow: { flexDirection: "row", justifyContent: "space-between" },
  miniPrice: { alignItems: "center" },
  miniPriceLabel: { fontSize: 10 },
  miniPriceValue: { fontSize: 13, fontWeight: "600" },
  amenitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  amenityChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  amenityText: { fontSize: 10, fontWeight: "600" },
  lastUpdated: { fontSize: 10, fontStyle: "italic" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySubtitle: { fontSize: 13 },
});
