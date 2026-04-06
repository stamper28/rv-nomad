/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

export type RestaurantCategory = "fast_food" | "casual_dining" | "bbq" | "seafood" | "mexican" | "pizza" | "diner" | "steakhouse" | "breakfast" | "ice_cream" | "coffee" | "buffet";

export interface NearbyRestaurant {
  id: string;
  name: string;
  category: RestaurantCategory;
  brand?: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  priceRange: "$" | "$$" | "$$$";
  rvParking: boolean;
  familyFriendly: boolean;
  open24Hours?: boolean;
  distanceMiles: number;
  directionsUrl: string;
}

const CATEGORY_INFO: Record<RestaurantCategory, { icon: string; color: string; label: string }> = {
  fast_food: { icon: "fastfood", color: "#E65100", label: "Fast Food" },
  casual_dining: { icon: "restaurant", color: "#1565C0", label: "Casual Dining" },
  bbq: { icon: "outdoor-grill", color: "#BF360C", label: "BBQ" },
  seafood: { icon: "set-meal", color: "#00838F", label: "Seafood" },
  mexican: { icon: "restaurant", color: "#F57F17", label: "Mexican" },
  pizza: { icon: "local-pizza", color: "#D32F2F", label: "Pizza" },
  diner: { icon: "restaurant", color: "#5D4037", label: "Diner" },
  steakhouse: { icon: "restaurant", color: "#880E4F", label: "Steakhouse" },
  breakfast: { icon: "free-breakfast", color: "#FF8F00", label: "Breakfast" },
  ice_cream: { icon: "icecream", color: "#E91E63", label: "Ice Cream" },
  coffee: { icon: "local-cafe", color: "#4E342E", label: "Coffee" },
  buffet: { icon: "restaurant", color: "#2E7D32", label: "Buffet" },
};

export function getRestaurantCategoryInfo(cat: RestaurantCategory) {
  return CATEGORY_INFO[cat] || { icon: "restaurant", color: "#666", label: "Restaurant" };
}

// Chain restaurant database with typical locations across the US
// These are dynamically placed near campground coordinates
interface RestaurantTemplate {
  name: string;
  brand: string;
  category: RestaurantCategory;
  priceRange: "$" | "$$" | "$$$";
  rvParking: boolean;
  familyFriendly: boolean;
  open24Hours?: boolean;
  // Approximate density: how many per 10,000 sq miles
  density: number;
}

const RESTAURANT_TEMPLATES: RestaurantTemplate[] = [
  // Fast Food
  { name: "McDonald's", brand: "McDonald's", category: "fast_food", priceRange: "$", rvParking: false, familyFriendly: true, open24Hours: true, density: 80 },
  { name: "Wendy's", brand: "Wendy's", category: "fast_food", priceRange: "$", rvParking: false, familyFriendly: true, density: 50 },
  { name: "Chick-fil-A", brand: "Chick-fil-A", category: "fast_food", priceRange: "$", rvParking: false, familyFriendly: true, density: 40 },
  { name: "Whataburger", brand: "Whataburger", category: "fast_food", priceRange: "$", rvParking: true, familyFriendly: true, open24Hours: true, density: 20 },
  { name: "Sonic Drive-In", brand: "Sonic", category: "fast_food", priceRange: "$", rvParking: true, familyFriendly: true, density: 30 },
  { name: "Taco Bell", brand: "Taco Bell", category: "fast_food", priceRange: "$", rvParking: false, familyFriendly: true, density: 60 },
  // Casual Dining
  { name: "Cracker Barrel", brand: "Cracker Barrel", category: "casual_dining", priceRange: "$$", rvParking: true, familyFriendly: true, density: 15 },
  { name: "Applebee's", brand: "Applebee's", category: "casual_dining", priceRange: "$$", rvParking: true, familyFriendly: true, density: 25 },
  { name: "Olive Garden", brand: "Olive Garden", category: "casual_dining", priceRange: "$$", rvParking: true, familyFriendly: true, density: 20 },
  { name: "Texas Roadhouse", brand: "Texas Roadhouse", category: "steakhouse", priceRange: "$$", rvParking: true, familyFriendly: true, density: 15 },
  { name: "Golden Corral", brand: "Golden Corral", category: "buffet", priceRange: "$$", rvParking: true, familyFriendly: true, density: 10 },
  // BBQ
  { name: "Dickey's Barbecue Pit", brand: "Dickey's", category: "bbq", priceRange: "$$", rvParking: true, familyFriendly: true, density: 10 },
  { name: "Famous Dave's", brand: "Famous Dave's", category: "bbq", priceRange: "$$", rvParking: true, familyFriendly: true, density: 5 },
  // Pizza
  { name: "Pizza Hut", brand: "Pizza Hut", category: "pizza", priceRange: "$", rvParking: false, familyFriendly: true, density: 40 },
  { name: "Domino's Pizza", brand: "Domino's", category: "pizza", priceRange: "$", rvParking: false, familyFriendly: true, density: 50 },
  // Breakfast
  { name: "Waffle House", brand: "Waffle House", category: "breakfast", priceRange: "$", rvParking: true, familyFriendly: true, open24Hours: true, density: 25 },
  { name: "IHOP", brand: "IHOP", category: "breakfast", priceRange: "$$", rvParking: true, familyFriendly: true, density: 20 },
  { name: "Denny's", brand: "Denny's", category: "diner", priceRange: "$$", rvParking: true, familyFriendly: true, open24Hours: true, density: 20 },
  // Coffee
  { name: "Starbucks", brand: "Starbucks", category: "coffee", priceRange: "$$", rvParking: false, familyFriendly: true, density: 80 },
  { name: "Dunkin'", brand: "Dunkin'", category: "coffee", priceRange: "$", rvParking: false, familyFriendly: true, density: 50 },
  // Ice Cream
  { name: "Dairy Queen", brand: "Dairy Queen", category: "ice_cream", priceRange: "$", rvParking: true, familyFriendly: true, density: 25 },
  // Mexican
  { name: "Chipotle", brand: "Chipotle", category: "mexican", priceRange: "$$", rvParking: false, familyFriendly: true, density: 30 },
];

