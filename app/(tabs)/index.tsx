import React, { useState, useCallback, useMemo } from "react";
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
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  CAMPGROUNDS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Campground,
  type CampgroundCategory,
} from "@/lib/campground-data";
import { type WeightScale } from "@/lib/types";
import { useEffect } from "react";

type FilterKey = CampgroundCategory | "all" | "weight_scale" | "dump_station";

const FILTER_OPTIONS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "explore" },
  { key: "rv_park", label: "RV Parks", icon: "local-parking" },
  { key: "national_park", label: "National Parks", icon: "park" },
  { key: "state_park", label: "State Parks", icon: "nature" },
  { key: "free_camping", label: "Free Camping", icon: "camping" },
  { key: "dump_station", label: "Dump Stations", icon: "delete" },
  { key: "weight_scale", label: "Weight Scales", icon: "scale" },
  { key: "rest_area", label: "Rest Areas", icon: "local-hotel" },
];

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
      // Fallback to Google Maps web
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodedName}`
      );
    }
  });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [weightScales, setWeightScales] = useState<WeightScale[]>([]);
  const [loadingScales, setLoadingScales] = useState(false);

  // Lazy load weight scales only when filter is selected
  useEffect(() => {
    if (
      (selectedFilter === "all" || selectedFilter === "weight_scale") &&
      weightScales.length === 0
    ) {
      setLoadingScales(true);
      import("@/lib/weight-scale-data")
        .then((mod) => {
          setWeightScales(mod.WEIGHT_SCALES);
          setLoadingScales(false);
        })
        .catch(() => setLoadingScales(false));
    }
  }, [selectedFilter, weightScales.length]);

  // Filter campgrounds
  const filteredCampgrounds = useMemo(() => {
    let filtered: Campground[];
    if (selectedFilter === "all") {
      filtered = CAMPGROUNDS;
    } else if (
      selectedFilter === "weight_scale" ||
      selectedFilter === "dump_station"
    ) {
      filtered =
        selectedFilter === "dump_station"
          ? CAMPGROUNDS.filter((c) => c.category === ("dump_station" as any))
          : [];
    } else {
      filtered = CAMPGROUNDS.filter((c) => c.category === selectedFilter);
    }

    if (searchQuery.length > 1) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [selectedFilter, searchQuery]);

  // Filter weight scales
  const filteredScales = useMemo(() => {
    if (selectedFilter !== "all" && selectedFilter !== "weight_scale") return [];
    if (weightScales.length === 0) return [];

    if (searchQuery.length > 1) {
      const lower = searchQuery.toLowerCase();
      return weightScales.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.city.toLowerCase().includes(lower) ||
          s.state.toLowerCase().includes(lower)
      );
    }

    return weightScales;
  }, [selectedFilter, weightScales, searchQuery]);

  const handleFilterPress = useCallback((key: FilterKey) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFilter(key);
  }, []);

  const handleOpenCampground = useCallback((campground: Campground) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    openInMaps(campground.name, campground.latitude, campground.longitude);
  }, []);

  const handleOpenScale = useCallback((scale: WeightScale) => {
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

  // Combined list data
  const listData = useMemo(() => {
    const items: Array<{ type: "campground" | "scale"; data: any }> = [];

    if (selectedFilter !== "weight_scale") {
      filteredCampgrounds.forEach((c) =>
        items.push({ type: "campground", data: c })
      );
    }

    if (
      selectedFilter === "all" ||
      selectedFilter === "weight_scale"
    ) {
      filteredScales.forEach((s) => items.push({ type: "scale", data: s }));
    }

    return items;
  }, [filteredCampgrounds, filteredScales, selectedFilter]);

  const renderCampgroundCard = useCallback(
    (campground: Campground) => (
      <Pressable
        onPress={() => handleOpenCampground(campground)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        {/* Category badge */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor:
                  CATEGORY_COLORS[campground.category] + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                { color: CATEGORY_COLORS[campground.category] },
              ]}
            >
              {CATEGORY_LABELS[campground.category]}
            </Text>
          </View>
          <View style={styles.directionsButton}>
            <MaterialIcons name="directions" size={20} color={colors.primary} />
          </View>
        </View>

        {/* Name */}
        <Text
          style={[styles.cardName, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {campground.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <View style={styles.starsRow}>{renderStars(campground.rating)}</View>
          <Text style={[styles.ratingText, { color: colors.muted }]}>
            {campground.rating.toFixed(1)} ({campground.reviewCount})
          </Text>
        </View>

        {/* Description */}
        <Text
          style={[styles.cardDescription, { color: colors.muted }]}
          numberOfLines={2}
        >
          {campground.description}
        </Text>

        {/* Footer: Price + Amenities */}
        <View style={styles.cardFooter}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {campground.pricePerNight
              ? `$${campground.pricePerNight}/night`
              : "Free"}
          </Text>
          <View style={styles.amenitiesRow}>
            {campground.amenities.slice(0, 3).map((a, i) => (
              <View
                key={i}
                style={[
                  styles.amenityChip,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.amenityText, { color: colors.muted }]}>
                  {a}
                </Text>
              </View>
            ))}
            {campground.amenities.length > 3 && (
              <Text style={[styles.moreText, { color: colors.muted }]}>
                +{campground.amenities.length - 3}
              </Text>
            )}
          </View>
        </View>

        {/* Tap hint */}
        <View style={styles.tapHint}>
          <MaterialIcons name="open-in-new" size={12} color={colors.muted} />
          <Text style={[styles.tapHintText, { color: colors.muted }]}>
            Tap to open in Maps
          </Text>
        </View>
      </Pressable>
    ),
    [colors, handleOpenCampground]
  );

  const renderScaleCard = useCallback(
    (scale: WeightScale) => (
      <Pressable
        onPress={() => handleOpenScale(scale)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.categoryBadge, { backgroundColor: "#FF6F0020" }]}
          >
            <MaterialIcons name="scale" size={12} color="#FF6F00" />
            <Text
              style={[
                styles.categoryBadgeText,
                { color: "#FF6F00", marginLeft: 4 },
              ]}
            >
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

        <Text
          style={[styles.cardName, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {scale.name}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
          {scale.city}, {scale.state}
        </Text>

        <View style={styles.scaleDetails}>
          <View style={styles.scaleDetailRow}>
            <MaterialIcons
              name="attach-money"
              size={16}
              color={colors.primary}
            />
            <Text
              style={[
                styles.scaleDetailText,
                { color: colors.primary, fontWeight: "700" },
              ]}
            >
              {scale.cost}
            </Text>
          </View>
          <View style={styles.scaleDetailRow}>
            <MaterialIcons
              name="access-time"
              size={16}
              color={colors.muted}
            />
            <Text style={[styles.scaleDetailText, { color: colors.foreground }]}>
              {scale.hours}
            </Text>
          </View>
          {scale.hasCertified && (
            <View style={styles.scaleDetailRow}>
              <MaterialIcons
                name="verified"
                size={16}
                color={colors.success}
              />
              <Text
                style={[styles.scaleDetailText, { color: colors.success }]}
              >
                Certified Scale
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tapHint}>
          <MaterialIcons name="open-in-new" size={12} color={colors.muted} />
          <Text style={[styles.tapHintText, { color: colors.muted }]}>
            Tap to open in Maps
          </Text>
        </View>
      </Pressable>
    ),
    [colors, handleOpenScale]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          RV Nomad
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          Find campgrounds, RV parks & more
        </Text>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <MaterialIcons
            name="search"
            size={22}
            color={colors.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search campgrounds, parks, scales..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          style={styles.filterScroll}
          renderItem={({ item }) => {
            const isActive = selectedFilter === item.key;
            return (
              <Pressable
                onPress={() => handleFilterPress(item.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isActive ? "#FFFFFF" : colors.foreground,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Results count */}
      <View style={[styles.resultsBar, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultsText, { color: colors.muted }]}>
          {listData.length} {listData.length === 1 ? "result" : "results"}
          {searchQuery ? ` for "${searchQuery}"` : ""}
        </Text>
      </View>

      {/* Campground List */}
      <FlatList
        data={listData}
        keyExtractor={(item) =>
          item.type === "campground" ? item.data.id : `scale-${item.data.id}`
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        renderItem={({ item }) =>
          item.type === "campground"
            ? renderCampgroundCard(item.data)
            : renderScaleCard(item.data)
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No results found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Try a different search or filter
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 12,
  },
  // Search
  searchContainer: {
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 44,
  },
  clearButton: {
    padding: 4,
  },
  // Filters
  filterScroll: {
    flexGrow: 0,
  },
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Results bar
  resultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: "500",
  },
  // List
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
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
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  directionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: "row",
  },
  ratingText: {
    fontSize: 13,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
  },
  amenitiesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  amenityChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: "500",
  },
  moreText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Scale details
  scaleDetails: {
    gap: 6,
    marginTop: 4,
  },
  scaleDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scaleDetailText: {
    fontSize: 14,
  },
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
  tapHintText: {
    fontSize: 12,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
  },
});
