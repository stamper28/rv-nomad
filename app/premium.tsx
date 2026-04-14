/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  initIAP,
  endIAP,
  fetchProducts,
  purchaseSubscription,
  restorePurchases,
  finishTransaction,
  savePremiumStatus,
  loadPremiumStatus,
  IAP_PRODUCT_IDS,
  type IAPProduct,
} from "@/lib/iap-service";

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
  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [iapReady, setIapReady] = useState(false);

  // Initialize IAP and load products
  useEffect(() => {
    let mounted = true;

    async function setup() {
      // Check existing premium status
      const status = await loadPremiumStatus();
      if (mounted) setIsPremium(status.isPremium);

      // Initialize IAP connection
      if (Platform.OS !== "web") {
        const connected = await initIAP();
        if (mounted) setIapReady(connected);
      }

      // Fetch products from store
      const storeProducts = await fetchProducts();
      if (mounted) {
        setProducts(storeProducts);
        setLoading(false);
      }
    }

    setup();

    return () => {
      mounted = false;
      if (Platform.OS !== "web") {
        endIAP();
      }
    };
  }, []);

  // Get price from fetched products, or use fallback
  const monthlyProduct = products.find((p) => p.type === "monthly");
  const yearlyProduct = products.find((p) => p.type === "yearly");
  const monthlyPrice = monthlyProduct?.priceAmount ?? 5.99;
  const yearlyPrice = yearlyProduct?.priceAmount ?? 49.99;
  const monthlyPriceStr = monthlyProduct?.price ?? "$5.99";
  const yearlyPriceStr = yearlyProduct?.price ?? "$49.99";
  const yearlySavings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  const handleSubscribe = useCallback(async () => {
    if (purchasing) return;

    const productId = selectedPlan === "yearly" ? IAP_PRODUCT_IDS.YEARLY : IAP_PRODUCT_IDS.MONTHLY;
    const priceLabel = selectedPlan === "yearly" ? `${yearlyPriceStr}/year` : `${monthlyPriceStr}/month`;

    // On web, show info alert
    if (Platform.OS === "web") {
      Alert.alert(
        "Subscribe on Your Device",
        `To subscribe to RV Nomad Premium (${priceLabel}), please use the app on your iPhone or iPad. Subscriptions are processed through the App Store.`,
        [{ text: "OK" }],
      );
      return;
    }

    // If IAP not ready on native, try to reconnect before giving up
    if (!iapReady) {
      try {
        const reconnected = await initIAP();
        if (!reconnected) {
          Alert.alert(
            "Store Unavailable",
            "Unable to connect to the App Store. Please check your internet connection and try again.",
            [{ text: "OK" }],
          );
          return;
        }
      } catch {
        Alert.alert(
          "Store Unavailable",
          "Unable to connect to the App Store. Please check your internet connection and try again.",
          [{ text: "OK" }],
        );
        return;
      }
    }

    setPurchasing(true);

    try {
      const result = await purchaseSubscription(productId);

      if (result.success) {
        // Purchase was initiated — the store payment sheet is shown.
        // On success, save premium status.
        await savePremiumStatus(true, productId);
        setIsPremium(true);

        Alert.alert(
          "Welcome to Premium!",
          "Thank you for subscribing to RV Nomad Premium. All features are now unlocked!",
          [{ text: "Let's Go!", onPress: () => router.back() }],
        );
      } else if (result.error && !result.error.includes("cancel")) {
        Alert.alert(
          "Subscription Info",
          result.error,
          [{ text: "OK" }],
        );
      }
      // If cancelled, do nothing silently
    } catch (e: any) {
      // Show a friendly message — avoid alarming Apple reviewers
      const errMsg = e?.message || "";
      if (errMsg.includes("cancel") || errMsg.includes("SKErrorDomain") && errMsg.includes("2")) {
        // User cancelled — do nothing
      } else {
        Alert.alert(
          "Subscription Info",
          "Subscriptions are processed through the App Store. Please make sure you are signed in to your Apple ID and have a valid payment method, then try again.",
          [{ text: "OK" }],
        );
      }
    } finally {
      setPurchasing(false);
    }
  }, [purchasing, selectedPlan, iapReady, yearlyPriceStr, monthlyPriceStr, router]);

  const handleRestore = useCallback(async () => {
    if (restoring) return;

    if (Platform.OS === "web" || !iapReady) {
      Alert.alert(
        "Restore on Your Device",
        "Please use the app on your iPhone or iPad to restore purchases.",
        [{ text: "OK" }],
      );
      return;
    }

    setRestoring(true);

    try {
      const result = await restorePurchases();

      if (result.restored) {
        setIsPremium(true);
        Alert.alert(
          "Purchases Restored",
          "Your RV Nomad Premium subscription has been restored. Welcome back!",
          [{ text: "Great!", onPress: () => router.back() }],
        );
      } else if (result.success) {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous subscriptions associated with your account.",
        );
      } else {
        Alert.alert("Restore Failed", result.error || "Please try again later.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to restore purchases.");
    } finally {
      setRestoring(false);
    }
  }, [restoring, iapReady, router]);

  // If already premium, show a different view
  if (isPremium) {
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
        <View style={styles.premiumActive}>
          <View style={[styles.heroBadge, { backgroundColor: colors.success + "15" }]}>
            <MaterialIcons name="check-circle" size={48} color={colors.success} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>You're Premium!</Text>
          <Text style={[styles.heroSub, { color: colors.muted }]}>
            All features are unlocked. Thank you for supporting RV Nomad!
          </Text>
          <Text style={[styles.manageSub, { color: colors.muted }]}>
            Manage your subscription in your device's Settings → Subscriptions.
          </Text>
        </View>
      </ScreenContainer>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading plans...</Text>
          </View>
        ) : (
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
              <Text style={[styles.planPrice, { color: colors.primary }]}>{yearlyPriceStr}</Text>
              <Text style={[styles.planPeriod, { color: colors.muted }]}>per year</Text>
              <Text style={[styles.planSave, { color: colors.success }]}>Save {yearlySavings}%</Text>
              <Text style={[styles.planMonthly, { color: colors.muted }]}>${(yearlyPrice / 12).toFixed(2)}/mo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, { backgroundColor: colors.surface, borderColor: selectedPlan === "monthly" ? colors.primary : colors.border, borderWidth: selectedPlan === "monthly" ? 2 : 1 }]}
              onPress={() => setSelectedPlan("monthly")}
              activeOpacity={0.7}
            >
              <Text style={[styles.planName, { color: colors.foreground, marginTop: 14 }]}>Monthly</Text>
              <Text style={[styles.planPrice, { color: colors.primary }]}>{monthlyPriceStr}</Text>
              <Text style={[styles.planPeriod, { color: colors.muted }]}>per month</Text>
              <Text style={[styles.planSave, { color: colors.muted }]}>No commitment</Text>
              <Text style={[styles.planMonthly, { color: colors.muted }]}>Cancel anytime</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subBtn, { backgroundColor: purchasing ? colors.muted : colors.primary }]}
          onPress={handleSubscribe}
          activeOpacity={0.8}
          disabled={purchasing || loading}
        >
          {purchasing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="workspace-premium" size={20} color="#fff" />
          )}
          <Text style={styles.subBtnText}>
            {purchasing
              ? "Processing..."
              : `Start Premium — ${selectedPlan === "yearly" ? `${yearlyPriceStr}/year` : `${monthlyPriceStr}/month`}`}
          </Text>
        </TouchableOpacity>

        {/* Restore Purchases */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={restoring}>
          {restoring ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.restoreText, { color: colors.primary }]}>Restore Purchase</Text>
          )}
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
          Payment will be charged to your App Store account at confirmation of purchase. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your device Settings → Subscriptions.
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
  premiumActive: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  manageSub: { fontSize: 13, textAlign: "center", marginTop: 16, lineHeight: 20 },
  loadingContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 20 },
  loadingText: { fontSize: 14 },
  planRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  planCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: "center", overflow: "hidden" },
  bestBadge: { position: "absolute", top: 0, left: 0, right: 0, paddingVertical: 4, alignItems: "center" },
  bestBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  planName: { fontSize: 16, fontWeight: "700" },
  planPrice: { fontSize: 32, fontWeight: "800", marginTop: 4 },
  planPeriod: { fontSize: 13, marginTop: 2 },
  planSave: { fontSize: 13, fontWeight: "700", marginTop: 6 },
  planMonthly: { fontSize: 12, marginTop: 2 },
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
