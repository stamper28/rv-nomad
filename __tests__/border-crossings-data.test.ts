import { describe, it, expect } from "vitest";
import {
  BORDER_CROSSINGS,
  BORDER_LAWS,
  BORDER_AGENCY_CONTACTS,
  BORDER_REGIONS,
  getCrossingsByRegion,
  getTopCrossings,
  getRVFriendlyCrossings,
} from "../lib/border-crossings-data";

describe("Border Crossings Data", () => {
  it("should have at least 25 border crossings", () => {
    expect(BORDER_CROSSINGS.length).toBeGreaterThanOrEqual(25);
  });

  it("every crossing has required fields", () => {
    for (const c of BORDER_CROSSINGS) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.canadianCity).toBeTruthy();
      expect(c.canadianProvince).toBeTruthy();
      expect(c.usCity).toBeTruthy();
      expect(c.usState).toBeTruthy();
      expect(c.cbsaPhone).toBeTruthy();
      expect(c.lat).toBeGreaterThan(40);
      expect(c.lng).toBeLessThan(0);
      expect(c.rvFriendly).toBeGreaterThanOrEqual(1);
      expect(c.rvFriendly).toBeLessThanOrEqual(3);
      expect(c.popularityRank).toBeGreaterThan(0);
      expect(BORDER_REGIONS).toContain(c.region);
    }
  });

  it("every crossing has a valid CBSA phone number format", () => {
    for (const c of BORDER_CROSSINGS) {
      // Should start with 1- and have digits
      expect(c.cbsaPhone).toMatch(/^1-\d{3}-\d{3}-\d{4}$/);
    }
  });

  it("crossings cover all regions", () => {
    const regions = new Set(BORDER_CROSSINGS.map((c) => c.region));
    for (const r of BORDER_REGIONS) {
      expect(regions.has(r)).toBe(true);
    }
  });

  it("has crossings in key states: WA, NY, MI, MT, ME", () => {
    const states = new Set(BORDER_CROSSINGS.map((c) => c.usState));
    expect(states.has("WA")).toBe(true);
    expect(states.has("NY")).toBe(true);
    expect(states.has("MI")).toBe(true);
    expect(states.has("MT")).toBe(true);
    expect(states.has("ME")).toBe(true);
  });

  it("has crossings in key provinces: ON, BC, QC, AB, NB", () => {
    const provinces = new Set(BORDER_CROSSINGS.map((c) => c.canadianProvince));
    expect(provinces.has("ON")).toBe(true);
    expect(provinces.has("BC")).toBe(true);
    expect(provinces.has("QC")).toBe(true);
    expect(provinces.has("AB")).toBe(true);
    expect(provinces.has("NB")).toBe(true);
  });

  it("getCrossingsByRegion returns correct subset", () => {
    const ontario = getCrossingsByRegion("Ontario");
    expect(ontario.length).toBeGreaterThan(0);
    for (const c of ontario) {
      expect(c.region).toBe("Ontario");
    }
  });

  it("getTopCrossings returns sorted by popularity", () => {
    const top5 = getTopCrossings(5);
    expect(top5.length).toBe(5);
    for (let i = 1; i < top5.length; i++) {
      expect(top5[i].popularityRank).toBeGreaterThanOrEqual(top5[i - 1].popularityRank);
    }
  });

  it("getRVFriendlyCrossings returns only rating 3", () => {
    const friendly = getRVFriendlyCrossings();
    expect(friendly.length).toBeGreaterThan(0);
    for (const c of friendly) {
      expect(c.rvFriendly).toBe(3);
    }
  });

  it("some crossings have RV lanes", () => {
    const withLanes = BORDER_CROSSINGS.filter((c) => c.hasRVLane);
    expect(withLanes.length).toBeGreaterThan(0);
  });

  it("some crossings are not 24h", () => {
    const limited = BORDER_CROSSINGS.filter((c) => !c.open24h);
    expect(limited.length).toBeGreaterThan(0);
  });
});

describe("Border Laws Data", () => {
  it("should have exactly 10 laws", () => {
    expect(BORDER_LAWS.length).toBe(10);
  });

  it("laws are ranked 1-10", () => {
    const ranks = BORDER_LAWS.map((l) => l.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("every law has required fields", () => {
    for (const law of BORDER_LAWS) {
      expect(law.id).toBeTruthy();
      expect(law.title).toBeTruthy();
      expect(law.penalty).toBeTruthy();
      expect(law.description.length).toBeGreaterThan(20);
      expect(law.tips.length).toBeGreaterThan(0);
      expect(["critical", "high", "medium"]).toContain(law.severity);
      expect(["entering_canada", "entering_us", "both"]).toContain(law.direction);
    }
  });

  it("firearms is ranked #1 (most common RVer violation)", () => {
    const firearms = BORDER_LAWS.find((l) => l.id === "firearms");
    expect(firearms).toBeDefined();
    expect(firearms!.rank).toBe(1);
    expect(firearms!.severity).toBe("critical");
  });

  it("cannabis is ranked #2", () => {
    const cannabis = BORDER_LAWS.find((l) => l.id === "cannabis");
    expect(cannabis).toBeDefined();
    expect(cannabis!.rank).toBe(2);
    expect(cannabis!.severity).toBe("critical");
  });
});

describe("Border Agency Contacts", () => {
  it("CBSA has all required contact info", () => {
    expect(BORDER_AGENCY_CONTACTS.cbsa.mainPhone).toBeTruthy();
    expect(BORDER_AGENCY_CONTACTS.cbsa.outsideCanada).toBeTruthy();
    expect(BORDER_AGENCY_CONTACTS.cbsa.borderInfoService).toBeTruthy();
    expect(BORDER_AGENCY_CONTACTS.cbsa.website).toContain("cbsa");
    expect(BORDER_AGENCY_CONTACTS.cbsa.waitTimesUrl).toContain("bwt");
  });

  it("CBP has all required contact info", () => {
    expect(BORDER_AGENCY_CONTACTS.cbp.mainPhone).toBeTruthy();
    expect(BORDER_AGENCY_CONTACTS.cbp.outsideUS).toBeTruthy();
    expect(BORDER_AGENCY_CONTACTS.cbp.website).toContain("cbp");
    expect(BORDER_AGENCY_CONTACTS.cbp.waitTimesUrl).toBeTruthy();
  });
});
