/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */

export type ExitServiceType = "gas" | "food" | "rest_area" | "rv_dump" | "rv_repair" | "lodging" | "grocery" | "pharmacy" | "hospital";

export interface ExitService {
  name: string;
  type: ExitServiceType;
  brand?: string;
  hasRVParking?: boolean;
  hasDiesel?: boolean;
  hasShowers?: boolean;
  hasDumpStation?: boolean;
  open24Hours?: boolean;
}

export interface InterstateExit {
  id: string;
  interstate: string;
  exitNumber: number;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  services: ExitService[];
  rvFriendly: boolean;
  notes?: string;
}

export interface InterstateInfo {
  id: string;
  name: string;
  direction: string;
  states: string[];
  totalExits: number;
}

const SERVICE_ICON_MAP: Record<ExitServiceType, { icon: string; color: string }> = {
  gas: { icon: "local-gas-station", color: "#E65100" },
  food: { icon: "restaurant", color: "#1565C0" },
  rest_area: { icon: "weekend", color: "#2E7D32" },
  rv_dump: { icon: "water-drop", color: "#6A1B9A" },
  rv_repair: { icon: "build", color: "#D32F2F" },
  lodging: { icon: "hotel", color: "#00838F" },
  grocery: { icon: "shopping-cart", color: "#33691E" },
  pharmacy: { icon: "local-pharmacy", color: "#AD1457" },
  hospital: { icon: "local-hospital", color: "#B71C1C" },
};

export function getServiceIcon(type: ExitServiceType) {
  return SERVICE_ICON_MAP[type] || { icon: "place", color: "#666" };
}

// Major US Interstates with representative exits
export const INTERSTATES: InterstateInfo[] = [
  { id: "i10", name: "I-10", direction: "East-West", states: ["CA", "AZ", "NM", "TX", "LA", "MS", "AL", "FL"], totalExits: 880 },
  { id: "i15", name: "I-15", direction: "North-South", states: ["CA", "NV", "AZ", "UT", "ID", "MT"], totalExits: 400 },
  { id: "i20", name: "I-20", direction: "East-West", states: ["TX", "LA", "MS", "AL", "GA", "SC"], totalExits: 620 },
  { id: "i25", name: "I-25", direction: "North-South", states: ["NM", "CO", "WY"], totalExits: 300 },
  { id: "i35", name: "I-35", direction: "North-South", states: ["TX", "OK", "KS", "MO", "IA", "MN"], totalExits: 500 },
  { id: "i40", name: "I-40", direction: "East-West", states: ["CA", "AZ", "NM", "TX", "OK", "AR", "TN", "NC"], totalExits: 700 },
  { id: "i55", name: "I-55", direction: "North-South", states: ["LA", "MS", "TN", "AR", "MO", "IL"], totalExits: 350 },
  { id: "i65", name: "I-65", direction: "North-South", states: ["AL", "TN", "KY", "IN"], totalExits: 380 },
  { id: "i70", name: "I-70", direction: "East-West", states: ["UT", "CO", "KS", "MO", "IL", "IN", "OH", "WV", "PA", "MD"], totalExits: 600 },
  { id: "i75", name: "I-75", direction: "North-South", states: ["FL", "GA", "TN", "KY", "OH", "MI"], totalExits: 500 },
  { id: "i80", name: "I-80", direction: "East-West", states: ["CA", "NV", "UT", "WY", "NE", "IA", "IL", "IN", "OH", "PA", "NJ"], totalExits: 700 },
  { id: "i81", name: "I-81", direction: "North-South", states: ["TN", "VA", "WV", "MD", "PA", "NY"], totalExits: 350 },
  { id: "i90", name: "I-90", direction: "East-West", states: ["WA", "ID", "MT", "WY", "SD", "MN", "WI", "IL", "IN", "OH", "PA", "NY", "MA"], totalExits: 800 },
  { id: "i95", name: "I-95", direction: "North-South", states: ["FL", "GA", "SC", "NC", "VA", "DC", "MD", "DE", "PA", "NJ", "NY", "CT", "RI", "MA", "NH", "ME"], totalExits: 900 },
];

