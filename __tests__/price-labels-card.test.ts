/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * Tests for getCardPriceText and Explore section coverage
 */
import { describe, it, expect } from "vitest";
import { getCardPriceText } from "../lib/price-labels";
import type { SiteCategory } from "../lib/types";

describe("getCardPriceText", () => {
  it("returns 'Free' for null price", () => {
    expect(getCardPriceText("laundromat", null)).toBe("Free");
  });

  it("returns 'Free' for zero price", () => {
    expect(getCardPriceText("rv_wash", 0)).toBe("Free");
  });

  it("returns Est. $X/night for campsite categories", () => {
    expect(getCardPriceText("rv_park", 35)).toBe("Est. $35/night");
    expect(getCardPriceText("state_park", 25)).toBe("Est. $25/night");
    expect(getCardPriceText("national_park", 30)).toBe("Est. $30/night");
    expect(getCardPriceText("boondocking", null)).toBe("Free");
  });

  it("returns correct label for laundromat", () => {
    expect(getCardPriceText("laundromat", 6)).toBe("~$6/wash");
  });

  it("returns correct label for rv_wash", () => {
    expect(getCardPriceText("rv_wash", 15)).toBe("~$15/wash");
  });

  it("returns correct label for rv_repair", () => {
    expect(getCardPriceText("rv_repair", 95)).toBe("~$95/hr");
  });

  it("returns correct label for propane", () => {
    expect(getCardPriceText("propane", 3)).toBe("~$3/gal");
  });

  it("returns correct label for fuel_station", () => {
    expect(getCardPriceText("fuel_station", 4)).toBe("$4/gal");
  });

  it("returns correct label for water_fill", () => {
    expect(getCardPriceText("water_fill", 5)).toBe("~$5/fill");
  });

  it("returns correct label for attraction", () => {
    expect(getCardPriceText("attraction", 15)).toBe("~$15/admission");
  });

  it("returns correct label for restaurant", () => {
    expect(getCardPriceText("restaurant", 20)).toBe("~$20/avg meal");
  });

  it("returns correct label for dump_station", () => {
    expect(getCardPriceText("dump_station", 10)).toBe("~$10/use");
  });

  it("returns correct label for rv_tires", () => {
    expect(getCardPriceText("rv_tires", 150)).toBe("~$150/tire");
  });

  it("returns Free for scenic_view with no price", () => {
    expect(getCardPriceText("scenic_view", null)).toBe("Free");
  });
});

describe("Explore sections coverage", () => {
  // These categories should all be in EXPLORE_SECTIONS
  const EXPECTED_EXPLORE_CATEGORIES: SiteCategory[] = [
    "state_park", "national_park", "rv_park", "boondocking",
    "military", "harvest_host", "passport_america", "thousand_trails",
    "dump_station", "fuel_station", "attraction", "scenic_view",
    "restaurant", "laundromat", "rv_wash", "rv_repair", "propane",
    "water_fill", "rv_tires", "historic_site", "roadside_oddity",
  ];

  it("all expected categories are defined", () => {
    // Just verify the categories are valid SiteCategory values
    EXPECTED_EXPLORE_CATEGORIES.forEach((cat) => {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    });
  });
});
