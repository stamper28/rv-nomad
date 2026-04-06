import { describe, it, expect } from "vitest";
import {
  findNearbyFuelStations,
  findNearbySupplyStores,
  findNearbyRepairShops,
} from "../lib/nearby-services";

const CANADIAN_FUEL_BRANDS = [
  "Petro-Canada", "Esso", "Shell Canada", "Canadian Tire Gas+",
  "Husky Energy", "Co-op Gas Bar", "Ultramar", "Pioneer",
  "Chevron Canada", "Mobil",
];

const CANADIAN_SUPPLY_BRANDS = [
  "Canadian Tire", "Walmart Canada", "Home Hardware", "Cabela's Canada",
  "Bass Pro Shops Canada", "Princess Auto", "Home Depot Canada", "RONA",
  "Mark's", "Peavey Mart",
];

const CANADIAN_REPAIR_BRANDS = [
  "Fraserway RV Service", "Bucars RV Centre", "Explorer RV Service",
  "CAA Roadside", "Canadian Tire Auto Service", "Kal Tire",
  "NAPA AutoPro Canada", "RV Mobile Repair Canada",
];

describe("findNearbyFuelStations", () => {
  it("returns fuel stations near Denver", () => {
    const results = findNearbyFuelStations(39.74, -104.99, 50, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    results.forEach((s) => {
      expect(s.distanceMiles).toBeLessThanOrEqual(50);
      expect(s.directionsUrl).toContain("google.com/maps/dir");
      expect(s.diesel).toBeGreaterThan(0);
      expect(s.regular).toBeGreaterThan(0);
      expect(s.id).toBeTruthy();
      expect(s.brand).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.currency).toBe("USD");
    });
  });

  it("returns stations sorted by distance (closest first)", () => {
    const results = findNearbyFuelStations(39.74, -104.99, 100, 10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceMiles).toBeGreaterThanOrEqual(results[i - 1].distanceMiles);
    }
  });

  it("returns deterministic results for same coordinates", () => {
    const a = findNearbyFuelStations(63.73, -148.89, 50, 3);
    const b = findNearbyFuelStations(63.73, -148.89, 50, 3);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("respects the limit parameter", () => {
    const results = findNearbyFuelStations(39.74, -104.99, 200, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("includes required fields on each station", () => {
    const results = findNearbyFuelStations(35.22, -101.83, 50, 3);
    results.forEach((s) => {
      expect(typeof s.hasDEF).toBe("boolean");
      expect(typeof s.hasRVLanes).toBe("boolean");
      expect(typeof s.hasShowers).toBe("boolean");
      expect(typeof s.hasDumpStation).toBe("boolean");
      expect(s.city).toBeTruthy();
      expect(s.state).toBeTruthy();
    });
  });

  // ─── Canadian fuel station tests (using siteState) ─────────
  it("returns Canadian fuel chains for Calgary AB (lat > 49)", () => {
    const results = findNearbyFuelStations(51.04, -114.08, 50, 5, "AB");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s.currency).toBe("CAD");
      expect(s.state).toBe("AB");
      expect(CANADIAN_FUEL_BRANDS).toContain(s.brand);
    });
  });

  it("returns Canadian fuel chains for Gatineau QC (lat < 49, siteState override)", () => {
    // Gatineau is at lat 45.49, below the 49th parallel, but is in Quebec
    const results = findNearbyFuelStations(45.4951, -75.7164, 50, 3, "QC");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s.currency).toBe("CAD");
      expect(s.state).toBe("QC");
      expect(CANADIAN_FUEL_BRANDS).toContain(s.brand);
    });
  });

  it("returns Canadian fuel chains for Toronto ON (lat < 49, siteState override)", () => {
    // Toronto is at lat 43.65, well below the 49th parallel
    const results = findNearbyFuelStations(43.65, -79.38, 50, 3, "ON");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s.currency).toBe("CAD");
      expect(s.state).toBe("ON");
      expect(CANADIAN_FUEL_BRANDS).toContain(s.brand);
    });
  });

  it("returns Canadian fuel chains for Vancouver BC (lat ~49)", () => {
    const results = findNearbyFuelStations(49.34, -123.07, 50, 5, "BC");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s.currency).toBe("CAD");
      expect(s.state).toBe("BC");
      expect(CANADIAN_FUEL_BRANDS).toContain(s.brand);
    });
  });

  it("returns US fuel chains for Seattle WA (no siteState)", () => {
    const results = findNearbyFuelStations(47.6, -122.33, 50, 5);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(s.currency).toBe("USD");
    });
  });

  it("Canadian stations have higher fuel prices than US stations", () => {
    const caResults = findNearbyFuelStations(51.04, -114.08, 50, 5, "AB");
    const usResults = findNearbyFuelStations(39.74, -104.99, 50, 5);
    const caAvgDiesel = caResults.reduce((sum, s) => sum + s.diesel, 0) / caResults.length;
    const usAvgDiesel = usResults.reduce((sum, s) => sum + s.diesel, 0) / usResults.length;
    expect(caAvgDiesel).toBeGreaterThan(usAvgDiesel);
  });
});

