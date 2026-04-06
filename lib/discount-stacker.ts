/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
// Discount Stacker - shows all applicable discounts for a campsite

export interface Discount {
  program: string;
  type: "membership" | "military" | "age" | "loyalty" | "seasonal" | "length_of_stay";
  percentOff?: number;
  flatOff?: number;
  description: string;
  membershipCost?: number;
  membershipPeriod?: string;
  requirements?: string;
  affiliateUrl?: string;
}

export interface DiscountResult {
  originalPrice: number;
  discounts: Discount[];
  bestPrice: number;
  totalSavings: number;
  bestCombo: Discount[];
}

const ALL_DISCOUNTS: Discount[] = [
  {
    program: "Good Sam Club",
    type: "membership",
    percentOff: 10,
    description: "10% off at 2,000+ Good Sam Parks",
    membershipCost: 29,
    membershipPeriod: "year",
    requirements: "Good Sam membership required",
    affiliateUrl: "https://www.goodsam.com/join",
  },
  {
    program: "Passport America",
    type: "membership",
    percentOff: 50,
    description: "50% off at 1,400+ campgrounds",
    membershipCost: 44,
    membershipPeriod: "year",
    requirements: "Passport America membership required. Restrictions may apply (weekdays only, limited dates).",
    affiliateUrl: "https://www.passportamerica.com",
  },
  {
    program: "Escapees RV Club",
    type: "membership",
    percentOff: 15,
    description: "15% off at select RV parks + mail forwarding",
    membershipCost: 40,
    membershipPeriod: "year",
    requirements: "Escapees membership required",
    affiliateUrl: "https://www.escapees.com",
  },
  {
    program: "KOA Value Kard",
    type: "membership",
    percentOff: 10,
    description: "10% off at all KOA campgrounds",
    membershipCost: 33,
    membershipPeriod: "year",
    requirements: "KOA Value Kard Rewards membership",
    affiliateUrl: "https://koa.com/value-kard/",
  },
  {
    program: "Military/Veteran",
    type: "military",
    percentOff: 10,
    description: "10% military/veteran discount",
    requirements: "Active duty, veteran, or military family ID required",
  },
  {
    program: "Senior Discount",
    type: "age",
    percentOff: 10,
    description: "10% off for guests 62+",
    requirements: "Must be 62 years or older",
  },
  {
    program: "Weekly Stay",
    type: "length_of_stay",
    percentOff: 15,
    description: "15% off for 7+ night stays",
    requirements: "Minimum 7 consecutive nights",
  },
  {
    program: "Monthly Stay",
    type: "length_of_stay",
    percentOff: 30,
    description: "30% off for 28+ night stays",
    requirements: "Minimum 28 consecutive nights",
  },
  {
    program: "Off-Season",
    type: "seasonal",
    percentOff: 20,
    description: "20% off during off-season (Nov-Mar)",
    requirements: "Available November through March only",
  },
  {
    program: "AAA/CAA",
    type: "membership",
    percentOff: 10,
    description: "10% off with AAA/CAA membership",
    membershipCost: 60,
    membershipPeriod: "year",
    requirements: "Valid AAA or CAA membership card",
  },
  {
    program: "AARP",
    type: "membership",
    percentOff: 10,
    description: "10% off with AARP membership",
    membershipCost: 16,
    membershipPeriod: "year",
    requirements: "Valid AARP membership, age 50+",
    affiliateUrl: "https://www.aarp.org",
  },
];

export function calculateDiscounts(
  pricePerNight: number,
  nights: number,
  category: string,
  siteName: string,
): DiscountResult {
  const applicableDiscounts: Discount[] = [];
  const nameUpper = siteName.toUpperCase();

  for (const discount of ALL_DISCOUNTS) {
    // KOA discount only at KOA campgrounds
    if (discount.program === "KOA Value Kard" && !nameUpper.includes("KOA")) continue;

    // Good Sam only at RV parks and campgrounds
    if (discount.program === "Good Sam Club" && !["rv_park", "campground", "resort"].includes(category)) continue;

    // Passport America only at participating campgrounds
    if (discount.program === "Passport America" && !["rv_park", "campground"].includes(category)) continue;

    // Length of stay discounts
    if (discount.program === "Weekly Stay" && nights < 7) continue;
    if (discount.program === "Monthly Stay" && nights < 28) continue;

    // Skip free sites
    if (pricePerNight <= 0) continue;

    // Boondocking/free camping doesn't get discounts
    if (["boondocking", "dispersed", "rest_area", "walmart"].includes(category)) continue;

    applicableDiscounts.push(discount);
  }

  // Find the best single discount
  let bestSingle = 0;
  let bestDiscount: Discount | null = null;
  for (const d of applicableDiscounts) {
    const savings = d.percentOff ? (pricePerNight * nights * d.percentOff) / 100 : (d.flatOff || 0) * nights;
    if (savings > bestSingle) {
      bestSingle = savings;
      bestDiscount = d;
    }
  }

  // Find stackable combos (membership + length_of_stay + seasonal)
  const bestCombo: Discount[] = [];
  let comboSavingsPercent = 0;

  // Pick best membership discount
  const membershipDiscounts = applicableDiscounts.filter(d => ["membership", "military", "age"].includes(d.type));
  const bestMembership = membershipDiscounts.sort((a, b) => (b.percentOff || 0) - (a.percentOff || 0))[0];
  if (bestMembership) {
    bestCombo.push(bestMembership);
    comboSavingsPercent += bestMembership.percentOff || 0;
  }

  // Add length of stay if applicable
  const losDiscount = applicableDiscounts.filter(d => d.type === "length_of_stay").sort((a, b) => (b.percentOff || 0) - (a.percentOff || 0))[0];
  if (losDiscount) {
    bestCombo.push(losDiscount);
    comboSavingsPercent += losDiscount.percentOff || 0;
  }

  // Cap at 50%
  comboSavingsPercent = Math.min(comboSavingsPercent, 50);
  const comboSavings = (pricePerNight * nights * comboSavingsPercent) / 100;
  const totalSavings = Math.max(bestSingle, comboSavings);

  return {
    originalPrice: pricePerNight * nights,
    discounts: applicableDiscounts,
    bestPrice: pricePerNight * nights - totalSavings,
    totalSavings,
    bestCombo: comboSavings > bestSingle ? bestCombo : bestDiscount ? [bestDiscount] : [],
  };
}
