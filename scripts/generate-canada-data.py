#!/usr/bin/env python3
"""Generate comprehensive Canadian RV site data to append to all-sites-data.ts"""
import json
import random

START_ID = 2859  # Next available ID after existing data

# Canadian provinces/territories with major cities and coordinates
CANADA_LOCATIONS = {
    "AB": {
        "name": "Alberta",
        "cities": [
            ("Calgary", 51.0447, -114.0719),
            ("Edmonton", 53.5461, -113.4938),
            ("Red Deer", 52.2681, -113.8112),
            ("Lethbridge", 49.6935, -112.8418),
            ("Medicine Hat", 50.0405, -110.6764),
            ("Grande Prairie", 55.1707, -118.7886),
            ("Fort McMurray", 56.7264, -111.3803),
            ("Banff", 51.1784, -115.5708),
            ("Canmore", 51.0884, -115.3579),
            ("Hinton", 53.3966, -117.5617),
            ("Cochrane", 51.1890, -114.4670),
            ("Olds", 51.7929, -114.1067),
            ("Brooks", 50.5642, -111.8989),
            ("Camrose", 53.0168, -112.8340),
            ("Wetaskiwin", 52.9694, -113.3769),
        ],
        "parks": [
            ("Banff National Park - Tunnel Mountain", 51.1784, -115.5708, "national_park", "Banff"),
            ("Banff National Park - Two Jack Lake", 51.2456, -115.5012, "national_park", "Banff"),
            ("Jasper National Park - Wapiti", 52.8734, -117.8145, "national_park", "Jasper"),
            ("Jasper National Park - Whistlers", 52.8534, -118.0645, "national_park", "Jasper"),
            ("Waterton Lakes National Park", 49.0513, -113.9118, "national_park", "Waterton"),
            ("Elk Island National Park", 53.5929, -112.8700, "national_park", "Fort Saskatchewan"),
            ("Writing-on-Stone Provincial Park", 49.0823, -111.6174, "provincial_park", "Milk River"),
            ("Dinosaur Provincial Park", 50.7583, -111.4897, "provincial_park", "Brooks"),
            ("Peter Lougheed Provincial Park", 50.6167, -115.1667, "provincial_park", "Kananaskis"),
            ("William A. Switzer Provincial Park", 53.5500, -117.7833, "provincial_park", "Hinton"),
            ("Cypress Hills Interprovincial Park", 49.6583, -110.2167, "provincial_park", "Medicine Hat"),
            ("Bow Valley Provincial Park", 51.0667, -115.1000, "provincial_park", "Canmore"),
        ],
    },
    "BC": {
        "name": "British Columbia",
        "cities": [
            ("Vancouver", 49.2827, -123.1207),
            ("Victoria", 48.4284, -123.3656),
            ("Kelowna", 49.8880, -119.4960),
            ("Kamloops", 50.6745, -120.3273),
            ("Prince George", 53.9171, -122.7497),
            ("Nanaimo", 49.1659, -123.9401),
            ("Vernon", 50.2670, -119.2720),
            ("Courtenay", 49.6841, -124.9936),
            ("Campbell River", 50.0244, -125.2475),
            ("Whistler", 50.1163, -122.9574),
            ("Revelstoke", 50.9981, -118.1957),
            ("Golden", 51.2981, -116.9675),
            ("Tofino", 49.1530, -125.9066),
            ("Osoyoos", 49.0325, -119.4694),
            ("Dawson Creek", 55.7596, -120.2353),
        ],
        "parks": [
            ("Pacific Rim National Park Reserve", 49.0042, -125.6583, "national_park", "Tofino"),
            ("Glacier National Park", 51.2975, -117.5189, "national_park", "Revelstoke"),
            ("Yoho National Park - Kicking Horse", 51.2975, -116.7614, "national_park", "Field"),
            ("Kootenay National Park - Redstreak", 50.6167, -116.0500, "national_park", "Radium Hot Springs"),
            ("Mount Robson Provincial Park", 53.1167, -119.2333, "provincial_park", "Valemount"),
            ("Manning Provincial Park", 49.0667, -120.7833, "provincial_park", "Hope"),
            ("Wells Gray Provincial Park", 51.9667, -120.1167, "provincial_park", "Clearwater"),
            ("Goldstream Provincial Park", 48.4500, -123.5500, "provincial_park", "Victoria"),
            ("Rathtrevor Beach Provincial Park", 49.3167, -124.2167, "provincial_park", "Parksville"),
            ("Cultus Lake Provincial Park", 49.0500, -121.9833, "provincial_park", "Chilliwack"),
            ("Shuswap Lake Provincial Park", 50.9500, -119.2000, "provincial_park", "Scotch Creek"),
            ("Porteau Cove Provincial Park", 49.5583, -123.2333, "provincial_park", "Squamish"),
        ],
    },
    "ON": {
        "name": "Ontario",
        "cities": [
            ("Toronto", 43.6532, -79.3832),
            ("Ottawa", 45.4215, -75.6972),
            ("Hamilton", 43.2557, -79.8711),
            ("London", 42.9849, -81.2453),
            ("Kingston", 44.2312, -76.4860),
            ("Thunder Bay", 48.3809, -89.2477),
            ("Sudbury", 46.4917, -80.9930),
            ("Barrie", 44.3894, -79.6903),
            ("Niagara Falls", 43.0896, -79.0849),
            ("Sault Ste. Marie", 46.5219, -84.3461),
            ("Peterborough", 44.3091, -78.3197),
            ("Kenora", 49.7667, -94.4833),
            ("Huntsville", 45.3250, -79.2167),
            ("Parry Sound", 45.3333, -80.0333),
            ("Tobermory", 45.2534, -81.6645),
        ],
        "parks": [
            ("Algonquin Provincial Park", 45.5872, -78.3753, "provincial_park", "Whitney"),
            ("Killarney Provincial Park", 46.0167, -81.4000, "provincial_park", "Killarney"),
            ("Sandbanks Provincial Park", 43.9167, -77.2500, "provincial_park", "Picton"),
            ("Pinery Provincial Park", 43.2667, -81.8333, "provincial_park", "Grand Bend"),
            ("Bon Echo Provincial Park", 44.9000, -77.2000, "provincial_park", "Cloyne"),
            ("Grundy Lake Provincial Park", 45.5333, -80.0333, "provincial_park", "Britt"),
            ("Arrowhead Provincial Park", 45.3833, -79.2333, "provincial_park", "Huntsville"),
            ("Point Pelee National Park", 41.9667, -82.5167, "national_park", "Leamington"),
            ("Bruce Peninsula National Park", 45.2333, -81.5167, "national_park", "Tobermory"),
            ("Thousand Islands National Park", 44.3500, -76.0167, "national_park", "Mallorytown"),
            ("Georgian Bay Islands National Park", 44.8667, -79.8667, "national_park", "Honey Harbour"),
            ("Presqu'ile Provincial Park", 43.9833, -77.7167, "provincial_park", "Brighton"),
        ],
    },
    "QC": {
        "name": "Quebec",
        "cities": [
            ("Montreal", 45.5017, -73.5673),
            ("Quebec City", 46.8139, -71.2080),
            ("Gatineau", 45.4765, -75.7013),
            ("Sherbrooke", 45.4000, -71.8833),
            ("Trois-Rivières", 46.3432, -72.5477),
            ("Saguenay", 48.4279, -71.0548),
            ("Rimouski", 48.4489, -68.5243),
            ("Drummondville", 45.8833, -72.4833),
            ("Saint-Jérôme", 45.7833, -74.0000),
            ("Gaspé", 48.8316, -64.4874),
            ("Rivière-du-Loup", 47.8333, -69.5333),
            ("Mont-Tremblant", 46.2094, -74.5850),
        ],
        "parks": [
            ("Forillon National Park", 48.8500, -64.3500, "national_park", "Gaspé"),
            ("La Mauricie National Park", 46.7833, -72.9833, "national_park", "Shawinigan"),
            ("Mingan Archipelago National Park", 50.2167, -63.5833, "national_park", "Havre-Saint-Pierre"),
            ("Parc national du Mont-Tremblant", 46.3500, -74.6000, "provincial_park", "Mont-Tremblant"),
            ("Parc national de la Jacques-Cartier", 47.1667, -71.2333, "provincial_park", "Stoneham"),
            ("Parc national du Bic", 48.3500, -68.7667, "provincial_park", "Rimouski"),
            ("Parc national de la Gaspésie", 48.9500, -66.0833, "provincial_park", "Sainte-Anne-des-Monts"),
            ("Parc national des Îles-de-Boucherville", 45.5833, -73.4500, "provincial_park", "Boucherville"),
            ("Parc national d'Oka", 45.4833, -74.0833, "provincial_park", "Oka"),
            ("Parc national du Mont-Orford", 45.3333, -72.2167, "provincial_park", "Orford"),
        ],
    },
    "MB": {
        "name": "Manitoba",
        "cities": [
            ("Winnipeg", 49.8951, -97.1384),
            ("Brandon", 49.8418, -99.9500),
            ("Steinbach", 49.5258, -96.6839),
            ("Thompson", 55.7433, -97.8553),
            ("Portage la Prairie", 49.9728, -98.2919),
            ("Selkirk", 50.1436, -96.8839),
            ("Dauphin", 51.1494, -100.0500),
            ("The Pas", 53.8253, -101.2522),
            ("Gimli", 50.6333, -96.9833),
            ("Churchill", 58.7684, -94.1650),
        ],
        "parks": [
            ("Riding Mountain National Park", 50.6667, -99.9667, "national_park", "Wasagaming"),
            ("Whiteshell Provincial Park", 49.9500, -95.3333, "provincial_park", "Whiteshell"),
            ("Spruce Woods Provincial Park", 49.6667, -99.2833, "provincial_park", "Carberry"),
            ("Birds Hill Provincial Park", 49.9833, -96.8833, "provincial_park", "Winnipeg"),
            ("Hecla/Grindstone Provincial Park", 50.8833, -96.8833, "provincial_park", "Riverton"),
            ("Grand Beach Provincial Park", 50.5667, -96.6000, "provincial_park", "Grand Beach"),
            ("Nopiming Provincial Park", 50.5000, -95.5000, "provincial_park", "Lac du Bonnet"),
        ],
    },
    "SK": {
        "name": "Saskatchewan",
        "cities": [
            ("Saskatoon", 52.1332, -106.6700),
            ("Regina", 50.4452, -104.6189),
            ("Prince Albert", 53.2033, -105.7531),
            ("Moose Jaw", 50.3933, -105.5519),
            ("Swift Current", 50.2881, -107.7938),
            ("North Battleford", 52.7575, -108.2861),
            ("Yorkton", 51.2139, -102.4628),
            ("Estevan", 49.1392, -102.9861),
            ("Weyburn", 49.6608, -103.8525),
            ("Melfort", 52.8564, -104.6103),
        ],
        "parks": [
            ("Prince Albert National Park", 53.8833, -106.1833, "national_park", "Waskesiu Lake"),
            ("Grasslands National Park", 49.1833, -107.4167, "national_park", "Val Marie"),
            ("Cypress Hills Interprovincial Park SK", 49.6500, -109.5333, "provincial_park", "Maple Creek"),
            ("Duck Mountain Provincial Park", 51.7500, -101.5833, "provincial_park", "Kamsack"),
            ("Lac La Ronge Provincial Park", 55.1000, -105.2833, "provincial_park", "La Ronge"),
            ("Meadow Lake Provincial Park", 54.1167, -108.5333, "provincial_park", "Meadow Lake"),
            ("Echo Valley Provincial Park", 50.6333, -104.0833, "provincial_park", "Fort Qu'Appelle"),
        ],
    },
    "NB": {
        "name": "New Brunswick",
        "cities": [
            ("Fredericton", 45.9636, -66.6431),
            ("Saint John", 45.2733, -66.0633),
            ("Moncton", 46.0878, -64.7782),
            ("Miramichi", 47.0289, -65.5003),
            ("Bathurst", 47.6194, -65.6500),
            ("Edmundston", 47.3736, -68.3253),
            ("Campbellton", 48.0067, -66.6731),
            ("Sussex", 45.7222, -65.5103),
            ("Woodstock", 46.1519, -67.5997),
            ("Shediac", 46.2194, -64.5389),
        ],
        "parks": [
            ("Fundy National Park", 45.5833, -65.0167, "national_park", "Alma"),
            ("Kouchibouguac National Park", 46.8167, -64.9667, "national_park", "Kouchibouguac"),
            ("Mount Carleton Provincial Park", 47.4000, -66.9167, "provincial_park", "Saint-Quentin"),
            ("Mactaquac Provincial Park", 45.9500, -66.8833, "provincial_park", "Fredericton"),
            ("Parlee Beach Provincial Park", 46.2333, -64.5333, "provincial_park", "Shediac"),
            ("New River Beach Provincial Park", 45.1333, -66.5333, "provincial_park", "Lepreau"),
        ],
    },
    "NS": {
        "name": "Nova Scotia",
        "cities": [
            ("Halifax", 44.6488, -63.5752),
            ("Sydney", 46.1368, -60.1942),
            ("Truro", 45.3647, -63.2800),
            ("New Glasgow", 45.5928, -62.6467),
            ("Yarmouth", 43.8361, -66.1175),
            ("Antigonish", 45.6167, -61.9833),
            ("Wolfville", 45.0833, -64.3667),
            ("Lunenburg", 44.3783, -64.3167),
            ("Digby", 44.6219, -65.7600),
            ("Baddeck", 46.1000, -60.7500),
        ],
        "parks": [
            ("Cape Breton Highlands National Park", 46.7333, -60.7500, "national_park", "Ingonish"),
            ("Kejimkujik National Park", 44.3833, -65.2167, "national_park", "Maitland Bridge"),
            ("Blomidon Provincial Park", 45.2500, -64.3500, "provincial_park", "Canning"),
            ("Five Islands Provincial Park", 45.3833, -64.0833, "provincial_park", "Economy"),
            ("Dollar Lake Provincial Park", 44.8333, -63.5000, "provincial_park", "Enfield"),
            ("Graves Island Provincial Park", 44.3833, -64.2667, "provincial_park", "Chester"),
        ],
    },
    "NL": {
        "name": "Newfoundland and Labrador",
        "cities": [
            ("St. John's", 47.5615, -52.7126),
            ("Corner Brook", 48.9500, -57.9500),
            ("Gander", 48.9569, -54.6089),
            ("Grand Falls-Windsor", 48.9333, -55.6667),
            ("Clarenville", 48.1750, -53.9667),
            ("Deer Lake", 49.1667, -57.4333),
            ("Stephenville", 48.5500, -58.5833),
            ("Happy Valley-Goose Bay", 53.3017, -60.3261),
            ("Labrador City", 52.9500, -66.9167),
            ("Bonavista", 48.6500, -53.1167),
        ],
        "parks": [
            ("Gros Morne National Park", 49.5833, -57.7500, "national_park", "Rocky Harbour"),
            ("Terra Nova National Park", 48.5333, -53.9667, "national_park", "Glovertown"),
            ("Barachois Pond Provincial Park", 48.3333, -58.2833, "provincial_park", "Stephenville"),
            ("Butter Pot Provincial Park", 47.3833, -52.9333, "provincial_park", "St. John's"),
            ("Sir Richard Squires Provincial Park", 49.2167, -57.4833, "provincial_park", "Deer Lake"),
            ("J.T. Cheeseman Provincial Park", 47.7333, -59.2167, "provincial_park", "Cape Ray"),
        ],
    },
    "PE": {
        "name": "Prince Edward Island",
        "cities": [
            ("Charlottetown", 46.2382, -63.1311),
            ("Summerside", 46.3933, -63.7906),
            ("Stratford", 46.2167, -63.0833),
            ("Cornwall", 46.2333, -63.2000),
            ("Montague", 46.1667, -62.6500),
            ("Souris", 46.3500, -62.2500),
            ("Kensington", 46.4333, -63.6333),
            ("Cavendish", 46.4917, -63.3833),
        ],
        "parks": [
            ("Prince Edward Island National Park", 46.4167, -63.0833, "national_park", "Cavendish"),
            ("Brudenell River Provincial Park", 46.1833, -62.5667, "provincial_park", "Montague"),
            ("Jacques Cartier Provincial Park", 46.4833, -62.8500, "provincial_park", "Morrell"),
            ("Red Point Provincial Park", 46.3833, -62.1167, "provincial_park", "Souris"),
            ("Cabot Beach Provincial Park", 46.6333, -63.6667, "provincial_park", "Malpeque"),
        ],
    },
    "NT": {
        "name": "Northwest Territories",
        "cities": [
            ("Yellowknife", 62.4540, -114.3718),
            ("Hay River", 60.8167, -115.7167),
            ("Inuvik", 68.3607, -133.7230),
            ("Fort Smith", 60.0000, -111.8833),
            ("Norman Wells", 65.2833, -126.8500),
            ("Fort Simpson", 61.8667, -121.2333),
        ],
        "parks": [
            ("Nahanni National Park Reserve", 61.0833, -123.6000, "national_park", "Fort Simpson"),
            ("Wood Buffalo National Park", 59.3833, -112.3333, "national_park", "Fort Smith"),
            ("Fred Henne Territorial Park", 62.4667, -114.3833, "provincial_park", "Yellowknife"),
            ("Prelude Lake Territorial Park", 62.5667, -113.9833, "provincial_park", "Yellowknife"),
        ],
    },
    "NU": {
        "name": "Nunavut",
        "cities": [
            ("Iqaluit", 63.7467, -68.5170),
            ("Rankin Inlet", 62.8167, -92.0833),
            ("Arviat", 61.1083, -94.0583),
            ("Baker Lake", 64.3167, -96.0167),
            ("Cambridge Bay", 69.1167, -105.0333),
        ],
        "parks": [
            ("Auyuittuq National Park", 66.0500, -65.5167, "national_park", "Pangnirtung"),
            ("Sirmilik National Park", 72.8333, -80.5000, "national_park", "Pond Inlet"),
            ("Sylvia Grinnell Territorial Park", 63.7500, -68.5500, "provincial_park", "Iqaluit"),
        ],
    },
    "YT": {
        "name": "Yukon",
        "cities": [
            ("Whitehorse", 60.7212, -135.0568),
            ("Dawson City", 64.0653, -139.4188),
            ("Watson Lake", 60.0783, -128.8276),
            ("Haines Junction", 60.7688, -137.5175),
            ("Carmacks", 62.0833, -136.2833),
            ("Teslin", 60.1667, -132.7333),
        ],
        "parks": [
            ("Kluane National Park", 60.7500, -138.5000, "national_park", "Haines Junction"),
            ("Ivvavik National Park", 69.5000, -139.5000, "national_park", "Inuvik"),
            ("Tombstone Territorial Park", 64.5000, -138.2333, "provincial_park", "Dawson City"),
            ("Kusawa Lake Territorial Park", 60.5000, -136.2500, "provincial_park", "Whitehorse"),
        ],
    },
}

