import { describe, it, expect } from "vitest";

// Test campground data integrity
describe("Campground Data", () => {
  it("should export ALL_SITES and STATE_LIST", async () => {
    const { ALL_SITES, STATE_LIST } = await import("../lib/all-sites-data");
    expect(ALL_SITES.length).toBeGreaterThan(0);
    expect(STATE_LIST.length).toBe(63); // 50 US states + 13 Canadian provinces/territories
  }, 15000);

  it("should have sites for every state in STATE_LIST", async () => {
    const { getSitesByState, STATE_LIST } = await import("../lib/all-sites-data");
    for (const state of STATE_LIST) {
      const sites = getSitesByState(state.code);
      expect(sites.length).toBeGreaterThan(0);
      expect(state.code.length).toBe(2);
    }
  });

  it("should have valid site structure", async () => {
    const { ALL_SITES } = await import("../lib/all-sites-data");
    const site = ALL_SITES[0];
    expect(site).toHaveProperty("id");
    expect(site).toHaveProperty("name");
    expect(site).toHaveProperty("state");
    expect(site).toHaveProperty("category");
    expect(site).toHaveProperty("latitude");
    expect(site).toHaveProperty("longitude");
    expect(site).toHaveProperty("rating");
  });

  it("should have valid coordinates for all sites", async () => {
    const { ALL_SITES } = await import("../lib/all-sites-data");
    for (const site of ALL_SITES) {
      expect(site.latitude).toBeGreaterThanOrEqual(-90);
      expect(site.latitude).toBeLessThanOrEqual(90);
      expect(site.longitude).toBeGreaterThanOrEqual(-180);
      expect(site.longitude).toBeLessThanOrEqual(180);
    }
  });

  it("should have valid ratings between 0 and 5", async () => {
    const { ALL_SITES } = await import("../lib/all-sites-data");
    for (const site of ALL_SITES) {
      expect(site.rating).toBeGreaterThanOrEqual(0);
      expect(site.rating).toBeLessThanOrEqual(5);
    }
  });
});

// Test weight scale data integrity
describe("Weight Scale Data", () => {
  it("should export weight scales array", async () => {
    const { WEIGHT_SCALES } = await import("../lib/weight-scale-data");
    expect(Array.isArray(WEIGHT_SCALES)).toBe(true);
    expect(WEIGHT_SCALES.length).toBeGreaterThan(0);
  });

  it("should have valid weight scale structure", async () => {
    const { WEIGHT_SCALES } = await import("../lib/weight-scale-data");
    const scale = WEIGHT_SCALES[0];
    expect(scale).toHaveProperty("id");
    expect(scale).toHaveProperty("name");
    expect(scale).toHaveProperty("state");
    expect(scale).toHaveProperty("latitude");
    expect(scale).toHaveProperty("longitude");
    expect(scale).toHaveProperty("type");
  });
});

// Test RV guide data
describe("RV Guide Data", () => {
  it("should export guide data with classes", async () => {
    const { BUNDLED_GUIDE } = await import("../lib/rv-guide-data");
    expect(BUNDLED_GUIDE).toHaveProperty("lastUpdated");
    expect(BUNDLED_GUIDE).toHaveProperty("categories");
    expect(BUNDLED_GUIDE.categories.length).toBeGreaterThan(0);
  });

  it("should have best and worst RVs per class", async () => {
    const { BUNDLED_GUIDE } = await import("../lib/rv-guide-data");
    for (const cat of BUNDLED_GUIDE.categories) {
      expect(cat).toHaveProperty("label");
      expect(cat).toHaveProperty("best");
      expect(cat).toHaveProperty("worst");
      expect(cat.best.length).toBeGreaterThan(0);
      expect(cat.worst.length).toBeGreaterThan(0);
    }
  });
});

// Test Stripe integration module
describe("Stripe Integration", () => {
  it("should export platform fee constant", async () => {
    const { PLATFORM_FEE_PER_NIGHT } = await import("../lib/stripe");
    expect(PLATFORM_FEE_PER_NIGHT).toBe(2.0);
  });

  it("should calculate booking total correctly", async () => {
    const { calculatePayment } = await import("../lib/stripe");
    const result = calculatePayment({ pricePerNight: 50, nights: 3, sites: 1 });
    // 50 * 3 * 1 = 150 campsite subtotal
    // 2 * 3 = 6 platform fee
    // 150 * 0.06 = 9.00 taxes
    expect(result.campsiteSubtotal).toBe(150);
    expect(result.platformFee).toBe(6);
    expect(result.taxes).toBe(9);
    expect(result.total).toBe(165);
  });

  it("should calculate multi-site booking correctly", async () => {
    const { calculatePayment } = await import("../lib/stripe");
    const result = calculatePayment({ pricePerNight: 30, nights: 2, sites: 2 });
    // 30 * 2 * 2 = 120 campsite subtotal
    // 2 * 2 = 4 platform fee (per night, not per site)
    expect(result.campsiteSubtotal).toBe(120);
    expect(result.platformFee).toBe(4);
  });
});

// Test types
describe("Types", () => {
  it("should export SiteCategory type values", async () => {
    const types = await import("../lib/types");
    expect(types).toBeDefined();
  });
});
