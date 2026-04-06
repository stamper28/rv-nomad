/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
  FlatList,
  Keyboard,
  Linking,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type CampSite,
  type SiteCategory,
  type StateLaws,
} from "@/lib/types";
import { getSiteImageUrl } from "@/lib/site-images";
import { useUserLocation, getDistanceMiles } from "@/hooks/use-location";

type FilterKey = "all" | SiteCategory;

const FILTER_OPTIONS: { key: FilterKey; label: string; group: string }[] = [
  { key: "all", label: "All", group: "" },
  // Camping & Overnight
  { key: "rv_park", label: "RV Parks", group: "Camping" },
  { key: "national_park", label: "Nat'l Parks", group: "Camping" },
  { key: "state_park", label: "State Parks", group: "Camping" },
  { key: "boondocking", label: "Boondocking", group: "Camping" },
  { key: "blm", label: "BLM", group: "Camping" },
  { key: "national_forest", label: "Nat'l Forest", group: "Camping" },
  { key: "military", label: "Military", group: "Camping" },
  { key: "harvest_host", label: "Harvest Host", group: "Camping" },
  // Overnight Parking
  { key: "walmart", label: "Walmart", group: "Overnight" },
  { key: "cracker_barrel", label: "Cracker Barrel", group: "Overnight" },
  { key: "casino_parking", label: "Casino", group: "Overnight" },
  { key: "cabelas_bass_pro", label: "Cabela's", group: "Overnight" },
  { key: "truck_stop", label: "Truck Stop", group: "Overnight" },
  { key: "elks_moose", label: "Elks/Moose", group: "Overnight" },
  { key: "rest_area", label: "Rest Areas", group: "Overnight" },
  // RV Services
  { key: "dump_station", label: "Dump Station", group: "Services" },
  { key: "weight_scale", label: "Scales", group: "Services" },
  { key: "fuel_station", label: "RV Fuel", group: "Services" },
  { key: "propane", label: "Propane", group: "Services" },
  { key: "rv_repair", label: "RV Repair", group: "Services" },
  { key: "water_fill", label: "Water Fill", group: "Services" },
  { key: "laundromat", label: "Laundry", group: "Services" },
  { key: "rv_wash", label: "RV Wash", group: "Services" },
  { key: "rv_tires", label: "RV Tires", group: "Services" },
  { key: "rv_dealer", label: "RV Dealer", group: "Services" },
  // Supplies
  { key: "rv_grocery", label: "Grocery", group: "Supplies" },
  { key: "rv_supply_store", label: "RV Supply", group: "Supplies" },
  { key: "outdoor_store", label: "Outdoor", group: "Supplies" },
  // Road Safety
  { key: "low_clearance", label: "Low Clearance", group: "Road" },
  { key: "weigh_station", label: "Weigh Station", group: "Road" },
  // Connectivity
  { key: "cell_coverage", label: "Cell Signal", group: "Connect" },
  { key: "free_wifi", label: "Free WiFi", group: "Connect" },
  // Roadtrippers POI
  { key: "attraction", label: "Attractions", group: "Explore" },
  { key: "scenic_view", label: "Scenic Views", group: "Explore" },
  { key: "restaurant", label: "Restaurants", group: "Explore" },
  { key: "roadside_oddity", label: "Oddities", group: "Explore" },
  { key: "historic_site", label: "Historic", group: "Explore" },
  { key: "visitor_center", label: "Visitor Ctr", group: "Explore" },
];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  // Canadian Provinces & Territories
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland & Labrador", NS: "Nova Scotia", NT: "Northwest Territories",
  NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon",
};

