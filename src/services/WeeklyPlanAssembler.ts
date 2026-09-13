/**
 * WeeklyPlanAssembler.ts
 *
 * Assembles a full weekly workout plan from DayBlueprints.
 * Maintains weekly volume tracking with per-experience set ceilings.
 * Deterministic: same inputs → identical output. No Math.random().
 */

import { DayBlueprint, ExperienceLevel, SlotRequirement } from './SplitResolver';
import {
  ExerciseRecord,
  EquipmentTier,
  selectExerciseForSlot,
} from './ExerciseSelector';

// ── Types ─────────────────────────────────────────────────────────────────

export interface AssembledExercise {
  id: string;
  name: string;
  animation_url: string | null;
  thumbnail_url: string | null;
  equipment: string;
  muscle: string;
  isCompound: boolean;
  sets: number;
  repRange: string;
  rest_seconds: number;
  calories: number;
  duration: number;
  efficiency_score: number;
  fatigue_cost: string;
  slotPriority: string;
  movementPattern: string;
}

export interface AssembledDay {
  dayNumber: number;
  dayLabel: string;
  exercises: AssembledExercise[];
  estimatedDurationMinutes: number;
  estimatedCalories: number;
}

export interface WeeklyPlan {
  days: AssembledDay[];
  unfillableSlots: Array<{ dayLabel: string; pattern: string }>;
}

// ── Weekly Set Ceilings per Muscle Group ───────────────────────────────────
// These prevent overtraining by capping total weekly sets per muscle.

const WEEKLY_SET_CEILINGS: Record<ExperienceLevel, Record<string, number>> = {
  beginner: {
    Chest: 12, Back: 12, Shoulders: 10, Biceps: 8, Triceps: 8,
    Quadriceps: 12, Hamstrings: 10, Glutes: 10, Calves: 8,
    Core: 10, Forearms: 6, default: 10,
  },
  intermediate: {
    Chest: 16, Back: 18, Shoulders: 14, Biceps: 12, Triceps: 12,
    Quadriceps: 16, Hamstrings: 14, Glutes: 14, Calves: 10,
    Core: 12, Forearms: 8, default: 14,
  },
  advanced: {
    Chest: 22, Back: 22, Shoulders: 18, Biceps: 16, Triceps: 16,
    Quadriceps: 22, Hamstrings: 18, Glutes: 18, Calves: 14,
    Core: 16, Forearms: 10, default: 18,
  },
};

function getCeiling(experience: ExperienceLevel, muscle: string): number {
  const ceilings = WEEKLY_SET_CEILINGS[experience];
  return ceilings[muscle] ?? ceilings.default;
}

// ── Rest Time Defaults ────────────────────────────────────────────────────

function getRestSeconds(slot: SlotRequirement, isCompound: boolean): number {
  // Primary compound lifts get more rest
  if (slot.priority === 'primary' && isCompound) return 120;
  if (slot.priority === 'primary') return 90;
  if (slot.priority === 'accessory') return 75;
  return 60; // isolation
}

// ── Main Export ───────────────────────────────────────────────────────────

export function assembleWeeklyPlan(
  blueprints: DayBlueprint[],
  equipmentTier: EquipmentTier,
  experience: ExperienceLevel,
  exerciseDB: ExerciseRecord[]
): WeeklyPlan {
  // Weekly volume tracker: total sets accumulated per muscle group
  const weeklyVolume: Record<string, number> = {};
  // Anti-repetition: track used exercise IDs across the entire week
  const weeklyUsedIds = new Set<string>();
  const unfillableSlots: Array<{ dayLabel: string; pattern: string }> = [];

  const assembledDays: AssembledDay[] = [];

  for (let dayIdx = 0; dayIdx < blueprints.length; dayIdx++) {
    const blueprint = blueprints[dayIdx];
    const dayExercises: AssembledExercise[] = [];
    let dayCalories = 0;
    let dayDuration = 0;

    for (const slot of blueprint.slots) {
      const muscle = slot.targetMuscle;
      const currentVolume = weeklyVolume[muscle] ?? 0;
      const ceiling = getCeiling(experience, muscle);

      // Volume guard: skip accessory/isolation slots if ceiling would be exceeded
      if (slot.priority !== 'primary' && (currentVolume + slot.sets) > ceiling) {
        continue; // Skip this slot — volume ceiling reached
      }

      // Select exercise
      const exercise = selectExerciseForSlot(
        slot,
        equipmentTier,
        experience,
        weeklyUsedIds,
        exerciseDB
      );

      if (!exercise) {
        unfillableSlots.push({ dayLabel: blueprint.dayLabel, pattern: slot.pattern });
        continue;
      }

      // Track used ID across the week
      weeklyUsedIds.add(exercise.id);

      // Track weekly volume
      weeklyVolume[muscle] = (weeklyVolume[muscle] ?? 0) + slot.sets;

      // Compute estimates
      const restSeconds = getRestSeconds(slot, exercise.is_compound);
      const estCalories = (exercise.calories || 8) * slot.sets;
      const estDuration = (exercise.duration || 2) * slot.sets
        + (restSeconds / 60) * (slot.sets - 1);

      dayCalories += estCalories;
      dayDuration += estDuration;

      dayExercises.push({
        id: exercise.id,
        name: exercise.name,
        animation_url: exercise.animation_url,
        thumbnail_url: exercise.thumbnail_url,
        equipment: exercise.equipment?.name || 'Bodyweight',
        muscle,
        isCompound: exercise.is_compound,
        sets: slot.sets,
        repRange: slot.repRange,
        rest_seconds: restSeconds,
        calories: estCalories,
        duration: estDuration,
        efficiency_score: exercise.efficiency_score,
        fatigue_cost: exercise.fatigue_cost,
        slotPriority: slot.priority,
        movementPattern: slot.pattern,
      });
    }

    assembledDays.push({
      dayNumber: dayIdx + 1,
      dayLabel: blueprint.dayLabel,
      exercises: dayExercises,
      estimatedDurationMinutes: Math.round(dayDuration),
      estimatedCalories: Math.round(dayCalories),
    });
  }

  return { days: assembledDays, unfillableSlots };
}
