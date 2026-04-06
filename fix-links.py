"""
Replace Linking.openURL with openUrl from lib/open-url.ts across all app files.
Keep Linking for tel: and mailto: since openUrl handles those too.
"""
import re
import os

files = [
    "app/(tabs)/index.tsx",
    "app/(tabs)/profile.tsx",
    "app/discounts.tsx",
    "app/rv-gear.tsx",
    "app/rv-recalls.tsx",
    "app/site-detail.tsx",
    "app/track-chairs.tsx",
]

base = "/home/ubuntu/rv-nomad"

for f in files:
    path = os.path.join(base, f)
    if not os.path.exists(path):
        print(f"SKIP (not found): {f}")
        continue
    
    with open(path, "r") as fh:
        content = fh.read()
    
    original = content
    
    # Add import for openUrl if not already present
    if 'from "@/lib/open-url"' not in content and "from '@/lib/open-url'" not in content:
        # Find the last import line
        lines = content.split("\n")
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.startswith("import ") or line.startswith("} from "):
                last_import_idx = i
        
        lines.insert(last_import_idx + 1, 'import { openUrl } from "@/lib/open-url";')
        content = "\n".join(lines)
    
    # Replace Linking.openURL(url) with openUrl(url)
    # Handle various patterns:
    
    # Pattern 1: Linking.openURL(something)
    content = re.sub(r'Linking\.openURL\(', 'openUrl(', content)
    
    # Remove .catch(() => {}) after openUrl since it returns Promise<void> and has internal error handling
    content = re.sub(r'openUrl\(([^)]+)\)\.catch\(\(\) => \{\}\)', r'openUrl(\1)', content)
    
    # Remove unused Linking import if it's only used for openURL (keep if tel: or other uses exist)
    # Check if Linking is still used for anything else
    if "Linking." not in content.replace("openUrl(", ""):
        # Check if Linking is used in the import for something else
        pass  # Keep the import since we might still need Linking type
    
    if content != original:
        with open(path, "w") as fh:
            fh.write(content)
        print(f"UPDATED: {f}")
    else:
        print(f"NO CHANGE: {f}")
