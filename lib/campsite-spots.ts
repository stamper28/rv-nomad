/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Individual campsite spot data model and generator.
 * Each campground has numbered spots that users can select when booking.
 */

export type SpotType = "rv_full" | "rv_we" | "rv_electric" | "rv_dry" | "tent" | "cabin" | "group";

export interface CampsiteSpot {
  id: string;          // e.g. "site-123-spot-A1"
  siteId: string;      // parent campground ID
  spotNumber: string;  // e.g. "A1", "12", "B5"
  spotType: SpotType;
  hookup: "full" | "water_electric" | "electric_only" | "none";
  ampService: "50" | "30" | "20" | "50_30" | "none";
  maxRVLength: number; // feet, 0 for tent/cabin
  pullThrough: boolean;
  adaAccessible: boolean;
  shade: "full" | "partial" | "none";
  waterfront: boolean;
  premium: boolean;    // premium spot (extra cost)
  priceModifier: number; // +/- from base price (e.g. +5 for waterfront, -10 for dry)
}

const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  rv_full: "Full Hookup RV",
  rv_we: "Water/Electric RV",
  rv_electric: "Electric Only RV",
  rv_dry: "Dry Camping RV",
  tent: "Tent Site",
  cabin: "Cabin",
  group: "Group Site",
};

const SPOT_TYPE_ICONS: Record<SpotType, string> = {
  rv_full: "electrical-services",
  rv_we: "water-drop",
  rv_electric: "bolt",
  rv_dry: "landscape",
  tent: "park",
  cabin: "cabin",
  group: "groups",
};

export { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS };

/**
 * Deterministically generate spots for a campground based on its properties.
 * Uses the site ID as a seed for consistent results.
 */
export function generateSpotsForSite(
  siteId: string,
  category: string,
  hookupType?: string,
  ampService?: string,
  adaAccessible?: boolean,
  pullThrough?: boolean,
  bigRigFriendly?: boolean,
  pricePerNight?: number | null,
): CampsiteSpot[] {
  // Deterministic seed from site ID
  const seed = hashCode(siteId);
  const rng = seededRandom(seed);

  // Determine number of spots based on category
  let spotCount: number;
  switch (category) {
    case "rv_park":
    case "campground":
      spotCount = 15 + Math.floor(rng() * 35); // 15-50
      break;
    case "state_park":
    case "national_park":
      spotCount = 20 + Math.floor(rng() * 60); // 20-80
      break;
    case "military":
      spotCount = 10 + Math.floor(rng() * 20); // 10-30
      break;
    case "boondocking":
    case "blm":
      spotCount = 5 + Math.floor(rng() * 10); // 5-15
      break;
    case "harvest_host":
      spotCount = 2 + Math.floor(rng() * 4); // 2-6
      break;
    default:
      spotCount = 8 + Math.floor(rng() * 15); // 8-23
  }

  const spots: CampsiteSpot[] = [];
  const useLetterSections = rng() > 0.4; // 60% use letter sections (A1, B3)
  const sections = ["A", "B", "C", "D", "E"];

  for (let i = 0; i < spotCount; i++) {
    let spotNumber: string;
    if (useLetterSections) {
      const sectionIdx = Math.floor(i / Math.ceil(spotCount / Math.min(sections.length, 3 + Math.floor(rng() * 3))));
      const section = sections[Math.min(sectionIdx, sections.length - 1)];
      const num = (i % Math.ceil(spotCount / 3)) + 1;
      spotNumber = `${section}${num}`;
    } else {
      spotNumber = `${i + 1}`;
    }

    // Determine spot type based on campground category
    let spotType: SpotType;
    let hookup: CampsiteSpot["hookup"] = "none";
    let amp: CampsiteSpot["ampService"] = "none";
    let maxLen = 0;
    let isPullThrough = false;

    if (category === "boondocking" || category === "blm") {
      // Boondocking: mostly dry RV or tent
      spotType = rng() > 0.4 ? "rv_dry" : "tent";
    } else if (category === "harvest_host") {
      spotType = rng() > 0.3 ? "rv_dry" : "tent";
    } else {
      // Mix of spot types
      const roll = rng();
      if (roll < 0.35) {
        spotType = "rv_full";
        hookup = "full";
        amp = rng() > 0.5 ? "50_30" : "30";
        maxLen = bigRigFriendly ? 45 + Math.floor(rng() * 20) : 30 + Math.floor(rng() * 15);
        isPullThrough = pullThrough ? rng() > 0.3 : rng() > 0.7;
      } else if (roll < 0.55) {
        spotType = "rv_we";
        hookup = "water_electric";
        amp = rng() > 0.6 ? "30" : "20";
        maxLen = 25 + Math.floor(rng() * 20);
        isPullThrough = rng() > 0.6;
      } else if (roll < 0.7) {
        spotType = "rv_electric";
        hookup = "electric_only";
        amp = "20";
        maxLen = 25 + Math.floor(rng() * 15);
      } else if (roll < 0.88) {
        spotType = "tent";
      } else if (roll < 0.95 && (category === "campground" || category === "rv_park" || category === "state_park")) {
        spotType = "cabin";
      } else {
        spotType = "group";
      }
    }

    // Override hookup from parent site data
    if (hookupType === "full" && spotType.startsWith("rv_")) {
      hookup = "full";
      spotType = "rv_full";
    } else if (hookupType === "water_electric" && spotType === "rv_full") {
      hookup = "water_electric";
      spotType = "rv_we";
    }

    if (ampService && spotType.startsWith("rv_") && hookup !== "none") {
      amp = ampService as CampsiteSpot["ampService"];
    }

    // ADA: ~8% of spots, more if campground is ADA accessible
    const isAda = adaAccessible ? rng() > 0.85 : rng() > 0.96;

    // Shade
    const shadeRoll = rng();
    const shade: CampsiteSpot["shade"] = shadeRoll < 0.25 ? "full" : shadeRoll < 0.6 ? "partial" : "none";

    // Waterfront: ~15% of spots
    const isWaterfront = rng() > 0.85;

    // Premium: waterfront or first few spots
    const isPremium = isWaterfront || i < 2;

    // Price modifier
    let priceModifier = 0;
    if (isPremium && isWaterfront) priceModifier += 10;
    else if (isPremium) priceModifier += 5;
    if (spotType === "cabin") priceModifier += 25;
    if (spotType === "group") priceModifier += 15;
    if (hookup === "none" && spotType !== "cabin") priceModifier -= 5;
    if (spotType === "tent") priceModifier -= 10;

    spots.push({
      id: `${siteId}-spot-${spotNumber}`,
      siteId,
      spotNumber,
      spotType,
      hookup,
      ampService: amp,
      maxRVLength: maxLen,
      pullThrough: isPullThrough,
      adaAccessible: isAda,
      shade,
      waterfront: isWaterfront,
      premium: isPremium,
      priceModifier,
    });
  }

  return spots;
}

// Simple hash function for deterministic seeding
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Seeded PRNG (mulberry32)
function seededRandom(seed: number): () => number {
  let t = seed + 0x6D2B79F5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
