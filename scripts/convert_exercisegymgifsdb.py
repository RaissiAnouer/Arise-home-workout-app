#!/usr/bin/env python3
"""
Fetches all exercises from ExerciseGymGifsDB API and generates database.ts
for the Arise home workout app.
"""

import json
import urllib.request
import uuid
import re
import os

API_URL = "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/en/exercises.json"

# ─── Mapping Tables ──────────────────────────────────────────────────

MUSCLE_MAP = {
    "pectorals": "Chest",
    "lats": "Lats",
    "delts": "Shoulders",
    "biceps": "Biceps",
    "triceps": "Triceps",
    "forearms": "Forearms",
    "abs": "Core",
    "quads": "Quadriceps",
    "hamstrings": "Hamstrings",
    "glutes": "Glutes",
    "calves": "Calves",
    "traps": "Traps",
    "upper-back": "Back",
    "spine": "Back",
    "abductors": "Hip Flexors",
    "adductors": "Hip Flexors",
    "serratus-anterior": "Chest",
    "levator-scapulae": "Traps",
    "cardio": "Full Body",
}

EQUIPMENT_MAP = {
    "bodyweight": "Bodyweight",
    "dumbbell": "Dumbbells",
    "barbell": "Barbell",
    "kettlebell": "Kettlebell",
    "band": "Resistance Bands",
    "cable": "Cable Machine",
    "machine": "Machine",
    "smith": "Smith Machine",
    "ez-bar": "Barbell",
    "lever": "Machine",
    "other": "Bodyweight",
}

CATEGORY_MAP = {
    "strength": "Strength",
    "stretching": "Flexibility",
    "cardio": "Cardio",
    "plyometrics": "Plyometric",
}

# bodyPart -> bodyRegion
BODY_REGION_MAP = {
    "arms": "Upper Body",
    "chest": "Upper Body",
    "back": "Upper Body",
    "shoulders": "Upper Body",
    "legs": "Lower Body",
    "core": "Core",
    "cardio": "Full Body",
}

# ─── Inference Helpers ──────────────────────────────────────────────

def infer_difficulty(equipment, category, secondary_count, name_lower):
    """Infer difficulty based on equipment, category, and exercise characteristics."""
    advanced_keywords = ["pistol", "muscle-up", "planche", "front-lever", "back-lever", 
                         "handstand", "dragon-flag", "one-arm", "single-leg-deadlift",
                         "snatch", "clean-and-jerk", "turkish-get-up"]
    for kw in advanced_keywords:
        if kw in name_lower:
            return "Advanced"
    
    beginner_keywords = ["assisted", "seated", "lying", "wall", "bench-supported",
                         "machine", "lever", "band"]
    beginner_equip = ["machine", "lever", "band"]
    
    if equipment in beginner_equip:
        return "Beginner"
    for kw in beginner_keywords:
        if kw in name_lower:
            return "Beginner"
    
    if category == "stretching":
        return "Beginner"
    
    if category == "plyometrics":
        return "Advanced"
    
    if secondary_count >= 2:
        return "Intermediate"
    
    return "Intermediate"


def infer_movement_pattern(muscle, name_lower, equipment):
    """Infer movement pattern from muscle group and exercise name."""
    push_muscles = ["pectorals", "triceps", "delts"]
    pull_muscles = ["lats", "biceps", "upper-back", "traps", "forearms"]
    
    rotation_keywords = ["rotation", "twist", "woodchop", "russian-twist", "windmill"]
    hinge_keywords = ["deadlift", "hip-thrust", "good-morning", "hyperextension", 
                      "back-extension", "glute-bridge", "hip-hinge", "romanian"]
    squat_keywords = ["squat", "lunge", "leg-press", "leg-extension", "split"]
    pull_keywords = ["pull", "row", "curl", "pulldown", "chin", "shrug", "deadlift"]
    push_keywords = ["press", "push", "dip", "fly", "raise", "extension", "kickback"]
    
    for kw in rotation_keywords:
        if kw in name_lower:
            return "Rotation"
    for kw in hinge_keywords:
        if kw in name_lower:
            return "Hinge"
    for kw in squat_keywords:
        if kw in name_lower:
            return "Squat"
    for kw in pull_keywords:
        if kw in name_lower:
            return "Pull"
    for kw in push_keywords:
        if kw in name_lower:
            return "Push"
    
    if muscle in push_muscles:
        return "Push"
    if muscle in pull_muscles:
        return "Pull"
    if muscle in ["quads"]:
        return "Squat"
    if muscle in ["hamstrings", "glutes"]:
        return "Hinge"
    if muscle in ["abs", "spine"]:
        return "Rotation"
    
    return "Push"