// Generate realistic exit data for major interstates
function generateExits(interstate: string, stateData: { state: string; exits: { num: number; name: string; city: string; lat: number; lng: number; services: ExitService[]; rvFriendly: boolean; notes?: string }[] }[]): InterstateExit[] {
  const result: InterstateExit[] = [];
  for (const sd of stateData) {
    for (const ex of sd.exits) {
      result.push({
        id: `${interstate}_${sd.state}_${ex.num}`,
        interstate,
        exitNumber: ex.num,
        name: ex.name,
        city: ex.city,
        state: sd.state,
        latitude: ex.lat,
        longitude: ex.lng,
        services: ex.services,
        rvFriendly: ex.rvFriendly,
        notes: ex.notes,
      });
    }
  }
  return result;
}

// I-10 exits (major cross-country route)
const I10_EXITS = generateExits("I-10", [
  { state: "CA", exits: [
    { num: 1, name: "Dyer Rd / I-10 Begin", city: "Santa Monica", lat: 34.0195, lng: -118.4912, rvFriendly: false, services: [
      { name: "Chevron", type: "gas", brand: "Chevron", hasDiesel: true },
      { name: "In-N-Out Burger", type: "food", brand: "In-N-Out" },
    ]},
    { num: 77, name: "Indian Ave", city: "Palm Springs", lat: 33.8303, lng: -116.5453, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true, hasRVParking: true },
      { name: "Denny's", type: "food", brand: "Denny's", open24Hours: true },
      { name: "Walmart Supercenter", type: "grocery", brand: "Walmart", hasRVParking: true },
    ]},
    { num: 145, name: "Auto Center Dr", city: "Indio", lat: 33.7206, lng: -116.2156, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, hasDumpStation: true, open24Hours: true },
      { name: "McDonald's", type: "food", brand: "McDonald's" },
    ]},
  ]},
  { state: "AZ", exits: [
    { num: 1, name: "Ehrenberg", city: "Ehrenberg", lat: 33.6042, lng: -114.5253, rvFriendly: true, services: [
      { name: "Flying J", type: "gas", brand: "Flying J", hasDiesel: true, hasShowers: true, hasRVParking: true, hasDumpStation: true, open24Hours: true },
      { name: "Arizona Rest Area", type: "rest_area" },
    ]},
    { num: 17, name: "Buckeye Rd", city: "Buckeye", lat: 33.3703, lng: -112.5838, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
      { name: "Camping World", type: "rv_repair", brand: "Camping World" },
    ]},
    { num: 162, name: "Broadway Rd", city: "Tempe", lat: 33.4061, lng: -111.9400, rvFriendly: false, services: [
      { name: "QT", type: "gas", brand: "QT", hasDiesel: true },
      { name: "Chili's", type: "food", brand: "Chili's" },
      { name: "CVS Pharmacy", type: "pharmacy", brand: "CVS" },
    ]},
    { num: 200, name: "Houghton Rd", city: "Tucson", lat: 32.1727, lng: -110.7314, rvFriendly: true, services: [
      { name: "Costco Gas", type: "gas", brand: "Costco", hasDiesel: true },
      { name: "Texas Roadhouse", type: "food" },
      { name: "Fry's Grocery", type: "grocery", brand: "Kroger" },
    ]},
    { num: 302, name: "Dragoon Rd", city: "Dragoon", lat: 32.0372, lng: -110.0508, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
    ], notes: "Near Cochise Stronghold campground" },
  ]},
  { state: "TX", exits: [
    { num: 0, name: "Anthony", city: "Anthony", lat: 31.9997, lng: -106.5994, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Texas Welcome Center", type: "rest_area" },
    ]},
    { num: 11, name: "Artcraft Rd", city: "El Paso", lat: 31.8956, lng: -106.4280, rvFriendly: true, services: [
      { name: "Buc-ee's", type: "gas", brand: "Buc-ee's", hasDiesel: true, hasRVParking: true, open24Hours: true },
      { name: "Whataburger", type: "food", brand: "Whataburger", open24Hours: true },
    ]},
    { num: 248, name: "TX-17 / Balmorhea", city: "Balmorhea", lat: 30.9830, lng: -103.7494, rvFriendly: true, services: [
      { name: "Chevron", type: "gas", brand: "Chevron", hasDiesel: true },
    ], notes: "Near Balmorhea State Park — famous spring-fed pool" },
    { num: 456, name: "US-87 / Comfort", city: "Comfort", lat: 29.9688, lng: -98.9050, rvFriendly: true, services: [
      { name: "Valero", type: "gas", brand: "Valero", hasDiesel: true },
      { name: "Comfort Rest Area", type: "rest_area" },
    ]},
    { num: 580, name: "TX-71 / Columbus", city: "Columbus", lat: 29.7066, lng: -96.5397, rvFriendly: true, services: [
      { name: "Buc-ee's", type: "gas", brand: "Buc-ee's", hasDiesel: true, hasRVParking: true, open24Hours: true },
      { name: "Schobel's Restaurant", type: "food" },
    ]},
    { num: 793, name: "TX-73 / Winnie", city: "Winnie", lat: 29.8205, lng: -94.3838, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, hasDumpStation: true, open24Hours: true },
      { name: "Al-T's Seafood", type: "food" },
    ]},
  ]},
  { state: "FL", exits: [
    { num: 1, name: "US-29 / Pensacola", city: "Pensacola", lat: 30.4213, lng: -87.2169, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Waffle House", type: "food", brand: "Waffle House", open24Hours: true },
    ]},
    { num: 70, name: "FL-85 / Crestview", city: "Crestview", lat: 30.7521, lng: -86.5705, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ]},
    { num: 199, name: "US-231 / Panama City", city: "Panama City", lat: 30.1588, lng: -85.6602, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Sonny's BBQ", type: "food" },
      { name: "Walmart Supercenter", type: "grocery", brand: "Walmart", hasRVParking: true },
    ]},
    { num: 296, name: "US-90 / Tallahassee", city: "Tallahassee", lat: 30.4383, lng: -84.2807, rvFriendly: true, services: [
      { name: "RaceTrac", type: "gas", brand: "RaceTrac", hasDiesel: true },
      { name: "Chick-fil-A", type: "food", brand: "Chick-fil-A" },
      { name: "Publix", type: "grocery", brand: "Publix" },
    ]},
    { num: 350, name: "US-90 / Live Oak", city: "Live Oak", lat: 30.2949, lng: -82.9843, rvFriendly: true, services: [
      { name: "Busy Bee", type: "gas", hasDiesel: true, hasRVParking: true },
      { name: "Suwannee River Rest Area", type: "rest_area" },
    ]},
    { num: 368, name: "I-75 Junction", city: "Lake City", lat: 30.1897, lng: -82.6393, rvFriendly: true, services: [
      { name: "Flying J", type: "gas", brand: "Flying J", hasDiesel: true, hasShowers: true, hasRVParking: true, hasDumpStation: true, open24Hours: true },
      { name: "Bob Evans", type: "food", brand: "Bob Evans" },
      { name: "Camping World", type: "rv_repair", brand: "Camping World" },
    ]},
  ]},
]);

