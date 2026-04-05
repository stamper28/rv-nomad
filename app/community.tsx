import React, { useState, useCallback, useMemo } from "react";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type PostCategory = "tip" | "question" | "meetup" | "photo" | "review";

const CATEGORY_CONFIG: Record<PostCategory, { label: string; color: string; icon: string }> = {
  tip: { label: "Tip", color: "#2E7D32", icon: "lightbulb" },
  question: { label: "Question", color: "#1565C0", icon: "help" },
  meetup: { label: "Meetup", color: "#6A1B9A", icon: "groups" },
  photo: { label: "Photo", color: "#E65100", icon: "photo-camera" },
  review: { label: "Review", color: "#F9A825", icon: "star" },
};

// Local sample posts as fallback
const SAMPLE_POSTS = [
  {
    id: "s1", authorName: "RoadWarrior_Mike", timeAgo: "2h ago",
    category: "tip" as PostCategory, title: "Best way to level your RV on uneven ground",
    body: "After years of trial and error, here's my method: Use Lynx Levelers (orange stackable blocks). Drive your low side onto them until your bubble level reads center. Then deploy your stabilizer jacks. Don't forget to chock your wheels first!",
    likeCount: 47, replyCount: 12, liked: false, replies: [],
  },
  {
    id: "s2", authorName: "FullTimeNomad_Sarah", timeAgo: "4h ago",
    category: "question" as PostCategory, title: "Solar panel recommendations for boondocking?",
    body: "We're planning to go full-time boondocking in our 2024 Grand Design Imagine. Currently have no solar setup. Looking for recommendations — how many watts do you run? Rigid or flexible panels? Budget is around $2,000.",
    likeCount: 23, replyCount: 31, liked: false, replies: [],
  },
  {
    id: "s3", authorName: "DesertDwellers", timeAgo: "6h ago",
    category: "meetup" as PostCategory, title: "Quartzsite RV Meetup — January 2027",
    body: "Planning our annual Quartzsite meetup! We'll be at the BLM land south of town (La Posa South LTVA). Dates: Jan 15-22, 2027. Potluck Saturday night, group hike Sunday morning. All RV types welcome!",
    likeCount: 89, replyCount: 45, liked: false, replies: [],
  },
  {
    id: "s4", authorName: "MountainMan_Tom", timeAgo: "8h ago",
    category: "review" as PostCategory, title: "Yellowstone Fishing Bridge RV Park — Honest Review",
    body: "Just spent a week here. Pros: Location is unbeatable, full hookups, clean restrooms. Cons: Sites are TIGHT, expensive ($80/night), need to book 6+ months ahead. WiFi is basically non-existent.",
    likeCount: 56, replyCount: 18, liked: false, replies: [],
  },
  {
    id: "s5", authorName: "NewbieRVer_Lisa", timeAgo: "12h ago",
    category: "question" as PostCategory, title: "First time dumping tanks — any tips?",
    body: "We just bought our first travel trailer and I'm honestly nervous about dumping the tanks. Any tips for a complete beginner? What supplies do I need?",
    likeCount: 34, replyCount: 52, liked: false, replies: [],
  },
  {
    id: "s6", authorName: "VintageAirstream_Joe", timeAgo: "1d ago",
    category: "tip" as PostCategory, title: "Save money on propane — refill vs exchange",
    body: "PSA: ALWAYS refill your propane tanks instead of exchanging them at Blue Rhino/AmeriGas. Exchange tanks are only filled to 15 lbs (not 20). A refill costs $3-4/gallon vs $5-6 for an exchange. Over a year of full-timing, I saved over $400.",
    likeCount: 112, replyCount: 28, liked: false, replies: [],
  },
  {
    id: "s7", authorName: "CoastToCoast_Family", timeAgo: "1d ago",
    category: "photo" as PostCategory, title: "Sunset at Big Sur — our campsite view",
    body: "Pulled into Kirk Creek Campground right at golden hour. No hookups, no WiFi, no cell service — and honestly? Best campsite we've ever had. $35/night, first-come-first-served.",
    likeCount: 203, replyCount: 34, liked: false, replies: [],
  },
  {
    id: "s8", authorName: "DieselPusher_Dan", timeAgo: "2d ago",
    category: "tip" as PostCategory, title: "Weight your RV before every long trip",
    body: "I cannot stress this enough — get your RV weighed at a CAT Scale before every major trip. I was 2,000 lbs over my GVWR and didn't know it. Cost is only $12.50 and it could save your life.",
    likeCount: 78, replyCount: 15, liked: false, replies: [],
  },
];

