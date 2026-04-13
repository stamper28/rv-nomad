/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

/**
 * In-App Purchase Service for RV Nomad
 *
 * Handles Apple StoreKit subscriptions via expo-iap.
 * Product IDs must match what you create in App Store Connect.
 *
 * SETUP:
 * 1. In App Store Connect → My Apps → RV Nomad → Subscriptions
 * 2. Create a Subscription Group called "RV Nomad Premium"
 * 3. Add two auto-renewable subscriptions:
 *    - "rvnomad_premium_monthly" at $5.99/month
 *    - "rvnomad_premium_yearly" at $49.99/year
 * 4. For Android, create matching subscription products in the Play Console
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Product IDs (must match App Store Connect) ──
export const IAP_PRODUCT_IDS = {
  MONTHLY: "rvnomad_premium_monthly",
  YEARLY: "rvnomad_premium_yearly",
} as const;

export const ALL_PRODUCT_IDS = [IAP_PRODUCT_IDS.MONTHLY, IAP_PRODUCT_IDS.YEARLY];

// ── Storage Keys ──
const STORAGE_KEYS = {
  PREMIUM_STATUS: "rv_nomad_premium_status",
  SUBSCRIPTION_EXPIRY: "rv_nomad_subscription_expiry",
  SUBSCRIPTION_PRODUCT: "rv_nomad_subscription_product",
  PROMO_CODE: "rv_nomad_promo_code",
};

// ── Types ──
export interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  type: "monthly" | "yearly";
}

export interface SubscriptionStatus {
  isPremium: boolean;
  productId: string | null;
  expiryDate: string | null;
  promoCode: string | null;
}

// ── Default fallback products (shown when store is unavailable) ──
const FALLBACK_PRODUCTS: IAPProduct[] = [
  {
    id: IAP_PRODUCT_IDS.MONTHLY,
    title: "RV Nomad Premium Monthly",
    description: "Full access to all RV Nomad features",
    price: "$5.99",
    priceAmount: 5.99,
    currency: "USD",
    type: "monthly",
  },
  {
    id: IAP_PRODUCT_IDS.YEARLY,
    title: "RV Nomad Premium Yearly",
    description: "Full access to all RV Nomad features — best value",
    price: "$49.99",
    priceAmount: 49.99,
    currency: "USD",
    type: "yearly",
  },
];

// ── IAP Service ──

let iapModule: any = null;
let isConnected = false;

/**
 * Lazily load expo-iap. Returns null on web or if not available.
 */
async function getIAPModule(): Promise<any> {
  if (Platform.OS === "web") return null;
  if (iapModule) return iapModule;
  try {
    iapModule = await import("expo-iap");
    return iapModule;
  } catch (e) {
    console.warn("[IAP] expo-iap not available:", e);
    return null;
  }
}

/**
 * Initialize the IAP connection. Call once on app start.
 */
export async function initIAP(): Promise<boolean> {
  const mod = await getIAPModule();
  if (!mod) return false;
  try {
    const result = await mod.initConnection();
    isConnected = !!result;
    console.log("[IAP] Connection initialized:", result);
    return isConnected;
  } catch (e) {
    console.warn("[IAP] Failed to init connection:", e);
    isConnected = false;
    return false;
  }
}

/**
 * End the IAP connection. Call on app unmount.
 */
export async function endIAP(): Promise<void> {
  const mod = await getIAPModule();
  if (!mod) return;
  try {
    await mod.endConnection();
    isConnected = false;
  } catch (e) {
    console.warn("[IAP] Failed to end connection:", e);
  }
}

/**
 * Fetch subscription products from the store.
 * Falls back to hardcoded products if store is unavailable.
 */
export async function fetchProducts(): Promise<IAPProduct[]> {
  const mod = await getIAPModule();
  if (!mod || !isConnected) {
    console.log("[IAP] Store not available, using fallback products");
    return FALLBACK_PRODUCTS;
  }

  try {
    const subscriptions = await mod.getSubscriptions({ skus: ALL_PRODUCT_IDS });

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[IAP] No products returned from store, using fallbacks");
      return FALLBACK_PRODUCTS;
    }

    return subscriptions.map((sub: any) => ({
      id: sub.productId || sub.id,
      title: sub.title || sub.name || "RV Nomad Premium",
      description: sub.description || "Full access to all features",
      price: sub.localizedPrice || sub.displayPrice || (sub.productId?.includes("monthly") ? "$5.99" : "$49.99"),
      priceAmount: parseFloat(sub.price || (sub.productId?.includes("monthly") ? "5.99" : "49.99")),
      currency: sub.currency || "USD",
      type: (sub.productId || sub.id || "").includes("monthly") ? "monthly" as const : "yearly" as const,
    }));
  } catch (e) {
    console.warn("[IAP] Failed to fetch products:", e);
    return FALLBACK_PRODUCTS;
  }
}

/**
 * Request a subscription purchase.
 */