// I-95 exits (East Coast corridor)
const I95_EXITS = generateExits("I-95", [
  { state: "FL", exits: [
    { num: 1, name: "US-1 / Key West", city: "Miami", lat: 25.7617, lng: -80.1918, rvFriendly: false, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Flanigan's", type: "food" },
    ]},
    { num: 131, name: "FL-528 / Beachline", city: "Cocoa", lat: 28.3922, lng: -80.7437, rvFriendly: true, services: [
      { name: "Buc-ee's", type: "gas", brand: "Buc-ee's", hasDiesel: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ]},
    { num: 329, name: "FL-206 / St. Augustine", city: "St. Augustine", lat: 29.8954, lng: -81.3124, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Waffle House", type: "food", brand: "Waffle House", open24Hours: true },
    ], notes: "Near St. Augustine — oldest city in the US" },
    { num: 373, name: "I-295 / Jacksonville", city: "Jacksonville", lat: 30.3322, lng: -81.6557, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, hasDumpStation: true, open24Hours: true },
      { name: "Texas Roadhouse", type: "food" },
      { name: "Walmart Supercenter", type: "grocery", brand: "Walmart", hasRVParking: true },
    ]},
  ]},
  { state: "GA", exits: [
    { num: 1, name: "GA-40 / Kingsland", city: "Kingsland", lat: 30.7999, lng: -81.6898, rvFriendly: true, services: [
      { name: "Flying J", type: "gas", brand: "Flying J", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Wendy's", type: "food", brand: "Wendy's" },
    ], notes: "Near Cumberland Island National Seashore" },
    { num: 58, name: "US-82 / Waycross", city: "Jesup", lat: 31.6074, lng: -81.8854, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ]},
    { num: 99, name: "US-80 / Savannah", city: "Savannah", lat: 32.0809, lng: -81.0912, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Paula Deen's Family Kitchen", type: "food" },
      { name: "Kroger", type: "grocery", brand: "Kroger" },
    ]},
  ]},
  { state: "SC", exits: [
    { num: 5, name: "US-17 / Hardeeville", city: "Hardeeville", lat: 32.2813, lng: -81.0812, rvFriendly: true, services: [
      { name: "Buc-ee's", type: "gas", brand: "Buc-ee's", hasDiesel: true, hasRVParking: true, open24Hours: true },
      { name: "SC Welcome Center", type: "rest_area" },
    ]},
    { num: 141, name: "I-26 / Charleston", city: "Summerville", lat: 33.0185, lng: -80.1756, rvFriendly: true, services: [
      { name: "QT", type: "gas", brand: "QT", hasDiesel: true },
      { name: "Chick-fil-A", type: "food", brand: "Chick-fil-A" },
    ]},
  ]},
  { state: "NC", exits: [
    { num: 1, name: "NC-904 / Calabash", city: "Calabash", lat: 33.8910, lng: -78.5681, rvFriendly: true, services: [
      { name: "BP", type: "gas", brand: "BP", hasDiesel: true },
      { name: "Calabash Seafood", type: "food" },
    ]},
    { num: 95, name: "US-70 / Smithfield", city: "Smithfield", lat: 35.5085, lng: -78.3394, rvFriendly: true, services: [
      { name: "Sheetz", type: "gas", brand: "Sheetz", hasDiesel: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ]},
  ]},
  { state: "VA", exits: [
    { num: 104, name: "US-1 / Fredericksburg", city: "Fredericksburg", lat: 38.3032, lng: -77.4605, rvFriendly: true, services: [
      { name: "Wawa", type: "gas", brand: "Wawa", hasDiesel: true, open24Hours: true },
      { name: "Olive Garden", type: "food" },
      { name: "Walmart Supercenter", type: "grocery", brand: "Walmart", hasRVParking: true },
    ]},
    { num: 152, name: "VA-234 / Woodbridge", city: "Woodbridge", lat: 38.6581, lng: -77.2497, rvFriendly: false, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Bob Evans", type: "food", brand: "Bob Evans" },
    ]},
  ]},
]);

