/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Site image mapping using Unsplash free photos.
 * Images are matched by category + region/terrain for relevance.
 * Uses Unsplash Source API for free, high-quality, properly-licensed photos.
 */

import type { SiteCategory } from "./types";

// State-to-region mapping for picking the right landscape
const STATE_REGION: Record<string, string> = {
  // Pacific Northwest - forests, mountains, rain
  WA: "pacific_nw", OR: "pacific_nw",
  // West Coast - coast, redwoods
  CA: "west_coast",
  // Mountain West - rocky mountains, alpine
  CO: "mountain", MT: "mountain", WY: "mountain", ID: "mountain", UT: "mountain",
  // Desert Southwest - desert, red rock, cactus
  AZ: "desert_sw", NM: "desert_sw", NV: "desert_sw",
  // Great Plains - prairies, grasslands
  ND: "plains", SD: "plains", NE: "plains", KS: "plains", OK: "plains",
  // Upper Midwest - lakes, forests
  MN: "upper_midwest", WI: "upper_midwest", MI: "upper_midwest", IA: "upper_midwest",
  // Great Lakes
  IL: "great_lakes", IN: "great_lakes", OH: "great_lakes",
  // Southeast - beaches, swamps, subtropical
  FL: "southeast_coast", GA: "southeast", SC: "southeast", NC: "southeast",
  AL: "southeast", MS: "southeast", LA: "southeast",
  // Mid-Atlantic
  VA: "mid_atlantic", MD: "mid_atlantic", DE: "mid_atlantic", NJ: "mid_atlantic",
  PA: "mid_atlantic", NY: "mid_atlantic", DC: "mid_atlantic",
  // New England - fall foliage, coast
  CT: "new_england", MA: "new_england", RI: "new_england", NH: "new_england",
  VT: "new_england", ME: "new_england",
  // South Central
  TX: "south_central", AR: "south_central", MO: "south_central",
  // Appalachia - mountains, forests
  TN: "appalachia", KY: "appalachia", WV: "appalachia",
  // Alaska & Hawaii
  AK: "alaska", HI: "hawaii",
};

// Unsplash photo IDs organized by category + region
// Using specific Unsplash photo IDs for consistent, relevant images
const CATEGORY_IMAGES: Record<string, Record<string, string[]>> = {
  // === CAMPING ===
  rv_park: {
    default: [
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=400&fit=crop", // RV park with mountains
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop", // campsite sunset
      "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=600&h=400&fit=crop", // RV camping
    ],
    desert_sw: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop", // desert road RV
      "https://images.unsplash.com/photo-1533632359083-0185df1be85d?w=600&h=400&fit=crop", // desert camping
    ],
    mountain: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop", // mountain campsite
      "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&h=400&fit=crop", // mountain RV
    ],
    southeast_coast: [
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop", // beach camping
      "https://images.unsplash.com/photo-1571863533956-01c88e514f3e?w=600&h=400&fit=crop", // coastal RV
    ],
    pacific_nw: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=400&fit=crop", // forest camping PNW
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop", // trees campsite
    ],
  },
  national_park: {
    default: [
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&h=400&fit=crop", // national park deer
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop", // scenic national park
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop", // mountain peak
    ],
    desert_sw: [
      "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=600&h=400&fit=crop", // desert canyon
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop", // red rock
    ],
    mountain: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop", // rocky mountains
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop", // mountain vista
    ],
    alaska: [
      "https://images.unsplash.com/photo-1531176175280-109682c80e6e?w=600&h=400&fit=crop", // Alaska wilderness
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop", // Alaska landscape
    ],
  },
  state_park: {
    default: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=400&fit=crop", // forest trail
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop", // forest sunlight
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop", // lake forest
    ],
    southeast: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop", // southern forest
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop", // beach
    ],
    new_england: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop", // fall foliage
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop", // lake
    ],
    appalachia: [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=400&fit=crop", // appalachian forest
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop", // forest
    ],
  },
  boondocking: {
    default: [
      "https://images.unsplash.com/photo-1533632359083-0185df1be85d?w=600&h=400&fit=crop", // remote camping
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop", // wilderness camp
    ],
    desert_sw: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop", // desert boondocking
      "https://images.unsplash.com/photo-1533632359083-0185df1be85d?w=600&h=400&fit=crop", // desert RV
    ],
    mountain: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop", // mountain dispersed
    ],
  },
  blm: {
    default: [
      "https://images.unsplash.com/photo-1533632359083-0185df1be85d?w=600&h=400&fit=crop", // open land
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop", // desert road
    ],
  },
  national_forest: {
    default: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop", // dense forest
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=400&fit=crop", // forest path
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop", // forest lake
    ],
  },
  military: {
    default: [
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=400&fit=crop", // organized campground
    ],
  },
  harvest_host: {
    default: [
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop", // farm landscape
      "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=600&h=400&fit=crop", // vineyard
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop", // farm field
    ],
  },
  walmart: {
    default: [
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=400&fit=crop", // parking lot
    ],
  },
  cracker_barrel: {
    default: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop", // restaurant
    ],
  },
  // === OVERNIGHT ===
  casino_parking: {
    default: [
      "https://images.unsplash.com/photo-1596838132731-3301c3efb8c2?w=600&h=400&fit=crop", // casino lights
    ],
  },
  cabelas_bass_pro: {
    default: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop", // outdoor store
    ],
  },
  truck_stop: {
    default: [
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop", // truck stop
    ],
  },
  elks_moose: {
    default: [
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=400&fit=crop", // lodge parking
    ],
  },
  rest_area: {
    default: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop", // highway rest
    ],
  },
  // === SERVICES ===
  dump_station: {
    default: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop", // utility
    ],
  },
  fuel_station: {
    default: [
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop", // gas station
    ],
  },
  propane: {
    default: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop", // propane tank
    ],
  },
  rv_repair: {
    default: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop", // mechanic
    ],
  },
  water_fill: {
    default: [
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=400&fit=crop", // water
    ],
  },
  laundromat: {
    default: [
      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=400&fit=crop", // laundry
    ],
  },
  rv_wash: {
    default: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop", // car wash
    ],
  },
  rv_tires: {
    default: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop", // tire shop
    ],
  },
  // === ROAD ===
  low_clearance: {
    default: [
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop", // bridge
    ],
  },
  weight_scale: {
    default: [
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop", // scale
    ],
  },
  // === EXPLORE ===
  attraction: {
    default: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop", // scenic attraction
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&h=400&fit=crop", // nature
    ],
  },
  scenic_view: {
    default: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop", // scenic view
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop", // landscape
    ],
  },
  restaurant: {
    default: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop", // restaurant
    ],
  },
  roadside_oddity: {
    default: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop", // roadside
    ],
  },
  historic_site: {
    default: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop", // historic
    ],
  },
  visitor_center: {
    default: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop", // visitor center
    ],
  },
};

/**
 * Get a relevant image URL for a site based on its category and state.
 * Uses a deterministic hash so the same site always gets the same image.
 */
export function getSiteImageUrl(siteId: string, category: SiteCategory, state: string): string {
  const region = STATE_REGION[state] || "default";
  const categoryImages = CATEGORY_IMAGES[category];

  if (!categoryImages) {
    // Fallback for any unmapped category
    return "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop";
  }

  // Try region-specific images first, then fall back to default
  const images = categoryImages[region] || categoryImages["default"] || [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
  ];

  // Deterministic selection based on site ID
  const hash = siteId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return images[hash % images.length];
}
