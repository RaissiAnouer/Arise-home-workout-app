// ─── Equipment Types ────────────────────────────────────────────────
export type Equipment =
  | 'Bodyweight'
  | 'Dumbbells'
  | 'Barbell'
  | 'Kettlebell'
  | 'Resistance Bands'
  | 'Cable Machine'
  | 'Machine'
  | 'Pull-up Bar'
  | 'Medicine Ball'
  | 'TRX'
  | 'Smith Machine'
  | 'Gym Rings';

// ─── Muscle Groups ──────────────────────────────────────────────────
export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Core'
  | 'Quadriceps'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Hip Flexors'
  | 'Traps'
  | 'Lats'
  | 'Full Body';

// ─── Difficulty ─────────────────────────────────────────────────────
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

// ─── Exercise Category ──────────────────────────────────────────────
export type ExerciseCategory =
  | 'Strength'
  | 'Cardio'
  | 'Mobility'
  | 'Flexibility'
  | 'Plyometric';

// ─── Movement Pattern ───────────────────────────────────────────────
export type MovementPattern =
  | 'Push'
  | 'Pull'
  | 'Squat'
  | 'Hinge'
  | 'Carry'
  | 'Rotation';

// ─── Body Region ────────────────────────────────────────────────────
export type BodyRegion = 'Upper Body' | 'Lower Body' | 'Core' | 'Full Body';

// ─── Exercise Interface ─────────────────────────────────────────────
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  bodyRegion: BodyRegion;
  isCompound: boolean;
  isUnilateral: boolean;
  instructions: string[];
  commonMistakes: string[];
  formTips: string[];
  safetyTips?: string[];
  setsRepsRecommendation: string;
  estimatedCalories?: number;
  exerciseTags: string[];
  gifUrl?: string;
  thumbnailUrl?: string;
}

// ─── Filter Constants ───────────────────────────────────────────────
export const ALL_EQUIPMENT: Equipment[] = [
  'Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell',
  'Resistance Bands', 'Cable Machine', 'Machine', 'Pull-up Bar',
  'Medicine Ball', 'TRX', 'Smith Machine', 'Gym Rings',
];

export const HOME_GYM_EQUIPMENT: Equipment[] = [
  'Bodyweight', 'Dumbbells', 'Resistance Bands', 'Pull-up Bar', 'Kettlebell',
];

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Core', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves',
  'Hip Flexors', 'Traps', 'Lats', 'Full Body',
];

export const ALL_DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

export const ALL_CATEGORIES: ExerciseCategory[] = [
  'Strength', 'Cardio', 'Mobility', 'Flexibility', 'Plyometric',
];

export const ALL_MOVEMENT_PATTERNS: MovementPattern[] = [
  'Push', 'Pull', 'Squat', 'Hinge', 'Carry', 'Rotation',
];

export const ALL_BODY_REGIONS: BodyRegion[] = [
  'Upper Body', 'Lower Body', 'Core', 'Full Body',
];