def infer_sets_reps(category, difficulty, is_compound):
    """Infer sets/reps recommendation."""
    if category == "cardio":
        return "3 SETS x 30 - 60 SEC"
    if category == "stretching":
        return "3 SETS x 20 - 30 SEC"
    if category == "plyometrics":
        return "3 SETS x 8 - 12 REPS"
    
    if is_compound:
        if difficulty == "Beginner":
            return "3 SETS x 10 - 12 REPS"
        elif difficulty == "Advanced":
            return "4 SETS x 4 - 6 REPS"
        else:
            return "4 SETS x 6 - 8 REPS"
    else:
        if difficulty == "Beginner":
            return "3 SETS x 12 - 15 REPS"
        elif difficulty == "Advanced":
            return "4 SETS x 8 - 10 REPS"
        else:
            return "3 SETS x 10 - 12 REPS"


FORM_TIPS_BY_MUSCLE = {
    "pectorals": ["Keep shoulder blades retracted and depressed", "Maintain a slight arch in your lower back", "Control the eccentric phase"],
    "lats": ["Initiate the pull with your lats, not your arms", "Keep chest up and core engaged", "Squeeze at peak contraction"],
    "delts": ["Avoid using momentum", "Keep a slight bend in elbows during raises", "Control the weight through full range of motion"],
    "biceps": ["Keep elbows pinned to your sides", "Avoid swinging the weight", "Squeeze at the top of the movement"],
    "triceps": ["Keep elbows close to your body", "Fully extend arms at the bottom", "Control the negative portion"],
    "forearms": ["Maintain a firm grip throughout", "Use controlled movements", "Avoid excessive wrist deviation"],
    "abs": ["Exhale during the contraction", "Keep lower back pressed into the floor", "Focus on mind-muscle connection"],
    "quads": ["Keep knees tracking over toes", "Maintain an upright torso", "Push through your heels"],
    "hamstrings": ["Maintain a neutral spine", "Feel the stretch in the hamstrings", "Avoid rounding your lower back"],
    "glutes": ["Squeeze glutes at the top of the movement", "Maintain a neutral spine", "Drive through your heels"],
    "calves": ["Achieve full range of motion", "Pause at the top for a squeeze", "Lower slowly for a deep stretch"],
    "traps": ["Shrug straight up, not rolling", "Keep arms straight during shrugs", "Hold the contraction briefly"],
    "upper-back": ["Retract shoulder blades fully", "Maintain a neutral spine", "Focus on squeezing the back muscles"],
    "spine": ["Keep movements slow and controlled", "Maintain a neutral head position", "Avoid jerky movements"],
    "abductors": ["Keep hips square and aligned", "Control the movement throughout", "Focus on the outer hip muscles"],
    "adductors": ["Maintain proper hip alignment", "Use controlled movements", "Avoid bouncing at end range"],
    "serratus-anterior": ["Focus on protraction of shoulder blades", "Keep core engaged", "Maintain controlled tempo"],
    "levator-scapulae": ["Avoid excessive neck rotation", "Use light weights with control", "Maintain proper posture"],
    "cardio": ["Maintain steady breathing rhythm", "Keep proper form throughout", "Start at lower intensity and build up"],
}

COMMON_MISTAKES_BY_MUSCLE = {
    "pectorals": ["Flaring elbows too wide", "Bouncing the weight off chest", "Incomplete range of motion"],
    "lats": ["Using too much bicep", "Leaning back excessively", "Not fully extending on the eccentric"],
    "delts": ["Using momentum to swing weights", "Shrugging shoulders up", "Going too heavy with poor form"],
    "biceps": ["Swinging the body for momentum", "Not controlling the negative", "Using too heavy a weight"],
    "triceps": ["Flaring elbows outward", "Using momentum", "Not achieving full lockout"],
    "forearms": ["Using too much wrist momentum", "Gripping too tightly", "Rushing through repetitions"],
    "abs": ["Pulling on the neck", "Using hip flexors instead of abs", "Holding breath"],
    "quads": ["Knees caving inward", "Heels lifting off the floor", "Leaning too far forward"],
    "hamstrings": ["Rounding the lower back", "Using too much momentum", "Not feeling the stretch"],
    "glutes": ["Hyperextending the lower back", "Not squeezing at the top", "Using momentum"],
    "calves": ["Bouncing at the bottom", "Not using full range of motion", "Going too fast"],
    "traps": ["Rolling shoulders forward", "Using too much weight", "Jerky movements"],
    "upper-back": ["Using arms more than back", "Rounding the upper back", "Not retracting scapulae"],
    "spine": ["Moving too quickly", "Using excessive weight", "Not maintaining neutral spine"],
    "abductors": ["Using momentum instead of muscle", "Leaning to one side", "Not controlling the return"],
    "adductors": ["Rushing the movement", "Not controlling the eccentric", "Using too much weight"],
    "serratus-anterior": ["Not focusing on protraction", "Using too much weight", "Rushing repetitions"],
    "levator-scapulae": ["Jerking the weight", "Excessive rotation", "Poor posture during exercise"],
    "cardio": ["Poor breathing technique", "Sacrificing form for speed", "Not warming up properly"],
}