// I-40 exits (cross-country route through the South)
const I40_EXITS = generateExits("I-40", [
  { state: "CA", exits: [
    { num: 1, name: "I-15 / Barstow", city: "Barstow", lat: 34.8958, lng: -117.0173, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Del Taco", type: "food", brand: "Del Taco" },
      { name: "Barstow Station", type: "food" },
    ]},
  ]},
  { state: "AZ", exits: [
    { num: 48, name: "US-93 / Kingman", city: "Kingman", lat: 35.1894, lng: -114.0530, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ], notes: "Gateway to Route 66 and Grand Canyon West" },
    { num: 195, name: "I-17 / Flagstaff", city: "Flagstaff", lat: 35.1983, lng: -111.6513, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Galaxy Diner", type: "food" },
      { name: "Safeway", type: "grocery", brand: "Safeway" },
    ], notes: "Gateway to Grand Canyon National Park" },
  ]},
  { state: "NM", exits: [
    { num: 16, name: "NM-118 / Gallup", city: "Gallup", lat: 35.5281, lng: -108.7426, rvFriendly: true, services: [
      { name: "Flying J", type: "gas", brand: "Flying J", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Earl's Restaurant", type: "food" },
    ]},
    { num: 149, name: "Rio Grande Blvd / Albuquerque", city: "Albuquerque", lat: 35.0844, lng: -106.6504, rvFriendly: true, services: [
      { name: "Costco Gas", type: "gas", brand: "Costco", hasDiesel: true },
      { name: "Blake's Lotaburger", type: "food" },
      { name: "Smith's", type: "grocery", brand: "Kroger" },
    ]},
    { num: 277, name: "US-84 / Santa Rosa", city: "Santa Rosa", lat: 34.9384, lng: -104.6822, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Joseph's Bar & Grill", type: "food" },
    ], notes: "Blue Hole — famous Route 66 swimming hole" },
  ]},
  { state: "TX", exits: [
    { num: 0, name: "NM/TX State Line", city: "Glenrio", lat: 35.1822, lng: -103.0378, rvFriendly: true, services: [
      { name: "Texas Welcome Center", type: "rest_area" },
    ], notes: "Ghost town of Glenrio — Route 66 landmark" },
    { num: 75, name: "US-385 / Amarillo", city: "Amarillo", lat: 35.2220, lng: -101.8313, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Big Texan Steak Ranch", type: "food" },
      { name: "Walmart Supercenter", type: "grocery", brand: "Walmart", hasRVParking: true },
    ], notes: "Cadillac Ranch nearby — Route 66 icon" },
  ]},
  { state: "OK", exits: [
    { num: 127, name: "US-66 / Oklahoma City", city: "Oklahoma City", lat: 35.4676, lng: -97.5164, rvFriendly: true, services: [
      { name: "QT", type: "gas", brand: "QT", hasDiesel: true, open24Hours: true },
      { name: "Cattlemen's Steakhouse", type: "food" },
    ]},
  ]},
  { state: "TN", exits: [
    { num: 212, name: "US-441 / Knoxville", city: "Knoxville", lat: 35.9606, lng: -83.9207, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ], notes: "Gateway to Great Smoky Mountains National Park" },
    { num: 407, name: "TN-96 / Nashville", city: "Nashville", lat: 36.1627, lng: -86.7816, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Loveless Cafe", type: "food" },
    ]},
  ]},
  { state: "NC", exits: [
    { num: 53, name: "US-74A / Asheville", city: "Asheville", lat: 35.5951, lng: -82.5515, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "12 Bones Smokehouse", type: "food" },
      { name: "Ingles", type: "grocery", brand: "Ingles" },
    ], notes: "Blue Ridge Parkway access" },
  ]},
]);

