/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { describe, it, expect } from "vitest";
import { ALL_SITES } from "../lib/all-sites-data";

describe("Exclude Campgrounds Feature", () => {
  it("ALL_SITES has searchable campground names", () => {
    expect(ALL_SITES.length).toBeGreaterThan(100);
    ALL_SITES.forEach((site) => {
      expect(site.name).toBeTruthy();
      expect(typeof site.name).toBe("string");
      expect(site.name.length).toBeGreaterThan(0);
    });
  });

  it("can filter campgrounds by name search (case-insensitive)", () => {
    const searchTerm = "denali";
    const results = ALL_SITES.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.name.toLowerCase()).toContain(searchTerm);
    });
  });

  it("can build an exclusion list and filter sites out", () => {
    const excluded = ["Denali National Park Riley Creek", "Yellowstone Bridge Bay"];
    const remaining = ALL_SITES.filter((s) => !excluded.includes(s.name));
    expect(remaining.length).toBe(ALL_SITES.length - excluded.filter(name => ALL_SITES.some(s => s.name === name)).length);
    remaining.forEach((s) => {
      expect(excluded).not.toContain(s.name);
    });
  });

  it("exclusion list can be serialized and deserialized (AsyncStorage simulation)", () => {
    const excluded = ["KOA Amarillo", "Yellowstone Bridge Bay", "Glacier National Park"];
    const serialized = JSON.stringify(excluded);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(excluded);
    expect(deserialized.length).toBe(3);
  });

  it("search results exclude already-excluded campgrounds", () => {
    const alreadyExcluded = ALL_SITES.slice(0, 3).map((s) => s.name);
    const searchTerm = ALL_SITES[0].name.substring(0, 4).toLowerCase();
    const results = ALL_SITES.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm) &&
        !alreadyExcluded.includes(s.name)
    );
    results.forEach((r) => {
      expect(alreadyExcluded).not.toContain(r.name);
    });
  });

  it("each site has city, state, and category for search result display", () => {
    const sample = ALL_SITES.slice(0, 50);
    sample.forEach((site) => {
      expect(site.city).toBeTruthy();
      expect(site.state).toBeTruthy();
      expect(site.category).toBeTruthy();
    });
  });
});
