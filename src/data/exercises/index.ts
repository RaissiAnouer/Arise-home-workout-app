import { Exercise } from '../exerciseTypes';
import { EXERCISE_DATABASE, ExerciseItem } from './database';

export { EXERCISE_DATABASE, type ExerciseItem } from './database';

// Convert EXERCISE_DATABASE values into standard Exercise array for backwards compatibility and new screens
export const allExercises: Exercise[] = Object.values(EXERCISE_DATABASE).map((ex) => ({
  id: ex.id,
  name: ex.name,
  description: ex.description,
  primaryMuscle: ex.primaryMuscle,
  secondaryMuscles: ex.secondaryMuscles,
  equipment: ex.equipment,
  difficulty: ex.difficulty,
  category: ex.category,
  movementPattern: ex.movementPattern,
  bodyRegion: ex.bodyRegion,
  isCompound: ex.isCompound,
  isUnilateral: false,
  instructions: ex.instructions,
  commonMistakes: ex.commonMistakes || [],
  formTips: ex.formTips || [],
  safetyTips: ex.safetyTips || [],
  setsRepsRecommendation: ex.setsRepsRecommendation || '3 SETS × 8 - 12 REPS',
  exerciseTags: [ex.primaryMuscle, ex.equipment, ex.movementPattern, ex.difficulty],
  gifUrl: ex.gifUrl,
  thumbnailUrl: ex.thumbnailUrl,
}));

export const barbellExercises: Exercise[] = allExercises.filter(e => e.equipment === 'Barbell');
export const bodyweightExercises: Exercise[] = allExercises.filter(e => e.equipment === 'Bodyweight' || e.equipment === 'Pull-up Bar');
export const cableExercises: Exercise[] = allExercises.filter(e => e.equipment === 'Cable Machine');
export const dumbbellExercises: Exercise[] = allExercises.filter(e => e.equipment === 'Dumbbells');
export const machineExercises: Exercise[] = allExercises.filter(e => e.equipment === 'Machine');

// Re-export types
export type { Exercise } from '../exerciseTypes';
export {
  ALL_EQUIPMENT,
  ALL_MUSCLE_GROUPS,
  ALL_DIFFICULTIES,
  ALL_CATEGORIES,
  ALL_MOVEMENT_PATTERNS,
  ALL_BODY_REGIONS,
  HOME_GYM_EQUIPMENT,
} from '../exerciseTypes';
export type {
  Equipment,
  MuscleGroup,
  Difficulty,
  ExerciseCategory,
  MovementPattern,
  BodyRegion,
} from '../exerciseTypes';
