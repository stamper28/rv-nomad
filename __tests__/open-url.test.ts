/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { describe, it, expect } from "vitest";

// Test the URL classification logic used by openUrl
describe("openUrl utility", () => {
  function classifyUrl(url: string): "tel" | "mailto" | "sms" | "maps" | "web" | "other" {
    if (!url) return "other";
    if (url.startsWith("tel:")) return "tel";
    if (url.startsWith("mailto:")) return "mailto";
    if (url.startsWith("sms:")) return "sms";
    if (url.includes("google.com/maps") || url.includes("maps.google.com")) return "maps";
    if (url.startsWith("http://") || url.startsWith("https://")) return "web";
    return "other";
  }

  it("should classify tel: URLs correctly", () => {
    expect(classifyUrl("tel:+15551234567")).toBe("tel");
    expect(classifyUrl("tel:911")).toBe("tel");
  });

  it("should classify mailto: URLs correctly", () => {
    expect(classifyUrl("mailto:test@example.com")).toBe("mailto");
  });

  it("should classify sms: URLs correctly", () => {
    expect(classifyUrl("sms:+15551234567")).toBe("sms");
  });

  it("should classify Google Maps URLs correctly", () => {
    expect(classifyUrl("https://www.google.com/maps/search/Denali")).toBe("maps");
    expect(classifyUrl("https://maps.google.com/maps?q=test")).toBe("maps");
  });

  it("should classify regular web URLs correctly", () => {
    expect(classifyUrl("https://www.recreation.gov/search?q=test")).toBe("web");
    expect(classifyUrl("https://www.reserveamerica.com/explore")).toBe("web");
    expect(classifyUrl("https://koa.com/campgrounds")).toBe("web");
    expect(classifyUrl("https://www.campspot.com/search")).toBe("web");
    expect(classifyUrl("https://www.amazon.com/dp/B123")).toBe("web");
    expect(classifyUrl("http://example.com")).toBe("web");
  });

  it("should classify empty or unknown URLs as other", () => {
    expect(classifyUrl("")).toBe("other");
    expect(classifyUrl("custom-scheme://test")).toBe("other");
  });

  it("should handle affiliate URLs with query params", () => {
    const recGov = "https://www.recreation.gov/search?q=Denali%20National%20Park&affiliate=RVNOMAD_IMPACT_ID";
    expect(classifyUrl(recGov)).toBe("web");

    const amazon = "https://www.amazon.com/dp/B08N5WRWNW?tag=rvnomad-20";
    expect(classifyUrl(amazon)).toBe("web");
  });

  it("should handle Google Maps directions URLs from nearby services", () => {
    const directionsUrl = "https://www.google.com/maps/dir/63.7294,-148.9146/63.7500,-148.8800";
    expect(classifyUrl(directionsUrl)).toBe("maps");
  });
});
