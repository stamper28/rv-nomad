"""
Trim all-sites-data.ts to fit within Metro bundler memory limits.
Strategy:
1. Keep all 18K entries (no reduction in count)
2. Strip reviews from generated entries (id starting with 'x')
3. Keep reviews only on original entries (id 1-3568)
4. This should reduce from 25MB to ~16MB
5. If still too big, also trim descriptions on generated entries
"""
import re
import sys

INPUT = "lib/all-sites-data.ts"
OUTPUT = "lib/all-sites-data.ts"

with open(INPUT, "r") as f:
    content = f.read()

original_size = len(content)
print(f"Original size: {original_size:,} bytes")

# Strategy: For entries with id starting with "x", replace their reviews array with empty
# Pattern: id: "x...", ... reviews: [{ ... }]  →  id: "x...", ... reviews: []

# We need to be careful with nested brackets. Let's do it entry by entry.
# Each entry is a { ... } block in the array.

# Find the array start
array_start = content.find("export const ALL_SITES")
header = content[:array_start]

# Find the actual array content
bracket_start = content.find("[", array_start)

# Parse entries by tracking brace depth
entries = []
i = bracket_start + 1
depth = 0
entry_start = -1
count = 0

while i < len(content):
    ch = content[i]
    if ch == '{' and depth == 0:
        entry_start = i
        depth = 1
    elif ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0 and entry_start >= 0:
            entry_text = content[entry_start:i+1]
            entries.append(entry_text)
            entry_start = -1
            count += 1
    i += 1

print(f"Found {count} entries")

# Now process entries
trimmed_entries = []
trimmed_count = 0

for entry in entries:
    # Check if this is a generated entry (id starts with "x")
    id_match = re.search(r'id: "([^"]+)"', entry)
    if id_match:
        entry_id = id_match.group(1)
        is_generated = entry_id.startswith("x")
    else:
        is_generated = False
    
    if is_generated:
        # Strip reviews from generated entries
        # Replace reviews: [{ ... }] with reviews: []
        # Need to handle nested brackets in review objects
        rev_start = entry.find("reviews: [")
        if rev_start >= 0:
            # Find the matching closing bracket
            bracket_pos = rev_start + len("reviews: [")
            depth = 1
            j = bracket_pos
            while j < len(entry) and depth > 0:
                if entry[j] == '[':
                    depth += 1
                elif entry[j] == ']':
                    depth -= 1
                j += 1
            # Replace
            old_reviews = entry[rev_start:j]
            entry = entry[:rev_start] + "reviews: []" + entry[j:]
            trimmed_count += 1
    
    trimmed_entries.append(entry)

print(f"Trimmed reviews from {trimmed_count} generated entries")

# Rebuild the file
import_section = header
result = import_section + f"export const ALL_SITES: CampSite[] = [\n"
result += ",\n".join(trimmed_entries)
result += "\n];\n"

print(f"New size: {len(result):,} bytes")
print(f"Reduction: {original_size - len(result):,} bytes ({(original_size - len(result)) / original_size * 100:.1f}%)")

with open(OUTPUT, "w") as f:
    f.write(result)

print("Done!")
