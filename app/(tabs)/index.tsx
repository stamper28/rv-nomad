import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
  Dimensions,
  FlatList,
  Keyboard,
} from "react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  MapViewWrapper,
  MarkerWrapper,
} from "@/components/map-view-wrapper";
import {
  CAMPGROUNDS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Campground,
  type CampgroundCategory,
} from "@/lib/campground-data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const FILTER_OPTIONS: { key: CampgroundCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "rv_park", label: "RV Parks" },
  { key: "national_park", label: "National Parks" },
  { key: "state_park", label: "State Parks" },
  { key: "free_camping", label: "Free Camping" },
  { key: "rest_area", label: "Rest Areas" },
];

const US_CENTER = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const [selectedFilter, setSelectedFilter] = useState<
    CampgroundCategory | "all"
  >("all");
  const [selectedCampground, setSelectedCampground] =
    useState<Campground | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Campground[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch {
          // Location unavailable
        }
      }
    })();
  }, []);

  const filteredCampgrounds =
    selectedFilter === "all"
      ? CAMPGROUNDS
      : CAMPGROUNDS.filter((c) => c.category === selectedFilter);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length > 1) {
      const lower = text.toLowerCase();
      const results = CAMPGROUNDS.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, []);

  const handleSelectSearchResult = useCallback((campground: Campground) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    setSelectedCampground(campground);
    Keyboard.dismiss();
    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: campground.latitude,
          longitude: campground.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        },
        800
      );
    }
  }, []);

  const handleMarkerPress = useCallback((campground: Campground) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCampground(campground);
  }, []);

  const handleLocateMe = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 2,
          longitudeDelta: 2,
        },
        800
      );
    }
  }, [userLocation]);

  const handleFilterPress = useCallback(
    (key: CampgroundCategory | "all") => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSelectedFilter(key);
      setSelectedCampground(null);
    },
    []
  );

  const handleMapPress = useCallback(() => {
    setSelectedCampground(null);
    setShowSearch(false);
    Keyboard.dismiss();
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

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapViewWrapper
        ref={mapRef}
        style={styles.map}
        initialRegion={US_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={handleMapPress}
      >
        {filteredCampgrounds.map((campground) => (
          <MarkerWrapper
            key={campground.id}
            coordinate={{
              latitude: campground.latitude,
              longitude: campground.longitude,
            }}
            title={campground.name}
            description={CATEGORY_LABELS[campground.category]}
            pinColor={CATEGORY_COLORS[campground.category]}
            onPress={() => handleMarkerPress(campground)}
          />
        ))}
      </MapViewWrapper>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { top: insets.top + 8, backgroundColor: colors.surface },
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
          placeholder="Search campgrounds..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => {
              setSearchQuery("");
              setSearchResults([]);
              setShowSearch(false);
            }}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && { opacity: 0.6 },
            ]}
          >
            <MaterialIcons name="close" size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Search Results Dropdown */}
      {showSearch && searchResults.length > 0 && (
        <View
          style={[
            styles.searchDropdown,
            {
              top: insets.top + 60,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <FlatList
            data={searchResults.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectSearchResult(item)}
                style={({ pressed }) => [
                  styles.searchResultItem,
                  { borderBottomColor: colors.border },
                  pressed && { backgroundColor: colors.background },
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: CATEGORY_COLORS[item.category] },
                  ]}
                />
                <View style={styles.searchResultText}>
                  <Text
                    style={[
                      styles.searchResultName,
                      { color: colors.foreground },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.searchResultCategory,
                      { color: colors.muted },
                    ]}
                  >
                    {CATEGORY_LABELS[item.category]}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Filter Chips */}
      <View
        style={[
          styles.filterContainer,
          {
            top:
              insets.top +
              60 +
              (showSearch && searchResults.length > 0 ? 200 : 0),
          },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
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

      {/* Locate Me Button — only on native */}
      {Platform.OS !== "web" && (
        <Pressable
          onPress={handleLocateMe}
          style={({ pressed }) => [
            styles.locateButton,
            {
              bottom: selectedCampground ? 230 : 24,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
          ]}
        >
          <MaterialIcons
            name="my-location"
            size={24}
            color={colors.primary}
          />
        </Pressable>
      )}

      {/* Campground Preview Card */}
      {selectedCampground && (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.previewHeader}>
            <View style={styles.previewTitleRow}>
              <View
                style={[
                  styles.previewCategoryBadge,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[selectedCampground.category] + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewCategoryText,
                    {
                      color: CATEGORY_COLORS[selectedCampground.category],
                    },
                  ]}
                >
                  {CATEGORY_LABELS[selectedCampground.category]}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedCampground(null)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons
                  name="close"
                  size={22}
                  color={colors.muted}
                />
              </Pressable>
            </View>
            <Text
              style={[styles.previewName, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {selectedCampground.name}
            </Text>
            <View style={styles.previewRatingRow}>
              <View style={styles.starsRow}>
                {renderStars(selectedCampground.rating)}
              </View>
              <Text style={[styles.previewRating, { color: colors.muted }]}>
                {selectedCampground.rating.toFixed(1)} (
                {selectedCampground.reviewCount})
              </Text>
            </View>
          </View>

          <Text
            style={[styles.previewDescription, { color: colors.muted }]}
            numberOfLines={2}
          >
            {selectedCampground.description}
          </Text>

          <View style={styles.previewFooter}>
            <Text style={[styles.previewPrice, { color: colors.primary }]}>
              {selectedCampground.pricePerNight
                ? `$${selectedCampground.pricePerNight}/night`
                : "Free"}
            </Text>
            <View style={styles.previewAmenities}>
              {selectedCampground.amenities.slice(0, 3).map((a, i) => (
                <View
                  key={i}
                  style={[
                    styles.amenityChip,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text
                    style={[styles.amenityText, { color: colors.muted }]}
                  >
                    {a}
                  </Text>
                </View>
              ))}
              {selectedCampground.amenities.length > 3 && (
                <Text
                  style={[styles.moreAmenities, { color: colors.muted }]}
                >
                  +{selectedCampground.amenities.length - 3}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Search
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 48,
  },
  clearButton: {
    padding: 4,
  },
  // Search Dropdown
  searchDropdown: {
    position: "absolute",
    left: 16,
    right: 16,
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: "600",
  },
  searchResultCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  // Filters
  filterContainer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Locate Me
  locateButton: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  // Preview Card
  previewCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  previewHeader: {
    marginBottom: 8,
  },
  previewTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  previewCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewCategoryText: {
    fontSize: 12,
    fontWeight: "700",
  },
  previewName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  previewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  starsRow: {
    flexDirection: "row",
  },
  previewRating: {
    fontSize: 13,
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: "700",
  },
  previewAmenities: {
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
  moreAmenities: {
    fontSize: 12,
    fontWeight: "600",
  },
});
