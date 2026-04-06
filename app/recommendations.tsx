import { useMemo, useState, useEffect } from "react";
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Image } from "expo-image";

interface Recommendation {
  id: string;
  siteId: string;
  name: string;
  state: string;
  category: string;
  matchScore: number; // 0-100
  reason: string;
  highlights: string[];
  pricePerNight: number;
  rating: number;
  imageUrl: string;
  tags: string[];
}

// Simulated AI recommendations based on user profile
const RECOMMENDATIONS: Recommendation[] = [
  { id: "rec-1", siteId: "ut-2", name: "Zion Watchman Campground", state: "UT", category: "National Park", matchScore: 98, reason: "Based on your love of hiking and canyon scenery. Angels Landing and The Narrows are bucket-list trails that match your moderate-to-hard difficulty preference.", highlights: ["Angels Landing", "The Narrows", "Scenic shuttle"], pricePerNight: 30, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400", tags: ["hiking", "canyon", "national park"] },
  { id: "rec-2", siteId: "ca-3", name: "Yosemite Upper Pines", state: "CA", category: "National Park", matchScore: 96, reason: "Your RV (Class C, 24ft) fits perfectly in their sites. Half Dome and Mist Trail match your adventure level. Best visited May-Oct based on your travel dates.", highlights: ["Half Dome", "Waterfalls", "Valley views"], pricePerNight: 35, rating: 4.7, imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400", tags: ["waterfalls", "granite", "iconic"] },
  { id: "rec-3", siteId: "mt-2", name: "Glacier Apgar Campground", state: "MT", category: "National Park", matchScore: 94, reason: "You rated Yellowstone 5 stars — Glacier is the natural next stop. Going-to-the-Sun Road is RV-accessible up to 21ft (your rig fits!). Best wildlife viewing in the lower 48.", highlights: ["Going-to-the-Sun Road", "Grizzly bears", "Alpine lakes"], pricePerNight: 25, rating: 4.9, imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400", tags: ["wildlife", "mountains", "glaciers"] },
  { id: "rec-4", siteId: "az-2", name: "Grand Canyon Mather Campground", state: "AZ", category: "National Park", matchScore: 91, reason: "You haven't visited the Grand Canyon yet — it's a must for any RVer. Your Good Sam discount saves 10% at nearby RV parks. South Rim has the best accessibility.", highlights: ["South Rim views", "Bright Angel Trail", "Dark sky"], pricePerNight: 18, rating: 4.6, imageUrl: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=400", tags: ["canyon", "iconic", "dark sky"] },
  { id: "rec-5", siteId: "or-1", name: "Alvord Desert Hot Springs", state: "OR", category: "Boondocking", matchScore: 89, reason: "You love free camping and remote spots. This insider favorite has natural hot springs and zero light pollution. Your solar setup makes it perfect for off-grid stays.", highlights: ["Hot springs", "Dark sky", "Free camping"], pricePerNight: 0, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400", tags: ["free", "hot springs", "remote"] },
  { id: "rec-6", siteId: "tn-2", name: "Great Smoky Mountains Elkmont", state: "TN", category: "National Park", matchScore: 87, reason: "Most visited national park in the US — and for good reason. Synchronous fireflies in June match your travel window. No entrance fee!", highlights: ["Fireflies", "No entrance fee", "Laurel Falls"], pricePerNight: 25, rating: 4.5, imageUrl: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400", tags: ["fireflies", "free entry", "smoky"] },
  { id: "rec-7", siteId: "me-1", name: "Acadia Blackwoods Campground", state: "ME", category: "National Park", matchScore: 85, reason: "You mentioned wanting to see fall foliage. Acadia in October is peak color season. Cadillac Mountain sunrise is the first in the US.", highlights: ["Fall foliage", "Cadillac Mountain", "Lobster"], pricePerNight: 30, rating: 4.7, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", tags: ["fall foliage", "coast", "sunrise"] },
  { id: "rec-8", siteId: "co-2", name: "Rocky Mountain Moraine Park", state: "CO", category: "National Park", matchScore: 83, reason: "Elk rut in September is spectacular. Your military discount applies here. Trail Ridge Road is the highest continuous paved road in the US.", highlights: ["Elk rut", "Trail Ridge Road", "Alpine tundra"], pricePerNight: 30, rating: 4.6, imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400", tags: ["elk", "alpine", "military discount"] },
];

export default function RecommendationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    RECOMMENDATIONS.forEach((r) => r.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, []);

  const filtered = useMemo(() => {
    if (!selectedTag) return RECOMMENDATIONS;
    return RECOMMENDATIONS.filter((r) => r.tags.includes(selectedTag));
  }, [selectedTag]);

  if (loading) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>For You</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingTitle, { color: colors.foreground }]}>Analyzing Your Preferences...</Text>
          <Text style={[styles.loadingSubtitle, { color: colors.muted }]}>
            Matching campgrounds to your RV size, budget, travel style, and past favorites
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>For You</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* AI Banner */}
        <View style={[styles.aiBanner, { backgroundColor: "#6A1B9A" }]}>
          <MaterialIcons name="auto-awesome" size={28} color="#CE93D8" />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI-Powered Picks</Text>
            <Text style={styles.aiSubtitle}>Personalized based on your RV, travel history, budget, and interests</Text>
          </View>
        </View>

        {/* Tag Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.tagFilters}>
          <TouchableOpacity
            onPress={() => setSelectedTag(null)}
            style={[styles.tagChip, { backgroundColor: !selectedTag ? colors.primary + "15" : colors.surface, borderColor: !selectedTag ? colors.primary : colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tagChipText, { color: !selectedTag ? colors.primary : colors.foreground }]}>All</Text>
          </TouchableOpacity>
          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
              style={[styles.tagChip, { backgroundColor: selectedTag === tag ? colors.primary + "15" : colors.surface, borderColor: selectedTag === tag ? colors.primary : colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tagChipText, { color: selectedTag === tag ? colors.primary : colors.foreground }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommendation Cards */}
        {filtered.map((rec, index) => (
          <TouchableOpacity
            key={rec.id}
            style={[styles.recCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/site-detail?id=${rec.siteId}` as any)}
            activeOpacity={0.7}
          >
            {/* Image */}
            <Image
              source={{ uri: rec.imageUrl }}
              style={styles.recImage}
              contentFit="cover"
            />

            {/* Match Score Badge */}
            <View style={[styles.matchBadge, { backgroundColor: rec.matchScore >= 90 ? "#1B5E20" : rec.matchScore >= 80 ? "#E65100" : colors.primary }]}>
              <Text style={styles.matchText}>{rec.matchScore}% Match</Text>
            </View>

            {/* Rank */}
            <View style={[styles.rankBadge, { backgroundColor: index < 3 ? "#F9A825" : colors.muted }]}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>

            {/* Content */}
            <View style={styles.recContent}>
              <View style={styles.recHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recName, { color: colors.foreground }]}>{rec.name}</Text>
                  <Text style={[styles.recLocation, { color: colors.muted }]}>{rec.state} • {rec.category}</Text>
                </View>
                <View style={styles.priceRating}>
                  <Text style={[styles.recPrice, { color: colors.primary }]}>
                    {rec.pricePerNight === 0 ? "FREE" : `Est. $${rec.pricePerNight}/night`}
                  </Text>
                  <View style={styles.ratingRow}>
                    <MaterialIcons name="star" size={14} color="#F9A825" />
                    <Text style={[styles.ratingText, { color: colors.foreground }]}>{rec.rating}</Text>
                  </View>
                </View>
              </View>

              {/* AI Reason */}
              <View style={[styles.reasonBox, { backgroundColor: "#6A1B9A10", borderColor: "#6A1B9A30" }]}>
                <MaterialIcons name="auto-awesome" size={14} color="#6A1B9A" />
                <Text style={[styles.reasonText, { color: "#6A1B9A" }]}>{rec.reason}</Text>
              </View>

              {/* Highlights */}
              <View style={styles.highlightsRow}>
                {rec.highlights.map((h, i) => (
                  <View key={i} style={[styles.highlightChip, { backgroundColor: colors.primary + "10" }]}>
                    <Text style={[styles.highlightText, { color: colors.primary }]}>{h}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, paddingHorizontal: 40 },
  loadingTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  loadingSubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  aiBanner: { marginHorizontal: 16, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  aiTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  aiSubtitle: { fontSize: 11, color: "#CE93D8", marginTop: 2 },
  tagFilters: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tagChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  tagChipText: { fontSize: 12, fontWeight: "500" },
  recCard: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  recImage: { width: "100%", height: 160 },
  matchBadge: { position: "absolute", top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  matchText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  rankBadge: { position: "absolute", top: 12, left: 12, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 12, fontWeight: "800", color: "#fff" },
  recContent: { padding: 14, gap: 10 },
  recHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  recName: { fontSize: 16, fontWeight: "700" },
  recLocation: { fontSize: 12, marginTop: 2 },
  priceRating: { alignItems: "flex-end" },
  recPrice: { fontSize: 15, fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: "600" },
  reasonBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 8, borderWidth: 1 },
  reasonText: { fontSize: 12, lineHeight: 17, flex: 1 },
  highlightsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  highlightChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  highlightText: { fontSize: 11, fontWeight: "500" },
});
