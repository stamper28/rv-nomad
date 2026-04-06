/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
export type CampgroundCategory =
  | "rv_park"
  | "national_park"
  | "state_park"
  | "free_camping"
  | "rest_area";

export interface Campground {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: CampgroundCategory;
  rating: number;
  reviewCount: number;
  pricePerNight: number | null; // null = free
  amenities: string[];
  description: string;
  phone?: string;
  website?: string;
}

export const CATEGORY_LABELS: Record<CampgroundCategory, string> = {
  rv_park: "RV Park",
  national_park: "National Park",
  state_park: "State Park",
  free_camping: "Free Camping",
  rest_area: "Rest Area",
};

export const CATEGORY_COLORS: Record<CampgroundCategory, string> = {
  rv_park: "#1565C0",
  national_park: "#2E7D32",
  state_park: "#558B2F",
  free_camping: "#E65100",
  rest_area: "#6A1B9A",
};

/**
 * Sample campground data across the US for demonstration.
 * In a production app, this would come from an API.
 */
export const CAMPGROUNDS: Campground[] = [
  // Southwest
  {
    id: "1",
    name: "Desert View RV Resort",
    latitude: 33.4484,
    longitude: -112.074,
    category: "rv_park",
    rating: 4.5,
    reviewCount: 234,
    pricePerNight: 45,
    amenities: ["Full Hookups", "WiFi", "Pool", "Laundry", "Showers"],
    description:
      "Modern RV resort in the heart of Phoenix with full amenities and stunning desert views.",
  },
  {
    id: "2",
    name: "Grand Canyon Mather Campground",
    latitude: 36.0544,
    longitude: -112.1401,
    category: "national_park",
    rating: 4.8,
    reviewCount: 1892,
    pricePerNight: 18,
    amenities: ["Restrooms", "Water", "Dump Station", "Campfire Ring"],
    description:
      "Located on the South Rim of the Grand Canyon, steps from the rim trail.",
  },
  {
    id: "3",
    name: "Sedona Red Rock State Park",
    latitude: 34.8697,
    longitude: -111.7609,
    category: "state_park",
    rating: 4.7,
    reviewCount: 567,
    pricePerNight: 30,
    amenities: ["Restrooms", "Water", "Hiking Trails", "Visitor Center"],
    description:
      "Scenic state park surrounded by Sedona's famous red rock formations.",
  },
  {
    id: "4",
    name: "BLM Quartzsite",
    latitude: 33.6639,
    longitude: -114.23,
    category: "free_camping",
    rating: 3.8,
    reviewCount: 445,
    pricePerNight: null,
    amenities: ["None"],
    description:
      "Popular free boondocking area in the Arizona desert. Bring your own water and supplies.",
  },
  // California
  {
    id: "5",
    name: "Yosemite Upper Pines",
    latitude: 37.7349,
    longitude: -119.5658,
    category: "national_park",
    rating: 4.6,
    reviewCount: 2103,
    pricePerNight: 26,
    amenities: ["Restrooms", "Water", "Bear Lockers", "Campfire Ring"],
    description:
      "Classic Yosemite Valley campground near Half Dome and Yosemite Falls.",
  },
  {
    id: "6",
    name: "Pismo Coast Village RV Resort",
    latitude: 35.1428,
    longitude: -120.6413,
    category: "rv_park",
    rating: 4.4,
    reviewCount: 678,
    pricePerNight: 65,
    amenities: [
      "Full Hookups",
      "WiFi",
      "Pool",
      "Laundry",
      "Beach Access",
      "Store",
    ],
    description:
      "Beachfront RV resort on the central California coast with ocean views.",
  },
  {
    id: "7",
    name: "Joshua Tree BLM",
    latitude: 34.0259,
    longitude: -116.2346,
    category: "free_camping",
    rating: 4.0,
    reviewCount: 312,
    pricePerNight: null,
    amenities: ["None"],
    description:
      "Free dispersed camping near Joshua Tree National Park. Dark sky area.",
  },
  // Mountain West
  {
    id: "8",
    name: "Yellowstone Madison Campground",
    latitude: 44.6466,
    longitude: -110.8598,
    category: "national_park",
    rating: 4.7,
    reviewCount: 1567,
    pricePerNight: 27,
    amenities: ["Restrooms", "Water", "Dump Station", "Campfire Ring"],
    description:
      "Central Yellowstone location near Old Faithful and the Madison River.",
  },
  {
    id: "9",
    name: "Moab Valley RV Resort",
    latitude: 38.5733,
    longitude: -109.5498,
    category: "rv_park",
    rating: 4.3,
    reviewCount: 445,
    pricePerNight: 55,
    amenities: ["Full Hookups", "WiFi", "Pool", "Showers", "Laundry"],
    description:
      "Gateway to Arches and Canyonlands National Parks with mountain views.",
  },
  {
    id: "10",
    name: "Glacier National Park Fish Creek",
    latitude: 48.5137,
    longitude: -114.0103,
    category: "national_park",
    rating: 4.9,
    reviewCount: 890,
    pricePerNight: 23,
    amenities: ["Restrooms", "Water", "Bear Lockers", "Campfire Ring"],
    description:
      "Lakeside campground on the west side of Glacier National Park.",
  },
  // Southeast
  {
    id: "11",
    name: "Disney's Fort Wilderness Resort",
    latitude: 28.4082,
    longitude: -81.5639,
    category: "rv_park",
    rating: 4.6,
    reviewCount: 3456,
    pricePerNight: 95,
    amenities: [
      "Full Hookups",
      "WiFi",
      "Pool",
      "Store",
      "Restaurant",
      "Activities",
    ],
    description:
      "Premium RV resort at Walt Disney World with exclusive park access.",
  },
  {
    id: "12",
    name: "Great Smoky Mountains Elkmont",
    latitude: 35.6532,
    longitude: -83.5804,
    category: "national_park",
    rating: 4.5,
    reviewCount: 1234,
    pricePerNight: 25,
    amenities: ["Restrooms", "Water", "Campfire Ring", "Hiking Trails"],
    description:
      "Riverside campground in the most visited national park in America.",
  },
  // Texas
  {
    id: "13",
    name: "South Padre Island KOA",
    latitude: 26.1118,
    longitude: -97.1681,
    category: "rv_park",
    rating: 4.2,
    reviewCount: 567,
    pricePerNight: 50,
    amenities: [
      "Full Hookups",
      "WiFi",
      "Pool",
      "Beach Access",
      "Laundry",
    ],
    description:
      "Tropical RV park on South Padre Island with beach and bay access.",
  },
  {
    id: "14",
    name: "Big Bend National Park Chisos Basin",
    latitude: 29.2708,
    longitude: -103.3005,
    category: "national_park",
    rating: 4.8,
    reviewCount: 678,
    pricePerNight: 15,
    amenities: ["Restrooms", "Water", "Campfire Ring", "Hiking Trails"],
    description:
      "Mountain campground in the Chisos Basin with spectacular desert views.",
  },
  // Rest Areas
  {
    id: "15",
    name: "I-10 Rest Area - Deming NM",
    latitude: 32.2687,
    longitude: -107.7586,
    category: "rest_area",
    rating: 3.2,
    reviewCount: 89,
    pricePerNight: null,
    amenities: ["Restrooms", "Picnic Tables", "Pet Area"],
    description:
      "Clean rest area along I-10 in New Mexico. Overnight parking allowed.",
  },
  {
    id: "16",
    name: "I-40 Rest Area - Amarillo TX",
    latitude: 35.222,
    longitude: -101.8313,
    category: "rest_area",
    rating: 3.5,
    reviewCount: 123,
    pricePerNight: null,
    amenities: ["Restrooms", "Vending", "Picnic Tables"],
    description:
      "Texas rest area along I-40 near Amarillo. Good overnight stop.",
  },
  // Pacific Northwest
  {
    id: "17",
    name: "Olympic National Park Kalaloch",
    latitude: 47.6131,
    longitude: -124.3741,
    category: "national_park",
    rating: 4.7,
    reviewCount: 567,
    pricePerNight: 22,
    amenities: ["Restrooms", "Water", "Beach Access", "Campfire Ring"],
    description:
      "Oceanfront campground on the wild Pacific coast of Washington.",
  },
  {
    id: "18",
    name: "Thousand Trails Pacific City",
    latitude: 45.2178,
    longitude: -123.9631,
    category: "rv_park",
    rating: 4.1,
    reviewCount: 345,
    pricePerNight: 40,
    amenities: ["Full Hookups", "WiFi", "Pool", "Playground", "Laundry"],
    description:
      "Oregon coast RV resort near Cape Kiwanda and Pacific City beach.",
  },
  // Northeast
  {
    id: "19",
    name: "Acadia National Park Blackwoods",
    latitude: 44.3106,
    longitude: -68.2117,
    category: "national_park",
    rating: 4.6,
    reviewCount: 890,
    pricePerNight: 30,
    amenities: ["Restrooms", "Water", "Campfire Ring", "Hiking Trails"],
    description:
      "Wooded campground on Mount Desert Island near Bar Harbor, Maine.",
  },
  {
    id: "20",
    name: "Herkimer Diamond KOA",
    latitude: 43.0148,
    longitude: -74.9923,
    category: "rv_park",
    rating: 4.3,
    reviewCount: 234,
    pricePerNight: 55,
    amenities: [
      "Full Hookups",
      "WiFi",
      "Pool",
      "Mining",
      "Store",
      "Playground",
    ],
    description:
      "Unique RV park in upstate New York where you can mine for Herkimer diamonds.",
  },
];
