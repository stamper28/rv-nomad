/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Affiliate link configuration for RV Nomad
 * Replace placeholder tags with your actual affiliate IDs once you sign up for each program.
 */

export const AFFILIATE_CONFIG = {
  // Amazon Associates — sign up at affiliate-program.amazon.com
  amazon: {
    tag: "rvnomad-20", // Replace with your Amazon Associates tag
    baseUrl: "https://www.amazon.com/dp/",
  },
  // Harvest Hosts — sign up at harvesthosts.com/affiliate-program
  harvestHosts: {
    url: "https://www.harvesthosts.com/?ref=rvnomad", // Replace with your referral link
    name: "Harvest Hosts",
    cost: "$99/year (Standard) or $149/year (Harvest Hosts+)",
    description: "Free overnight stays at 5,600+ wineries, farms, breweries, and unique locations. No nightly fee — just support the host by purchasing their products.",
  },
  // Good Sam Club
  goodSam: {
    url: "https://www.goodsam.com/?ref=rvnomad", // Replace with your referral link
    name: "Good Sam Club",
    cost: "$29/year",
    description: "10% off at 2,000+ Good Sam parks, fuel discounts, roadside assistance, and RV insurance savings.",
  },
  // Passport America
  passportAmerica: {
    url: "https://www.passportamerica.com/?ref=rvnomad", // Replace with your referral link
    name: "Passport America",
    cost: "$44/year",
    description: "50% off camping at 1,400+ campgrounds across the US, Canada, and Mexico.",
  },
  // Boondockers Welcome (now part of Harvest Hosts+)
  boondockersWelcome: {
    url: "https://www.boondockerswelcome.com/?ref=rvnomad", // Replace with your referral link
    name: "Boondockers Welcome",
    cost: "Included with Harvest Hosts+ ($149/year)",
    description: "Free overnight stays on private land hosted by fellow RVers. Now part of Harvest Hosts+ membership.",
  },
  // Escapees RV Club
  escapees: {
    url: "https://www.escapees.com/?ref=rvnomad", // Replace with your referral link
    name: "Escapees RV Club",
    cost: "$40/year",
    description: "Mail forwarding, domicile services, campground discounts, and a community of full-time RVers.",
  },
  // Thousand Trails
  thousandTrails: {
    url: "https://www.thousandtrails.com/?ref=rvnomad",
    name: "Thousand Trails",
    cost: "From $575/year (Zone Pass)",
    description: "Unlimited camping at 80+ campgrounds in your zone. Great value for frequent campers.",
  },
  // RV Insurance
  insurance: {
    progressive: {
      url: "https://www.progressive.com/rv/?ref=rvnomad",
      name: "Progressive RV Insurance",
    },
    nationalGeneral: {
      url: "https://www.nationalgeneral.com/rv-insurance/?ref=rvnomad",
      name: "National General RV Insurance",
    },
  },
} as const;

/** Build an Amazon product URL with affiliate tag.
 * Uses search URL for reliability — ASIN links can break if the product listing changes.
 */
export function amazonUrl(asin: string, productName?: string, brand?: string): string {
  // If we have a product name, use Amazon search URL (always works)
  if (productName) {
    const searchQuery = brand ? `${brand} ${productName}` : productName;
    const encoded = encodeURIComponent(searchQuery);
    return `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_CONFIG.amazon.tag}`;
  }
  // Fallback to ASIN direct link
  return `${AFFILIATE_CONFIG.amazon.baseUrl}${asin}?tag=${AFFILIATE_CONFIG.amazon.tag}`;
}

interface MembershipInfo {
  url: string;
  name: string;
  cost: string;
  description: string;
}

/** Get membership info for a given program */
export function getMembershipInfo(program: string): MembershipInfo | null {
  const map: Record<string, MembershipInfo> = {
    harvest_host: AFFILIATE_CONFIG.harvestHosts,
    good_sam: AFFILIATE_CONFIG.goodSam,
    passport_america: AFFILIATE_CONFIG.passportAmerica,
    boondockers_welcome: AFFILIATE_CONFIG.boondockersWelcome,
    escapees: AFFILIATE_CONFIG.escapees,
    thousand_trails: AFFILIATE_CONFIG.thousandTrails,
  };
  return map[program] || null;
}
