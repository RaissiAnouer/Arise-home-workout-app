/**
 * Workout Plan Data Schema
 *
 * Each workout plan is stored as structured JSON/TypeScript data.
 * Exercises are referenced strictly by exerciseId from the master Exercise Database.
 */

export interface PlanExerciseRef {
  exerciseId: string;
  sets: number;
  repRange: string;
  restSeconds?: number;
  notes?: string;
}

export interface WorkoutDayPlan {
  dayNumber: number;
  dayName: string; // e.g. "Day 1", "Push Strength", "Upper A"
  focus: string;   // e.g. "Full Body", "Chest, Shoulders & Triceps"
  exercises: PlanExerciseRef[];
}

export type SplitType =
  | '2_day_full_body'
  | '3_day_ppl'
  | '4_day_upper_lower'
  | '5_day_ppl_ul'
  | '6_day_ppl_x2';

export interface StructuredWorkoutPlan {
  id: string;
  name: string;
  splitType: SplitType;
  daysPerWeek: number;
  description: string;
  days: WorkoutDayPlan[];
}
