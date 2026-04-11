/**
 * Tests for IAP Service
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => {
  const store: Record<string, string> = {};
  return {
    default: {
      getItem: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
    },
  };
});

// Mock react-native Platform
vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

// Mock expo-iap (not available in test environment)
vi.mock("expo-iap", () => ({
  initConnection: vi.fn(() => Promise.resolve(true)),
  endConnection: vi.fn(() => Promise.resolve()),
  getSubscriptions: vi.fn(() => Promise.resolve([])),
  requestSubscription: vi.fn(() => Promise.resolve()),
  getAvailablePurchases: vi.fn(() => Promise.resolve([])),
  finishTransaction: vi.fn(() => Promise.resolve()),
}));

describe("IAP Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export correct product IDs", async () => {
    const { IAP_PRODUCT_IDS, ALL_PRODUCT_IDS } = await import("@/lib/iap-service");
    expect(IAP_PRODUCT_IDS.MONTHLY).toBe("rvnomad_premium_monthly");
    expect(IAP_PRODUCT_IDS.YEARLY).toBe("rvnomad_premium_yearly");
    expect(ALL_PRODUCT_IDS).toHaveLength(2);
    expect(ALL_PRODUCT_IDS).toContain("rvnomad_premium_monthly");
    expect(ALL_PRODUCT_IDS).toContain("rvnomad_premium_yearly");
  });

  it("should identify monthly and yearly plans correctly", async () => {
    const { isMonthlyPlan, isYearlyPlan } = await import("@/lib/iap-service");
    expect(isMonthlyPlan("rvnomad_premium_monthly")).toBe(true);
    expect(isMonthlyPlan("rvnomad_premium_yearly")).toBe(false);
    expect(isYearlyPlan("rvnomad_premium_yearly")).toBe(true);
    expect(isYearlyPlan("rvnomad_premium_monthly")).toBe(false);
  });

  it("should return correct plan names", async () => {
    const { getPlanName } = await import("@/lib/iap-service");
    expect(getPlanName(null)).toBe("Free");
    expect(getPlanName("rvnomad_premium_monthly")).toBe("Monthly");
    expect(getPlanName("rvnomad_premium_yearly")).toBe("Yearly");
    expect(getPlanName("unknown_product")).toBe("Premium");
  });

  it("should save and load premium status", async () => {
    const { savePremiumStatus, loadPremiumStatus } = await import("@/lib/iap-service");

    // Initially not premium
    const initial = await loadPremiumStatus();
    expect(initial.isPremium).toBe(false);
    expect(initial.productId).toBeNull();

    // Save as premium
    await savePremiumStatus(true, "rvnomad_premium_yearly", "2027-04-10", null);
    const saved = await loadPremiumStatus();
    expect(saved.isPremium).toBe(true);
    expect(saved.productId).toBe("rvnomad_premium_yearly");
    expect(saved.expiryDate).toBe("2027-04-10");
  });

  it("should clear premium status", async () => {
    const { savePremiumStatus, clearPremiumStatus, loadPremiumStatus } = await import("@/lib/iap-service");

    await savePremiumStatus(true, "rvnomad_premium_monthly");
    await clearPremiumStatus();

    const status = await loadPremiumStatus();
    expect(status.isPremium).toBe(false);
    expect(status.productId).toBeNull();
  });

  it("should return fallback products when store is unavailable", async () => {
    const { fetchProducts } = await import("@/lib/iap-service");
    const products = await fetchProducts();

    expect(products).toHaveLength(2);
    expect(products[0].id).toBe("rvnomad_premium_monthly");
    expect(products[0].priceAmount).toBe(5.99);
    expect(products[1].id).toBe("rvnomad_premium_yearly");
    expect(products[1].priceAmount).toBe(49.99);
  });

  it("should have correct fallback pricing", async () => {
    const { fetchProducts } = await import("@/lib/iap-service");
    const products = await fetchProducts();

    const monthly = products.find((p) => p.type === "monthly");
    const yearly = products.find((p) => p.type === "yearly");

    expect(monthly).toBeDefined();
    expect(monthly!.price).toBe("$5.99");
    expect(yearly).toBeDefined();
    expect(yearly!.price).toBe("$49.99");

    // Yearly should be cheaper per month than monthly
    const yearlyPerMonth = yearly!.priceAmount / 12;
    expect(yearlyPerMonth).toBeLessThan(monthly!.priceAmount);
  });
});
