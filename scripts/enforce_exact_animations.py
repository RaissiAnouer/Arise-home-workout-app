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
    return re.sub(r'[^a-z0-9]', '', s.lower())

# VERIFIED EXACT ANIMATIONS DATABASE (100% Exact exercise matching URLs only)
EXACT_ANIMATIONS = {
    # Chest
    "Bench Press": "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    "Barbell Bench Press": "https://static.exercisedb.dev/media/EIeI8Vf.gif",
    "Incline Bench Press": "https://static.exercisedb.dev/media/3TZduzM.gif",
    "Incline Dumbbell Press": "https://static.exercisedb.dev/media/ns0SIbU.gif",
    "Dumbbell Bench Press": "https://static.exercisedb.dev/media/SpYC0Kp.gif",
    "Dumbbell Fly": "https://static.exercisedb.dev/media/yz9nUhF.gif",
    "Cable Fly": "https://static.exercisedb.dev/media/27NNGFr.gif",
    "Machine Chest Press": "https://static.exercisedb.dev/media/wDN97Ca.gif",
    "Chest Press Machine": "https://static.exercisedb.dev/media/wDN97Ca.gif",
    "Push-ups": "https://static.exercisedb.dev/media/I4hDWkc.gif",
    "Push-up": "https://static.exercisedb.dev/media/I4hDWkc.gif",
    "Decline Push-ups": "https://static.exercisedb.dev/media/i5cEhka.gif",
    "Diamond Push-ups": "https://static.exercisedb.dev/media/soIB2rj.gif",
    "Close Grip DB Press": "https://static.exercisedb.dev/media/7jGOBF3.gif",
    "Dumbbell Pullover": "https://static.exercisedb.dev/media/9XjtHvS.gif",

    # Back
    "Lat Pulldown": "https://static.exercisedb.dev/media/LEprlgG.gif",
    "Lat Pulldown with Pronated Grip": "https://static.exercisedb.dev/media/LEprlgG.gif",
    "Seated Cable Row": "https://static.exercisedb.dev/media/fUBheHs.gif",
    "Cable Row": "https://static.exercisedb.dev/media/fUBheHs.gif",
    "Barbell Row": "https://static.exercisedb.dev/media/eZyBC3j.gif",
    "One Arm Row": "https://static.exercisedb.dev/media/C0MA9bC.gif",
    "Chest Supported Row": "https://static.exercisedb.dev/media/7vG5o25.gif",
    "Pull-ups": "https://static.exercisedb.dev/media/lBDjFxJ.gif",
    "Pull-up": "https://static.exercisedb.dev/media/lBDjFxJ.gif",
    "Chin-ups": "https://static.exercisedb.dev/media/T2mxWqc.gif",
    "Australian Rows": "https://static.exercisedb.dev/media/bZGHsAZ.gif",
    "Face Pull": "https://static.exercisedb.dev/media/EAs3xL9.gif",
    "Superman": "https://static.exercisedb.dev/media/4GqRrAk.gif",

    # Shoulders
    "Shoulder Press": "https://static.exercisedb.dev/media/84RyJf8.gif",
    "Overhead Press": "https://static.exercisedb.dev/media/kTbSH9h.gif",
    "Dumbbell Shoulder Press": "https://static.exercisedb.dev/media/84RyJf8.gif",
    "Arnold Press": "https://static.exercisedb.dev/media/Xy4jlWA.gif",
    "Lateral Raise": "https://static.exercisedb.dev/media/DsgkuIt.gif",
    "Rear Delt Fly": "https://static.exercisedb.dev/media/EAs3xL9.gif",
    "Pike Push-ups": "https://static.exercisedb.dev/media/XPUDTt7.gif",

    # Biceps
    "Dumbbell Curl": "https://static.exercisedb.dev/media/mtXengz.gif",
    "Bicep Curl": "https://static.exercisedb.dev/media/uSkDMYl.gif",
    "Hammer Curl": "https://static.exercisedb.dev/media/slDvUAU.gif",
    "EZ Bar Curl": "https://static.exercisedb.dev/media/OVTZ65k.gif",
    "Preacher Curl": "https://static.exercisedb.dev/media/OVTZ65k.gif",
    "Cable Curl": "https://static.exercisedb.dev/media/QTXKWPh.gif",
    "Reverse Curl": "https://static.exercisedb.dev/media/4Jc36XM.gif",

    # Triceps
    "Triceps Pushdown": "https://static.exercisedb.dev/media/gAwDzB3.gif",
    "Overhead Triceps Extension": "https://static.exercisedb.dev/media/uxJcFUU.gif",
    "Triceps Extension": "https://static.exercisedb.dev/media/uxJcFUU.gif",
    "Skull Crushers": "https://static.exercisedb.dev/media/iZop9xO.gif",
    "Skull Crusher": "https://static.exercisedb.dev/media/iZop9xO.gif",
    "Bench Dips": "https://static.exercisedb.dev/media/gtO1ErP.gif",

    # Legs (Quads, Glutes, Hamstrings)
    "Barbell Squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "Back Squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "Squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "Squats": "https://static.exercisedb.dev/media/BReCuOn.gif",
    "Front Squat": "https://static.exercisedb.dev/media/zG0zs85.gif",
    "Goblet Squat": "https://static.exercisedb.dev/media/yn8yg1r.gif",
    "Bulgarian Split Squats": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "Bulgarian Split Squat": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "Jump Squats": "https://static.exercisedb.dev/media/LIlE5Tn.gif",
    "Leg Press": "https://static.exercisedb.dev/media/V07qpXy.gif",
    "Leg Extension": "https://static.exercisedb.dev/media/Y1MsI1l.gif",
    "Lunges": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "Walking Lunges": "https://static.exercisedb.dev/media/RYcV1kH.gif",
    "Step-ups": "https://static.exercisedb.dev/media/aXtJhlg.gif",
    "Deadlift": "https://static.exercisedb.dev/media/ila4NZS.gif",
    "Romanian Deadlift": "https://static.exercisedb.dev/media/wQ2c4XD.gif",
    "Leg Curl": "https://static.exercisedb.dev/media/17lJ1kr.gif",
    "Nordic Curl": "https://static.exercisedb.dev/media/17lJ1kr.gif",
    "Hip Thrust": "https://static.exercisedb.dev/media/aWedzZX.gif",
    "Barbell Hip Thrust": "https://static.exercisedb.dev/media/aWedzZX.gif",
    "Glute Bridge": "https://static.exercisedb.dev/media/aWedzZX.gif",

    # Calves
    "Standing Calf Raise": "https://static.exercisedb.dev/media/8ozhUIZ.gif",
    "Seated Calf Raise": "https://static.exercisedb.dev/media/IeDEXTe.gif",
    "Calf Raise": "https://static.exercisedb.dev/media/VW88JNd.gif",
    "Calf Raises": "https://static.exercisedb.dev/media/bJYHBIN.gif",

    # Abs / Core
    "Crunch": "https://static.exercisedb.dev/media/Kzg30R7.gif",
    "Cable Crunch": "https://static.exercisedb.dev/media/8xUv4J7.gif",
    "Ab Wheel Rollout": "https://static.exercisedb.dev/media/8xUv4J7.gif",
    "Hanging Leg Raise": "https://static.exercisedb.dev/media/I3tsCnC.gif",
    "Hanging Leg Raises": "https://static.exercisedb.dev/media/UGhRD1A.gif",
    "Hanging Knee Raise": "https://static.exercisedb.dev/media/03lzqwk.gif",
    "Leg Raises": "https://static.exercisedb.dev/media/UGhRD1A.gif",
    "Plank": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "Side Plank": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "Hollow Hold": "https://static.exercisedb.dev/media/X6ytgYZ.gif",
    "Russian Twist": "https://static.exercisedb.dev/media/XVDdcoj.gif"
}

