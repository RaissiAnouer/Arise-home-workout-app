/**
 * ExerciseSelector.ts
 *
 * Selects the optimal exercise for a given movement-pattern slot.
 * Selection priority (deterministic):
 *   1. Curated recommended list (coach-curated, equipment-tiered)
 *   2. Efficiency-score ranking from DB
 *   Fallbacks: drop alreadyUsed → relax experience → muscle-group match
 */

import { SlotRequirement, MovementPattern, ExperienceLevel } from './SplitResolver';

// ── Types ─────────────────────────────────────────────────────────────────

export interface ExerciseRecord {
  id: string;
  name: string;
  animation_url: string | null;
  thumbnail_url: string | null;
  sets: string | null;
  reps: string | null;
  rest_seconds: number | null;
  calories: number | null;
  duration: number | null;
  is_compound: boolean;
  efficiency_score: number;
  min_experience_level: string;
  fatigue_cost: string;
  popularity: number;
  muscles: { name: string } | null;
  equipment: { name: string } | null;
  difficulties: { name: string } | null;
  movement_patterns: { name: string } | null;
}

// Equipment constants matching questionnaire options
export type EquipmentTier = 'bodyweight' | 'dumbbells' | 'full_gym';

const EQUIPMENT_ALLOWED: Record<EquipmentTier, string[]> = {
  bodyweight: ['Bodyweight'],
  dumbbells:  ['Bodyweight', 'Dumbbells', 'Resistance Bands'],
  full_gym:   [], // empty = all allowed
};

export function mapEquipmentAnswer(answer: string | null): EquipmentTier {
  switch (answer) {
    case 'HOME (NO EQUIPMENT)':
    case 'NO EQUIPMENT':        return 'bodyweight';
    case 'HOME (DUMBBELLS)':
    case 'DUMBBELLS':           return 'dumbbells';
    case 'FULL GYM':
    default:                    return 'full_gym';
  }
}

// ── Coach-Curated Recommended Exercises ───────────────────────────────────
// Each pattern maps to a prioritised list of exercise name substrings
// (case-insensitive) per equipment tier. First match wins.

type PatternRecommendations = {
  full_gym:   string[];
  dumbbells:  string[];
  bodyweight: string[];
};

