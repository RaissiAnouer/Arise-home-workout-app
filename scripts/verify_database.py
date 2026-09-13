import urllib.request
import re
import random
import os

DB_PATH = os.path.join("src", "data", "exercises", "database.ts")
PLANS_PATH = os.path.join("src", "data", "plans", "structuredPlans.ts")

with open(DB_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Check all gifUrls
urls = re.findall(r'gifUrl:\s*"([^"]+)"', text)
print(f"[1/4] Total exercises with gifUrl: {len(urls)} / 1323")

# 2. Check thumbnailUrls
thumbnails = re.findall(r'thumbnailUrl:\s*"([^"]+)"', text)
print(f"[2/4] Total exercises with thumbnailUrl: {len(thumbnails)} / 1323")

# 3. Check instructions
instructions_matches = re.findall(r'instructions:\s*\[([^\]]*)\]', text)
print(f"[3/4] Exercises with instructions: {len(instructions_matches)} / 1323")

# 4. Check plans IDs validity
with open(PLANS_PATH, "r", encoding="utf-8") as f:
    plans_text = f.read()

plan_exercise_ids = set(re.findall(r"exerciseId:\s*'([^']+)'", plans_text))
missing_ids = [eid for eid in plan_exercise_ids if f'"{eid}": {{' not in text]
print(f"[4/4] Plan exercise IDs validity: {len(plan_exercise_ids)} total IDs used, {len(missing_ids)} missing in DB")
if missing_ids:
    print(f"      Missing IDs: {missing_ids}")

# 5. Live sample check on GIF URLs
print("\n[Testing Live URLs] Fetching 20 random GIF URLs from CDN...")
sample = random.sample(urls, 20)
success = 0
for i, url in enumerate(sample, 1):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}, method="HEAD")
        with urllib.request.urlopen(req, timeout=5) as res:
            if res.status == 200:
                success += 1
                content_type = res.headers.get("Content-Type", "")
                content_length = res.headers.get("Content-Length", "unknown")
                print(f"  [{i}/20] OK (200) | {content_type} | {content_length} bytes | {url.split('/')[-1]}")
    except Exception as e:
        print(f"  [{i}/20] FAILED: {url} -> {e}")

print(f"\nResult: {success}/20 sample GIFs verified online and functional.")