# Review templates
REVIEW_AUTHORS = [
    "PrairieRoamer_Pete", "MapleCruiser_Jan", "RockyMtn_Dave", "CoastToCoast_Sue",
    "NorthernLights_Kim", "TransCanada_Bob", "FjordExplorer_Faye", "IslandHopper_Irene",
    "BoatRV_Bob", "TundraTracker_Tom", "HighwayHank", "LakeLover_Linda",
    "WildernessWanderer", "MooseCountry_Mike", "PacificDrifter_Pat", "AtlanticBreeze_Al",
    "SnowBird_Diane", "RoadWarrior_Mike", "CampingMom_Sarah", "FullTimer_Dave",
]

RIG_TYPES = [
    "Class A 38ft", "Class A 42ft", "Class B 22ft", "Class C 28ft", "Class C 32ft",
    "Travel Trailer 24ft", "Travel Trailer 28ft", "Travel Trailer 30ft",
    "Fifth Wheel 30ft", "Fifth Wheel 36ft", "Fifth Wheel 40ft",
    "Pop-up Trailer", "Truck Camper", "Van", "Motorhome 40ft",
]

REVIEW_TEMPLATES = {
    "national_park": [
        ("Stunning scenery", "One of Canada's finest national parks. The scenery is breathtaking and the campground is well maintained. Sites are spacious with good privacy. Highly recommend booking early in peak season."),
        ("Worth the drive", "Drove 800km to get here and it was absolutely worth it. Campground is clean, staff is friendly. Trails are world-class. We'll be back next year for sure."),
        ("Beautiful but busy", "Gorgeous park but gets very busy in July and August. Book months in advance. Sites are well-spaced with fire pits and picnic tables. Flush toilets and showers available."),
        ("Nature at its best", "Woke up to wildlife right at our campsite. The park is pristine and well-managed. Sites have good gravel pads. Cell service is spotty but that's part of the charm."),
        ("Family favourite", "Our family has been coming here for years. Kids love the interpretive programs. Sites accommodate our 30ft trailer easily. Camp store has basic supplies."),
    ],
    "provincial_park": [
        ("Great provincial park", "Well-maintained provincial park with good facilities. Sites are level with electric hookups. Showers are clean. Good value for the price."),
        ("Hidden gem", "This park doesn't get the attention it deserves. Sites are spacious and well maintained. Electric hookups available. Lake access is great for fishing."),
        ("Perfect weekend spot", "Only a couple hours from the city. Sites are well-spaced with good shade. Firewood available at the camp store. Kids loved the beach."),
        ("Solid campground", "Everything you need for a comfortable stay. Level sites, clean washrooms, and friendly staff. We stayed a full week and enjoyed every day."),
        ("Beautiful setting", "Gorgeous location with great hiking trails. Sites are a bit tight for big rigs but manageable. Washrooms were spotless. Would return."),
    ],
    "rv_park": [
        ("Excellent RV park", "Full hookups worked perfectly. WiFi was decent. Sites are level and well-maintained. Laundry facilities on site. Great base for exploring the area."),
        ("Top notch facilities", "One of the best private RV parks we've stayed at in Canada. 50 amp service, cable TV, WiFi. Staff is friendly and helpful. Pool was clean."),
        ("Good for big rigs", "Pull-through sites are long enough for our 42ft rig with toad. Easy to navigate. 50 amp service was solid. Dog park on site is a nice bonus."),
        ("Will return", "This is our third year staying here. Always well maintained, quiet hours are enforced. Great hiking trails nearby. The dump station is easy to access."),
        ("Clean and comfortable", "Sites are paved and level. Full hookups including cable. Bathhouse was very clean. Close to town for supplies. Fair price for the amenities offered."),
    ],
    "boondocking": [
        ("True wilderness", "Remote and peaceful. No services but that's the point. Beautiful Crown Land camping. Bring everything you need. Cell service is minimal."),
        ("Free and beautiful", "Can't beat free camping with views like this. Road in is rough but passable. We stayed 14 days and saw maybe 3 other campers. Bring water."),
        ("Off the grid paradise", "If you want to disconnect, this is the place. No hookups, no cell service, just nature. Road access is decent for smaller rigs. Bring bear spray."),
    ],
    "dump_station": [
        ("Clean and functional", "Well-maintained dump station. Easy access for big rigs. Water fill available too. Open seasonally so check dates before visiting."),
        ("Gets the job done", "Standard dump station with good access. Can get busy on weekends. Water fill station nearby. Free with fuel purchase."),
    ],
    "truck_stop": [
        ("Good truck stop", "Clean facilities with hot showers. Restaurant has decent food. RV lanes are easy to navigate. Good overnight stop on the Trans-Canada."),
        ("Essential stop", "Fuel, food, and showers all in one place. Showers are clean and free with fuel purchase. Parking lot accommodates big rigs easily."),
    ],
}

