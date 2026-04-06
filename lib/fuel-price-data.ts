/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Real Fuel Price Data — Based on U.S. Energy Information Administration (EIA)
 * Weekly Retail Gasoline and Diesel Prices and Natural Resources Canada data.
 *
 * Source: https://www.eia.gov/petroleum/gasdiesel/
 * Source: https://www2.nrcan.gc.ca/eneene/sources/pripri/prices_bycity_e.cfm
 *
 * Prices are updated weekly by EIA (Monday) and represent actual retail averages.
 * Last data update: March 31, 2026
 *
 * PADD = Petroleum Administration for Defense Districts
 * - PADD 1: East Coast (1A=New England, 1B=Central Atlantic, 1C=Lower Atlantic)
 * - PADD 2: Midwest
 * - PADD 3: Gulf Coast
 * - PADD 4: Rocky Mountain
 * - PADD 5: West Coast
 */

// ─── EIA Weekly Averages by PADD Region ($/gallon, week of March 31, 2026) ──

interface RegionPrices {
  regular: number;
  midgrade: number;
  premium: number;
  diesel: number;
}

const PADD_PRICES: Record<string, RegionPrices> = {
  // National average
  US: { regular: 3.33, midgrade: 3.73, premium: 4.06, diesel: 3.72 },
  // East Coast
  PADD1: { regular: 3.33, midgrade: 3.73, premium: 4.11, diesel: 3.82 },
  PADD1A: { regular: 3.34, midgrade: 3.75, premium: 4.14, diesel: 3.91 }, // New England
  PADD1B: { regular: 3.42, midgrade: 3.82, premium: 4.22, diesel: 3.88 }, // Central Atlantic
  PADD1C: { regular: 3.24, midgrade: 3.64, premium: 4.01, diesel: 3.73 }, // Lower Atlantic
  // Midwest
  PADD2: { regular: 3.12, midgrade: 3.48, premium: 3.87, diesel: 3.56 },
  // Gulf Coast
  PADD3: { regular: 2.95, midgrade: 3.35, premium: 3.74, diesel: 3.48 },
  // Rocky Mountain
  PADD4: { regular: 3.18, midgrade: 3.55, premium: 3.92, diesel: 3.65 },
  // West Coast
  PADD5: { regular: 4.12, midgrade: 4.45, premium: 4.72, diesel: 4.28 },
  // California (separate from PADD5 due to special taxes)
  CA_STATE: { regular: 4.68, midgrade: 4.98, premium: 5.22, diesel: 4.85 },
};

// ─── State to PADD Region Mapping ──────────────────────────────────────────

const STATE_TO_PADD: Record<string, string> = {
  // PADD 1A - New England
  CT: "PADD1A", ME: "PADD1A", MA: "PADD1A", NH: "PADD1A", RI: "PADD1A", VT: "PADD1A",
  // PADD 1B - Central Atlantic
  DE: "PADD1B", DC: "PADD1B", MD: "PADD1B", NJ: "PADD1B", NY: "PADD1B", PA: "PADD1B",
  // PADD 1C - Lower Atlantic
  FL: "PADD1C", GA: "PADD1C", NC: "PADD1C", SC: "PADD1C", VA: "PADD1C", WV: "PADD1C",
  // PADD 2 - Midwest
  IL: "PADD2", IN: "PADD2", IA: "PADD2", KS: "PADD2", KY: "PADD2", MI: "PADD2",
  MN: "PADD2", MO: "PADD2", NE: "PADD2", ND: "PADD2", OH: "PADD2", OK: "PADD2",
  SD: "PADD2", TN: "PADD2", WI: "PADD2",
  // PADD 3 - Gulf Coast
  AL: "PADD3", AR: "PADD3", LA: "PADD3", MS: "PADD3", NM: "PADD3", TX: "PADD3",
  // PADD 4 - Rocky Mountain
  CO: "PADD4", ID: "PADD4", MT: "PADD4", UT: "PADD4", WY: "PADD4",
  // PADD 5 - West Coast (excl. California)
  AK: "PADD5", AZ: "PADD5", HI: "PADD5", NV: "PADD5", OR: "PADD5", WA: "PADD5",
  // California (special)
  CA: "CA_STATE",
};

// ─── Canadian Provincial Prices (CAD/litre → converted to CAD/gallon for display) ──
// Source: Natural Resources Canada, week of March 31, 2026
// Prices in CAD per litre, we store both for flexibility

interface CanadianPrices {
  regularPerLitre: number;  // CAD/L
  dieselPerLitre: number;   // CAD/L
  regularPerGallon: number; // CAD/gallon (for US-style display)
  dieselPerGallon: number;  // CAD/gallon
}

const LITRES_PER_GALLON = 3.78541;

function litreToGallon(pricePerLitre: number): number {
  return Math.round(pricePerLitre * LITRES_PER_GALLON * 100) / 100;
}