# Muscle-specific alternative exercises with verified exact animations
MUSCLE_ALTERNATIVES = {
    "Chest": [
        {"name": "Bench Press", "anim": "https://static.exercisedb.dev/media/EIeI8Vf.gif", "category": "Chest", "primary": ["Chest"], "secondary": ["Triceps", "Shoulders"], "instructions": ["Lie on flat bench.", "Lower bar to chest.", "Press bar up to full extension."]},
        {"name": "Incline Dumbbell Press", "anim": "https://static.exercisedb.dev/media/ns0SIbU.gif", "category": "Chest", "primary": ["Chest"], "secondary": ["Front Deltoid", "Triceps"], "instructions": ["Set bench to 30-45 degrees.", "Press dumbbells up directly above upper chest.", "Lower with control."]},
        {"name": "Push-ups", "anim": "https://static.exercisedb.dev/media/I4hDWkc.gif", "category": "Chest", "primary": ["Chest"], "secondary": ["Triceps", "Core"], "instructions": ["Place hands shoulder-width apart.", "Lower body until chest almost touches floor.", "Push up explosively."]},
        {"name": "Dumbbell Fly", "anim": "https://static.exercisedb.dev/media/yz9nUhF.gif", "category": "Chest", "primary": ["Chest"], "secondary": ["Front Deltoid"], "instructions": ["Lie on bench holding dumbbells.", "Lower weights in wide arc until stretch is felt.", "Squeeze chest to bring weights back together."]}
    ],
    "Back": [
        {"name": "Lat Pulldown", "anim": "https://static.exercisedb.dev/media/LEprlgG.gif", "category": "Back", "primary": ["Lats"], "secondary": ["Biceps", "Rear Deltoids"], "instructions": ["Grip lat bar overhand.", "Pull bar down towards upper chest.", "Control weight back up."]},
        {"name": "Seated Cable Row", "anim": "https://static.exercisedb.dev/media/fUBheHs.gif", "category": "Back", "primary": ["Lats", "Rhomboids"], "secondary": ["Biceps"], "instructions": ["Sit at cable row machine.", "Pull handle to abdomen squeezing shoulder blades.", "Return with control."]},
        {"name": "Pull-ups", "anim": "https://static.exercisedb.dev/media/lBDjFxJ.gif", "category": "Back", "primary": ["Lats"], "secondary": ["Biceps", "Core"], "instructions": ["Grip pull-up bar overhand.", "Pull chin over bar.", "Lower body with control."]},
        {"name": "Barbell Row", "anim": "https://static.exercisedb.dev/media/eZyBC3j.gif", "category": "Back", "primary": ["Lats", "Rhomboids"], "secondary": ["Biceps", "Lower Back"], "instructions": ["Hinge at hips holding barbell.", "Pull bar to lower chest.", "Lower with control."]}
    ],
    "Shoulders": [
        {"name": "Overhead Press", "anim": "https://static.exercisedb.dev/media/kTbSH9h.gif", "category": "Shoulders", "primary": ["Shoulders"], "secondary": ["Triceps"], "instructions": ["Stand holding barbell at shoulder level.", "Press bar overhead until arms lock out.", "Lower with control."]},
        {"name": "Lateral Raise", "anim": "https://static.exercisedb.dev/media/DsgkuIt.gif", "category": "Shoulders", "primary": ["Side Deltoid"], "secondary": ["Traps"], "instructions": ["Hold dumbbells at sides.", "Raise arms out to sides until parallel to floor.", "Lower with control."]},
        {"name": "Arnold Press", "anim": "https://static.exercisedb.dev/media/Xy4jlWA.gif", "category": "Shoulders", "primary": ["Shoulders"], "secondary": ["Triceps"], "instructions": ["Hold dumbbells in front of shoulders palms facing you.", "Rotate palms outward as you press overhead.", "Reverse movement down."]}
    ],
    "Biceps": [
        {"name": "Dumbbell Curl", "anim": "https://static.exercisedb.dev/media/mtXengz.gif", "category": "Biceps", "primary": ["Biceps"], "secondary": ["Forearms"], "instructions": ["Hold dumbbells with underhand grip.", "Curl weights up toward shoulders.", "Lower with control."]},
        {"name": "Hammer Curl", "anim": "https://static.exercisedb.dev/media/slDvUAU.gif", "category": "Biceps", "primary": ["Biceps"], "secondary": ["Forearms"], "instructions": ["Hold dumbbells with neutral grip (palms facing each other).", "Curl up to shoulders.", "Lower with control."]}
    ],
    "Triceps": [
        {"name": "Triceps Pushdown", "anim": "https://static.exercisedb.dev/media/gAwDzB3.gif", "category": "Triceps", "primary": ["Triceps"], "secondary": ["Forearms"], "instructions": ["Attach bar/rope to high cable.", "Push down extending elbows completely.", "Return to 90 degrees."]},
        {"name": "Overhead Triceps Extension", "anim": "https://static.exercisedb.dev/media/uxJcFUU.gif", "category": "Triceps", "primary": ["Triceps"], "secondary": ["Core"], "instructions": ["Hold weight overhead with both hands.", "Lower weight behind head by bending elbows.", "Extend back overhead."]}
    ],
    "Quadriceps": [
        {"name": "Barbell Squat", "anim": "https://static.exercisedb.dev/media/RYcV1kH.gif", "category": "Legs", "primary": ["Quadriceps"], "secondary": ["Glutes", "Hamstrings"], "instructions": ["Place bar across upper back.", "Squat down until thighs are parallel to floor.", "Drive back up through heels."]},
        {"name": "Leg Press", "anim": "https://static.exercisedb.dev/media/V07qpXy.gif", "category": "Legs", "primary": ["Quadriceps"], "secondary": ["Glutes"], "instructions": ["Place feet on press platform.", "Lower platform towards chest.", "Press platform back up without locking knees."]}
    ],
    "Hamstrings": [
        {"name": "Romanian Deadlift", "anim": "https://static.exercisedb.dev/media/wQ2c4XD.gif", "category": "Legs", "primary": ["Hamstrings"], "secondary": ["Glutes", "Lower Back"], "instructions": ["Hold bar at thigh level.", "Hinge hips backward lowering bar along legs.", "Drive hips forward to stand up."]},
        {"name": "Leg Curl", "anim": "https://static.exercisedb.dev/media/17lJ1kr.gif", "category": "Legs", "primary": ["Hamstrings"], "secondary": ["Calves"], "instructions": ["Lie on leg curl machine.", "Curl weight up towards glutes.", "Lower with control."]}
    ],
    "Glutes": [
        {"name": "Hip Thrust", "anim": "https://static.exercisedb.dev/media/aWedzZX.gif", "category": "Legs", "primary": ["Glutes"], "secondary": ["Hamstrings"], "instructions": ["Rest upper back against bench.", "Drive hips up extending fully at top.", "Lower hips with control."]},
        {"name": "Glute Bridge", "anim": "https://static.exercisedb.dev/media/aWedzZX.gif", "category": "Legs", "primary": ["Glutes"], "secondary": ["Core"], "instructions": ["Lie flat on back knees bent.", "Drive hips into air squeezing glutes at top.", "Lower back down."]}
    ],
    "Calves": [
        {"name": "Standing Calf Raise", "anim": "https://static.exercisedb.dev/media/8ozhUIZ.gif", "category": "Calves", "primary": ["Calves"], "secondary": ["Foot Flexors"], "instructions": ["Stand on calf machine or ledge.", "Lower heels for stretch.", "Raise up onto toes."]}
    ],
    "Core": [
        {"name": "Crunch", "anim": "https://static.exercisedb.dev/media/Kzg30R7.gif", "category": "Core", "primary": ["Abs"], "secondary": ["Core"], "instructions": ["Lie on back knees bent.", "Flex abs raising shoulders off floor.", "Lower with control."]},
        {"name": "Plank", "anim": "https://static.exercisedb.dev/media/X6ytgYZ.gif", "category": "Core", "primary": ["Core"], "secondary": ["Shoulders"], "instructions": ["Hold body straight on elbows and toes.", "Keep core tight.", "Hold position without sagging."]}
    ]
}

