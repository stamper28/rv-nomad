/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Hiking trail data associated with campgrounds.
 * Each trail has difficulty, distance, elevation gain, and highlights.
 */

export type TrailDifficulty = "easy" | "moderate" | "hard" | "expert";

export interface HikingTrail {
  id: string;
  name: string;
  siteId: string;        // linked campground
  siteName: string;
  state: string;
  difficulty: TrailDifficulty;
  distanceMiles: number;  // round trip
  elevationGainFt: number;
  estimatedHours: number;
  description: string;
  highlights: string[];
  dogFriendly: boolean;
  wheelchairAccessible: boolean;
  scenicRating: number;   // 1-5
  trailType: "loop" | "out_and_back" | "point_to_point";
}

export const DIFFICULTY_COLORS: Record<TrailDifficulty, string> = {
  easy: "#4CAF50",
  moderate: "#FF9800",
  hard: "#F44336",
  expert: "#9C27B0",
};

export const DIFFICULTY_LABELS: Record<TrailDifficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  expert: "Expert",
};

// Real-world hiking trails near popular campgrounds
export const HIKING_TRAILS: HikingTrail[] = [
  // Yellowstone Area
  { id: "trail-1", name: "Old Faithful Geyser Basin Loop", siteId: "wy-1", siteName: "Yellowstone Bridge Bay", state: "WY", difficulty: "easy", distanceMiles: 1.5, elevationGainFt: 50, estimatedHours: 1, description: "Walk among the world's most famous geysers including Old Faithful, Grand Geyser, and Castle Geyser.", highlights: ["Old Faithful", "Grand Geyser", "Boardwalk views"], dogFriendly: false, wheelchairAccessible: true, scenicRating: 5, trailType: "loop" },
  { id: "trail-2", name: "Grand Prismatic Overlook Trail", siteId: "wy-1", siteName: "Yellowstone Bridge Bay", state: "WY", difficulty: "easy", distanceMiles: 1.6, elevationGainFt: 150, estimatedHours: 1, description: "Short climb to a stunning overlook of the largest hot spring in the US with rainbow-colored rings.", highlights: ["Grand Prismatic Spring", "Panoramic overlook", "Geothermal features"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-3", name: "Uncle Tom's Trail", siteId: "wy-1", siteName: "Yellowstone Bridge Bay", state: "WY", difficulty: "moderate", distanceMiles: 0.8, elevationGainFt: 500, estimatedHours: 1.5, description: "Steel staircase descent to the base of the Lower Falls of the Yellowstone River — 308 steps down.", highlights: ["Lower Falls", "Yellowstone Canyon", "Steel staircase"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },

  // Grand Canyon
  { id: "trail-4", name: "Bright Angel Trail", siteId: "az-2", siteName: "Grand Canyon Mather", state: "AZ", difficulty: "hard", distanceMiles: 12.2, elevationGainFt: 4380, estimatedHours: 8, description: "The most popular trail into the Grand Canyon, descending from the South Rim to the Colorado River.", highlights: ["Colorado River", "Indian Garden", "Phantom Ranch"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-5", name: "South Kaibab Trail to Ooh Aah Point", siteId: "az-2", siteName: "Grand Canyon Mather", state: "AZ", difficulty: "moderate", distanceMiles: 1.8, elevationGainFt: 740, estimatedHours: 2, description: "Short but rewarding hike to one of the best viewpoints in the Grand Canyon.", highlights: ["Ooh Aah Point", "Canyon panorama", "Sunrise views"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-6", name: "Rim Trail", siteId: "az-2", siteName: "Grand Canyon Mather", state: "AZ", difficulty: "easy", distanceMiles: 13.0, elevationGainFt: 200, estimatedHours: 5, description: "Paved path along the South Rim with multiple viewpoints. Walk as much or as little as you want.", highlights: ["Multiple viewpoints", "Paved path", "Shuttle access"], dogFriendly: true, wheelchairAccessible: true, scenicRating: 5, trailType: "point_to_point" },

  // Yosemite
  { id: "trail-7", name: "Mist Trail to Vernal Fall", siteId: "ca-3", siteName: "Yosemite Upper Pines", state: "CA", difficulty: "moderate", distanceMiles: 5.4, elevationGainFt: 1000, estimatedHours: 3, description: "Classic Yosemite hike past two stunning waterfalls with granite staircase and mist spray.", highlights: ["Vernal Fall", "Nevada Fall", "Granite steps"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-8", name: "Half Dome", siteId: "ca-3", siteName: "Yosemite Upper Pines", state: "CA", difficulty: "expert", distanceMiles: 16.0, elevationGainFt: 4800, estimatedHours: 12, description: "Iconic bucket-list hike with cable section to the summit of Half Dome. Permit required.", highlights: ["Half Dome summit", "Cable section", "Valley views"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-9", name: "Mirror Lake Loop", siteId: "ca-3", siteName: "Yosemite Upper Pines", state: "CA", difficulty: "easy", distanceMiles: 5.0, elevationGainFt: 100, estimatedHours: 2, description: "Flat loop around Mirror Lake with stunning reflections of Half Dome and North Dome.", highlights: ["Mirror Lake", "Half Dome reflection", "Flat terrain"], dogFriendly: true, wheelchairAccessible: true, scenicRating: 4, trailType: "loop" },

  // Zion
  { id: "trail-10", name: "Angels Landing", siteId: "ut-2", siteName: "Zion Watchman", state: "UT", difficulty: "hard", distanceMiles: 5.4, elevationGainFt: 1488, estimatedHours: 4, description: "Thrilling hike with chain-assisted final section along a narrow ridge. Permit required.", highlights: ["Chain section", "Canyon views", "Walter's Wiggles"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-11", name: "The Narrows", siteId: "ut-2", siteName: "Zion Watchman", state: "UT", difficulty: "hard", distanceMiles: 9.4, elevationGainFt: 334, estimatedHours: 6, description: "Wade through the Virgin River between 1,000-foot canyon walls. One of the world's best slot canyon hikes.", highlights: ["Slot canyon", "River wading", "Wall Street section"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-12", name: "Riverside Walk", siteId: "ut-2", siteName: "Zion Watchman", state: "UT", difficulty: "easy", distanceMiles: 2.2, elevationGainFt: 57, estimatedHours: 1, description: "Paved trail along the Virgin River to the start of The Narrows. Hanging gardens and wildlife.", highlights: ["Virgin River", "Hanging gardens", "Wheelchair accessible"], dogFriendly: false, wheelchairAccessible: true, scenicRating: 4, trailType: "out_and_back" },

  // Glacier
  { id: "trail-13", name: "Highline Trail", siteId: "mt-2", siteName: "Glacier Apgar", state: "MT", difficulty: "moderate", distanceMiles: 11.8, elevationGainFt: 1960, estimatedHours: 6, description: "Spectacular ridge walk along the Continental Divide with wildflower meadows and mountain goats.", highlights: ["Continental Divide", "Mountain goats", "Wildflowers"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "point_to_point" },
  { id: "trail-14", name: "Trail of the Cedars", siteId: "mt-2", siteName: "Glacier Apgar", state: "MT", difficulty: "easy", distanceMiles: 0.7, elevationGainFt: 30, estimatedHours: 0.5, description: "Boardwalk loop through ancient cedar-hemlock forest. Fully accessible.", highlights: ["Ancient cedars", "Boardwalk", "Avalanche Creek"], dogFriendly: false, wheelchairAccessible: true, scenicRating: 4, trailType: "loop" },

  // Great Smoky Mountains
  { id: "trail-15", name: "Alum Cave Trail", siteId: "tn-2", siteName: "Great Smoky Elkmont", state: "TN", difficulty: "hard", distanceMiles: 10.0, elevationGainFt: 2763, estimatedHours: 7, description: "Climb to the summit of Mt. LeConte past Arch Rock and Alum Cave Bluffs.", highlights: ["Alum Cave Bluffs", "Mt. LeConte", "Arch Rock"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-16", name: "Laurel Falls Trail", siteId: "tn-2", siteName: "Great Smoky Elkmont", state: "TN", difficulty: "easy", distanceMiles: 2.6, elevationGainFt: 400, estimatedHours: 1.5, description: "Paved trail to an 80-foot waterfall. One of the most popular hikes in the Smokies.", highlights: ["80-foot waterfall", "Paved trail", "Family friendly"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 4, trailType: "out_and_back" },

  // Acadia
  { id: "trail-17", name: "Precipice Trail", siteId: "me-1", siteName: "Acadia Blackwoods", state: "ME", difficulty: "expert", distanceMiles: 1.6, elevationGainFt: 1000, estimatedHours: 2, description: "Iron rung ladder climb up the face of Champlain Mountain. Not for those afraid of heights.", highlights: ["Iron rungs", "Cliff face", "Ocean views"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-18", name: "Jordan Pond Path", siteId: "me-1", siteName: "Acadia Blackwoods", state: "ME", difficulty: "easy", distanceMiles: 3.3, elevationGainFt: 100, estimatedHours: 1.5, description: "Flat loop around crystal-clear Jordan Pond with views of The Bubbles mountains.", highlights: ["Jordan Pond", "The Bubbles", "Popovers at Jordan Pond House"], dogFriendly: true, wheelchairAccessible: true, scenicRating: 4, trailType: "loop" },

  // Rocky Mountain
  { id: "trail-19", name: "Sky Pond Trail", siteId: "co-2", siteName: "Rocky Mountain Moraine Park", state: "CO", difficulty: "hard", distanceMiles: 9.0, elevationGainFt: 1740, estimatedHours: 6, description: "Pass through Alberta Falls, The Loch, and Timberline Falls to reach the alpine Sky Pond.", highlights: ["Sky Pond", "Alberta Falls", "The Loch"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },
  { id: "trail-20", name: "Bear Lake Trail", siteId: "co-2", siteName: "Rocky Mountain Moraine Park", state: "CO", difficulty: "easy", distanceMiles: 0.8, elevationGainFt: 20, estimatedHours: 0.5, description: "Short loop around Bear Lake with stunning mountain reflections. Great for all ages.", highlights: ["Bear Lake", "Mountain reflections", "Accessible"], dogFriendly: false, wheelchairAccessible: true, scenicRating: 4, trailType: "loop" },

  // Olympic
  { id: "trail-21", name: "Hoh Rain Forest Hall of Mosses", siteId: "wa-2", siteName: "Olympic Hoh Rainforest", state: "WA", difficulty: "easy", distanceMiles: 0.8, elevationGainFt: 50, estimatedHours: 0.5, description: "Walk through a magical moss-draped old-growth rainforest. One of the wettest places in the US.", highlights: ["Moss-draped trees", "Old growth forest", "Rainforest"], dogFriendly: false, wheelchairAccessible: true, scenicRating: 5, trailType: "loop" },

  // Arches
  { id: "trail-22", name: "Delicate Arch Trail", siteId: "ut-3", siteName: "Arches Devils Garden", state: "UT", difficulty: "moderate", distanceMiles: 3.0, elevationGainFt: 480, estimatedHours: 2.5, description: "Hike to Utah's most iconic natural arch, freestanding against the La Sal Mountains.", highlights: ["Delicate Arch", "Sunset views", "Slickrock"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },

  // Joshua Tree
  { id: "trail-23", name: "Ryan Mountain Trail", siteId: "ca-5", siteName: "Joshua Tree Jumbo Rocks", state: "CA", difficulty: "moderate", distanceMiles: 3.0, elevationGainFt: 1050, estimatedHours: 2, description: "Climb to 5,457 feet for 360-degree views of Joshua Tree's desert landscape.", highlights: ["360-degree views", "Desert panorama", "Sunrise/sunset"], dogFriendly: true, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },

  // Shenandoah
  { id: "trail-24", name: "Old Rag Mountain", siteId: "va-2", siteName: "Shenandoah Big Meadows", state: "VA", difficulty: "hard", distanceMiles: 9.2, elevationGainFt: 2510, estimatedHours: 7, description: "Virginia's most popular hike with a thrilling rock scramble section near the summit.", highlights: ["Rock scramble", "360-degree summit", "Blue Ridge views"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "loop" },

  // Big Bend
  { id: "trail-25", name: "Santa Elena Canyon Trail", siteId: "tx-3", siteName: "Big Bend Chisos Basin", state: "TX", difficulty: "easy", distanceMiles: 1.6, elevationGainFt: 80, estimatedHours: 1, description: "Walk into a dramatic 1,500-foot limestone canyon carved by the Rio Grande.", highlights: ["1,500-foot canyon walls", "Rio Grande", "Mexico border"], dogFriendly: true, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },

  // Denali
  { id: "trail-26", name: "Savage River Loop Trail", siteId: "ak-1", siteName: "Denali Riley Creek", state: "AK", difficulty: "easy", distanceMiles: 2.0, elevationGainFt: 100, estimatedHours: 1, description: "Easy loop along the Savage River with views of Denali on clear days. Wildlife spotting common.", highlights: ["Denali views", "Savage River", "Wildlife"], dogFriendly: true, wheelchairAccessible: true, scenicRating: 4, trailType: "loop" },

  // Bryce Canyon
  { id: "trail-27", name: "Navajo Loop / Queen's Garden Trail", siteId: "ut-4", siteName: "Bryce Canyon North", state: "UT", difficulty: "moderate", distanceMiles: 2.9, elevationGainFt: 550, estimatedHours: 2, description: "Descend among towering hoodoos through Wall Street slot canyon and Queen's Garden.", highlights: ["Hoodoos", "Wall Street", "Queen's Garden"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "loop" },

  // Sequoia
  { id: "trail-28", name: "General Sherman Tree Trail", siteId: "ca-6", siteName: "Sequoia Lodgepole", state: "CA", difficulty: "easy", distanceMiles: 1.0, elevationGainFt: 200, estimatedHours: 0.5, description: "Short walk to the largest tree on Earth by volume — the General Sherman Tree.", highlights: ["General Sherman Tree", "Giant sequoias", "Paved trail"], dogFriendly: false, wheelchairAccessible: true, scenicRating: 5, trailType: "out_and_back" },

  // Canyonlands
  { id: "trail-29", name: "Mesa Arch Trail", siteId: "ut-5", siteName: "Canyonlands Willow Flat", state: "UT", difficulty: "easy", distanceMiles: 0.7, elevationGainFt: 100, estimatedHours: 0.5, description: "Short hike to a cliff-edge arch that glows orange at sunrise. One of the most photographed arches.", highlights: ["Sunrise glow", "Cliff-edge arch", "La Sal Mountains"], dogFriendly: true, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },

  // North Cascades
  { id: "trail-30", name: "Blue Lake Trail", siteId: "wa-3", siteName: "North Cascades Newhalem", state: "WA", difficulty: "moderate", distanceMiles: 4.4, elevationGainFt: 1050, estimatedHours: 3, description: "Hike through wildflower meadows to a stunning turquoise alpine lake below Liberty Bell.", highlights: ["Turquoise lake", "Liberty Bell", "Wildflower meadows"], dogFriendly: true, wheelchairAccessible: false, scenicRating: 5, trailType: "out_and_back" },

  // Banff (Canada)
  { id: "trail-31", name: "Lake Louise Lakeshore Trail", siteId: "ab-1", siteName: "Lake Louise Campground", state: "AB", difficulty: "easy", distanceMiles: 2.4, elevationGainFt: 50, estimatedHours: 1, description: "Flat walk along the shore of the iconic turquoise Lake Louise to the Plain of Six Glaciers.", highlights: ["Lake Louise", "Victoria Glacier", "Turquoise water"], dogFriendly: true, wheelchairAccessible: true, scenicRating: 5, trailType: "out_and_back" },

  // Jasper (Canada)
  { id: "trail-32", name: "Valley of the Five Lakes", siteId: "ab-2", siteName: "Jasper Wapiti", state: "AB", difficulty: "easy", distanceMiles: 4.6, elevationGainFt: 200, estimatedHours: 2, description: "Loop through five jewel-colored lakes in the Canadian Rockies. Perfect family hike.", highlights: ["Five colored lakes", "Mountain views", "Easy terrain"], dogFriendly: true, wheelchairAccessible: false, scenicRating: 5, trailType: "loop" },

  // Pacific Rim (BC)
  { id: "trail-33", name: "Wild Pacific Trail", siteId: "bc-1", siteName: "Pacific Rim Green Point", state: "BC", difficulty: "easy", distanceMiles: 5.0, elevationGainFt: 150, estimatedHours: 2, description: "Coastal trail along rugged cliffs with old-growth forest, sea stacks, and whale watching.", highlights: ["Sea stacks", "Whale watching", "Old-growth forest"], dogFriendly: true, wheelchairAccessible: false, scenicRating: 5, trailType: "loop" },

  // Cape Breton (NS)
  { id: "trail-34", name: "Skyline Trail", siteId: "ns-1", siteName: "Cape Breton Cheticamp", state: "NS", difficulty: "moderate", distanceMiles: 5.8, elevationGainFt: 400, estimatedHours: 3, description: "Boardwalk and trail to dramatic headland cliffs overlooking the Gulf of St. Lawrence. Moose common.", highlights: ["Headland cliffs", "Moose sightings", "Sunset views"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "loop" },

  // Gros Morne (NL)
  { id: "trail-35", name: "Gros Morne Mountain Trail", siteId: "nl-1", siteName: "Gros Morne Berry Hill", state: "NL", difficulty: "hard", distanceMiles: 10.0, elevationGainFt: 2600, estimatedHours: 7, description: "Climb Newfoundland's second-highest peak through arctic tundra with fjord views.", highlights: ["Arctic tundra", "Fjord views", "UNESCO site"], dogFriendly: false, wheelchairAccessible: false, scenicRating: 5, trailType: "loop" },
];

/**
 * Get trails for a specific campground
 */
export function getTrailsForSite(siteId: string): HikingTrail[] {
  return HIKING_TRAILS.filter((t) => t.siteId === siteId);
}

/**
 * Get trails by state
 */
export function getTrailsByState(state: string): HikingTrail[] {
  return HIKING_TRAILS.filter((t) => t.state === state);
}

/**
 * Get trails by difficulty
 */
export function getTrailsByDifficulty(difficulty: TrailDifficulty): HikingTrail[] {
  return HIKING_TRAILS.filter((t) => t.difficulty === difficulty);
}
