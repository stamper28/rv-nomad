import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FilterKey = CampgroundCategory | "all" | "weight_scale" | "dump_station";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "rv_park", label: "RV Parks" },
  { key: "national_park", label: "National Parks" },
  { key: "state_park", label: "State Parks" },
  { key: "free_camping", label: "Free Camping" },
  { key: "dump_station", label: "Dump Stations" },
  { key: "weight_scale", label: "Weight Scales" },
  { key: "rest_area", label: "Rest Areas" },
];

const US_CENTER = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

// Max markers to render at once to avoid native performance issues
const MAX_MARKERS = 30;

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [selectedCampground, setSelectedCampground] =
    useState<Campground | null>(null);
  const [selectedScale, setSelectedScale] = useState<WeightScale | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Campground[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapRegion, setMapRegion] = useState(US_CENTER);
  const [weightScales, setWeightScales] = useState<WeightScale[]>([]);
  const [loadingScales, setLoadingScales] = useState(false);

  // Lazy load location - wrapped in try/catch to prevent crash
  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    const getLocation = async () => {
      try {
        const Location = await import("expo-location");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted" && !cancelled) {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            if (!cancelled) {
              setUserLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
          } catch {
            // Location unavailable
          }
        }
      } catch {
        // expo-location not available
      }
    };
    getLocation();
    return () => { cancelled = true; };
  }, []);

  // Lazy load weight scales only when filter is selected
  useEffect(() => {
    if (
      (selectedFilter === "all" || selectedFilter === "weight_scale") &&
      weightScales.length === 0
    ) {
      setLoadingScales(true);
      import("@/lib/weight-scale-data").then((mod) => {
        setWeightScales(mod.WEIGHT_SCALES);
        setLoadingScales(false);
      }).catch(() => setLoadingScales(false));
    }
  }, [selectedFilter, weightScales.length]);

  // Filter campgrounds and limit markers for performance
  const filteredCampgrounds = useMemo(() => {
    let filtered: Campground[];
    if (selectedFilter === "all") {
      filtered = CAMPGROUNDS;
    } else if (selectedFilter === "weight_scale" || selectedFilter === "dump_station") {
      filtered = selectedFilter === "dump_station"
        ? CAMPGROUNDS.filter((c) => c.category === "dump_station" as any)
        : [];
    } else {
      filtered = CAMPGROUNDS.filter((c) => c.category === selectedFilter);
    }

    // If zoomed out (large delta), limit markers to prevent performance issues
    if (mapRegion.latitudeDelta > 20) {
      return filtered.slice(0, MAX_MARKERS);
    }

    // Filter to visible region with some padding
    const padding = mapRegion.latitudeDelta * 0.2;
    const minLat = mapRegion.latitude - mapRegion.latitudeDelta / 2 - padding;
    const maxLat = mapRegion.latitude + mapRegion.latitudeDelta / 2 + padding;
    const minLng = mapRegion.longitude - mapRegion.longitudeDelta / 2 - padding;
    const maxLng = mapRegion.longitude + mapRegion.longitudeDelta / 2 + padding;

    const visible = filtered.filter(
      (c) =>
        c.latitude >= minLat &&
        c.latitude <= maxLat &&
        c.longitude >= minLng &&
        c.longitude <= maxLng
    );

    return visible.slice(0, MAX_MARKERS);
  }, [selectedFilter, mapRegion]);

  // Filter weight scales to visible region
  const visibleScales = useMemo(() => {
    if (selectedFilter !== "all" && selectedFilter !== "weight_scale") return [];
    if (weightScales.length === 0) return [];

    if (mapRegion.latitudeDelta > 20) {
      return weightScales.slice(0, 15);
    }

    const padding = mapRegion.latitudeDelta * 0.2;
    const minLat = mapRegion.latitude - mapRegion.latitudeDelta / 2 - padding;
    const maxLat = mapRegion.latitude + mapRegion.latitudeDelta / 2 + padding;
    const minLng = mapRegion.longitude - mapRegion.longitudeDelta / 2 - padding;
    const maxLng = mapRegion.longitude + mapRegion.longitudeDelta / 2 + padding;

    return weightScales
      .filter(
        (s) =>
          s.latitude >= minLat &&
          s.latitude <= maxLat &&
          s.longitude >= minLng &&
          s.longitude <= maxLng
      )
      .slice(0, 15);
  }, [selectedFilter, weightScales, mapRegion]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length > 1) {
      const lower = text.toLowerCase();
      const results = CAMPGROUNDS.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      ).slice(0, 5);
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
    setSelectedScale(null);
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
    (key: FilterKey) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSelectedFilter(key);
      setSelectedCampground(null);
      setSelectedScale(null);
    },
    []
  );

  const handleScalePress = useCallback((scale: WeightScale) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedScale(scale);
    setSelectedCampground(null);
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedCampground(null);
    setSelectedScale(null);
    setShowSearch(false);
    Keyboard.dismiss();
  }, []);

  const handleRegionChangeComplete = useCallback((region: any) => {
    setMapRegion(region);
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

  // Web fallback
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.webFallback}>
          <MaterialIcons name="map" size={64} color={colors.primary} />
          <Text style={[styles.webTitle, { color: colors.foreground }]}>
            Interactive Map
          </Text>
          <Text style={[styles.webSubtitle, { color: colors.muted }]}>
            The interactive map with campground markers{"\n"}
            is available on iOS and Android.{"\n\n"}
            Scan the QR code with Expo Go to preview.
          </Text>
        </View>

        {/* Filter Chips on web */}
        <View style={[styles.filterContainer, { top: insets.top + 60 }]}>
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
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    );
  }

  // Import map components - on native, Metro resolves .native.tsx automatically
  const { MapViewWrapper: NativeMapView, MarkerWrapper: NativeMarker } =
    require("@/components/map-view-wrapper");

  return (
    <View style={styles.container}>
      {/* Map */}
      <NativeMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={US_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={handleMapPress}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {mapReady &&
          filteredCampgrounds.map((campground) => (
            <NativeMarker
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
        {mapReady &&
          visibleScales.map((scale) => (
            <NativeMarker
              key={scale.id}
              coordinate={{
                latitude: scale.latitude,
                longitude: scale.longitude,
              }}
              title={scale.name}
              description={`${scale.type === "cat_scale" ? "CAT Scale" : scale.type === "public_weigh_station" ? "Public Weigh Station" : "Truck Stop Scale"} • ${scale.cost}`}
              pinColor="#FF6F00"
              onPress={() => handleScalePress(scale)}
            />
          ))}
      </NativeMapView>

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

      {/* Locate Me Button */}
      <Pressable
        onPress={handleLocateMe}
        style={({ pressed }) => [
          styles.locateButton,
          {
            bottom: selectedCampground || selectedScale ? 230 : 24,
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

      {/* Weight Scale Preview Card */}
      {selectedScale && !selectedCampground && (
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
                  { backgroundColor: "#FF6F0020" },
                ]}
              >
                <MaterialIcons name="scale" size={12} color="#FF6F00" />
                <Text style={[styles.previewCategoryText, { color: "#FF6F00", marginLeft: 4 }]}>
                  {selectedScale.type === "cat_scale" ? "CAT Scale" : selectedScale.type === "public_weigh_station" ? "Public Weigh Station" : "Truck Stop Scale"}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedScale(null)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={[styles.previewName, { color: colors.foreground }]} numberOfLines={1}>
              {selectedScale.name}
            </Text>
            <Text style={[{ fontSize: 13, color: colors.muted, marginTop: 2 }]}>
              {selectedScale.city}, {selectedScale.state}
            </Text>
          </View>

          <View style={styles.previewFooter}>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialIcons name="attach-money" size={16} color={colors.primary} />
                <Text style={[{ fontSize: 14, fontWeight: "700", color: colors.primary }]}>{selectedScale.cost}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialIcons name="access-time" size={16} color={colors.muted} />
                <Text style={[{ fontSize: 13, color: colors.foreground }]}>{selectedScale.hours}</Text>
              </View>
              {selectedScale.hasCertified && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <MaterialIcons name="verified" size={16} color={colors.success} />
                  <Text style={[{ fontSize: 13, color: colors.success }]}>Certified Scale</Text>
                </View>
              )}
            </View>
            <View style={{ gap: 4 }}>
              <Text style={[{ fontSize: 12, color: colors.muted }]} numberOfLines={2}>{selectedScale.address}</Text>
              {selectedScale.notes && (
                <Text style={[{ fontSize: 12, color: colors.warning, fontStyle: "italic" }]} numberOfLines={2}>{selectedScale.notes}</Text>
              )}
            </View>
          </View>
        </View>
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
  // Web fallback
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  webSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
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
    flexDirection: "row",
    alignItems: "center",
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
