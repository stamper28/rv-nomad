import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite, type SiteReview } from "@/lib/types";
import { getSiteImageUrl } from "@/lib/site-images";
import { Store } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { getMembershipInfo } from "@/lib/affiliate";

export default function SiteDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ siteId: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const [site, setSite] = useState<CampSite | undefined>(undefined);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRigType, setReviewRigType] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [wantsCancellationAlert, setWantsCancellationAlert] = useState(false);

  // Fetch backend reviews
  const backendReviews = trpc.reviews.forSite.useQuery(
    { siteId: params.siteId || "" },
    { enabled: !!params.siteId }
  );
  const submitReviewMutation = trpc.reviews.create.useMutation();
  const voteHelpfulMutation = trpc.reviews.voteHelpful.useMutation();

  useEffect(() => {
    import("@/lib/all-sites-data").then((mod) => {
      const found = mod.ALL_SITES.find((s: CampSite) => s.id === params.siteId);
      setSite(found);
    });
  }, [params.siteId]);

  useEffect(() => {
    if (site) {
      Store.getSavedSites().then((saved) => {
        setIsSaved(saved.includes(site.id));
      });
    }
  }, [site?.id]);

  const toggleSave = useCallback(async () => {
    if (!site) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = await Store.toggleSavedSite(site.id);
    setIsSaved(next.includes(site.id));
  }, [site?.id]);

  const handleSubmitReview = useCallback(async () => {
    if (!site || !reviewBody.trim()) return;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to submit a review.");
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReviewMutation.mutateAsync({
        siteId: site.id,
        siteName: site.name,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        body: reviewBody.trim(),
        rigType: reviewRigType.trim() || undefined,
      });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowReviewForm(false);
      setReviewTitle("");
      setReviewBody("");
      setReviewRigType("");
      setReviewRating(5);
      backendReviews.refetch();
    } catch {
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }, [site, reviewRating, reviewTitle, reviewBody, reviewRigType, user]);

  if (!site) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.muted }]}>Site not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary, marginTop: 12 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const catColor = CATEGORY_COLORS[site.category];
  const membership = getMembershipInfo(site.category);
  // Combine static reviews with backend reviews
  const allReviews = [
    ...(backendReviews.data || []).map((r: any) => ({
      id: `db-${r.id}`,
      author: r.authorName || "Anonymous",
      date: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "",
      rating: r.rating,
      title: r.title || "",
      body: r.body,
      rigType: r.rigType,
      helpful: r.helpfulCount || 0,
      dbId: r.id,
    })),
    ...(site.reviews || []),
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleSave} style={styles.actionBtnH}>
            <IconSymbol name={isSaved ? "heart.fill" : "heart"} size={22} color={isSaved ? colors.error : colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnH}>
            <IconSymbol name="square.and.arrow.up" size={22} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Image */}
        <Image source={{ uri: getSiteImageUrl(site.id, site.category, site.state) }} style={styles.heroImage} contentFit="cover" transition={300} />

        {/* Hero Info */}
        <View style={[styles.hero, { backgroundColor: catColor + "15" }]}>
          <View style={[styles.catBadge, { backgroundColor: catColor + "25" }]}>
            <Text style={[styles.catBadgeText, { color: catColor }]}>{CATEGORY_LABELS[site.category].toUpperCase()}</Text>
          </View>
          <Text style={[styles.siteName, { color: colors.foreground }]}>{site.name}</Text>
          <Text style={[styles.siteLocation, { color: colors.muted }]}>{site.city}, {site.state}</Text>

          {/* Military ID Notice */}
          {site.category === "military" && (
            <View style={[styles.noticeBanner, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
              <MaterialIcons name="verified-user" size={16} color={colors.warning} />
              <Text style={[styles.noticeBannerText, { color: colors.warning }]}>Military ID required to access base and campground</Text>
            </View>
          )}

          {/* Membership Notice */}
          {membership && site.category !== "military" && (
            <View style={[styles.noticeBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <MaterialIcons name="card-membership" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeBannerText, { color: colors.primary }]}>
                  {membership.name} membership required — {membership.cost}
                </Text>
                <Text style={[styles.noticeSub, { color: colors.muted }]}>{membership.description}</Text>
                {site.affiliateUrl && (
                  <TouchableOpacity onPress={() => Linking.openURL(site.affiliateUrl!)} style={styles.joinBtn}>
                    <Text style={[styles.joinBtnText, { color: colors.primary }]}>Join {membership.name}</Text>
                    <MaterialIcons name="open-in-new" size={12} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="star.fill" size={18} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{site.rating}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{site.reviewCount} reviews</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="dollarsign.circle.fill" size={18} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {site.pricePerNight === null ? "Free" : `$${site.pricePerNight}`}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{site.pricePerNight === null ? "No cost" : "per night"}</Text>
            </View>
            {site.elevation != null && (
              <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialIcons name="terrain" size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{site.elevation.toLocaleString()}'</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>elevation</Text>
              </View>
            )}
          </View>

          {/* New: Pet / Noise / Cell / Crowd / Season Info */}
          {(site.petFriendly != null || site.noiseLevel || site.crowdLevel || site.bestSeason) && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Campground Info</Text>
              <View style={styles.infoGrid}>
                {site.petFriendly != null && (
                  <View style={[styles.infoChip, { backgroundColor: site.petFriendly ? colors.success + "12" : colors.error + "12" }]}>
                    <MaterialIcons name="pets" size={14} color={site.petFriendly ? colors.success : colors.error} />
                    <Text style={[styles.infoChipText, { color: site.petFriendly ? colors.success : colors.error }]}>
                      {site.petFriendly === true ? "Pet Friendly" : site.petFriendly === false ? "No Pets" : site.petFriendly === "leash_only" ? "Pets (Leash Only)" : "Off-Leash Area"}
                    </Text>
                  </View>
                )}
                {site.noiseLevel && (
                  <View style={[styles.infoChip, { backgroundColor: site.noiseLevel === "quiet" ? colors.success + "12" : site.noiseLevel === "moderate" ? colors.warning + "12" : colors.error + "12" }]}>
                    <MaterialIcons name={site.noiseLevel === "quiet" ? "volume-off" : site.noiseLevel === "moderate" ? "volume-down" : "volume-up"} size={14} color={site.noiseLevel === "quiet" ? colors.success : site.noiseLevel === "moderate" ? colors.warning : colors.error} />
                    <Text style={[styles.infoChipText, { color: site.noiseLevel === "quiet" ? colors.success : site.noiseLevel === "moderate" ? colors.warning : colors.error }]}>
                      {site.noiseLevel === "quiet" ? "Quiet" : site.noiseLevel === "moderate" ? "Moderate Noise" : "Noisy"}
                    </Text>
                  </View>
                )}
                {site.crowdLevel && (
                  <View style={[styles.infoChip, { backgroundColor: site.crowdLevel === "low" ? colors.success + "12" : site.crowdLevel === "moderate" ? colors.warning + "12" : colors.error + "12" }]}>
                    <MaterialIcons name="groups" size={14} color={site.crowdLevel === "low" ? colors.success : site.crowdLevel === "moderate" ? colors.warning : colors.error} />
                    <Text style={[styles.infoChipText, { color: site.crowdLevel === "low" ? colors.success : site.crowdLevel === "moderate" ? colors.warning : colors.error }]}>
                      {site.crowdLevel === "low" ? "Low Crowds" : site.crowdLevel === "moderate" ? "Moderate Crowds" : "High Crowds"}
                    </Text>
                  </View>
                )}
                {site.bestSeason && (
                  <View style={[styles.infoChip, { backgroundColor: colors.primary + "12" }]}>
                    <MaterialIcons name="event" size={14} color={colors.primary} />
                    <Text style={[styles.infoChipText, { color: colors.primary }]}>Best: {site.bestSeason}</Text>
                  </View>
                )}
                {site.waterQuality && (
                  <View style={[styles.infoChip, { backgroundColor: site.waterQuality === "potable" ? colors.success + "12" : colors.warning + "12" }]}>
                    <MaterialIcons name="water-drop" size={14} color={site.waterQuality === "potable" ? colors.success : colors.warning} />
                    <Text style={[styles.infoChipText, { color: site.waterQuality === "potable" ? colors.success : colors.warning }]}>
                      {site.waterQuality === "potable" ? "Potable Water" : site.waterQuality === "non_potable" ? "Non-Potable Water" : site.waterQuality === "bring_own" ? "Bring Your Own Water" : "Water Quality Unknown"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Cell Signal */}
          {site.cellSignal && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cell Signal</Text>
              <View style={styles.signalRow}>
                {(["att", "verizon", "tmobile"] as const).map((carrier) => {
                  const bars = site.cellSignal?.[carrier] ?? 0;
                  const label = carrier === "att" ? "AT&T" : carrier === "verizon" ? "Verizon" : "T-Mobile";
                  const barColor = bars >= 4 ? colors.success : bars >= 2 ? colors.warning : colors.error;
                  return (
                    <View key={carrier} style={[styles.signalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.signalLabel, { color: colors.foreground }]}>{label}</Text>
                      <View style={styles.barsRow}>
                        {[1, 2, 3, 4, 5].map((b) => (
                          <View key={b} style={[styles.bar, { height: 6 + b * 4, backgroundColor: b <= bars ? barColor : colors.border }]} />
                        ))}
                      </View>
                      <Text style={[styles.signalBars, { color: colors.muted }]}>{bars}/5 bars</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.description, { color: colors.muted }]}>{site.description}</Text>
          </View>

          {/* Amenities */}
          {site.amenities.length > 0 && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {site.amenities.map((a, i) => (
                  <View key={i} style={[styles.amenityChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
                    <Text style={[styles.amenityText, { color: colors.foreground }]}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* RV Size Limits */}
          {(site.maxRVLength || site.maxTrailerLength || site.maxRVHeight) && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>RV Size Limits</Text>
              <View style={styles.limitsGrid}>
                {site.maxRVLength && (
                  <View style={[styles.limitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={styles.limitIcon}>📏</Text>
                    <Text style={[styles.limitLabel, { color: colors.muted }]}>Max RV Length</Text>
                    <Text style={[styles.limitValue, { color: colors.foreground }]}>{site.maxRVLength}</Text>
                  </View>
                )}
                {site.maxTrailerLength && (
                  <View style={[styles.limitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={styles.limitIcon}>🚛</Text>
                    <Text style={[styles.limitLabel, { color: colors.muted }]}>Max Trailer</Text>
                    <Text style={[styles.limitValue, { color: colors.foreground }]}>{site.maxTrailerLength}</Text>
                  </View>
                )}
                {site.maxRVHeight && (
                  <View style={[styles.limitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={styles.limitIcon}>📐</Text>
                    <Text style={[styles.limitLabel, { color: colors.muted }]}>Max Height</Text>
                    <Text style={[styles.limitValue, { color: colors.foreground }]}>{site.maxRVHeight}</Text>
                  </View>
                )}
              </View>
              <View style={styles.rigTags}>
                {site.pullThrough && (
                  <View style={[styles.rigTag, { backgroundColor: colors.success + "15" }]}>
                    <Text style={[styles.rigTagText, { color: colors.success }]}>Pull-Through Sites</Text>
                  </View>
                )}
                {site.bigRigFriendly && (
                  <View style={[styles.rigTag, { backgroundColor: colors.primary + "15" }]}>
                    <Text style={[styles.rigTagText, { color: colors.primary }]}>Big Rig Friendly</Text>
                  </View>
                )}
                {site.bigRigFriendly === false && (
                  <View style={[styles.rigTag, { backgroundColor: colors.warning + "15" }]}>
                    <Text style={[styles.rigTagText, { color: colors.warning }]}>Not Big Rig Friendly</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Discounts */}
          {site.discounts && site.discounts.length > 0 && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Discounts Available</Text>
              <View style={styles.discountRow}>
                {site.discounts.map((d, i) => {
                  const info = getMembershipInfo(d);
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.discountBadge, { backgroundColor: colors.primary + "15" }]}
                      onPress={() => info?.url ? Linking.openURL(info.url) : null}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="loyalty" size={14} color={colors.primary} />
                      <Text style={[styles.discountText, { color: colors.primary }]}>
                        {d === "passport_america" ? "Passport America" : d === "good_sam" ? "Good Sam" : d === "military" ? "Military" : d}
                      </Text>
                      {info && <MaterialIcons name="open-in-new" size={10} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Contact */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact</Text>
            {site.phone && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${site.phone}`)}>
                <IconSymbol name="phone.fill" size={16} color={colors.primary} />
                <Text style={[styles.contactText, { color: colors.primary }]}>{site.phone}</Text>
              </TouchableOpacity>
            )}
            {site.website && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(site.website!)}>
                <IconSymbol name="globe" size={16} color={colors.primary} />
                <Text style={[styles.contactText, { color: colors.primary }]} numberOfLines={1}>{site.website}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cancellation Alert */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.alertBtn, { backgroundColor: wantsCancellationAlert ? colors.success + "15" : colors.surface, borderColor: wantsCancellationAlert ? colors.success : colors.border }]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWantsCancellationAlert(!wantsCancellationAlert);
                if (!wantsCancellationAlert) {
                  Alert.alert("Alert Set", `We'll notify you when a site opens at ${site.name}.`);
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name={wantsCancellationAlert ? "notifications-active" : "notifications-none"} size={20} color={wantsCancellationAlert ? colors.success : colors.muted} />
              <Text style={[styles.alertBtnText, { color: wantsCancellationAlert ? colors.success : colors.muted }]}>
                {wantsCancellationAlert ? "Cancellation Alert Set" : "Notify Me When a Site Opens"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reviews</Text>
              <TouchableOpacity
                onPress={() => setShowReviewForm(!showReviewForm)}
                style={[styles.writeReviewBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <MaterialIcons name="rate-review" size={14} color="#fff" />
                <Text style={styles.writeReviewBtnText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {/* Review Form */}
            {showReviewForm && (
              <View style={[styles.reviewForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.reviewFormTitle, { color: colors.foreground }]}>Your Review</Text>
                {/* Star Rating */}
                <View style={styles.starRatingRow}>
                  <Text style={[styles.starLabel, { color: colors.muted }]}>Rating:</Text>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                      <MaterialIcons name={star <= reviewRating ? "star" : "star-border"} size={28} color={star <= reviewRating ? "#F59E0B" : colors.border} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.reviewInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Review title (optional)"
                  placeholderTextColor={colors.muted}
                  value={reviewTitle}
                  onChangeText={setReviewTitle}
                />
                <TextInput
                  style={[styles.reviewInput, styles.reviewBodyInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Share your experience... (minimum 10 characters)"
                  placeholderTextColor={colors.muted}
                  value={reviewBody}
                  onChangeText={setReviewBody}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <TextInput
                  style={[styles.reviewInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Your rig type (e.g., Class A 38ft)"
                  placeholderTextColor={colors.muted}
                  value={reviewRigType}
                  onChangeText={setReviewRigType}
                />
                <View style={styles.reviewFormActions}>
                  <TouchableOpacity onPress={() => setShowReviewForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                    <Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmitReview}
                    style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: reviewBody.trim().length >= 10 ? 1 : 0.5 }]}
                    disabled={reviewBody.trim().length < 10 || submittingReview}
                    activeOpacity={0.8}
                  >
                    {submittingReview ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Submit Review</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Reviews List */}
            {allReviews.length > 0 ? (
              allReviews.map((review: any) => (
                <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={styles.reviewTop}>
                    <View style={styles.reviewStars}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <MaterialIcons key={i} name={i < review.rating ? "star" : "star-border"} size={14} color={i < review.rating ? "#F59E0B" : colors.border} />
                      ))}
                    </View>
                    <Text style={[styles.reviewDate, { color: colors.muted }]}>
                      {review.date ? new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </Text>
                  </View>
                  {review.title ? <Text style={[styles.reviewTitleText, { color: colors.foreground }]}>{review.title}</Text> : null}
                  <Text style={[styles.reviewBodyText, { color: colors.muted }]}>{review.body}</Text>
                  <View style={styles.reviewFooter}>
                    <Text style={[styles.reviewAuthor, { color: colors.foreground }]}>{review.author}</Text>
                    {review.rigType && (
                      <View style={[styles.rigBadge, { backgroundColor: colors.primary + "10" }]}>
                        <MaterialIcons name="directions-car" size={12} color={colors.primary} />
                        <Text style={[styles.rigBadgeText, { color: colors.primary }]}>{review.rigType}</Text>
                      </View>
                    )}
                  </View>
                  {/* Helpful button */}
                  <TouchableOpacity
                    style={styles.helpfulBtn}
                    onPress={() => {
                      if (review.dbId) {
                        voteHelpfulMutation.mutate({ reviewId: review.dbId }, { onSuccess: () => backendReviews.refetch() });
                      }
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="thumb-up" size={14} color={colors.muted} />
                    <Text style={[styles.helpfulText, { color: colors.muted }]}>
                      Helpful{review.helpful ? ` (${review.helpful})` : ""}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={[styles.noReviews, { color: colors.muted }]}>No reviews yet. Be the first to review!</Text>
            )}
          </View>

          {/* Book Now Button */}
          {site.pricePerNight !== null && site.pricePerNight > 0 && (
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colors.success }]}
              onPress={() => router.push({ pathname: "/booking", params: { siteId: site.id } })}
              activeOpacity={0.8}
            >
              <IconSymbol name="creditcard.fill" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Book Now — ${site.pricePerNight}/night</Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                const url = Platform.select({
                  ios: `maps:?daddr=${site.latitude},${site.longitude}`,
                  android: `google.navigation:q=${site.latitude},${site.longitude}`,
                  default: `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`,
                });
                Linking.openURL(url);
              }}
              activeOpacity={0.8}
            >
              <IconSymbol name="location.fill" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.primary }]}
              onPress={toggleSave}
              activeOpacity={0.8}
            >
              <IconSymbol name={isSaved ? "heart.fill" : "heart"} size={18} color={colors.primary} />
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>{isSaved ? "Saved" : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 4 },
  backBtn: { padding: 4 },
  headerActions: { flexDirection: "row", gap: 12 },
  actionBtnH: { padding: 4 },
  hero: { paddingHorizontal: 16, paddingVertical: 24, alignItems: "center", gap: 6 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: "700" },
  siteName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  siteLocation: { fontSize: 14 },
  content: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  section: { paddingBottom: 16, borderBottomWidth: 0.5 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22 },
  amenitiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  amenityText: { fontSize: 13 },
  discountRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  discountBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  discountText: { fontSize: 13, fontWeight: "600" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  contactText: { fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  primaryBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 2 },
  secondaryBtnText: { fontSize: 15, fontWeight: "700" },
  bookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 12 },
  limitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  limitCard: { width: "47%" as any, alignItems: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 1, gap: 4 },
  limitIcon: { fontSize: 20 },
  limitLabel: { fontSize: 11, fontWeight: "600" },
  limitValue: { fontSize: 16, fontWeight: "800" },
  rigTags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  rigTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rigTagText: { fontSize: 13, fontWeight: "600" },
  heroImage: { width: "100%" as any, height: 220 },
  noticeBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginTop: 10, width: "100%" as any },
  noticeBannerText: { fontSize: 13, fontWeight: "600", flex: 1 },
  noticeSub: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  joinBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  joinBtnText: { fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
  // Info grid
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  infoChipText: { fontSize: 12, fontWeight: "600" },
  // Cell signal
  signalRow: { flexDirection: "row", gap: 10 },
  signalCard: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 4 },
  signalLabel: { fontSize: 12, fontWeight: "700" },
  barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  bar: { width: 6, borderRadius: 2 },
  signalBars: { fontSize: 10 },
  // Cancellation alert
  alertBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  alertBtnText: { fontSize: 14, fontWeight: "600" },
  // Reviews
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  writeReviewBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  writeReviewBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  reviewForm: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  reviewFormTitle: { fontSize: 15, fontWeight: "700" },
  starRatingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  starLabel: { fontSize: 14, marginRight: 4 },
  reviewInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  reviewBodyInput: { minHeight: 80 },
  reviewFormActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  reviewCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 10, gap: 6 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewDate: { fontSize: 12 },
  reviewTitleText: { fontSize: 15, fontWeight: "700" },
  reviewBodyText: { fontSize: 14, lineHeight: 20 },
  reviewFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  reviewAuthor: { fontSize: 13, fontWeight: "600" },
  rigBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rigBadgeText: { fontSize: 11, fontWeight: "600" },
  helpfulBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  helpfulText: { fontSize: 12 },
  noReviews: { fontSize: 14, textAlign: "center", paddingVertical: 20 },
});
