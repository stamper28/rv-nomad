/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Cruise Ship Ports for RVers
 *
 * Major cruise ports from Florida to California where RVers can park
 * their RV and board a cruise ship. Includes RV parking options near
 * each port and booking links to cruise line websites.
 */

export interface CruiseLine {
  name: string;
  bookingUrl: string;
  logoColor: string;
  icon: string; // MaterialIcons name
}

export interface RVParkingOption {
  name: string;
  address: string;
  phone?: string;
  dailyRate: string;
  rvFriendly: boolean;
  hookups: boolean;
  security: "24hr" | "gated" | "monitored" | "basic";
  shuttle: boolean;
  notes: string;
  mapsUrl: string;
}

export interface CruisePort {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  region: "Florida" | "Gulf Coast" | "California" | "East Coast";
  description: string;
  address: string;
  phone: string;
  website: string;
  cruiseLines: CruiseLine[];
  rvParking: RVParkingOption[];
  tips: string[];
}

// ─── Cruise Line Definitions ─────────────────────────────────────

export const CRUISE_LINES: Record<string, CruiseLine> = {
  carnival: {
    name: "Carnival Cruise Line",
    bookingUrl: "https://www.carnival.com/cruise-search",
    logoColor: "#0054A6",
    icon: "directions-boat",
  },
  royal_caribbean: {
    name: "Royal Caribbean",
    bookingUrl: "https://www.royalcaribbean.com/cruises",
    logoColor: "#00205B",
    icon: "directions-boat",
  },
  norwegian: {
    name: "Norwegian Cruise Line",
    bookingUrl: "https://www.ncl.com/cruises",
    logoColor: "#003B71",
    icon: "directions-boat",
  },
  disney: {
    name: "Disney Cruise Line",
    bookingUrl: "https://disneycruise.disney.go.com/cruises-destinations/",
    logoColor: "#1A1A6C",
    icon: "directions-boat",
  },
  msc: {
    name: "MSC Cruises",
    bookingUrl: "https://www.msccruisesusa.com/cruise",
    logoColor: "#003DA5",
    icon: "directions-boat",
  },
  celebrity: {
    name: "Celebrity Cruises",
    bookingUrl: "https://www.celebritycruises.com/cruises",
    logoColor: "#1C1C1C",
    icon: "directions-boat",
  },
  princess: {
    name: "Princess Cruises",
    bookingUrl: "https://www.princess.com/cruise-search/",
    logoColor: "#003B5C",
    icon: "directions-boat",
  },
  holland_america: {
    name: "Holland America Line",
    bookingUrl: "https://www.hollandamerica.com/en/cruise-search",
    logoColor: "#003B71",
    icon: "directions-boat",
  },
  virgin: {
    name: "Virgin Voyages",
    bookingUrl: "https://www.virginvoyages.com/book/voyages",
    logoColor: "#E50914",
    icon: "directions-boat",
  },
};

// ─── Cruise Port Data ────────────────────────────────────────────

