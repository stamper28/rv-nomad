/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Affiliate Booking Links
 *
 * Maps campground categories to their official booking platforms.
 * Placeholder affiliate tags are included — replace with real IDs
 * once approved by each affiliate program.
 *
 * Revenue model:
 * - Users tap "Reserve Now" → redirected to official booking site with affiliate tag
 * - RV Nomad earns commission on completed bookings (typically 5-8%)
 * - No fake payment processing, no wrong prices, no liability
 */

// ─── Affiliate Tag Placeholders ───────────────────────────────────
// Replace these with your real affiliate IDs once approved
export const AFFILIATE_TAGS = {
  /** Impact.com publisher ID (for Recreation.gov, KOA) */
  impact: "RVNOMAD_IMPACT_ID",
  /** CJ Affiliate publisher ID (for Good Sam, Camping World) */
  cj: "RVNOMAD_CJ_ID",
  /** ShareASale affiliate ID */
  shareasale: "RVNOMAD_SHAREASALE_ID",
  /** Amazon Associates tag */
  amazon: "kieranwoll20-20",
  /** Harvest Hosts affiliate ID */
  harvestHosts: "RVNOMAD_HH_ID",
  /** Passport America affiliate ID */
  passportAmerica: "RVNOMAD_PA_ID",
  /** Hipcamp referral code */
  hipcamp: "RVNOMAD_HIPCAMP_ID",
} as const;

// ─── Booking Platform Definitions ─────────────────────────────────

interface BookingPlatform {
  name: string;
  /** Base URL for the booking platform */
  baseUrl: string;
  /** How to build the search/booking URL */
  buildUrl: (campgroundName: string, state: string, city: string) => string;
  /** Platform logo/icon name (MaterialIcons) */
  icon: string;
  /** Color for the platform button */
  color: string;
  /** Description shown to user */
  description: string;
}

/**
 * Extract just the campground-specific name from a full name.
 * e.g., "Denali National Park Riley Creek" → "Riley Creek"
 * e.g., "Yellowstone Madison Campground" → "Madison Campground"
 * If the name is short enough already, return as-is.
 */
function simplifyName(fullName: string): string {
  // Common patterns to strip from the beginning
  const prefixes = [
    /^(Denali|Yellowstone|Yosemite|Glacier|Zion|Grand Canyon|Rocky Mountain|Acadia|Olympic|Sequoia|Joshua Tree|Big Bend|Everglades|Shenandoah|Great Smoky|Cuyahoga|Arches|Bryce Canyon|Capitol Reef|Canyonlands|Mesa Verde|Mount Rainier|North Cascades|Crater Lake|Lassen|Redwood|Pinnacles|Channel Islands|Death Valley|Badlands|Theodore Roosevelt|Wind Cave|Voyageurs|Isle Royale|Mammoth Cave|Congaree|Biscayne|Dry Tortugas|Virgin Islands|Haleakala|Hawaii Volcanoes|Kenai Fjords|Wrangell|Katmai|Kobuk Valley|Lake Clark|Gates of the Arctic)\s+(National Park\s+)?/i,
    /^[A-Z][a-z]+ (National Forest|National Monument|National Recreation Area|National Seashore|National Lakeshore)\s+/i,
  ];

  let simplified = fullName;
  for (const prefix of prefixes) {
    simplified = simplified.replace(prefix, "");
  }

  // If we stripped too much or nothing, use original
  if (simplified.length < 3) {
    simplified = fullName;
  }

  return simplified;
}

const BOOKING_PLATFORMS: Record<string, BookingPlatform> = {
  recreation_gov: {
    name: "Recreation.gov",
    baseUrl: "https://www.recreation.gov",
    buildUrl: (name, state, city) => {
      // Include city + state for accurate results (e.g. "Double Lake Coldspring TX")
      const searchName = simplifyName(name);
      const query = encodeURIComponent(`${searchName} ${city} ${state}`);
      return `https://www.recreation.gov/search?q=${query}`;
    },
    icon: "park",
    color: "#1a5632",
    description: "Official federal campground reservations",
  },
  reserve_america: {
    name: "ReserveAmerica",
    baseUrl: "https://www.reserveamerica.com",
    buildUrl: (name, state, city) => {
      // Include city + state for accurate results
      const searchName = simplifyName(name);
      const query = encodeURIComponent(`${searchName} ${city} ${state}`);
      return `https://www.reserveamerica.com/explore/search-results?q=${query}`;
    },
    icon: "calendar-today",
    color: "#2E7D32",
    description: "State park reservations",
  },
  koa: {
    name: "KOA.com",
    baseUrl: "https://koa.com",
    buildUrl: (_name, state, city) => {
      // KOA search by location works best
      const query = encodeURIComponent(`${city} ${state}`);
      return `https://koa.com/campgrounds/search/?query=${query}`;
    },
    icon: "cabin",
    color: "#FFD700",
    description: "KOA Kampgrounds reservations",
  },
  campspot: {
    name: "Campspot",
    baseUrl: "https://www.campspot.com",
    buildUrl: (_name, state, city) => {
      // Campspot search by location
      const query = encodeURIComponent(`${city}, ${state}`);
      return `https://www.campspot.com/search?q=${query}`;
    },
    icon: "terrain",
    color: "#FF6B35",
    description: "Private RV park reservations",
  },
  hipcamp: {
    name: "Hipcamp",
    baseUrl: "https://www.hipcamp.com",
    buildUrl: (_name, state, city) => {
      // Hipcamp search by location
      const query = encodeURIComponent(`${city}, ${state}`);
      return `https://www.hipcamp.com/en-US/search?q=${query}`;
    },
    icon: "nature-people",
    color: "#00A86B",
    description: "Unique outdoor stays",
  },
  harvest_hosts: {
    name: "Harvest Hosts",
    baseUrl: "https://www.harvesthosts.com",
    buildUrl: (_name, state, city) => {
      // Harvest Hosts — use Awin affiliate tracking link
      return `https://www.awin1.com/cread.php?awinmid=111454&awinaffid=2844436&ued=${encodeURIComponent(`https://www.harvesthosts.com/search?q=${encodeURIComponent(`${city}, ${state}`)}`)}`;
    },
    icon: "wine-bar",
    color: "#722F37",
    description: "Wineries, farms & unique stays",
  },
  passport_america: {
    name: "Passport America",
    baseUrl: "https://www.passportamerica.com",
    buildUrl: (_name, state, city) => {
      const query = encodeURIComponent(`${city}, ${state}`);
      return `https://www.passportamerica.com/campground-search/?q=${query}`;
    },
    icon: "loyalty",
    color: "#D84315",
    description: "50% off campground fees",
  },
  thousand_trails: {
    name: "Thousand Trails",
    baseUrl: "https://www.thousandtrails.com",
    buildUrl: (_name, state, _city) => {
      const stateSlug = state.toLowerCase();
      return `https://www.thousandtrails.com/find-a-campground?state=${stateSlug}`;
    },
    icon: "forest",
    color: "#1A237E",
    description: "Membership campground network",
  },
  google_maps: {
    name: "Google Maps",
    baseUrl: "https://www.google.com/maps",
    buildUrl: (name, state, city) => {
      const query = encodeURIComponent(`${name} ${city} ${state}`);
      return `https://www.google.com/maps/search/${query}`;
    },
    icon: "map",
    color: "#4285F4",
    description: "View on Google Maps",
  },
};