const RECOMMENDED_EXERCISES: Partial<Record<MovementPattern, PatternRecommendations>> = {
  horizontal_press: {
    full_gym:   ['barbell bench press', 'dumbbell bench press', 'chest press machine', 'push up', 'push-up'],
    dumbbells:  ['dumbbell bench press', 'dumbbell floor press', 'push up', 'push-up'],
    bodyweight: ['push up', 'push-up', 'diamond push', 'wide push'],
  },
  incline_press: {
    full_gym:   ['incline dumbbell press', 'incline barbell press', 'incline db press'],
    dumbbells:  ['incline dumbbell press', 'incline db press'],
    bodyweight: ['incline push up', 'pike push'],
  },
  vertical_press: {
    full_gym:   ['overhead press', 'military press', 'shoulder press', 'arnold press'],
    dumbbells:  ['dumbbell overhead press', 'seated dumbbell press', 'arnold press'],
    bodyweight: ['pike push up', 'handstand push', 'pike push-up'],
  },
  horizontal_pull: {
    full_gym:   ['barbell row', 'bent over row', 'cable row', 'seated row', 't-bar row'],
    dumbbells:  ['dumbbell row', 'bent over dumbbell row', 'renegade row'],
    bodyweight: ['inverted row', 'bodyweight row', 'table row'],
  },
  vertical_pull: {
    full_gym:   ['pull up', 'pull-up', 'lat pulldown', 'chin up', 'chin-up'],
    dumbbells:  ['pull up', 'pull-up', 'chin up', 'chin-up'],
    bodyweight: ['pull up', 'pull-up', 'chin up', 'chin-up', 'australian pull'],
  },
  squat: {
    full_gym:   ['barbell squat', 'back squat', 'leg press', 'front squat', 'goblet squat'],
    dumbbells:  ['goblet squat', 'dumbbell squat', 'sumo squat'],
    bodyweight: ['bodyweight squat', 'squat', 'wall sit', 'jump squat'],
  },
  hinge: {
    full_gym:   ['romanian deadlift', 'rdl', 'deadlift', 'good morning', 'trap bar deadlift'],
    dumbbells:  ['romanian deadlift', 'dumbbell rdl', 'dumbbell deadlift', 'stiff leg deadlift'],
    bodyweight: ['good morning', 'nordic curl', 'glute ham raise', 'single leg deadlift'],
  },
  lunge: {
    full_gym:   ['barbell lunge', 'walking lunge', 'bulgarian split squat', 'step up'],
    dumbbells:  ['dumbbell lunge', 'walking lunge', 'bulgarian split squat', 'step up'],
    bodyweight: ['reverse lunge', 'lunge', 'split squat', 'step up', 'pistol squat'],
  },
  hip_thrust: {
    full_gym:   ['barbell hip thrust', 'hip thrust', 'glute bridge'],
    dumbbells:  ['dumbbell hip thrust', 'hip thrust', 'glute bridge'],
    bodyweight: ['glute bridge', 'hip thrust', 'single leg glute bridge'],
  },
  lateral_delt_isolation: {
    full_gym:   ['lateral raise', 'cable lateral raise', 'upright row'],
    dumbbells:  ['dumbbell lateral raise', 'lateral raise', 'upright row'],
    bodyweight: ['lateral raise', 'upright row'],
  },
  rear_delt_isolation: {
    full_gym:   ['face pull', 'rear delt fly', 'reverse fly', 'cable reverse fly'],
    dumbbells:  ['rear delt fly', 'dumbbell reverse fly', 'bent over reverse fly'],
    bodyweight: ['reverse fly', 'rear delt fly'],
  },
  bicep_isolation: {
    full_gym:   ['barbell curl', 'ez bar curl', 'incline dumbbell curl', 'hammer curl', 'preacher curl'],
    dumbbells:  ['dumbbell curl', 'hammer curl', 'incline curl', 'concentration curl'],
    bodyweight: ['chin up', 'chin-up', 'resistance band curl'],
  },
  tricep_isolation: {
    full_gym:   ['cable pushdown', 'skull crusher', 'overhead tricep extension', 'dip', 'close grip bench'],
    dumbbells:  ['dumbbell overhead extension', 'tricep kickback', 'skull crusher'],
    bodyweight: ['diamond push up', 'dip', 'tricep pushdown', 'close grip push up'],
  },
  chest_fly: {
    full_gym:   ['cable fly', 'cable crossover', 'dumbbell fly', 'pec deck'],
    dumbbells:  ['dumbbell fly', 'dumbbell chest fly'],
    bodyweight: ['fly', 'crossover'],
  },
  calf_isolation: {
    full_gym:   ['standing calf raise', 'seated calf raise', 'leg press calf raise'],
    dumbbells:  ['standing calf raise', 'single leg calf raise'],
    bodyweight: ['standing calf raise', 'single leg calf raise', 'calf raise'],
  },
  core_anti_extension: {
    full_gym:   ['plank', 'ab wheel rollout', 'ab rollout', 'dead bug', 'pallof press'],
    dumbbells:  ['plank', 'dead bug', 'ab wheel rollout'],
    bodyweight: ['plank', 'dead bug', 'hollow body hold', 'bird dog'],
  },
  core_flexion: {
    full_gym:   ['cable crunch', 'hanging leg raise', 'decline crunch', 'ab crunch machine'],
    dumbbells:  ['crunch', 'leg raise', 'v-up', 'bicycle crunch'],
    bodyweight: ['crunch', 'bicycle crunch', 'leg raise', 'v-up', 'sit up'],
  },
  core_rotation: {
    full_gym:   ['cable twist', 'russian twist', 'wood chop', 'oblique crunch'],
    dumbbells:  ['russian twist', 'dumbbell wood chop', 'oblique crunch'],
    bodyweight: ['russian twist', 'bicycle crunch', 'oblique crunch'],
  },
  glute_isolation: {
    full_gym:   ['cable kickback', 'glute kickback', 'donkey kick'],
    dumbbells:  ['donkey kick', 'glute kickback'],
    bodyweight: ['donkey kick', 'fire hydrant', 'clamshell'],
  },
  leg_extension_isolation: {
    full_gym:   ['leg extension', 'seated leg extension'],
    dumbbells:  ['leg extension', 'single leg extension'],
    bodyweight: ['wall sit', 'step up'],
  },
  leg_curl_isolation: {
    full_gym:   ['leg curl', 'seated leg curl', 'lying leg curl', 'hamstring curl'],
    dumbbells:  ['dumbbell leg curl', 'hamstring curl'],
    bodyweight: ['nordic curl', 'slider curl', 'swiss ball curl'],
  },
  shrug: {
    full_gym:   ['barbell shrug', 'dumbbell shrug', 'cable shrug'],
    dumbbells:  ['dumbbell shrug'],
    bodyweight: ['shrug'],
  },
  pullover: {
    full_gym:   ['dumbbell pullover', 'cable pullover', 'barbell pullover'],
    dumbbells:  ['dumbbell pullover'],
    bodyweight: ['straight arm pulldown', 'pullover'],
  },
  wrist_forearm: {
    full_gym:   ['wrist curl', 'reverse wrist curl', 'forearm curl'],
    dumbbells:  ['wrist curl', 'dumbbell wrist curl'],
    bodyweight: ['grip strengthener', 'dead hang'],
  },
};

// ── Experience Level Hierarchy ────────────────────────────────────────────

const EXPERIENCE_ORDER: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

function experienceRank(level: ExperienceLevel): number {
  return EXPERIENCE_ORDER.indexOf(level);
}

function relaxExperience(level: ExperienceLevel): ExperienceLevel | null {
  const rank = experienceRank(level);
  return rank < EXPERIENCE_ORDER.length - 1 ? EXPERIENCE_ORDER[rank + 1] : null;
}

