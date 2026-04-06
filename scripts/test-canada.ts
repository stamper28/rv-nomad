import { findNearbyFuelStations, findNearbySupplyStores, findNearbyRepairShops } from "../lib/nearby-services";

// Actual coordinates from Canadian campground entries in all-sites-data.ts
const testCoords = [
  { lat: 53.6076, lng: -113.4914, expected: "AB", label: "Edmonton AB" },
  { lat: 51.5044, lng: -112.7695, expected: "AB", label: "Drumheller AB" },
  { lat: 50.6103, lng: -120.3729, expected: "BC", label: "Kamloops BC" },
  { lat: 49.3394, lng: -123.0715, expected: "BC", label: "Vancouver BC" },
  { lat: 49.1286, lng: -123.9278, expected: "BC", label: "Nanaimo BC" },
  { lat: 49.6432, lng: -112.8812, expected: "AB", label: "Lethbridge AB" },
  { lat: 51.0374, lng: -114.0804, expected: "AB", label: "Calgary AB" },
  { lat: 51.1830, lng: -115.5872, expected: "AB", label: "Banff AB" },
];

console.log("=== Canadian Fuel Station Test ===\n");
testCoords.forEach(({ lat, lng, expected, label }) => {
  const stations = findNearbyFuelStations(lat, lng, 50, 3);
  const s = stations[0];
  const pass = s.state === expected && s.currency === "CAD";
  console.log(`${pass ? "PASS" : "FAIL"} ${label}: state=${s.state} brand=${s.brand} currency=${s.currency} (expected ${expected}/CAD)`);
});

console.log("\n=== Canadian Supply Store Test ===\n");
testCoords.slice(0, 3).forEach(({ lat, lng, expected, label }) => {
  const stores = findNearbySupplyStores(lat, lng, 50, 3);
  const s = stores[0];
  console.log(`${label}: state=${s.state} brand=${s.brand}`);
});

console.log("\n=== Canadian Repair Shop Test ===\n");
testCoords.slice(0, 3).forEach(({ lat, lng, expected, label }) => {
  const shops = findNearbyRepairShops(lat, lng, 75, 3);
  const s = shops[0];
  console.log(`${label}: state=${s.state} brand=${s.brand}`);
});
