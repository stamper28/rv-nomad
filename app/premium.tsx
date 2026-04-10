/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  validatePromoCode,
  getDiscountedPrice,
  saveRedeemedPromo,
  type PromoValidationResult,
} from "@/lib/promo-store";
import * as Haptics from "expo-haptics";

type PlanType = "monthly" | "yearly";

const FEATURES = [
  { icon: "map", title: "Interactive Map", free: true, premium: true },
  { icon: "search", title: "Search Campgrounds", free: true, premium: true },
  { icon: "place", title: "View 5 States", free: true, premium: false },
  { icon: "public", title: "All 50 States", free: false, premium: true },
  { icon: "bookmark", title: "Save 10 Favorites", free: true, premium: false },
  { icon: "favorite", title: "Unlimited Favorites", free: false, premium: true },
  { icon: "route", title: "Trip Planner", free: false, premium: true },
  { icon: "credit-card", title: "Book Campsites", free: false, premium: true },
  { icon: "download", title: "Offline Maps", free: false, premium: true },
  { icon: "build", title: "RV Tools", free: false, premium: true },
  { icon: "wb-cloudy", title: "Weather Forecasts", free: false, premium: true },
  { icon: "groups", title: "Community Access", free: false, premium: true },
  { icon: "workspace-premium", title: "RV Buying Guide", free: false, premium: true },
  { icon: "monitor-weight", title: "Weight Scale Finder", free: false, premium: true },
  { icon: "local-offer", title: "Discount Finder", free: false, premium: true },
  { icon: "block", title: "Ad-Free Experience", free: false, premium: true },
];