export const CRUISE_PORTS: CruisePort[] = [
  // ═══ FLORIDA ═══
  {
    id: "port-canaveral",
    name: "Port Canaveral",
    city: "Cape Canaveral",
    state: "FL",
    latitude: 28.4085,
    longitude: -80.6327,
    region: "Florida",
    description: "One of the busiest cruise ports in the world, located on Florida's Space Coast near Kennedy Space Center. Popular departure point for Bahamas, Caribbean, and transatlantic cruises.",
    address: "445 Challenger Rd, Cape Canaveral, FL 32920",
    phone: "(321) 783-7831",
    website: "https://www.portcanaveral.com",
    cruiseLines: [
      CRUISE_LINES.carnival,
      CRUISE_LINES.royal_caribbean,
      CRUISE_LINES.disney,
      CRUISE_LINES.norwegian,
      CRUISE_LINES.msc,
    ],
    rvParking: [
      {
        name: "Jetty Park Campground",
        address: "400 E Jetty Rd, Cape Canaveral, FL 32920",
        phone: "(321) 783-7111",
        dailyRate: "$43-55/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "Full hookup RV sites right at the port. Walk to cruise terminals. Book months in advance — extremely popular. Max 45ft.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jetty+Park+Campground+Cape+Canaveral",
      },
      {
        name: "Port Canaveral Cruise Parking",
        address: "99 George J King Blvd, Cape Canaveral, FL 32920",
        phone: "(321) 394-3278",
        dailyRate: "$17/day (car), $25/day (oversized)",
        rvFriendly: true,
        hookups: false,
        security: "24hr",
        shuttle: true,
        notes: "Official port parking with free shuttle to terminals. Oversized vehicle lot accommodates RVs. No hookups.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Port+Canaveral+Cruise+Parking",
      },
    ],
    tips: [
      "Jetty Park is the only RV campground within walking distance of cruise terminals — book 3-6 months ahead",
      "Port Canaveral is 45 min from Orlando theme parks — great for pre/post cruise stays",
      "Visit Kennedy Space Center while your RV is parked at Jetty Park",
    ],
  },
  {
    id: "port-miami",
    name: "PortMiami",
    city: "Miami",
    state: "FL",
    latitude: 25.7743,
    longitude: -80.1706,
    region: "Florida",
    description: "The Cruise Capital of the World. PortMiami is the busiest cruise port globally, serving over 7 million passengers annually. Gateway to the Caribbean, Bahamas, and beyond.",
    address: "1015 N America Way, Miami, FL 33132",
    phone: "(305) 347-4800",
    website: "https://www.portmiami.biz",
    cruiseLines: [
      CRUISE_LINES.carnival,
      CRUISE_LINES.royal_caribbean,
      CRUISE_LINES.norwegian,
      CRUISE_LINES.celebrity,
      CRUISE_LINES.msc,
      CRUISE_LINES.disney,
      CRUISE_LINES.virgin,
    ],
    rvParking: [
      {
        name: "Larry & Penny Thompson Park",
        address: "12451 SW 184th St, Miami, FL 33177",
        phone: "(305) 232-1049",
        dailyRate: "$38-45/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "County park with full hookup RV sites, 25 min from PortMiami. Secure gated entry. Take Uber/taxi to port on cruise day.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Larry+Penny+Thompson+Park+Miami",
      },
      {
        name: "Miami Everglades RV Resort",
        address: "20675 SW 162nd Ave, Miami, FL 33187",
        phone: "(305) 233-5300",
        dailyRate: "$55-75/night",
        rvFriendly: true,
        hookups: true,
        security: "24hr",
        shuttle: false,
        notes: "Full-service RV resort 30 min from port. Pool, clubhouse, laundry. Arrange taxi/Uber to cruise terminal.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Miami+Everglades+RV+Resort",
      },
    ],
    tips: [
      "No RV parking at the port itself — use nearby RV parks and take a taxi/Uber to the terminal",
      "Miami traffic can be heavy — allow 60-90 min to reach the port from RV parks",
      "Consider arriving a day early to avoid stress on embarkation day",
    ],
  },
  {
    id: "port-everglades",
    name: "Port Everglades",
    city: "Fort Lauderdale",
    state: "FL",
    latitude: 26.0893,
    longitude: -80.1179,
    region: "Florida",
    description: "Fort Lauderdale's major cruise port, the third busiest in the world. Departure point for Caribbean, Bahamas, Panama Canal, and transatlantic voyages.",
    address: "1850 Eller Dr, Fort Lauderdale, FL 33316",
    phone: "(954) 523-3404",
    website: "https://www.porteverglades.net",
    cruiseLines: [
      CRUISE_LINES.celebrity,
      CRUISE_LINES.holland_america,
      CRUISE_LINES.princess,
      CRUISE_LINES.royal_caribbean,
      CRUISE_LINES.carnival,
    ],
    rvParking: [
      {
        name: "Yacht Haven Park & Marina",
        address: "2323 State Rd 84, Fort Lauderdale, FL 33312",
        phone: "(954) 583-2322",
        dailyRate: "$50-65/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "RV park just 10 min from Port Everglades. Full hookups, laundry, WiFi. Easy Uber ride to cruise terminal.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Yacht+Haven+Park+Fort+Lauderdale",
      },
      {
        name: "Easterlin Park",
        address: "1000 NW 38th St, Oakland Park, FL 33309",
        phone: "(954) 938-0610",
        dailyRate: "$35-40/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "Broward County park with RV sites, 20 min from port. Water/electric hookups. Peaceful setting with nature trails.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Easterlin+Park+Oakland+Park+FL",
      },
    ],
    tips: [
      "Port Everglades is right next to Fort Lauderdale-Hollywood International Airport",
      "The port area has several parking garages but none accommodate RVs — park at an RV park nearby",
      "Fort Lauderdale Beach is a great pre-cruise day trip",
    ],
  },
  {
    id: "port-tampa",
    name: "Port Tampa Bay",
    city: "Tampa",
    state: "FL",
    latitude: 27.9378,
    longitude: -82.4443,
    region: "Florida",
    description: "Florida's largest port by acreage, serving as a major cruise departure point for Western Caribbean, Cuba, and Mexico itineraries.",
    address: "1101 Channelside Dr, Tampa, FL 33602",
    phone: "(813) 905-7678",
    website: "https://www.porttb.com",
    cruiseLines: [
      CRUISE_LINES.carnival,
      CRUISE_LINES.royal_caribbean,
      CRUISE_LINES.celebrity,
      CRUISE_LINES.holland_america,
    ],
    rvParking: [
      {
        name: "Bay Bayou RV Resort",
        address: "12520 Memorial Hwy, Tampa, FL 33635",
        phone: "(813) 855-1000",
        dailyRate: "$55-70/night",
        rvFriendly: true,
        hookups: true,
        security: "24hr",
        shuttle: false,
        notes: "Full-service RV resort 20 min from cruise port. Pool, hot tub, fitness center, laundry. Uber to terminal ~$20.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bay+Bayou+RV+Resort+Tampa",
      },
      {
        name: "Hillsborough River State Park",
        address: "15402 US-301, Thonotosassa, FL 33592",
        phone: "(813) 987-6771",
        dailyRate: "$24-28/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "State park with RV sites 30 min from port. Water/electric hookups. Beautiful natural setting along the river.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hillsborough+River+State+Park",
      },
    ],
    tips: [
      "Tampa is a great base for visiting Busch Gardens and Clearwater Beach before your cruise",
      "The port offers covered parking garages but no RV-sized spots — use nearby RV parks",
      "Western Caribbean cruises from Tampa are typically shorter (4-5 nights) and more affordable",
    ],
  },
  {
    id: "port-jacksonville",
    name: "JAXPORT Cruise Terminal",
    city: "Jacksonville",
    state: "FL",
    latitude: 30.3960,
    longitude: -81.4128,
    region: "Florida",
    description: "Northeast Florida's cruise port offering Bahamas getaways. A smaller, less crowded alternative to South Florida ports.",
    address: "9810 August Dr, Jacksonville, FL 32226",
    phone: "(904) 357-3000",
    website: "https://www.jaxport.com/cruise",
    cruiseLines: [
      CRUISE_LINES.carnival,
    ],
    rvParking: [
      {
        name: "Flamingo Lake RV Resort",
        address: "3640 Newcomb Rd, Jacksonville, FL 32218",
        phone: "(904) 766-0672",
        dailyRate: "$45-55/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "Full hookup RV resort 15 min from cruise terminal. Pool, fishing lake, laundry. Easy access to I-95.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Flamingo+Lake+RV+Resort+Jacksonville",
      },
    ],
    tips: [
      "Jacksonville is a less crowded cruise port — easier parking and shorter lines",
      "Carnival operates 4-5 night Bahamas cruises from here",
      "Visit the Jacksonville Zoo or St. Augustine (40 min south) before your cruise",
    ],
  },

  // ═══ GULF COAST ═══
  {
    id: "port-galveston",
    name: "Port of Galveston",
    city: "Galveston",
    state: "TX",
    latitude: 29.3013,
    longitude: -94.7977,
    region: "Gulf Coast",
    description: "Texas's premier cruise port and the fourth busiest in the US. Gateway to Western Caribbean and Mexico cruises from the Gulf Coast.",
    address: "2502 Harborside Dr, Galveston, TX 77550",
    phone: "(409) 766-6112",
    website: "https://www.portofgalveston.com",
    cruiseLines: [
      CRUISE_LINES.carnival,
      CRUISE_LINES.royal_caribbean,
      CRUISE_LINES.disney,
    ],
    rvParking: [
      {
        name: "Galveston Island State Park",
        address: "14901 FM 3005, Galveston, TX 77554",
        phone: "(409) 737-1222",
        dailyRate: "$20-30/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "State park with RV sites on the island, 15 min from cruise terminal. Water/electric hookups. Beach access.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Galveston+Island+State+Park",
      },
      {
        name: "Jamaica Beach RV Resort",
        address: "17200 FM 3005, Galveston, TX 77554",
        phone: "(409) 632-0200",
        dailyRate: "$50-65/night",
        rvFriendly: true,
        hookups: true,
        security: "24hr",
        shuttle: false,
        notes: "Full hookup beachfront RV resort 20 min from port. Pool, beach access, laundry. Great pre-cruise stay.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jamaica+Beach+RV+Resort+Galveston",
      },
    ],
    tips: [
      "Galveston is on an island — cross the causeway early on embarkation day to avoid traffic",
      "The Strand Historic District has great restaurants and shops for pre-cruise exploration",
      "Galveston Island State Park fills up fast in cruise season — reserve early",
    ],
  },
  {
    id: "port-new-orleans",
    name: "Port of New Orleans",
    city: "New Orleans",
    state: "LA",
    latitude: 29.9389,
    longitude: -90.0585,
    region: "Gulf Coast",
    description: "Cruise from the heart of New Orleans with easy access to the French Quarter. Popular for Caribbean and Western Caribbean itineraries.",
    address: "1350 Port of New Orleans Pl, New Orleans, LA 70130",
    phone: "(504) 522-2551",
    website: "https://www.portnola.com",
    cruiseLines: [
      CRUISE_LINES.carnival,
      CRUISE_LINES.norwegian,
      CRUISE_LINES.disney,
    ],
    rvParking: [
      {
        name: "French Quarter RV Resort",
        address: "500 N Claiborne Ave, New Orleans, LA 70112",
        phone: "(504) 586-3000",
        dailyRate: "$65-85/night",
        rvFriendly: true,
        hookups: true,
        security: "24hr",
        shuttle: false,
        notes: "Walking distance to French Quarter and cruise terminal. Full hookups, pool, laundry. Premium location but pricey.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=French+Quarter+RV+Resort+New+Orleans",
      },
      {
        name: "Pontchartrain Landing",
        address: "6001 France Rd, New Orleans, LA 70126",
        phone: "(504) 286-8157",
        dailyRate: "$45-60/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "RV resort on Lake Pontchartrain, 15 min from cruise terminal. Full hookups, pool, marina. Uber to port ~$15.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pontchartrain+Landing+New+Orleans",
      },
    ],
    tips: [
      "Arrive 2-3 days early to enjoy New Orleans — the food and music scene is incredible",
      "French Quarter RV Resort lets you walk to both the Quarter and the cruise terminal",
      "Mardi Gras season (Jan-Feb) makes parking and traffic much worse — plan accordingly",
    ],
  },
  {
    id: "port-mobile",
    name: "Port of Mobile",
    city: "Mobile",
    state: "AL",
    latitude: 30.6954,
    longitude: -88.0399,
    region: "Gulf Coast",
    description: "Alabama's cruise port offering affordable Caribbean getaways. A smaller, budget-friendly alternative to larger Gulf ports.",
    address: "201 S Water St, Mobile, AL 36602",
    phone: "(251) 441-7200",
    website: "https://www.asdd.com",
    cruiseLines: [
      CRUISE_LINES.carnival,
    ],
    rvParking: [
      {
        name: "Meaher State Park",
        address: "5200 Battleship Pkwy E, Spanish Fort, AL 36527",
        phone: "(251) 626-5529",
        dailyRate: "$22-28/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "State park on Mobile Bay, 15 min from cruise terminal. Water/electric hookups. Beautiful waterfront setting.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Meaher+State+Park+Spanish+Fort+AL",
      },
    ],
    tips: [
      "Mobile is one of the most affordable cruise departure points in the US",
      "Visit the USS Alabama Battleship Memorial Park while your RV is parked at Meaher State Park",
      "Carnival operates 4-5 night cruises to Mexico and the Caribbean from here",
    ],
  },

  // ═══ EAST COAST ═══
  {
    id: "port-charleston",
    name: "Port of Charleston",
    city: "Charleston",
    state: "SC",
    latitude: 32.7876,
    longitude: -79.9403,
    region: "East Coast",
    description: "Historic Charleston's cruise terminal offers Bahamas and Caribbean sailings from one of America's most charming cities.",
    address: "196 Concord St, Charleston, SC 29401",
    phone: "(843) 577-8100",
    website: "https://www.scspa.com/cruise",
    cruiseLines: [
      CRUISE_LINES.carnival,
    ],
    rvParking: [
      {
        name: "James Island County Park",
        address: "871 Riverland Dr, Charleston, SC 29412",
        phone: "(843) 795-4386",
        dailyRate: "$35-45/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "County park with full hookup RV sites, 15 min from cruise terminal. Pool, playground, dog park. Great pre-cruise base.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=James+Island+County+Park+Charleston",
      },
    ],
    tips: [
      "Charleston is a must-see city — arrive early to explore the historic district and waterfront",
      "James Island County Park is the closest RV-friendly option to the cruise terminal",
      "Charleston's food scene is world-class — don't miss the shrimp and grits",
    ],
  },

  // ═══ CALIFORNIA ═══
  {
    id: "port-long-beach",
    name: "Port of Long Beach",
    city: "Long Beach",
    state: "CA",
    latitude: 33.7521,
    longitude: -118.1960,
    region: "California",
    description: "Southern California's premier cruise port, home to the Queen Mary. Departure point for Mexican Riviera, Hawaii, and Pacific Coast cruises.",
    address: "231 Windsor Way, Long Beach, CA 90802",
    phone: "(562) 283-7600",
    website: "https://www.polb.com",
    cruiseLines: [
      CRUISE_LINES.carnival,
      CRUISE_LINES.princess,
      CRUISE_LINES.disney,
    ],
    rvParking: [
      {
        name: "Golden Shore RV Resort",
        address: "101 Golden Shore, Long Beach, CA 90802",
        phone: "(562) 435-4646",
        dailyRate: "$65-85/night",
        rvFriendly: true,
        hookups: true,
        security: "24hr",
        shuttle: false,
        notes: "Full hookup RV resort in downtown Long Beach, walking distance to cruise terminal. Premium waterfront location.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Golden+Shore+RV+Resort+Long+Beach",
      },
      {
        name: "Dockweiler Beach RV Park",
        address: "12001 Vista Del Mar, Playa Del Rey, CA 90293",
        phone: "(310) 322-4951",
        dailyRate: "$50-75/night",
        rvFriendly: true,
        hookups: true,
        security: "monitored",
        shuttle: false,
        notes: "Beachfront RV park 20 min from Long Beach cruise terminal. Full hookups, ocean views. Near LAX airport.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Dockweiler+Beach+RV+Park",
      },
    ],
    tips: [
      "Golden Shore RV Resort is the closest RV park to the cruise terminal — book well in advance",
      "Visit the Queen Mary (permanently docked nearby) before your cruise",
      "Long Beach has great dining and the Aquarium of the Pacific for pre-cruise activities",
    ],
  },
  {
    id: "port-los-angeles",
    name: "Port of Los Angeles (San Pedro)",
    city: "San Pedro",
    state: "CA",
    latitude: 33.7361,
    longitude: -118.2631,
    region: "California",
    description: "The World Cruise Center in San Pedro serves as LA's major cruise terminal. Popular for Mexican Riviera, Hawaii, and Alaska cruises.",
    address: "100 Swinford St, San Pedro, CA 90731",
    phone: "(310) 514-3838",
    website: "https://www.portoflosangeles.org",
    cruiseLines: [
      CRUISE_LINES.royal_caribbean,
      CRUISE_LINES.norwegian,
      CRUISE_LINES.princess,
      CRUISE_LINES.holland_america,
    ],
    rvParking: [
      {
        name: "Golden Shore RV Resort",
        address: "101 Golden Shore, Long Beach, CA 90802",
        phone: "(562) 435-4646",
        dailyRate: "$65-85/night",
        rvFriendly: true,
        hookups: true,
        security: "24hr",
        shuttle: false,
        notes: "Full hookup RV resort 10 min from San Pedro cruise terminal. Premium waterfront location in Long Beach.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Golden+Shore+RV+Resort+Long+Beach",
      },
    ],
    tips: [
      "San Pedro and Long Beach ports are very close — same RV parks serve both",
      "The Battleship Iowa Museum is right at the port — great pre-cruise visit",
      "Alaska cruises depart from here in summer — book RV parking early for peak season",
    ],
  },
  {
    id: "port-san-diego",
    name: "Port of San Diego",
    city: "San Diego",
    state: "CA",
    latitude: 32.7157,
    longitude: -117.1611,
    region: "California",
    description: "San Diego's cruise terminal on the downtown waterfront. Departure point for Mexican Riviera, Hawaii, and repositioning cruises.",
    address: "1140 N Harbor Dr, San Diego, CA 92101",
    phone: "(619) 686-6200",
    website: "https://www.portofsandiego.org",
    cruiseLines: [
      CRUISE_LINES.holland_america,
      CRUISE_LINES.disney,
      CRUISE_LINES.celebrity,
    ],
    rvParking: [
      {
        name: "Campland on the Bay",
        address: "2211 Pacific Beach Dr, San Diego, CA 92109",
        phone: "(858) 581-4200",
        dailyRate: "$65-120/night",
        rvFriendly: true,
        hookups: true,
        security: "24hr",
        shuttle: false,
        notes: "Waterfront RV resort on Mission Bay, 15 min from cruise terminal. Full hookups, beach, pool, marina. Premium location.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Campland+on+the+Bay+San+Diego",
      },
      {
        name: "San Diego Metro KOA Resort",
        address: "111 N 2nd Ave, Chula Vista, CA 91910",
        phone: "(619) 427-3601",
        dailyRate: "$55-85/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "Full hookup KOA resort 15 min from cruise terminal. Pool, hot tub, playground. Easy freeway access to port.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=San+Diego+Metro+KOA+Chula+Vista",
      },
    ],
    tips: [
      "San Diego's cruise terminal is right downtown — walk to the Gaslamp Quarter and Balboa Park",
      "The USS Midway Museum is right next to the cruise terminal",
      "San Diego has year-round mild weather — perfect for pre/post cruise RV camping",
    ],
  },
  {
    id: "port-san-francisco",
    name: "Port of San Francisco",
    city: "San Francisco",
    state: "CA",
    latitude: 37.7955,
    longitude: -122.3937,
    region: "California",
    description: "Cruise from the iconic San Francisco waterfront. Popular for Alaska, Hawaii, Pacific Coast, and transpacific voyages.",
    address: "Pier 27, The Embarcadero, San Francisco, CA 94111",
    phone: "(415) 274-0400",
    website: "https://sfport.com/maritime/cruise",
    cruiseLines: [
      CRUISE_LINES.princess,
      CRUISE_LINES.holland_america,
      CRUISE_LINES.celebrity,
      CRUISE_LINES.royal_caribbean,
    ],
    rvParking: [
      {
        name: "San Francisco RV Resort",
        address: "700 Palmetto Ave, Pacifica, CA 94044",
        phone: "(650) 355-7093",
        dailyRate: "$75-95/night",
        rvFriendly: true,
        hookups: true,
        security: "gated",
        shuttle: false,
        notes: "RV resort 20 min south of SF cruise terminal. Full hookups, ocean views. Take Uber/BART to the port.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=San+Francisco+RV+Resort+Pacifica",
      },
      {
        name: "Candlestick RV Park",
        address: "650 Gilman Ave, San Francisco, CA 94124",
        phone: "(415) 822-2299",
        dailyRate: "$60-80/night",
        rvFriendly: true,
        hookups: true,
        security: "monitored",
        shuttle: false,
        notes: "RV park within San Francisco city limits, 15 min from cruise terminal. Full hookups. Close to public transit.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Candlestick+RV+Park+San+Francisco",
      },
    ],
    tips: [
      "San Francisco is a major departure point for Alaska cruises (May-September)",
      "Parking an RV in SF is challenging — book RV parks well in advance",
      "Use BART or Uber to get from RV parks to the Pier 27 cruise terminal",
      "Visit Fisherman's Wharf, Alcatraz, and the Golden Gate Bridge before your cruise",
    ],
  },
];

// ─── Helper Functions ────────────────────────────────────────────

/**
 * Get all cruise ports, optionally filtered by region
 */
export function getCruisePorts(region?: CruisePort["region"]): CruisePort[] {
  if (!region) return CRUISE_PORTS;
  return CRUISE_PORTS.filter((p) => p.region === region);
}

/**
 * Get a single cruise port by ID
 */
export function getCruisePortById(id: string): CruisePort | undefined {
  return CRUISE_PORTS.find((p) => p.id === id);
}

/**
 * Get all unique regions
 */
export function getCruiseRegions(): CruisePort["region"][] {
  return ["Florida", "Gulf Coast", "East Coast", "California"];
}

/**
 * Get all unique cruise lines across all ports
 */
export function getAllCruiseLines(): CruiseLine[] {
  const seen = new Set<string>();
  const lines: CruiseLine[] = [];
  for (const port of CRUISE_PORTS) {
    for (const line of port.cruiseLines) {
      if (!seen.has(line.name)) {
        seen.add(line.name);
        lines.push(line);
      }
    }
  }
  return lines;
}
