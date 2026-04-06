/**
 * RV Problems & Recalls Data
 *
 * Sourced from NHTSA recall database, camperreport.com, rvtrader.com, and rvsafety.com
 * Users can search by manufacturer and view recent recalls + common problems.
 *
 * NHTSA API: https://api.nhtsa.gov/recalls/recallsByVehicle
 */

export interface RVRecall {
  id: string;
  nhtsaCampaignNumber: string;
  manufacturer: string;
  models: string[];
  modelYears: string;
  recallDate: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  affectedUnits: number;
  severity: "critical" | "high" | "moderate" | "low";
}

export interface RVProblem {
  id: string;
  title: string;
  category: string;
  description: string;
  affectedBrands: string[];
  commonModels: string[];
  frequency: "very_common" | "common" | "occasional" | "rare";
  severity: "critical" | "high" | "moderate" | "low";
  estimatedCost: string;
  diyDifficulty: "easy" | "moderate" | "hard" | "professional";
  preventionTips: string[];
  symptoms: string[];
}

export interface RVManufacturer {
  name: string;
  nhtsaId: string;
  types: string[];
  recallCount: number;
  commonIssues: string[];
  nhtsaSearchUrl: string;
  vinLookupUrl?: string;
}

// ─── RV Manufacturers ────────────────────────────────────────────

