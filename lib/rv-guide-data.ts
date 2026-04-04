import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Types ──
export type RVClass = "class_a" | "class_b" | "class_c" | "travel_trailer" | "fifth_wheel";

export interface RVModel {
  name: string;
  maker: string;
  year: string;
  rating: number;
  priceRange: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

export interface RVCategory {
  key: RVClass;
  label: string;
  icon: string;
  description: string;
  best: RVModel[];
  worst: RVModel[];
}

export interface RVGuidePayload {
  lastUpdated: string; // ISO date string
  version: string;
  categories: RVCategory[];
}

const GUIDE_CACHE_KEY = "rv_guide_cache";
const GUIDE_CACHE_TS_KEY = "rv_guide_cache_ts";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Remote fetch (when backend is connected) ──
const GUIDE_API_URL = "__RV_GUIDE_API_URL__"; // Replace with your actual API endpoint

export async function fetchRemoteGuide(): Promise<RVGuidePayload | null> {
  try {
    if (GUIDE_API_URL.startsWith("__")) return null; // Not configured yet
    const res = await fetch(GUIDE_API_URL);
    if (!res.ok) return null;
    const data = await res.json();
    // Cache it
    await AsyncStorage.setItem(GUIDE_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(GUIDE_CACHE_TS_KEY, Date.now().toString());
    return data as RVGuidePayload;
  } catch {
    return null;
  }
}

export async function getCachedGuide(): Promise<RVGuidePayload | null> {
  try {
    const cached = await AsyncStorage.getItem(GUIDE_CACHE_KEY);
    if (!cached) return null;
    const ts = await AsyncStorage.getItem(GUIDE_CACHE_TS_KEY);
    if (ts && Date.now() - parseInt(ts) > CACHE_TTL_MS) return null; // Expired
    return JSON.parse(cached) as RVGuidePayload;
  } catch {
    return null;
  }
}

export async function getGuideData(): Promise<RVGuidePayload> {
  // 1. Try remote
  const remote = await fetchRemoteGuide();
  if (remote) return remote;

  // 2. Try cache
  const cached = await getCachedGuide();
  if (cached) return cached;

  // 3. Fallback to bundled data
  return BUNDLED_GUIDE;
}

// ── Bundled fallback (always available offline) ──
export const BUNDLED_GUIDE: RVGuidePayload = {
  lastUpdated: "2026-04-03T00:00:00Z",
  version: "2026.04",
  categories: [
    {
      key: "class_a",
      label: "Class A",
      icon: "directions-bus",
      description: "Full-size motorhomes — the largest and most luxurious RVs on the road",
      best: [
        {
          name: "Tiffin Allegro Bus",
          maker: "Tiffin Motorhomes",
          year: "2024–2026",
          rating: 4.8,
          priceRange: "$350K–$550K",
          pros: ["Exceptional build quality", "Powerglide chassis (smooth ride)", "Lifetime warranty on structure", "Full-paint exterior standard"],
          cons: ["Premium price point", "43ft length limits campground options", "Fuel economy 6–8 MPG"],
          verdict: "The gold standard for diesel pushers. Tiffin's family-owned quality shows in every detail. Best resale value in class.",
        },
        {
          name: "Newmar Dutch Star",
          maker: "Newmar Corporation",
          year: "2024–2026",
          rating: 4.7,
          priceRange: "$400K–$600K",
          pros: ["Superior fit and finish", "Comfort Drive steering", "Massive storage bays", "Quiet ride"],
          cons: ["Very expensive", "Heavy — requires CDL in some states", "Long lead times for custom orders"],
          verdict: "If money is no object, the Dutch Star delivers unmatched luxury. The Comfort Drive system makes it drive like a car.",
        },
        {
          name: "Thor Aria",
          maker: "Thor Motor Coach",
          year: "2024–2026",
          rating: 4.3,
          priceRange: "$180K–$250K",
          pros: ["Affordable diesel pusher", "Cummins engine reliable", "Good floor plans", "Decent warranty"],
          cons: ["Interior quality below Tiffin/Newmar", "Some fit/finish issues reported", "Resale not as strong"],
          verdict: "Best value diesel Class A. Gets you into a diesel pusher at half the price of premium brands.",
        },
      ],
      worst: [
        {
          name: "Fleetwood Flair",
          maker: "Fleetwood RV",
          year: "2022–2025",
          rating: 2.4,
          priceRange: "$120K–$180K",
          pros: ["Low entry price", "Ford chassis widely serviced"],
          cons: ["Chronic water leak issues", "Delamination within 2–3 years", "Poor customer service", "Electrical problems common", "Cheap interior materials"],
          verdict: "Frequent warranty claims and water damage issues. Multiple class-action lawsuits. Avoid unless buying used at deep discount.",
        },
        {
          name: "Coachmen Mirada",
          maker: "Coachmen (Forest River)",
          year: "2022–2025",
          rating: 2.6,
          priceRange: "$130K–$200K",
          pros: ["Affordable", "Many floor plan options"],
          cons: ["Slide-out seal failures", "Roof leaks reported frequently", "Inconsistent build quality", "Warranty claims slow to process"],
          verdict: "Quality control is hit-or-miss. Some owners love theirs, but too many report major issues within the first year.",
        },
        {
          name: "Thor Palazzo",
          maker: "Thor Motor Coach",
          year: "2022–2024",
          rating: 2.5,
          priceRange: "$200K–$300K",
          pros: ["Diesel pusher at lower price", "Good floor plans"],
          cons: ["Persistent electrical issues", "HVAC failures", "Slide mechanisms break", "Poor after-sale support", "Paint quality issues"],
          verdict: "Too many mechanical and electrical issues for the price. Thor's quality control on this line has been disappointing.",
        },
      ],
    },
    {
      key: "class_b",
      label: "Class B",
      icon: "airport-shuttle",
      description: "Camper vans — compact, easy to drive, perfect for couples and solo travelers",
      best: [
        {
          name: "Winnebago Revel",
          maker: "Winnebago",
          year: "2024–2026",
          rating: 4.7,
          priceRange: "$180K–$220K",
          pros: ["4x4 Mercedes Sprinter base", "True off-grid capability", "Power lift bed system", "Excellent build quality", "Strong resale"],
          cons: ["Expensive for a van", "Small living space", "No bathroom in some layouts"],
          verdict: "The ultimate adventure van. Goes anywhere, built to last. Holds value better than almost any RV on the market.",
        },
        {
          name: "Pleasure-Way Plateau TS",
          maker: "Pleasure-Way",
          year: "2024–2026",
          rating: 4.6,
          priceRange: "$170K–$200K",
          pros: ["Canadian-built quality", "Permanent bed + bathroom", "Lithium battery standard", "Quiet AC system"],
          cons: ["Limited counter space", "No outdoor shower", "Wait times for orders"],
          verdict: "Best all-around Class B for full-timing. The permanent bed and real bathroom make daily living comfortable.",
        },
        {
          name: "Thor Sanctuary",
          maker: "Thor Motor Coach",
          year: "2025–2026",
          rating: 4.2,
          priceRange: "$130K–$160K",
          pros: ["More affordable entry point", "Good use of space", "Mercedes Sprinter base", "Pop-top option"],
          cons: ["Newer model, less track record", "Some early quality reports mixed"],
          verdict: "Solid budget-friendly Class B option. Good for those wanting to try van life without the $200K+ commitment.",
        },
      ],
      worst: [
        {
          name: "Coachmen Nova",
          maker: "Coachmen (Forest River)",
          year: "2022–2025",
          rating: 2.3,
          priceRange: "$140K–$170K",
          pros: ["Lower price than competitors"],
          cons: ["Electrical system failures", "Water intrusion issues", "Poor insulation", "Rattles and squeaks", "Warranty battles"],
          verdict: "Rushed to market to compete. Quality doesn't match the price. Multiple owners report needing major repairs in year one.",
        },
        {
          name: "Thor Sequence",
          maker: "Thor Motor Coach",
          year: "2022–2024",
          rating: 2.5,
          priceRange: "$110K–$150K",
          pros: ["Affordable", "RAM ProMaster base easy to service"],
          cons: ["ProMaster less reliable than Sprinter", "Cheap cabinetry", "Plumbing leaks common", "Poor ventilation"],
          verdict: "You get what you pay for. The low price comes with low quality. Better to buy a used premium van.",
        },
      ],
    },
    {
      key: "class_c",
      label: "Class C",
      icon: "rv-hookup",
      description: "Mid-size motorhomes — the sweet spot of space, driveability, and value",
      best: [
        {
          name: "Winnebago View / Navion",
          maker: "Winnebago",
          year: "2024–2026",
          rating: 4.7,
          priceRange: "$180K–$230K",
          pros: ["Mercedes Sprinter chassis", "Excellent fuel economy (15–18 MPG)", "Compact enough for any campground", "Superior build quality", "Strong resale"],
          cons: ["Smaller than most Class Cs", "Premium price", "Limited storage"],
          verdict: "Best-in-class for couples. The Sprinter chassis delivers car-like driving. Winnebago quality is consistently top-tier.",
        },
        {
          name: "Thor Four Winds / Chateau",
          maker: "Thor Motor Coach",
          year: "2024–2026",
          rating: 4.1,
          priceRange: "$100K–$160K",
          pros: ["Affordable entry point", "Many floor plans (22–32ft)", "Ford chassis widely serviced", "Good for families"],
          cons: ["Build quality inconsistent", "Ford V8 gets 8–10 MPG", "Some owners report minor issues"],
          verdict: "Best value Class C for families. Not luxury, but reliable and affordable. The most popular Class C for a reason.",
        },
        {
          name: "Jayco Melbourne",
          maker: "Jayco",
          year: "2024–2026",
          rating: 4.3,
          priceRange: "$160K–$210K",
          pros: ["Mercedes Sprinter base", "JRide handling system", "2-year warranty", "Good storage solutions"],
          cons: ["Mid-range pricing", "Some floor plans feel cramped", "Sprinter service can be pricey"],
          verdict: "Solid middle ground between budget and luxury. Jayco's warranty and dealer network are excellent.",
        },
      ],
      worst: [
        {
          name: "Coachmen Freelander",
          maker: "Coachmen (Forest River)",
          year: "2022–2025",
          rating: 2.4,
          priceRange: "$90K–$140K",
          pros: ["Very affordable", "Many dealers"],
          cons: ["Roof leaks within 1–2 years", "Delamination issues", "Slide-out problems", "Cheap materials throughout", "Electrical gremlins"],
          verdict: "The low price is tempting but the repair bills add up fast. Water damage is almost guaranteed within a few years.",
        },
        {
          name: "Forest River Sunseeker",
          maker: "Forest River",
          year: "2022–2025",
          rating: 2.5,
          priceRange: "$95K–$150K",
          pros: ["Budget friendly", "Good floor plan variety"],
          cons: ["Quality control lacking", "Plumbing failures", "Generator issues", "Poor insulation", "Warranty claims difficult"],
          verdict: "Forest River's volume-over-quality approach shows here. Too many units leave the factory with defects.",
        },
      ],
    },
    {
      key: "travel_trailer",
      label: "Travel Trailers",
      icon: "home",
      description: "Towable trailers — most popular and affordable RV type in America",
      best: [
        {
          name: "Airstream Basecamp / Flying Cloud",
          maker: "Airstream",
          year: "2024–2026",
          rating: 4.8,
          priceRange: "$45K–$120K",
          pros: ["Iconic aluminum construction", "Lasts 30+ years", "Best resale value of any RV", "No delamination ever", "Timeless design"],
          cons: ["Expensive for a trailer", "Curved walls limit interior space", "Heavy for their size"],
          verdict: "Buy once, cry once. An Airstream will outlast every other trailer and hold its value. The 30-year-old ones still sell for good money.",
        },
        {
          name: "Grand Design Imagine",
          maker: "Grand Design",
          year: "2024–2026",
          rating: 4.5,
          priceRange: "$35K–$55K",
          pros: ["Excellent build quality for the price", "Aluminum frame (no wood rot)", "Great customer service", "Many floor plans"],
          cons: ["Getting more expensive each year", "Some dealers mark up heavily", "A few early quality reports on newer models"],
          verdict: "Best value travel trailer on the market. Grand Design's quality and customer service set the standard.",
        },
        {
          name: "Lance Travel Trailers",
          maker: "Lance Campers",
          year: "2024–2026",
          rating: 4.4,
          priceRange: "$40K–$70K",
          pros: ["True 4-season capable", "Aluminum/composite construction", "Made in USA", "Excellent insulation"],
          cons: ["Heavier than competitors", "Limited floor plans", "Smaller dealer network"],
          verdict: "Built like a tank. If you camp in cold weather, Lance is hard to beat. The construction quality is noticeably above average.",
        },
      ],
      worst: [
        {
          name: "Keystone Hideout",
          maker: "Keystone (Thor)",
          year: "2022–2025",
          rating: 2.2,
          priceRange: "$20K–$35K",
          pros: ["Very cheap", "Widely available"],
          cons: ["Wood frame rots within 3–5 years", "Roof leaks extremely common", "Delamination guaranteed", "Cheap plumbing", "Thin walls", "Awful resale"],
          verdict: "The poster child for disposable RVs. Built to sell, not to last. Will likely need major repairs or be worthless in 5 years.",
        },
        {
          name: "Forest River Wildwood",
          maker: "Forest River",
          year: "2022–2025",
          rating: 2.3,
          priceRange: "$22K–$40K",
          pros: ["Affordable", "Many sizes available"],
          cons: ["Water damage within 2 years", "Slide seals fail", "Stapled construction", "Thin flooring", "Axle issues reported"],
          verdict: "Volume production with minimal quality control. Some units are fine, many are not. It's a gamble.",
        },
        {
          name: "Coachmen Catalina",
          maker: "Coachmen (Forest River)",
          year: "2022–2025",
          rating: 2.4,
          priceRange: "$25K–$45K",
          pros: ["Mid-range pricing", "Good layouts"],
          cons: ["Roof leaks", "Delamination", "Electrical issues", "Cheap fixtures break easily", "Poor weatherproofing"],
          verdict: "Another Forest River brand with the same quality issues. The Catalina name has declined significantly in recent years.",
        },
      ],
    },
    {
      key: "fifth_wheel",
      label: "Fifth Wheels",
      icon: "local-shipping",
      description: "Premium towables — spacious, stable towing, ideal for full-timers",
      best: [
        {
          name: "Grand Design Solitude",
          maker: "Grand Design",
          year: "2024–2026",
          rating: 4.7,
          priceRange: "$70K–$110K",
          pros: ["Full-timer favorite", "Residential features", "Excellent build quality", "Great warranty", "Huge living space"],
          cons: ["Very heavy (requires 3/4 or 1-ton truck)", "Large footprint", "Expensive to maintain"],
          verdict: "The king of full-time fifth wheels. Residential feel with RV mobility. Grand Design's quality shines brightest here.",
        },
        {
          name: "Alliance Paradigm",
          maker: "Alliance RV",
          year: "2024–2026",
          rating: 4.6,
          priceRange: "$65K–$95K",
          pros: ["Founded by Grand Design alumni", "Innovative floor plans", "Quality construction", "Azdel composite walls"],
          cons: ["Newer company (less track record)", "Smaller dealer network", "Some growing pains"],
          verdict: "The exciting newcomer. Built by people who left Grand Design to do even better. Quality is exceptional for the price.",
        },
        {
          name: "Keystone Montana",
          maker: "Keystone (Thor)",
          year: "2024–2026",
          rating: 4.1,
          priceRange: "$55K–$85K",
          pros: ["Long track record", "Many floor plans", "Good dealer network", "Reasonable pricing"],
          cons: ["Quality has declined in recent years", "Some water intrusion reports", "Heavier than needed"],
          verdict: "A solid choice if you inspect carefully before buying. The Montana name still carries weight, but check every seal.",
        },
      ],
      worst: [
        {
          name: "Forest River Sierra",
          maker: "Forest River",
          year: "2022–2025",
          rating: 2.4,
          priceRange: "$45K–$75K",
          pros: ["Competitive pricing", "Good layouts"],
          cons: ["Frame flex issues", "Slide problems", "Water leaks", "Cheap underbelly", "Pin box issues"],
          verdict: "Too many structural issues for a fifth wheel. The frame flex can cause cascading problems throughout the unit.",
        },
        {
          name: "Heartland Bighorn",
          maker: "Heartland (Thor)",
          year: "2022–2025",
          rating: 2.5,
          priceRange: "$55K–$80K",
          pros: ["Spacious interiors", "Good features list"],
          cons: ["Electrical system failures", "Slide mechanisms break", "Customer service poor", "Warranty claims denied frequently"],
          verdict: "Looks great on paper but reliability doesn't match. Heartland's customer service makes problems worse.",
        },
      ],
    },
  ],
};
