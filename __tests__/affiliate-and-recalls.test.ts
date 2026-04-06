import { describe, it, expect } from "vitest";
import { getBookingOptions, isReservable, getBookingButtonLabel, getBookingUrl } from "../lib/affiliate-links";
import { RV_MANUFACTURERS, RECENT_RECALLS, COMMON_PROBLEMS, SEVERITY_CONFIG } from "../lib/rv-recalls-data";

describe("Affiliate Links", () => {
  it("returns Recreation.gov as primary for national parks", () => {
    const result = getBookingOptions("national_park", "Yosemite Upper Pines", "CA", "Yosemite");
    expect(result.primary.name).toBe("Recreation.gov");
    expect(result.primary.url).toContain("recreation.gov");
    expect(result.primary.url).toContain("Yosemite");
  });

  it("returns ReserveAmerica as primary for state parks", () => {
    const result = getBookingOptions("state_park", "Cherry Creek", "CO", "Aurora");
    expect(result.primary.name).toBe("ReserveAmerica");
    expect(result.primary.url).toContain("reserveamerica.com");
  });

  it("returns Campspot as primary for RV parks", () => {
    const result = getBookingOptions("rv_park", "KOA Denver", "CO", "Denver");
    expect(result.primary.name).toBe("Campspot");
    expect(result.primary.url).toContain("campspot.com");
  });

  it("returns Harvest Hosts for harvest host category", () => {
    const result = getBookingOptions("harvest_host", "Vineyard Stay", "CA", "Napa");
    expect(result.primary.name).toBe("Harvest Hosts");
  });

  it("returns Google Maps for free camping categories", () => {
    const result = getBookingOptions("boondocking", "BLM Land", "NV", "Tonopah");
    expect(result.primary.name).toBe("Google Maps");
  });

  it("returns secondary options for state parks", () => {
    const result = getBookingOptions("state_park", "Cherry Creek", "CO", "Aurora");
    expect(result.secondary.length).toBeGreaterThan(0);
    expect(result.secondary.some((s) => s.name === "Recreation.gov")).toBe(true);
  });

  it("isReservable returns true for reservable categories", () => {
    expect(isReservable("national_park")).toBe(true);
    expect(isReservable("state_park")).toBe(true);
    expect(isReservable("rv_park")).toBe(true);
    expect(isReservable("harvest_host")).toBe(true);
  });

  it("isReservable returns false for non-reservable categories", () => {
    expect(isReservable("boondocking")).toBe(false);
    expect(isReservable("walmart")).toBe(false);
    expect(isReservable("rest_area")).toBe(false);
  });

  it("getBookingButtonLabel returns correct labels", () => {
    expect(getBookingButtonLabel("national_park")).toBe("Reserve Now");
    expect(getBookingButtonLabel("boondocking")).toBe("Get Directions");
  });

  it("getBookingUrl returns a valid URL string", () => {
    const url = getBookingUrl("national_park", "Yosemite", "CA", "Yosemite");
    expect(url).toContain("https://");
    expect(url.length).toBeGreaterThan(20);
  });

  it("includes affiliate tags in URLs", () => {
    const result = getBookingOptions("national_park", "Yosemite", "CA", "Yosemite");
    expect(result.primary.url).toContain("affiliate=");
  });
});

describe("RV Recalls Data", () => {
  it("has at least 10 manufacturers", () => {
    expect(RV_MANUFACTURERS.length).toBeGreaterThanOrEqual(10);
  });

  it("each manufacturer has required fields", () => {
    for (const mfr of RV_MANUFACTURERS) {
      expect(mfr.name).toBeTruthy();
      expect(mfr.nhtsaId).toBeTruthy();
      expect(mfr.types.length).toBeGreaterThan(0);
      expect(mfr.recallCount).toBeGreaterThan(0);
      expect(mfr.commonIssues.length).toBeGreaterThan(0);
      expect(mfr.nhtsaSearchUrl).toContain("nhtsa.gov");
    }
  });

  it("has at least 10 recent recalls", () => {
    expect(RECENT_RECALLS.length).toBeGreaterThanOrEqual(10);
  });

  it("each recall has required fields", () => {
    for (const recall of RECENT_RECALLS) {
      expect(recall.id).toBeTruthy();
      expect(recall.nhtsaCampaignNumber).toBeTruthy();
      expect(recall.manufacturer).toBeTruthy();
      expect(recall.models.length).toBeGreaterThan(0);
      expect(recall.summary.length).toBeGreaterThan(20);
      expect(recall.consequence.length).toBeGreaterThan(10);
      expect(recall.remedy.length).toBeGreaterThan(10);
      expect(recall.affectedUnits).toBeGreaterThan(0);
      expect(["critical", "high", "moderate", "low"]).toContain(recall.severity);
    }
  });

  it("has at least 8 common problems", () => {
    expect(COMMON_PROBLEMS.length).toBeGreaterThanOrEqual(8);
  });

  it("each problem has prevention tips and symptoms", () => {
    for (const problem of COMMON_PROBLEMS) {
      expect(problem.title).toBeTruthy();
      expect(problem.preventionTips.length).toBeGreaterThan(0);
      expect(problem.symptoms.length).toBeGreaterThan(0);
      expect(problem.estimatedCost).toBeTruthy();
    }
  });

  it("severity config has all levels", () => {
    expect(SEVERITY_CONFIG.critical).toBeDefined();
    expect(SEVERITY_CONFIG.high).toBeDefined();
    expect(SEVERITY_CONFIG.moderate).toBeDefined();
    expect(SEVERITY_CONFIG.low).toBeDefined();
  });
});
