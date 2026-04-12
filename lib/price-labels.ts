/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

import type { SiteCategory } from "@/lib/types";

/**
 * Returns the correct price label for a given category.
 * Campgrounds show "est./night", services show their appropriate unit.
 */

// Categories that use "per night" pricing
const CAMPSITE_CATEGORIES = new Set<SiteCategory>([
  "rv_park", "national_park", "state_park", "boondocking", "blm",
  "national_forest", "military", "harvest_host", "passport_america",
  "thousand_trails", "walmart", "cracker_barrel", "rest_area",
  "casino_parking", "cabelas_bass_pro", "truck_stop", "elks_moose",
  "army_corps", "county_park", "provincial_park",
]);

/** Map of non-campsite categories to their price unit label */
const SERVICE_PRICE_LABELS: Partial<Record<SiteCategory, { unit: string; freeLabel: string; prefix: string }>> = {
  // RV Services
  dump_station:    { unit: "per use",     freeLabel: "Free",    prefix: "~$" },
  weight_scale:    { unit: "per weigh",   freeLabel: "Free",    prefix: "~$" },
  fuel_station:    { unit: "/gal",        freeLabel: "N/A",     prefix: "$" },
  propane:         { unit: "/gal",        freeLabel: "N/A",     prefix: "~$" },
  rv_repair:       { unit: "/hr",         freeLabel: "Call",    prefix: "~$" },
  water_fill:      { unit: "per fill",    freeLabel: "Free",    prefix: "~$" },
  laundromat:      { unit: "per wash",    freeLabel: "Free",    prefix: "~$" },
  rv_wash:         { unit: "per wash",    freeLabel: "Free",    prefix: "~$" },
  rv_tires:        { unit: "per tire",    freeLabel: "Call",    prefix: "~$" },
  rv_dealer:       { unit: "service",     freeLabel: "Varies",  prefix: "~$" },
  // Road Safety — no price
  low_clearance:   { unit: "",            freeLabel: "N/A",     prefix: "" },
  weigh_station:   { unit: "per weigh",   freeLabel: "Free",    prefix: "~$" },
  road_condition:  { unit: "",            freeLabel: "N/A",     prefix: "" },
  // Supplies
  rv_grocery:      { unit: "avg basket",  freeLabel: "Varies",  prefix: "~$" },
  rv_supply_store: { unit: "avg visit",   freeLabel: "Varies",  prefix: "~$" },
  outdoor_store:   { unit: "avg visit",   freeLabel: "Varies",  prefix: "~$" },
  // Connectivity — no price
  cell_coverage:   { unit: "",            freeLabel: "Free",    prefix: "" },
  free_wifi:       { unit: "",            freeLabel: "Free",    prefix: "" },
  // Roadtrippers POI
  attraction:      { unit: "admission",   freeLabel: "Free",    prefix: "~$" },
  scenic_view:     { unit: "",            freeLabel: "Free",    prefix: "" },
  restaurant:      { unit: "avg meal",    freeLabel: "Varies",  prefix: "~$" },
  roadside_oddity: { unit: "admission",   freeLabel: "Free",    prefix: "~$" },
  historic_site:   { unit: "admission",   freeLabel: "Free",    prefix: "~$" },
  visitor_center:  { unit: "",            freeLabel: "Free",    prefix: "" },
};

export function isCampsiteCategory(category: SiteCategory): boolean {
  return CAMPSITE_CATEGORIES.has(category);
}

/**
 * Get the stat box label for the price (e.g., "est./night", "per wash", "admission")
 */
export function getPriceLabel(category: SiteCategory, price: number | null): string {
  if (isCampsiteCategory(category)) {
    return price === null ? "No cost" : "est./night";
  }
  const info = SERVICE_PRICE_LABELS[category];
  if (!info) return price === null ? "No cost" : "est./night";
  if (price === null || price === 0) return info.freeLabel;
  return info.unit;
}

/**
 * Get the formatted price value (e.g., "~$25", "$3.50", "Free")
 */
export function getPriceValue(category: SiteCategory, price: number | null): string {
  if (price === null || price === 0) {
    const info = SERVICE_PRICE_LABELS[category];
    return info?.freeLabel || "Free";
  }
  if (isCampsiteCategory(category)) {
    return `~$${price}`;
  }
  const info = SERVICE_PRICE_LABELS[category];
  if (!info || !info.prefix) return `~$${price}`;
  return `${info.prefix}${price}`;
}

/**
 * Get the share message price text (e.g., "Est. $25/night", "~$3 per wash", "~$15 admission")
 */
export function getSharePriceText(category: SiteCategory, price: number | null): string {
  if (price === null || price === 0) return "Free";
  if (isCampsiteCategory(category)) {
    return `Est. $${price}/night`;
  }
  const info = SERVICE_PRICE_LABELS[category];
  if (!info) return `~$${price}`;
  return `${info.prefix}${price} ${info.unit}`.trim();
}

/**
 * Get the booking button price text
 */
export function getBookingPriceText(category: SiteCategory, price: number | null, platformName: string): string {
  if (price === null || price === 0) return "";
  if (isCampsiteCategory(category)) {
    return `Est. $${price}/night — verify price on ${platformName}`;
  }
  const info = SERVICE_PRICE_LABELS[category];
  if (!info) return `~$${price} — verify on ${platformName}`;
  return `${info.prefix}${price} ${info.unit} — verify on ${platformName}`.trim();
}

/**
 * Get the price disclaimer text
 */
export function getPriceDisclaimer(category: SiteCategory): string {
  if (isCampsiteCategory(category)) {
    return "Prices shown are estimates. Actual rates may vary by season, site type, and availability. Always verify current rates on the booking platform before completing your reservation.";
  }
  const info = SERVICE_PRICE_LABELS[category];
  if (info?.unit === "admission") {
    return "Admission prices shown are estimates. Actual rates may vary. Always verify current prices before visiting.";
  }
  return "Prices shown are estimates. Actual costs may vary. Always verify current pricing before visiting.";
}

/**
 * Get the price text for list/card views (e.g., "Est. $25/night", "~$6/wash", "~$15 admission")
 * Used on state-detail cards and similar listing views.
 */
export function getCardPriceText(category: SiteCategory, price: number | null): string {
  if (price === null || price === 0) return "Free";
  if (isCampsiteCategory(category)) {
    return `Est. $${price}/night`;
  }
  const info = SERVICE_PRICE_LABELS[category];
  if (!info) return `Est. $${price}/night`;
  if (!info.unit) return "Free";
  return `${info.prefix}${price}${info.unit.startsWith("/") ? info.unit : "/" + info.unit.replace("per ", "")}`;
}

/**
 * Whether this category should show the discount stacker
 * (only makes sense for campsite categories with nightly rates)
 */
export function showsDiscountStacker(category: SiteCategory): boolean {
  return isCampsiteCategory(category);
}
