#!/usr/bin/env python3
"""Add copyright header to all TypeScript/TSX source files."""
import os
import glob

COPYRIGHT = """/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
"""

# Find all .ts and .tsx files in app/, lib/, components/, hooks/
patterns = [
    "app/**/*.tsx",
    "app/**/*.ts",
    "lib/**/*.tsx",
    "lib/**/*.ts",
    "components/**/*.tsx",
    "components/**/*.ts",
    "hooks/**/*.tsx",
    "hooks/**/*.ts",
]

root = "/home/ubuntu/rv-nomad"
files_updated = 0

for pattern in patterns:
    for filepath in glob.glob(os.path.join(root, pattern), recursive=True):
        with open(filepath, "r") as f:
            content = f.read()
        
        # Skip if already has copyright
        if "Kieran Woll Creative Works LLC" in content:
            continue
        
        # Add copyright at the top
        with open(filepath, "w") as f:
            f.write(COPYRIGHT + content)
        
        files_updated += 1
        print(f"  Added copyright: {os.path.relpath(filepath, root)}")

print(f"\nDone! Updated {files_updated} files.")