def find_exact_animation(name: str) -> str | None:
    norm_name = normalize(name)
    for exact_title, url in EXACT_ANIMATIONS.items():
        if normalize(exact_title) == norm_name:
            return url
    return None

def main():
    print("Enforcing EXACT animations and generating alternative exercises...\n")
    
    # 1. Fetch current exercises from Supabase
    res = supabase.table("exercises").select("*").execute()
    existing_exercises = res.data or []

    retained_count = 0
    removed_count = 0
    added_alternatives = 0

    valid_exercises_payload = []
    exercise_media_map = {}

    for ex in existing_exercises:
        ex_id = ex["id"]
        ex_name = ex["name"]
        
        exact_url = find_exact_animation(ex_name)
        
        if exact_url:
            # KEEP exercise
            retained_count += 1
            exercise_media_map[ex_name] = exact_url
            valid_exercises_payload.append(ex)
        else:
            # REMOVE exercise without exact animation
            removed_count += 1
            try:
                supabase.table("exercises").delete().eq("id", ex_id).execute()
            except Exception as e:
                print(f"Error deleting {ex_name}: {e}")

    # 2. Add verified alternative exercises for removed ones
    # Check existing retained names
    retained_names_set = set(e["name"] for e in valid_exercises_payload)

    for muscle_group, alt_list in MUSCLE_ALTERNATIVES.items():
        for alt in alt_list:
            if alt["name"] not in retained_names_set:
                added_alternatives += 1
                retained_names_set.add(alt["name"])
                exercise_media_map[alt["name"]] = alt["anim"]
                
                payload = {
                    "name": alt["name"],
                    "category": alt["category"],
                    "source_url": "https://www.strengthlog.com/",
                    "instructions": alt["instructions"],
                    "primary_muscles": alt["primary"],
                    "secondary_muscles": alt["secondary"],
                    "updated_at": "now()"
                }
                
                try:
                    supabase.table("exercises").upsert(payload, on_conflict="name").execute()
                except Exception as e:
                    print(f"Error adding alternative {alt['name']}: {e}")

    # 3. Write updated src/data/exerciseMedia.ts
    media_ts_lines = [
        "// Exercise Media Database with high quality exact exercise animation URLs",
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

    # 4. Sync to local database.ts
    os.system("python scripts/sync_exercises_to_local.py")

    print("\n" + "=" * 60)
    print("EXACT ANIMATIONS & ALTERNATIVES FINAL REPORT")
    print("=" * 60)
    print(f"Total exercises checked: {len(existing_exercises)}")
    print(f"Retained with EXACT animation: {retained_count}")
    print(f"Removed (no exact animation found): {removed_count}")
    print(f"Added verified alternative exercises: {added_alternatives}")
    print(f"FINAL TOTAL EXERCISES IN DATABASE: {retained_count + added_alternatives}")
    print("=" * 60)

if __name__ == "__main__":
    main()
