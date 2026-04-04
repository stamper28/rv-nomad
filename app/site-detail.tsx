import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite } from "@/lib/types";
import { Store } from "@/lib/store";

export default function SiteDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ siteId: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const [site, setSite] = useState<CampSite | undefined>(undefined);

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
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const next = await Store.toggleSavedSite(site.id);
    setIsSaved(next.includes(site.id));
  }, [site?.id]);

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

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleSave} style={styles.actionBtn}>
            <IconSymbol
              name={isSaved ? "heart.fill" : "heart"}
              size={22}
              color={isSaved ? colors.error : colors.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <IconSymbol name="square.and.arrow.up" size={22} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: catColor + "15" }]}>
          <View style={[styles.catBadge, { backgroundColor: catColor + "25" }]}>
            <Text style={[styles.catBadgeText, { color: catColor }]}>
              {CATEGORY_LABELS[site.category].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.siteName, { color: colors.foreground }]}>{site.name}</Text>
          <Text style={[styles.siteLocation, { color: colors.muted }]}>
            {site.city}, {site.state}
          </Text>
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
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {site.pricePerNight === null ? "No cost" : "per night"}
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="mappin" size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {site.latitude.toFixed(2)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {site.longitude.toFixed(2)}
              </Text>
            </View>
          </View>

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
                  <View
                    key={i}
                    style={[styles.amenityChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
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
                    <Text style={[styles.limitIcon]}>📏</Text>
                    <Text style={[styles.limitLabel, { color: colors.muted }]}>Max RV Length</Text>
                    <Text style={[styles.limitValue, { color: colors.foreground }]}>{site.maxRVLength}</Text>
                  </View>
                )}
                {site.maxTrailerLength && (
                  <View style={[styles.limitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.limitIcon]}>🚛</Text>
                    <Text style={[styles.limitLabel, { color: colors.muted }]}>Max Trailer</Text>
                    <Text style={[styles.limitValue, { color: colors.foreground }]}>{site.maxTrailerLength}</Text>
                  </View>
                )}
                {site.maxRVHeight && (
                  <View style={[styles.limitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.limitIcon]}>📐</Text>
                    <Text style={[styles.limitLabel, { color: colors.muted }]}>Max Height</Text>
                    <Text style={[styles.limitValue, { color: colors.foreground }]}>{site.maxRVHeight}</Text>
                  </View>
                )}
                {site.maxRVWidth && (
                  <View style={[styles.limitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.limitIcon]}>↔️</Text>
                    <Text style={[styles.limitLabel, { color: colors.muted }]}>Max Width</Text>
                    <Text style={[styles.limitValue, { color: colors.foreground }]}>{site.maxRVWidth}</Text>
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
                {site.discounts.map((d, i) => (
                  <View
                    key={i}
                    style={[styles.discountBadge, { backgroundColor: colors.primary + "15" }]}
                  >
                    <IconSymbol name="dollarsign.circle.fill" size={14} color={colors.primary} />
                    <Text style={[styles.discountText, { color: colors.primary }]}>
                      {d === "passport_america" ? "Passport America" : d === "good_sam" ? "Good Sam" : "Military"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact</Text>
            {site.phone && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${site.phone}`)}
              >
                <IconSymbol name="phone.fill" size={16} color={colors.primary} />
                <Text style={[styles.contactText, { color: colors.primary }]}>{site.phone}</Text>
              </TouchableOpacity>
            )}
            {site.website && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL(site.website!)}
              >
                <IconSymbol name="globe" size={16} color={colors.primary} />
                <Text style={[styles.contactText, { color: colors.primary }]} numberOfLines={1}>
                  {site.website}
                </Text>
              </TouchableOpacity>
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
              <IconSymbol
                name={isSaved ? "heart.fill" : "heart"}
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                {isSaved ? "Saved" : "Save"}
              </Text>
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
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 4,
  },
  backBtn: { padding: 4 },
  headerActions: { flexDirection: "row", gap: 12 },
  actionBtn: { padding: 4 },
  hero: { paddingHorizontal: 16, paddingVertical: 24, alignItems: "center", gap: 6 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: "700" },
  siteName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  siteLocation: { fontSize: 14 },
  content: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  section: { paddingBottom: 16, borderBottomWidth: 0.5 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22 },
  amenitiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityChip: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 8, borderWidth: 1,
  },
  amenityText: { fontSize: 13 },
  discountRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  discountBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 8,
  },
  discountText: { fontSize: 13, fontWeight: "600" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  contactText: { fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  primaryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 2,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "700" },
  bookBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 12,
  },
  limitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  limitCard: {
    width: "47%" as any, alignItems: "center", paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, gap: 4,
  },
  limitIcon: { fontSize: 20 },
  limitLabel: { fontSize: 11, fontWeight: "600" },
  limitValue: { fontSize: 16, fontWeight: "800" },
  rigTags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  rigTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rigTagText: { fontSize: 13, fontWeight: "600" },
});