/**
 * Find nearby restaurants based on campground coordinates.
 * Uses deterministic placement based on coordinates to generate consistent results.
 */
export function findNearbyRestaurants(
  lat: number,
  lng: number,
  radiusMiles: number = 15,
  maxResults: number = 10
): NearbyRestaurant[] {
  const results: NearbyRestaurant[] = [];
  const toRad = (d: number) => (d * Math.PI) / 180;

  // Generate deterministic restaurant positions near the given coordinates
  for (const template of RESTAURANT_TEMPLATES) {
    // Use a hash of the template name + rounded coordinates for deterministic placement
    const hash = (template.name.length * 17 + Math.round(lat * 100) * 31 + Math.round(lng * 100) * 13) % 1000;
    const offsetLat = ((hash % 50) - 25) * 0.003; // ~0.2 mile increments
    const offsetLng = (((hash * 7) % 50) - 25) * 0.004;
    const rLat = lat + offsetLat;
    const rLng = lng + offsetLng;

    // Calculate distance
    const dLat = toRad(rLat - lat);
    const dLon = toRad(rLng - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(rLat)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(3959 * c * 10) / 10;

    if (dist <= radiusMiles) {
      // Probability of existing based on density (rural areas have fewer)
      const urbanFactor = Math.abs(lat) < 35 ? 1.2 : 0.8; // Southern US more dense
      const probability = Math.min(1, (template.density / 100) * urbanFactor);
      const exists = ((hash * 13 + template.name.charCodeAt(0)) % 100) / 100 < probability;

      if (exists) {
        const state = getStateFromCoords(lat, lng);
        results.push({
          id: `rest_${template.brand.replace(/\s/g, "_").toLowerCase()}_${Math.round(lat * 100)}_${Math.round(lng * 100)}`,
          name: template.name,
          category: template.category,
          brand: template.brand,
          city: getCityName(lat, lng),
          state,
          latitude: rLat,
          longitude: rLng,
          priceRange: template.priceRange,
          rvParking: template.rvParking,
          familyFriendly: template.familyFriendly,
          open24Hours: template.open24Hours,
          distanceMiles: dist,
          directionsUrl: `https://www.google.com/maps/search/${encodeURIComponent(template.name)}/@${rLat},${rLng},14z`,
        });
      }
    }
  }

  return results
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, maxResults);
}

// Simple state lookup from coordinates
function getStateFromCoords(lat: number, lng: number): string {
  if (lat > 48 && lng < -100) return "MT";
  if (lat > 46 && lng < -120) return "WA";
  if (lat > 42 && lng < -120) return "OR";
  if (lat > 36 && lng < -114) return "CA";
  if (lat > 31 && lng < -109) return "AZ";
  if (lat > 31 && lng < -103) return "NM";
  if (lat > 25 && lng < -93) return "TX";
  if (lat > 25 && lng < -80) return "FL";
  if (lat > 32 && lng < -82) return "GA";
  if (lat > 35 && lng < -80) return "NC";
  if (lat > 37 && lng < -77) return "VA";
  if (lat > 39 && lng < -75) return "NJ";
  if (lat > 40 && lng < -74) return "NY";
  if (lat > 37 && lng < -105) return "CO";
  if (lat > 40 && lng < -111) return "UT";
  return "US";
}

function getCityName(lat: number, lng: number): string {
  return "Nearby";
}
