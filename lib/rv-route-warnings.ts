/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
// RV-Safe Route Warnings - low bridges, weight limits, tunnel restrictions

export interface RouteWarning {
  id: string;
  type: "low_bridge" | "weight_limit" | "tunnel" | "steep_grade" | "narrow_road" | "no_rv" | "propane_restriction";
  lat: number;
  lng: number;
  state: string;
  location: string;
  description: string;
  clearanceFt?: number;
  weightLimitTons?: number;
  gradePct?: number;
  severity: "critical" | "warning" | "info";
}

export const RV_ROUTE_WARNINGS: RouteWarning[] = [
  // New York
  { id: "ny1", type: "low_bridge", lat: 40.7580, lng: -73.9855, state: "NY", location: "Parkway overpasses - Hutchinson River Pkwy", description: "Multiple low clearance overpasses 7'6\" to 9'. NO commercial vehicles or RVs.", clearanceFt: 7.5, severity: "critical" },
  { id: "ny2", type: "low_bridge", lat: 40.8448, lng: -73.8648, state: "NY", location: "Cross Bronx Expressway bridges", description: "Several bridges with 12'6\" clearance. Tight for tall Class A rigs.", clearanceFt: 12.5, severity: "warning" },
  { id: "ny3", type: "tunnel", lat: 40.7261, lng: -74.0114, state: "NY", location: "Holland Tunnel", description: "No propane tanks allowed. Max height 12'6\". Commercial vehicles restricted.", clearanceFt: 12.5, severity: "critical" },
  { id: "ny4", type: "tunnel", lat: 40.7580, lng: -73.9855, state: "NY", location: "Lincoln Tunnel", description: "No propane tanks allowed. Max height 13'. Must use center tube for oversize.", clearanceFt: 13, severity: "critical" },
  { id: "ny5", type: "no_rv", lat: 40.7900, lng: -73.9560, state: "NY", location: "NYC Parkways (all)", description: "ALL NYC parkways prohibit vehicles over 8' wide or 7'6\" tall. Use I-95 or I-287 instead.", clearanceFt: 7.5, severity: "critical" },

  // Pennsylvania
  { id: "pa1", type: "tunnel", lat: 40.0406, lng: -78.5694, state: "PA", location: "PA Turnpike - Allegheny Mountain Tunnel", description: "13'6\" clearance. Propane must be turned off.", clearanceFt: 13.5, severity: "warning" },
  { id: "pa2", type: "tunnel", lat: 40.0200, lng: -78.3900, state: "PA", location: "PA Turnpike - Tuscarora Tunnel", description: "13'6\" clearance. Propane must be turned off.", clearanceFt: 13.5, severity: "warning" },
  { id: "pa3", type: "low_bridge", lat: 40.4406, lng: -79.9959, state: "PA", location: "Pittsburgh - Liberty Bridge", description: "Low clearance 11'4\". Avoid with any RV.", clearanceFt: 11.3, severity: "critical" },

  // California
  { id: "ca1", type: "steep_grade", lat: 35.3733, lng: -118.5564, state: "CA", location: "I-5 Grapevine (Tejon Pass)", description: "6% grade for 5 miles. Use lower gear. Runaway truck ramps available.", gradePct: 6, severity: "warning" },
  { id: "ca2", type: "narrow_road", lat: 37.7400, lng: -119.5700, state: "CA", location: "Tioga Pass Road (Hwy 120) - Yosemite", description: "Narrow, winding mountain road. Not recommended for RVs over 35'. Seasonal closure.", severity: "warning" },
  { id: "ca3", type: "no_rv", lat: 37.2200, lng: -122.0300, state: "CA", location: "Highway 9 - Santa Cruz Mountains", description: "Extremely narrow and winding. No RVs over 22' recommended.", severity: "warning" },
  { id: "ca4", type: "tunnel", lat: 37.8324, lng: -122.4795, state: "CA", location: "Robin Williams Tunnel (Waldo Tunnel) - US-101", description: "Two bores, adequate clearance for most RVs. Watch for crosswinds at north portal.", clearanceFt: 15, severity: "info" },

  // Colorado
  { id: "co1", type: "tunnel", lat: 39.7614, lng: -105.8967, state: "CO", location: "Eisenhower Tunnel - I-70", description: "13'11\" clearance. Highest point on Interstate system (11,158'). Propane must be off.", clearanceFt: 13.9, severity: "warning" },
  { id: "co2", type: "steep_grade", lat: 39.6403, lng: -105.8756, state: "CO", location: "I-70 West of Denver", description: "7% grade descending eastbound. Use low gear. Multiple runaway ramps.", gradePct: 7, severity: "critical" },
  { id: "co3", type: "steep_grade", lat: 37.2300, lng: -107.0100, state: "CO", location: "Wolf Creek Pass - US-160", description: "7% grade, sharp switchbacks. Not recommended for large RVs.", gradePct: 7, severity: "critical" },
  { id: "co4", type: "narrow_road", lat: 38.4700, lng: -107.8800, state: "CO", location: "Black Canyon of the Gunnison - South Rim Road", description: "Narrow road with tight curves. RVs over 35' not recommended.", severity: "warning" },

  // West Virginia
  { id: "wv1", type: "tunnel", lat: 38.0500, lng: -80.7400, state: "WV", location: "WV Turnpike tunnels", description: "Multiple tunnels with 13'6\" clearance. Propane must be turned off.", clearanceFt: 13.5, severity: "warning" },

  // Virginia
  { id: "va1", type: "tunnel", lat: 36.9600, lng: -76.3300, state: "VA", location: "Hampton Roads Bridge-Tunnel", description: "No propane allowed in tunnel. 13'6\" clearance. Wind restrictions for high-profile vehicles.", clearanceFt: 13.5, severity: "warning" },
  { id: "va2", type: "tunnel", lat: 37.0100, lng: -76.4200, state: "VA", location: "Monitor-Merrimac Memorial Bridge-Tunnel", description: "No propane in tunnel sections. 14' clearance.", clearanceFt: 14, severity: "warning" },

  // Maryland
  { id: "md1", type: "tunnel", lat: 39.2600, lng: -76.5800, state: "MD", location: "Baltimore Harbor Tunnel - I-895", description: "No propane. 13'6\" clearance. Use I-695 bypass for oversize RVs.", clearanceFt: 13.5, severity: "critical" },
  { id: "md2", type: "tunnel", lat: 39.2700, lng: -76.5700, state: "MD", location: "Fort McHenry Tunnel - I-95", description: "No propane. 13'5\" clearance. Hazmat restrictions.", clearanceFt: 13.4, severity: "critical" },

  // Montana
  { id: "mt1", type: "narrow_road", lat: 48.7600, lng: -113.7800, state: "MT", location: "Going-to-the-Sun Road - Glacier NP", description: "Vehicle length limit 21' (including tow). Width limit 8'. Seasonal closure Oct-Jun.", severity: "critical" },

  // Utah
  { id: "ut1", type: "narrow_road", lat: 38.2800, lng: -109.8200, state: "UT", location: "Shafer Trail - Canyonlands", description: "Unpaved switchback road. Absolutely no RVs. 4WD only.", severity: "critical" },
  { id: "ut2", type: "steep_grade", lat: 37.6200, lng: -112.1700, state: "UT", location: "UT-12 Scenic Byway - Boulder Mountain", description: "Steep grades up to 10%. Narrow road. Not recommended for RVs over 30'.", gradePct: 10, severity: "warning" },

  // Arizona
  { id: "az1", type: "steep_grade", lat: 34.8700, lng: -111.7600, state: "AZ", location: "I-17 North of Phoenix", description: "6% grade climbing to Flagstaff. Long sustained climb. Watch engine temp.", gradePct: 6, severity: "warning" },

  // Oregon
  { id: "or1", type: "steep_grade", lat: 45.3200, lng: -121.7100, state: "OR", location: "US-26 Mt. Hood - Government Camp", description: "6% grade with sharp curves. Use low gear descending.", gradePct: 6, severity: "warning" },

  // Washington
  { id: "wa1", type: "steep_grade", lat: 47.7500, lng: -120.7400, state: "WA", location: "Stevens Pass - US-2", description: "6% grade. Chain requirements in winter. Watch for ice.", gradePct: 6, severity: "warning" },

  // Tennessee
  { id: "tn1", type: "low_bridge", lat: 36.1627, lng: -86.7816, state: "TN", location: "Nashville - Multiple railroad overpasses", description: "Several low bridges 11-12' on secondary roads. Use interstates.", clearanceFt: 11, severity: "critical" },

  // Texas
  { id: "tx1", type: "weight_limit", lat: 29.4241, lng: -98.4936, state: "TX", location: "San Antonio - Various bridges", description: "Some older bridges have 15-ton weight limits. Check signage.", weightLimitTons: 15, severity: "warning" },

  // Canada
  { id: "bc1", type: "steep_grade", lat: 49.3800, lng: -121.4400, state: "BC", location: "Coquihalla Highway (Hwy 5)", description: "8% grade. Chain-up area available. Winter conditions severe.", gradePct: 8, severity: "warning" },
  { id: "bc2", type: "narrow_road", lat: 50.9200, lng: -118.1600, state: "BC", location: "Rogers Pass - Trans-Canada Hwy", description: "Avalanche zones. Mandatory chain-up in winter. Steep grades.", severity: "warning" },
  { id: "on1", type: "tunnel", lat: 42.3200, lng: -83.0400, state: "ON", location: "Windsor-Detroit Tunnel", description: "No propane. 12'3\" clearance. Use Ambassador Bridge for RVs.", clearanceFt: 12.3, severity: "critical" },
  { id: "qc1", type: "tunnel", lat: 45.5400, lng: -73.5500, state: "QC", location: "Louis-Hippolyte-Lafontaine Tunnel - Montreal", description: "No propane. 14'9\" clearance. Use Champlain Bridge for RVs with propane.", clearanceFt: 14.75, severity: "warning" },
];

