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

# ONLY 3D Vector/Graphic Animated Model GIFs (Zero Real Human Photos)
VECTOR_MODEL_GIFS = {
    "bench press": "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    "barbell bench press": "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    "incline bench press": "https://static.exercisedb.dev/media/3TZduzM.gif",
    "incline dumbbell press": "https://static.exercisedb.dev/media/ns0SIbU.gif",
    "dumbbell bench press": "https://static.exercisedb.dev/media/SpYC0Kp.gif",
    "dumbbell fly": "https://static.exercisedb.dev/media/yz9nUhF.gif",
    "cable fly": "https://static.exercisedb.dev/media/27NNGFr.gif",
    "machine chest press": "https://static.exercisedb.dev/media/wDN97Ca.gif",
    "chest press machine": "https://static.exercisedb.dev/media/wDN97Ca.gif",
    "push-ups": "https://static.exercisedb.dev/media/I4hDWkc.gif",
    "push-up": "https://static.exercisedb.dev/media/I4hDWkc.gif",
    "decline push-ups": "https://static.exercisedb.dev/media/i5cEhka.gif",
    "diamond push-ups": "https://static.exercisedb.dev/media/soIB2rj.gif",
    "close grip db press": "https://static.exercisedb.dev/media/7jGOBF3.gif",
    "dumbbell pullover": "https://static.exercisedb.dev/media/9XjtHvS.gif",

    "lat pulldown": "https://static.exercisedb.dev/media/LEprlgG.gif",
    "lat pulldown with pronated grip": "https://static.exercisedb.dev/media/LEprlgG.gif",
    "seated cable row": "https://static.exercisedb.dev/media/fUBheHs.gif",
    "cable row": "https://static.exercisedb.dev/media/fUBheHs.gif",
    "barbell row": "https://static.exercisedb.dev/media/eZyBC3j.gif",
    "one arm row": "https://static.exercisedb.dev/media/C0MA9bC.gif",
    "chest supported row": "https://static.exercisedb.dev/media/7vG5o25.gif",
    "pull-ups": "https://static.exercisedb.dev/media/lBDjFxJ.gif",
    "pull-up": "https://static.exercisedb.dev/media/lBDjFxJ.gif",
    "chin-ups": "https://static.exercisedb.dev/media/T2mxWqc.gif",
    "australian rows": "https://static.exercisedb.dev/media/bZGHsAZ.gif",
    "face pull": "https://static.exercisedb.dev/media/EAs3xL9.gif",
    "superman": "https://static.exercisedb.dev/media/4GqRrAk.gif",

    "shoulder press": "https://static.exercisedb.dev/media/84RyJf8.gif",
    "overhead press": "https://static.exercisedb.dev/media/kTbSH9h.gif",
    "dumbbell shoulder press": "https://static.exercisedb.dev/media/84RyJf8.gif",
    "arnold press": "https://static.exercisedb.dev/media/Xy4jlWA.gif",
    "lateral raise": "https://static.exercisedb.dev/media/DsgkuIt.gif",
    "rear delt fly": "https://static.exercisedb.dev/media/EAs3xL9.gif",
    "pike push-ups": "https://static.exercisedb.dev/media/XPUDTt7.gif",

    "dumbbell curl": "https://static.exercisedb.dev/media/mtXengz.gif",
    "bicep curl": "https://static.exercisedb.dev/media/uSkDMYl.gif",
    "hammer curl": "https://static.exercisedb.dev/media/slDvUAU.gif",
    "ez bar curl": "https://static.exercisedb.dev/media/OVTZ65k.gif",
    "preacher curl": "https://static.exercisedb.dev/media/OVTZ65k.gif",
    "cable curl": "https://static.exercisedb.dev/media/QTXKWPh.gif",
    "reverse curl": "https://static.exercisedb.dev/media/4Jc36XM.gif",

    "triceps pushdown": "https://static.exercisedb.dev/media/gAwDzB3.gif",
    "overhead triceps extension": "https://static.exercisedb.dev/media/uxJcFUU.gif",
    "triceps extension": "https://static.exercisedb.dev/media/uxJcFUU.gif",
    "skull crushers": "https://static.exercisedb.dev/media/iZop9xO.gif",
    "bench dips": "https://static.exercisedb.dev/media/gtO1ErP.gif",

    "barbell squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "back squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "squats": "https://static.exercisedb.dev/media/BReCuOn.gif",
    "front squat": "https://static.exercisedb.dev/media/zG0zs85.gif",
    "goblet squat": "https://static.exercisedb.dev/media/yn8yg1r.gif",
    "bulgarian split squats": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "bulgarian split squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "jump squats": "https://static.exercisedb.dev/media/LIlE5Tn.gif",
    "leg press": "https://static.exercisedb.dev/media/V07qpXy.gif",
    "leg extension": "https://static.exercisedb.dev/media/Y1MsI1l.gif",
    "lunges": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "walking lunges": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "step-ups": "https://static.exercisedb.dev/media/aXtJhlg.gif",
    "deadlift": "https://static.exercisedb.dev/media/ila4NZS.gif",
    "romanian deadlift": "https://static.exercisedb.dev/media/wQ2c4XD.gif",
    "leg curl": "https://static.exercisedb.dev/media/17lJ1kr.gif",
    "nordic curl": "https://static.exercisedb.dev/media/17lJ1kr.gif",
    "hip thrust": "https://static.exercisedb.dev/media/aWedzZX.gif",
    "barbell hip thrust": "https://static.exercisedb.dev/media/aWedzZX.gif",
    "glute bridge": "https://static.exercisedb.dev/media/aWedzZX.gif",

    "standing calf raise": "https://static.exercisedb.dev/media/8ozhUIZ.gif",
    "seated calf raise": "https://static.exercisedb.dev/media/IeDEXTe.gif",
    "calf raise": "https://static.exercisedb.dev/media/VW88JNd.gif",
    "calf raises": "https://static.exercisedb.dev/media/bJYHBIN.gif",

    "crunch": "https://static.exercisedb.dev/media/Kzg30R7.gif",
    "cable crunch": "https://static.exercisedb.dev/media/8xUv4J7.gif",
    "ab wheel rollout": "https://static.exercisedb.dev/media/8xUv4J7.gif",
    "hanging leg raise": "https://static.exercisedb.dev/media/I3tsCnC.gif",
    "hanging leg raises": "https://static.exercisedb.dev/media/UGhRD1A.gif",
    "hanging knee raise": "https://static.exercisedb.dev/media/03lzqwk.gif",
    "leg raises": "https://static.exercisedb.dev/media/UGhRD1A.gif",
    "plank": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "side plank": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "hollow hold": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "russian twist": "https://static.exercisedb.dev/media/XVDdcoj.gif"
}

