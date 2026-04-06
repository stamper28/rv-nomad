/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

export type RouteCategory = "scenic" | "historic" | "coastal" | "mountain" | "desert" | "national_parks" | "food_wine";

export interface RouteStop {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "campground" | "attraction" | "town" | "viewpoint" | "trailhead";
  nightsRecommended?: number;
}

export interface ThemedRoute {
  id: string;
  name: string;
  tagline: string;
  category: RouteCategory;
  description: string;
  totalMiles: number;
  estimatedDays: number;
  difficulty: "easy" | "moderate" | "challenging";
  bestSeason: string;
  states: string[];
  highlights: string[];
  stops: RouteStop[];
  rvNotes: string;
  imageEmoji: string;
}

export const ROUTE_CATEGORIES: { id: RouteCategory; label: string; icon: string; color: string }[] = [
  { id: "scenic", label: "Scenic Byways", icon: "landscape", color: "#2E7D32" },
  { id: "historic", label: "Historic Routes", icon: "museum", color: "#5D4037" },
  { id: "coastal", label: "Coastal Drives", icon: "beach-access", color: "#0277BD" },
  { id: "mountain", label: "Mountain Routes", icon: "terrain", color: "#37474F" },
  { id: "desert", label: "Desert Adventures", icon: "wb-sunny", color: "#E65100" },
  { id: "national_parks", label: "National Park Tours", icon: "park", color: "#1B5E20" },
  { id: "food_wine", label: "Food & Wine Trails", icon: "restaurant", color: "#880E4F" },
];

