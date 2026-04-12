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
    tag: "kieranwoll20-20", // Replace with your Amazon Associates tag
    baseUrl: "https://www.amazon.com/dp/",
  },
  // Harvest Hosts — sign up at harvesthosts.com/affiliate-program
  harvestHosts: {
    url: "https://www.awin1.com/cread.php?awinmid=111454&awinaffid=2844436&ued=https%3A%2F%2Fwww.harvesthosts.com", // Awin affiliate tracking link
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
  // KOA — Kampgrounds of America
  koa: {
    url: "https://koa.com/campgrounds/",
    name: "KOA Kampgrounds",
    cost: "KOA Value Card $33/year",
    description: "1,500+ campgrounds across North America with cabins, RV sites, and tent camping. KOA Value Card saves 10% on registration fees at all KOA locations.",
  },
  // Hipcamp — sign up at hipcamp.com/en-US/affiliates
  hipcamp: {
    url: "https://www.hipcamp.com/?ref=rvnomad", // Replace with your Hipcamp affiliate link
    name: "Hipcamp",
    cost: "Free to browse, pay per booking",
    description: "Discover unique outdoor stays on private land — farms, vineyards, ranches, treehouses, glamping, and more. Book directly through Hipcamp.",
  },
  // Campspot — apply via Awin affiliate network
  campspot: {
    url: "https://www.awin1.com/cread.php?awinmid=CAMPSPOT_AWIN_MID&awinaffid=2844436&ued=https%3A%2F%2Fwww.campspot.com", // Replace CAMPSPOT_AWIN_MID with real Awin merchant ID once approved
    name: "Campspot",
    cost: "Free to browse, pay per booking",
    description: "Book top-rated private RV parks and campgrounds. Real-time availability, instant confirmation, and exclusive deals.",
  },
  // Photobook America — personalized photo products for RV trip memories
  photobookAmerica: {
    url: "https://www.photobookamerica.com/?ref=rvnomad", // Replace with Awin/affiliate link once approved
    name: "Photobook America",
    cost: "Varies by product",
    description: "Turn your RV trip photos into beautiful photobooks, canvas prints, metal prints, calendars, mugs, and more. Ships to 100+ countries with a 100% quality guarantee.",
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
  // Travel Medical Insurance
  travelInsurance: {
    goodSamTravelAssist: {
      url: "https://www.goodsamtravelassist.com/",
      name: "Good Sam Travel Assist",
      cost: "From $79.99/year",
      description: "Emergency medical evacuation, RV/vehicle return, and travel assistance designed specifically for RVers. Covers you and your family anywhere in the US, Canada, Mexico, and the Bahamas.",
    },
    worldNomads: {
      url: "https://www.worldnomads.com/",
      name: "World Nomads",
      cost: "Varies by trip",
      description: "Flexible travel insurance with emergency medical coverage, trip cancellation, and 24/7 emergency assistance. Great for RVers crossing state lines or traveling to Canada.",
    },
    safetyWing: {
      url: "https://safetywing.com/nomad-insurance/",
      name: "SafetyWing Nomad Insurance",
      cost: "From $45/month",
      description: "Subscription-based travel medical insurance ideal for full-time RVers. Covers hospital visits, emergency medical evacuation, and travel delays. No fixed end date.",
    },
    medjet: {
      url: "https://medjetassist.com/",
      name: "Medjet",
      cost: "From $99/year",
      description: "Medical transport membership — if you're hospitalized 150+ miles from home, Medjet arranges air medical transfer to the hospital of your choice at no extra cost.",
    },
    allianz: {
      url: "https://www.allianztravelinsurance.com/",
      name: "Allianz Travel Insurance",
      cost: "Varies by trip",
      description: "Comprehensive travel protection including emergency medical, trip cancellation, baggage loss, and 24-hour hotline assistance. Trusted by millions of travelers.",
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
    koa: AFFILIATE_CONFIG.koa,
    harvest_host: AFFILIATE_CONFIG.harvestHosts,
    hipcamp: AFFILIATE_CONFIG.hipcamp,
    campspot: AFFILIATE_CONFIG.campspot,
    good_sam: AFFILIATE_CONFIG.goodSam,
    passport_america: AFFILIATE_CONFIG.passportAmerica,
    boondockers_welcome: AFFILIATE_CONFIG.boondockersWelcome,
    escapees: AFFILIATE_CONFIG.escapees,
    thousand_trails: AFFILIATE_CONFIG.thousandTrails,
  };
  return map[program] || null;
}