export default function CommunityScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState<PostCategory>("tip");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});

  // Backend queries
  const postsQuery = trpc.community.posts.useQuery(
    { category: selectedCategory === "all" ? undefined : selectedCategory, limit: 50 },
    { refetchOnWindowFocus: false }
  );
  const createPostMutation = trpc.community.createPost.useMutation();
  const likePostMutation = trpc.community.togglePostLike.useMutation();
  const replyMutation = trpc.community.createReply.useMutation();

  // Merge backend posts with sample data
  const allPosts = useMemo(() => {
    const backend = (postsQuery.data || []).map((p: any) => ({
      id: `db-${p.id}`,
      dbId: p.id,
      authorName: p.authorName || "Anonymous",
      timeAgo: getTimeAgo(p.createdAt),
      category: p.category as PostCategory,
      title: p.title,
      body: p.body,
      likeCount: p.likeCount || 0,
      replyCount: p.replyCount || 0,
      liked: false,
      replies: (p.replies || []).map((r: any) => ({
        id: r.id,
        authorName: r.authorName || "Anonymous",
        body: r.body,
        timeAgo: getTimeAgo(r.createdAt),
        likeCount: r.likeCount || 0,
      })),
    }));
    const filtered = selectedCategory === "all"
      ? SAMPLE_POSTS
      : SAMPLE_POSTS.filter((p) => p.category === selectedCategory);
    return [...backend, ...filtered];
  }, [postsQuery.data, selectedCategory]);

  const handleLike = useCallback((postId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));
    // If it's a backend post, send like to server
    if (postId.startsWith("db-")) {
      const dbId = parseInt(postId.replace("db-", ""));
      likePostMutation.mutate({ postId: dbId });
    }
  }, []);

  const handleNewPost = useCallback(async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to create a post.");
      return;
    }
    try {
      await createPostMutation.mutateAsync({
        title: newTitle.trim(),
        body: newBody.trim(),
        category: newCategory,
      });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewTitle("");
      setNewBody("");
      setShowNewPost(false);
      postsQuery.refetch();
    } catch {
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  }, [newTitle, newBody, newCategory, user]);

  const handleReply = useCallback(async (postId: string) => {
    if (!replyText.trim()) return;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to reply.");
      return;
    }
    if (postId.startsWith("db-")) {
      const dbId = parseInt(postId.replace("db-", ""));
      try {
        await replyMutation.mutateAsync({ postId: dbId, body: replyText.trim() });
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setReplyText("");
        postsQuery.refetch();
      } catch {
        Alert.alert("Error", "Failed to post reply.");
      }
    } else {
      // Local sample post reply (just show success)
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Reply Sent", "Your reply has been posted.");
      setReplyText("");
    }
  }, [replyText, user]);

  const renderPost = ({ item }: { item: typeof allPosts[0] }) => {
    const catConfig = CATEGORY_CONFIG[item.category as PostCategory] || CATEGORY_CONFIG.tip;
    const isExpanded = expandedPost === item.id;
    const isLiked = localLikes[item.id] || item.liked;
    const likeCount = item.likeCount + (localLikes[item.id] && !item.liked ? 1 : 0);
    const initials = item.authorName.slice(0, 2).toUpperCase();

    return (
      <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={[styles.avatar, { backgroundColor: catConfig.color + "20" }]}>
            <Text style={[styles.avatarText, { color: catConfig.color }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.authorName, { color: colors.foreground }]}>{item.authorName}</Text>
            <Text style={[styles.timeAgo, { color: colors.muted }]}>{item.timeAgo}</Text>
          </View>
          <View style={[styles.categoryTag, { backgroundColor: catConfig.color + "15" }]}>
            <MaterialIcons name={catConfig.icon as any} size={12} color={catConfig.color} />
            <Text style={[styles.categoryTagText, { color: catConfig.color }]}>{catConfig.label}</Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={[styles.postTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.postBody, { color: colors.muted }]} numberOfLines={isExpanded ? undefined : 4}>{item.body}</Text>

        {/* Post Actions */}
        <View style={[styles.postActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)} activeOpacity={0.7}>
            <MaterialIcons name={isLiked ? "favorite" : "favorite-border"} size={20} color={isLiked ? colors.error : colors.muted} />
            <Text style={[styles.actionText, { color: isLiked ? colors.error : colors.muted }]}>{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setExpandedPost(isExpanded ? null : item.id)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chat-bubble-outline" size={18} color={isExpanded ? colors.primary : colors.muted} />
            <Text style={[styles.actionText, { color: isExpanded ? colors.primary : colors.muted }]}>
              {item.replyCount} {isExpanded ? "Hide" : "Reply"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <MaterialIcons name="share" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Expanded Replies */}
        {isExpanded && (
          <View style={[styles.repliesSection, { borderTopColor: colors.border }]}>
            {/* Existing Replies */}
            {(item.replies || []).length > 0 && (
              <View style={styles.repliesList}>
                {item.replies.map((reply: any) => (
                  <View key={reply.id} style={[styles.replyCard, { backgroundColor: colors.background }]}>
                    <View style={styles.replyHeader}>
                      <View style={[styles.replyAvatar, { backgroundColor: colors.primary + "15" }]}>
                        <Text style={[styles.replyAvatarText, { color: colors.primary }]}>
                          {(reply.authorName || "AN").slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.replyAuthor, { color: colors.foreground }]}>{reply.authorName}</Text>
                      <Text style={[styles.replyTime, { color: colors.muted }]}>{reply.timeAgo}</Text>
                    </View>
                    <Text style={[styles.replyBody, { color: colors.muted }]}>{reply.body}</Text>
                    <TouchableOpacity style={styles.replyLikeBtn} activeOpacity={0.7}>
                      <MaterialIcons name="thumb-up" size={12} color={colors.muted} />
                      <Text style={[styles.replyLikeText, { color: colors.muted }]}>{reply.likeCount || 0}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Reply Input */}
            <View style={styles.replyInputRow}>
              <TextInput
                style={[styles.replyInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Write a reply..."
                placeholderTextColor={colors.muted}
                value={replyText}
                onChangeText={setReplyText}
                returnKeyType="send"
                onSubmitEditing={() => handleReply(item.id)}
              />
              <TouchableOpacity
                onPress={() => handleReply(item.id)}
                style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: replyText.trim() ? 1 : 0.4 }]}
                disabled={!replyText.trim()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
        {(Object.keys(CATEGORY_CONFIG) as PostCategory[]).map((cat) => {
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {(Object.keys(CATEGORY_CONFIG) as PostCategory[]).map((cat) => {
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
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Loading indicator */}
      {postsQuery.isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading community posts...</Text>
        </View>
      )}

      {/* Posts Feed */}
      <FlatList
        data={allPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function getTimeAgo(dateStr: string | Date | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const mm = String(date.getMonth()+1).padStart(2,'0');
  const dd = String(date.getDate()).padStart(2,'0');
  return `${mm}-${dd}-${date.getFullYear()}`;
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
  // Replies
  repliesSection: { borderTopWidth: 0.5, paddingTop: 10, marginTop: 4 },
  repliesList: { gap: 8, marginBottom: 10 },
  replyCard: { borderRadius: 10, padding: 10, gap: 4 },
  replyHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  replyAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  replyAvatarText: { fontSize: 10, fontWeight: "800" },
  replyAuthor: { fontSize: 13, fontWeight: "700", flex: 1 },
  replyTime: { fontSize: 11 },
  replyBody: { fontSize: 13, lineHeight: 18, paddingLeft: 30 },
  replyLikeBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 30, marginTop: 2 },
  replyLikeText: { fontSize: 11 },
  replyInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  replyInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  // New Post
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
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10 },
  loadingText: { fontSize: 13 },
});