// ─── Category → Platform Mapping ──────────────────────────────────

import type { SiteCategory } from "./types";

/**
 * Get booking platform options for a campground based on its category.
 * Returns primary + secondary options sorted by relevance.
 */
export function getBookingOptions(
  category: SiteCategory,
  name: string,
  state: string,
  city: string,
): { primary: { name: string; url: string; icon: string; color: string; description: string }; secondary: { name: string; url: string; icon: string; color: string; description: string }[] } {
  let primaryKey: string;
  let secondaryKeys: string[];

  switch (category) {
    case "national_park":
    case "blm":
    case "national_forest":
      primaryKey = "recreation_gov";
      secondaryKeys = ["google_maps"];
      break;
    case "state_park":
      primaryKey = "reserve_america";
      secondaryKeys = ["recreation_gov", "google_maps"];
      break;
    case "rv_park":
      primaryKey = "campspot";
      secondaryKeys = ["hipcamp", "google_maps"];
      break;
    case "harvest_host":
      primaryKey = "harvest_hosts";
      secondaryKeys = ["google_maps"];
      break;
    case "passport_america":
      primaryKey = "passport_america";
      secondaryKeys = ["campspot", "google_maps"];
      break;
    case "thousand_trails":
      primaryKey = "thousand_trails";
      secondaryKeys = ["google_maps"];
      break;
    case "military":
      primaryKey = "google_maps";
      secondaryKeys = [];
      break;
    case "army_corps":
      primaryKey = "recreation_gov";
      secondaryKeys = ["google_maps"];
      break;
    case "county_park":
    case "provincial_park":
      primaryKey = "reserve_america";
      secondaryKeys = ["google_maps"];
      break;
    case "boondocking":
    case "walmart":
    case "cracker_barrel":
    case "rest_area":
    case "casino_parking":
    case "cabelas_bass_pro":
    case "truck_stop":
    case "elks_moose":
      // Free/overnight spots — no booking needed, just directions
      primaryKey = "google_maps";
      secondaryKeys = [];
      break;
    default:
      primaryKey = "google_maps";
      secondaryKeys = ["campspot"];
      break;
  }

  const primaryPlatform = BOOKING_PLATFORMS[primaryKey];
  const primary = {
    name: primaryPlatform.name,
    url: primaryPlatform.buildUrl(name, state, city),
    icon: primaryPlatform.icon,
    color: primaryPlatform.color,
    description: primaryPlatform.description,
  };

  const secondary = secondaryKeys
    .filter((k) => BOOKING_PLATFORMS[k])
    .map((k) => {
      const p = BOOKING_PLATFORMS[k];
      return {
        name: p.name,
        url: p.buildUrl(name, state, city),
        icon: p.icon,
        color: p.color,
        description: p.description,
      };
    });

  return { primary, secondary };
}

/**
 * Get a direct booking/search URL for a campground.
 * Convenience wrapper that returns just the primary URL.
 */
export function getBookingUrl(
  category: SiteCategory,
  name: string,
  state: string,
  city: string,
): string {
  const { primary } = getBookingOptions(category, name, state, city);
  return primary.url;
}

/**
 * Check if a category supports actual reservations (vs. just showing up)
 */
export function isReservable(category: SiteCategory): boolean {
  const reservableCategories: SiteCategory[] = [
    "national_park",
    "state_park",
    "rv_park",
    "harvest_host",
    "passport_america",
    "thousand_trails",
    "military",
    "army_corps",
    "county_park",
    "provincial_park",
  ];
  return reservableCategories.includes(category);
}

/**
 * Get the label for the booking button based on category
 */
export function getBookingButtonLabel(category: SiteCategory): string {
  if (!isReservable(category)) {
    return "Get Directions";
  }
  return "Reserve Now";
}
