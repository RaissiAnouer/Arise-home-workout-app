import json
import csv
import re

def norm(s):
    return re.sub(r'[^a-z0-9]', '', (s or "").lower())

# Load 873 items from free-exercise-db
with open("scripts/exercises_source.json", "r", encoding="utf-8") as f:
    free_db = json.load(f)

# Load 395 StrengthLog exercises
with open("C:/Users/raiss/strengthlog_exercises.csv", "r", encoding="utf-8") as f:
    strengthlog = list(csv.DictReader(f))

exact_matched = []
unmatched = []

for r in strengthlog:
    name = r["Exercise Name"].strip()
    norm_name = norm(name)
    
    found_item = None
    for item in free_db:
        item_name = item.get("name", "")
        norm_item = norm(item_name)
        if norm_item == norm_name:
            found_item = item
            break

    if not found_item:
        for item in free_db:
            item_name = item.get("name", "")
            norm_item = norm(item_name)
            if (len(norm_name) > 4 and norm_item in norm_name) or (len(norm_item) > 4 and norm_name in norm_item):
                found_item = item
                break

    if found_item:
        raw_id = found_item.get("id", "").replace(" ", "_")
        img_url = f"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{raw_id}/0.jpg"
        exact_matched.append((name, found_item['name'], img_url))
    else:
        unmatched.append(name)

print("=" * 60)
print(f"EXACT FREE-EXERCISE-DB MATCHED: {len(exact_matched)} / {len(strengthlog)}")
print(f"UNMATCHED: {len(unmatched)}")
print("=" * 60)
print("\nSample Exact Matches:")
for m in exact_matched[:15]:
    print(f"  - StrengthLog: '{m[0]}' === FreeDB Exact: '{m[1]}'")
    print(f"    URL: {m[2]}")

if unmatched:
    print("\nSample Unmatched:")
    for u in unmatched[:10]:
        print(f"  - {u}")
