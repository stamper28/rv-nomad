import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  CAMPGROUNDS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Campground,
  type CampgroundCategory,
} from "@/lib/campground-data";

const CATEGORIES: { key: CampgroundCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "rv_park", label: "RV Parks" },
  { key: "national_park", label: "National Parks" },
  { key: "state_park", label: "State Parks" },
  { key: "free_camping", label: "Free" },
  { key: "rest_area", label: "Rest Areas" },
];

function StarRating({ rating }: { rating: number }) {
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
  return <View style={styles.starsRow}>{stars}</View>;
}

export default function ExploreScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CampgroundCategory | "all"
  >("all");

  const filteredCampgrounds = useMemo(() => {
    let results = CAMPGROUNDS;
    if (selectedCategory !== "all") {
      results = results.filter((c) => c.category === selectedCategory);
    }
    if (searchQuery.length > 1) {
      const lower = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }
    return results;
  }, [selectedCategory, searchQuery]);

  const handleCategoryPress = useCallback(
    (key: CampgroundCategory | "all") => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSelectedCategory(key);
    },
    []
  );

  const renderAmenityIcons = (amenities: string[]) => {
    const iconMap: Record<string, string> = {
      "Full Hookups": "electrical-services",
      WiFi: "wifi",
      Pool: "pool",
      Laundry: "local-laundry-service",
      Showers: "shower",
      Restrooms: "wc",
      Water: "water-drop",
      "Dump Station": "delete",
      "Campfire Ring": "local-fire-department",
      "Hiking Trails": "hiking",
      "Beach Access": "beach-access",
      Store: "store",
      Restaurant: "restaurant",
      Playground: "child-care",
      Activities: "sports-tennis",
      "Visitor Center": "info",
      "Bear Lockers": "lock",
      "Picnic Tables": "deck",
      "Pet Area": "pets",
      Vending: "local-drink",
    };

    return amenities.slice(0, 5).map((a, i) => {
      const iconName = iconMap[a] || "check-circle";
      return (
        <MaterialIcons
          key={i}
          name={iconName as any}
          size={16}
          color={colors.muted}
          style={styles.amenityIcon}
        />
      );
    });
  };

  const renderCampground = useCallback(
    ({ item }: { item: Campground }) => (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          pressed && { opacity: 0.7 },
        ]}
      >
        {/* Color strip */}
        <View
          style={[
            styles.cardStrip,
            { backgroundColor: CATEGORY_COLORS[item.category] },
          ]}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleArea}>
              <Text
                style={[styles.cardName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[item.category] + "18",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    { color: CATEGORY_COLORS[item.category] },
                  ]}
                >
                  {CATEGORY_LABELS[item.category]}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardPrice, { color: colors.primary }]}>
              {item.pricePerNight ? `$${item.pricePerNight}` : "Free"}
              {item.pricePerNight ? (
                <Text style={[styles.cardPriceUnit, { color: colors.muted }]}>
                  /night
                </Text>
              ) : null}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <StarRating rating={item.rating} />
            <Text style={[styles.ratingText, { color: colors.muted }]}>
              {item.rating.toFixed(1)} ({item.reviewCount} reviews)
            </Text>
          </View>

          <Text
            style={[styles.cardDescription, { color: colors.muted }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <View style={styles.amenitiesRow}>
            {renderAmenityIcons(item.amenities)}
            {item.amenities.length > 5 && (
              <Text style={[styles.moreText, { color: colors.muted }]}>
                +{item.amenities.length - 5} more
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    ),
    [colors]
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Explore
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Discover campgrounds across the US
        </Text>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search by name or description..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="close" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.chipList}
        style={styles.chipContainer}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item.key;
          return (
            <Pressable
              onPress={() => handleCategoryPress(item.key)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? "#FFFFFF" : colors.foreground },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.muted }]}>
          {filteredCampgrounds.length} campground
          {filteredCampgrounds.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {/* Campground List */}
      <FlatList
        data={filteredCampgrounds}
        keyExtractor={(item) => item.id}
        renderItem={renderCampground}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No campgrounds found
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  // Search
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 44,
  },
  // Chips
  chipContainer: {
    marginTop: 12,
    maxHeight: 40,
  },
  chipList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Results
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "500",
  },
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  // Card
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  cardStrip: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleArea: {
    flex: 1,
    marginRight: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardPriceUnit: {
    fontSize: 12,
    fontWeight: "400",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  starsRow: {
    flexDirection: "row",
  },
  ratingText: {
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  amenitiesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  amenityIcon: {
    marginRight: 2,
  },
  moreText: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
