import re
import os

DB_PATH = os.path.join("src", "data", "exercises", "database.ts")
with open(DB_PATH, "r", encoding="utf-8") as f:
    text = f.read()

entries = text.split('id: "')[1:]
total = len(entries)
with_sec = 0
examples = []

for e in entries:
    name_m = re.search(r'name:\s*"([^"]+)"', e)
    primary_m = re.search(r'primaryMuscle:\s*"([^"]+)"', e)
    sec_m = re.search(r'secondaryMuscles:\s*\[([^\]]*)\]', e)
    if name_m and primary_m and sec_m:
        sec_muscles = [m.strip('" ') for m in sec_m.group(1).split(",") if m.strip('" ')]
        if len(sec_muscles) > 0:
            with_sec += 1
            if len(examples) < 8:
                examples.append((name_m.group(1), primary_m.group(1), sec_muscles))

print(f"Total exercises: {total}")
print(f"Exercises with secondary muscles: {with_sec} ({round(with_sec / total * 100, 1)}%)")
print("\nSample Exercises with Primary & Secondary Muscles:")
for name, prim, secs in examples:
    print(f" • {name}\n   - Primary: {prim}\n   - Secondary: {', '.join(secs)}\n")