describe("findNearbySupplyStores", () => {
  it("returns supply stores near Phoenix", () => {
    const results = findNearbySupplyStores(33.45, -112.07, 50, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    results.forEach((s) => {
      expect(s.distanceMiles).toBeLessThanOrEqual(50);
      expect(s.brand).toBeTruthy();
      expect(["general", "camping", "outdoor", "hardware"]).toContain(s.type);
    });
  });

  it("returns stores sorted by distance", () => {
    const results = findNearbySupplyStores(33.45, -112.07, 100, 10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceMiles).toBeGreaterThanOrEqual(results[i - 1].distanceMiles);
    }
  });

  it("returns Canadian supply stores for Gatineau QC (siteState override)", () => {
    const results = findNearbySupplyStores(45.4951, -75.7164, 50, 5, "QC");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(CANADIAN_SUPPLY_BRANDS).toContain(s.brand);
      expect(s.state).toBe("QC");
    });
  });

  it("returns Canadian supply stores for Calgary AB", () => {
    const results = findNearbySupplyStores(51.04, -114.08, 50, 5, "AB");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(CANADIAN_SUPPLY_BRANDS).toContain(s.brand);
      expect(s.state).toBe("AB");
    });
  });
});

describe("findNearbyRepairShops", () => {
  it("returns repair shops near Atlanta", () => {
    const results = findNearbyRepairShops(33.75, -84.39, 75, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    results.forEach((s) => {
      expect(s.distanceMiles).toBeLessThanOrEqual(75);
      expect(["dealer", "mobile", "tire", "general"]).toContain(s.type);
      expect(s.services.length).toBeGreaterThan(0);
    });
  });

  it("returns shops sorted by distance", () => {
    const results = findNearbyRepairShops(33.75, -84.39, 150, 10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceMiles).toBeGreaterThanOrEqual(results[i - 1].distanceMiles);
    }
  });

  it("includes phone numbers in correct format", () => {
    const results = findNearbyRepairShops(39.74, -104.99, 75, 3);
    results.forEach((s) => {
      expect(s.phone).toMatch(/\(\d{3}\) 555-\d{4}/);
    });
  });

  it("returns Canadian repair shops for Gatineau QC (siteState override)", () => {
    const results = findNearbyRepairShops(45.4951, -75.7164, 75, 5, "QC");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(CANADIAN_REPAIR_BRANDS).toContain(s.brand);
      expect(s.state).toBe("QC");
    });
  });

  it("returns Canadian repair shops for Calgary AB", () => {
    const results = findNearbyRepairShops(51.04, -114.08, 75, 5, "AB");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => {
      expect(CANADIAN_REPAIR_BRANDS).toContain(s.brand);
      expect(s.state).toBe("AB");
    });
  });
});
