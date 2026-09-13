/**
 * AdaptiveEngine.ts
 *
 * Engine for generating personalized 30-Day adaptive workout plans
 * based on user questionnaire answers, incorporating volume management
 * and evidence-based progressive overload.
 */

import { QuestionnaireAnswers } from '../context/QuestionnaireContext';
import { PlanResolverService } from './PlanResolverService';
import { WorkoutGeneratorService } from './WorkoutGeneratorService';

export interface AdaptiveExercise {
  id: string;
  name: string;
  equipment: string;
  muscle: string;
  isCompound: boolean;
  sets: number;
  repRange: string;
  rest_seconds: number;
  calories: number;
  duration: number;
  animation_url: string | null;
  thumbnail_url: string | null;
  progressiveOverloadTip?: string;
  prescription: {
    sets: number;
    repsTarget: number;
    weightKg: number;
    progressionNote: string;
    target_sets?: number;
    target_reps?: string;
    rest_seconds?: number;
  };
}

export interface AdaptiveDay {
  dayNumber: number;
  dayLabel: string;
  focus: string;
  isRestDay?: boolean;
  exercises: AdaptiveExercise[];
  estimatedDurationMinutes: number;
  estimatedCalories: number;
}

export interface AdaptiveWorkoutPlan {
  generatedAt: string;
  programId?: string;
  programName?: string;
  days: AdaptiveDay[];
  progressiveOverloadNotice: string;
}

/**
 * Generates a 30-Day adaptive workout plan based on questionnaire answers.
 */
export async function generateAdaptivePlan(
  userId: string,
  answers?: QuestionnaireAnswers,
  lastWorkedDates: Record<string, string> = {},
  lastSessionScore: number = 0,
  daysSinceLastWorkout: number = 999,
  selectedProgramId?: string
): Promise<AdaptiveWorkoutPlan> {
  if (selectedProgramId) {
    const struct = PlanResolverService.getPlanById(selectedProgramId);
    if (struct) {
      return PlanResolverService.toAdaptivePlan(struct);
    }
  }

  // Use the Evidence-Based Workout Generator with injury and equipment adaptations
  return WorkoutGeneratorService.generateAdaptive30DayPlan(answers);
}
