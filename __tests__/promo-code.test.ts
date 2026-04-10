import { describe, it, expect } from "vitest";
import { validatePromoCode, getDiscountedPrice } from "../lib/promo-store";

describe("Promo Code Validation", () => {
  it("should accept valid promo code BOOKTOUR50", () => {
    const result = validatePromoCode("BOOKTOUR50", "yearly");
    expect(result.valid).toBe(true);
    expect(result.code).toBe("BOOKTOUR50");
    expect(result.discountPercent).toBe(50);
  });

  it("should accept valid promo code VETERAN50", () => {
    const result = validatePromoCode("VETERAN50", "yearly");
    expect(result.valid).toBe(true);
    expect(result.code).toBe("VETERAN50");
    expect(result.discountPercent).toBe(50);
  });

  it("should accept valid promo code RVNOMAD50", () => {
    const result = validatePromoCode("RVNOMAD50", "monthly");
    expect(result.valid).toBe(true);
    expect(result.code).toBe("RVNOMAD50");
    expect(result.discountPercent).toBe(50);
  });

  it("should accept valid promo code HANDICAP50", () => {
    const result = validatePromoCode("handicap50", "yearly"); // test case insensitivity
    expect(result.valid).toBe(true);
    expect(result.code).toBe("HANDICAP50");
    expect(result.discountPercent).toBe(50);
  });

  it("should accept LAUNCH50 (not expired yet)", () => {
    const result = validatePromoCode("LAUNCH50", "yearly");
    expect(result.valid).toBe(true);
    expect(result.code).toBe("LAUNCH50");
  });

  it("should reject invalid promo code", () => {
    const result = validatePromoCode("FAKECODE", "yearly");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid promo code");
  });

  it("should reject empty promo code", () => {
    const result = validatePromoCode("", "yearly");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Please enter a promo code");
  });

  it("should reject whitespace-only promo code", () => {
    const result = validatePromoCode("   ", "yearly");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Please enter a promo code");
  });

  it("should be case insensitive", () => {
    const result = validatePromoCode("booktour50", "yearly");
    expect(result.valid).toBe(true);
    expect(result.code).toBe("BOOKTOUR50");
  });

  it("should trim whitespace", () => {
    const result = validatePromoCode("  VETERAN50  ", "yearly");
    expect(result.valid).toBe(true);
    expect(result.code).toBe("VETERAN50");
  });
});

describe("Discounted Price Calculation", () => {
  it("should calculate 50% off yearly price", () => {
    const result = getDiscountedPrice(49.99, 50);
    expect(result.discountedPrice).toBe(24.99);
    expect(result.savings).toBe(25);
  });

  it("should calculate 50% off monthly price", () => {
    const result = getDiscountedPrice(5.99, 50);
    expect(result.discountedPrice).toBe(2.99);
    expect(result.savings).toBe(3);
  });

  it("should handle 0% discount", () => {
    const result = getDiscountedPrice(49.99, 0);
    expect(result.discountedPrice).toBe(49.99);
    expect(result.savings).toBe(0);
  });

  it("should handle 100% discount", () => {
    const result = getDiscountedPrice(49.99, 100);
    expect(result.discountedPrice).toBe(0);
    expect(result.savings).toBe(49.99);
  });
});
