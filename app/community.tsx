import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Types ──
interface Post {
  id: string;
  author: string;
  avatar: string; // initials
  timeAgo: string;
  category: "tip" | "question" | "meetup" | "photo" | "review";
  title: string;
  body: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const CATEGORY_CONFIG: Record<Post["category"], { label: string; color: string; icon: string }> = {
  tip: { label: "Tip", color: "#2E7D32", icon: "lightbulb" },
  question: { label: "Question", color: "#1565C0", icon: "help" },
  meetup: { label: "Meetup", color: "#6A1B9A", icon: "groups" },
  photo: { label: "Photo", color: "#E65100", icon: "photo-camera" },
  review: { label: "Review", color: "#F9A825", icon: "star" },
};

// ── Sample Data ──
const INITIAL_POSTS: Post[] = [
  {
    id: "1", author: "RoadWarrior_Mike", avatar: "RM", timeAgo: "2h ago",
    category: "tip", title: "Best way to level your RV on uneven ground",
    body: "After years of trial and error, here's my method: Use Lynx Levelers (orange stackable blocks). Drive your low side onto them until your bubble level reads center. Then deploy your stabilizer jacks. Don't forget to chock your wheels first! This method works for any Class C or travel trailer.",
    likes: 47, comments: 12, liked: false,
  },
  {
    id: "2", author: "FullTimeNomad_Sarah", avatar: "FS", timeAgo: "4h ago",
    category: "question", title: "Solar panel recommendations for boondocking?",
    body: "We're planning to go full-time boondocking in our 2024 Grand Design Imagine. Currently have no solar setup. Looking for recommendations — how many watts do you run? Rigid or flexible panels? What charge controller? Budget is around $2,000 for the whole setup.",
    likes: 23, comments: 31, liked: false,
  },
  {
    id: "3", author: "DesertDwellers", avatar: "DD", timeAgo: "6h ago",
    category: "meetup", title: "Quartzsite RV Meetup — January 2027",
    body: "Planning our annual Quartzsite meetup! We'll be at the BLM land south of town (La Posa South LTVA). Dates: Jan 15-22, 2027. Potluck Saturday night, group hike Sunday morning. All RV types welcome. Drop a comment if you're coming!",
    likes: 89, comments: 45, liked: false,
  },
  {
    id: "4", author: "MountainMan_Tom", avatar: "MT", timeAgo: "8h ago",
    category: "review", title: "Yellowstone Fishing Bridge RV Park — Honest Review",
    body: "Just spent a week here. Pros: Location is unbeatable (right in the park), full hookups, clean restrooms, bear-proof food storage. Cons: Sites are TIGHT (barely fit our 32ft Class C), expensive ($80/night), and you need to book 6+ months ahead. WiFi is basically non-existent. Worth it for the experience but not for the value.",
    likes: 56, comments: 18, liked: false,
  },
  {
    id: "5", author: "NewbieRVer_Lisa", avatar: "NL", timeAgo: "12h ago",
    category: "question", title: "First time dumping tanks — any tips?",
    body: "We just bought our first travel trailer and I'm honestly nervous about dumping the tanks. Any tips for a complete beginner? What supplies do I need? How do I avoid... disasters? 😅",
    likes: 34, comments: 52, liked: false,
  },
  {
    id: "6", author: "VintageAirstream_Joe", avatar: "VJ", timeAgo: "1d ago",
    category: "tip", title: "Save money on propane — refill vs exchange",
    body: "PSA: ALWAYS refill your propane tanks instead of exchanging them at Blue Rhino/AmeriGas. Exchange tanks are only filled to 15 lbs (not 20). A refill at a local propane dealer costs $3-4/gallon vs $5-6 for an exchange. Over a year of full-timing, I saved over $400. Most U-Haul locations also do refills.",
    likes: 112, comments: 28, liked: false,
  },
  {
    id: "7", author: "CoastToCoast_Family", avatar: "CF", timeAgo: "1d ago",
    category: "photo", title: "Sunset at Big Sur — our campsite view",
    body: "Pulled into Kirk Creek Campground right at golden hour. No hookups, no WiFi, no cell service — and honestly? Best campsite we've ever had. $35/night, first-come-first-served. Get there early on weekdays. The Pacific Ocean is literally 50 feet from your site.",
    likes: 203, comments: 34, liked: false,
  },
  {
    id: "8", author: "DieselPusher_Dan", avatar: "DD", timeAgo: "2d ago",
    category: "tip", title: "Weight your RV before every long trip",
    body: "I cannot stress this enough — get your RV weighed at a CAT Scale before every major trip. I was 2,000 lbs over my GVWR and didn't know it. That's dangerous for tires, brakes, and handling. Cost is only $12.50 and it could save your life. Use the Weigh My Truck app to find locations.",
    likes: 78, comments: 15, liked: false,
  },
];

export default function CommunityScreen() {
  const colors = useColors();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<Post["category"] | "all">("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState<Post["category"]>("tip");

  const filteredPosts = selectedCategory === "all"
    ? posts
    : posts.filter((p) => p.category === selectedCategory);

  const handleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, []);

  const handleNewPost = useCallback(() => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      author: "You",
      avatar: "YO",
      timeAgo: "Just now",
      category: newCategory,
      title: newTitle.trim(),
      body: newBody.trim(),
      likes: 0,
      comments: 0,
      liked: false,
    };
    setPosts((prev) => [post, ...prev]);
    setNewTitle("");
    setNewBody("");
    setShowNewPost(false);
  }, [newTitle, newBody, newCategory]);

  const renderPost = ({ item }: { item: Post }) => {
    const catConfig = CATEGORY_CONFIG[item.category];
    return (
      <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{item.avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.authorName, { color: colors.foreground }]}>{item.author}</Text>
            <Text style={[styles.timeAgo, { color: colors.muted }]}>{item.timeAgo}</Text>
          </View>
          <View style={[styles.categoryTag, { backgroundColor: catConfig.color + "15" }]}>
            <MaterialIcons name={catConfig.icon as any} size={12} color={catConfig.color} />
            <Text style={[styles.categoryTagText, { color: catConfig.color }]}>{catConfig.label}</Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={[styles.postTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.postBody, { color: colors.muted }]} numberOfLines={4}>{item.body}</Text>

        {/* Post Actions */}
        <View style={[styles.postActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(item.id)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={item.liked ? "favorite" : "favorite-border"}
              size={20}
              color={item.liked ? colors.error : colors.muted}
            />
            <Text style={[styles.actionText, { color: item.liked ? colors.error : colors.muted }]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <MaterialIcons name="chat-bubble-outline" size={18} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.muted }]}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <MaterialIcons name="share" size={18} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.muted }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Community</Text>
        <TouchableOpacity onPress={() => setShowNewPost(!showNewPost)} style={styles.newPostBtn}>
          <MaterialIcons name="edit" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity
          onPress={() => setSelectedCategory("all")}
          style={[styles.filterChip, { backgroundColor: selectedCategory === "all" ? colors.primary : colors.surface, borderColor: selectedCategory === "all" ? colors.primary : colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, { color: selectedCategory === "all" ? "#fff" : colors.foreground }]}>All</Text>
        </TouchableOpacity>
        {(Object.keys(CATEGORY_CONFIG) as Post["category"][]).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.filterChip, { backgroundColor: isActive ? cfg.color : colors.surface, borderColor: isActive ? cfg.color : colors.border }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name={cfg.icon as any} size={14} color={isActive ? "#fff" : cfg.color} />
              <Text style={[styles.filterChipText, { color: isActive ? "#fff" : colors.foreground }]}>{cfg.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* New Post Form */}
      {showNewPost && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.newPostForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.newPostTitle, { color: colors.foreground }]}>New Post</Text>
            {/* Category Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {(Object.keys(CATEGORY_CONFIG) as Post["category"][]).map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const isActive = newCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    style={[styles.catSelectChip, { backgroundColor: isActive ? cfg.color : "transparent", borderColor: cfg.color }]}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: isActive ? "#fff" : cfg.color, fontSize: 12, fontWeight: "600" }}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Post title..."
              placeholderTextColor={colors.muted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, styles.bodyInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Share your thoughts, tips, or questions..."
              placeholderTextColor={colors.muted}
              value={newBody}
              onChangeText={setNewBody}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.newPostActions}>
              <TouchableOpacity onPress={() => setShowNewPost(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNewPost}
                style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: newTitle.trim() && newBody.trim() ? 1 : 0.5 }]}
                disabled={!newTitle.trim() || !newBody.trim()}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Posts Feed */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  newPostBtn: { padding: 4 },
  filterScroll: { marginBottom: 8 },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: "600" },
  postCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 8,
  },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "800" },
  authorName: { fontSize: 14, fontWeight: "700" },
  timeAgo: { fontSize: 12 },
  categoryTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  categoryTagText: { fontSize: 11, fontWeight: "700" },
  postTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  postBody: { fontSize: 14, lineHeight: 20 },
  postActions: {
    flexDirection: "row", gap: 20, paddingTop: 10, borderTopWidth: 0.5,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 13, fontWeight: "600" },
  newPostForm: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 8,
  },
  newPostTitle: { fontSize: 16, fontWeight: "700" },
  catSelectChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1,
    marginRight: 6,
  },
  input: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14,
  },
  bodyInput: { minHeight: 80 },
  newPostActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1,
  },
  submitBtn: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8,
  },
});