// I-75 exits (North-South through the East)
const I75_EXITS = generateExits("I-75", [
  { state: "FL", exits: [
    { num: 1, name: "US-41 / Naples", city: "Naples", lat: 26.1420, lng: -81.7948, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ]},
    { num: 240, name: "FL-44 / Wildwood", city: "Wildwood", lat: 28.8652, lng: -82.0340, rvFriendly: true, services: [
      { name: "Buc-ee's", type: "gas", brand: "Buc-ee's", hasDiesel: true, hasRVParking: true, open24Hours: true },
      { name: "Wendy's", type: "food", brand: "Wendy's" },
    ], notes: "Near The Villages — largest retirement community" },
    { num: 435, name: "FL-2 / Lake City", city: "Lake City", lat: 30.1897, lng: -82.6393, rvFriendly: true, services: [
      { name: "Flying J", type: "gas", brand: "Flying J", hasDiesel: true, hasShowers: true, hasRVParking: true, hasDumpStation: true, open24Hours: true },
      { name: "Bob Evans", type: "food", brand: "Bob Evans" },
    ]},
  ]},
  { state: "GA", exits: [
    { num: 2, name: "GA-376 / Valdosta", city: "Valdosta", lat: 30.8327, lng: -83.2785, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Waffle House", type: "food", brand: "Waffle House", open24Hours: true },
    ]},
    { num: 235, name: "GA-155 / McDonough", city: "McDonough", lat: 33.4473, lng: -84.1469, rvFriendly: true, services: [
      { name: "QT", type: "gas", brand: "QT", hasDiesel: true },
      { name: "Chick-fil-A", type: "food", brand: "Chick-fil-A" },
      { name: "Kroger", type: "grocery", brand: "Kroger" },
    ]},
  ]},
  { state: "TN", exits: [
    { num: 1, name: "US-64 / Chattanooga", city: "Chattanooga", lat: 35.0456, lng: -85.3097, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ]},
  ]},
  { state: "KY", exits: [
    { num: 29, name: "US-25W / Corbin", city: "Corbin", lat: 36.9487, lng: -84.0966, rvFriendly: true, services: [
      { name: "Shell", type: "gas", brand: "Shell", hasDiesel: true },
      { name: "Harland Sanders Cafe", type: "food" },
    ], notes: "Original KFC restaurant — Colonel Sanders' first location" },
    { num: 175, name: "KY-922 / Lexington", city: "Lexington", lat: 38.0406, lng: -84.5037, rvFriendly: true, services: [
      { name: "Costco Gas", type: "gas", brand: "Costco", hasDiesel: true },
      { name: "Texas Roadhouse", type: "food" },
      { name: "Walmart Supercenter", type: "grocery", brand: "Walmart", hasRVParking: true },
    ]},
  ]},
  { state: "OH", exits: [
    { num: 1, name: "US-50 / Cincinnati", city: "Cincinnati", lat: 39.1031, lng: -84.5120, rvFriendly: true, services: [
      { name: "Pilot Travel Center", type: "gas", brand: "Pilot", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Skyline Chili", type: "food", brand: "Skyline" },
    ]},
    { num: 179, name: "US-30 / Lima", city: "Lima", lat: 40.7428, lng: -84.1052, rvFriendly: true, services: [
      { name: "Love's Travel Stop", type: "gas", brand: "Love's", hasDiesel: true, hasShowers: true, hasRVParking: true, open24Hours: true },
      { name: "Bob Evans", type: "food", brand: "Bob Evans" },
    ]},
  ]},
  { state: "MI", exits: [
    { num: 15, name: "US-223 / Monroe", city: "Monroe", lat: 41.9164, lng: -83.3977, rvFriendly: true, services: [
      { name: "Buc-ee's", type: "gas", brand: "Buc-ee's", hasDiesel: true, hasRVParking: true, open24Hours: true },
      { name: "Cracker Barrel", type: "food", brand: "Cracker Barrel", hasRVParking: true },
    ]},
    { num: 279, name: "US-10 / Midland", city: "Midland", lat: 43.6156, lng: -84.2472, rvFriendly: true, services: [
      { name: "Meijer", type: "grocery", brand: "Meijer", hasDiesel: true, hasRVParking: true },
      { name: "Applebee's", type: "food", brand: "Applebee's" },
    ]},
  ]},
]);

