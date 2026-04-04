import { describe, it, expect } from "vitest";
import {
  CAMPGROUNDS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Campground,
  type CampgroundCategory,
} from "../lib/campground-data";

describe("Campground Data", () => {
  it("should have at least 15 campgrounds", () => {
    expect(CAMPGROUNDS.length).toBeGreaterThanOrEqual(15);
  });

  it("every campground should have required fields", () => {
    CAMPGROUNDS.forEach((c: Campground) => {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(typeof c.latitude).toBe("number");
      expect(typeof c.longitude).toBe("number");
      expect(c.category).toBeTruthy();
      expect(typeof c.rating).toBe("number");
      expect(c.rating).toBeGreaterThanOrEqual(0);
      expect(c.rating).toBeLessThanOrEqual(5);
      expect(typeof c.reviewCount).toBe("number");
      expect(c.amenities).toBeInstanceOf(Array);
      expect(c.description).toBeTruthy();
    });
  });

  it("should have unique IDs", () => {
    const ids = CAMPGROUNDS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid categories", () => {
    const validCategories: CampgroundCategory[] = [
      "rv_park",
      "national_park",
      "state_park",
      "free_camping",
      "rest_area",
    ];
    CAMPGROUNDS.forEach((c) => {
      expect(validCategories).toContain(c.category);
    });
  });

  it("should have valid coordinates (US range)", () => {
    CAMPGROUNDS.forEach((c) => {
      expect(c.latitude).toBeGreaterThan(24); // south of Key West
      expect(c.latitude).toBeLessThan(50); // north of US border
      expect(c.longitude).toBeGreaterThan(-130); // west coast
      expect(c.longitude).toBeLessThan(-65); // east coast
    });
  });

  it("free camping and rest areas should have null price", () => {
    CAMPGROUNDS.filter(
      (c) => c.category === "free_camping" || c.category === "rest_area"
    ).forEach((c) => {
      expect(c.pricePerNight).toBeNull();
    });
  });

  it("paid campgrounds should have positive prices", () => {
    CAMPGROUNDS.filter(
      (c) =>
        c.category !== "free_camping" && c.category !== "rest_area"
    ).forEach((c) => {
      expect(c.pricePerNight).toBeGreaterThan(0);
    });
  });
});

describe("Category Labels and Colors", () => {
  it("should have labels for all categories", () => {
    const categories: CampgroundCategory[] = [
      "rv_park",
      "national_park",
      "state_park",
      "free_camping",
      "rest_area",
    ];
    categories.forEach((cat) => {
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
      expect(typeof CATEGORY_LABELS[cat]).toBe("string");
    });
  });

  it("should have colors for all categories", () => {
    const categories: CampgroundCategory[] = [
      "rv_park",
      "national_park",
      "state_park",
      "free_camping",
      "rest_area",
    ];
    categories.forEach((cat) => {
      expect(CATEGORY_COLORS[cat]).toBeTruthy();
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe("Campground Filtering", () => {
  it("should filter by category correctly", () => {
    const rvParks = CAMPGROUNDS.filter((c) => c.category === "rv_park");
    expect(rvParks.length).toBeGreaterThan(0);
    rvParks.forEach((c) => {
      expect(c.category).toBe("rv_park");
    });
  });

  it("should filter by search query correctly", () => {
    const query = "grand canyon";
    const results = CAMPGROUNDS.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it("should have a mix of categories", () => {
    const categories = new Set(CAMPGROUNDS.map((c) => c.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
  });
});
