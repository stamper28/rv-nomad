import { describe, expect, it } from "vitest";

describe("Stripe secret key configuration", () => {
  it("STRIPE_SK is set and has valid format", () => {
    const key = process.env.STRIPE_SK;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    // Secret keys start with sk_live_ or sk_test_
    expect(key!.startsWith("sk_live_") || key!.startsWith("sk_test_")).toBe(true);
  });
});
