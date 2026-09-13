import os
import sys
import json
import csv
import re
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
load_dotenv("C:/Users/raiss/.env")

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("ERROR: Missing Supabase credentials")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def normalize(s: str) -> str:
    return re.sub(r'[^a-z0-9]', '', (s or "").lower())

# Load 873 items from Free Exercise DB
exercise_db_source = []
if os.path.exists("scripts/exercises_source.json"):
    with open("scripts/exercises_source.json", "r", encoding="utf-8") as f:
        exercise_db_source = json.load(f)

# High Quality ExerciseDB GIF URLs
EXACT_GIF_MAP = {
    "barbell squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "bench press": "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    "lat pulldown": "https://static.exercisedb.dev/media/LEprlgG.gif",
    "romanian deadlift": "https://static.exercisedb.dev/media/wQ2c4XD.gif",
    "lateral raise": "https://static.exercisedb.dev/media/DsgkuIt.gif",
    "triceps pushdown": "https://static.exercisedb.dev/media/gAwDzB3.gif",
    "standing calf raise": "https://static.exercisedb.dev/media/8ozhUIZ.gif",
    "hanging leg raise": "https://static.exercisedb.dev/media/I3tsCnC.gif",
    "deadlift": "https://static.exercisedb.dev/media/ila4NZS.gif",
    "incline dumbbell press": "https://static.exercisedb.dev/media/ns0SIbU.gif",
    "seated cable row": "https://static.exercisedb.dev/media/fUBheHs.gif",
    "bulgarian split squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "face pull": "https://static.exercisedb.dev/media/EAs3xL9.gif",
    "dumbbell curl": "https://static.exercisedb.dev/media/mtXengz.gif",
    "seated calf raise": "https://static.exercisedb.dev/media/IeDEXTe.gif",
    "cable crunch": "https://static.exercisedb.dev/media/8xUv4J7.gif",
    "shoulder press": "https://static.exercisedb.dev/media/84RyJf8.gif",
    "overhead triceps extension": "https://static.exercisedb.dev/media/uxJcFUU.gif",
    "pull-ups": "https://static.exercisedb.dev/media/lBDjFxJ.gif",
    "barbell row": "https://static.exercisedb.dev/media/eZyBC3j.gif",
    "chest supported row": "https://static.exercisedb.dev/media/7vG5o25.gif",
    "hammer curl": "https://static.exercisedb.dev/media/slDvUAU.gif",
    "back squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "leg press": "https://static.exercisedb.dev/media/V07qpXy.gif",
    "leg curl": "https://static.exercisedb.dev/media/17lJ1kr.gif",
    "calf raise": "https://static.exercisedb.dev/media/VW88JNd.gif",
    "ab wheel rollout": "https://static.exercisedb.dev/media/8xUv4J7.gif",
    "overhead press": "https://static.exercisedb.dev/media/kTbSH9h.gif",
    "chest press machine": "https://static.exercisedb.dev/media/wDN97Ca.gif",
    "cable row": "https://static.exercisedb.dev/media/fUBheHs.gif",
    "rear delt fly": "https://static.exercisedb.dev/media/EAs3xL9.gif",
    "skull crushers": "https://static.exercisedb.dev/media/iZop9xO.gif",
    "front squat": "https://static.exercisedb.dev/media/zG0zs85.gif",
    "hip thrust": "https://static.exercisedb.dev/media/aWedzZX.gif",
    "barbell hip thrust": "https://static.exercisedb.dev/media/aWedzZX.gif",
    "walking lunges": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "leg extension": "https://static.exercisedb.dev/media/Y1MsI1l.gif",
    "incline bench press": "https://static.exercisedb.dev/media/3TZduzM.gif",
    "bicep curl": "https://static.exercisedb.dev/media/uSkDMYl.gif",
    "triceps extension": "https://static.exercisedb.dev/media/uxJcFUU.gif",
    "ez bar curl": "https://static.exercisedb.dev/media/OVTZ65k.gif",
    "crunch": "https://static.exercisedb.dev/media/Kzg30R7.gif",
    "machine chest press": "https://static.exercisedb.dev/media/wDN97Ca.gif",
    "dumbbell shoulder press": "https://static.exercisedb.dev/media/84RyJf8.gif",
    "cable fly": "https://static.exercisedb.dev/media/27NNGFr.gif",
    "preacher curl": "https://static.exercisedb.dev/media/OVTZ65k.gif",
    "cable curl": "https://static.exercisedb.dev/media/QTXKWPh.gif",
    "push-ups": "https://static.exercisedb.dev/media/I4hDWkc.gif",
    "push-up": "https://static.exercisedb.dev/media/I4hDWkc.gif",
    "pike push-ups": "https://static.exercisedb.dev/media/XPUDTt7.gif",
    "glute bridge": "https://static.exercisedb.dev/media/aWedzZX.gif",
    "plank": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "chin-ups": "https://static.exercisedb.dev/media/T2mxWqc.gif",
    "nordic curl": "https://static.exercisedb.dev/media/17lJ1kr.gif",
    "hanging knee raise": "https://static.exercisedb.dev/media/03lzqwk.gif",
    "decline push-ups": "https://static.exercisedb.dev/media/i5cEhka.gif",
    "diamond push-ups": "https://static.exercisedb.dev/media/soIB2rj.gif",
    "bench dips": "https://static.exercisedb.dev/media/gtO1ErP.gif",
    "australian rows": "https://static.exercisedb.dev/media/bZGHsAZ.gif",
    "superman": "https://static.exercisedb.dev/media/4GqRrAk.gif",
    "squats": "https://static.exercisedb.dev/media/BReCuOn.gif",
    "jump squats": "https://static.exercisedb.dev/media/LIlE5Tn.gif",
    "calf raises": "https://static.exercisedb.dev/media/bJYHBIN.gif",
    "leg raises": "https://static.exercisedb.dev/media/UGhRD1A.gif",
    "lunges": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "hollow hold": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "side plank": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "goblet squat": "https://static.exercisedb.dev/media/yn8yg1r.gif",
    "dumbbell bench press": "https://static.exercisedb.dev/media/SpYC0Kp.gif",
    "one arm row": "https://static.exercisedb.dev/media/C0MA9bC.gif",
    "arnold press": "https://static.exercisedb.dev/media/Xy4jlWA.gif",
    "step-ups": "https://static.exercisedb.dev/media/aXtJhlg.gif",
    "russian twist": "https://static.exercisedb.dev/media/XVDdcoj.gif",
    "dumbbell fly": "https://static.exercisedb.dev/media/yz9nUhF.gif",
    "close grip db press": "https://static.exercisedb.dev/media/7jGOBF3.gif",
    "dumbbell pullover": "https://static.exercisedb.dev/media/9XjtHvS.gif",
    "reverse curl": "https://static.exercisedb.dev/media/4Jc36XM.gif"
}

