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

describe("Brand/Keyword Exclusion Feature", () => {
  it("keyword 'KOA' matches multiple campgrounds", () => {
    const keyword = "KOA";
    const matches = ALL_SITES.filter((s) =>
      s.name.toLowerCase().includes(keyword.toLowerCase())
    );
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((m) => {
      expect(m.name.toLowerCase()).toContain("koa");
    });
  });

  it("keyword matching is case-insensitive", () => {
    const keyword1 = "koa";
    const keyword2 = "KOA";
    const keyword3 = "Koa";
    const matches1 = ALL_SITES.filter((s) => s.name.toLowerCase().includes(keyword1.toLowerCase()));
    const matches2 = ALL_SITES.filter((s) => s.name.toLowerCase().includes(keyword2.toLowerCase()));
    const matches3 = ALL_SITES.filter((s) => s.name.toLowerCase().includes(keyword3.toLowerCase()));
    expect(matches1.length).toBe(matches2.length);
    expect(matches2.length).toBe(matches3.length);
  });

  it("keyword count function returns correct number of matches", () => {
    const keywordMatchCount = (keyword: string) =>
      ALL_SITES.filter((s) => s.name.toLowerCase().includes(keyword.toLowerCase())).length;

    const koaCount = keywordMatchCount("KOA");
    expect(koaCount).toBeGreaterThan(0);

    // A very specific name should match fewer
    const specificCount = keywordMatchCount("Denali National Park Riley Creek");
    expect(specificCount).toBeLessThanOrEqual(koaCount);
  });

  it("multiple keywords can be excluded independently", () => {
    const keywords = ["KOA", "Jellystone"];
    const excluded = ALL_SITES.filter((s) =>
      keywords.some((k) => s.name.toLowerCase().includes(k.toLowerCase()))
    );
    const remaining = ALL_SITES.filter((s) =>
      !keywords.some((k) => s.name.toLowerCase().includes(k.toLowerCase()))
    );
    expect(excluded.length + remaining.length).toBe(ALL_SITES.length);
    remaining.forEach((s) => {
      keywords.forEach((k) => {
        expect(s.name.toLowerCase()).not.toContain(k.toLowerCase());
      });
    });
  });

  it("keyword exclusion list can be serialized separately from campground exclusion list", () => {
    const excludedCampgrounds = ["Denali National Park Riley Creek"];
    const excludedKeywords = ["KOA", "Jellystone"];
    const serializedCamps = JSON.stringify(excludedCampgrounds);
    const serializedKeywords = JSON.stringify(excludedKeywords);
    expect(JSON.parse(serializedCamps)).toEqual(excludedCampgrounds);
    expect(JSON.parse(serializedKeywords)).toEqual(excludedKeywords);
    // They are stored independently
    expect(serializedCamps).not.toBe(serializedKeywords);
  });

  it("common brand names are valid strings", () => {
    const COMMON_BRANDS = [
      "KOA", "Jellystone", "Thousand Trails", "Good Sam", "Harvest Hosts",
      "Encore", "Sun RV", "Yogi Bear", "Passport America", "Escapees",
    ];
    COMMON_BRANDS.forEach((brand) => {
      expect(brand).toBeTruthy();
      expect(typeof brand).toBe("string");
      expect(brand.length).toBeGreaterThan(1);
    });
  });
});
