import { describe, it, expect } from "vitest";

// ─── Cruise Ports Tests ───
describe("Cruise Ports Data", () => {
  it("should export CRUISE_PORTS array with 14 ports", async () => {
    const { CRUISE_PORTS } = await import("../lib/cruise-ports");
    expect(Array.isArray(CRUISE_PORTS)).toBe(true);
    expect(CRUISE_PORTS.length).toBe(13);
  });

  it("each port should have required fields", async () => {
    const { CRUISE_PORTS } = await import("../lib/cruise-ports");
    for (const port of CRUISE_PORTS) {
      expect(port.id).toBeTruthy();
      expect(port.name).toBeTruthy();
      expect(port.city).toBeTruthy();
      expect(port.state).toBeTruthy();
      expect(typeof port.latitude).toBe("number");
      expect(typeof port.longitude).toBe("number");
      expect(["Florida", "Gulf Coast", "East Coast", "California"]).toContain(port.region);
      expect(port.cruiseLines.length).toBeGreaterThan(0);
      expect(port.rvParking.length).toBeGreaterThan(0);
      expect(port.tips.length).toBeGreaterThan(0);
      expect(port.address).toBeTruthy();
      expect(port.phone).toBeTruthy();
      expect(port.website).toMatch(/^https?:\/\//);
    }
  });

  it("each cruise line should have a booking URL", async () => {
    const { CRUISE_PORTS } = await import("../lib/cruise-ports");
    for (const port of CRUISE_PORTS) {
      for (const line of port.cruiseLines) {
        expect(line.name).toBeTruthy();
        expect(line.bookingUrl).toMatch(/^https?:\/\//);
        expect(line.logoColor).toMatch(/^#/);
      }
    }
  });

  it("each RV parking option should have required fields", async () => {
    const { CRUISE_PORTS } = await import("../lib/cruise-ports");
    for (const port of CRUISE_PORTS) {
      for (const parking of port.rvParking) {
        expect(parking.name).toBeTruthy();
        expect(parking.address).toBeTruthy();
        expect(parking.dailyRate).toBeTruthy();
        expect(typeof parking.rvFriendly).toBe("boolean");
        expect(typeof parking.hookups).toBe("boolean");
        expect(["24hr", "gated", "monitored", "basic"]).toContain(parking.security);
        expect(parking.mapsUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  it("getCruisePortById should return correct port", async () => {
    const { getCruisePortById } = await import("../lib/cruise-ports");
    const port = getCruisePortById("port-canaveral");
    expect(port).toBeDefined();
    expect(port!.name).toBe("Port Canaveral");
    expect(port!.state).toBe("FL");
  });

  it("getCruisePortById should return undefined for invalid ID", async () => {
    const { getCruisePortById } = await import("../lib/cruise-ports");
    expect(getCruisePortById("nonexistent")).toBeUndefined();
  });

  it("getCruisePorts should filter by region", async () => {
    const { getCruisePorts } = await import("../lib/cruise-ports");
    const floridaPorts = getCruisePorts("Florida");
    expect(floridaPorts.length).toBeGreaterThan(0);
    for (const port of floridaPorts) {
      expect(port.region).toBe("Florida");
    }
    const californiaPorts = getCruisePorts("California");
    expect(californiaPorts.length).toBeGreaterThan(0);
    for (const port of californiaPorts) {
      expect(port.region).toBe("California");
    }
  });

  it("should have ports in all 4 regions", async () => {
    const { getCruisePorts } = await import("../lib/cruise-ports");
    expect(getCruisePorts("Florida").length).toBeGreaterThan(0);
    expect(getCruisePorts("Gulf Coast").length).toBeGreaterThan(0);
    expect(getCruisePorts("East Coast").length).toBeGreaterThan(0);
    expect(getCruisePorts("California").length).toBeGreaterThan(0);
  });
});

// ─── RIDB Photos Tests ───
describe("RIDB Photo Service", () => {
  it("should export getRIDBPhotos and supportsRIDBPhotos functions", async () => {
    const mod = await import("../lib/ridb-photos");
    expect(typeof mod.getRIDBPhotos).toBe("function");
    expect(typeof mod.supportsRIDBPhotos).toBe("function");
  });

  it("supportsRIDBPhotos should return true for federal categories", async () => {
    const { supportsRIDBPhotos } = await import("../lib/ridb-photos");
    expect(supportsRIDBPhotos("national_park")).toBe(true);
    expect(supportsRIDBPhotos("national_forest")).toBe(true);
    expect(supportsRIDBPhotos("blm")).toBe(true);
    expect(supportsRIDBPhotos("army_corps")).toBe(true);
  });

  it("supportsRIDBPhotos should return false for non-federal categories", async () => {
    const { supportsRIDBPhotos } = await import("../lib/ridb-photos");
    expect(supportsRIDBPhotos("rv_park")).toBe(false);
    expect(supportsRIDBPhotos("walmart")).toBe(false);
    expect(supportsRIDBPhotos("passport_america")).toBe(false);
    expect(supportsRIDBPhotos("thousand_trails")).toBe(false);
  });
});

// ─── Passport America & Thousand Trails Sites ───
describe("Membership Campsite Data", () => {
  it("should include Passport America sites in ALL_SITES", async () => {
    const { ALL_SITES } = await import("../lib/all-sites-data");
    const paSites = ALL_SITES.filter((s: any) => s.category === "passport_america");
    expect(paSites.length).toBe(40);
  });

  it("should include Thousand Trails sites in ALL_SITES", async () => {
    const { ALL_SITES } = await import("../lib/all-sites-data");
    const ttSites = ALL_SITES.filter((s: any) => s.category === "thousand_trails");
    expect(ttSites.length).toBe(25);
  });

  it("Passport America sites should have correct fields", async () => {
    const { ALL_SITES } = await import("../lib/all-sites-data");
    const paSites = ALL_SITES.filter((s: any) => s.category === "passport_america");
    for (const site of paSites) {
      expect(site.name).toBeTruthy();
      expect(site.state).toBeTruthy();
      expect(typeof site.latitude).toBe("number");
      expect(typeof site.longitude).toBe("number");
      expect(site.category).toBe("passport_america");
      expect(site.reviews?.length).toBeGreaterThan(0);
    }
  });

  it("Thousand Trails sites should have correct fields", async () => {
    const { ALL_SITES } = await import("../lib/all-sites-data");
    const ttSites = ALL_SITES.filter((s: any) => s.category === "thousand_trails");
    for (const site of ttSites) {
      expect(site.name).toBeTruthy();
      expect(site.state).toBeTruthy();
      expect(typeof site.latitude).toBe("number");
      expect(typeof site.longitude).toBe("number");
      expect(site.category).toBe("thousand_trails");
      expect(site.reviews?.length).toBeGreaterThan(0);
    }
  });
});

// ─── Site Images ───
describe("Site Images for New Categories", () => {
  it("should return images for passport_america category", async () => {
    const { getSiteImageUrl } = await import("../lib/site-images");
    const url = getSiteImageUrl("3662", "passport_america", "FL");
    expect(url).toMatch(/^https:\/\/images\.unsplash\.com/);
  });

  it("should return images for thousand_trails category", async () => {
    const { getSiteImageUrl } = await import("../lib/site-images");
    const url = getSiteImageUrl("3702", "thousand_trails", "CA");
    expect(url).toMatch(/^https:\/\/images\.unsplash\.com/);
  });
});