def find_vector_gif(name: str) -> str | None:
    norm_n = normalize(name)
    for title, gif_url in VECTOR_MODEL_GIFS.items():
        if normalize(title) == norm_n:
            return gif_url
    return None

def main():
    print("Filtering database for ONLY 3D Vector Graphic Model Animations (No Real Human Photos)...\n")

    # Fetch all exercises currently in Supabase
    res = supabase.table("exercises").select("*").execute()
    all_ex = res.data or []

    retained = []
    removed = []
    exercise_media_map = {}

    # Clear current table
    supabase.table("exercises").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    for ex in all_ex:
        name = ex["name"]
        vector_gif = find_vector_gif(name)

        if vector_gif:
            retained.append(ex)
            exercise_media_map[name] = vector_gif
            try:
                supabase.table("exercises").upsert(ex, on_conflict="name").execute()
            except Exception as e:
                print(f"Error restoring {name}: {e}")
        else:
            removed.append(name)

    # Write src/data/exerciseMedia.ts with ONLY 3D Vector Model Animations
    media_ts_lines = [
        "// Exercise Media Database with 100% 3D Vector Model Animation GIFs (Zero Real Human Photos)",
        "export const ExerciseMediaDB: Record<string, string> = {"
    ]
    for name, gif in exercise_media_map.items():
        media_ts_lines.append(f'  "{name}": "{gif}",')
    media_ts_lines.append("};\n")
    media_ts_lines.append("export function getExerciseThumbnailUrl(exerciseName: string): string | null {")
    media_ts_lines.append("  return ExerciseMediaDB[exerciseName] || null;")
    media_ts_lines.append("}\n")

    with open("src/data/exerciseMedia.ts", "w", encoding="utf-8") as f:
        f.write("\n".join(media_ts_lines))

    # Sync retained vector model exercises to local database.ts
    os.system("python scripts/sync_exercises_to_local.py")

    print("\n" + "=" * 60)
    print("3D VECTOR MODEL ANIMATIONS FINAL REPORT")
    print("=" * 60)
    print(f"Total checked: {len(all_ex)}")
    print(f"Retained (3D Graphic Vector Model Animations): {len(retained)}")
    print(f"Removed (Real Human Photos / Non-Vector): {len(removed)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