def get_form_tips(muscle):
    return FORM_TIPS_BY_MUSCLE.get(muscle, ["Keep core engaged", "Maintain controlled tempo", "Focus on proper form"])


def get_common_mistakes(muscle):
    return COMMON_MISTAKES_BY_MUSCLE.get(muscle, ["Using too much weight", "Poor form", "Rushing repetitions"])


def get_safety_tips(muscle, equipment):
    tips = ["Warm up properly before starting"]
    if equipment in ["barbell", "dumbbell", "smith", "ez-bar"]:
        tips.append("Use a spotter for heavy sets")
    if muscle in ["spine", "hamstrings", "quads", "glutes"]:
        tips.append("Stop if you feel sharp pain in your joints or back")
    else:
        tips.append("Stop immediately if you feel sharp pain")
    return tips


# ─── Main Conversion ────────────────────────────────────────────────

def convert_exercise(ex):
    """Convert a single API exercise to ExerciseItem format."""
    muscle = ex.get("muscle", "")
    name = ex.get("name", "")
    name_lower = ex.get("slug", "").lower()
    equipment_raw = ex.get("equipment", "other")
    category_raw = ex.get("category", "strength")
    body_part = ex.get("bodyPart", "")
    secondary_raw = ex.get("secondaryMuscles", [])
    instructions = ex.get("instructions", [])
    
    primary_muscle = MUSCLE_MAP.get(muscle, "Full Body")
    secondary_muscles = []
    for sm in secondary_raw:
        mapped = MUSCLE_MAP.get(sm)
        if mapped and mapped != primary_muscle:
            secondary_muscles.append(mapped)
    secondary_muscles = list(dict.fromkeys(secondary_muscles))
    
    equipment = EQUIPMENT_MAP.get(equipment_raw, "Bodyweight")
    category = CATEGORY_MAP.get(category_raw, "Strength")
    body_region = BODY_REGION_MAP.get(body_part, "Full Body")
    
    is_compound = len(secondary_raw) >= 1
    difficulty = infer_difficulty(equipment_raw, category_raw, len(secondary_raw), name_lower)
    movement_pattern = infer_movement_pattern(muscle, name_lower, equipment_raw)
    sets_reps = infer_sets_reps(category_raw, difficulty, is_compound)
    
    description = instructions[0] if instructions else f"Perform {name} with proper form and controlled tempo."
    
    gif_url = ex.get("gifUrl", "")
    
    return {
        "id": ex["id"],
        "name": name,
        "description": description,
        "primaryMuscle": primary_muscle,
        "secondaryMuscles": secondary_muscles,
        "equipment": equipment,
        "difficulty": difficulty,
        "category": category,
        "movementPattern": movement_pattern,
        "bodyRegion": body_region,
        "isCompound": is_compound,
        "gifUrl": gif_url,
        "thumbnailUrl": gif_url,
        "instructions": instructions,
        "formTips": get_form_tips(muscle),
        "commonMistakes": get_common_mistakes(muscle),
        "safetyTips": get_safety_tips(muscle, equipment_raw),
        "setsRepsRecommendation": sets_reps,
    }


def escape_ts_string(s):
    """Escape a string for TypeScript."""
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def format_string_array(arr, indent=6):
    """Format a string array for TypeScript."""
    if not arr:
        return "[]"
    prefix = " " * indent
    items = [f'{prefix}"{escape_ts_string(item)}"' for item in arr]
    return "[\n" + ",\n".join(items) + f"\n{' ' * (indent - 2)}]"


