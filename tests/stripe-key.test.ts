import { describe, expect, it } from "vitest";

describe("Stripe configuration", () => {
  it("EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set and has valid format", () => {
    const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    // Publishable keys start with pk_live_ or pk_test_
    expect(key!.startsWith("pk_live_") || key!.startsWith("pk_test_")).toBe(true);
  });
});
