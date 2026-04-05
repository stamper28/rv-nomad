// Trip Cost Calculator - estimates total trip cost including fuel, camping, food, and extras

export interface TripCostInput {
  distanceMiles: number;
  mpg: number;
  fuelPricePerGallon: number;
  nights: number;
  avgCampingCostPerNight: number;
  travelers: number;
  foodBudgetPerPersonPerDay: number;
  includeExtras?: boolean;
}

export interface TripCostBreakdown {
  fuel: number;
  camping: number;
  food: number;
  propane: number;
  laundry: number;
  entertainment: number;
  maintenance: number;
  tolls: number;
  total: number;
  perDay: number;
  perMile: number;
}

export function calculateTripCost(input: TripCostInput): TripCostBreakdown {
  const {
    distanceMiles,
    mpg,
    fuelPricePerGallon,
    nights,
    avgCampingCostPerNight,
    travelers,
    foodBudgetPerPersonPerDay,
    includeExtras = true,
  } = input;

  const days = nights + 1; // travel days = nights + 1

  // Fuel cost
  const gallonsNeeded = distanceMiles / Math.max(mpg, 1);
  const fuel = gallonsNeeded * fuelPricePerGallon;

  // Camping cost
  const camping = nights * avgCampingCostPerNight;

  // Food cost
  const food = days * travelers * foodBudgetPerPersonPerDay;

  // Extras (estimates based on typical RV travel)
  let propane = 0;
  let laundry = 0;
  let entertainment = 0;
  let maintenance = 0;
  let tolls = 0;

  if (includeExtras) {
    // Propane: ~$4/day for heating/cooking
    propane = days * 4;

    // Laundry: ~$8 per week
    laundry = Math.ceil(days / 7) * 8;

    // Entertainment: ~$15/person/day
    entertainment = days * travelers * 15;

    // Maintenance reserve: $0.10/mile
    maintenance = distanceMiles * 0.1;

    // Tolls: rough estimate $0.02/mile
    tolls = distanceMiles * 0.02;
  }

  const total = fuel + camping + food + propane + laundry + entertainment + maintenance + tolls;

  return {
    fuel: Math.round(fuel * 100) / 100,
    camping: Math.round(camping * 100) / 100,
    food: Math.round(food * 100) / 100,
    propane: Math.round(propane * 100) / 100,
    laundry: Math.round(laundry * 100) / 100,
    entertainment: Math.round(entertainment * 100) / 100,
    maintenance: Math.round(maintenance * 100) / 100,
    tolls: Math.round(tolls * 100) / 100,
    total: Math.round(total * 100) / 100,
    perDay: Math.round((total / Math.max(days, 1)) * 100) / 100,
    perMile: Math.round((total / Math.max(distanceMiles, 1)) * 100) / 100,
  };
}

// Common RV MPG values for quick selection
export const RV_MPG_PRESETS = [
  { label: "Class A (Gas)", mpg: 8 },
  { label: "Class A (Diesel)", mpg: 10 },
  { label: "Class B (Van)", mpg: 18 },
  { label: "Class C", mpg: 12 },
  { label: "Travel Trailer", mpg: 10 },
  { label: "5th Wheel", mpg: 9 },
  { label: "Pop-Up Camper", mpg: 14 },
  { label: "Truck Camper", mpg: 12 },
];

// Average fuel prices (updated periodically)
export const DEFAULT_FUEL_PRICES = {
  regular: 3.49,
  diesel: 3.89,
};

// Food budget presets per person per day
export const FOOD_BUDGET_PRESETS = [
  { label: "Budget (cook most meals)", amount: 15 },
  { label: "Moderate (mix of cooking & dining)", amount: 30 },
  { label: "Comfortable (eat out often)", amount: 50 },
  { label: "Premium (restaurants daily)", amount: 75 },
];
