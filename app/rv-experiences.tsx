/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Types ──
interface RVExperience {
  id: string;
  rvMake: string;
  rvModel: string;
  rvYear: string;
  rvType: string;
  category: ExperienceCategory;
  title: string;
  story: string;
  rating: number; // 1-5
  helpful: number;
  date: string;
  author: string;
}

type ExperienceCategory = "Problems" | "Mods & Upgrades" | "Tips & Tricks" | "Trip Stories" | "Maintenance" | "Reviews";

const CATEGORIES: ExperienceCategory[] = ["Problems", "Mods & Upgrades", "Tips & Tricks", "Trip Stories", "Maintenance", "Reviews"];

const CATEGORY_ICONS: Record<ExperienceCategory, { icon: string; color: string }> = {
  "Problems": { icon: "error-outline", color: "#EF4444" },
  "Mods & Upgrades": { icon: "build", color: "#8B5CF6" },
  "Tips & Tricks": { icon: "lightbulb-outline", color: "#F59E0B" },
  "Trip Stories": { icon: "explore", color: "#10B981" },
  "Maintenance": { icon: "handyman", color: "#3B82F6" },
  "Reviews": { icon: "star-outline", color: "#EC4899" },
};

const RV_MAKES = [
  "Forest River", "Thor Industries", "Winnebago", "Keystone RV", "Jayco",
  "Coachmen", "Tiffin Motorhomes", "Newmar", "Airstream", "Grand Design",
  "Heartland RV", "Fleetwood", "Dutchmen", "Entegra Coach", "Pleasure-Way",
  "Lance Campers", "Northwood", "nuCamp", "Roadtrek", "Leisure Travel Vans",
  "Gulf Stream", "Palomino", "CrossRoads", "Highland Ridge", "Venture RV",
  "Other",
];

const RV_TYPES = ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel", "Toy Hauler", "Pop-Up", "Truck Camper", "Teardrop", "Other"];

const STORAGE_KEY = "rv_experiences";

