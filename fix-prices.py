import re
import random

random.seed(42)  # Reproducible

with open('lib/all-sites-data.ts', 'r') as f:
    content = f.read()

# We'll process line by line to fix prices based on category
lines = content.split('\n')
fixed_count = 0

def get_price_for_category(cat, current_price):
    """Return a realistic price for the given category."""
    if cat == 'state_park':
        return random.choice([30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55])
    elif cat == 'national_park':
        return random.choice([25, 28, 30, 32, 35, 38, 40, 42, 45])
    elif cat == 'rv_park':
        if current_price and current_price >= 50:
            return current_price  # Already in range
        return random.choice([50, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 85])
    elif cat == 'provincial_park':
        return random.choice([30, 32, 35, 38, 40, 42, 45, 48, 50])
    elif cat == 'military':
        return random.choice([15, 18, 20, 22, 25, 28, 30])
    elif cat in ('blm', 'national_forest'):
        # BLM: $0-15, national forest: $0-15
        return random.choice([0, 0, 0, 5, 8, 10, 12, 15])
    elif cat in ('boondocking',):
        return 0
    elif cat in ('harvest_host',):
        return None  # Free with membership
    elif cat in ('walmart', 'cracker_barrel', 'cabelas_bass_pro', 'casino_parking', 'rest_area', 'truck_stop', 'elks_moose'):
        return None  # Free overnight
    elif cat in ('attraction',):
        if current_price and current_price > 0:
            return current_price
        return None
    elif cat in ('historic_site',):
        if current_price and current_price > 0:
            return current_price
        return None
    else:
        return current_price  # Keep as-is for services

new_lines = []
for line in lines:
    # Check if this line has both category and pricePerNight
    cat_match = re.search(r'category:\s*"([^"]+)"', line)
    price_match = re.search(r'pricePerNight:\s*(null|\d+)', line)
    
    if cat_match and price_match:
        cat = cat_match.group(1)
        current_str = price_match.group(1)
        current_price = int(current_str) if current_str != 'null' else None
        
        new_price = get_price_for_category(cat, current_price)
        
        if new_price != current_price:
            if new_price is None:
                new_val = 'null'
            elif new_price == 0:
                new_val = '0'
            else:
                new_val = str(new_price)
            
            old_val = current_str
            line = line.replace(f'pricePerNight: {old_val}', f'pricePerNight: {new_val}', 1)
            fixed_count += 1
    
    new_lines.append(line)

with open('lib/all-sites-data.ts', 'w') as f:
    f.write('\n'.join(new_lines))

print(f"Fixed {fixed_count} prices")