export async function purchaseSubscription(productId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const mod = await getIAPModule();
  if (!mod || !isConnected) {
    return {
      success: false,
      error: "Unable to connect to the App Store. Please check your internet connection and try again.",
    };
  }

  try {
    await mod.requestSubscription({
      request: {
        apple: { sku: productId },
        google: { skus: [productId] },
      },
    });

    // If we get here without error, the purchase sheet was shown.
    // The actual purchase result comes through the purchase listener.
    return { success: true };
  } catch (e: any) {
    const code = e?.code || "";
    const msg = e?.message || "";

    // User cancelled — not an error
    if (
      code === "E_USER_CANCELLED" ||
      code === "E_CANCELLED" ||
      msg.includes("cancel") ||
      msg.includes("SKErrorDomain") && msg.includes("2")
    ) {
      return { success: false, error: "Purchase cancelled." };
    }

    // Product not found in store — IAP not configured yet
    if (
      code === "E_ITEM_UNAVAILABLE" ||
      code === "E_UNKNOWN" ||
      msg.includes("Invalid product") ||
      msg.includes("SKErrorDomain") && msg.includes("0")
    ) {
      return {
        success: false,
        error: "This subscription is temporarily unavailable. Please try again later or contact support.",
      };
    }

    // Payment not allowed (parental controls, etc.)
    if (code === "E_NETWORK_ERROR" || msg.includes("not allowed")) {
      return {
        success: false,
        error: "Purchases are not allowed on this device. Please check your device settings.",
      };
    }

    // Deferred purchase (Ask to Buy)
    if (code === "E_DEFERRED" || msg.includes("deferred")) {
      return {
        success: false,
        error: "Your purchase requires approval. You will be notified when it is approved.",
      };
    }

    console.error("[IAP] Purchase error:", e);
    return {
      success: false,
      error: "Something went wrong with the purchase. Please try again or restart the app.",
    };
  }
}

/**
 * Restore previous purchases (e.g., after reinstall or new device).
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  restored: boolean;
  error?: string;
}> {
  const mod = await getIAPModule();
  if (!mod || !isConnected) {
    return { success: false, restored: false, error: "Store not available." };
  }

  try {
    const purchases = await mod.getAvailablePurchases();

    if (!purchases || purchases.length === 0) {
      return { success: true, restored: false };
    }

    // Check for active subscription
    const activeSubscription = purchases.find((p: any) => {
      const pid = p.productId || p.id || "";
      return ALL_PRODUCT_IDS.includes(pid as any);
    });

    if (activeSubscription) {
      const productId = activeSubscription.productId || activeSubscription.id;
      await savePremiumStatus(true, productId);
      return { success: true, restored: true };
    }

    return { success: true, restored: false };
  } catch (e: any) {
    console.error("[IAP] Restore error:", e);
    return { success: false, restored: false, error: e?.message || "Failed to restore purchases." };
  }
}

/**
 * Finish/acknowledge a transaction. Must be called after successful purchase.
 */
export async function finishTransaction(purchase: any): Promise<void> {
  const mod = await getIAPModule();
  if (!mod) return;

  try {
    await mod.finishTransaction({ purchase, isConsumable: false });
    console.log("[IAP] Transaction finished:", purchase.productId || purchase.id);
  } catch (e) {
    console.warn("[IAP] Failed to finish transaction:", e);
  }
}

// ── Local Premium Status Management ──

/**
 * Save premium status to local storage.
 */
export async function savePremiumStatus(
  isPremium: boolean,
  productId?: string | null,
  expiryDate?: string | null,
  promoCode?: string | null,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(isPremium));
    if (productId !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PRODUCT, JSON.stringify(productId));
    }
    if (expiryDate !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY, JSON.stringify(expiryDate));
    }
    if (promoCode !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROMO_CODE, JSON.stringify(promoCode));
    }
  } catch (e) {
    console.warn("[IAP] Failed to save premium status:", e);
  }
}

/**
 * Load premium status from local storage.
 */
export async function loadPremiumStatus(): Promise<SubscriptionStatus> {
  try {
    const [premiumRaw, productRaw, expiryRaw, promoRaw] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS),
      AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_PRODUCT),
      AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY),
      AsyncStorage.getItem(STORAGE_KEYS.PROMO_CODE),
    ]);

    return {
      isPremium: premiumRaw ? JSON.parse(premiumRaw) : false,
      productId: productRaw ? JSON.parse(productRaw) : null,
      expiryDate: expiryRaw ? JSON.parse(expiryRaw) : null,
      promoCode: promoRaw ? JSON.parse(promoRaw) : null,
    };
  } catch {
    return { isPremium: false, productId: null, expiryDate: null, promoCode: null };
  }
}

/**
 * Clear premium status (for testing or when subscription expires).
 */
export async function clearPremiumStatus(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PREMIUM_STATUS),
      AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_PRODUCT),
      AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY),
      AsyncStorage.removeItem(STORAGE_KEYS.PROMO_CODE),
    ]);
  } catch (e) {
    console.warn("[IAP] Failed to clear premium status:", e);
  }
}

/**
 * Check if a product ID is the monthly plan.
 */
export function isMonthlyPlan(productId: string): boolean {
  return productId === IAP_PRODUCT_IDS.MONTHLY;
}

/**
 * Check if a product ID is the yearly plan.
 */
export function isYearlyPlan(productId: string): boolean {
  return productId === IAP_PRODUCT_IDS.YEARLY;
}

/**
 * Get human-readable plan name.
 */
export function getPlanName(productId: string | null): string {
  if (!productId) return "Free";
  if (isMonthlyPlan(productId)) return "Monthly";
  if (isYearlyPlan(productId)) return "Yearly";
  return "Premium";
}
