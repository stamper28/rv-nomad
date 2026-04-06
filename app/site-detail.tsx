/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
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
  Share,
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
import { isoToDisplay } from "@/lib/date-utils";
import { calculateDiscounts, type DiscountResult } from "@/lib/discount-stacker";
import { findNearbyTrackChairs, type NearbyTrackChair } from "@/lib/nearby-track-chairs";
import { getBookingOptions, isReservable, getBookingButtonLabel } from "@/lib/affiliate-links";
import { findNearbyFuelStations, findNearbySupplyStores, findNearbyRepairShops, type NearbyFuelStation, type NearbySupplyStore, type NearbyRepairShop } from "@/lib/nearby-services";
import { openUrl } from "@/lib/open-url";
import { PhotoGallery } from "@/components/photo-gallery";
import { findNearbyRestaurants, getRestaurantCategoryInfo } from "@/lib/nearby-restaurants";
import { CellSignalSection } from "@/components/cell-signal-section";
import { AvailabilitySection } from "@/components/availability-section";
import { CampgroundChat } from "@/components/campground-chat";

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
      date: r.createdAt ? (() => { const d = new Date(r.createdAt); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return `${mm}-${dd}-${d.getFullYear()}`; })() : "",
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
          <TouchableOpacity style={styles.actionBtnH} onPress={async () => {
            if (!site) return;
            const price = (site.pricePerNight ?? 0) > 0 ? `Est. $${site.pricePerNight}/night` : "Free";
            const rating = site.rating ? `${site.rating}/5` : "";
            const amenities = site.amenities?.slice(0, 4).join(", ") || "";
            const message = `Check out ${site.name} in ${site.city}, ${site.state}!\n\n${CATEGORY_LABELS[site.category]} - ${price}${rating ? ` - ${rating} stars` : ""}${amenities ? `\nAmenities: ${amenities}` : ""}\n\nFound on RV Nomad - the best app for RV camping!`;
            try {
              await Share.share({
                message,
                title: `${site.name} - RV Nomad`,
              });
            } catch (e) {
              // user cancelled
            }
          }}>
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
                  <TouchableOpacity onPress={() => openUrl(site.affiliateUrl!)} style={styles.joinBtn}>
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
                {site.pricePerNight === null ? "Free" : `~$${site.pricePerNight}`}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{site.pricePerNight === null ? "No cost" : "est./night"}</Text>
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

          {/* Hookup & Facility Details */}
          {(site.hookupType || site.ampService || site.checkInTime || site.checkOutTime || site.adaAccessible != null || site.generatorHours || site.quietHours || site.seasonalDates) && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Facility Details</Text>
              <View style={styles.facilityGrid}>
                {site.hookupType && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="power" size={16} color={colors.primary} />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>HOOKUPS</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                        {site.hookupType === "full" ? "Full Hookup" : site.hookupType === "water_electric" ? "Water + Electric" : site.hookupType === "electric_only" ? "Electric Only" : site.hookupType === "dry" ? "Dry Camping" : "None"}
                      </Text>
                    </View>
                  </View>
                )}
                {site.ampService && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="bolt" size={16} color="#F59E0B" />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>AMP SERVICE</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                        {site.ampService === "50_30" ? "50/30 AMP" : site.ampService === "30_20" ? "30/20 AMP" : `${site.ampService} AMP`}
                      </Text>
                    </View>
                  </View>
                )}
                {site.checkInTime && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="login" size={16} color={colors.success} />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>CHECK-IN</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{site.checkInTime}</Text>
                    </View>
                  </View>
                )}
                {site.checkOutTime && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="logout" size={16} color={colors.error} />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>CHECK-OUT</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{site.checkOutTime}</Text>
                    </View>
                  </View>
                )}
                {site.seasonalDates && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="date-range" size={16} color={colors.primary} />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>SEASON</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{site.seasonalDates}</Text>
                    </View>
                  </View>
                )}
                {site.generatorHours && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="power-settings-new" size={16} color={colors.warning} />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>GENERATOR HOURS</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{site.generatorHours}</Text>
                    </View>
                  </View>
                )}
                {site.quietHours && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="volume-off" size={16} color="#7C3AED" />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>QUIET HOURS</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{site.quietHours}</Text>
                    </View>
                  </View>
                )}
                {site.ageRestriction && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="person" size={16} color="#D32F2F" />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>AGE RESTRICTION</Text>
                      <Text style={{ color: "#D32F2F", fontSize: 13, fontWeight: "700" }}>{site.ageRestriction}</Text>
                    </View>
                  </View>
                )}
                {site.boatLaunch && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="directions-boat" size={16} color="#0288D1" />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>BOAT LAUNCH</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>Available</Text>
                    </View>
                  </View>
                )}
                {site.firewood && (
                  <View style={[styles.facilityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="local-fire-department" size={16} color="#E65100" />
                    <View>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>FIREWOOD</Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{site.firewood}</Text>
                    </View>
                  </View>
                )}
              </View>
              {/* ADA Accessibility */}
              {site.adaAccessible != null && (
                <View style={{ marginTop: 10, gap: 8 }}>
                  <View style={[styles.adaBanner, { backgroundColor: site.adaAccessible ? "#1565C010" : colors.muted + "10", borderColor: site.adaAccessible ? "#1565C030" : colors.border }]}>
                    <MaterialIcons name="accessible" size={20} color={site.adaAccessible ? "#1565C0" : colors.muted} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: site.adaAccessible ? "#1565C0" : colors.muted, fontSize: 14, fontWeight: "700" }}>
                        {site.adaAccessible ? "ADA Accessible" : "Limited Accessibility"}
                      </Text>
                      {site.adaDetails && (
                        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 18 }}>{site.adaDetails}</Text>
                      )}
                    </View>
                  </View>

                  {/* Equipment Rental */}
                  {site.adaEquipmentRental && site.adaEquipmentRental.length > 0 && (
                    <View style={[styles.adaBanner, { backgroundColor: "#2E7D3210", borderColor: "#2E7D3230" }]}>
                      <MaterialIcons name="sports-handball" size={18} color="#2E7D32" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#2E7D32", fontSize: 13, fontWeight: "700", marginBottom: 4 }}>Equipment Rental Available</Text>
                        {site.adaEquipmentRental.map((item: string, idx: number) => (
                          <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <MaterialIcons name="check-circle" size={14} color="#2E7D32" />
                            <Text style={{ color: colors.foreground, fontSize: 12 }}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* ADA Map Link */}
                  {site.adaAccessible && site.adaMapUrl && (
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        openUrl(site.adaMapUrl!);
                      }}
                      style={[styles.adaBanner, { backgroundColor: "#0288D110", borderColor: "#0288D130" }]}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="map" size={18} color="#0288D1" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#0288D1", fontSize: 13, fontWeight: "700" }}>View on Google Maps</Text>
                        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>Open accessible area in Maps</Text>
                      </View>
                      <MaterialIcons name="open-in-new" size={16} color="#0288D1" />
                    </TouchableOpacity>
                  )}
                  {/* Nearby Track Chairs (within 75 miles) */}
                  {(() => {
                    const nearbyChairs = findNearbyTrackChairs(site.latitude, site.longitude, 75);
                    if (nearbyChairs.length === 0) return (
                      <TouchableOpacity
                        onPress={() => {
                          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push("/track-chairs");
                        }}
                        style={[styles.adaBanner, { backgroundColor: "#7C3AED10", borderColor: "#7C3AED30" }]}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name="accessible" size={18} color="#7C3AED" />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#7C3AED", fontSize: 13, fontWeight: "700" }}>Find Track Chairs</Text>
                          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>All-terrain wheelchairs for hiking — free at 150+ parks</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={16} color="#7C3AED" />
                      </TouchableOpacity>
                    );
                    return (
                      <View style={{ gap: 6 }}>
                        <Text style={{ color: "#7C3AED", fontSize: 14, fontWeight: "700", marginBottom: 2 }}>
                          ♿ Track Chairs Within 75 Miles ({nearbyChairs.length})
                        </Text>
                        {nearbyChairs.slice(0, 5).map((chair) => (
                          <TouchableOpacity
                            key={chair.id}
                            onPress={() => {
                              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              openUrl(chair.directionsUrl);
                            }}
                            style={[styles.adaBanner, { backgroundColor: "#7C3AED08", borderColor: "#7C3AED20" }]}
                            activeOpacity={0.7}
                          >
                            <MaterialIcons name="accessible" size={18} color="#7C3AED" />
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: "#7C3AED", fontSize: 13, fontWeight: "700" }}>{chair.parkName}</Text>
                              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
                                {chair.distanceMiles} mi · {chair.chairCount} {chair.chairType} · {chair.cost}
                              </Text>
                              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 1 }}>
                                {chair.reservationMethod} · {chair.availability}
                              </Text>
                            </View>
                            <View style={{ alignItems: "center" }}>
                              <MaterialIcons name="directions" size={20} color="#7C3AED" />
                              <Text style={{ color: "#7C3AED", fontSize: 9, fontWeight: "600" }}>Directions</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          onPress={() => {
                            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push("/track-chairs");
                          }}
                          style={{ alignSelf: "flex-start", marginTop: 4 }}
                          activeOpacity={0.7}
                        >
                          <Text style={{ color: "#7C3AED", fontSize: 12, fontWeight: "600" }}>View All Track Chair Locations →</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>
          )}

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

          {/* Discount Stacker */}
          {site.pricePerNight != null && site.pricePerNight > 0 && (() => {
            const discountResult = calculateDiscounts(site.pricePerNight!, 3, site.category, site.name);
            if (discountResult.discounts.length === 0) return null;
            return (
              <View style={[styles.section, { borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Discount Stacker</Text>
                  <View style={{ backgroundColor: colors.success + "15", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: colors.success, fontSize: 12, fontWeight: "700" }}>Save up to ${discountResult.totalSavings.toFixed(0)}/3 nights</Text>
                  </View>
                </View>

                {/* Best combo highlight */}
                {discountResult.bestCombo.length > 0 && (
                  <View style={[styles.bestComboCard, { backgroundColor: colors.success + "08", borderColor: colors.success + "30" }]}>
                    <MaterialIcons name="emoji-events" size={18} color={colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.success, fontSize: 13, fontWeight: "700" }}>Best Savings</Text>
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                        {discountResult.bestCombo.map(d => d.program).join(" + ")} = ${discountResult.bestPrice.toFixed(2)} for 3 nights
                      </Text>
                    </View>
                  </View>
                )}

                {/* All applicable discounts */}
                {discountResult.discounts.map((d, i) => {
                  const typeColor = d.type === "membership" ? colors.primary : d.type === "military" ? "#059669" : d.type === "age" ? "#7C3AED" : d.type === "seasonal" ? "#EA580C" : colors.success;
                  const typeLabel = d.type === "membership" ? "MEMBERSHIP" : d.type === "military" ? "MILITARY" : d.type === "age" ? "SENIOR" : d.type === "seasonal" ? "SEASONAL" : d.type === "length_of_stay" ? "STAY LENGTH" : "LOYALTY";
                  return (
                    <View key={i} style={[styles.discountStackCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                          <MaterialIcons name="loyalty" size={16} color={typeColor} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>{d.program}</Text>
                            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{d.description}</Text>
                          </View>
                        </View>
                        <View style={{ backgroundColor: typeColor + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ color: typeColor, fontSize: 10, fontWeight: "800" }}>{typeLabel}</Text>
                        </View>
                      </View>
                      {d.requirements && (
                        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>{d.requirements}</Text>
                      )}
                      {d.membershipCost != null && (
                        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Membership: ${d.membershipCost}/{d.membershipPeriod}</Text>
                      )}
                      {d.affiliateUrl && (
                        <TouchableOpacity
                          onPress={() => openUrl(d.affiliateUrl!)}
                          style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}
                          activeOpacity={0.7}
                        >
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>Join & Save</Text>
                          <MaterialIcons name="open-in-new" size={10} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })()}

          {/* Contact */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact</Text>
            {site.phone && (
              <TouchableOpacity style={styles.contactRow} onPress={() => openUrl(`tel:${site.phone}`)}>
                <IconSymbol name="phone.fill" size={16} color={colors.primary} />
                <Text style={[styles.contactText, { color: colors.primary }]}>{site.phone}</Text>
              </TouchableOpacity>
            )}
            {site.website && (
              <TouchableOpacity style={styles.contactRow} onPress={() => openUrl(site.website!)}>
                <IconSymbol name="globe" size={16} color={colors.primary} />
                <Text style={[styles.contactText, { color: colors.primary }]} numberOfLines={1}>{site.website}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Nearby Services */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nearby Services</Text>

            {/* Nearest Fuel Stations */}
            {(() => {
              const stations = findNearbyFuelStations(site.latitude, site.longitude, 50, 3);
              if (stations.length === 0) return null;
              return (
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <MaterialIcons name="local-gas-station" size={18} color="#E65100" />
                    <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}>Fuel Stations</Text>
                  </View>
                  {stations.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => openUrl(s.directionsUrl)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>{s.name}</Text>
                          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{s.brand} — {s.city}, {s.state}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ color: "#E65100", fontSize: 14, fontWeight: "800" }}>{s.distanceMiles} mi</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                        <View style={{ backgroundColor: "#E65100" + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ color: "#E65100", fontSize: 12, fontWeight: "700" }}>Diesel {s.currency === "CAD" ? "C" : ""}${s.diesel.toFixed(2)}</Text>
                        </View>
                        <View style={{ backgroundColor: colors.primary + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>Regular {s.currency === "CAD" ? "C" : ""}${s.regular.toFixed(2)}</Text>
                        </View>
                        {s.hasRVLanes && (
                          <View style={{ backgroundColor: colors.success + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: colors.success, fontSize: 11, fontWeight: "700" }}>RV Lanes</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        {s.hasDEF && <Text style={{ color: colors.muted, fontSize: 11 }}>DEF</Text>}
                        {s.hasShowers && <Text style={{ color: colors.muted, fontSize: 11 }}>Showers</Text>}
                        {s.hasDumpStation && <Text style={{ color: colors.muted, fontSize: 11 }}>Dump Station</Text>}
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
                        <MaterialIcons name="directions" size={14} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>Get Directions</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4, fontStyle: "italic" }}>Fuel prices are estimates{stations[0]?.currency === "CAD" ? " (CAD)" : ""}. Verify at the station.</Text>
                </View>
              );
            })()}

            {/* Nearest Camping Supply Stores */}
            {(() => {
              const stores = findNearbySupplyStores(site.latitude, site.longitude, 50, 3);
              if (stores.length === 0) return null;
              return (
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <MaterialIcons name="shopping-cart" size={18} color="#1565C0" />
                    <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}>Camping Supplies</Text>
                  </View>
                  {stores.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => openUrl(s.directionsUrl)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>{s.name}</Text>
                          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{s.brand} — {s.city}, {s.state}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ color: "#1565C0", fontSize: 14, fontWeight: "800" }}>{s.distanceMiles} mi</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {s.hasRVSupplies && (
                          <View style={{ backgroundColor: "#1565C0" + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: "#1565C0", fontSize: 11, fontWeight: "700" }}>RV Supplies</Text>
                          </View>
                        )}
                        {s.hasPropane && (
                          <View style={{ backgroundColor: "#E65100" + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: "#E65100", fontSize: 11, fontWeight: "700" }}>Propane</Text>
                          </View>
                        )}
                        {s.hasFirewood && (
                          <View style={{ backgroundColor: "#33691E" + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: "#33691E", fontSize: 11, fontWeight: "700" }}>Firewood</Text>
                          </View>
                        )}
                        {s.hasBait && (
                          <View style={{ backgroundColor: "#4527A0" + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: "#4527A0", fontSize: 11, fontWeight: "700" }}>Bait & Tackle</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>Hours: {s.hours}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
                        <MaterialIcons name="directions" size={14} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>Get Directions</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })()}

            {/* Nearest RV Repair Shops */}
            {(() => {
              const shops = findNearbyRepairShops(site.latitude, site.longitude, 75, 3);
              if (shops.length === 0) return null;
              return (
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <MaterialIcons name="build" size={18} color="#C62828" />
                    <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}>RV Repair & Service</Text>
                  </View>
                  {shops.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => openUrl(s.directionsUrl)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>{s.name}</Text>
                          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{s.brand} — {s.city}, {s.state}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ color: "#C62828", fontSize: 14, fontWeight: "800" }}>{s.distanceMiles} mi</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        {s.type === "mobile" && (
                          <View style={{ backgroundColor: colors.success + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: colors.success, fontSize: 11, fontWeight: "700" }}>Mobile Service</Text>
                          </View>
                        )}
                        {s.acceptsEmergency && (
                          <View style={{ backgroundColor: "#C62828" + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: "#C62828", fontSize: 11, fontWeight: "700" }}>Emergency OK</Text>
                          </View>
                        )}
                        <View style={{ backgroundColor: colors.primary + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>{s.type === "tire" ? "Tires" : s.type === "dealer" ? "Full Service" : s.type === "mobile" ? "Comes to You" : "General"}</Text>
                        </View>
                      </View>
                      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
                        Services: {s.services.slice(0, 4).join(", ")}{s.services.length > 4 ? " +" + (s.services.length - 4) + " more" : ""}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Hours: {s.hours}</Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <TouchableOpacity onPress={() => openUrl(`tel:${s.phone}`)} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <MaterialIcons name="phone" size={14} color={colors.primary} />
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{s.phone}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <MaterialIcons name="directions" size={14} color={colors.primary} />
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>Directions</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })()}
          </View>

          {/* Nearby Restaurants */}
          {(() => {
            const restaurants = findNearbyRestaurants(site.latitude, site.longitude, 15, 6);
            if (restaurants.length === 0) return null;
            return (
              <View style={[styles.section, { borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <MaterialIcons name="restaurant" size={18} color="#1565C0" />
                  <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "700" }}>Nearby Dining</Text>
                </View>
                {restaurants.map((r) => {
                  const catInfo = getRestaurantCategoryInfo(r.category);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => openUrl(r.directionsUrl)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <View style={{ backgroundColor: catInfo.color + "15", padding: 6, borderRadius: 8 }}>
                            <MaterialIcons name={catInfo.icon as any} size={16} color={catInfo.color} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>{r.name}</Text>
                            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>{catInfo.label} · {r.priceRange}</Text>
                          </View>
                        </View>
                        <Text style={{ color: "#1565C0", fontSize: 14, fontWeight: "800" }}>{r.distanceMiles} mi</Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {r.rvParking && (
                          <View style={{ backgroundColor: "#2E7D3215", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                            <Text style={{ color: "#2E7D32", fontSize: 10, fontWeight: "700" }}>RV Parking</Text>
                          </View>
                        )}
                        {r.open24Hours && (
                          <View style={{ backgroundColor: colors.muted + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "700" }}>Open 24hr</Text>
                          </View>
                        )}
                        {r.familyFriendly && (
                          <View style={{ backgroundColor: "#1565C015", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                            <Text style={{ color: "#1565C0", fontSize: 10, fontWeight: "700" }}>Family Friendly</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4, fontStyle: "italic" }}>Restaurant availability may vary. Verify hours before visiting.</Text>
              </View>
            );
          })()}

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

          {/* Camper Photo Gallery */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <PhotoGallery siteId={site.id} siteName={site.name} />
          </View>

          {/* Live Availability */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <AvailabilitySection siteId={site.id} siteName={site.name} />
          </View>

          {/* Cell Signal Reports */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <CellSignalSection siteId={site.id} siteName={site.name} />
          </View>

          {/* Campground Chat */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <CampgroundChat siteId={site.id} siteName={site.name} />
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
                      {review.date ? isoToDisplay(review.date) : ""}
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

          {/* Reserve Now — Affiliate Booking */}
          {(() => {
            const bookingOptions = getBookingOptions(site.category, site.name, site.state, site.city);
            const reservable = isReservable(site.category);
            return (
              <View style={{ gap: 8 }}>
                {/* Primary booking button */}
                <TouchableOpacity
                  style={[styles.bookBtn, { backgroundColor: bookingOptions.primary.color }]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    openUrl(bookingOptions.primary.url);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name={bookingOptions.primary.icon as any} size={20} color="#fff" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.primaryBtnText}>
                      {reservable ? "Reserve Now" : "View Location"} — {bookingOptions.primary.name}
                    </Text>
                    {site.pricePerNight != null && site.pricePerNight > 0 && (
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>
                        Est. ${site.pricePerNight}/night — verify price on {bookingOptions.primary.name}
                      </Text>
                    )}
                  </View>
                  <MaterialIcons name="open-in-new" size={16} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>

                {/* Secondary booking options */}
                {bookingOptions.secondary.length > 0 && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {bookingOptions.secondary.map((opt) => (
                      <TouchableOpacity
                        key={opt.name}
                        style={[styles.secondaryBtn, { borderColor: opt.color, flex: 1 }]}
                        onPress={() => openUrl(opt.url)}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name={opt.icon as any} size={16} color={opt.color} />
                        <Text style={[styles.secondaryBtnText, { color: opt.color, fontSize: 12 }]}>{opt.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Price Disclaimer */}
                {site.pricePerNight != null && site.pricePerNight > 0 && (
                  <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center" }}>
                      Prices shown are estimates. Actual rates may vary by season, site type, and availability. Always verify current rates on the booking platform before completing your reservation.
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}

          {/* Who's Here & Cancellation Watch */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.primary, flex: 1 }]}
              onPress={() => router.push({ pathname: "/whos-here" as any, params: { name: site.name } })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="group" size={18} color={colors.primary} />
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Who's Here</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: "#C62828", flex: 1 }]}
              onPress={() => router.push("/cancellation-scanner" as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="notifications-active" size={18} color="#C62828" />
              <Text style={[styles.secondaryBtnText, { color: "#C62828" }]}>Watch</Text>
            </TouchableOpacity>
          </View>

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
                openUrl(url);
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
  // Facility Details
  facilityGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 },
  facilityItem: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, width: "48%" as any },
  adaBanner: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 10 },
  // Discount Stacker
  bestComboCard: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  discountStackCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  // Nearby services
  serviceCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
});
