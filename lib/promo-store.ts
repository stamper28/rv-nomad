/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Promo Code Types ──
export interface PromoCode {
  code: string;
  discountPercent: number; // e.g. 50 for 50% off
  description: string;
  expiresAt: string | null; // ISO date string or null for no expiry
  maxUses: number | null; // null for unlimited
  appliesTo: "all" | "monthly" | "yearly"; // which plan it applies to
}

export interface RedeemedPromo {
  code: string;
  discountPercent: number;
  redeemedAt: string; // ISO date string
  appliesTo: "all" | "monthly" | "yearly";
}

// ── Valid Promo Codes ──
// These are the codes Kieran can hand out at book tours, RV parks, etc.
const VALID_PROMO_CODES: PromoCode[] = [
  {
    code: "BOOKTOUR50",
    discountPercent: 50,
    description: "Book Tour Special — 50% off!",
    expiresAt: null, // no expiry
    maxUses: null, // unlimited
    appliesTo: "all",
  },
  {
    code: "VETERAN50",
    discountPercent: 50,
    description: "Veteran Discount — 50% off!",
    expiresAt: null,
    maxUses: null,
    appliesTo: "all",
  },
  {
    code: "RVNOMAD50",
    discountPercent: 50,
    description: "RV Nomad Special — 50% off!",
    expiresAt: null,
    maxUses: null,
    appliesTo: "all",
  },
  {
    code: "LAUNCH50",
    discountPercent: 50,
    description: "Launch Day Special — 50% off!",
    expiresAt: "2026-12-31T23:59:59.000Z",
    maxUses: null,
    appliesTo: "all",
  },
  {
    code: "HANDICAP50",
    discountPercent: 50,
    description: "Accessibility Community — 50% off!",
    expiresAt: null,
    maxUses: null,
    appliesTo: "all",
  },
];

// ── Storage Key ──
const PROMO_KEY = "rv_nomad_promo_code";

// ── Validation ──
export interface PromoValidationResult {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  description?: string;
  error?: string;
  appliesTo?: "all" | "monthly" | "yearly";
}

/**
 * Validate a promo code. Returns discount info if valid.
 */
export function validatePromoCode(
  inputCode: string,
  plan: "monthly" | "yearly" = "yearly"
): PromoValidationResult {
  const normalized = inputCode.trim().toUpperCase();

  if (!normalized) {
    return { valid: false, error: "Please enter a promo code" };
  }

  const promo = VALID_PROMO_CODES.find((p) => p.code === normalized);

  if (!promo) {
    return { valid: false, error: "Invalid promo code" };
  }

  // Check expiry
  if (promo.expiresAt) {
    const expiryDate = new Date(promo.expiresAt);
    if (new Date() > expiryDate) {
      return { valid: false, error: "This promo code has expired" };
    }
  }

  // Check if it applies to the selected plan
  if (promo.appliesTo !== "all" && promo.appliesTo !== plan) {
    return {
      valid: false,
      error: `This code only applies to the ${promo.appliesTo} plan`,
    };
  }

  return {
    valid: true,
    code: promo.code,
    discountPercent: promo.discountPercent,
    description: promo.description,
    appliesTo: promo.appliesTo,
  };
}

/**
 * Calculate discounted price.
 */
export function getDiscountedPrice(
  originalPrice: number,
  discountPercent: number
): { discountedPrice: number; savings: number } {
  const savings = Math.round(originalPrice * (discountPercent / 100) * 100) / 100;
  const discountedPrice = Math.round((originalPrice - savings) * 100) / 100;
  return { discountedPrice, savings };
}

/**
 * Save redeemed promo code to local storage.
 */
export async function saveRedeemedPromo(promo: RedeemedPromo): Promise<void> {
  await AsyncStorage.setItem(PROMO_KEY, JSON.stringify(promo));
}

/**
 * Get previously redeemed promo code.
 */
export async function getRedeemedPromo(): Promise<RedeemedPromo | null> {
  try {
    const raw = await AsyncStorage.getItem(PROMO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear redeemed promo code.
 */
export async function clearRedeemedPromo(): Promise<void> {
  await AsyncStorage.removeItem(PROMO_KEY);
}