const CANADIAN_CODES = new Set(["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]);

/** Open a location in the device's native maps app */
function openInMaps(name: string, latitude: number, longitude: number) {
  const encodedName = encodeURIComponent(name);
  const url =
    Platform.OS === "ios"
      ? `maps:0,0?q=${encodedName}&ll=${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedName})`;

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      );
    }
  });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showLaws, setShowLaws] = useState(false);

  // GPS Near Me
  const { location: userLocation, loading: locationLoading, requestLocation } = useUserLocation();
  const [sortByDistance, setSortByDistance] = useState(false);

  // ADA filter
  const [adaOnly, setAdaOnly] = useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Lazy-loaded data
  const [allSites, setAllSites] = useState<CampSite[]>([]);
  const [stateLaws, setStateLaws] = useState<Record<string, StateLaws>>({});
  const [weightScales, setWeightScales] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    import("@/lib/all-sites-data").then((mod) => {
      setAllSites(mod.ALL_SITES);
      setStateLaws(mod.STATE_LAWS);
      setDataLoaded(true);
    });
    // Load search history
    import("@/lib/store").then(({ Store: S }) => {
      S.getSearchHistory().then(setSearchHistory);
    });
  }, []);

  // Lazy load weight scales when needed
  useEffect(() => {
    if (
      (selectedFilter === "all" || selectedFilter === "weight_scale") &&
      weightScales.length === 0
    ) {
      import("@/lib/weight-scale-data").then((mod) => {
        setWeightScales(mod.WEIGHT_SCALES);
      }).catch(() => {});
    }
  }, [selectedFilter, weightScales.length]);

  // Get unique states with counts
  const { usStates, canadaProvinces } = useMemo(() => {
    const counts: Record<string, number> = {};
    allSites.forEach((s) => {
      counts[s.state] = (counts[s.state] || 0) + 1;
    });
    const all = Object.entries(counts)
      .map(([code, count]) => ({ code, name: STATE_NAMES[code] || code, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return {
      usStates: all.filter((s) => !CANADIAN_CODES.has(s.code)),
      canadaProvinces: all.filter((s) => CANADIAN_CODES.has(s.code)),
    };
  }, [allSites]);

  // Filter sites
  const filteredSites = useMemo(() => {
    let filtered = allSites;

    // State filter
    if (selectedState) {
      filtered = filtered.filter((s) => s.state === selectedState);
    }

    // Category filter
    if (selectedFilter !== "all" && selectedFilter !== "weight_scale") {
      filtered = filtered.filter((s) => s.category === selectedFilter);
    }

    // ADA filter
    if (adaOnly) {
      filtered = filtered.filter((s) => s.adaAccessible === true);
    }

    // Search
    if (searchQuery.length > 1) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower) ||
          s.city.toLowerCase().includes(lower) ||
          (STATE_NAMES[s.state] || "").toLowerCase().includes(lower)
      );
    }

    // Sort by distance if Near Me is active
    if (sortByDistance && userLocation) {
      filtered = [...filtered].sort((a, b) => {
        const distA = getDistanceMiles(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
        const distB = getDistanceMiles(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return filtered;
  }, [allSites, selectedState, selectedFilter, searchQuery, sortByDistance, userLocation, adaOnly]);

  // Filter weight scales
  const filteredScales = useMemo(() => {
    if (selectedFilter !== "all" && selectedFilter !== "weight_scale") return [];
    let scales = weightScales;
    if (selectedState) {
      scales = scales.filter((s: any) => s.state === selectedState);
    }
    if (searchQuery.length > 1) {
      const lower = searchQuery.toLowerCase();
      scales = scales.filter(
        (s: any) =>
          s.name.toLowerCase().includes(lower) ||
          s.city.toLowerCase().includes(lower)
      );
    }
    return scales;
  }, [weightScales, selectedState, selectedFilter, searchQuery]);

  // Combined list
  const listData = useMemo(() => {
    const items: Array<{ type: "site" | "scale"; data: any }> = [];
    if (selectedFilter !== "weight_scale") {
      filteredSites.forEach((s) => items.push({ type: "site", data: s }));
    }
    if (selectedFilter === "all" || selectedFilter === "weight_scale") {
      filteredScales.forEach((s) => items.push({ type: "scale", data: s }));
    }
    return items;
  }, [filteredSites, filteredScales, selectedFilter]);

  // Current state laws
  const currentLaws = selectedState ? stateLaws[selectedState] : null;

  const handleFilterPress = useCallback((key: FilterKey) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFilter(key);
  }, []);

  const handleStateSelect = useCallback((code: string | null) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedState(code);
    setShowStatePicker(false);
    setShowLaws(false);
  }, []);

  const router = useRouter();

  const handleOpenSite = useCallback((site: CampSite) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: "/site-detail", params: { siteId: site.id } });
  }, [router]);

  const handleOpenScale = useCallback((scale: any) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    openInMaps(scale.name, scale.latitude, scale.longitude);
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-border"}
          size={14}
          color="#FB8C00"
        />
      );
    }
    return stars;
  };

  const renderSiteCard = useCallback(
    (site: CampSite) => {
      const catColor = CATEGORY_COLORS[site.category] || "#666";
      const imageUrl = getSiteImageUrl(site.id, site.category, site.state);
      return (
        <Pressable
          onPress={() => handleOpenSite(site)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          {/* Site Image */}
          <Image
            source={{ uri: imageUrl }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: catColor + "20" }]}>
                <Text style={[styles.categoryBadgeText, { color: catColor }]}>
                  {CATEGORY_LABELS[site.category] || site.category}
                </Text>
              </View>
              <View style={styles.directionsButton}>
                <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
              </View>
            </View>

            <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
              {site.name}
            </Text>

            <Text style={[styles.cardLocation, { color: colors.muted }]}>
              {site.city}, {STATE_NAMES[site.state] || site.state}
              {sortByDistance && userLocation ? ` • ${getDistanceMiles(userLocation.latitude, userLocation.longitude, site.latitude, site.longitude).toFixed(0)} mi` : ""}
            </Text>

            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>{renderStars(site.rating)}</View>
              <Text style={[styles.ratingText, { color: colors.muted }]}>
                {site.rating.toFixed(1)} ({site.reviewCount})
              </Text>
            </View>

            {/* Military ID Notice */}
            {/* ADA Badge */}
            {site.adaAccessible && (
              <View style={[styles.militaryNotice, { backgroundColor: "#1565C015", borderColor: "#1565C040" }]}>
                <MaterialIcons name="accessible" size={14} color="#1565C0" />
                <Text style={[styles.militaryNoticeText, { color: "#1565C0" }]}>
                  ADA Accessible{site.adaEquipmentRental && site.adaEquipmentRental.length > 0 ? " • Equipment Available" : ""}
                </Text>
              </View>
            )}

            {site.category === "military" && (
              <View style={[styles.militaryNotice, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
                <MaterialIcons name="verified-user" size={14} color={colors.warning} />
                <Text style={[styles.militaryNoticeText, { color: colors.warning }]}>
                  Military ID required to access base
                </Text>
              </View>
            )}

            <Text style={[styles.cardDescription, { color: colors.muted }]} numberOfLines={2}>
              {site.description}
            </Text>

            <View style={styles.cardFooter}>
              <Text
                style={[
                  styles.priceText,
                  { color: site.pricePerNight === null ? colors.success : colors.primary },
                ]}
              >
                {site.pricePerNight ? `Est. $${site.pricePerNight}/night` : "Free"}
              </Text>
              <View style={styles.amenitiesRow}>
                {site.amenities.slice(0, 3).map((a, i) => (
                  <View key={i} style={[styles.amenityChip, { backgroundColor: colors.background }]}>
                    <Text style={[styles.amenityText, { color: colors.muted }]}>{a}</Text>
                  </View>
                ))}
                {site.amenities.length > 3 && (
                  <Text style={[styles.moreText, { color: colors.muted }]}>
                    +{site.amenities.length - 3}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, handleOpenSite]
  );

  const renderScaleCard = useCallback(
    (scale: any) => (
      <Pressable
        onPress={() => handleOpenScale(scale)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: "#FF6F0020" }]}>
            <MaterialIcons name="scale" size={12} color="#FF6F00" />
            <Text style={[styles.categoryBadgeText, { color: "#FF6F00", marginLeft: 4 }]}>
              {scale.type === "cat_scale"
                ? "CAT Scale"
                : scale.type === "public_weigh_station"
                ? "Public Weigh Station"
                : "Truck Stop Scale"}
            </Text>
          </View>
          <View style={styles.directionsButton}>
            <MaterialIcons name="directions" size={20} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
          {scale.name}
        </Text>
        <Text style={[styles.cardLocation, { color: colors.muted }]}>
          {scale.city}, {STATE_NAMES[scale.state] || scale.state}
        </Text>

        <View style={styles.scaleDetails}>
          <View style={styles.scaleDetailRow}>
            <MaterialIcons name="attach-money" size={16} color={colors.primary} />
            <Text style={[styles.scaleDetailText, { color: colors.primary, fontWeight: "700" }]}>
              {scale.cost}
            </Text>
          </View>
          <View style={styles.scaleDetailRow}>
            <MaterialIcons name="access-time" size={16} color={colors.muted} />
            <Text style={[styles.scaleDetailText, { color: colors.foreground }]}>{scale.hours}</Text>
          </View>
          {scale.hasCertified && (
            <View style={styles.scaleDetailRow}>
              <MaterialIcons name="verified" size={16} color={colors.success} />
              <Text style={[styles.scaleDetailText, { color: colors.success }]}>Certified Scale</Text>
            </View>
          )}
        </View>

        <View style={styles.tapHint}>
          <MaterialIcons name="open-in-new" size={12} color={colors.muted} />
          <Text style={[styles.tapHintText, { color: colors.muted }]}>Tap to open in Maps</Text>
        </View>
      </Pressable>
    ),
    [colors, handleOpenScale]
  );

  // State picker modal overlay
  const renderStatePicker = () => {
    if (!showStatePicker) return null;
    return (
      <View style={[styles.statePickerOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.statePickerContainer, { backgroundColor: colors.background }]}>
          <View style={styles.statePickerHeader}>
            <Text style={[styles.statePickerTitle, { color: colors.foreground }]}>Select State / Province</Text>
            <Pressable
              onPress={() => setShowStatePicker(false)}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>

          {/* All States option */}
          <Pressable
            onPress={() => handleStateSelect(null)}
            style={({ pressed }) => [
              styles.statePickerItem,
              { borderBottomColor: colors.border },
              !selectedState && { backgroundColor: colors.primary + "15" },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.statePickerItemText,
                { color: !selectedState ? colors.primary : colors.foreground, fontWeight: !selectedState ? "700" : "500" },
              ]}
            >
              All States
            </Text>
            <Text style={[styles.statePickerItemCount, { color: colors.muted }]}>
              {allSites.length} sites
            </Text>
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* United States */}
            <View style={[styles.sectionHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionHeaderFlag]}>🇺🇸</Text>
              <Text style={[styles.sectionHeaderText, { color: colors.foreground }]}>United States</Text>
            </View>
            {usStates.map((item) => {
              const isSelected = selectedState === item.code;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => handleStateSelect(item.code)}
                  style={({ pressed }) => [
                    styles.statePickerItem,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: colors.primary + "15" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.statePickerItemText,
                      { color: isSelected ? colors.primary : colors.foreground, fontWeight: isSelected ? "700" : "500" },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.statePickerItemCount, { color: colors.muted }]}>
                    {item.count} sites
                  </Text>
                </Pressable>
              );
            })}

            {/* Canada */}
            <View style={[styles.sectionHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionHeaderFlag]}>🇨🇦</Text>
              <Text style={[styles.sectionHeaderText, { color: colors.foreground }]}>Canada</Text>
            </View>
            {canadaProvinces.map((item) => {
              const isSelected = selectedState === item.code;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => handleStateSelect(item.code)}
                  style={({ pressed }) => [
                    styles.statePickerItem,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: colors.primary + "15" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.statePickerItemText,
                      { color: isSelected ? colors.primary : colors.foreground, fontWeight: isSelected ? "700" : "500" },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.statePickerItemCount, { color: colors.muted }]}>
                    {item.count} sites
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>RV Nomad</Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          Find campgrounds, RV parks & more
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={22} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search campgrounds, parks, scales..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t);
              setShowSearchHistory(t.length === 0);
            }}
            onFocus={() => {
              if (searchQuery.length === 0 && searchHistory.length > 0) setShowSearchHistory(true);
            }}
            returnKeyType="search"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              if (searchQuery.trim().length > 1) {
                import("@/lib/store").then(({ Store: S }) => {
                  S.addSearchTerm(searchQuery.trim()).then(setSearchHistory);
                });
              }
              setShowSearchHistory(false);
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={({ pressed }) => [styles.clearButton, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Search History */}
        {showSearchHistory && searchHistory.length > 0 && (
          <View style={[styles.searchHistoryContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted }}>Recent Searches</Text>
              <TouchableOpacity onPress={() => {
                import("@/lib/store").then(({ Store: S }) => {
                  S.clearSearchHistory().then(() => {
                    setSearchHistory([]);
                    setShowSearchHistory(false);
                  });
                });
              }}>
                <Text style={{ fontSize: 11, color: colors.primary }}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {searchHistory.map((term, i) => (
                <TouchableOpacity
                  key={`${term}-${i}`}
                  style={[styles.searchHistoryChip, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}
                  onPress={() => {
                    setSearchQuery(term);
                    setShowSearchHistory(false);
                    Keyboard.dismiss();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="history" size={14} color={colors.primary} />
                  <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 4 }}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* State Selector + Near Me */}
        <View style={styles.locationRow}>
          <Pressable
            onPress={() => setShowStatePicker(true)}
            style={({ pressed }) => [
              styles.stateSelector,
              { flex: 1, backgroundColor: selectedState ? colors.primary + "15" : colors.surface, borderColor: selectedState ? colors.primary : colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons name="location-on" size={18} color={selectedState ? colors.primary : colors.muted} />
            <Text
              style={[
                styles.stateSelectorText,
                { color: selectedState ? colors.primary : colors.muted, fontWeight: selectedState ? "700" : "500" },
              ]}
            >
              {selectedState ? STATE_NAMES[selectedState] : "All States"}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color={selectedState ? colors.primary : colors.muted} />
            {selectedState && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleStateSelect(null);
                }}
                style={({ pressed }) => [styles.stateClearBtn, pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="close" size={16} color={colors.muted} />
              </Pressable>
            )}
          </Pressable>

          {/* ADA Filter Button */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAdaOnly(!adaOnly);
            }}
            style={({ pressed }) => [
              styles.nearMeBtn,
              {
                backgroundColor: adaOnly ? "#1565C0" : colors.surface,
                borderColor: adaOnly ? "#1565C0" : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons name="accessible" size={18} color={adaOnly ? "#FFF" : "#1565C0"} />
            <Text style={[styles.nearMeBtnText, { color: adaOnly ? "#FFF" : "#1565C0" }]}>
              ADA
            </Text>
          </Pressable>

          {/* Near Me Button */}
          <Pressable
            onPress={async () => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (sortByDistance) {
                setSortByDistance(false);
              } else {
                const loc = await requestLocation();
                if (loc) setSortByDistance(true);
              }
            }}
            style={({ pressed }) => [
              styles.nearMeBtn,
              {
                backgroundColor: sortByDistance ? colors.primary : colors.surface,
                borderColor: sortByDistance ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            {locationLoading ? (
              <Text style={[styles.nearMeBtnText, { color: colors.muted }]}>...</Text>
            ) : (
              <>
                <MaterialIcons name="my-location" size={18} color={sortByDistance ? "#FFF" : colors.primary} />
                <Text style={[styles.nearMeBtnText, { color: sortByDistance ? "#FFF" : colors.primary }]}>
                  Near Me
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          style={styles.filterScroll}
          renderItem={({ item, index }) => {
            const isActive = selectedFilter === item.key;
            const prevGroup = index > 0 ? FILTER_OPTIONS[index - 1].group : "";
            const showGroupLabel = item.group !== "" && item.group !== prevGroup;
            return (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {showGroupLabel && (
                  <Text style={[styles.filterGroupLabel, { color: colors.muted }]}>
                    {item.group}
                  </Text>
                )}
                <Pressable
                  onPress={() => handleFilterPress(item.key)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.filterChipText, { color: isActive ? "#FFFFFF" : colors.foreground }]}>
                    {item.label}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>

      {/* State Laws Banner */}
      {currentLaws && (
        <Pressable
          onPress={() => setShowLaws(!showLaws)}
          style={({ pressed }) => [
            styles.lawsBanner,
            { backgroundColor: colors.warning + "12", borderColor: colors.warning + "40" },
            pressed && { opacity: 0.8 },
          ]}
        >
          <MaterialIcons name="gavel" size={18} color={colors.warning} />
          <Text style={[styles.lawsBannerText, { color: colors.warning }]}>
            {showLaws ? "Hide" : "View"} {STATE_NAMES[selectedState!]} RV Laws & Boondocking Rules
          </Text>
          <MaterialIcons name={showLaws ? "expand-less" : "expand-more"} size={20} color={colors.warning} />
        </Pressable>
      )}

      {/* State Laws Panel */}
      {showLaws && currentLaws && (
        <ScrollView
          style={[styles.lawsPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}
          nestedScrollEnabled
        >
          <View style={styles.lawsContent}>
            <LawRow icon="local-parking" label="Overnight Parking" value={currentLaws.overnightParking} colors={colors} />
            <LawRow icon="terrain" label="Boondocking" value={currentLaws.boondockingLegality} colors={colors} />
            <LawRow icon="store" label="Walmart Parking" value={currentLaws.walmartParking} colors={colors} />
            <LawRow icon="straighten" label="Max RV Length" value={currentLaws.maxRVLength} colors={colors} />
            <LawRow icon="height" label="Max RV Height" value={currentLaws.maxRVHeight} colors={colors} />
            <LawRow icon="fitness-center" label="Max RV Weight" value={currentLaws.maxRVWeight} colors={colors} />
            <LawRow icon="local-gas-station" label="Propane/Tunnels" value={currentLaws.propaneTunnels} colors={colors} />
            <LawRow icon="speed" label="Speed Limits" value={currentLaws.speedLimits} colors={colors} />
            {currentLaws.specialNotes ? (
              <View style={[styles.lawNotes, { borderTopColor: colors.border }]}>
                <MaterialIcons name="info-outline" size={14} color={colors.muted} />
                <Text style={[styles.lawNotesText, { color: colors.muted }]}>{currentLaws.specialNotes}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      {/* Results count */}
      <View style={[styles.resultsBar, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultsText, { color: colors.muted }]}>
          {listData.length} {listData.length === 1 ? "result" : "results"}
          {selectedState ? ` in ${STATE_NAMES[selectedState]}` : ""}
          {searchQuery ? ` for "${searchQuery}"` : ""}
        </Text>
      </View>

      {/* Site List */}
      {!dataLoaded ? (
        <View style={styles.loadingState}>
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading campgrounds...</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) =>
            item.type === "site" ? `site-${item.data.id}` : `scale-${item.data.id}`
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          renderItem={({ item }) =>
            item.type === "site" ? renderSiteCard(item.data) : renderScaleCard(item.data)
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                Try a different search, filter, or state
              </Text>
            </View>
          }
        />
      )}

      {/* State Picker Overlay */}
      {renderStatePicker()}
    </View>
  );
}

function LawRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.lawRow}>
      <View style={styles.lawLabelRow}>
        <MaterialIcons name={icon as any} size={16} color={colors.primary} />
        <Text style={[styles.lawLabel, { color: colors.foreground }]}>{label}</Text>
      </View>
      <Text style={[styles.lawValue, { color: colors.muted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 2, marginBottom: 12 },
  // Search
  searchContainer: {
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: 44 },
  clearButton: { padding: 4 },
  // State selector
  stateSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  stateSelectorText: { flex: 1, fontSize: 14 },
  stateClearBtn: { padding: 2 },
  // Filters
  filterScroll: { flexGrow: 0 },
  filterList: { gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: "600" },
  // Laws banner
  lawsBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  lawsBannerText: { flex: 1, fontSize: 14, fontWeight: "600" },
  // Laws panel
  lawsPanel: {
    marginHorizontal: 16,
    marginTop: 8,
    maxHeight: 300,
    borderRadius: 12,
    borderWidth: 1,
  },
  lawsContent: { padding: 14 },
  lawRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.15)",
  },
  lawLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  lawLabel: { fontSize: 14, fontWeight: "600" },
  lawValue: { fontSize: 13, lineHeight: 19, paddingLeft: 24 },
  lawNotes: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
  },
  lawNotesText: { fontSize: 12, fontStyle: "italic", lineHeight: 18, flex: 1 },
  // Results bar
  resultsBar: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 13, fontWeight: "500" },
  // List
  listContent: { paddingHorizontal: 16, gap: 12 },
  // Card
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" as any },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: "700" },
  directionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  cardLocation: { fontSize: 13, marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  starsRow: { flexDirection: "row" },
  ratingText: { fontSize: 13 },
  cardDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: { fontSize: 18, fontWeight: "700" },
  amenitiesRow: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  amenityChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  amenityText: { fontSize: 11, fontWeight: "500" },
  moreText: { fontSize: 12, fontWeight: "600" },
  // Scale details
  scaleDetails: { gap: 6, marginTop: 4 },
  scaleDetailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scaleDetailText: { fontSize: 14 },
  // Tap hint
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  tapHintText: { fontSize: 12 },
  // Empty/Loading
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  loadingText: { fontSize: 16 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 14 },
  // State picker overlay
  statePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  statePickerContainer: {
    width: "85%",
    maxHeight: "70%",
    borderRadius: 16,
    overflow: "hidden",
  },
  statePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statePickerTitle: { fontSize: 20, fontWeight: "700" },
  statePickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statePickerItemText: { fontSize: 16 },
  statePickerItemCount: { fontSize: 13 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderFlag: { fontSize: 20 },
  sectionHeaderText: { fontSize: 15, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  filterGroupLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 10, marginRight: 4 },
  cardImage: { width: "100%" as any, height: 160 },
  cardBody: { padding: 12, gap: 4 },
  militaryNotice: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  militaryNoticeText: { fontSize: 12, fontWeight: "600" },
  // Near Me
  locationRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  nearMeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  nearMeBtnText: { fontSize: 13, fontWeight: "700" },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceText: { fontSize: 11, fontWeight: "600" },
  searchHistoryContainer: { marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchHistoryChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
});