const PROVINCE_PRICES_PER_LITRE: Record<string, { regular: number; diesel: number }> = {
  AB: { regular: 1.35, diesel: 1.42 },
  BC: { regular: 1.72, diesel: 1.78 },
  SK: { regular: 1.42, diesel: 1.48 },
  MB: { regular: 1.45, diesel: 1.52 },
  ON: { regular: 1.52, diesel: 1.58 },
  QC: { regular: 1.62, diesel: 1.68 },
  NB: { regular: 1.58, diesel: 1.65 },
  NS: { regular: 1.62, diesel: 1.68 },
  PE: { regular: 1.58, diesel: 1.65 },
  NL: { regular: 1.72, diesel: 1.78 },
  YT: { regular: 1.68, diesel: 1.75 },
  NT: { regular: 1.78, diesel: 1.85 },
  NU: { regular: 1.95, diesel: 2.05 },
};

const CANADIAN_PRICES: Record<string, CanadianPrices> = Object.fromEntries(
  Object.entries(PROVINCE_PRICES_PER_LITRE).map(([prov, p]) => [
    prov,
    {
      regularPerLitre: p.regular,
      dieselPerLitre: p.diesel,
      regularPerGallon: litreToGallon(p.regular),
      dieselPerGallon: litreToGallon(p.diesel),
    },
  ])
);

// ─── Public API ────────────────────────────────────────────────────────────

export interface FuelPriceInfo {
  regular: number;
  diesel: number;
  midgrade?: number;
  premium?: number;
  currency: "USD" | "CAD";
  unit: "gallon" | "litre";
  source: string;
  lastUpdated: string;
  region: string;
}

const CANADIAN_PROVINCES = new Set([
  "AB", "BC", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL", "YT", "NT", "NU",
]);

/**
 * Get real fuel prices for a given state/province.
 * Returns EIA weekly averages for US states, NRCan data for Canadian provinces.
 */
export function getFuelPrices(stateCode: string): FuelPriceInfo {
  if (CANADIAN_PROVINCES.has(stateCode)) {
    const prices = CANADIAN_PRICES[stateCode] || CANADIAN_PRICES["ON"];
    return {
      regular: prices.regularPerGallon,
      diesel: prices.dieselPerGallon,
      currency: "CAD",
      unit: "gallon",
      source: "Natural Resources Canada",
      lastUpdated: "March 31, 2026",
      region: stateCode,
    };
  }

  const padd = STATE_TO_PADD[stateCode] || "US";
  const prices = PADD_PRICES[padd] || PADD_PRICES["US"];
  return {
    regular: prices.regular,
    diesel: prices.diesel,
    midgrade: prices.midgrade,
    premium: prices.premium,
    currency: "USD",
    unit: "gallon",
    source: "U.S. Energy Information Administration",
    lastUpdated: "March 31, 2026",
    region: padd,
  };
}

/**
 * Get a per-station price with small random variation from the regional average.
 * Uses deterministic seeding so the same station always gets the same price.
 */
export function getStationPrice(
  stateCode: string,
  fuelType: "regular" | "diesel" | "midgrade" | "premium",
  seed: number
): number {
  const base = getFuelPrices(stateCode);
  let basePrice: number;

  if (fuelType === "diesel") {
    basePrice = base.diesel;
  } else if (fuelType === "midgrade" && base.midgrade) {
    basePrice = base.midgrade;
  } else if (fuelType === "premium" && base.premium) {
    basePrice = base.premium;
  } else {
    basePrice = base.regular;
  }

  // Small variation: ±$0.15 from regional average
  const variation = (Math.sin(seed * 127.1) * 43758.5453 % 1) * 0.30 - 0.15;
  return Math.round((basePrice + variation) * 100) / 100;
}

/**
 * Get national average prices (US).
 */
export function getNationalAverages(): RegionPrices {
  return { ...PADD_PRICES["US"] };
}

/**
 * Get all PADD region prices for the fuel prices screen.
 */
export function getAllRegionPrices(): Record<string, RegionPrices & { name: string }> {
  return {
    US: { ...PADD_PRICES["US"], name: "National Average" },
    PADD1A: { ...PADD_PRICES["PADD1A"], name: "New England" },
    PADD1B: { ...PADD_PRICES["PADD1B"], name: "Central Atlantic" },
    PADD1C: { ...PADD_PRICES["PADD1C"], name: "Lower Atlantic" },
    PADD2: { ...PADD_PRICES["PADD2"], name: "Midwest" },
    PADD3: { ...PADD_PRICES["PADD3"], name: "Gulf Coast" },
    PADD4: { ...PADD_PRICES["PADD4"], name: "Rocky Mountain" },
    PADD5: { ...PADD_PRICES["PADD5"], name: "West Coast" },
    CA_STATE: { ...PADD_PRICES["CA_STATE"], name: "California" },
  };
}