def generate_reviews(category, site_id, count=None):
    if count is None:
        count = random.randint(2, 4)
    templates = REVIEW_TEMPLATES.get(category, REVIEW_TEMPLATES.get("rv_park", []))
    reviews = []
    used_templates = random.sample(templates, min(count, len(templates)))
    for i, (title, body) in enumerate(used_templates):
        author = random.choice(REVIEW_AUTHORS)
        year = random.choice([2024, 2025, 2026])
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        reviews.append({
            "id": f"rev-{site_id}-{i+1}",
            "author": author,
            "date": f"{year}-{month:02d}-{day:02d}",
            "rating": random.choice([4, 4, 4, 5, 5, 3]),
            "title": title,
            "body": body,
            "rigType": random.choice(RIG_TYPES),
            "helpful": random.randint(0, 45),
        })
    return reviews

def format_reviews(reviews):
    parts = []
    for r in reviews:
        parts.append(f'{{ id: "{r["id"]}", author: "{r["author"]}", date: "{r["date"]}", rating: {r["rating"]}, title: "{r["title"]}", body: "{r["body"]}", rigType: "{r["rigType"]}", helpful: {r["helpful"]} }}')
    return "[" + ", ".join(parts) + "]"

def gen_rv_length():
    return random.choice(["30 ft", "35 ft", "40 ft", "45 ft", "50 ft", "No limit"])

