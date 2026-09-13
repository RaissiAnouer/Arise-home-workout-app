import os
import sys
import json
import re
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("C:/Users/raiss/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing env credentials")
    sys.exit(1)

supabase = create_client(url, key)
res = supabase.table("exercises").select("*").execute()
exercises = res.data or []

print(f"Fetched {len(exercises)} exercises from Supabase.")

# Read ExerciseMediaDB mapping from src/data/exerciseMedia.ts
media_map = {}
with open("src/data/exerciseMedia.ts", "r", encoding="utf-8") as f:
    content = f.read()
    matches = re.findall(r'"([^"]+)":\s*"([^"]+)"', content)
    for m_name, m_url in matches:
        media_map[m_name] = m_url

ts_code = [
    "import {",
    "  Equipment,",
    "  MuscleGroup,",
    "  Difficulty,",
    "  ExerciseCategory,",
    "  MovementPattern,",
    "  BodyRegion,",
    "} from '../exerciseTypes';",
    "",
    "export interface ExerciseItem {",
    "  id: string;",
    "  name: string;",
    "  description: string;",
    "  primaryMuscle: MuscleGroup;",
    "  secondaryMuscles: MuscleGroup[];",
    "  equipment: Equipment;",
    "  difficulty: Difficulty;",
    "  category: ExerciseCategory;",
    "  movementPattern: MovementPattern;",
    "  bodyRegion: BodyRegion;",
    "  isCompound: boolean;",
    "  gifUrl: string;",
    "  thumbnailUrl: string;",
    "  instructions: string[];",
    "  formTips: string[];",
    "  commonMistakes: string[];",
    "  safetyTips: string[];",
    "  setsRepsRecommendation: string;",
    "}",
    "",
    "export const EXERCISE_DATABASE: Record<string, ExerciseItem> = {"
]

def map_muscle(m_list):
    if not m_list or len(m_list) == 0:
        return 'Full Body'
    m = m_list[0].lower()
    if 'chest' in m: return 'Chest'
    if 'back' in m or 'lat' in m or 'lats' in m or 'rhomboid' in m: return 'Back'
    if 'biceps' in m or 'bicep' in m: return 'Biceps'
    if 'triceps' in m or 'tricep' in m: return 'Triceps'
    if 'shoulder' in m or 'deltoid' in m or 'delt' in m: return 'Shoulders'
    if 'quad' in m or 'thigh' in m: return 'Quadriceps'
    if 'hamstring' in m: return 'Hamstrings'
    if 'glute' in m or 'hip' in m: return 'Glutes'
    if 'calf' in m or 'calves' in m: return 'Calves'
    if 'abs' in m or 'core' in m or 'oblique' in m or 'abdominal' in m: return 'Core'
    if 'forearm' in m: return 'Forearms'
    if 'trap' in m: return 'Traps'
    return 'Full Body'

def map_equipment(cat):
    if not cat: return 'Bodyweight'
    c = cat.lower()
    if 'barbell' in c: return 'Barbell'
    if 'dumbbell' in c or 'db' in c: return 'Dumbbells'
    if 'cable' in c: return 'Cable Machine'
    if 'machine' in c or 'smith' in c: return 'Machine'
    if 'kettlebell' in c: return 'Kettlebell'
    if 'band' in c: return 'Resistance Bands'
    return 'Bodyweight'

for ex in exercises:
    ex_id = ex["id"]
    name = ex["name"].replace('"', '\\"')
    instructions = ex.get("instructions") or [f"Perform {ex['name']} with controlled form."]
    primary_m = map_muscle(ex.get("primary_muscles"))
    sec_m = [map_muscle([m]) for m in (ex.get("secondary_muscles") or [])]
    eq = map_equipment(ex.get("category"))
    gif = media_map.get(ex["name"], "https://static.exercisedb.dev/media/RYcV1kH.gif")
    
    instructions_json = json.dumps(instructions)
    sec_m_json = json.dumps(sec_m)
    
    entry = f'''  "{ex_id}": {{
    id: "{ex_id}",
    name: "{name}",
    description: "{instructions[0].replace('"', '\\"') if len(instructions)>0 else 'Standard exercise guide.'}",
    primaryMuscle: "{primary_m}" as MuscleGroup,
    secondaryMuscles: {sec_m_json} as MuscleGroup[],
    equipment: "{eq}" as Equipment,
    difficulty: "Intermediate" as Difficulty,
    category: "Strength" as ExerciseCategory,
    movementPattern: "Push" as MovementPattern,
    bodyRegion: "Upper Body" as BodyRegion,
    isCompound: true,
    gifUrl: "{gif}",
    thumbnailUrl: "{gif}",
    instructions: {instructions_json},
    formTips: ["Keep core engaged", "Maintain controlled posture"],
    commonMistakes: ["Avoid swinging weights", "Do not rush repetitions"],
    safetyTips: ["Warm up properly before heavy sets"],
    setsRepsRecommendation: "3 SETS × 8 - 12 REPS"
  }},'''
    ts_code.append(entry)

ts_code.append("};\n")

with open("src/data/exercises/database.ts", "w", encoding="utf-8") as f:
    f.write("\n".join(ts_code))

print(f"Successfully synced {len(exercises)} exercises to src/data/exercises/database.ts")
