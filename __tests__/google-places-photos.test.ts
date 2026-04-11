import { describe, it, expect } from "vitest";
import { buildPlaceQuery } from "../lib/google-places-photos";

describe("Google Places Photos Service", () => {
  describe("buildPlaceQuery", () => {
    it("should build a query with site name, city, and state", () => {
      const query = buildPlaceQuery("KOA Campground", "Orlando", "FL", "rv_park");
      expect(query).toContain("KOA Campground");
      expect(query).toContain("RV park");
      expect(query).toContain("Orlando, FL");
    });

    it("should add category hint for truck stops", () => {
      const query = buildPlaceQuery("Flying J", "Dallas", "TX", "truck_stop");
      expect(query).toContain("truck stop");
      expect(query).toContain("Dallas, TX");
    });

    it("should add category hint for dump stations", () => {
      const query = buildPlaceQuery("City Dump Station", "Phoenix", "AZ", "dump_station");
      expect(query).toContain("RV dump station");
    });

    it("should not duplicate category hint if already in name", () => {
      const query = buildPlaceQuery("Orlando RV Park", "Orlando", "FL", "rv_park");
      // Should not add "RV park" again since it's already in the name
      const rvParkCount = (query.match(/RV park/gi) || []).length;
      expect(rvParkCount).toBeLessThanOrEqual(1);
    });

    it("should handle missing city gracefully", () => {
      const query = buildPlaceQuery("Yellowstone Campground", undefined, "WY", "campground");
      expect(query).toContain("Yellowstone Campground");
      expect(query).toContain("WY");
    });

    it("should handle missing state gracefully", () => {
      const query = buildPlaceQuery("Some Campground");
      expect(query).toBe("Some Campground");
    });
  });
});