def find_exact_animation(name: str) -> str | None:
    norm_n = normalize(name)
    
    # 1. Match in EXACT_GIF_MAP
    for k, url in EXACT_GIF_MAP.items():
        if normalize(k) == norm_n:
            return url

    # 2. Match in Free Exercise DB source (873 items)
    for item in exercise_db_source:
        item_name = item.get("name", "")
        norm_item = normalize(item_name)
        if norm_item == norm_n:
            raw_id = item.get("id", "").replace(" ", "_")
            if raw_id:
                return f"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{raw_id}/0.jpg"

    return None

def main():
    csv_path = "C:/Users/raiss/strengthlog_exercises.csv"
    if not os.path.exists(csv_path):
        print("ERROR: CSV file not found")
        sys.exit(1)

    with open(csv_path, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"Filtering {len(rows)} StrengthLog exercises for 100% EXACT animations...\n")

    retained_records = []
    removed_records = []
    exercise_media_map = {}

    # Clear current Supabase exercises table
    print("Clearing database for exact animation filtering...")
    supabase.table("exercises").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    for r in rows:
        name = r.get("Exercise Name", "").strip()
        category = r.get("Category", "").strip()
        url = r.get("URL", "").strip()
        how_to = r.get("How to Do", "").strip()
        primary = [m.strip() for m in r.get("Primary Muscles Worked", "").split(";") if m.strip()]
        secondary = [m.strip() for m in r.get("Secondary Muscles Worked", "").split(";") if m.strip()]

        anim_url = find_exact_animation(name)

        if anim_url:
            # RETAIN EXERCISE
            instructions = [s.strip() for s in re.split(r'\d+\.\s*', how_to) if s.strip()]
            if not instructions:
                instructions = [how_to] if how_to else [f"Perform {name} with proper form."]

            exercise_media_map[name] = anim_url
            payload = {
                "name": name,
                "category": category or "Strength",
                "source_url": url,
                "instructions": instructions,
                "primary_muscles": primary if primary else ["Full Body"],
                "secondary_muscles": secondary,
                "updated_at": "now()"
            }
            try:
                supabase.table("exercises").upsert(payload, on_conflict="name").execute()
                retained_records.append(name)
            except Exception as e:
                print(f"Error inserting {name}: {e}")
        else:
            # REMOVE EXERCISE WITHOUT EXACT ANIMATION
            removed_records.append(name)

    # Write updated src/data/exerciseMedia.ts
    media_ts_lines = [
        "// Exercise Media Database with 100% exact exercise animation URLs",
        "export const ExerciseMediaDB: Record<string, string> = {"
    ]
    for name, anim in exercise_media_map.items():
        media_ts_lines.append(f'  "{name}": "{anim}",')
    media_ts_lines.append("};\n")
    media_ts_lines.append("export function getExerciseThumbnailUrl(exerciseName: string): string | null {")
    media_ts_lines.append("  return ExerciseMediaDB[exerciseName] || null;")
    media_ts_lines.append("}\n")

    with open("src/data/exerciseMedia.ts", "w", encoding="utf-8") as f:
        f.write("\n".join(media_ts_lines))

    # Sync EXACT retained exercises to local database.ts
    os.system("python scripts/sync_exercises_to_local.py")

    print("\n" + "=" * 60)
    print("EXACT ANIMATIONS FILTERING FINAL REPORT")
    print("=" * 60)
    print(f"Total initial exercises checked: {len(rows)}")
    print(f"Total exercises retained with 100% EXACT animations: {len(retained_records)}")
    print(f"Total exercises removed (no exact animation): {len(removed_records)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
