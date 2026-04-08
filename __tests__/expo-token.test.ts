import { describe, it, expect } from "vitest";

describe("Expo Token", () => {
  it("EXPO_TOKEN environment variable is set", () => {
    expect(process.env.EXPO_TOKEN).toBeTruthy();
    expect(process.env.EXPO_TOKEN!.length).toBeGreaterThan(10);
  });
});
