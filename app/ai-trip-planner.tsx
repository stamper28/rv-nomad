/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import { Text, View, TextInput, ScrollView, Pressable, ActivityIndicator, StyleSheet, Platform, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ALL_SITES } from "@/lib/all-sites-data";
import { findNearbyRVParks } from "@/lib/nearby-rv-parks";
import type { CampSite } from "@/lib/types";

const TRUCK_STOP_CATS = new Set(["truck_stop", "fuel_station"]);

function findNearbyTruckStops(lat: number, lng: number, limit = 2, maxMiles = 50) {
  const R = 3959;
  const results: { site: CampSite; distanceMiles: number; directionsUrl: string }[] = [];
  for (const site of ALL_SITES) {
    if (!TRUCK_STOP_CATS.has(site.category)) continue;
    const dLat = ((site.latitude - lat) * Math.PI) / 180;
    const dLng = ((site.longitude - lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((site.latitude * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist <= maxMiles) {
      results.push({ site, distanceMiles: Math.round(dist * 10) / 10, directionsUrl: `https://www.google.com/maps/dir/${lat},${lng}/${site.latitude},${site.longitude}` });
    }
  }
  return results.sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, limit);
}

const INTERESTS = [
  "National Parks", "Beaches", "Mountains", "Fishing",
  "Hiking", "Photography", "Wine Country", "History",
  "Wildlife", "Hot Springs", "Stargazing", "Waterfalls",
];

const FORM_STORAGE_KEY = "rv_nomad_trip_planner_form";

type FormState = {
  startLocation: string;
  endLocation: string;
  duration: string;
  rvType: string;
  rvLength: string;
  budget: string;
  travelers: string;
  pets: boolean;
  selectedInterests: string[];
};

const DEFAULT_FORM: FormState = {
  startLocation: "",
  endLocation: "",
  duration: "7",
  rvType: "",
  rvLength: "",
  budget: "",
  travelers: "2",
  pets: false,
  selectedInterests: [],
};

const RV_TYPES = ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel", "Truck Camper", "Pop-Up", "Van"];
const BUDGETS = ["Budget ($50/day)", "Moderate ($100/day)", "Comfortable ($150/day)", "Premium ($200+/day)"];

type TripStop = {
  day: number;
  location: string;
  campground: string;
  campgroundType: string;
  pricePerNight: number;
  nights: number;
  drivingMiles: number;
  drivingTime: string;
  highlights: string[];
  notes: string;
};

type TripPlan = {
  tripName: string;
  totalMiles: number;
  estimatedFuelCost: number;
  estimatedCampingCost: number;
  estimatedFoodCost: number;
  totalEstimatedCost: number;
  stops: TripStop[];
  tips: string[];
  warnings: string[];
};

export default function AITripPlannerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [duration, setDuration] = useState("7");
  const [rvType, setRvType] = useState("");
  const [rvLength, setRvLength] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [pets, setPets] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [excludedCampgrounds, setExcludedCampgrounds] = useState<string[]>([]);
  const [excludedKeywords, setExcludedKeywords] = useState<string[]>([]);
  const [excludeSearch, setExcludeSearch] = useState("");
  const [showExcludeResults, setShowExcludeResults] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  // Load persisted form state on mount
  useEffect(() => {
    AsyncStorage.getItem(FORM_STORAGE_KEY).then(val => {
      if (val) {
        try {
          const saved: FormState = JSON.parse(val);
          if (saved.startLocation) setStartLocation(saved.startLocation);
          if (saved.endLocation) setEndLocation(saved.endLocation);
          if (saved.duration) setDuration(saved.duration);
          if (saved.rvType) setRvType(saved.rvType);
          if (saved.rvLength) setRvLength(saved.rvLength);
          if (saved.budget) setBudget(saved.budget);
          if (saved.travelers) setTravelers(saved.travelers);
          if (saved.pets !== undefined) setPets(saved.pets);
          if (saved.selectedInterests?.length) setSelectedInterests(saved.selectedInterests);
        } catch {}
      }
      setFormLoaded(true);
    }).catch(() => setFormLoaded(true));
  }, []);

  // Persist form state whenever any field changes (after initial load)
  useEffect(() => {
    if (!formLoaded) return;
    const formState: FormState = {
      startLocation, endLocation, duration, rvType, rvLength, budget, travelers, pets, selectedInterests,
    };
    AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formState)).catch(() => {});
  }, [formLoaded, startLocation, endLocation, duration, rvType, rvLength, budget, travelers, pets, selectedInterests]);

  // Clear all form fields
  const clearAllFields = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStartLocation("");
    setEndLocation("");
    setDuration("7");
    setRvType("");
    setRvLength("");
    setBudget("");
    setTravelers("2");
    setPets(false);
    setSelectedInterests([]);
    setExcludedCampgrounds([]);
    setExcludedKeywords([]);
    setExcludeSearch("");
    AsyncStorage.removeItem(FORM_STORAGE_KEY).catch(() => {});
    AsyncStorage.removeItem("rv_nomad_excluded_campgrounds").catch(() => {});
    AsyncStorage.removeItem("rv_nomad_excluded_keywords").catch(() => {});
  }, []);

  const COMMON_BRANDS = [
    "KOA", "Jellystone", "Thousand Trails", "Good Sam", "Harvest Hosts",
    "Encore", "Sun RV", "Yogi Bear", "Passport America", "Escapees",
    "Kampgrounds", "Carefree", "Leisure Systems", "Kampground",
  ];

  // Load persisted exclusion lists
  useEffect(() => {
    AsyncStorage.getItem("rv_nomad_excluded_campgrounds").then(val => {
      if (val) setExcludedCampgrounds(JSON.parse(val));
    }).catch(() => {});
    AsyncStorage.getItem("rv_nomad_excluded_keywords").then(val => {
      if (val) setExcludedKeywords(JSON.parse(val));
    }).catch(() => {});
  }, []);

  // Save exclusion lists when they change
  useEffect(() => {
    AsyncStorage.setItem("rv_nomad_excluded_campgrounds", JSON.stringify(excludedCampgrounds)).catch(() => {});
  }, [excludedCampgrounds]);
  useEffect(() => {
    AsyncStorage.setItem("rv_nomad_excluded_keywords", JSON.stringify(excludedKeywords)).catch(() => {});
  }, [excludedKeywords]);

  // Count how many campgrounds a keyword matches
  const keywordMatchCount = (keyword: string) =>
    ALL_SITES.filter(s => s.name.toLowerCase().includes(keyword.toLowerCase())).length;

  // Search results: show matching campgrounds AND suggest adding as keyword
  const excludeSearchResults = excludeSearch.trim().length >= 2
    ? ALL_SITES.filter(s =>
        s.name.toLowerCase().includes(excludeSearch.toLowerCase()) &&
        !excludedCampgrounds.includes(s.name)
      ).slice(0, 6)
    : [];

  // Check if search term matches a brand pattern
  const searchMatchesBrand = excludeSearch.trim().length >= 2 &&
    !excludedKeywords.includes(excludeSearch.trim());

  const addExclusion = (name: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExcludedCampgrounds(prev => [...prev, name]);
    setExcludeSearch("");
    setShowExcludeResults(false);
  };

  const addKeywordExclusion = (keyword: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const trimmed = keyword.trim();
    if (trimmed && !excludedKeywords.includes(trimmed)) {
      setExcludedKeywords(prev => [...prev, trimmed]);
    }
    setExcludeSearch("");
    setShowExcludeResults(false);
  };

  const removeExclusion = (name: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExcludedCampgrounds(prev => prev.filter(n => n !== name));
  };

  const removeKeyword = (keyword: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExcludedKeywords(prev => prev.filter(k => k !== keyword));
  };

  const planTripMutation = trpc.ai.planTrip.useMutation();

  const toggleInterest = (interest: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handlePlanTrip = useCallback(async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert("Missing Info", "Please enter both start and end locations.");
      return;
    }
    const dur = parseInt(duration) || 7;
    if (dur < 1 || dur > 90) {
      Alert.alert("Invalid Duration", "Trip duration must be 1-90 days.");
      return;
    }

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    setShowForm(false);

    try {
      const result = await planTripMutation.mutateAsync({
        startLocation: startLocation.trim(),
        endLocation: endLocation.trim(),
        duration: dur,
        rvType: rvType || undefined,
        rvLength: rvLength || undefined,
        budget: budget || undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
        travelers: parseInt(travelers) || 2,
        pets,
        excludedCampgrounds: (() => {
          // Merge specific campgrounds + keyword-matched campgrounds into one list
          const keywordMatches = excludedKeywords.length > 0
            ? ALL_SITES.filter(s => excludedKeywords.some(k => s.name.toLowerCase().includes(k.toLowerCase()))).map(s => s.name)
            : [];
          const merged = [...new Set([...excludedCampgrounds, ...keywordMatches])];
          return merged.length > 0 ? merged : undefined;
        })(),
      });
      setTripPlan(result as TripPlan);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to generate trip plan. Please try again.");
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  }, [startLocation, endLocation, duration, rvType, rvLength, budget, selectedInterests, travelers, pets, excludedCampgrounds, excludedKeywords]);

  const getCampTypeIcon = (type: string) => {
    switch (type) {
      case "rv_park": return "🏕️";
      case "state_park": return "🌲";
      case "national_park": return "🏔️";
      case "boondocking": return "⛺";
      default: return "📍";
    }
  };

  const getCampTypeLabel = (type: string) => {
    switch (type) {
      case "rv_park": return "RV Park";
      case "state_park": return "State Park";
      case "national_park": return "National Park";
      case "boondocking": return "Boondocking";
      default: return type;
    }
  };

  // Match AI-generated campground name to a real campsite in our database
  const findMatchingSite = (campgroundName: string) => {
    if (!campgroundName) return null;
    const lower = campgroundName.toLowerCase().trim();
    // Exact match first
    let match = ALL_SITES.find(s => s.name.toLowerCase() === lower);
    if (match) return match;
    // Partial match — campground name contains or is contained by site name
    match = ALL_SITES.find(s => s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase()));
    if (match) return match;
    // Word-based match — at least 2 significant words match
    const words = lower.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'park', 'campground', 'camping', 'area', 'site'].includes(w));
    if (words.length >= 2) {
      match = ALL_SITES.find(s => {
        const siteLower = s.name.toLowerCase();
        const matchCount = words.filter(w => siteLower.includes(w)).length;
        return matchCount >= 2;
      });
    }
    return match || null;
  };

  const navigateToSite = (campgroundName: string) => {
    const site = findMatchingSite(campgroundName);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (site) {
      router.push({ pathname: "/site-detail", params: { siteId: site.id, fromPlanner: "1" } });
    } else {
      // No match found — search for it
      Alert.alert(
        "Campground Not in Database",
        `"${campgroundName}" isn't in our database yet. Would you like to search for similar campgrounds?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Search", onPress: () => router.push({ pathname: "/(tabs)/explore", params: { search: campgroundName } }) },
        ]
      );
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>🤖 AI Trip Planner</Text>
        {showForm ? (
          <Pressable onPress={clearAllFields} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
            <Text style={[styles.clearAllBtnText, { color: colors.error }]}>Clear All</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Plan Your Dream RV Trip</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
              Our AI will create a personalized itinerary with campgrounds, costs, and route tips.
            </Text>

            {/* Start & End */}
            <Text style={[styles.label, { color: colors.foreground }]}>Start Location *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g., Denver, CO"
              placeholderTextColor={colors.muted}
              value={startLocation}
              onChangeText={setStartLocation}
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.foreground }]}>End Location *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g., San Diego, CA"
              placeholderTextColor={colors.muted}
              value={endLocation}
              onChangeText={setEndLocation}
              returnKeyType="next"
            />

            {/* Duration & Travelers */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.foreground }]}>Days</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="7"
                  placeholderTextColor={colors.muted}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.foreground }]}>Travelers</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="2"
                  placeholderTextColor={colors.muted}
                  value={travelers}
                  onChangeText={setTravelers}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>

            {/* RV Type */}
            <Text style={[styles.label, { color: colors.foreground }]}>RV Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {RV_TYPES.map(type => (
                <Pressable
                  key={type}
                  onPress={() => { setRvType(rvType === type ? "" : type); }}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: rvType === type ? colors.primary : colors.surface },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: rvType === type ? "#fff" : colors.foreground }]}>{type}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* RV Length */}
            <Text style={[styles.label, { color: colors.foreground }]}>RV Length</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g., 32 ft"
              placeholderTextColor={colors.muted}
              value={rvLength}
              onChangeText={setRvLength}
            />

            {/* Budget */}
            <Text style={[styles.label, { color: colors.foreground }]}>Budget</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {BUDGETS.map(b => (
                <Pressable
                  key={b}
                  onPress={() => setBudget(budget === b ? "" : b)}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: budget === b ? colors.primary : colors.surface },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: budget === b ? "#fff" : colors.foreground }]}>{b}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Interests */}
            <Text style={[styles.label, { color: colors.foreground }]}>Interests</Text>
            <View style={styles.chipWrap}>
              {INTERESTS.map(interest => (
                <Pressable
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: selectedInterests.includes(interest) ? colors.primary : colors.surface },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: selectedInterests.includes(interest) ? "#fff" : colors.foreground }]}>
                    {interest}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Exclude Campgrounds */}
            <Text style={[styles.label, { color: colors.foreground }]}>🚫 Exclude Campgrounds</Text>
            <Text style={[styles.excludeHint, { color: colors.muted }]}>
              Search for a specific campground or type a brand name (e.g. "KOA") to exclude all of that type
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder='Type a name or brand (e.g. "KOA")...'
              placeholderTextColor={colors.muted}
              value={excludeSearch}
              onChangeText={(text) => { setExcludeSearch(text); setShowExcludeResults(true); }}
              returnKeyType="done"
              onSubmitEditing={() => { if (excludeSearch.trim().length >= 2) addKeywordExclusion(excludeSearch); }}
            />
            {showExcludeResults && excludeSearch.trim().length >= 2 && (
              <View style={[styles.excludeDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Keyword/Brand exclusion option */}
                {searchMatchesBrand && (
                  <Pressable
                    onPress={() => addKeywordExclusion(excludeSearch)}
                    style={({ pressed }) => [
                      styles.excludeResult,
                      { borderBottomColor: colors.border, backgroundColor: colors.primary + "10" },
                      pressed && { backgroundColor: colors.primary + "25" },
                    ]}
                  >
                    <Text style={[styles.excludeResultName, { color: colors.primary }]}>🚫 Exclude ALL "{excludeSearch.trim()}" campgrounds</Text>
                    <Text style={[styles.excludeResultMeta, { color: colors.muted }]}>
                      Matches {keywordMatchCount(excludeSearch)} campgrounds in database
                    </Text>
                  </Pressable>
                )}
                {/* Specific campground results */}
                {excludeSearchResults.map(site => (
                  <Pressable
                    key={site.id}
                    onPress={() => addExclusion(site.name)}
                    style={({ pressed }) => [
                      styles.excludeResult,
                      { borderBottomColor: colors.border },
                      pressed && { backgroundColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.excludeResultName, { color: colors.foreground }]} numberOfLines={1}>{site.name}</Text>
                    <Text style={[styles.excludeResultMeta, { color: colors.muted }]}>{site.city}, {site.state} • {site.category}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Common brand quick-exclude buttons */}
            {excludedKeywords.length === 0 && excludedCampgrounds.length === 0 && !showExcludeResults && (
              <View style={styles.brandRow}>
                {COMMON_BRANDS.slice(0, 6).filter(b => !excludedKeywords.includes(b)).map(brand => (
                  <Pressable
                    key={brand}
                    onPress={() => addKeywordExclusion(brand)}
                    style={({ pressed }) => [
                      styles.brandChip,
                      { borderColor: colors.border },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.brandChipText, { color: colors.muted }]}>🚫 {brand}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Keyword exclusion chips (orange) */}
            {excludedKeywords.length > 0 && (
              <View style={styles.excludeChipWrap}>
                <Text style={[styles.excludeChipLabel, { color: colors.muted }]}>Excluded brands/keywords:</Text>
                {excludedKeywords.map(keyword => (
                  <Pressable
                    key={keyword}
                    onPress={() => removeKeyword(keyword)}
                    style={({ pressed }) => [
                      styles.excludeChip,
                      { backgroundColor: colors.warning + "18", borderColor: colors.warning },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.excludeChipText, { color: colors.warning }]} numberOfLines={1}>🚫 ✕ {keyword} ({keywordMatchCount(keyword)})</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Specific campground exclusion chips (red) */}
            {excludedCampgrounds.length > 0 && (
              <View style={styles.excludeChipWrap}>
                <Text style={[styles.excludeChipLabel, { color: colors.muted }]}>Excluded campgrounds:</Text>
                {excludedCampgrounds.map(name => (
                  <Pressable
                    key={name}
                    onPress={() => removeExclusion(name)}
                    style={({ pressed }) => [
                      styles.excludeChip,
                      { backgroundColor: colors.error + "18", borderColor: colors.error },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.excludeChipText, { color: colors.error }]} numberOfLines={1}>✕ {name}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Clear all exclusions */}
            {(excludedCampgrounds.length > 0 || excludedKeywords.length > 0) && (
              <Pressable
                onPress={() => {
                  setExcludedCampgrounds([]);
                  setExcludedKeywords([]);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={[styles.clearAllText, { color: colors.muted }]}>Clear all exclusions</Text>
              </Pressable>
            )}

            {/* Pets toggle */}
            <Pressable
              onPress={() => { setPets(!pets); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={({ pressed }) => [
                styles.petToggle,
                { backgroundColor: pets ? colors.primary : colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.petToggleText, { color: pets ? "#fff" : colors.foreground }]}>
                🐾 Traveling with Pets
              </Text>
            </Pressable>

            {/* Generate Button */}
            <Pressable
              onPress={handlePlanTrip}
              style={({ pressed }) => [
                styles.generateBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.generateBtnText}>🤖 Generate My Trip Plan</Text>
            </Pressable>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.foreground }]}>Planning your perfect trip...</Text>
            <Text style={[styles.loadingSubtext, { color: colors.muted }]}>
              Our AI is finding the best campgrounds, calculating costs, and checking for route hazards.
            </Text>
          </View>
        )}

        {/* Trip Plan Results */}
        {tripPlan && !loading && (
          <View style={styles.resultsSection}>
            <Text style={[styles.tripName, { color: colors.foreground }]}>{tripPlan.tripName}</Text>

            {/* Cost Summary */}
            <View style={[styles.costCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.costTitle, { color: colors.foreground }]}>💰 Trip Cost Estimate</Text>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.muted }]}>⛽ Fuel</Text>
                <Text style={[styles.costValue, { color: colors.foreground }]}>${tripPlan.estimatedFuelCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.muted }]}>🏕️ Camping</Text>
                <Text style={[styles.costValue, { color: colors.foreground }]}>${tripPlan.estimatedCampingCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.muted }]}>🍔 Food</Text>
                <Text style={[styles.costValue, { color: colors.foreground }]}>${tripPlan.estimatedFoodCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <View style={[styles.costRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Estimated</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>${tripPlan.totalEstimatedCost?.toFixed(0) ?? "—"}</Text>
              </View>
              <Text style={[styles.costNote, { color: colors.muted }]}>
                {tripPlan.totalMiles?.toLocaleString() ?? "—"} total miles
              </Text>
            </View>

            {/* Warnings */}
            {tripPlan.warnings && tripPlan.warnings.length > 0 && (
              <View style={[styles.warningsCard, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
                <Text style={[styles.warningsTitle, { color: "#92400E" }]}>⚠️ Route Warnings</Text>
                {tripPlan.warnings.map((w, i) => (
                  <Text key={i} style={[styles.warningText, { color: "#92400E" }]}>• {w}</Text>
                ))}
              </View>
            )}

            {/* Stops */}
            <Text style={[styles.stopsTitle, { color: colors.foreground }]}>📍 Your Itinerary</Text>
            {tripPlan.stops?.map((stop, i) => {
              const matchedSite = findMatchingSite(stop.campground);
              return (
                <Pressable
                  key={i}
                  onPress={() => navigateToSite(stop.campground)}
                  style={({ pressed }) => [
                    styles.stopCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View style={styles.stopHeader}>
                    <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.dayBadgeText}>Day {stop.day}</Text>
                    </View>
                    <View style={styles.stopMeta}>
                      <Text style={[styles.stopDriving, { color: colors.muted }]}>
                        {stop.drivingMiles} mi • {stop.drivingTime}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.stopLocation, { color: colors.foreground }]}>{stop.location}</Text>
                  <View style={styles.campRow}>
                    <Text style={styles.campIcon}>{getCampTypeIcon(stop.campgroundType)}</Text>
                    <View style={styles.campInfo}>
                      <Text style={[styles.campName, { color: colors.foreground }]}>{stop.campground}</Text>
                      <Text style={[styles.campType, { color: colors.muted }]}>
                        {getCampTypeLabel(stop.campgroundType)} • Est. ${stop.pricePerNight}/night • {stop.nights} night{stop.nights !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  {stop.highlights && stop.highlights.length > 0 && (
                    <View style={styles.highlightsSection}>
                      <Text style={[styles.highlightsLabel, { color: colors.foreground }]}>Things to do:</Text>
                      {stop.highlights.map((h, j) => (
                        <Text key={j} style={[styles.highlightItem, { color: colors.muted }]}>✦ {h}</Text>
                      ))}
                    </View>
                  )}
                  {stop.notes && (
                    <Text style={[styles.stopNotes, { color: colors.muted }]}>💡 {stop.notes}</Text>
                  )}

                  {/* Nearby Campsites */}
                  {matchedSite && (() => {
                    const nearbyCamps = findNearbyRVParks(matchedSite.latitude, matchedSite.longitude, 3, 30)
                      .filter(n => n.site.id !== matchedSite.id);
                    if (nearbyCamps.length === 0) return null;
                    return (
                      <View style={styles.nearbySection}>
                        <Text style={[styles.nearbySectionTitle, { color: colors.foreground }]}>🏕️ Nearby Campsites</Text>
                        {nearbyCamps.map((n, idx) => (
                          <Pressable
                            key={idx}
                            onPress={() => router.push({ pathname: "/site-detail", params: { siteId: n.site.id, fromPlanner: "1" } })}
                            style={({ pressed }) => [
                              styles.nearbyCard,
                              { backgroundColor: colors.background, borderColor: colors.border },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text style={[styles.nearbyName, { color: colors.primary }]}>{n.site.name}</Text>
                            <Text style={[styles.nearbyDist, { color: colors.muted }]}>{n.distanceMiles} mi</Text>
                          </Pressable>
                        ))}
                      </View>
                    );
                  })()}

                  {/* Nearby Truck Stops */}
                  {matchedSite && (() => {
                    const nearbyTrucks = findNearbyTruckStops(matchedSite.latitude, matchedSite.longitude, 2, 30);
                    if (nearbyTrucks.length === 0) return null;
                    return (
                      <View style={styles.nearbySection}>
                        <Text style={[styles.nearbySectionTitle, { color: colors.foreground }]}>⛽ Nearby Truck Stops</Text>
                        {nearbyTrucks.map((n, idx) => (
                          <Pressable
                            key={idx}
                            onPress={() => Linking.openURL(n.directionsUrl)}
                            style={({ pressed }) => [
                              styles.nearbyCard,
                              { backgroundColor: colors.background, borderColor: colors.border },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text style={[styles.nearbyName, { color: colors.foreground }]}>{n.site.name}</Text>
                            <Text style={[styles.nearbyDist, { color: colors.muted }]}>{n.distanceMiles} mi</Text>
                          </Pressable>
                        ))}
                      </View>
                    );
                  })()}

                  {/* View & Book button */}
                  <View style={[styles.viewBookBtn, { backgroundColor: matchedSite ? colors.primary : colors.muted }]}>
                    <Text style={styles.viewBookBtnText}>
                      {matchedSite ? "📋 View Details & Reserve" : "🔍 Search Campground"}
                    </Text>
                    <Text style={styles.viewBookChevron}>›</Text>
                  </View>
                </Pressable>
              );
            })}

            {/* Tips */}
            {tripPlan.tips && tripPlan.tips.length > 0 && (
              <View style={[styles.tipsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.tipsTitle, { color: colors.foreground }]}>💡 Pro Tips</Text>
                {tripPlan.tips.map((tip, i) => (
                  <Text key={i} style={[styles.tipText, { color: colors.muted }]}>• {tip}</Text>
                ))}
              </View>
            )}

            {/* Back to Form / New Plan Buttons */}
            <Pressable
              onPress={() => { setShowForm(true); }}
              style={({ pressed }) => [
                styles.newPlanBtn,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={[styles.newPlanBtnText, { color: colors.primary }]}>← Back to Trip Form</Text>
            </Pressable>
            <Pressable
              onPress={() => { setTripPlan(null); setShowForm(true); clearAllFields(); }}
              style={({ pressed }) => [
                styles.newPlanBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.newPlanBtnText}>🔄 Plan Another Trip</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 70 },
  backText: { fontSize: 16, fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  formSection: { gap: 4 },
  sectionTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  chipScroll: { marginBottom: 4 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 4 },
  chipText: { fontSize: 13, fontWeight: "500" },
  petToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  petToggleText: { fontSize: 16, fontWeight: "600" },
  generateBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 20 },
  generateBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 16 },
  loadingText: { fontSize: 20, fontWeight: "700" },
  loadingSubtext: { fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  resultsSection: { gap: 16 },
  tripName: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  costCard: { borderRadius: 16, padding: 20, borderWidth: 1, gap: 10 },
  costTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costLabel: { fontSize: 15 },
  costValue: { fontSize: 15, fontWeight: "600" },
  totalRow: { borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 17, fontWeight: "700" },
  totalValue: { fontSize: 22, fontWeight: "800" },
  costNote: { fontSize: 13, textAlign: "center", marginTop: 4 },
  warningsCard: { borderRadius: 12, padding: 16, borderWidth: 1, gap: 6 },
  warningsTitle: { fontSize: 16, fontWeight: "700" },
  warningText: { fontSize: 14, lineHeight: 20 },
  stopsTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  stopCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  stopHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  dayBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stopMeta: {},
  stopDriving: { fontSize: 13 },
  stopLocation: { fontSize: 18, fontWeight: "700" },
  campRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  campIcon: { fontSize: 24, marginTop: 2 },
  campInfo: { flex: 1 },
  campName: { fontSize: 15, fontWeight: "600" },
  campType: { fontSize: 13, marginTop: 2 },
  highlightsSection: { gap: 4 },
  highlightsLabel: { fontSize: 14, fontWeight: "600" },
  highlightItem: { fontSize: 13, lineHeight: 18, paddingLeft: 4 },
  stopNotes: { fontSize: 13, fontStyle: "italic", lineHeight: 18 },
  tipsCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  tipsTitle: { fontSize: 18, fontWeight: "700" },
  tipText: { fontSize: 14, lineHeight: 20 },
  newPlanBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 8 },
  newPlanBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  excludeHint: { fontSize: 12, lineHeight: 16, marginBottom: 6, marginTop: -2 },
  excludeDropdown: { borderWidth: 1, borderRadius: 12, marginTop: 4, overflow: "hidden" as const },
  excludeResult: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5 },
  excludeResultName: { fontSize: 14, fontWeight: "600" },
  excludeResultMeta: { fontSize: 12, marginTop: 2 },
  excludeChipWrap: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8, marginTop: 8, alignItems: "center" as const },
  excludeChip: { flexDirection: "row" as const, alignItems: "center" as const, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, maxWidth: "90%" as any },
  excludeChipText: { fontSize: 13, fontWeight: "500" },
  clearAllText: { fontSize: 13, fontWeight: "500", textDecorationLine: "underline" as const, paddingVertical: 4 },
  clearAllBtnText: { fontSize: 13, fontWeight: "600", textAlign: "right" as const },
  nearbySection: { marginTop: 8, gap: 6 },
  nearbySectionTitle: { fontSize: 13, fontWeight: "700" },
  nearbyCard: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1 },
  nearbyName: { fontSize: 13, fontWeight: "600", flex: 1 },
  nearbyDist: { fontSize: 12 },
  brandRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8, marginTop: 6 },
  brandChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  brandChipText: { fontSize: 12, fontWeight: "500" },
  excludeChipLabel: { fontSize: 12, fontWeight: "600", width: "100%" as any, marginBottom: 2 },
  viewBookBtn: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, paddingVertical: 10, borderRadius: 10, marginTop: 6, gap: 6 },
  viewBookBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  viewBookChevron: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