// ── Recommended Exercise Lookup ───────────────────────────────────────────
// Returns the highest-priority recommended exercise from the pool, or null.

function findRecommended(
  pool: ExerciseRecord[],
  pattern: MovementPattern,
  equipmentTier: EquipmentTier,
  alreadyUsed: Set<string>
): ExerciseRecord | null {
  const recs = RECOMMENDED_EXERCISES[pattern];
  if (!recs) return null;

  const priorityList: string[] =
    equipmentTier === 'bodyweight' ? recs.bodyweight
    : equipmentTier === 'dumbbells' ? [...recs.dumbbells, ...recs.bodyweight]
    : [...recs.full_gym, ...recs.dumbbells, ...recs.bodyweight];

  // Walk priority list; first name substring match wins
  for (const nameFrag of priorityList) {
    const frag = nameFrag.toLowerCase();
    // Prefer unused first
    const unused = pool.find(ex => !alreadyUsed.has(ex.id) && ex.name.toLowerCase().includes(frag));
    if (unused) return unused;
    // Allow repeat if no unused match
    const any = pool.find(ex => ex.name.toLowerCase().includes(frag));
    if (any) return any;
  }
  return null;
}

// ── Core Selection Logic ──────────────────────────────────────────────────

export function selectExerciseForSlot(
  slot: SlotRequirement,
  equipmentTier: EquipmentTier,
  experience: ExperienceLevel,
  alreadyUsed: Set<string>,
  exerciseDB: ExerciseRecord[]
): ExerciseRecord | null {
  const allowedEquipment = EQUIPMENT_ALLOWED[equipmentTier];

  // Step 1: Filter by movement pattern
  let candidates = exerciseDB.filter(
    ex => ex.movement_patterns?.name === slot.pattern
  );

  // Step 2: Filter by equipment
  if (allowedEquipment.length > 0) {
    candidates = candidates.filter(
      ex => ex.equipment && allowedEquipment.includes(ex.equipment.name)
    );
  }

  // Step 3: Filter by experience level
  let expFilteredCandidates = candidates.filter(
    ex => experienceRank(ex.min_experience_level as ExperienceLevel) <= experienceRank(experience)
  );

  // Step 4a: Try curated recommended pick first (priority list match)
  const recommended = findRecommended(expFilteredCandidates, slot.pattern, equipmentTier, alreadyUsed);
  if (recommended) return recommended;

  // Step 4b: Sort by efficiency_score and pick best unused
  const sorted = [...expFilteredCandidates].sort((a, b) => {
    if (b.efficiency_score !== a.efficiency_score) return b.efficiency_score - a.efficiency_score;
    return a.name.localeCompare(b.name);
  });
  const bestUnused = sorted.find(ex => !alreadyUsed.has(ex.id));
  if (bestUnused) return bestUnused;
  if (sorted.length > 0) return sorted[0]; // allow repeat

  // ── Fallback Chain ─────────────────────────────────────────────────

  // Fallback 1: Relax experience by one level
  const relaxedExp = relaxExperience(experience);
  if (relaxedExp !== null) {
    const relaxedCandidates = candidates
      .filter(ex => experienceRank(ex.min_experience_level as ExperienceLevel) <= experienceRank(relaxedExp))
      .sort((a, b) => {
        if (b.efficiency_score !== a.efficiency_score) return b.efficiency_score - a.efficiency_score;
        return a.name.localeCompare(b.name);
      });
    if (relaxedCandidates.length > 0) return relaxedCandidates[0];
  }

  // Fallback 2: Drop movement pattern — match by target muscle group (handles NULL movement_pattern_id).
  {
    let muscleCandidates = exerciseDB.filter(ex => ex.muscles?.name === slot.targetMuscle);
    if (allowedEquipment.length > 0) {
      muscleCandidates = muscleCandidates.filter(ex => ex.equipment && allowedEquipment.includes(ex.equipment.name));
    }

    // Try curated pick from muscle pool
    const recFromMuscle = findRecommended(muscleCandidates, slot.pattern, equipmentTier, alreadyUsed);
    if (recFromMuscle) return recFromMuscle;

    let pool = muscleCandidates.filter(ex => !alreadyUsed.has(ex.id));
    if (pool.length === 0) pool = muscleCandidates;
    pool.sort((a, b) => {
      if (b.efficiency_score !== a.efficiency_score) return b.efficiency_score - a.efficiency_score;
      return a.name.localeCompare(b.name);
    });
    if (pool.length > 0) {
      console.warn(`[ExerciseSelector] pattern_fallback → muscle=${slot.targetMuscle}: ${pool[0].name}`);
      return pool[0];
    }
  }

  // Fallback 3: No match at all
  console.warn(
    `[ExerciseSelector] slot_unfillable: pattern=${slot.pattern}, equipment=${equipmentTier}, experience=${experience}`
  );
  return null;
}
