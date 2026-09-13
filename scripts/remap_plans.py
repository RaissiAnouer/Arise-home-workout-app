import re
import os

DB_PATH = os.path.join("src", "data", "exercises", "database.ts")
PLANS_PATH = os.path.join("src", "data", "plans", "structuredPlans.ts")

with open(DB_PATH, "r", encoding="utf-8") as f:
    db_text = f.read()

MAPPING = {
    'ab_wheel_rollout': 'abs/wheel-rollerout',
    'arnold_press': 'delts/dumbbell-arnold-press',
    'back_squat': 'glutes/barbell-full-squat-back-pov',
    'bench_press': 'pectorals/barbell-bench-press',
    'bent_over_row': 'upper-back/barbell-bent-over-row',
    'biceps_curl': 'biceps/barbell-curl',
    'bulgarian_split_squat': 'quads/dumbbell-single-leg-split-squat',
    'cable_crunch': 'abs/cable-kneeling-crunch',
    'cable_curl': 'biceps/cable-curl',
    'cable_fly': 'delts/cable-cross-over-revers-fly',
    'chest_fly': 'pectorals/cable-one-arm-decline-chest-fly',
    'chest_supported_row': 'upper-back/cable-low-seated-row',
    'deadlift': 'glutes/barbell-deadlift',
    'dips': 'pectorals/assisted-chest-dip-kneeling',
    'dumbbell_curl': 'biceps/dumbbell-alternate-biceps-curl',
    'dumbbell_shoulder_press': 'delts/dumbbell-standing-overhead-press',
    'ez_bar_curl': 'biceps/ez-barbell-close-grip-curl',
    'face_pull': 'delts/band-standing-rear-delt-row',
    'front_squat': 'glutes/barbell-front-squat',
    'hack_squat': 'glutes/sled-hack-squat',
    'hammer_curl': 'biceps/cable-hammer-curl-with-rope',
    'hanging_leg_raise': 'abs/hanging-leg-raise',
    'hip_thrust': 'glutes/resistance-band-hip-thrusts-on-knees-female',
    'incline_bench_press': 'pectorals/barbell-incline-bench-press',
    'incline_dumbbell_curl': 'biceps/dumbbell-incline-curl',
    'incline_dumbbell_press': 'pectorals/dumbbell-incline-bench-press',
    'lat_pulldown': 'lats/cable-lat-pulldown-full-range-of-motion',
    'lateral_raise': 'delts/cable-lateral-raise',
    'leg_curl': 'hamstrings/lever-lying-leg-curl',
    'leg_extension': 'quads/lever-leg-extension',
    'leg_press': 'calves/sled-calf-press-on-leg-press',
    'machine_chest_press': 'pectorals/lever-chest-press',
    'overhead_press': 'delts/barbell-seated-overhead-press',
    'overhead_triceps_extension': 'triceps/cable-high-pulley-overhead-tricep-extension',
    'pec_deck': 'pectorals/lever-chest-press',
    'plank': 'abs/weighted-front-plank',
    'pull_up': 'lats/assisted-pull-up',
    'rear_delt_fly': 'delts/dumbbell-rear-fly',
    'reverse_pec_deck': 'delts/cable-standing-cross-over-high-reverse-fly',
    'romanian_deadlift': 'glutes/barbell-romanian-deadlift',
    'rope_triceps_pushdown': 'triceps/cable-pushdown-with-rope-attachment',
    'seated_cable_row': 'upper-back/cable-low-seated-row',
    'seated_calf_raise': 'calves/barbell-seated-calf-raise',
    'skull_crusher': 'triceps/barbell-lying-triceps-extension-skull-crusher',
    'standing_calf_raise': 'calves/barbell-standing-calf-raise',
    'triceps_pushdown': 'triceps/cable-pushdown'
}

missing = []
for k, v in MAPPING.items():
    target = f'"{v}": {{'
    if target not in db_text:
        missing.append((k, v))

print("Missing mappings in database.ts:", missing)

with open(PLANS_PATH, "r", encoding="utf-8") as f:
    plans_content = f.read()

for old_id, new_id in MAPPING.items():
    pattern = f"exerciseId: '{old_id}'"
    replacement = f"exerciseId: '{new_id}'"
    plans_content = plans_content.replace(pattern, replacement)

with open(PLANS_PATH, "w", encoding="utf-8") as f:
    f.write(plans_content)

print(f"Updated {PLANS_PATH} successfully.")
