import { type WeightScale } from "./types";

/**
 * Weight scale locations across the US — CAT Scales, public weigh stations,
 * and truck stop scales useful for RVers to check their rig weight.
 */
export const WEIGHT_SCALES: WeightScale[] = [
  // ── Alabama ──
  { id: "ws-al-1", name: "CAT Scale - Petro Birmingham", latitude: 33.4484, longitude: -86.8987, state: "AL", city: "Birmingham", address: "1000 Lakeshore Pkwy, Birmingham, AL 35209", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-al-2", name: "Pilot Travel Center Scale - Mobile", latitude: 30.6954, longitude: -88.0399, state: "AL", city: "Mobile", address: "3250 Hwy 98 W, Mobile, AL 36607", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-al-3", name: "Alabama Weigh Station - I-65 N", latitude: 31.2279, longitude: -85.3905, state: "AL", city: "Dothan", address: "I-65 Northbound, Dothan, AL", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false, notes: "Open to public when not busy with commercial vehicles" },

  // ── Alaska ──
  { id: "ws-ak-1", name: "Petro Wasilla Scale", latitude: 61.5814, longitude: -149.4394, state: "AK", city: "Wasilla", address: "1600 E Parks Hwy, Wasilla, AK 99654", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ak-2", name: "Fairbanks Truck Scale", latitude: 64.8378, longitude: -147.7164, state: "AK", city: "Fairbanks", address: "3501 S Cushman St, Fairbanks, AK 99701", type: "truck_stop_scale", cost: "$15.00", hours: "6am-10pm", hasCertified: true },

  // ── Arizona ──
  { id: "ws-az-1", name: "CAT Scale - Flying J Phoenix", latitude: 33.3942, longitude: -112.1401, state: "AZ", city: "Phoenix", address: "4202 W Buckeye Rd, Phoenix, AZ 85009", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-az-2", name: "CAT Scale - Pilot Tucson", latitude: 32.1656, longitude: -110.8835, state: "AZ", city: "Tucson", address: "7001 S Tucson Blvd, Tucson, AZ 85756", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-az-3", name: "Flagstaff Weigh Station - I-40", latitude: 35.1983, longitude: -111.6513, state: "AZ", city: "Flagstaff", address: "I-40 Eastbound, Flagstaff, AZ", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false },

  // ── Arkansas ──
  { id: "ws-ar-1", name: "CAT Scale - Pilot Little Rock", latitude: 34.7465, longitude: -92.2896, state: "AR", city: "Little Rock", address: "8400 Counts Massie Rd, N Little Rock, AR 72113", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ar-2", name: "Love's Travel Stop Scale - West Memphis", latitude: 35.1465, longitude: -90.1846, state: "AR", city: "West Memphis", address: "1500 N Missouri St, West Memphis, AR 72301", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── California ──
  { id: "ws-ca-1", name: "CAT Scale - Pilot Barstow", latitude: 34.8958, longitude: -117.0173, state: "CA", city: "Barstow", address: "2800 Lenwood Rd, Barstow, CA 92311", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ca-2", name: "CAT Scale - Flying J Sacramento", latitude: 38.5816, longitude: -121.4944, state: "CA", city: "Sacramento", address: "8801 Dino Dr, Elk Grove, CA 95624", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ca-3", name: "CAT Scale - TA Los Angeles", latitude: 34.0522, longitude: -118.2437, state: "CA", city: "Los Angeles", address: "1500 S Alameda St, Los Angeles, CA 90021", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ca-4", name: "Banning Weigh Station - I-10", latitude: 33.9253, longitude: -116.8764, state: "CA", city: "Banning", address: "I-10 Westbound, Banning, CA", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false, notes: "One of the busiest in CA — go early morning" },

  // ── Colorado ──
  { id: "ws-co-1", name: "CAT Scale - Pilot Denver", latitude: 39.7392, longitude: -104.9903, state: "CO", city: "Denver", address: "5201 Quebec St, Commerce City, CO 80022", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-co-2", name: "CAT Scale - Love's Colorado Springs", latitude: 38.8339, longitude: -104.8214, state: "CO", city: "Colorado Springs", address: "2950 N Nevada Ave, Colorado Springs, CO 80907", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-co-3", name: "Eisenhower Tunnel Weigh Station", latitude: 39.6786, longitude: -105.9139, state: "CO", city: "Silverthorne", address: "I-70 Eastbound, Silverthorne, CO", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false, notes: "Required stop for vehicles over 26,000 lbs" },

  // ── Connecticut ──
  { id: "ws-ct-1", name: "CAT Scale - Pilot Milford", latitude: 41.2223, longitude: -73.0565, state: "CT", city: "Milford", address: "1340 Boston Post Rd, Milford, CT 06460", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Delaware ──
  { id: "ws-de-1", name: "CAT Scale - Pilot New Castle", latitude: 39.6622, longitude: -75.5666, state: "DE", city: "New Castle", address: "1201 W Ave, New Castle, DE 19720", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Florida ──
  { id: "ws-fl-1", name: "CAT Scale - Pilot Jacksonville", latitude: 30.3322, longitude: -81.6557, state: "FL", city: "Jacksonville", address: "12400 Duval Rd, Jacksonville, FL 32218", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-fl-2", name: "CAT Scale - Flying J Orlando", latitude: 28.5383, longitude: -81.3792, state: "FL", city: "Orlando", address: "12401 S Orange Blossom Trl, Orlando, FL 32837", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-fl-3", name: "CAT Scale - TA Tampa", latitude: 27.9506, longitude: -82.4572, state: "FL", city: "Tampa", address: "6810 N US Hwy 301, Tampa, FL 33610", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Georgia ──
  { id: "ws-ga-1", name: "CAT Scale - Pilot Atlanta", latitude: 33.7490, longitude: -84.3880, state: "GA", city: "Atlanta", address: "5004 Campbellton Rd SW, Atlanta, GA 30331", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ga-2", name: "CAT Scale - Love's Savannah", latitude: 32.0809, longitude: -81.0912, state: "GA", city: "Savannah", address: "200 Gulfstream Rd, Savannah, GA 31408", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Hawaii ──
  { id: "ws-hi-1", name: "Honolulu Public Scale", latitude: 21.3069, longitude: -157.8583, state: "HI", city: "Honolulu", address: "Keehi Lagoon Dr, Honolulu, HI 96819", type: "public_weigh_station", cost: "Free", hours: "8am-4pm", hasCertified: true, notes: "Limited availability — call ahead" },

  // ── Idaho ──
  { id: "ws-id-1", name: "CAT Scale - Pilot Boise", latitude: 43.6150, longitude: -116.2023, state: "ID", city: "Boise", address: "2250 S Cole Rd, Boise, ID 83709", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-id-2", name: "Inkom Weigh Station - I-15", latitude: 42.7966, longitude: -112.2513, state: "ID", city: "Inkom", address: "I-15 Northbound, Inkom, ID", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false },

  // ── Illinois ──
  { id: "ws-il-1", name: "CAT Scale - Pilot Chicago", latitude: 41.8781, longitude: -87.6298, state: "IL", city: "Chicago", address: "9901 S Cicero Ave, Oak Lawn, IL 60453", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-il-2", name: "CAT Scale - Flying J Effingham", latitude: 39.1200, longitude: -88.5434, state: "IL", city: "Effingham", address: "1601 W Fayette Ave, Effingham, IL 62401", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Indiana ──
  { id: "ws-in-1", name: "CAT Scale - Pilot Indianapolis", latitude: 39.7684, longitude: -86.1581, state: "IN", city: "Indianapolis", address: "5350 W Southern Ave, Indianapolis, IN 46241", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-in-2", name: "CAT Scale - Love's Fort Wayne", latitude: 41.0793, longitude: -85.1394, state: "IN", city: "Fort Wayne", address: "6015 Cross Creek Blvd, Fort Wayne, IN 46818", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Iowa ──
  { id: "ws-ia-1", name: "CAT Scale - Pilot Des Moines", latitude: 41.6005, longitude: -93.6091, state: "IA", city: "Des Moines", address: "11957 Douglas Ave, Urbandale, IA 50323", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ia-2", name: "CAT Scale - Walcott (Iowa 80)", latitude: 41.5847, longitude: -90.7718, state: "IA", city: "Walcott", address: "755 W Iowa 80 Rd, Walcott, IA 52773", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true, notes: "World's largest truck stop — great RV amenities" },

  // ── Kansas ──
  { id: "ws-ks-1", name: "CAT Scale - Pilot Wichita", latitude: 37.6872, longitude: -97.3301, state: "KS", city: "Wichita", address: "901 S Webb Rd, Wichita, KS 67207", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ks-2", name: "CAT Scale - Love's Topeka", latitude: 39.0473, longitude: -95.6752, state: "KS", city: "Topeka", address: "1275 NW US Hwy 24, Topeka, KS 66608", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Kentucky ──
  { id: "ws-ky-1", name: "CAT Scale - Pilot Louisville", latitude: 38.2527, longitude: -85.7585, state: "KY", city: "Louisville", address: "4901 Crittenden Dr, Louisville, KY 40209", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Louisiana ──
  { id: "ws-la-1", name: "CAT Scale - Pilot Baton Rouge", latitude: 30.4515, longitude: -91.1871, state: "LA", city: "Baton Rouge", address: "10455 Reiger Rd, Baton Rouge, LA 70809", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-la-2", name: "CAT Scale - Love's Shreveport", latitude: 32.5252, longitude: -93.7502, state: "LA", city: "Shreveport", address: "6020 Financial Plaza, Shreveport, LA 71129", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Maine ──
  { id: "ws-me-1", name: "CAT Scale - Pilot Bangor", latitude: 44.8016, longitude: -68.7712, state: "ME", city: "Bangor", address: "1200 Hammond St, Bangor, ME 04401", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Maryland ──
  { id: "ws-md-1", name: "CAT Scale - Pilot Baltimore", latitude: 39.2904, longitude: -76.6122, state: "MD", city: "Baltimore", address: "6900 Ritchie Hwy, Glen Burnie, MD 21061", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Massachusetts ──
  { id: "ws-ma-1", name: "CAT Scale - Pilot Sturbridge", latitude: 42.1087, longitude: -72.0790, state: "MA", city: "Sturbridge", address: "400 Haynes St, Sturbridge, MA 01566", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Michigan ──
  { id: "ws-mi-1", name: "CAT Scale - Pilot Detroit", latitude: 42.3314, longitude: -83.0458, state: "MI", city: "Detroit", address: "39555 Michigan Ave, Wayne, MI 48184", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-mi-2", name: "CAT Scale - Love's Grand Rapids", latitude: 42.9634, longitude: -85.6681, state: "MI", city: "Grand Rapids", address: "4501 Clyde Park Ave SW, Wyoming, MI 49509", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Minnesota ──
  { id: "ws-mn-1", name: "CAT Scale - Pilot Minneapolis", latitude: 44.9778, longitude: -93.2650, state: "MN", city: "Minneapolis", address: "9000 Hwy 101, Shakopee, MN 55379", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Mississippi ──
  { id: "ws-ms-1", name: "CAT Scale - Pilot Jackson", latitude: 32.2988, longitude: -90.1848, state: "MS", city: "Jackson", address: "5700 I-55 N, Jackson, MS 39211", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Missouri ──
  { id: "ws-mo-1", name: "CAT Scale - Pilot Kansas City", latitude: 39.0997, longitude: -94.5786, state: "MO", city: "Kansas City", address: "8500 NW Prairie View Rd, Kansas City, MO 64153", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-mo-2", name: "CAT Scale - Flying J St. Louis", latitude: 38.6270, longitude: -90.1994, state: "MO", city: "St. Louis", address: "4600 Gravois Ave, St. Louis, MO 63116", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Montana ──
  { id: "ws-mt-1", name: "CAT Scale - Pilot Billings", latitude: 45.7833, longitude: -108.5007, state: "MT", city: "Billings", address: "5201 Southgate Dr, Billings, MT 59101", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-mt-2", name: "Missoula Weigh Station - I-90", latitude: 46.8721, longitude: -113.9940, state: "MT", city: "Missoula", address: "I-90 Eastbound, Missoula, MT", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false },

  // ── Nebraska ──
  { id: "ws-ne-1", name: "CAT Scale - Pilot Omaha", latitude: 41.2565, longitude: -95.9345, state: "NE", city: "Omaha", address: "10001 S 148th St, Omaha, NE 68138", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Nevada ──
  { id: "ws-nv-1", name: "CAT Scale - Pilot Las Vegas", latitude: 36.1699, longitude: -115.1398, state: "NV", city: "Las Vegas", address: "4850 Las Vegas Blvd S, Las Vegas, NV 89119", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-nv-2", name: "CAT Scale - Love's Reno", latitude: 39.5296, longitude: -119.8138, state: "NV", city: "Reno", address: "2405 Victorian Ave, Sparks, NV 89431", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── New Hampshire ──
  { id: "ws-nh-1", name: "CAT Scale - Pilot Hooksett", latitude: 43.0968, longitude: -71.4652, state: "NH", city: "Hooksett", address: "1 Hooksett Rd, Hooksett, NH 03106", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── New Jersey ──
  { id: "ws-nj-1", name: "CAT Scale - Pilot Bordentown", latitude: 40.1462, longitude: -74.7118, state: "NJ", city: "Bordentown", address: "1201 US-206, Bordentown, NJ 08505", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── New Mexico ──
  { id: "ws-nm-1", name: "CAT Scale - Pilot Albuquerque", latitude: 35.0844, longitude: -106.6504, state: "NM", city: "Albuquerque", address: "10401 Central Ave NE, Albuquerque, NM 87123", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-nm-2", name: "Las Cruces Weigh Station - I-10", latitude: 32.3199, longitude: -106.7637, state: "NM", city: "Las Cruces", address: "I-10 Eastbound, Las Cruces, NM", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false },

  // ── New York ──
  { id: "ws-ny-1", name: "CAT Scale - Pilot Syracuse", latitude: 43.0481, longitude: -76.1474, state: "NY", city: "Syracuse", address: "6401 Thompson Rd, Syracuse, NY 13206", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ny-2", name: "CAT Scale - Love's Albany", latitude: 42.6526, longitude: -73.7562, state: "NY", city: "Albany", address: "1523 US-9, Selkirk, NY 12158", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── North Carolina ──
  { id: "ws-nc-1", name: "CAT Scale - Pilot Charlotte", latitude: 35.2271, longitude: -80.8431, state: "NC", city: "Charlotte", address: "3800 Statesville Ave, Charlotte, NC 28206", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-nc-2", name: "CAT Scale - Love's Raleigh", latitude: 35.7796, longitude: -78.6382, state: "NC", city: "Raleigh", address: "5001 Capital Blvd, Raleigh, NC 27616", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── North Dakota ──
  { id: "ws-nd-1", name: "CAT Scale - Pilot Fargo", latitude: 46.8772, longitude: -96.7898, state: "ND", city: "Fargo", address: "3001 39th St S, Fargo, ND 58104", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Ohio ──
  { id: "ws-oh-1", name: "CAT Scale - Pilot Columbus", latitude: 39.9612, longitude: -82.9988, state: "OH", city: "Columbus", address: "6201 E Broad St, Columbus, OH 43213", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-oh-2", name: "CAT Scale - Flying J Cleveland", latitude: 41.4993, longitude: -81.6944, state: "OH", city: "Cleveland", address: "15101 Brookpark Rd, Cleveland, OH 44142", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Oklahoma ──
  { id: "ws-ok-1", name: "CAT Scale - Pilot Oklahoma City", latitude: 35.4676, longitude: -97.5164, state: "OK", city: "Oklahoma City", address: "7801 S I-35 Service Rd, Oklahoma City, OK 73149", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ok-2", name: "CAT Scale - Love's Tulsa", latitude: 36.1540, longitude: -95.9928, state: "OK", city: "Tulsa", address: "4502 S Mingo Rd, Tulsa, OK 74146", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Oregon ──
  { id: "ws-or-1", name: "CAT Scale - Pilot Portland", latitude: 45.5152, longitude: -122.6784, state: "OR", city: "Portland", address: "10210 N Vancouver Way, Portland, OR 97217", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-or-2", name: "Ashland Weigh Station - I-5", latitude: 42.1946, longitude: -122.7095, state: "OR", city: "Ashland", address: "I-5 Northbound, Ashland, OR", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false },

  // ── Pennsylvania ──
  { id: "ws-pa-1", name: "CAT Scale - Pilot Harrisburg", latitude: 40.2732, longitude: -76.8867, state: "PA", city: "Harrisburg", address: "7900 Allentown Blvd, Harrisburg, PA 17112", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-pa-2", name: "CAT Scale - Love's Pittsburgh", latitude: 40.4406, longitude: -79.9959, state: "PA", city: "Pittsburgh", address: "2800 Lebanon Church Rd, West Mifflin, PA 15122", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Rhode Island ──
  { id: "ws-ri-1", name: "Warwick Truck Scale", latitude: 41.7001, longitude: -71.4162, state: "RI", city: "Warwick", address: "1600 Post Rd, Warwick, RI 02888", type: "truck_stop_scale", cost: "$10.00", hours: "7am-7pm", hasCertified: true },

  // ── South Carolina ──
  { id: "ws-sc-1", name: "CAT Scale - Pilot Columbia", latitude: 34.0007, longitude: -81.0348, state: "SC", city: "Columbia", address: "100 Platt Springs Rd, West Columbia, SC 29169", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── South Dakota ──
  { id: "ws-sd-1", name: "CAT Scale - Pilot Sioux Falls", latitude: 43.5460, longitude: -96.7313, state: "SD", city: "Sioux Falls", address: "2801 S Shirley Ave, Sioux Falls, SD 57106", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-sd-2", name: "Wall Drug Area Scale", latitude: 43.9922, longitude: -102.2413, state: "SD", city: "Wall", address: "I-90 Exit 110, Wall, SD 57790", type: "truck_stop_scale", cost: "$10.00", hours: "6am-10pm", hasCertified: true, notes: "Near Badlands — popular RV stop" },

  // ── Tennessee ──
  { id: "ws-tn-1", name: "CAT Scale - Pilot Nashville", latitude: 36.1627, longitude: -86.7816, state: "TN", city: "Nashville", address: "2435 Atrium Way, Nashville, TN 37214", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-tn-2", name: "CAT Scale - Love's Memphis", latitude: 35.1495, longitude: -90.0490, state: "TN", city: "Memphis", address: "3350 Millbranch Rd, Memphis, TN 38116", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Texas ──
  { id: "ws-tx-1", name: "CAT Scale - Pilot Dallas", latitude: 32.7767, longitude: -96.7970, state: "TX", city: "Dallas", address: "4545 S Buckner Blvd, Dallas, TX 75227", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-tx-2", name: "CAT Scale - Flying J Houston", latitude: 29.7604, longitude: -95.3698, state: "TX", city: "Houston", address: "15015 Katy Fwy, Houston, TX 77094", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-tx-3", name: "CAT Scale - Love's San Antonio", latitude: 29.4241, longitude: -98.4936, state: "TX", city: "San Antonio", address: "6402 S New Braunfels Ave, San Antonio, TX 78223", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-tx-4", name: "CAT Scale - Pilot El Paso", latitude: 31.7619, longitude: -106.4850, state: "TX", city: "El Paso", address: "9301 Gateway Blvd W, El Paso, TX 79925", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Utah ──
  { id: "ws-ut-1", name: "CAT Scale - Pilot Salt Lake City", latitude: 40.7608, longitude: -111.8910, state: "UT", city: "Salt Lake City", address: "255 N Admiral Byrd Rd, Salt Lake City, UT 84116", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-ut-2", name: "CAT Scale - Love's St. George", latitude: 37.0965, longitude: -113.5684, state: "UT", city: "St. George", address: "1885 S Convention Center Dr, St. George, UT 84790", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Vermont ──
  { id: "ws-vt-1", name: "Williston Truck Scale", latitude: 44.4359, longitude: -73.0768, state: "VT", city: "Williston", address: "500 Industrial Ave, Williston, VT 05495", type: "truck_stop_scale", cost: "$10.00", hours: "7am-5pm", hasCertified: true },

  // ── Virginia ──
  { id: "ws-va-1", name: "CAT Scale - Pilot Richmond", latitude: 37.5407, longitude: -77.4360, state: "VA", city: "Richmond", address: "4501 Commerce Rd, Richmond, VA 23234", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-va-2", name: "CAT Scale - Love's Roanoke", latitude: 37.2710, longitude: -79.9414, state: "VA", city: "Roanoke", address: "3950 Valley Gateway Blvd, Roanoke, VA 24012", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Washington ──
  { id: "ws-wa-1", name: "CAT Scale - Pilot Seattle", latitude: 47.6062, longitude: -122.3321, state: "WA", city: "Seattle", address: "18003 E Valley Hwy, Kent, WA 98032", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-wa-2", name: "CAT Scale - Love's Spokane", latitude: 47.6588, longitude: -117.4260, state: "WA", city: "Spokane", address: "6505 E Sprague Ave, Spokane, WA 99212", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── West Virginia ──
  { id: "ws-wv-1", name: "CAT Scale - Pilot Charleston", latitude: 38.3498, longitude: -81.6326, state: "WV", city: "Charleston", address: "6400 MacCorkle Ave SE, Charleston, WV 25304", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Wisconsin ──
  { id: "ws-wi-1", name: "CAT Scale - Pilot Milwaukee", latitude: 42.9471, longitude: -87.8986, state: "WI", city: "Milwaukee", address: "6701 S 27th St, Franklin, WI 53132", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-wi-2", name: "CAT Scale - Love's Madison", latitude: 43.0731, longitude: -89.4012, state: "WI", city: "Madison", address: "4402 E Washington Ave, Madison, WI 53704", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },

  // ── Wyoming ──
  { id: "ws-wy-1", name: "CAT Scale - Pilot Cheyenne", latitude: 41.1400, longitude: -104.8202, state: "WY", city: "Cheyenne", address: "4501 Campstool Rd, Cheyenne, WY 82007", type: "cat_scale", cost: "$12.50", hours: "24/7", hasCertified: true },
  { id: "ws-wy-2", name: "Evanston Weigh Station - I-80", latitude: 41.2683, longitude: -110.9632, state: "WY", city: "Evanston", address: "I-80 Eastbound, Evanston, WY", type: "public_weigh_station", cost: "Free", hours: "24/7", hasCertified: false, notes: "Port of entry — RVs usually waved through" },
];

/** Get weight scales for a specific state */
export function getScalesByState(stateCode: string): WeightScale[] {
  return WEIGHT_SCALES.filter((s) => s.state === stateCode);
}

/** Get all CAT Scale locations */
export function getCATScales(): WeightScale[] {
  return WEIGHT_SCALES.filter((s) => s.type === "cat_scale");
}

/** Get all public weigh stations */
export function getPublicWeighStations(): WeightScale[] {
  return WEIGHT_SCALES.filter((s) => s.type === "public_weigh_station");
}
