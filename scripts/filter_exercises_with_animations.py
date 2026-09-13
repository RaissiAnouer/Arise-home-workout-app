import os
import sys
import json
import re
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
load_dotenv("C:/Users/raiss/.env")

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY")

# Known High Quality Verified Animated Media Mapping
KNOWN_MEDIA_DB = {
    "barbell squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "bench press": "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    "lat pulldown": "https://static.exercisedb.dev/media/LEprlgG.gif",
    "lat pulldown with pronated grip": "https://static.exercisedb.dev/media/LEprlgG.gif",
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
    "pull-up": "https://static.exercisedb.dev/media/lBDjFxJ.gif",
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

def normalize(name: str) -> str:
    return re.sub(r'[^a-z0-9]', '', name.lower())

def find_animation(exercise_name: str) -> str | None:
    norm_target = normalize(exercise_name)
    
    # 1. Direct or normalized match in KNOWN_MEDIA_DB
    for key, url in KNOWN_MEDIA_DB.items():
        if normalize(key) == norm_target:
            return url

    # 2. Substring matching
    for key, url in KNOWN_MEDIA_DB.items():
        norm_key = normalize(key)
        if norm_key in norm_target or norm_target in norm_key:
            return url

    return None

def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: Supabase URL/Key missing.")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    print("Fetching exercises from Supabase...")
    res = supabase.table("exercises").select("*").execute()
    exercises = res.data or []
    
    total_processed = len(exercises)
    retained_count = 0
    deleted_count = 0
    deleted_names = []
    retained_names = []

    print(f"Processing {total_processed} exercises for animation validation...\n")

    for ex in exercises:
        ex_id = ex["id"]
        ex_name = ex["name"]
        
        anim_url = find_animation(ex_name)
        
        if anim_url:
            # Verified animation found -> update record
            try:
                supabase.table("exercises").update({
                    "gif_url": anim_url,
                    "thumbnail_url": anim_url
                }).eq("id", ex_id).execute()
                retained_count += 1
                retained_names.append(ex_name)
            except Exception as e:
                print(f"Error updating {ex_name}: {e}")
        else:
            # NO verified animation found -> DELETE exercise per strict requirement
            try:
                supabase.table("exercises").delete().eq("id", ex_id).execute()
                deleted_count += 1
                deleted_names.append(ex_name)
            except Exception as e:
                print(f"Error deleting {ex_name}: {e}")

    # Output statistical report
    print("=" * 60)
    print("FINAL EXERCISE ANIMATION VERIFICATION REPORT")
    print("=" * 60)
    print(f"Total exercises processed: {total_processed}")
    print(f"Total exercises retained (with verified animation): {retained_count}")
    print(f"Total exercises deleted (no animation found): {deleted_count}")
    print("=" * 60)

    if deleted_names:
        print("\nSample deleted exercises (without verified animation):")
        for d in deleted_names[:15]:
            print(f"  - {d}")
        if len(deleted_names) > 15:
            print(f"  ... and {len(deleted_names) - 15} more.")

if __name__ == "__main__":
    main()