export default function PremiumScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");

  // Promo code state
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<PromoValidationResult | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoValidationResult | null>(null);

  const yearlyPrice = 49.99;
  const monthlyPrice = 5.99;
  const yearlySavings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  // Calculate discounted prices
  const yearlyDiscounted = appliedPromo?.valid
    ? getDiscountedPrice(yearlyPrice, appliedPromo.discountPercent!)
    : null;
  const monthlyDiscounted = appliedPromo?.valid
    ? getDiscountedPrice(monthlyPrice, appliedPromo.discountPercent!)
    : null;

  const effectiveYearlyPrice = yearlyDiscounted ? yearlyDiscounted.discountedPrice : yearlyPrice;
  const effectiveMonthlyPrice = monthlyDiscounted ? monthlyDiscounted.discountedPrice : monthlyPrice;

  const handleApplyPromo = useCallback(() => {
    const result = validatePromoCode(promoInput, selectedPlan);
    setPromoResult(result);

    if (result.valid) {
      setAppliedPromo(result);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Save to local storage
      saveRedeemedPromo({
        code: result.code!,
        discountPercent: result.discountPercent!,
        redeemedAt: new Date().toISOString(),
        appliesTo: result.appliesTo!,
      });
    } else {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [promoInput, selectedPlan]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoResult(null);
    setPromoInput("");
    setShowPromoInput(false);
  }, []);

  function handleSubscribe() {
    const priceLabel = selectedPlan === "yearly"
      ? `$${effectiveYearlyPrice}/year`
      : `$${effectiveMonthlyPrice}/month`;

    const promoNote = appliedPromo?.valid
      ? `\n\nPromo code "${appliedPromo.code}" applied — ${appliedPromo.discountPercent}% off!`
      : "";

    Alert.alert(
      "Subscription",
      `Subscribe to RV Nomad Premium for ${priceLabel}?${promoNote}\n\nThis will be processed through the App Store / Google Play when the app is published.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Subscribe", onPress: () => Alert.alert("Coming Soon", "In-app purchases will be available when the app is published. All features are unlocked for testing.") },
      ]
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>RV Nomad Premium</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroBadge, { backgroundColor: colors.primary + "15" }]}>
            <MaterialIcons name="workspace-premium" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Unlock Everything</Text>
          <Text style={[styles.heroSub, { color: colors.muted }]}>
            All 50 states, unlimited favorites, trip planner, booking, offline maps, and more.
          </Text>
        </View>

        {/* Plan Selection */}
        <View style={styles.planRow}>
          <TouchableOpacity
            style={[styles.planCard, { backgroundColor: colors.surface, borderColor: selectedPlan === "yearly" ? colors.primary : colors.border, borderWidth: selectedPlan === "yearly" ? 2 : 1 }]}
            onPress={() => setSelectedPlan("yearly")}
            activeOpacity={0.7}
          >
            {selectedPlan === "yearly" && (
              <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.bestBadgeText}>BEST VALUE</Text>
              </View>
            )}
            <Text style={[styles.planName, { color: colors.foreground, marginTop: 14 }]}>Yearly</Text>
            {yearlyDiscounted ? (
              <>
                <Text style={[styles.planPriceStrike, { color: colors.muted }]}>${yearlyPrice}</Text>
                <Text style={[styles.planPrice, { color: colors.success }]}>${yearlyDiscounted.discountedPrice}</Text>
              </>
            ) : (
              <Text style={[styles.planPrice, { color: colors.primary }]}>${yearlyPrice}</Text>
            )}
            <Text style={[styles.planPeriod, { color: colors.muted }]}>per year</Text>
            {yearlyDiscounted ? (
              <Text style={[styles.planSave, { color: colors.success }]}>You save ${yearlyDiscounted.savings.toFixed(2)}!</Text>
            ) : (
              <Text style={[styles.planSave, { color: colors.success }]}>Save {yearlySavings}%</Text>
            )}
            <Text style={[styles.planMonthly, { color: colors.muted }]}>${(effectiveYearlyPrice / 12).toFixed(2)}/mo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, { backgroundColor: colors.surface, borderColor: selectedPlan === "monthly" ? colors.primary : colors.border, borderWidth: selectedPlan === "monthly" ? 2 : 1 }]}
            onPress={() => setSelectedPlan("monthly")}
            activeOpacity={0.7}
          >
            <Text style={[styles.planName, { color: colors.foreground, marginTop: 14 }]}>Monthly</Text>
            {monthlyDiscounted ? (
              <>
                <Text style={[styles.planPriceStrike, { color: colors.muted }]}>${monthlyPrice}</Text>
                <Text style={[styles.planPrice, { color: colors.success }]}>${monthlyDiscounted.discountedPrice}</Text>
              </>
            ) : (
              <Text style={[styles.planPrice, { color: colors.primary }]}>${monthlyPrice}</Text>
            )}
            <Text style={[styles.planPeriod, { color: colors.muted }]}>per month</Text>
            {monthlyDiscounted ? (
              <Text style={[styles.planSave, { color: colors.success }]}>You save ${monthlyDiscounted.savings.toFixed(2)}!</Text>
            ) : (
              <Text style={[styles.planSave, { color: colors.muted }]}>No commitment</Text>
            )}
            <Text style={[styles.planMonthly, { color: colors.muted }]}>Cancel anytime</Text>
          </TouchableOpacity>
        </View>

        {/* Promo Code Section */}
        {appliedPromo?.valid ? (
          <View style={[styles.promoApplied, { backgroundColor: colors.success + "12", borderColor: colors.success + "40" }]}>
            <View style={styles.promoAppliedRow}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.promoAppliedCode, { color: colors.success }]}>
                  {appliedPromo.code} — {appliedPromo.discountPercent}% OFF
                </Text>
                <Text style={[styles.promoAppliedDesc, { color: colors.muted }]}>
                  {appliedPromo.description}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemovePromo} style={styles.promoRemoveBtn}>
                <MaterialIcons name="close" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
        ) : showPromoInput ? (
          <View style={[styles.promoSection, { borderColor: colors.border }]}>
            <Text style={[styles.promoLabel, { color: colors.foreground }]}>Enter Promo Code</Text>
            <View style={styles.promoInputRow}>
              <TextInput
                style={[styles.promoTextInput, {
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                  borderColor: promoResult && !promoResult.valid ? colors.error : colors.border,
                }]}
                placeholder="e.g. BOOKTOUR50"
                placeholderTextColor={colors.muted + "80"}
                value={promoInput}
                onChangeText={(text) => {
                  setPromoInput(text.toUpperCase());
                  if (promoResult) setPromoResult(null);
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleApplyPromo}
              />
              <TouchableOpacity
                style={[styles.promoApplyBtn, { backgroundColor: colors.primary, opacity: promoInput.trim() ? 1 : 0.5 }]}
                onPress={handleApplyPromo}
                disabled={!promoInput.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.promoApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {promoResult && !promoResult.valid && (
              <View style={styles.promoErrorRow}>
                <MaterialIcons name="error-outline" size={14} color={colors.error} />
                <Text style={[styles.promoErrorText, { color: colors.error }]}>{promoResult.error}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => { setShowPromoInput(false); setPromoInput(""); setPromoResult(null); }}>
              <Text style={[styles.promoCancelText, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.promoToggleBtn}
            onPress={() => setShowPromoInput(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="local-offer" size={16} color={colors.primary} />
            <Text style={[styles.promoToggleText, { color: colors.primary }]}>Have a promo code?</Text>
          </TouchableOpacity>
        )}

        {/* Subscribe Button */}
        <TouchableOpacity style={[styles.subBtn, { backgroundColor: colors.primary }]} onPress={handleSubscribe} activeOpacity={0.8}>
          <MaterialIcons name="workspace-premium" size={20} color="#fff" />
          <Text style={styles.subBtnText}>
            Start Premium — {selectedPlan === "yearly" ? `$${effectiveYearlyPrice}/year` : `$${effectiveMonthlyPrice}/month`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert("Restore", "Restore purchases will work when published to app stores.")} style={styles.restoreBtn}>
          <Text style={[styles.restoreText, { color: colors.primary }]}>Restore Purchase</Text>
        </TouchableOpacity>

        {/* 7-Day Trial */}
        <View style={[styles.trialBox, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
          <MaterialIcons name="info" size={20} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.trialTitle, { color: colors.foreground }]}>7-Day Free Trial</Text>
            <Text style={[styles.trialText, { color: colors.muted }]}>
              Try Premium free for 7 days. Cancel anytime before the trial ends and you won't be charged.
            </Text>
          </View>
        </View>

        {/* Feature Comparison */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Free vs Premium</Text>
          <View style={[styles.tableHead, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.thFeature, { color: colors.foreground }]}>Feature</Text>
            <Text style={[styles.thPlan, { color: colors.muted }]}>Free</Text>
            <Text style={[styles.thPlan, { color: colors.primary }]}>Premium</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? colors.surface : colors.background, borderColor: colors.border }]}>
              <View style={styles.featureCell}>
                <MaterialIcons name={f.icon as any} size={16} color={colors.primary} />
                <Text style={[styles.featureName, { color: colors.foreground }]}>{f.title}</Text>
              </View>
              <View style={styles.checkCell}>
                <MaterialIcons name={f.free ? "check-circle" : "cancel"} size={18} color={f.free ? colors.success : colors.error + "40"} />
              </View>
              <View style={styles.checkCell}>
                <MaterialIcons name={f.premium ? "check-circle" : "cancel"} size={18} color={f.premium ? colors.success : colors.error + "40"} />
              </View>
            </View>
          ))}
        </View>

        {/* Legal */}
        <Text style={[styles.legal, { color: colors.muted }]}>
          Payment will be charged to your App Store or Google Play account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in your device settings.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  hero: { alignItems: "center", paddingVertical: 20, paddingHorizontal: 16 },
  heroBadge: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: "800" },
  heroSub: { fontSize: 15, textAlign: "center", marginTop: 6, lineHeight: 22, maxWidth: 320 },
  planRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  planCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: "center", overflow: "hidden" },
  bestBadge: { position: "absolute", top: 0, left: 0, right: 0, paddingVertical: 4, alignItems: "center" },
  bestBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  planName: { fontSize: 16, fontWeight: "700" },
  planPrice: { fontSize: 32, fontWeight: "800", marginTop: 4 },
  planPriceStrike: { fontSize: 18, fontWeight: "600", marginTop: 4, textDecorationLine: "line-through" },
  planPeriod: { fontSize: 13, marginTop: 2 },
  planSave: { fontSize: 13, fontWeight: "700", marginTop: 6 },
  planMonthly: { fontSize: 12, marginTop: 2 },
  // Promo code styles
  promoToggleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, marginBottom: 8 },
  promoToggleText: { fontSize: 14, fontWeight: "600" },
  promoSection: { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  promoLabel: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  promoInputRow: { flexDirection: "row", gap: 8 },
  promoTextInput: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 16, fontWeight: "700", letterSpacing: 1 },
  promoApplyBtn: { height: 44, paddingHorizontal: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  promoApplyText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  promoErrorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  promoErrorText: { fontSize: 12, fontWeight: "600" },
  promoCancelText: { fontSize: 13, textAlign: "center", marginTop: 8 },
  promoApplied: { marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  promoAppliedRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  promoAppliedCode: { fontSize: 14, fontWeight: "800" },
  promoAppliedDesc: { fontSize: 12, marginTop: 1 },
  promoRemoveBtn: { padding: 4 },
  // Subscribe button
  subBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, paddingVertical: 16, borderRadius: 14 },
  subBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  restoreBtn: { alignItems: "center", paddingVertical: 10 },
  restoreText: { fontSize: 14, fontWeight: "600" },
  trialBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  trialTitle: { fontSize: 14, fontWeight: "700" },
  trialText: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  tableHead: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, marginBottom: 2 },
  thFeature: { flex: 1, fontSize: 13, fontWeight: "700" },
  thPlan: { width: 60, fontSize: 12, fontWeight: "700", textAlign: "center" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 0.5 },
  featureCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  featureName: { fontSize: 13, fontWeight: "600" },
  checkCell: { width: 60, alignItems: "center" },
  legal: { fontSize: 10, lineHeight: 15, textAlign: "center", marginHorizontal: 24, marginTop: 16, marginBottom: 20 },
});
