"""
Full pricing audit across all categories, US and Canada.
Reports which categories have suspicious pricing (free when shouldn't be, too cheap, etc.)
"""
import re

CA_CODES = {'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'}

with open('lib/all-sites-data.ts', 'r') as f:
    content = f.read()

# Parse all sites
pattern = r'\{ id: "(\d+)", name: "(.*?)", latitude: [\d.-]+, longitude: [\d.-]+, state: "(\w+)", city: ".*?", category: "(\w+)", rating: [\d.]+, reviewCount: \d+, pricePerNight: (\d+|null)'
matches = re.findall(pattern, content)

print(f"Total sites parsed: {len(matches)}\n")

# Group by category and country
from collections import defaultdict
data = defaultdict(lambda: {"US": [], "CA": []})

for site_id, name, state, category, price in matches:
    country = "CA" if state in CA_CODES else "US"
    price_val = None if price == "null" else int(price)
    data[category][country].append({
        "id": site_id,
        "name": name,
        "state": state,
        "price": price_val,
    })

# Define what pricing SHOULD look like per category
# "free" = should be free/null, "paid" = should have a price, "mixed" = some free some paid
EXPECTED_PRICING = {
    # Camping - should have nightly rates
    "rv_park": "paid",          # $25-80/night
    "national_park": "paid",    # $15-40/night
    "state_park": "paid",       # $15-45/night
    "provincial_park": "paid",  # $15-45/night (Canada)
    "military": "paid",         # $15-35/night
    "harvest_host": "free",     # Free (membership required)
    
    # Free overnight parking
    "boondocking": "free",      # Free
    "blm": "free",              # Free
    "national_forest": "free",  # Free
    "walmart": "free",          # Free
    "cracker_barrel": "free",   # Free
    "rest_area": "free",        # Free
    "casino_parking": "free",   # Free
    "cabelas_bass_pro": "free", # Free
    "elks_moose": "free",       # Free (membership)
    
    # Services - should have service prices (not "per night")
    "rv_wash": "paid",          # $25-75
    "rv_repair": "paid",        # varies, but not free
    "rv_tires": "paid",         # varies
    "laundromat": "paid",       # $5-15
    "propane": "paid",          # $15-30 per fill
    
    # Free services
    "dump_station": "mixed",    # Some free, some $5-15
    "water_fill": "mixed",      # Some free, some $5-10
    "fuel_station": "free",     # Free to use (you pay for fuel)
    "truck_stop": "free",       # Free to stop (pay for fuel/showers)
    "weight_scale": "mixed",    # Some free, some $10-15
    
    # POI - free to visit (or varies)
    "attraction": "mixed",
    "scenic_view": "free",
    "restaurant": "free",       # Free to visit
    "roadside_oddity": "free",
    "historic_site": "mixed",
    "visitor_center": "free",
    
    # Info/Safety - no price
    "low_clearance": "free",
    "weigh_station": "free",
    "road_condition": "free",
    "cell_coverage": "free",
    "free_wifi": "free",
    
    # Supplies
    "rv_grocery": "free",       # Free to visit
    "rv_supply_store": "free",  # Free to visit
    "outdoor_store": "free",    # Free to visit
    "rv_dealer": "free",        # Free to visit
    "grocery": "free",          # Free to visit
}

print("=" * 100)
print(f"{'CATEGORY':<25} {'COUNTRY':<8} {'COUNT':<6} {'FREE/NULL':<10} {'$0':<6} {'PAID':<6} {'PRICE RANGE':<20} {'EXPECTED':<10} {'ISSUES'}")
print("=" * 100)

issues = []

for cat in sorted(data.keys()):
    expected = EXPECTED_PRICING.get(cat, "unknown")
    for country in ["US", "CA"]:
        sites = data[cat][country]
        if not sites:
            continue
        
        free_null = [s for s in sites if s["price"] is None]
        zero = [s for s in sites if s["price"] == 0]
        paid = [s for s in sites if s["price"] is not None and s["price"] > 0]
        
        prices = [s["price"] for s in paid]
        price_range = f"${min(prices)}-${max(prices)}" if prices else "N/A"
        
        # Detect issues
        issue_list = []
        if expected == "paid":
            bad = free_null + zero
            if bad:
                issue_list.append(f"{len(bad)} should have price")
                for s in bad:
                    issues.append((cat, country, s["id"], s["name"], s["state"], s["price"], "Should be paid"))
        elif expected == "free":
            if paid:
                issue_list.append(f"{len(paid)} should be free")
                for s in paid:
                    issues.append((cat, country, s["id"], s["name"], s["state"], s["price"], "Should be free/null"))
        
        issue_str = "; ".join(issue_list) if issue_list else "OK"
        flag = "***" if issue_list else ""
        
        print(f"{cat:<25} {country:<8} {len(sites):<6} {len(free_null):<10} {len(zero):<6} {len(paid):<6} {price_range:<20} {expected:<10} {issue_str} {flag}")

print("\n" + "=" * 100)
print(f"\nTOTAL ISSUES FOUND: {len(issues)}")
print("=" * 100)

if issues:
    print(f"\n{'CAT':<20} {'CC':<4} {'ID':<6} {'NAME':<50} {'ST':<4} {'PRICE':<8} {'ISSUE'}")
    print("-" * 100)
    for cat, country, sid, name, state, price, issue in sorted(issues):
        print(f"{cat:<20} {country:<4} {sid:<6} {name[:48]:<50} {state:<4} {str(price):<8} {issue}")