// ── Sample Experiences ──
const SAMPLE_EXPERIENCES: RVExperience[] = [
  {
    id: "sample-1",
    rvMake: "Forest River",
    rvModel: "Rockwood Ultra Lite 2912BS",
    rvYear: "2023",
    rvType: "Travel Trailer",
    category: "Problems",
    title: "Slide-out seal leaked after 6 months",
    story: "We noticed water coming in around the bedroom slide-out after a heavy rainstorm. The factory seal had already started to separate. Dealer replaced it under warranty but I'd recommend checking your slide seals every few months and keeping them treated with a rubber conditioner. Cost would have been about $400 out of warranty.",
    rating: 2,
    helpful: 47,
    date: "2025-11-15",
    author: "Mike R.",
  },
  {
    id: "sample-2",
    rvMake: "Winnebago",
    rvModel: "View 24D",
    rvYear: "2024",
    rvType: "Class C",
    category: "Mods & Upgrades",
    title: "Added lithium batteries and solar — game changer",
    story: "Replaced the two factory lead-acid batteries with 200Ah lithium iron phosphate batteries and added 400W of solar panels on the roof. Total cost was about $3,200 including a Victron charge controller. Now we can boondock for 4-5 days without running the generator. Best upgrade we've ever done. The weight savings alone was worth it — dropped about 120 lbs.",
    rating: 5,
    helpful: 89,
    date: "2025-09-20",
    author: "Sarah & Tom K.",
  },
  {
    id: "sample-3",
    rvMake: "Airstream",
    rvModel: "International 25FB",
    rvYear: "2022",
    rvType: "Travel Trailer",
    category: "Tips & Tricks",
    title: "Use a surge protector — saved our electronics twice",
    story: "Invested in a Progressive Industries EMS-PT50X surge protector ($350) and it has already saved us twice from bad campground power. Once at a state park in Tennessee where the voltage was dropping to 95V, and once at a private park where they had an open ground. The unit shut off power before any damage. Don't plug in without one.",
    rating: 5,
    helpful: 112,
    date: "2025-08-05",
    author: "Dave L.",
  },
  {
    id: "sample-4",
    rvMake: "Grand Design",
    rvModel: "Imagine 2800BH",
    rvYear: "2024",
    rvType: "Travel Trailer",
    category: "Trip Stories",
    title: "2 months through the Pacific Northwest",
    story: "Took our Grand Design from Portland down the Oregon coast, up through Olympic National Park, and into the San Juan Islands. Highlights: Cape Lookout State Park (book 6 months ahead!), Kalaloch Campground on the Olympic coast, and Deception Pass State Park. We spent about $45/night average. The 2800BH was perfect for our family of 4 — bunks for the kids and enough storage for a long trip.",
    rating: 5,
    helpful: 67,
    date: "2025-10-12",
    author: "The Martinez Family",
  },
  {
    id: "sample-5",
    rvMake: "Thor Industries",
    rvModel: "Ace 30.3",
    rvYear: "2023",
    rvType: "Class A",
    category: "Maintenance",
    title: "Roof maintenance schedule that works",
    story: "After talking to several full-timers, here's the roof maintenance schedule I follow: Every 3 months — inspect all seams and caulking, clean with RV roof cleaner. Every 6 months — apply Dicor self-leveling sealant to any cracks. Yearly — full roof coating with Dicor rubber roof coating. Takes about 2 hours each time. My roof is 3 years old and still looks new. The key is catching small cracks before they become leaks.",
    rating: 4,
    helpful: 93,
    date: "2025-07-22",
    author: "Jim P.",
  },
  {
    id: "sample-6",
    rvMake: "Jayco",
    rvModel: "Jay Flight 264BH",
    rvYear: "2025",
    rvType: "Travel Trailer",
    category: "Reviews",
    title: "Great entry-level trailer with a few quirks",
    story: "This is our first RV and overall we're happy with the Jay Flight. Pros: Great floor plan for a family, the outdoor kitchen is awesome, and the price was right at $28K. Cons: The mattress is terrible (replaced it immediately), the cabinet doors don't stay closed while driving (added magnetic catches), and the black tank flush doesn't work well. For the price, it's hard to beat. We've done 15 trips in 8 months.",
    rating: 4,
    helpful: 55,
    date: "2026-01-10",
    author: "Chris & Amy W.",
  },
  {
    id: "sample-7",
    rvMake: "Keystone RV",
    rvModel: "Montana 3855BR",
    rvYear: "2022",
    rvType: "Fifth Wheel",
    category: "Problems",
    title: "Hydraulic leveling system failure at 18 months",
    story: "Our Lippert hydraulic leveling system completely failed while setting up at a campground in Colorado. One jack wouldn't retract and another wouldn't extend. Turned out to be a bad control board AND a leaking hydraulic line. Repair cost: $1,800 at a mobile RV tech. Lippert covered the control board under their 2-year warranty but not the labor. Keep your hydraulic fluid topped off and listen for unusual pump sounds.",
    rating: 2,
    helpful: 38,
    date: "2025-12-03",
    author: "Bob & Linda S.",
  },
  {
    id: "sample-8",
    rvMake: "Tiffin Motorhomes",
    rvModel: "Allegro Open Road 32SA",
    rvYear: "2024",
    rvType: "Class A",
    category: "Mods & Upgrades",
    title: "Tire pressure monitoring system is a must",
    story: "After hearing horror stories about blowouts, I installed a TireMinder A1AS TPMS system on all 6 tires. It monitors pressure and temperature in real-time and alerts you through a small monitor on the dash. Caught a slow leak in my right rear tire at 2am — was losing 1 PSI per hour. Without the monitor, I would have driven on it and likely had a blowout. $250 well spent. Install takes about 30 minutes.",
    rating: 5,
    helpful: 76,
    date: "2025-06-18",
    author: "Frank M.",
  },
];