def generate_ts(exercises):
    """Generate the full database.ts content."""
    lines = []
    lines.append("import {")
    lines.append("  Equipment,")
    lines.append("  MuscleGroup,")
    lines.append("  Difficulty,")
    lines.append("  ExerciseCategory,")
    lines.append("  MovementPattern,")
    lines.append("  BodyRegion,")
    lines.append("} from '../exerciseTypes';")
    lines.append("")
    lines.append("export interface ExerciseItem {")
    lines.append("  id: string;")
    lines.append("  name: string;")
    lines.append("  description: string;")
    lines.append("  primaryMuscle: MuscleGroup;")
    lines.append("  secondaryMuscles: MuscleGroup[];")
    lines.append("  equipment: Equipment;")
    lines.append("  difficulty: Difficulty;")
    lines.append("  category: ExerciseCategory;")
    lines.append("  movementPattern: MovementPattern;")
    lines.append("  bodyRegion: BodyRegion;")
    lines.append("  isCompound: boolean;")
    lines.append("  gifUrl: string;")
    lines.append("  thumbnailUrl: string;")
    lines.append("  instructions: string[];")
    lines.append("  formTips: string[];")
    lines.append("  commonMistakes: string[];")
    lines.append("  safetyTips: string[];")
    lines.append("  setsRepsRecommendation: string;")
    lines.append("}")
    lines.append("")
    lines.append("export const EXERCISE_DATABASE: Record<string, ExerciseItem> = {")
    
    for i, ex in enumerate(exercises):
        eid = escape_ts_string(ex["id"])
        lines.append(f'  "{eid}": {{')
        lines.append(f'    id: "{eid}",')
        lines.append(f'    name: "{escape_ts_string(ex["name"])}",')
        lines.append(f'    description: "{escape_ts_string(ex["description"])}",')
        lines.append(f'    primaryMuscle: "{ex["primaryMuscle"]}" as MuscleGroup,')
        
        if ex["secondaryMuscles"]:
            sm_items = ", ".join(f'"{m}"' for m in ex["secondaryMuscles"])
            lines.append(f'    secondaryMuscles: [{sm_items}] as MuscleGroup[],')
        else:
            lines.append(f'    secondaryMuscles: [] as MuscleGroup[],')
        
        lines.append(f'    equipment: "{ex["equipment"]}" as Equipment,')
        lines.append(f'    difficulty: "{ex["difficulty"]}" as Difficulty,')
        lines.append(f'    category: "{ex["category"]}" as ExerciseCategory,')
        lines.append(f'    movementPattern: "{ex["movementPattern"]}" as MovementPattern,')
        lines.append(f'    bodyRegion: "{ex["bodyRegion"]}" as BodyRegion,')
        lines.append(f'    isCompound: {"true" if ex["isCompound"] else "false"},')
        lines.append(f'    gifUrl: "{escape_ts_string(ex["gifUrl"])}",')
        lines.append(f'    thumbnailUrl: "{escape_ts_string(ex["thumbnailUrl"])}",')
        
        lines.append(f'    instructions: {format_string_array(ex["instructions"])},')
        lines.append(f'    formTips: {format_string_array(ex["formTips"])},')
        lines.append(f'    commonMistakes: {format_string_array(ex["commonMistakes"])},')
        lines.append(f'    safetyTips: {format_string_array(ex["safetyTips"])},')
        lines.append(f'    setsRepsRecommendation: "{escape_ts_string(ex["setsRepsRecommendation"])}"')
        
        if i < len(exercises) - 1:
            lines.append("  },")
        else:
            lines.append("  }")
    
    lines.append("};")
    lines.append("")
    
    return "\n".join(lines)


def main():
    print("Fetching exercises from ExerciseGymGifsDB API...")
    req = urllib.request.Request(API_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode("utf-8"))
    
    raw_exercises = data.get("exercises", [])
    print(f"Fetched {len(raw_exercises)} exercises.")
    
    converted = [convert_exercise(ex) for ex in raw_exercises]
    print(f"Converted {len(converted)} exercises.")
    
    muscle_counts = {}
    for ex in converted:
        m = ex["primaryMuscle"]
        muscle_counts[m] = muscle_counts.get(m, 0) + 1
    print("\nMuscle distribution:")
    for m, c in sorted(muscle_counts.items(), key=lambda x: -x[1]):
        print(f"  {m}: {c}")
    
    equip_counts = {}
    for ex in converted:
        e = ex["equipment"]
        equip_counts[e] = equip_counts.get(e, 0) + 1
    print("\nEquipment distribution:")
    for e, c in sorted(equip_counts.items(), key=lambda x: -x[1]):
        print(f"  {e}: {c}")
    
    ts_content = generate_ts(converted)
    
    output_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "exercises", "database.ts")
    output_path = os.path.normpath(output_path)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(ts_content)
    
    print(f"\nGenerated {output_path}")
    print(f"Total exercises: {len(converted)}")
    
    ids_path = os.path.join(os.path.dirname(__file__), "exercise_ids.txt")
    with open(ids_path, "w", encoding="utf-8") as f:
        for ex in converted:
            f.write(f"{ex['id']}  |  {ex['name']}  |  {ex['primaryMuscle']}  |  {ex['equipment']}\n")
    print(f"Exercise ID reference written to {ids_path}")


if __name__ == "__main__":
    main()
