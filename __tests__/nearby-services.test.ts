import { describe, it, expect } from "vitest";
import {
  findNearbyFuelStations,
  findNearbySupplyStores,
  findNearbyRepairShops,
} from "../lib/nearby-services";

describe("findNearbyFuelStations", () => {
  it("returns fuel stations near Denver", () => {
    // Denver, CO coordinates
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
    });
  });

  it("returns stations sorted by distance (closest first)", () => {
    const results = findNearbyFuelStations(39.74, -104.99, 100, 10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceMiles).toBeGreaterThanOrEqual(results[i - 1].distanceMiles);
    }
  });

  it("returns empty array for remote location with no stations nearby", () => {
    // Middle of the Pacific Ocean
    const results = findNearbyFuelStations(20.0, -160.0, 50, 5);
    expect(results.length).toBe(0);
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
});

describe("findNearbySupplyStores", () => {
  it("returns supply stores near Phoenix", () => {
    const results = findNearbySupplyStores(33.45, -112.07, 50, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    results.forEach((s) => {
      expect(s.distanceMiles).toBeLessThanOrEqual(50);
      expect(s.directionsUrl).toContain("google.com/maps/dir");
      expect(s.brand).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(["general", "camping", "outdoor", "hardware"]).toContain(s.type);
      expect(typeof s.hasRVSupplies).toBe("boolean");
      expect(typeof s.hasPropane).toBe("boolean");
      expect(typeof s.hasFirewood).toBe("boolean");
      expect(typeof s.hasBait).toBe("boolean");
      expect(s.hours).toBeTruthy();
    });
  });

  it("returns stores sorted by distance", () => {
    const results = findNearbySupplyStores(33.45, -112.07, 100, 10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceMiles).toBeGreaterThanOrEqual(results[i - 1].distanceMiles);
    }
  });

  it("returns empty for remote location", () => {
    const results = findNearbySupplyStores(20.0, -160.0, 50, 5);
    expect(results.length).toBe(0);
  });
});

describe("findNearbyRepairShops", () => {
  it("returns repair shops near Atlanta", () => {
    const results = findNearbyRepairShops(33.75, -84.39, 75, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    results.forEach((s) => {
      expect(s.distanceMiles).toBeLessThanOrEqual(75);
      expect(s.directionsUrl).toContain("google.com/maps/dir");
      expect(s.brand).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(["dealer", "mobile", "tire", "general"]).toContain(s.type);
      expect(s.services.length).toBeGreaterThan(0);
      expect(typeof s.hasMobileService).toBe("boolean");
      expect(typeof s.acceptsEmergency).toBe("boolean");
      expect(s.hours).toBeTruthy();
      expect(s.phone).toBeTruthy();
    });
  });

  it("returns shops sorted by distance", () => {
    const results = findNearbyRepairShops(33.75, -84.39, 150, 10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceMiles).toBeGreaterThanOrEqual(results[i - 1].distanceMiles);
    }
  });

  it("returns empty for remote location", () => {
    const results = findNearbyRepairShops(20.0, -160.0, 50, 5);
    expect(results.length).toBe(0);
  });

  it("includes phone numbers in correct format", () => {
    const results = findNearbyRepairShops(39.74, -104.99, 75, 3);
    results.forEach((s) => {
      expect(s.phone).toMatch(/\(\d{3}\) 555-\d{4}/);
    });
  });
});