export default function RVExperiencesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [experiences, setExperiences] = useState<RVExperience[]>(SAMPLE_EXPERIENCES);
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");

  // Form state
  const [formMake, setFormMake] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formType, setFormType] = useState("");
  const [formCategory, setFormCategory] = useState<ExperienceCategory>("Reviews");
  const [formTitle, setFormTitle] = useState("");
  const [formStory, setFormStory] = useState("");
  const [formRating, setFormRating] = useState(4);
  const [formAuthor, setFormAuthor] = useState("");
  const [showMakePicker, setShowMakePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Load saved experiences
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const saved = JSON.parse(data) as RVExperience[];
          setExperiences([...saved, ...SAMPLE_EXPERIENCES]);
        } catch {}
      }
    });
  }, []);

  // Filter and sort
  const filtered = useMemo(() => {
    let list = experiences;
    if (selectedCategory !== "All") {
      list = list.filter((e) => e.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.rvMake.toLowerCase().includes(q) ||
          e.rvModel.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.story.toLowerCase().includes(q)
      );
    }
    if (sortBy === "helpful") {
      list = [...list].sort((a, b) => b.helpful - a.helpful);
    } else {
      list = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return list;
  }, [experiences, selectedCategory, searchQuery, sortBy]);

  const handleSubmit = useCallback(async () => {
    if (!formMake || !formTitle || !formStory) {
      Alert.alert("Missing Info", "Please fill in at least the RV make, title, and your story.");
      return;
    }
    const newExp: RVExperience = {
      id: `user-${Date.now()}`,
      rvMake: formMake,
      rvModel: formModel || "Not specified",
      rvYear: formYear || "Unknown",
      rvType: formType || "Other",
      category: formCategory,
      title: formTitle,
      story: formStory,
      rating: formRating,
      helpful: 0,
      date: new Date().toISOString().split("T")[0],
      author: formAuthor || "Anonymous",
    };
    const updated = [newExp, ...experiences.filter((e) => !e.id.startsWith("sample-"))];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setExperiences([newExp, ...experiences]);
    setShowAddModal(false);
    // Reset form
    setFormMake("");
    setFormModel("");
    setFormYear("");
    setFormType("");
    setFormCategory("Reviews");
    setFormTitle("");
    setFormStory("");
    setFormRating(4);
    setFormAuthor("");
    Alert.alert("Posted!", "Your experience has been shared with the RV Nomad community.");
  }, [formMake, formModel, formYear, formType, formCategory, formTitle, formStory, formRating, formAuthor, experiences]);

  const handleHelpful = useCallback((id: string) => {
    setExperiences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, helpful: e.helpful + 1 } : e))
    );
  }, []);

  const renderExperience = useCallback(
    ({ item }: { item: RVExperience }) => {
      const catInfo = CATEGORY_ICONS[item.category];
      return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: catInfo.color + "18" }]}>
              <MaterialIcons name={catInfo.icon as any} size={14} color={catInfo.color} />
              <Text style={[styles.categoryBadgeText, { color: catInfo.color }]}>{item.category}</Text>
            </View>
            <Text style={[styles.cardDate, { color: colors.muted }]}>{item.date}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>

          {/* RV Info */}
          <View style={[styles.rvInfoRow, { backgroundColor: colors.background }]}>
            <MaterialIcons name="directions-car" size={14} color={colors.primary} />
            <Text style={[styles.rvInfoText, { color: colors.foreground }]}>
              {item.rvYear} {item.rvMake} {item.rvModel}
            </Text>
            <View style={[styles.rvTypeBadge, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.rvTypeText, { color: colors.primary }]}>{item.rvType}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialIcons
                key={star}
                name={star <= item.rating ? "star" : "star-border"}
                size={16}
                color="#F59E0B"
              />
            ))}
          </View>

          {/* Story */}
          <Text style={[styles.cardStory, { color: colors.muted }]}>{item.story}</Text>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={[styles.authorText, { color: colors.muted }]}>— {item.author}</Text>
            <TouchableOpacity
              style={[styles.helpfulBtn, { borderColor: colors.border }]}
              onPress={() => handleHelpful(item.id)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="thumb-up" size={14} color={colors.muted} />
              <Text style={[styles.helpfulText, { color: colors.muted }]}>
                Helpful ({item.helpful})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, handleHelpful]
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>RV Experiences</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <MaterialIcons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by RV make, model, or keyword..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === "All" && { backgroundColor: colors.primary }]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text style={[styles.categoryChipText, selectedCategory === "All" && { color: "#fff" }]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          const catInfo = CATEGORY_ICONS[cat];
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, active && { backgroundColor: catInfo.color }]}
              onPress={() => setSelectedCategory(active ? "All" : cat)}
            >
              <MaterialIcons name={catInfo.icon as any} size={14} color={active ? "#fff" : catInfo.color} />
              <Text style={[styles.categoryChipText, active && { color: "#fff" }]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={[styles.resultCount, { color: colors.muted }]}>{filtered.length} experiences</Text>
        <View style={styles.sortBtns}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === "recent" && { backgroundColor: colors.primary + "18" }]}
            onPress={() => setSortBy("recent")}
          >
            <Text style={[styles.sortBtnText, { color: sortBy === "recent" ? colors.primary : colors.muted }]}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === "helpful" && { backgroundColor: colors.primary + "18" }]}
            onPress={() => setSortBy("helpful")}
          >
            <Text style={[styles.sortBtnText, { color: sortBy === "helpful" ? colors.primary : colors.muted }]}>Most Helpful</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderExperience}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="forum" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>No experiences found</Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>Be the first to share your RV story!</Text>
          </View>
        }
      />

      {/* ── Add Experience Modal ── */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Share Your Experience</Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={[styles.modalPost, { color: colors.primary }]}>Post</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
              {/* Your Name */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Name (optional)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g., Mike R."
                placeholderTextColor={colors.muted}
                value={formAuthor}
                onChangeText={setFormAuthor}
                returnKeyType="done"
              />

              {/* RV Make */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>RV Make *</Text>
              <TouchableOpacity
                style={[styles.formInput, styles.pickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowMakePicker(!showMakePicker)}
              >
                <Text style={{ color: formMake ? colors.foreground : colors.muted }}>
                  {formMake || "Select your RV manufacturer"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.muted} />
              </TouchableOpacity>
              {showMakePicker && (
                <View style={[styles.pickerList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {RV_MAKES.map((make) => (
                      <TouchableOpacity
                        key={make}
                        style={[styles.pickerItem, formMake === make && { backgroundColor: colors.primary + "18" }]}
                        onPress={() => { setFormMake(make); setShowMakePicker(false); }}
                      >
                        <Text style={[styles.pickerItemText, { color: colors.foreground }]}>{make}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* RV Model */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>RV Model</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g., Rockwood Ultra Lite 2912BS"
                placeholderTextColor={colors.muted}
                value={formModel}
                onChangeText={setFormModel}
                returnKeyType="done"
              />

              {/* RV Year */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>RV Year</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g., 2024"
                placeholderTextColor={colors.muted}
                value={formYear}
                onChangeText={setFormYear}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
              />

              {/* RV Type */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>RV Type</Text>
              <TouchableOpacity
                style={[styles.formInput, styles.pickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowTypePicker(!showTypePicker)}
              >
                <Text style={{ color: formType ? colors.foreground : colors.muted }}>
                  {formType || "Select RV type"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.muted} />
              </TouchableOpacity>
              {showTypePicker && (
                <View style={[styles.pickerList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {RV_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.pickerItem, formType === type && { backgroundColor: colors.primary + "18" }]}
                      onPress={() => { setFormType(type); setShowTypePicker(false); }}
                    >
                      <Text style={[styles.pickerItemText, { color: colors.foreground }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Category */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Category *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const active = formCategory === cat;
                  const catInfo = CATEGORY_ICONS[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryOption, active && { backgroundColor: catInfo.color + "18", borderColor: catInfo.color }]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <MaterialIcons name={catInfo.icon as any} size={16} color={active ? catInfo.color : colors.muted} />
                      <Text style={[styles.categoryOptionText, { color: active ? catInfo.color : colors.muted }]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Title */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Title *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Give your experience a title"
                placeholderTextColor={colors.muted}
                value={formTitle}
                onChangeText={setFormTitle}
                returnKeyType="done"
              />

              {/* Rating */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Rating</Text>
              <View style={styles.ratingPicker}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setFormRating(star)} style={styles.starBtn}>
                    <MaterialIcons
                      name={star <= formRating ? "star" : "star-border"}
                      size={32}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Story */}
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Story *</Text>
              <TextInput
                style={[styles.formInput, styles.storyInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Share your experience in detail — what happened, what you learned, what you'd recommend to others..."
                placeholderTextColor={colors.muted}
                value={formStory}
                onChangeText={setFormStory}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 70 },
  backText: { fontSize: 16, fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  addBtn: { width: 70, alignItems: "flex-end" },
  searchRow: { paddingHorizontal: 16, paddingTop: 12 },
  searchBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  categoryScroll: { maxHeight: 44, marginTop: 12 },
  categoryContent: { paddingHorizontal: 16, gap: 8 },
  categoryChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#E5E7EB30", gap: 4 },
  categoryChipText: { fontSize: 13, fontWeight: "600" },
  sortRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  resultCount: { fontSize: 13 },
  sortBtns: { flexDirection: "row", gap: 4 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  sortBtnText: { fontSize: 12, fontWeight: "600" },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  categoryBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  categoryBadgeText: { fontSize: 11, fontWeight: "700" },
  cardDate: { fontSize: 11 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, lineHeight: 22 },
  rvInfoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6, marginBottom: 6, flexWrap: "wrap" },
  rvInfoText: { fontSize: 13, fontWeight: "600", flex: 1 },
  rvTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  rvTypeText: { fontSize: 11, fontWeight: "600" },
  ratingRow: { flexDirection: "row", gap: 2, marginBottom: 8 },
  cardStory: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  authorText: { fontSize: 13, fontStyle: "italic" },
  helpfulBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, gap: 4 },
  helpfulText: { fontSize: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: "600" },
  emptySubtext: { fontSize: 14 },
  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: "700" },
  modalPost: { fontSize: 16, fontWeight: "700" },
  formContent: { padding: 20 },
  formLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  formInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  pickerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerList: { borderWidth: 1, borderRadius: 10, marginTop: 4, overflow: "hidden" },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10 },
  pickerItemText: { fontSize: 15 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryOption: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", gap: 6 },
  categoryOptionText: { fontSize: 13, fontWeight: "600" },
  ratingPicker: { flexDirection: "row", gap: 4 },
  starBtn: { padding: 4 },
  storyInput: { height: 140, textAlignVertical: "top", paddingTop: 12 },
});