def gen_trailer_length():
    return random.choice(["25 ft", "27 ft", "30 ft", "35 ft", "40 ft", "No limit"])

def gen_height():
    return random.choice(["12 ft", "13 ft", "13 ft 6 in", "14 ft", "No limit"])

# Canadian truck stop / travel centre chains
CANADIAN_TRUCK_STOPS = [
    "Husky Travel Centre",
    "Petro-Canada Travel Centre",
    "Esso Truck Stop",
    "Shell Travel Centre",
    "Flying J Travel Center",
    "Pilot Travel Center",
    "Canadian Tire Gas+",
]

# Dump station operators in Canada
DUMP_OPERATORS = [
    "Municipal Dump Station",
    "Petro-Canada Dump Station",
    "Husky Travel Centre Dump",
    "Flying J Dump Station",
    "KOA Dump Station",
    "Provincial Park Dump Station",
    "Sanidump Station",
]

sites = []
current_id = START_ID

for prov_code, prov_data in CANADA_LOCATIONS.items():
    prov_name = prov_data["name"]
    cities = prov_data["cities"]
    parks = prov_data.get("parks", [])

    # === CAMPGROUNDS (parks) ===
    for park_name, lat, lon, cat, city in parks:
        site_id = str(current_id)
        price = random.choice([15, 20, 25, 28, 30, 32, 35]) if cat != "boondocking" else None
        amenities_map = {
            "national_park": ["Restrooms", "Water", "Campfire Ring", "Hiking", "Interpretive Programs"],
            "provincial_park": ["Water/Electric", "Restrooms", "Hiking", "Playground", "Beach Access"],
        }
        amenities = amenities_map.get(cat, ["Restrooms", "Water"])
        if random.random() > 0.5:
            amenities.append("Showers")
        if random.random() > 0.6:
            amenities.append("Dump Station")
        desc = f"{park_name} campground in {prov_name}. " + random.choice([
            "Reservations recommended in summer. Beautiful natural setting with well-maintained facilities.",
            "Popular destination for RVers and tent campers alike. Book early for peak season.",
            "Scenic campground with excellent hiking trails nearby. Sites accommodate most RV sizes.",
            "Well-maintained campground with modern facilities. Close to major attractions.",
        ]) + " Prices in CAD."
        reviews = generate_reviews(cat, site_id)
        rv_len = gen_rv_length()
        trailer_len = gen_trailer_length()
        height = gen_height()
        pt = random.choice([True, False])
        br = rv_len in ["45 ft", "50 ft", "No limit"]
        sites.append(f'  {{ id: "{site_id}", name: "{park_name}", latitude: {lat}, longitude: {lon}, state: "{prov_code}", city: "{city}", category: "{cat}", rating: {round(random.uniform(3.8, 4.9), 1)}, reviewCount: {random.randint(100, 900)}, pricePerNight: {price if price else "null"}, amenities: {json.dumps(amenities)}, description: "{desc}", discounts: [], maxRVLength: "{rv_len}", maxTrailerLength: "{trailer_len}", maxRVHeight: "{height}", pullThrough: {"true" if pt else "false"}, bigRigFriendly: {"true" if br else "false"}, reviews: {format_reviews(reviews)} }}')
        current_id += 1

    # === RV PARKS (2-4 per province, more for bigger provinces) ===
    num_rv_parks = 4 if prov_code in ["AB", "BC", "ON", "QC"] else 3 if prov_code in ["MB", "SK", "NB", "NS", "NL"] else 2
    for i in range(num_rv_parks):
        city_name, lat, lon = cities[i % len(cities)]
        lat += random.uniform(-0.05, 0.05)
        lon += random.uniform(-0.05, 0.05)
        site_id = str(current_id)
        name = random.choice([
            f"{city_name} RV Resort & Campground",
            f"Happy Trails RV Park - {city_name}",
            f"Northern Lights RV Park - {city_name}",
            f"Maple Leaf RV Resort - {city_name}",
            f"Trans-Canada RV Park - {city_name}",
            f"Riverside RV Park - {city_name}",
            f"Lakeview RV Resort - {city_name}",
        ])
        price = random.choice([35, 40, 45, 50, 55, 60])
        amenities = ["Full Hookups", "30/50 Amp", "WiFi", "Laundry", "Showers", "Dump Station"]
        if random.random() > 0.4:
            amenities.append("Pool")
        if random.random() > 0.5:
            amenities.append("Dog Park")
        if random.random() > 0.6:
            amenities.append("Cable TV")
        desc = f"Full-service RV park in {city_name}, {prov_name}. Full hookups with 30/50 amp service. WiFi, laundry, showers, and dump station on-site. Prices in CAD."
        reviews = generate_reviews("rv_park", site_id)
        rv_len = random.choice(["40 ft", "45 ft", "50 ft", "No limit"])
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "rv_park", rating: {round(random.uniform(3.8, 4.8), 1)}, reviewCount: {random.randint(80, 500)}, pricePerNight: {price}, amenities: {json.dumps(amenities)}, description: "{desc}", discounts: [], maxRVLength: "{rv_len}", maxTrailerLength: "{gen_trailer_length()}", maxRVHeight: "{gen_height()}", pullThrough: true, bigRigFriendly: true, reviews: {format_reviews(reviews)} }}')
        current_id += 1

    # === BOONDOCKING / CROWN LAND (2-3 per province) ===
    num_boondock = 3 if prov_code in ["AB", "BC", "ON", "QC", "MB", "SK"] else 2
    for i in range(num_boondock):
        city_name, lat, lon = cities[(i + 3) % len(cities)]
        lat += random.uniform(-0.2, 0.2)
        lon += random.uniform(-0.2, 0.2)
        site_id = str(current_id)
        name = random.choice([
            f"Crown Land - {city_name} Area",
            f"Dispersed Camping - Hwy {random.randint(1, 99)} near {city_name}",
            f"Free Camping - {city_name} Forest Road",
            f"Backcountry Access - {city_name} Region",
        ])
        desc = f"Free dispersed camping on Crown Land near {city_name}, {prov_name}. No services. " + random.choice([
            "14-day limit. Bring all supplies including water. Check provincial regulations.",
            "Remote and peaceful. No cell service. Bear country - bring bear spray and store food properly.",
            "Access road may be rough. High clearance recommended. Beautiful wilderness setting.",
            "Popular with locals on weekends. Arrive early Friday for best spots. Leave no trace.",
        ])
        reviews = generate_reviews("boondocking", site_id, 2)
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "boondocking", rating: {round(random.uniform(3.5, 4.6), 1)}, reviewCount: {random.randint(30, 200)}, pricePerNight: null, amenities: ["None"], description: "{desc}", discounts: [], reviews: {format_reviews(reviews)} }}')
        current_id += 1

    # === DUMP STATIONS (3-5 per province) ===
    num_dumps = 5 if prov_code in ["AB", "BC", "ON", "QC"] else 4 if prov_code in ["MB", "SK", "NB", "NS"] else 3
    for i in range(num_dumps):
        city_name, lat, lon = cities[i % len(cities)]
        lat += random.uniform(-0.02, 0.02)
        lon += random.uniform(-0.02, 0.02)
        site_id = str(current_id)
        operator = random.choice(DUMP_OPERATORS)
        name = f"{operator} - {city_name}"
        is_free = "Municipal" in operator or "Provincial" in operator
        price_desc = "Free" if is_free else random.choice(["Free with fuel purchase, $10-15 CAD otherwise", "$10-15 CAD", "Free for registered guests, $10 CAD for others"])
        amenities = ["Dump Station"]
        if random.random() > 0.3:
            amenities.append("Water Fill")
        if "Flying J" in operator or "Husky" in operator or "Petro" in operator:
            amenities.extend(["Fuel", "Convenience Store"])
        desc = f"{operator} in {city_name}, {prov_name}. {price_desc}. " + random.choice([
            "Easy access for large rigs. Open seasonally May-October.",
            "24/7 access. Well-maintained facility.",
            "RV-friendly access. Potable water fill also available.",
            "Located near major highway. Easy pull-through access.",
        ])
        reviews = generate_reviews("dump_station", site_id, 2)
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "dump_station", rating: {round(random.uniform(3.2, 4.2), 1)}, reviewCount: {random.randint(20, 150)}, pricePerNight: null, amenities: {json.dumps(amenities)}, description: "{desc}", discounts: [], reviews: {format_reviews(reviews)} }}')
        current_id += 1

    # === TRUCK STOPS with showers (3-5 per province) ===
    num_trucks = 5 if prov_code in ["AB", "BC", "ON", "QC"] else 4 if prov_code in ["MB", "SK", "NB", "NS"] else 3
    for i in range(num_trucks):
        city_name, lat, lon = cities[(i + 1) % len(cities)]
        lat += random.uniform(-0.03, 0.03)
        lon += random.uniform(-0.03, 0.03)
        site_id = str(current_id)
        chain = random.choice(CANADIAN_TRUCK_STOPS)
        name = f"{chain} - {city_name}"
        amenities = ["Restaurant", "Showers", "RV Lanes", "Diesel"]
        if random.random() > 0.3:
            amenities.append("Propane")
        if random.random() > 0.3:
            amenities.append("RV Dump")
        if random.random() > 0.4:
            amenities.append("WiFi")
        amenities.append("Overnight Parking")
        shower_price = random.choice(["$12 CAD", "$13 CAD", "$14 CAD", "$15 CAD"])
        desc = f"{chain} truck stop in {city_name}, {prov_name}. Showers available - free with fuel purchase, {shower_price} otherwise. RV-friendly with overnight parking available."
        reviews = generate_reviews("truck_stop", site_id, 2)
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "truck_stop", rating: {round(random.uniform(3.5, 4.5), 1)}, reviewCount: {random.randint(50, 300)}, pricePerNight: 0, amenities: {json.dumps(amenities)}, description: "{desc}", discounts: [], reviews: {format_reviews(reviews)} }}')
        current_id += 1

    # === FUEL STATIONS (2-3 per province) ===
    num_fuel = 3 if prov_code in ["AB", "BC", "ON", "QC"] else 2
    for i in range(num_fuel):
        city_name, lat, lon = cities[(i + 2) % len(cities)]
        lat += random.uniform(-0.01, 0.01)
        lon += random.uniform(-0.01, 0.01)
        site_id = str(current_id)
        chain = random.choice(["Petro-Canada", "Shell", "Esso", "Canadian Tire Gas+", "Husky", "Co-op"])
        name = f"{chain} - {city_name}"
        amenities = ["RV Lanes", "Diesel", "Air"]
        if random.random() > 0.4:
            amenities.append("DEF Fluid")
        if random.random() > 0.5:
            amenities.append("Convenience Store")
        desc = f"{chain} fuel station in {city_name}, {prov_name}. RV-accessible diesel lanes. " + random.choice([
            "Open 24/7. Easy access from highway.",
            "Wide lanes for big rigs. Propane exchange available.",
            "Clean facility with convenience store. DEF fluid available at pump.",
        ])
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "fuel_station", rating: {round(random.uniform(3.3, 4.2), 1)}, reviewCount: {random.randint(30, 200)}, pricePerNight: 0, amenities: {json.dumps(amenities)}, description: "{desc}", discounts: [] }}')
        current_id += 1

    # === PROPANE (1-2 per province) ===
    num_propane = 2 if prov_code in ["AB", "BC", "ON", "QC"] else 1
    for i in range(num_propane):
        city_name, lat, lon = cities[(i + 4) % len(cities)]
        lat += random.uniform(-0.01, 0.01)
        lon += random.uniform(-0.01, 0.01)
        site_id = str(current_id)
        name = f"Propane Refill - {city_name}"
        desc = f"Propane refill station in {city_name}, {prov_name}. Refill and exchange available. " + random.choice([
            "Certified technician on site.",
            "Open Monday-Saturday. Quick service.",
            "Located near major highway for easy access.",
        ])
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "propane", rating: {round(random.uniform(3.0, 4.0), 1)}, reviewCount: {random.randint(15, 80)}, pricePerNight: 0, amenities: ["Certified Tech", "Exchange", "Refill"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === RV REPAIR (1-2 per province) ===
    num_repair = 2 if prov_code in ["AB", "BC", "ON", "QC"] else 1
    for i in range(num_repair):
        city_name, lat, lon = cities[(i + 5) % len(cities)]
        lat += random.uniform(-0.01, 0.01)
        lon += random.uniform(-0.01, 0.01)
        site_id = str(current_id)
        name = random.choice([
            f"Canadian RV Service - {city_name}",
            f"{city_name} RV Repair & Parts",
            f"Northern RV Service Centre - {city_name}",
            f"All-Season RV Repair - {city_name}",
        ])
        desc = f"Full-service RV repair shop in {city_name}, {prov_name}. " + random.choice([
            "Mobile service available. All makes and models. Warranty work accepted.",
            "Emergency repairs, maintenance, and winterization services. Certified technicians.",
            "Specializing in RV electrical, plumbing, and appliance repair. Parts in stock.",
        ])
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "rv_repair", rating: {round(random.uniform(3.5, 4.7), 1)}, reviewCount: {random.randint(20, 150)}, pricePerNight: 0, amenities: ["Mobile Service", "Parts", "All Makes"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === WATER FILL (1-2 per province) ===
    for i in range(1 if prov_code in ["NT", "NU", "YT", "PE"] else 2):
        city_name, lat, lon = cities[(i + 6) % len(cities)]
        lat += random.uniform(-0.01, 0.01)
        lon += random.uniform(-0.01, 0.01)
        site_id = str(current_id)
        name = f"Water Fill Station - {city_name}"
        desc = f"Potable water fill station in {city_name}, {prov_name}. " + random.choice([
            "Self-service. Bring your own hose. Open seasonally.",
            "Municipal water supply. Free for all RVers. Open May-October.",
            "Located at the municipal campground. Available 24/7 during season.",
        ])
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "water_fill", rating: {round(random.uniform(3.2, 4.0), 1)}, reviewCount: {random.randint(10, 60)}, pricePerNight: 0, amenities: ["Potable Water", "Self-Service"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === LAUNDROMAT (1-2 per province) ===
    for i in range(1 if prov_code in ["NT", "NU", "YT"] else 2):
        city_name, lat, lon = cities[(i + 7) % len(cities)]
        lat += random.uniform(-0.01, 0.01)
        lon += random.uniform(-0.01, 0.01)
        site_id = str(current_id)
        name = f"Coin Laundry - {city_name}"
        desc = f"Self-service laundromat in {city_name}, {prov_name}. " + random.choice([
            "Large capacity washers and dryers suitable for RV bedding. Open 7am-10pm daily.",
            "Clean facility with WiFi while you wait. RV parking available in adjacent lot.",
            "Commercial-size machines. Detergent vending on site. Open daily.",
        ])
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "laundromat", rating: {round(random.uniform(3.3, 4.2), 1)}, reviewCount: {random.randint(15, 80)}, pricePerNight: 0, amenities: ["Large Washers", "Dryers", "WiFi"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === RV WASH (1 per larger province) ===
    if prov_code in ["AB", "BC", "ON", "QC", "MB", "SK"]:
        city_name, lat, lon = cities[0]
        lat += random.uniform(-0.02, 0.02)
        lon += random.uniform(-0.02, 0.02)
        site_id = str(current_id)
        name = f"RV Wash Station - {city_name}"
        desc = f"RV wash facility in {city_name}, {prov_name}. Large bays accommodate rigs up to 45ft. " + random.choice([
            "Self-service and full-service options. Underbody wash available.",
            "Pressure wash, hand wash, and wax services. Open year-round.",
        ])
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "rv_wash", rating: {round(random.uniform(3.5, 4.3), 1)}, reviewCount: {random.randint(20, 100)}, pricePerNight: 0, amenities: ["Self-Service", "Full-Service", "Underbody Wash"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === ATTRACTIONS (1-2 per province) ===
    attractions_map = {
        "AB": [("Royal Tyrrell Museum", 51.4611, -112.7867, "Drumheller", "World-class dinosaur museum in the heart of the Canadian Badlands. RV parking available."),
               ("Columbia Icefield", 52.2167, -117.2333, "Jasper", "Walk on the Athabasca Glacier. RV parking at the Icefield Centre. Stunning scenery.")],
        "BC": [("Butchart Gardens", 48.5635, -123.4706, "Victoria", "World-famous gardens on Vancouver Island. RV parking available. Open year-round."),
               ("Capilano Suspension Bridge", 49.3429, -123.1149, "North Vancouver", "Walk 230 feet above the Capilano River. RV parking nearby.")],
        "ON": [("Niagara Falls", 43.0896, -79.0849, "Niagara Falls", "One of the world's most famous waterfalls. Multiple RV parks nearby. Must-see destination."),
               ("CN Tower", 43.6426, -79.3871, "Toronto", "Iconic Toronto landmark with glass floor and revolving restaurant. RV parking at nearby lots.")],
        "QC": [("Old Quebec City", 46.8139, -71.2080, "Quebec City", "UNESCO World Heritage Site. Cobblestone streets and historic architecture. RV parking outside the walls."),
               ("Mont-Tremblant Village", 46.2094, -74.5850, "Mont-Tremblant", "Charming pedestrian village at the base of Mont-Tremblant ski resort. RV-friendly parking.")],
        "MB": [("The Forks", 49.8868, -97.1309, "Winnipeg", "Historic meeting place at the junction of the Red and Assiniboine Rivers. Markets, restaurants, and trails.")],
        "SK": [("RCMP Heritage Centre", 50.4452, -104.6189, "Regina", "Interactive museum celebrating the Royal Canadian Mounted Police. RV parking available.")],
        "NB": [("Hopewell Rocks", 45.8167, -64.5667, "Hopewell Cape", "Walk on the ocean floor among flowerpot rocks at low tide. RV parking available.")],
        "NS": [("Peggy's Cove", 44.4917, -63.9183, "Halifax", "Iconic lighthouse on granite rocks. One of Canada's most photographed spots. Limited RV parking.")],
        "NL": [("Signal Hill", 47.5706, -52.6814, "St. John's", "Historic site where Marconi received the first transatlantic wireless signal. Stunning harbour views.")],
        "PE": [("Green Gables Heritage Place", 46.4917, -63.3833, "Cavendish", "Home of Anne of Green Gables. Beautiful heritage site with gardens and trails. RV parking.")],
        "NT": [("Great Slave Lake", 62.4540, -114.3718, "Yellowknife", "One of the deepest lakes in North America. Aurora viewing in winter. Houseboats and fishing.")],
        "NU": [("Inuit Heritage Centre", 63.7467, -68.5170, "Iqaluit", "Learn about Inuit culture and Arctic life. Small but fascinating museum.")],
        "YT": [("Dawson City Historic District", 64.0653, -139.4188, "Dawson City", "Gold Rush era buildings and Diamond Tooth Gerties gambling hall. RV parking available.")],
    }
    for attr_name, lat, lon, city, desc in attractions_map.get(prov_code, []):
        site_id = str(current_id)
        sites.append(f'  {{ id: "{site_id}", name: "{attr_name}", latitude: {lat}, longitude: {lon}, state: "{prov_code}", city: "{city}", category: "attraction", rating: {round(random.uniform(4.2, 4.9), 1)}, reviewCount: {random.randint(200, 2000)}, pricePerNight: null, amenities: ["RV Parking", "Restrooms"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === SCENIC VIEWS (1-2 per province) ===
    scenic_map = {
        "AB": [("Moraine Lake Viewpoint", 51.3217, -116.1860, "Lake Louise", "Stunning turquoise lake surrounded by the Valley of the Ten Peaks. One of Canada's most iconic views.")],
        "BC": [("Sea-to-Sky Highway Viewpoint", 49.6841, -123.1560, "Squamish", "Breathtaking views of Howe Sound along the Sea-to-Sky Highway. Multiple pullouts for RVs.")],
        "ON": [("Algonquin Lookout Trail", 45.5872, -78.3753, "Whitney", "Panoramic views of the Algonquin Park forest canopy. Spectacular fall colours in October.")],
        "QC": [("Percé Rock Viewpoint", 48.5233, -64.2133, "Percé", "Iconic natural arch rock formation in the Gulf of St. Lawrence. Whale watching nearby.")],
        "NB": [("Fundy Trail Parkway", 45.4167, -65.5000, "St. Martins", "Scenic coastal drive with dramatic Bay of Fundy views. Multiple lookout points.")],
        "NS": [("Cabot Trail Lookoff", 46.7333, -60.7500, "Ingonish", "One of the world's most scenic drives. Dramatic coastal and mountain views.")],
        "NL": [("Western Brook Pond", 49.7833, -57.8500, "Rocky Harbour", "Fjord-like pond in Gros Morne National Park. Boat tours available.")],
        "MB": [("Spirit Sands", 49.6667, -99.2833, "Carberry", "Unique desert landscape in the middle of the prairies. Surreal and beautiful.")],
        "SK": [("Grasslands Dark Sky Preserve", 49.1833, -107.4167, "Val Marie", "One of the darkest skies in Canada. Incredible stargazing. Milky Way visible to naked eye.")],
        "YT": [("Emerald Lake Viewpoint", 60.5833, -134.6833, "Whitehorse", "Stunning emerald-coloured lake along the Alaska Highway. Easy pullout for RVs.")],
    }
    for sc_name, lat, lon, city, desc in scenic_map.get(prov_code, []):
        site_id = str(current_id)
        sites.append(f'  {{ id: "{site_id}", name: "{sc_name}", latitude: {lat}, longitude: {lon}, state: "{prov_code}", city: "{city}", category: "scenic_view", rating: {round(random.uniform(4.3, 4.9), 1)}, reviewCount: {random.randint(100, 1500)}, pricePerNight: null, amenities: ["Parking", "Viewpoint"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === RESTAURANTS (1-2 per province) ===
    restaurant_map = {
        "AB": [("Grizzly House - Banff", 51.1784, -115.5708, "Banff", "Iconic fondue restaurant in downtown Banff. Unique dining experience since 1967. Reservations recommended.")],
        "BC": [("Salmon House on the Hill", 49.3429, -123.1149, "West Vancouver", "Pacific Northwest cuisine with stunning views of Vancouver. Known for alder-grilled salmon.")],
        "ON": [("BeaverTails - Ottawa", 45.4215, -75.6972, "Ottawa", "Famous Canadian pastry shop on the Rideau Canal. A must-try Canadian treat.")],
        "QC": [("Schwartz's Deli", 45.5180, -73.5770, "Montreal", "Montreal's famous smoked meat deli since 1928. Always a line but worth the wait.")],
        "NB": [("Shediac Lobster Shack", 46.2194, -64.5389, "Shediac", "Fresh lobster in the Lobster Capital of the World. Outdoor seating with harbour views.")],
        "NS": [("The Bicycle Thief", 44.6488, -63.5752, "Halifax", "Italian-inspired waterfront restaurant on the Halifax boardwalk. Excellent seafood.")],
        "NL": [("Mallard Cottage", 47.5615, -52.7126, "St. John's", "Award-winning restaurant in a historic cottage. Farm-to-table Newfoundland cuisine.")],
        "PE": [("Lobster on the Wharf", 46.2382, -63.1311, "Charlottetown", "Fresh PEI lobster right on the Charlottetown waterfront. Casual dining.")],
    }
    for rest_name, lat, lon, city, desc in restaurant_map.get(prov_code, []):
        site_id = str(current_id)
        sites.append(f'  {{ id: "{site_id}", name: "{rest_name}", latitude: {lat}, longitude: {lon}, state: "{prov_code}", city: "{city}", category: "restaurant", rating: {round(random.uniform(4.0, 4.8), 1)}, reviewCount: {random.randint(100, 1000)}, pricePerNight: null, amenities: ["Dining", "Parking"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === HISTORIC SITES (1 per province) ===
    historic_map = {
        "AB": ("Head-Smashed-In Buffalo Jump", 49.7500, -113.6167, "Fort Macleod", "UNESCO World Heritage Site. 6,000-year-old buffalo hunting ground. Interpretive centre and trails."),
        "BC": ("Fort Langley National Historic Site", 49.1722, -122.5764, "Fort Langley", "Birthplace of British Columbia. Restored Hudson's Bay Company fur trading post."),
        "ON": ("Fort Henry National Historic Site", 44.2312, -76.4860, "Kingston", "Restored British military fortification from the 1830s. Sunset ceremonies in summer."),
        "QC": ("Plains of Abraham", 46.8000, -71.2167, "Quebec City", "Historic battlefield where the British defeated the French in 1759. Beautiful urban park."),
        "NB": ("Kings Landing Historical Settlement", 45.9636, -66.6431, "Fredericton", "Living history village depicting 19th-century New Brunswick life. Costumed interpreters."),
        "NS": ("Halifax Citadel National Historic Site", 44.6488, -63.5752, "Halifax", "Star-shaped fortress overlooking Halifax Harbour. Noon cannon firing daily."),
        "NL": ("L'Anse aux Meadows", 51.5833, -55.5333, "St. Lunaire-Griquet", "UNESCO World Heritage Site. Only confirmed Viking settlement in North America."),
        "PE": ("Province House National Historic Site", 46.2382, -63.1311, "Charlottetown", "Birthplace of Canadian Confederation. Where the Fathers of Confederation met in 1864."),
        "MB": ("Lower Fort Garry National Historic Site", 50.1436, -96.8839, "Selkirk", "Oldest intact stone fur trade post in North America. Costumed interpreters."),
        "SK": ("Batoche National Historic Site", 52.7500, -106.1000, "Batoche", "Site of the 1885 Northwest Resistance. Important Métis heritage site."),
        "YT": ("Dawson City Historic Complex", 64.0653, -139.4188, "Dawson City", "Klondike Gold Rush era buildings. Diamond Tooth Gerties, the oldest gambling hall in Canada."),
    }
    if prov_code in historic_map:
        h_name, lat, lon, city, desc = historic_map[prov_code]
        site_id = str(current_id)
        sites.append(f'  {{ id: "{site_id}", name: "{h_name}", latitude: {lat}, longitude: {lon}, state: "{prov_code}", city: "{city}", category: "historic_site", rating: {round(random.uniform(4.2, 4.8), 1)}, reviewCount: {random.randint(150, 1200)}, pricePerNight: null, amenities: ["RV Parking", "Restrooms", "Gift Shop"], description: "{desc}", discounts: [] }}')
        current_id += 1

    # === WALMART (1-2 per province, not in territories) ===
    if prov_code not in ["NT", "NU", "YT"]:
        num_walmart = 2 if prov_code in ["AB", "BC", "ON", "QC"] else 1
        for i in range(num_walmart):
            city_name, lat, lon = cities[i]
            lat += random.uniform(-0.01, 0.01)
            lon += random.uniform(-0.01, 0.01)
            site_id = str(current_id)
            name = f"Walmart Supercenter - {city_name}"
            desc = f"Walmart Supercenter in {city_name}, {prov_name}. Overnight parking may be available - always check with store management first. Not all Canadian Walmarts allow overnight parking."
            sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "walmart", rating: {round(random.uniform(2.8, 3.5), 1)}, reviewCount: {random.randint(30, 150)}, pricePerNight: null, amenities: ["Parking", "Restrooms", "Shopping"], description: "{desc}", discounts: [], overnightPolicy: "Check with store management. Varies by location." }}')
            current_id += 1

    # === CANADIAN TIRE (1 per province as rest area equivalent) ===
    if prov_code not in ["NT", "NU"]:
        city_name, lat, lon = cities[2 % len(cities)]
        lat += random.uniform(-0.01, 0.01)
        lon += random.uniform(-0.01, 0.01)
        site_id = str(current_id)
        name = f"Canadian Tire - {city_name}"
        desc = f"Canadian Tire store in {city_name}, {prov_name}. RV supplies, automotive parts, and camping gear. Large parking lot."
        sites.append(f'  {{ id: "{site_id}", name: "{name}", latitude: {round(lat, 4)}, longitude: {round(lon, 4)}, state: "{prov_code}", city: "{city_name}", category: "rv_supply_store", rating: {round(random.uniform(3.5, 4.2), 1)}, reviewCount: {random.randint(30, 120)}, pricePerNight: null, amenities: ["RV Supplies", "Automotive Parts", "Camping Gear"], description: "{desc}", discounts: [] }}')
        current_id += 1

# Write output
output_lines = "\n".join(sites)
with open("/home/ubuntu/rv-nomad/scripts/canada-expansion.txt", "w") as f:
    f.write(output_lines)

print(f"Generated {len(sites)} new Canadian sites (IDs {START_ID} to {current_id - 1})")

# Count by province
from collections import Counter
prov_counts = Counter()
cat_counts = Counter()
for s in sites:
    import re
    m = re.search(r'state: "(\w+)"', s)
    c = re.search(r'category: "(\w+)"', s)
    if m:
        prov_counts[m.group(1)] += 1
    if c:
        cat_counts[c.group(1)] += 1

print("\nBy province:")
for p in sorted(prov_counts.keys()):
    print(f"  {p}: {prov_counts[p]}")

print("\nBy category:")
for c, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f"  {c}: {count}")