export const THEMED_ROUTES: ThemedRoute[] = [
  // SCENIC BYWAYS
  {
    id: "pacific-coast-highway",
    name: "Pacific Coast Highway",
    tagline: "The ultimate West Coast road trip",
    category: "scenic",
    description: "Drive the legendary PCH from San Diego to Olympic National Park, hugging the Pacific coastline through some of America's most dramatic scenery. Towering redwoods, crashing waves, charming beach towns, and world-class wine country await.",
    totalMiles: 1650,
    estimatedDays: 14,
    difficulty: "moderate",
    bestSeason: "May–October",
    states: ["CA", "OR", "WA"],
    highlights: ["Big Sur", "Redwood National Park", "Cannon Beach", "Olympic National Park", "Hearst Castle", "Mendocino"],
    stops: [
      { name: "San Diego — Mission Bay", description: "Start your journey at this waterfront RV park with beach access", latitude: 32.7749, longitude: -117.2346, type: "campground", nightsRecommended: 2 },
      { name: "Dana Point Harbor", description: "Whale watching capital of the West Coast", latitude: 33.4603, longitude: -117.6984, type: "town" },
      { name: "Malibu — Leo Carrillo State Park", description: "Beachside camping with tide pools and sea caves", latitude: 34.0445, longitude: -118.9337, type: "campground", nightsRecommended: 2 },
      { name: "Santa Barbara", description: "The American Riviera — wine, food, and Spanish architecture", latitude: 34.4208, longitude: -119.6982, type: "town", nightsRecommended: 2 },
      { name: "Big Sur — Pfeiffer Big Sur State Park", description: "Iconic coastal cliffs and redwood groves", latitude: 36.2470, longitude: -121.7849, type: "campground", nightsRecommended: 2 },
      { name: "Monterey & Carmel", description: "World-famous aquarium and charming seaside village", latitude: 36.6002, longitude: -121.8947, type: "town" },
      { name: "San Francisco — Half Moon Bay", description: "Base camp for exploring the Golden Gate City", latitude: 37.4636, longitude: -122.4286, type: "campground", nightsRecommended: 2 },
      { name: "Mendocino", description: "Victorian village on dramatic headlands", latitude: 39.3077, longitude: -123.7995, type: "town" },
      { name: "Redwood National Park", description: "Walk among the tallest trees on Earth", latitude: 41.2132, longitude: -124.0046, type: "campground", nightsRecommended: 2 },
      { name: "Cannon Beach, OR", description: "Haystack Rock and miles of pristine beach", latitude: 45.8918, longitude: -123.9615, type: "town" },
      { name: "Olympic National Park", description: "Rainforest, mountains, and wild coastline in one park", latitude: 47.8021, longitude: -123.6044, type: "campground", nightsRecommended: 2 },
    ],
    rvNotes: "Big Sur has tight curves and length restrictions (max 35ft on some sections). Plan fuel stops — gas stations are sparse on the northern CA coast. Reserve campgrounds 6+ months ahead for summer.",
    imageEmoji: "🌊",
  },
  {
    id: "blue-ridge-parkway",
    name: "Blue Ridge Parkway",
    tagline: "America's favorite scenic drive",
    category: "scenic",
    description: "Cruise 469 miles along the spine of the Appalachian Mountains from Shenandoah to Great Smoky Mountains. Fall foliage here is legendary, with over 100 species of trees creating a kaleidoscope of color.",
    totalMiles: 469,
    estimatedDays: 7,
    difficulty: "easy",
    bestSeason: "September–October (peak foliage)",
    states: ["VA", "NC"],
    highlights: ["Shenandoah NP", "Peaks of Otter", "Mabry Mill", "Grandfather Mountain", "Mt. Mitchell", "Asheville"],
    stops: [
      { name: "Shenandoah National Park", description: "Start at the northern end with Skyline Drive", latitude: 38.2928, longitude: -78.6796, type: "campground", nightsRecommended: 2 },
      { name: "Peaks of Otter", description: "Mountain lake with stunning sunrise views", latitude: 37.4463, longitude: -79.6044, type: "campground", nightsRecommended: 1 },
      { name: "Mabry Mill", description: "Most photographed spot on the Parkway", latitude: 36.7503, longitude: -80.4043, type: "viewpoint" },
      { name: "Grandfather Mountain", description: "Mile-high swinging bridge and wildlife habitats", latitude: 36.0996, longitude: -81.8328, type: "attraction" },
      { name: "Mt. Mitchell State Park", description: "Highest peak east of the Mississippi (6,684 ft)", latitude: 35.7649, longitude: -82.2651, type: "viewpoint" },
      { name: "Asheville, NC", description: "Craft beer capital, Biltmore Estate, and vibrant arts scene", latitude: 35.5951, longitude: -82.5515, type: "town", nightsRecommended: 2 },
      { name: "Great Smoky Mountains NP", description: "America's most visited national park", latitude: 35.6118, longitude: -83.4895, type: "campground", nightsRecommended: 2 },
    ],
    rvNotes: "Speed limit is 45 mph max. Some tunnels have height restrictions (check clearances for rigs over 11ft). No gas stations on the Parkway itself — exit at towns. Campgrounds are first-come, first-served.",
    imageEmoji: "🍂",
  },
  // HISTORIC ROUTES
  {
    id: "route-66",
    name: "Route 66 — The Mother Road",
    tagline: "Get your kicks on Route 66",
    category: "historic",
    description: "Follow the legendary 2,400-mile path from Chicago to Santa Monica, passing through the heartland of America. Neon signs, vintage diners, quirky roadside attractions, and the spirit of the open road.",
    totalMiles: 2400,
    estimatedDays: 14,
    difficulty: "easy",
    bestSeason: "April–June, September–November",
    states: ["IL", "MO", "KS", "OK", "TX", "NM", "AZ", "CA"],
    highlights: ["Cadillac Ranch", "Petrified Forest", "Grand Canyon detour", "Wigwam Motel", "Santa Monica Pier"],
    stops: [
      { name: "Chicago — Grant Park", description: "Route 66 begins at the Art Institute", latitude: 41.8827, longitude: -87.6233, type: "town", nightsRecommended: 2 },
      { name: "Springfield, IL", description: "Abraham Lincoln's hometown", latitude: 39.7817, longitude: -89.6501, type: "town", nightsRecommended: 1 },
      { name: "St. Louis — Gateway Arch", description: "Iconic gateway to the West", latitude: 38.6247, longitude: -90.1848, type: "attraction" },
      { name: "Tulsa, OK", description: "Art Deco architecture and Route 66 museums", latitude: 36.1540, longitude: -95.9928, type: "town", nightsRecommended: 1 },
      { name: "Amarillo, TX — Cadillac Ranch", description: "10 Cadillacs buried nose-first in the Texas dirt", latitude: 35.1872, longitude: -101.9870, type: "attraction" },
      { name: "Santa Fe, NM", description: "Adobe architecture, art galleries, and green chile", latitude: 35.6870, longitude: -105.9378, type: "town", nightsRecommended: 2 },
      { name: "Petrified Forest National Park", description: "Ancient fossilized trees and painted desert", latitude: 34.9100, longitude: -109.8068, type: "campground", nightsRecommended: 1 },
      { name: "Flagstaff, AZ", description: "Gateway to Grand Canyon — detour highly recommended", latitude: 35.1983, longitude: -111.6513, type: "town", nightsRecommended: 2 },
      { name: "Oatman, AZ", description: "Wild burros roam the streets of this ghost town", latitude: 35.0264, longitude: -114.3822, type: "town" },
      { name: "Santa Monica Pier", description: "End of the trail — Route 66 terminus", latitude: 34.0094, longitude: -118.4973, type: "attraction" },
    ],
    rvNotes: "Much of original Route 66 is now I-40. Some original sections have narrow roads. Fuel up in every town in western NM and AZ — stations can be 100+ miles apart. Summer temps in the desert exceed 110°F.",
    imageEmoji: "🛣️",
  },
  // COASTAL
  {
    id: "florida-keys-trail",
    name: "Florida Keys Overseas Highway",
    tagline: "Island-hopping over turquoise waters",
    category: "coastal",
    description: "Drive 113 miles over 42 bridges connecting the Florida Keys, with the Atlantic on one side and the Gulf of Mexico on the other. End at Key West, America's southernmost point.",
    totalMiles: 160,
    estimatedDays: 5,
    difficulty: "easy",
    bestSeason: "November–April",
    states: ["FL"],
    highlights: ["Seven Mile Bridge", "Key West", "Bahia Honda State Park", "John Pennekamp Coral Reef", "Sunset at Mallory Square"],
    stops: [
      { name: "Key Largo — John Pennekamp State Park", description: "First undersea park in the US — snorkeling paradise", latitude: 25.1250, longitude: -80.3952, type: "campground", nightsRecommended: 2 },
      { name: "Islamorada", description: "Sport fishing capital of the world", latitude: 24.9243, longitude: -80.6276, type: "town" },
      { name: "Marathon — Seven Mile Bridge", description: "One of the longest bridges in the world", latitude: 24.7136, longitude: -81.0837, type: "viewpoint" },
      { name: "Bahia Honda State Park", description: "Best beach in the Keys with crystal-clear water", latitude: 24.6558, longitude: -81.2814, type: "campground", nightsRecommended: 2 },
      { name: "Key West", description: "Hemingway's home, Duval Street, and Mallory Square sunsets", latitude: 24.5551, longitude: -81.7800, type: "town", nightsRecommended: 2 },
    ],
    rvNotes: "Max RV length for some Keys campgrounds is 35ft. Bahia Honda books 11 months in advance. Key West has very limited RV parking — consider staying in Marathon and day-tripping. Watch for bridge wind gusts.",
    imageEmoji: "🌴",
  },
  // NATIONAL PARKS
  {
    id: "utah-mighty-five",
    name: "Utah's Mighty Five",
    tagline: "Five national parks, one epic road trip",
    category: "national_parks",
    description: "Visit all five of Utah's spectacular national parks in one grand loop: Zion, Bryce Canyon, Capitol Reef, Canyonlands, and Arches. Red rock canyons, natural bridges, and otherworldly landscapes.",
    totalMiles: 900,
    estimatedDays: 10,
    difficulty: "moderate",
    bestSeason: "March–May, September–November",
    states: ["UT"],
    highlights: ["Angels Landing", "The Narrows", "Thor's Hammer", "Delicate Arch", "Mesa Arch sunrise"],
    stops: [
      { name: "Zion National Park", description: "Towering sandstone cliffs and the Virgin River Narrows", latitude: 37.2982, longitude: -113.0263, type: "campground", nightsRecommended: 3 },
      { name: "Bryce Canyon National Park", description: "Thousands of red hoodoos in a natural amphitheater", latitude: 37.5930, longitude: -112.1871, type: "campground", nightsRecommended: 2 },
      { name: "Capitol Reef National Park", description: "The least-visited Mighty Five park — hidden gem", latitude: 38.2832, longitude: -111.2471, type: "campground", nightsRecommended: 2 },
      { name: "Moab — Canyonlands National Park", description: "Vast canyons carved by the Colorado and Green Rivers", latitude: 38.3269, longitude: -109.8783, type: "campground", nightsRecommended: 2 },
      { name: "Arches National Park", description: "Over 2,000 natural stone arches including Delicate Arch", latitude: 38.7331, longitude: -109.5925, type: "campground", nightsRecommended: 2 },
    ],
    rvNotes: "Zion Canyon requires shuttle (no private vehicles April–November). The Zion-Mt. Carmel tunnel has size restrictions for RVs over 11'4\" tall or 7'10\" wide — escort required ($15). Moab gets extremely crowded in spring. Book Watchman Campground in Zion 6 months ahead.",
    imageEmoji: "🏜️",
  },
  {
    id: "yellowstone-grand-teton-loop",
    name: "Yellowstone & Grand Teton Loop",
    tagline: "Geysers, grizzlies, and granite peaks",
    category: "national_parks",
    description: "Explore two of America's crown jewel parks in one trip. Watch Old Faithful erupt, spot grizzly bears in Lamar Valley, and gaze at the Teton Range reflected in Jenny Lake.",
    totalMiles: 400,
    estimatedDays: 8,
    difficulty: "moderate",
    bestSeason: "June–September",
    states: ["WY", "MT"],
    highlights: ["Old Faithful", "Grand Prismatic Spring", "Lamar Valley wildlife", "Jenny Lake", "Snake River"],
    stops: [
      { name: "Jackson, WY", description: "Western gateway town with elk antler arches", latitude: 43.4799, longitude: -110.7624, type: "town", nightsRecommended: 1 },
      { name: "Grand Teton NP — Jenny Lake", description: "Crystal-clear alpine lake beneath the Tetons", latitude: 43.7536, longitude: -110.7213, type: "campground", nightsRecommended: 2 },
      { name: "Yellowstone — Old Faithful", description: "The world's most famous geyser", latitude: 44.4605, longitude: -110.8281, type: "attraction" },
      { name: "Yellowstone — Canyon Village", description: "Grand Canyon of the Yellowstone and waterfalls", latitude: 44.7340, longitude: -110.4937, type: "campground", nightsRecommended: 2 },
      { name: "Lamar Valley", description: "The Serengeti of North America — wolves, bison, bears", latitude: 44.8968, longitude: -110.2185, type: "viewpoint" },
      { name: "Yellowstone — Madison Campground", description: "Central location near geysers and wildlife", latitude: 44.6460, longitude: -110.8590, type: "campground", nightsRecommended: 2 },
    ],
    rvNotes: "Yellowstone campgrounds book instantly when reservations open (6 months ahead). Some roads close until late May due to snow. RVs over 30ft may struggle with tight campground loops. Watch for bison on roads — they have right of way.",
    imageEmoji: "🦬",
  },
  // MOUNTAIN
  {
    id: "million-dollar-highway",
    name: "Million Dollar Highway",
    tagline: "Colorado's most thrilling mountain drive",
    category: "mountain",
    description: "Wind through the San Juan Mountains on one of America's most dramatic roads. Hairpin turns, 11,000-foot passes, abandoned mines, and Victorian mining towns make this an unforgettable adventure.",
    totalMiles: 236,
    estimatedDays: 5,
    difficulty: "challenging",
    bestSeason: "June–September",
    states: ["CO"],
    highlights: ["Red Mountain Pass", "Ouray hot springs", "Silverton narrow-gauge railroad", "Telluride", "Black Canyon of the Gunnison"],
    stops: [
      { name: "Durango", description: "Historic railroad town and gateway to Mesa Verde", latitude: 37.2753, longitude: -107.8801, type: "town", nightsRecommended: 2 },
      { name: "Silverton", description: "Authentic mining town at 9,318 ft elevation", latitude: 37.8119, longitude: -107.6645, type: "town", nightsRecommended: 1 },
      { name: "Red Mountain Pass", description: "11,018 ft — the most dramatic section of the highway", latitude: 37.8947, longitude: -107.7127, type: "viewpoint" },
      { name: "Ouray — Switzerland of America", description: "Hot springs, ice climbing, and box canyon", latitude: 38.0228, longitude: -107.6714, type: "campground", nightsRecommended: 2 },
      { name: "Telluride", description: "World-class ski town with free gondola rides in summer", latitude: 37.9375, longitude: -107.8123, type: "town" },
      { name: "Black Canyon of the Gunnison NP", description: "2,000-foot sheer cliffs — one of the steepest canyons in North America", latitude: 38.5754, longitude: -107.7416, type: "campground", nightsRecommended: 1 },
    ],
    rvNotes: "NOT recommended for RVs over 30ft or trailers. No guardrails on many sections with 1,000+ foot drops. Steep grades up to 8%. If towing, consider unhitching and driving the highway separately. Altitude sickness possible above 10,000 ft.",
    imageEmoji: "⛰️",
  },
  // DESERT
  {
    id: "southwest-grand-circle",
    name: "Southwest Grand Circle",
    tagline: "The greatest concentration of national parks on Earth",
    category: "desert",
    description: "Loop through the American Southwest visiting Grand Canyon, Monument Valley, Mesa Verde, and more. Ancient pueblos, vast canyons, and landscapes that look like another planet.",
    totalMiles: 1400,
    estimatedDays: 12,
    difficulty: "moderate",
    bestSeason: "March–May, September–November",
    states: ["AZ", "UT", "CO", "NM"],
    highlights: ["Grand Canyon", "Monument Valley", "Antelope Canyon", "Mesa Verde", "Horseshoe Bend"],
    stops: [
      { name: "Grand Canyon South Rim", description: "One of the Seven Natural Wonders of the World", latitude: 36.0544, longitude: -112.1401, type: "campground", nightsRecommended: 2 },
      { name: "Page, AZ — Horseshoe Bend", description: "Iconic Colorado River bend and Antelope Canyon", latitude: 36.8791, longitude: -111.5101, type: "town", nightsRecommended: 2 },
      { name: "Monument Valley", description: "Iconic Navajo Tribal Park with towering buttes", latitude: 36.9985, longitude: -110.0985, type: "campground", nightsRecommended: 1 },
      { name: "Mesa Verde National Park", description: "Ancient cliff dwellings of the Ancestral Puebloans", latitude: 37.1838, longitude: -108.4887, type: "campground", nightsRecommended: 2 },
      { name: "Canyon de Chelly", description: "Sacred Navajo canyon with 800-year-old ruins", latitude: 36.1342, longitude: -109.4694, type: "campground", nightsRecommended: 1 },
      { name: "Sedona, AZ", description: "Red rock vortexes and world-class hiking", latitude: 34.8697, longitude: -111.7610, type: "town", nightsRecommended: 2 },
    ],
    rvNotes: "Summer temps exceed 110°F at lower elevations — carry extra water and check AC. Monument Valley road is unpaved and rough. Grand Canyon Mather Campground books 6 months ahead. Navajo Nation observes daylight saving time (Arizona does not).",
    imageEmoji: "🌵",
  },
  // FOOD & WINE
  {
    id: "bbq-trail",
    name: "Great American BBQ Trail",
    tagline: "Smoke, sauce, and Southern hospitality",
    category: "food_wine",
    description: "Taste your way across America's BBQ belt, from Texas brisket to Carolina pulled pork. Each region has its own style, sauce, and fierce local pride.",
    totalMiles: 2200,
    estimatedDays: 12,
    difficulty: "easy",
    bestSeason: "Year-round",
    states: ["TX", "TN", "NC", "SC", "MO", "AL"],
    highlights: ["Franklin BBQ (Austin)", "Central BBQ (Memphis)", "Skylight Inn (NC)", "Rodney Scott's (SC)", "Joe's KC (Kansas City)"],
    stops: [
      { name: "Austin, TX — Franklin BBQ", description: "The line is worth it — America's most famous brisket", latitude: 30.2700, longitude: -97.7311, type: "town", nightsRecommended: 2 },
      { name: "Lockhart, TX — BBQ Capital of Texas", description: "Kreuz Market, Smitty's, and Black's — all legends", latitude: 29.8849, longitude: -97.6703, type: "town" },
      { name: "Memphis, TN — Beale Street", description: "Dry-rubbed ribs and live blues music", latitude: 35.1396, longitude: -90.0490, type: "town", nightsRecommended: 2 },
      { name: "Kansas City, MO — Joe's KC", description: "Burnt ends and sweet, thick KC-style sauce", latitude: 39.0997, longitude: -94.5786, type: "town", nightsRecommended: 2 },
      { name: "Ayden, NC — Skylight Inn", description: "Whole-hog Eastern NC BBQ since 1947", latitude: 35.4727, longitude: -77.4155, type: "town" },
      { name: "Charleston, SC — Rodney Scott's", description: "James Beard Award-winning whole-hog BBQ", latitude: 32.7765, longitude: -79.9311, type: "town", nightsRecommended: 2 },
    ],
    rvNotes: "Most BBQ joints are in small towns with ample street parking for RVs. Austin food truck lots are tight — park at your campground and Uber. Memphis and KC have good RV parks near downtown. Bring antacids.",
    imageEmoji: "🍖",
  },
];

/**
 * Get routes by category
 */
export function getRoutesByCategory(category: RouteCategory): ThemedRoute[] {
  return THEMED_ROUTES.filter(r => r.category === category);
}

/**
 * Search routes by name, state, or highlight
 */
export function searchRoutes(query: string): ThemedRoute[] {
  const q = query.toLowerCase();
  return THEMED_ROUTES.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.tagline.toLowerCase().includes(q) ||
    r.states.some(s => s.toLowerCase().includes(q)) ||
    r.highlights.some(h => h.toLowerCase().includes(q)) ||
    r.stops.some(s => s.name.toLowerCase().includes(q))
  );
}