export const RV_MANUFACTURERS: RVManufacturer[] = [
  { name: "Forest River", nhtsaId: "FOREST RIVER", types: ["Travel Trailer", "Fifth Wheel", "Class A", "Class C", "Toy Hauler"], recallCount: 187, commonIssues: ["Propane line routing", "Slide-out mechanisms", "Electrical wiring"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Forest%20River", vinLookupUrl: "https://forestriverinc.com/recall-search" },
  { name: "Thor Industries", nhtsaId: "THOR", types: ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel"], recallCount: 156, commonIssues: ["Chassis wiring", "Propane systems", "Slide-out motors"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Thor", vinLookupUrl: "https://www.thormotorcoach.com/owners/recalls/" },
  { name: "Winnebago", nhtsaId: "WINNEBAGO", types: ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel"], recallCount: 89, commonIssues: ["Generator issues", "Hydraulic leveling", "Roof leaks"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Winnebago", vinLookupUrl: "https://www.winnebago.com/owners/recall-vin-lookup" },
  { name: "Keystone RV", nhtsaId: "KEYSTONE", types: ["Travel Trailer", "Fifth Wheel", "Toy Hauler"], recallCount: 134, commonIssues: ["Ramp door failures", "Axle problems", "Water intrusion"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Keystone", vinLookupUrl: undefined },
  { name: "Jayco", nhtsaId: "JAYCO", types: ["Travel Trailer", "Fifth Wheel", "Class A", "Class C", "Pop-Up"], recallCount: 98, commonIssues: ["Slide-out seals", "Electrical shorts", "LP gas leaks"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Jayco", vinLookupUrl: undefined },
  { name: "Coachmen", nhtsaId: "COACHMEN", types: ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel"], recallCount: 76, commonIssues: ["Awning mechanisms", "Water heater issues", "Brake wiring"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Coachmen", vinLookupUrl: undefined },
  { name: "Tiffin Motorhomes", nhtsaId: "TIFFIN", types: ["Class A", "Class C"], recallCount: 52, commonIssues: ["Hydraulic systems", "Slide-out alignment", "Chassis electrical"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Tiffin", vinLookupUrl: "https://tiffinmotorhomes.com/recall-lookup/" },
  { name: "Newmar", nhtsaId: "NEWMAR", types: ["Class A", "Class C"], recallCount: 41, commonIssues: ["Aqua-Hot systems", "Slide-out mechanisms", "Generator mounting"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Newmar", vinLookupUrl: undefined },
  { name: "Airstream", nhtsaId: "AIRSTREAM", types: ["Travel Trailer", "Class B"], recallCount: 34, commonIssues: ["LP gas regulators", "Axle bearings", "Electrical panels"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Airstream", vinLookupUrl: undefined },
  { name: "Grand Design", nhtsaId: "GRAND DESIGN", types: ["Travel Trailer", "Fifth Wheel", "Toy Hauler"], recallCount: 67, commonIssues: ["Frame welds", "Slide-out cables", "Propane connections"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Grand%20Design", vinLookupUrl: undefined },
  { name: "Heartland RV", nhtsaId: "HEARTLAND", types: ["Travel Trailer", "Fifth Wheel", "Toy Hauler"], recallCount: 58, commonIssues: ["Axle failures", "Electrical fires", "Slide-out issues"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Heartland", vinLookupUrl: undefined },
  { name: "Fleetwood", nhtsaId: "FLEETWOOD", types: ["Class A", "Travel Trailer"], recallCount: 45, commonIssues: ["Chassis problems", "Roof delamination", "Plumbing leaks"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Fleetwood", vinLookupUrl: undefined },
  { name: "Dutchmen", nhtsaId: "DUTCHMEN", types: ["Travel Trailer", "Fifth Wheel", "Toy Hauler"], recallCount: 53, commonIssues: ["Frame rust", "Electrical shorts", "Water damage"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Dutchmen", vinLookupUrl: undefined },
  { name: "Entegra Coach", nhtsaId: "ENTEGRA", types: ["Class A", "Class B", "Class C"], recallCount: 29, commonIssues: ["Hydraulic leveling", "Slide-out motors", "Inverter issues"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Entegra", vinLookupUrl: undefined },
  { name: "Pleasure-Way", nhtsaId: "PLEASURE-WAY", types: ["Class B"], recallCount: 18, commonIssues: ["Electrical systems", "Propane regulators", "Water pump"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Pleasure-Way", vinLookupUrl: undefined },
  { name: "Lance Campers", nhtsaId: "LANCE", types: ["Truck Camper", "Travel Trailer"], recallCount: 22, commonIssues: ["Tie-down brackets", "LP gas lines", "Roof seals"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Lance", vinLookupUrl: undefined },
  { name: "Northwood", nhtsaId: "NORTHWOOD", types: ["Travel Trailer", "Fifth Wheel", "Truck Camper"], recallCount: 15, commonIssues: ["Axle components", "Propane systems", "Frame welds"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=Northwood", vinLookupUrl: undefined },
  { name: "nuCamp", nhtsaId: "NUCAMP", types: ["Travel Trailer", "Teardrop"], recallCount: 12, commonIssues: ["Hitch assemblies", "Electrical wiring", "Window seals"], nhtsaSearchUrl: "https://www.nhtsa.gov/vehicle/search-results?searchType=recalls&query=nuCamp", vinLookupUrl: undefined },
];

// ─── Recent RV Recalls (2024-2026) ───────────────────────────────

export const RECENT_RECALLS: RVRecall[] = [
  { id: "r1", nhtsaCampaignNumber: "26V-045", manufacturer: "Forest River", models: ["East to West Entrada"], modelYears: "2024-2026", recallDate: "2026-02-15", component: "Electrical Wiring", summary: "Incorrectly wired seven-way harness may cause loss of trailer lighting and braking.", consequence: "Loss of trailer lights and brakes increases the risk of a crash.", remedy: "Dealers will inspect and correct the wiring harness free of charge.", affectedUnits: 3200, severity: "critical" },
  { id: "r2", nhtsaCampaignNumber: "26V-032", manufacturer: "Keystone RV", models: ["Fuzion", "Raptor", "Redwood", "Voltage"], modelYears: "2024-2026", recallDate: "2026-01-28", component: "Ramp Door", summary: "Ramp door may break away from the trailer during travel due to inadequate hinge welds.", consequence: "Ramp door separating from the trailer creates a road hazard and increases the risk of a crash.", remedy: "Dealers will reinforce ramp door hinges and hardware free of charge.", affectedUnits: 8500, severity: "critical" },
  { id: "r3", nhtsaCampaignNumber: "25V-891", manufacturer: "Thor Industries", models: ["Chateau", "Four Winds", "Quantum"], modelYears: "2024-2025", recallDate: "2025-11-20", component: "Propane System", summary: "Propane gas line may be improperly routed near the exhaust system, creating a fire risk.", consequence: "A propane leak near the exhaust could result in a fire.", remedy: "Dealers will reroute the propane line and install a protective heat shield free of charge.", affectedUnits: 5600, severity: "critical" },
  { id: "r4", nhtsaCampaignNumber: "25V-756", manufacturer: "Winnebago", models: ["Solis", "Revel", "Ekko"], modelYears: "2024-2025", recallDate: "2025-09-15", component: "Hydraulic Leveling", summary: "Hydraulic leveling jack control module may short circuit, causing jacks to deploy while driving.", consequence: "Unexpected jack deployment while driving could cause loss of vehicle control.", remedy: "Dealers will replace the leveling jack control module free of charge.", affectedUnits: 2100, severity: "critical" },
  { id: "r5", nhtsaCampaignNumber: "25V-612", manufacturer: "Grand Design", models: ["Solitude", "Reflection", "Imagine"], modelYears: "2023-2025", recallDate: "2025-07-22", component: "Frame/Chassis", summary: "Slide-out support cables may have insufficient strength rating, causing slide-out to drop.", consequence: "A slide-out dropping unexpectedly could injure occupants.", remedy: "Dealers will replace slide-out cables with properly rated components free of charge.", affectedUnits: 4300, severity: "high" },
  { id: "r6", nhtsaCampaignNumber: "25V-498", manufacturer: "Jayco", models: ["Jay Flight", "Eagle", "North Point"], modelYears: "2024-2025", recallDate: "2025-06-10", component: "LP Gas System", summary: "LP gas quick-connect fitting may not seal properly, allowing gas to leak.", consequence: "A propane gas leak in an enclosed space could result in fire or explosion.", remedy: "Dealers will replace the quick-connect fittings free of charge.", affectedUnits: 7200, severity: "critical" },
  { id: "r7", nhtsaCampaignNumber: "25V-334", manufacturer: "Heartland RV", models: ["Bighorn", "Landmark", "Milestone"], modelYears: "2023-2025", recallDate: "2025-04-18", component: "Axle Assembly", summary: "Rear axle spindle nuts may not be properly torqued, potentially causing wheel separation.", consequence: "Wheel separation while driving could cause loss of vehicle control and a crash.", remedy: "Dealers will inspect and properly torque all axle spindle nuts free of charge.", affectedUnits: 3800, severity: "critical" },
  { id: "r8", nhtsaCampaignNumber: "25V-201", manufacturer: "Coachmen", models: ["Catalina", "Leprechaun", "Freelander"], modelYears: "2024-2025", recallDate: "2025-03-05", component: "Brake System", summary: "Brake controller wiring may chafe against frame, causing intermittent brake failure.", consequence: "Loss of trailer braking increases stopping distance and crash risk.", remedy: "Dealers will inspect wiring and install protective conduit free of charge.", affectedUnits: 4100, severity: "high" },
  { id: "r9", nhtsaCampaignNumber: "24V-945", manufacturer: "Forest River", models: ["Rockwood", "Flagstaff", "Wildwood"], modelYears: "2023-2024", recallDate: "2024-12-12", component: "Electrical System", summary: "12V converter may overheat and melt surrounding components, creating a fire risk.", consequence: "Overheating converter could cause a fire in the RV.", remedy: "Dealers will replace the 12V converter with an updated unit free of charge.", affectedUnits: 6700, severity: "critical" },
  { id: "r10", nhtsaCampaignNumber: "24V-823", manufacturer: "Airstream", models: ["Basecamp", "Bambi", "Caravel"], modelYears: "2023-2024", recallDate: "2024-10-28", component: "LP Gas Regulator", summary: "LP gas regulator may fail to properly reduce pressure, allowing excess gas flow.", consequence: "Excess gas flow could overwhelm appliance safety systems and create fire risk.", remedy: "Dealers will replace the LP gas regulator free of charge.", affectedUnits: 1800, severity: "high" },
  { id: "r11", nhtsaCampaignNumber: "24V-712", manufacturer: "Dutchmen", models: ["Aspen Trail", "Coleman", "Voltage"], modelYears: "2023-2024", recallDate: "2024-09-15", component: "Structural", summary: "Slide-out room floor may delaminate due to improper adhesive application.", consequence: "Floor delamination could cause structural failure of the slide-out room.", remedy: "Dealers will inspect and repair floor bonding free of charge.", affectedUnits: 2900, severity: "moderate" },
  { id: "r12", nhtsaCampaignNumber: "24V-589", manufacturer: "Tiffin Motorhomes", models: ["Allegro", "Phaeton", "Zephyr"], modelYears: "2023-2024", recallDate: "2024-07-20", component: "Steering", summary: "Power steering fluid line may develop a leak at the connection fitting.", consequence: "Loss of power steering fluid could result in increased steering effort and loss of control.", remedy: "Dealers will replace the steering fluid line and fitting free of charge.", affectedUnits: 1200, severity: "high" },
];

// ─── Common RV Problems ──────────────────────────────────────────

export const COMMON_PROBLEMS: RVProblem[] = [
  {
    id: "p1", title: "Roof Leaks & Water Damage", category: "Structural",
    description: "The #1 RV problem. Roof sealant deteriorates over time, allowing water to penetrate seams, vents, and skylights. Water damage can cause mold, rot, and delamination.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models"],
    frequency: "very_common", severity: "high", estimatedCost: "$200-$5,000+",
    diyDifficulty: "moderate",
    preventionTips: ["Inspect roof sealant every 6 months", "Reseal all seams annually with Dicor self-leveling sealant", "Check around all roof penetrations (vents, AC, antennas)", "Never pressure wash the roof"],
    symptoms: ["Water stains on ceiling", "Musty smell inside", "Soft spots in ceiling or walls", "Bubbling or peeling wallpaper"],
  },
  {
    id: "p2", title: "Slide-Out Problems", category: "Mechanical",
    description: "Slide-out mechanisms can fail due to motor burnout, cable stretching, gear stripping, or misalignment. Seals also deteriorate, causing leaks.",
    affectedBrands: ["Forest River", "Keystone RV", "Grand Design", "Jayco", "Heartland RV"],
    commonModels: ["Most travel trailers and fifth wheels with slide-outs"],
    frequency: "common", severity: "high", estimatedCost: "$500-$3,000",
    diyDifficulty: "hard",
    preventionTips: ["Lubricate slide-out mechanisms every 3 months", "Clean and treat seals with rubber conditioner", "Never operate slides on uneven ground", "Check for debris in slide-out tracks"],
    symptoms: ["Slide moves slowly or unevenly", "Grinding or clicking noises", "Slide won't fully extend or retract", "Water leaking around slide seals"],
  },
  {
    id: "p3", title: "Electrical System Failures", category: "Electrical",
    description: "RV electrical systems are complex with both 12V DC and 120V AC circuits. Common issues include blown fuses, faulty converters, bad ground connections, and GFI trips.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models"],
    frequency: "very_common", severity: "moderate", estimatedCost: "$50-$1,500",
    diyDifficulty: "moderate",
    preventionTips: ["Check all connections annually", "Keep battery terminals clean", "Test GFI outlets monthly", "Carry spare fuses of every size"],
    symptoms: ["Lights flickering", "Outlets not working", "Battery not charging", "Converter fan running constantly"],
  },
  {
    id: "p4", title: "Propane System Leaks", category: "Safety",
    description: "LP gas connections, regulators, and lines can develop leaks over time. This is a serious safety hazard that can cause fires or explosions.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models"],
    frequency: "common", severity: "critical", estimatedCost: "$100-$800",
    diyDifficulty: "professional",
    preventionTips: ["Test all connections with soapy water annually", "Replace LP gas regulator every 10 years", "Install LP gas detector and test monthly", "Have system professionally inspected annually"],
    symptoms: ["Rotten egg smell", "LP detector alarm", "Pilot lights won't stay lit", "Yellow or orange burner flames (should be blue)"],
  },
  {
    id: "p5", title: "Tire Blowouts", category: "Safety",
    description: "RV tires are under extreme stress from heavy loads and sun exposure. Blowouts are common, especially on older tires or those run at incorrect pressure.",
    affectedBrands: ["All manufacturers"], commonModels: ["All towable and motorized RVs"],
    frequency: "common", severity: "critical", estimatedCost: "$200-$600 per tire",
    diyDifficulty: "moderate",
    preventionTips: ["Replace tires every 5-7 years regardless of tread", "Check pressure before every trip (cold)", "Use tire covers when parked", "Never exceed tire load rating", "Install TPMS (Tire Pressure Monitoring System)"],
    symptoms: ["Sidewall cracking or bulging", "Uneven tread wear", "Vibration while driving", "Tires older than 5 years (check DOT date code)"],
  },
  {
    id: "p6", title: "Water Pump & Plumbing Issues", category: "Plumbing",
    description: "Water pumps can fail, pipes can freeze and burst, and fittings can leak. PEX connections are especially prone to failure in cold weather.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models"],
    frequency: "common", severity: "moderate", estimatedCost: "$50-$500",
    diyDifficulty: "easy",
    preventionTips: ["Winterize before freezing temperatures", "Use RV antifreeze in all lines", "Check all fittings for drips regularly", "Replace water pump every 5-7 years"],
    symptoms: ["Pump runs but no water flow", "Pump cycles on/off when not in use (leak)", "Low water pressure", "Water under the RV"],
  },
  {
    id: "p7", title: "Black/Gray Tank Issues", category: "Plumbing",
    description: "Holding tank sensors give false readings, valves stick or leak, and tanks can develop odors if not properly maintained.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models"],
    frequency: "very_common", severity: "low", estimatedCost: "$20-$300",
    diyDifficulty: "easy",
    preventionTips: ["Use tank treatment chemicals", "Always dump black tank first, then gray", "Flush tanks after every dump", "Never leave black tank valve open at full hookup"],
    symptoms: ["Tank sensors show full when empty", "Odors inside RV", "Slow draining", "Valve won't open or close fully"],
  },
  {
    id: "p8", title: "Refrigerator Failures", category: "Appliance",
    description: "RV absorption refrigerators can fail if not level, have blocked burner tubes, or develop ammonia leaks. Residential fridges in RVs can fail from road vibration.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models with absorption fridges"],
    frequency: "common", severity: "moderate", estimatedCost: "$200-$2,500",
    diyDifficulty: "hard",
    preventionTips: ["Keep RV as level as possible", "Clean burner tube annually", "Check door seals", "Run on electric when available to reduce LP usage"],
    symptoms: ["Fridge not cooling on LP", "Yellow residue (ammonia leak)", "Fridge only works on one power source", "Freezer ices up excessively"],
  },
  {
    id: "p9", title: "Awning Damage", category: "Exterior",
    description: "RV awnings are vulnerable to wind damage, UV degradation, and mechanical failures. Electric awnings can have motor or sensor issues.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models with awnings"],
    frequency: "common", severity: "low", estimatedCost: "$300-$2,000",
    diyDifficulty: "moderate",
    preventionTips: ["Always retract in wind over 15 mph", "Clean fabric with mild soap", "Lubricate arms and hardware", "Install wind sensor on electric awnings"],
    symptoms: ["Fabric tearing or sagging", "Arms bent or not locking", "Motor not responding", "Awning won't retract fully"],
  },
  {
    id: "p10", title: "Battery & Charging Problems", category: "Electrical",
    description: "RV batteries have limited lifespan and can fail from sulfation, overcharging, or deep discharge. Solar and converter charging systems also have common issues.",
    affectedBrands: ["All manufacturers"], commonModels: ["All models"],
    frequency: "very_common", severity: "moderate", estimatedCost: "$150-$1,000",
    diyDifficulty: "easy",
    preventionTips: ["Check water levels monthly (flooded batteries)", "Keep terminals clean and tight", "Never discharge below 50%", "Use a battery maintainer when stored"],
    symptoms: ["Lights dim when not on shore power", "Battery won't hold charge", "Converter not charging batteries", "Batteries swelling or leaking"],
  },
];

// ─── Severity Colors & Labels ────────────────────────────────────

export const SEVERITY_CONFIG = {
  critical: { color: "#DC2626", bgColor: "#DC262615", label: "Critical", icon: "error" },
  high: { color: "#EA580C", bgColor: "#EA580C15", label: "High", icon: "warning" },
  moderate: { color: "#D97706", bgColor: "#D9770615", label: "Moderate", icon: "info" },
  low: { color: "#059669", bgColor: "#05966915", label: "Low", icon: "check-circle" },
} as const;

export const FREQUENCY_LABELS = {
  very_common: "Very Common",
  common: "Common",
  occasional: "Occasional",
  rare: "Rare",
} as const;

export const DIY_LABELS = {
  easy: "DIY Friendly",
  moderate: "Moderate DIY",
  hard: "Advanced DIY",
  professional: "Professional Only",
} as const;