export function getWarningsForState(state: string): RouteWarning[] {
  return RV_ROUTE_WARNINGS.filter(w => w.state === state);
}

export function getWarningsNearLocation(lat: number, lng: number, radiusMiles: number = 50): RouteWarning[] {
  return RV_ROUTE_WARNINGS.filter(w => {
    const dist = haversineDistance(lat, lng, w.lat, w.lng);
    return dist <= radiusMiles;
  });
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getSeverityColor(severity: RouteWarning["severity"]): string {
  switch (severity) {
    case "critical": return "#EF4444";
    case "warning": return "#F59E0B";
    case "info": return "#3B82F6";
  }
}

export function getTypeIcon(type: RouteWarning["type"]): string {
  switch (type) {
    case "low_bridge": return "🌉";
    case "weight_limit": return "⚖️";
    case "tunnel": return "🚇";
    case "steep_grade": return "⛰️";
    case "narrow_road": return "🛤️";
    case "no_rv": return "🚫";
    case "propane_restriction": return "🔥";
  }
}

export function getTypeLabel(type: RouteWarning["type"]): string {
  switch (type) {
    case "low_bridge": return "Low Bridge";
    case "weight_limit": return "Weight Limit";
    case "tunnel": return "Tunnel Restriction";
    case "steep_grade": return "Steep Grade";
    case "narrow_road": return "Narrow Road";
    case "no_rv": return "No RVs Allowed";
    case "propane_restriction": return "Propane Restriction";
  }
}