// Combine all exits
export const ALL_EXITS: InterstateExit[] = [
  ...I10_EXITS,
  ...I95_EXITS,
  ...I40_EXITS,
  ...I75_EXITS,
];

/**
 * Get exits for a specific interstate
 */
export function getExitsForInterstate(interstateId: string): InterstateExit[] {
  const name = INTERSTATES.find(i => i.id === interstateId)?.name;
  if (!name) return [];
  return ALL_EXITS.filter(e => e.interstate === name).sort((a, b) => a.exitNumber - b.exitNumber);
}

/**
 * Search exits by name, city, or service
 */
export function searchExits(query: string): InterstateExit[] {
  const q = query.toLowerCase();
  return ALL_EXITS.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.city.toLowerCase().includes(q) ||
    e.interstate.toLowerCase().includes(q) ||
    e.services.some(s => s.name.toLowerCase().includes(q) || (s.brand && s.brand.toLowerCase().includes(q)))
  );
}

/**
 * Find exits near a GPS coordinate
 */
export function findNearbyExits(lat: number, lng: number, radiusMiles: number = 25): (InterstateExit & { distanceMiles: number })[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  return ALL_EXITS.map(e => {
    const dLat = toRad(e.latitude - lat);
    const dLon = toRad(e.longitude - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(e.latitude)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 3959 * c;
    return { ...e, distanceMiles: Math.round(dist * 10) / 10 };
  })
  .filter(e => e.distanceMiles <= radiusMiles)
  .sort((a, b) => a.distanceMiles - b.distanceMiles);
}
