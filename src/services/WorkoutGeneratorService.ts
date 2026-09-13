/**
 * WorkoutGeneratorService.ts
 *
 * Evidence-based workout plan generator that selects proven online routines
 * (PPL, Upper/Lower, Full Body, Arnold Split, Calisthenics, DB-only)
 * tailored to user questionnaire answers (equipment, frequency, goal, experience, injuries).
 */

import { EXERCISE_DATABASE, ExerciseItem } from '../data/exercises/database';
import { QuestionnaireAnswers } from '../context/QuestionnaireContext';
import { AdaptiveExercise, AdaptiveDay, AdaptiveWorkoutPlan } from './AdaptiveEngine';

export type EquipmentTier = 'bodyweight' | 'dumbbells' | 'full_gym';
export type TrainingGoal = 'hypertrophy' | 'strength' | 'fat_loss' | 'endurance';
export type InjuryType = 'shoulder' | 'lower_back' | 'knee' | 'wrist_elbow';

export interface MovementSlot {
  targetMuscle: string;
  pattern: string;
  isCompound: boolean;
  priority: 'primary' | 'accessory' | 'isolation';
  defaultExerciseId: string;
  gymAlternatives: string[];
  dumbbellAlternatives: string[];
  bodyweightAlternatives: string[];
  injurySubstitutes?: {
    shoulder?: string[];
    lower_back?: string[];
    knee?: string[];
    wrist_elbow?: string[];
  };
}

export interface DayTemplate {
  dayNumber: number;
  dayLabel: string;
  focus: string;
  slots: MovementSlot[];
}

export interface ProgramTemplate {
  id: string;
  name: string;
  category: 'gym_ppl' | 'gym_upper_lower' | 'gym_full_body' | 'arnold' | 'dumbbell' | 'calisthenics';
  daysPerWeek: number;
  description: string;
  onlineReference: string;
  days: DayTemplate[];
}

// ─── Helpers to parse Questionnaire Answers ─────────────────────────

export function parseEquipmentTier(answer: string | null): EquipmentTier {
  if (!answer) return 'full_gym';
  const a = answer.toUpperCase();
  if (a.includes('NO EQUIPMENT') || a.includes('BODYWEIGHT')) return 'bodyweight';
  if (a.includes('DUMBBELL')) return 'dumbbells';
  return 'full_gym';
}

export function parseDaysPerWeek(answer: string | null): number {
  if (!answer) return 3;
  const a = answer.toUpperCase();
  if (a.includes('2')) return 2;
  if (a.includes('3')) return 3;
  if (a.includes('4')) return 4;
  if (a.includes('5')) return 5;
  if (a.includes('6')) return 6;
  return 3;
}

export function parseGoal(answer: string | null): TrainingGoal {
  if (!answer) return 'hypertrophy';
  const a = answer.toUpperCase();
  if (a.includes('STRENGTH') || a.includes('POWER')) return 'strength';
  if (a.includes('FAT') || a.includes('LOSE') || a.includes('WEIGHT') || a.includes('CUT')) return 'fat_loss';
  if (a.includes('ENDURANCE') || a.includes('STAMINA')) return 'endurance';
  return 'hypertrophy';
}

export function parseInjuries(injuriesAnswer: string[] | string | null | undefined): InjuryType[] {
  if (!injuriesAnswer) return [];
  const list = Array.isArray(injuriesAnswer) ? injuriesAnswer : [injuriesAnswer];
  const results: InjuryType[] = [];
  for (const item of list) {
    const norm = item.toLowerCase();
    if (norm.includes('shoulder') && !results.includes('shoulder')) results.push('shoulder');
    if (norm.includes('back') && !results.includes('lower_back')) results.push('lower_back');
    if (norm.includes('knee') && !results.includes('knee')) results.push('knee');
    if ((norm.includes('wrist') || norm.includes('elbow')) && !results.includes('wrist_elbow')) results.push('wrist_elbow');
  }
  return results;
}

// ─── PROVEN ONLINE PROGRAM BLUEPRINTS ─────────────────────────────────

const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  // ─── 1. FULL BODY 2-DAY (Starting Strength / Fierce 5) ─────────────
  {
    id: 'full_body_2day',
    name: '2-Day Evidence-Based Full Body Split',
    category: 'gym_full_body',
    daysPerWeek: 2,
    description: 'High-frequency 2-day full body workout hitting every major muscle group twice weekly.',
    onlineReference: 'Based on Fierce 5 & Lyle McDonald Full Body Routine',
    days: [
      {
        dayNumber: 1,
        dayLabel: 'Day 1: Full Body A',
        focus: 'Squat, Horizontal Press & Pull',
        slots: [
          {
            targetMuscle: 'Quadriceps',
            pattern: 'squat',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-full-squat-back-pov',
            gymAlternatives: ['glutes/barbell-full-squat-back-pov', 'glutes/barbell-front-squat', 'calves/sled-calf-press-on-leg-press'],
            dumbbellAlternatives: ['quads/dumbbell-single-leg-split-squat', 'quads/dumbbell-step-up-split-squat'],
            bodyweightAlternatives: ['quads/split-squats', 'glutes/bench-hip-extension'],
            injurySubstitutes: {
              lower_back: ['quads/dumbbell-single-leg-split-squat', 'calves/sled-calf-press-on-leg-press'],
              knee: ['glutes/barbell-romanian-deadlift', 'hamstrings/lever-lying-leg-curl'],
            },
          },
          {
            targetMuscle: 'Chest',
            pattern: 'horizontal_press',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'pectorals/barbell-bench-press',
            gymAlternatives: ['pectorals/barbell-bench-press', 'pectorals/lever-chest-press', 'pectorals/dumbbell-incline-bench-press'],
            dumbbellAlternatives: ['pectorals/dumbbell-incline-bench-press', 'pectorals/dumbbell-one-arm-decline-chest-press'],
            bodyweightAlternatives: ['pectorals/archer-push-up', 'abs/push-up-to-side-plank'],
            injurySubstitutes: {
              shoulder: ['pectorals/dumbbell-incline-bench-press', 'pectorals/lever-chest-press'],
              wrist_elbow: ['pectorals/dumbbell-incline-bench-press', 'pectorals/cable-seated-chest-press'],
            },
          },
          {
            targetMuscle: 'Back',
            pattern: 'vertical_pull',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'lats/cable-lat-pulldown-full-range-of-motion',
            gymAlternatives: ['lats/cable-lat-pulldown-full-range-of-motion', 'lats/assisted-pull-up', 'upper-back/cable-low-seated-row'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row', 'lats/assisted-pull-up'],
            bodyweightAlternatives: ['lats/assisted-pull-up', 'biceps/biceps-narrow-pull-ups'],
            injurySubstitutes: {
              shoulder: ['upper-back/cable-low-seated-row', 'upper-back/dumbbell-side-plank-with-rear-fly'],
            },
          },
          {
            targetMuscle: 'Hamstrings',
            pattern: 'hinge',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'glutes/barbell-romanian-deadlift',
            gymAlternatives: ['glutes/barbell-romanian-deadlift', 'hamstrings/lever-lying-leg-curl'],
            dumbbellAlternatives: ['glutes/dumbbell-romanian-deadlift'],
            bodyweightAlternatives: ['glutes/bench-hip-extension', 'glutes/resistance-band-hip-thrusts-on-knees-female'],
            injurySubstitutes: {
              lower_back: ['hamstrings/lever-lying-leg-curl', 'glutes/resistance-band-hip-thrusts-on-knees-female'],
            },
          },
          {
            targetMuscle: 'Shoulders',
            pattern: 'lateral_raise',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'delts/cable-lateral-raise',
            gymAlternatives: ['delts/cable-lateral-raise', 'delts/dumbbell-lateral-raise', 'delts/band-front-lateral-raise'],
            dumbbellAlternatives: ['delts/dumbbell-lateral-raise'],
            bodyweightAlternatives: ['delts/band-front-lateral-raise'],
          },
          {
            targetMuscle: 'Arms',
            pattern: 'tricep_isolation',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'triceps/cable-pushdown',
            gymAlternatives: ['triceps/cable-pushdown', 'triceps/cable-pushdown-with-rope-attachment'],
            dumbbellAlternatives: ['triceps/cable-pushdown-with-rope-attachment', 'triceps/barbell-lying-triceps-extension-skull-crusher'],
            bodyweightAlternatives: ['pectorals/assisted-chest-dip-kneeling'],
          },
          {
            targetMuscle: 'Core',
            pattern: 'core',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'abs/weighted-front-plank',
            gymAlternatives: ['abs/weighted-front-plank', 'abs/cable-kneeling-crunch', 'abs/hanging-leg-raise'],
            dumbbellAlternatives: ['abs/weighted-front-plank', 'abs/hanging-leg-raise'],
            bodyweightAlternatives: ['abs/weighted-front-plank', 'abs/front-plank-with-twist'],
          },
        ],
      },
      {
        dayNumber: 2,
        dayLabel: 'Day 2: Full Body B',
        focus: 'Hinge, Incline Press & Arm Focus',
        slots: [
          {
            targetMuscle: 'Glutes',
            pattern: 'hinge',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-deadlift',
            gymAlternatives: ['glutes/barbell-deadlift', 'glutes/barbell-romanian-deadlift', 'glutes/resistance-band-hip-thrusts-on-knees-female'],
            dumbbellAlternatives: ['glutes/barbell-romanian-deadlift', 'glutes/resistance-band-hip-thrusts-on-knees-female'],
            bodyweightAlternatives: ['glutes/resistance-band-hip-thrusts-on-knees-female', 'glutes/bench-hip-extension'],
            injurySubstitutes: {
              lower_back: ['glutes/resistance-band-hip-thrusts-on-knees-female', 'hamstrings/lever-lying-leg-curl'],
            },
          },
          {
            targetMuscle: 'Chest',
            pattern: 'incline_press',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'pectorals/barbell-incline-bench-press',
            gymAlternatives: ['pectorals/barbell-incline-bench-press', 'pectorals/dumbbell-incline-bench-press'],
            dumbbellAlternatives: ['pectorals/dumbbell-incline-bench-press'],
            bodyweightAlternatives: ['pectorals/archer-push-up'],
            injurySubstitutes: {
              shoulder: ['pectorals/dumbbell-incline-bench-press', 'pectorals/lever-chest-press'],
            },
          },
          {
            targetMuscle: 'Back',
            pattern: 'horizontal_row',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'upper-back/barbell-bent-over-row',
            gymAlternatives: ['upper-back/barbell-bent-over-row', 'upper-back/cable-low-seated-row'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row', 'delts/dumbbell-rear-fly'],
            bodyweightAlternatives: ['lats/assisted-pull-up'],
            injurySubstitutes: {
              lower_back: ['upper-back/cable-low-seated-row', 'lats/cable-lat-pulldown-full-range-of-motion'],
            },
          },
          {
            targetMuscle: 'Quadriceps',
            pattern: 'unilateral_squat',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'quads/dumbbell-single-leg-split-squat',
            gymAlternatives: ['quads/dumbbell-single-leg-split-squat', 'calves/sled-calf-press-on-leg-press'],
            dumbbellAlternatives: ['quads/dumbbell-single-leg-split-squat'],
            bodyweightAlternatives: ['quads/split-squats'],
            injurySubstitutes: {
              knee: ['glutes/resistance-band-hip-thrusts-on-knees-female', 'hamstrings/lever-lying-leg-curl'],
            },
          },
          {
            targetMuscle: 'Shoulders',
            pattern: 'rear_delt',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'delts/band-standing-rear-delt-row',
            gymAlternatives: ['delts/band-standing-rear-delt-row', 'delts/dumbbell-rear-fly'],
            dumbbellAlternatives: ['delts/dumbbell-rear-fly'],
            bodyweightAlternatives: ['delts/band-standing-rear-delt-row'],
          },
          {
            targetMuscle: 'Biceps',
            pattern: 'bicep_curl',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'biceps/barbell-curl',
            gymAlternatives: ['biceps/barbell-curl', 'biceps/cable-curl', 'biceps/dumbbell-alternate-biceps-curl'],
            dumbbellAlternatives: ['biceps/dumbbell-alternate-biceps-curl', 'biceps/cable-hammer-curl-with-rope'],
            bodyweightAlternatives: ['biceps/biceps-narrow-pull-ups'],
            injurySubstitutes: {
              wrist_elbow: ['biceps/cable-hammer-curl-with-rope', 'biceps/ez-barbell-close-grip-curl'],
            },
          },
          {
            targetMuscle: 'Calves',
            pattern: 'calf_raise',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'calves/barbell-standing-calf-raise',
            gymAlternatives: ['calves/barbell-standing-calf-raise', 'calves/barbell-seated-calf-raise'],
            dumbbellAlternatives: ['calves/barbell-seated-calf-raise'],
            bodyweightAlternatives: ['calves/barbell-standing-calf-raise'],
          },
        ],
      },
    ],
  },

  // ─── 2. PUSH PULL LEGS (3-Day & 6-Day Reddit PPL / Jeff Nippard) ──
  {
    id: 'ppl_3day',
    name: '3-Day Push Pull Legs (PPL)',
    category: 'gym_ppl',
    daysPerWeek: 3,
    description: 'Gold-standard 3-day Push-Pull-Legs split grouping muscle synergies for optimal recovery.',
    onlineReference: 'Based on Reddit Metallicpa PPL & Jeff Nippard Hypertrophy Guide',
    days: [
      {
        dayNumber: 1,
        dayLabel: 'Day 1: Push',
        focus: 'Chest, Shoulders & Triceps',
        slots: [
          {
            targetMuscle: 'Chest',
            pattern: 'horizontal_press',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'pectorals/barbell-bench-press',
            gymAlternatives: ['pectorals/barbell-bench-press', 'pectorals/lever-chest-press', 'pectorals/dumbbell-incline-bench-press'],
            dumbbellAlternatives: ['pectorals/dumbbell-incline-bench-press'],
            bodyweightAlternatives: ['pectorals/archer-push-up'],
            injurySubstitutes: {
              shoulder: ['pectorals/dumbbell-incline-bench-press', 'pectorals/lever-chest-press'],
              wrist_elbow: ['pectorals/dumbbell-incline-bench-press'],
            },
          },
          {
            targetMuscle: 'Chest',
            pattern: 'incline_press',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'pectorals/dumbbell-incline-bench-press',
            gymAlternatives: ['pectorals/dumbbell-incline-bench-press', 'pectorals/barbell-incline-bench-press'],
            dumbbellAlternatives: ['pectorals/dumbbell-incline-bench-press'],
            bodyweightAlternatives: ['pectorals/archer-push-up'],
          },
          {
            targetMuscle: 'Shoulders',
            pattern: 'overhead_press',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'delts/barbell-seated-overhead-press',
            gymAlternatives: ['delts/barbell-seated-overhead-press', 'delts/dumbbell-standing-overhead-press', 'delts/dumbbell-arnold-press'],
            dumbbellAlternatives: ['delts/dumbbell-standing-overhead-press', 'delts/dumbbell-arnold-press'],
            bodyweightAlternatives: ['delts/band-front-lateral-raise'],
            injurySubstitutes: {
              shoulder: ['delts/cable-lateral-raise', 'delts/dumbbell-arnold-press'],
            },
          },
          {
            targetMuscle: 'Shoulders',
            pattern: 'lateral_raise',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'delts/cable-lateral-raise',
            gymAlternatives: ['delts/cable-lateral-raise', 'delts/dumbbell-lateral-raise'],
            dumbbellAlternatives: ['delts/dumbbell-lateral-raise'],
            bodyweightAlternatives: ['delts/band-front-lateral-raise'],
          },
          {
            targetMuscle: 'Chest',
            pattern: 'chest_fly',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'delts/cable-cross-over-revers-fly',
            gymAlternatives: ['delts/cable-cross-over-revers-fly', 'pectorals/cable-one-arm-decline-chest-fly'],
            dumbbellAlternatives: ['pectorals/cable-one-arm-decline-chest-fly'],
            bodyweightAlternatives: ['pectorals/archer-push-up'],
          },
          {
            targetMuscle: 'Triceps',
            pattern: 'tricep_pushdown',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'triceps/cable-pushdown',
            gymAlternatives: ['triceps/cable-pushdown', 'triceps/cable-pushdown-with-rope-attachment'],
            dumbbellAlternatives: ['triceps/cable-pushdown-with-rope-attachment', 'triceps/barbell-lying-triceps-extension-skull-crusher'],
            bodyweightAlternatives: ['pectorals/assisted-chest-dip-kneeling'],
          },
          {
            targetMuscle: 'Triceps',
            pattern: 'overhead_extension',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'triceps/cable-high-pulley-overhead-tricep-extension',
            gymAlternatives: ['triceps/cable-high-pulley-overhead-tricep-extension', 'triceps/barbell-lying-triceps-extension-skull-crusher'],
            dumbbellAlternatives: ['triceps/barbell-lying-triceps-extension-skull-crusher'],
            bodyweightAlternatives: ['triceps/cable-pushdown'],
          },
        ],
      },
      {
        dayNumber: 2,
        dayLabel: 'Day 2: Pull',
        focus: 'Back, Rear Delts & Biceps',
        slots: [
          {
            targetMuscle: 'Glutes / Back',
            pattern: 'deadlift',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-deadlift',
            gymAlternatives: ['glutes/barbell-deadlift', 'glutes/barbell-romanian-deadlift', 'upper-back/cable-low-seated-row'],
            dumbbellAlternatives: ['glutes/barbell-romanian-deadlift'],
            bodyweightAlternatives: ['glutes/bench-hip-extension'],
            injurySubstitutes: {
              lower_back: ['upper-back/cable-low-seated-row', 'lats/cable-lat-pulldown-full-range-of-motion'],
            },
          },
          {
            targetMuscle: 'Lats',
            pattern: 'vertical_pull',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'lats/cable-lat-pulldown-full-range-of-motion',
            gymAlternatives: ['lats/cable-lat-pulldown-full-range-of-motion', 'lats/assisted-pull-up'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row'],
            bodyweightAlternatives: ['lats/assisted-pull-up'],
          },
          {
            targetMuscle: 'Upper Back',
            pattern: 'horizontal_row',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'upper-back/barbell-bent-over-row',
            gymAlternatives: ['upper-back/barbell-bent-over-row', 'upper-back/cable-low-seated-row'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row'],
            bodyweightAlternatives: ['lats/assisted-pull-up'],
            injurySubstitutes: {
              lower_back: ['upper-back/cable-low-seated-row'],
            },
          },
          {
            targetMuscle: 'Rear Delts',
            pattern: 'rear_delt',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'delts/band-standing-rear-delt-row',
            gymAlternatives: ['delts/band-standing-rear-delt-row', 'delts/dumbbell-rear-fly'],
            dumbbellAlternatives: ['delts/dumbbell-rear-fly'],
            bodyweightAlternatives: ['delts/band-standing-rear-delt-row'],
          },
          {
            targetMuscle: 'Biceps',
            pattern: 'hammer_curl',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'biceps/cable-hammer-curl-with-rope',
            gymAlternatives: ['biceps/cable-hammer-curl-with-rope', 'biceps/dumbbell-alternate-biceps-curl'],
            dumbbellAlternatives: ['biceps/dumbbell-alternate-biceps-curl'],
            bodyweightAlternatives: ['biceps/biceps-narrow-pull-ups'],
          },
          {
            targetMuscle: 'Biceps',
            pattern: 'curl',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'biceps/barbell-curl',
            gymAlternatives: ['biceps/barbell-curl', 'biceps/ez-barbell-close-grip-curl', 'biceps/cable-curl'],
            dumbbellAlternatives: ['biceps/dumbbell-incline-curl'],
            bodyweightAlternatives: ['biceps/biceps-narrow-pull-ups'],
            injurySubstitutes: {
              wrist_elbow: ['biceps/cable-hammer-curl-with-rope', 'biceps/ez-barbell-close-grip-curl'],
            },
          },
        ],
      },
      {
        dayNumber: 3,
        dayLabel: 'Day 3: Legs',
        focus: 'Quads, Hamstrings, Calves & Abs',
        slots: [
          {
            targetMuscle: 'Quadriceps',
            pattern: 'squat',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-full-squat-back-pov',
            gymAlternatives: ['glutes/barbell-full-squat-back-pov', 'glutes/barbell-front-squat', 'calves/sled-calf-press-on-leg-press'],
            dumbbellAlternatives: ['quads/dumbbell-single-leg-split-squat'],
            bodyweightAlternatives: ['quads/split-squats'],
            injurySubstitutes: {
              lower_back: ['calves/sled-calf-press-on-leg-press', 'quads/dumbbell-single-leg-split-squat'],
              knee: ['glutes/barbell-romanian-deadlift', 'hamstrings/lever-lying-leg-curl'],
            },
          },
          {
            targetMuscle: 'Hamstrings',
            pattern: 'hinge',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-romanian-deadlift',
            gymAlternatives: ['glutes/barbell-romanian-deadlift', 'hamstrings/lever-lying-leg-curl'],
            dumbbellAlternatives: ['glutes/barbell-romanian-deadlift'],
            bodyweightAlternatives: ['glutes/bench-hip-extension'],
            injurySubstitutes: {
              lower_back: ['hamstrings/lever-lying-leg-curl', 'glutes/resistance-band-hip-thrusts-on-knees-female'],
            },
          },
          {
            targetMuscle: 'Quadriceps',
            pattern: 'leg_extension',
            isCompound: false,
            priority: 'accessory',
            defaultExerciseId: 'quads/lever-leg-extension',
            gymAlternatives: ['quads/lever-leg-extension', 'quads/dumbbell-single-leg-split-squat'],
            dumbbellAlternatives: ['quads/dumbbell-single-leg-split-squat'],
            bodyweightAlternatives: ['quads/split-squats'],
            injurySubstitutes: {
              knee: ['glutes/resistance-band-hip-thrusts-on-knees-female'],
            },
          },
          {
            targetMuscle: 'Hamstrings',
            pattern: 'leg_curl',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'hamstrings/lever-lying-leg-curl',
            gymAlternatives: ['hamstrings/lever-lying-leg-curl'],
            dumbbellAlternatives: ['hamstrings/lever-lying-leg-curl'],
            bodyweightAlternatives: ['glutes/bench-hip-extension'],
          },
          {
            targetMuscle: 'Calves',
            pattern: 'calf_raise',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'calves/barbell-standing-calf-raise',
            gymAlternatives: ['calves/barbell-standing-calf-raise', 'calves/barbell-seated-calf-raise'],
            dumbbellAlternatives: ['calves/barbell-seated-calf-raise'],
            bodyweightAlternatives: ['calves/barbell-standing-calf-raise'],
          },
          {
            targetMuscle: 'Core',
            pattern: 'core',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'abs/hanging-leg-raise',
            gymAlternatives: ['abs/hanging-leg-raise', 'abs/cable-kneeling-crunch', 'abs/weighted-front-plank'],
            dumbbellAlternatives: ['abs/hanging-leg-raise', 'abs/weighted-front-plank'],
            bodyweightAlternatives: ['abs/hanging-leg-raise', 'abs/front-plank-with-twist'],
          },
        ],
      },
    ],
  },

  // ─── 3. UPPER LOWER 4-DAY (PHUL / Lyle McDonald) ───────────────────
  {
    id: 'upper_lower_4day',
    name: '4-Day Power Hypertrophy Upper Lower (PHUL)',
    category: 'gym_upper_lower',
    daysPerWeek: 4,
    description: 'Evidence-based 4-day split balancing strength progression and maximum hypertrophy stimulus.',
    onlineReference: 'Based on PHUL (Power Hypertrophy Upper Lower) & Lyle McDonald GBR',
    days: [
      {
        dayNumber: 1,
        dayLabel: 'Day 1: Upper Power',
        focus: 'Heavy Push & Pull Compounds',
        slots: [
          {
            targetMuscle: 'Chest',
            pattern: 'horizontal_press',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'pectorals/barbell-bench-press',
            gymAlternatives: ['pectorals/barbell-bench-press', 'pectorals/lever-chest-press'],
            dumbbellAlternatives: ['pectorals/dumbbell-incline-bench-press'],
            bodyweightAlternatives: ['pectorals/archer-push-up'],
            injurySubstitutes: {
              shoulder: ['pectorals/dumbbell-incline-bench-press', 'pectorals/lever-chest-press'],
            },
          },
          {
            targetMuscle: 'Back',
            pattern: 'horizontal_row',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'upper-back/barbell-bent-over-row',
            gymAlternatives: ['upper-back/barbell-bent-over-row', 'upper-back/cable-low-seated-row'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row'],
            bodyweightAlternatives: ['lats/assisted-pull-up'],
            injurySubstitutes: {
              lower_back: ['upper-back/cable-low-seated-row', 'lats/cable-lat-pulldown-full-range-of-motion'],
            },
          },
          {
            targetMuscle: 'Chest',
            pattern: 'incline_press',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'pectorals/dumbbell-incline-bench-press',
            gymAlternatives: ['pectorals/dumbbell-incline-bench-press', 'pectorals/barbell-incline-bench-press'],
            dumbbellAlternatives: ['pectorals/dumbbell-incline-bench-press'],
            bodyweightAlternatives: ['pectorals/archer-push-up'],
          },
          {
            targetMuscle: 'Lats',
            pattern: 'vertical_pull',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'lats/cable-lat-pulldown-full-range-of-motion',
            gymAlternatives: ['lats/cable-lat-pulldown-full-range-of-motion', 'lats/assisted-pull-up'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row'],
            bodyweightAlternatives: ['lats/assisted-pull-up'],
          },
          {
            targetMuscle: 'Shoulders',
            pattern: 'overhead_press',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'delts/dumbbell-standing-overhead-press',
            gymAlternatives: ['delts/dumbbell-standing-overhead-press', 'delts/barbell-seated-overhead-press'],
            dumbbellAlternatives: ['delts/dumbbell-standing-overhead-press'],
            bodyweightAlternatives: ['delts/band-front-lateral-raise'],
            injurySubstitutes: {
              shoulder: ['delts/cable-lateral-raise'],
            },
          },
          {
            targetMuscle: 'Arms',
            pattern: 'arms_superset',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'triceps/cable-pushdown',
            gymAlternatives: ['triceps/cable-pushdown', 'biceps/barbell-curl'],
            dumbbellAlternatives: ['biceps/dumbbell-alternate-biceps-curl', 'triceps/cable-pushdown-with-rope-attachment'],
            bodyweightAlternatives: ['biceps/biceps-narrow-pull-ups', 'pectorals/assisted-chest-dip-kneeling'],
          },
        ],
      },
      {
        dayNumber: 2,
        dayLabel: 'Day 2: Lower Power',
        focus: 'Squats, Hinge & Heavy Calves',
        slots: [
          {
            targetMuscle: 'Quadriceps',
            pattern: 'squat',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-full-squat-back-pov',
            gymAlternatives: ['glutes/barbell-full-squat-back-pov', 'calves/sled-calf-press-on-leg-press'],
            dumbbellAlternatives: ['quads/dumbbell-single-leg-split-squat'],
            bodyweightAlternatives: ['quads/split-squats'],
            injurySubstitutes: {
              lower_back: ['calves/sled-calf-press-on-leg-press', 'quads/dumbbell-single-leg-split-squat'],
              knee: ['glutes/barbell-romanian-deadlift'],
            },
          },
          {
            targetMuscle: 'Hamstrings',
            pattern: 'hinge',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-romanian-deadlift',
            gymAlternatives: ['glutes/barbell-romanian-deadlift', 'hamstrings/lever-lying-leg-curl'],
            dumbbellAlternatives: ['glutes/barbell-romanian-deadlift'],
            bodyweightAlternatives: ['glutes/bench-hip-extension'],
            injurySubstitutes: {
              lower_back: ['hamstrings/lever-lying-leg-curl', 'glutes/resistance-band-hip-thrusts-on-knees-female'],
            },
          },
          {
            targetMuscle: 'Quadriceps',
            pattern: 'leg_press',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'calves/sled-calf-press-on-leg-press',
            gymAlternatives: ['calves/sled-calf-press-on-leg-press', 'quads/dumbbell-single-leg-split-squat'],
            dumbbellAlternatives: ['quads/dumbbell-single-leg-split-squat'],
            bodyweightAlternatives: ['quads/split-squats'],
          },
          {
            targetMuscle: 'Hamstrings',
            pattern: 'leg_curl',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'hamstrings/lever-lying-leg-curl',
            gymAlternatives: ['hamstrings/lever-lying-leg-curl'],
            dumbbellAlternatives: ['hamstrings/lever-lying-leg-curl'],
            bodyweightAlternatives: ['glutes/bench-hip-extension'],
          },
          {
            targetMuscle: 'Calves',
            pattern: 'calf_raise',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'calves/barbell-standing-calf-raise',
            gymAlternatives: ['calves/barbell-standing-calf-raise'],
            dumbbellAlternatives: ['calves/barbell-seated-calf-raise'],
            bodyweightAlternatives: ['calves/barbell-standing-calf-raise'],
          },
          {
            targetMuscle: 'Core',
            pattern: 'core',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'abs/weighted-front-plank',
            gymAlternatives: ['abs/weighted-front-plank', 'abs/hanging-leg-raise'],
            dumbbellAlternatives: ['abs/weighted-front-plank'],
            bodyweightAlternatives: ['abs/weighted-front-plank', 'abs/front-plank-with-twist'],
          },
        ],
      },
      {
        dayNumber: 3,
        dayLabel: 'Day 3: Upper Hypertrophy',
        focus: 'Incline, Flyes & Arm Volume',
        slots: [
          {
            targetMuscle: 'Chest',
            pattern: 'incline_press',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'pectorals/barbell-incline-bench-press',
            gymAlternatives: ['pectorals/barbell-incline-bench-press', 'pectorals/dumbbell-incline-bench-press'],
            dumbbellAlternatives: ['pectorals/dumbbell-incline-bench-press'],
            bodyweightAlternatives: ['pectorals/archer-push-up'],
          },
          {
            targetMuscle: 'Back',
            pattern: 'vertical_pull',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'lats/assisted-pull-up',
            gymAlternatives: ['lats/assisted-pull-up', 'lats/cable-lat-pulldown-full-range-of-motion'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row'],
            bodyweightAlternatives: ['lats/assisted-pull-up'],
          },
          {
            targetMuscle: 'Chest',
            pattern: 'chest_fly',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'pectorals/cable-one-arm-decline-chest-fly',
            gymAlternatives: ['pectorals/cable-one-arm-decline-chest-fly', 'delts/cable-cross-over-revers-fly'],
            dumbbellAlternatives: ['pectorals/cable-one-arm-decline-chest-fly'],
            bodyweightAlternatives: ['abs/push-up-to-side-plank'],
          },
          {
            targetMuscle: 'Back',
            pattern: 'horizontal_row',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'upper-back/cable-low-seated-row',
            gymAlternatives: ['upper-back/cable-low-seated-row'],
            dumbbellAlternatives: ['upper-back/cable-low-seated-row'],
            bodyweightAlternatives: ['lats/assisted-pull-up'],
          },
          {
            targetMuscle: 'Shoulders',
            pattern: 'lateral_raise',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'delts/cable-lateral-raise',
            gymAlternatives: ['delts/cable-lateral-raise', 'delts/dumbbell-lateral-raise'],
            dumbbellAlternatives: ['delts/dumbbell-lateral-raise'],
            bodyweightAlternatives: ['delts/band-front-lateral-raise'],
          },
          {
            targetMuscle: 'Biceps',
            pattern: 'curl',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'biceps/dumbbell-alternate-biceps-curl',
            gymAlternatives: ['biceps/dumbbell-alternate-biceps-curl', 'biceps/barbell-curl'],
            dumbbellAlternatives: ['biceps/dumbbell-alternate-biceps-curl'],
            bodyweightAlternatives: ['biceps/biceps-narrow-pull-ups'],
          },
          {
            targetMuscle: 'Triceps',
            pattern: 'tricep_extension',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'triceps/barbell-lying-triceps-extension-skull-crusher',
            gymAlternatives: ['triceps/barbell-lying-triceps-extension-skull-crusher', 'triceps/cable-pushdown-with-rope-attachment'],
            dumbbellAlternatives: ['triceps/cable-pushdown-with-rope-attachment'],
            bodyweightAlternatives: ['triceps/cable-pushdown'],
          },
        ],
      },
      {
        dayNumber: 4,
        dayLabel: 'Day 4: Lower Hypertrophy',
        focus: 'Deadlift, Unilateral Work & Core',
        slots: [
          {
            targetMuscle: 'Glutes',
            pattern: 'deadlift',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'glutes/barbell-deadlift',
            gymAlternatives: ['glutes/barbell-deadlift', 'glutes/barbell-romanian-deadlift'],
            dumbbellAlternatives: ['glutes/barbell-romanian-deadlift'],
            bodyweightAlternatives: ['glutes/bench-hip-extension'],
            injurySubstitutes: {
              lower_back: ['glutes/resistance-band-hip-thrusts-on-knees-female', 'calves/sled-calf-press-on-leg-press'],
            },
          },
          {
            targetMuscle: 'Quadriceps',
            pattern: 'split_squat',
            isCompound: true,
            priority: 'primary',
            defaultExerciseId: 'quads/dumbbell-single-leg-split-squat',
            gymAlternatives: ['quads/dumbbell-single-leg-split-squat', 'glutes/sled-hack-squat'],
            dumbbellAlternatives: ['quads/dumbbell-single-leg-split-squat'],
            bodyweightAlternatives: ['quads/split-squats'],
          },
          {
            targetMuscle: 'Glutes',
            pattern: 'hip_thrust',
            isCompound: true,
            priority: 'accessory',
            defaultExerciseId: 'glutes/resistance-band-hip-thrusts-on-knees-female',
            gymAlternatives: ['glutes/resistance-band-hip-thrusts-on-knees-female'],
            dumbbellAlternatives: ['glutes/resistance-band-hip-thrusts-on-knees-female'],
            bodyweightAlternatives: ['glutes/resistance-band-hip-thrusts-on-knees-female'],
          },
          {
            targetMuscle: 'Hamstrings',
            pattern: 'leg_curl',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'hamstrings/lever-lying-leg-curl',
            gymAlternatives: ['hamstrings/lever-lying-leg-curl'],
            dumbbellAlternatives: ['hamstrings/lever-lying-leg-curl'],
            bodyweightAlternatives: ['glutes/bench-hip-extension'],
          },
          {
            targetMuscle: 'Calves',
            pattern: 'calf_raise',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'calves/barbell-seated-calf-raise',
            gymAlternatives: ['calves/barbell-seated-calf-raise'],
            dumbbellAlternatives: ['calves/barbell-seated-calf-raise'],
            bodyweightAlternatives: ['calves/barbell-standing-calf-raise'],
          },
          {
            targetMuscle: 'Core',
            pattern: 'core',
            isCompound: false,
            priority: 'isolation',
            defaultExerciseId: 'abs/hanging-leg-raise',
            gymAlternatives: ['abs/hanging-leg-raise', 'abs/cable-kneeling-crunch'],
            dumbbellAlternatives: ['abs/hanging-leg-raise'],
            bodyweightAlternatives: ['abs/hanging-leg-raise', 'abs/front-plank-with-twist'],
          },
        ],
      },
    ],
  },
];

// ─── MAIN GENERATOR SERVICE ──────────────────────────────────────────

export class WorkoutGeneratorService {
  /**
   * Generates a fully personalized AdaptiveWorkoutPlan based on Questionnaire Answers.
   */
  static generatePlan(answers?: QuestionnaireAnswers): AdaptiveWorkoutPlan {
    const equipment = parseEquipmentTier(answers?.equipment ?? null);
    const daysPerWeek = parseDaysPerWeek(answers?.weeklyGoal ?? null);
    const goal = parseGoal(answers?.goal ?? null);
    const injuries = parseInjuries(answers?.injuries);

    // 1. Select the closest program archetype
    const template = this.selectProgramTemplate(daysPerWeek, equipment);

    // 2. Resolve each day and its exercise slots
    const resolvedDays: AdaptiveDay[] = template.days.map((dayTemplate) => {
      let dayDuration = 0;
      let dayCalories = 0;
      const usedExerciseIds = new Set<string>();

      const exercises: AdaptiveExercise[] = dayTemplate.slots.map((slot) => {
        // Resolve best exercise ID considering equipment and injuries
        const exerciseId = this.resolveSlotExercise(slot, equipment, injuries, usedExerciseIds);
        usedExerciseIds.add(exerciseId);
        const item = EXERCISE_DATABASE[exerciseId] || this.getFallbackItem(slot);

        // Calibrate sets & reps according to user goal
        const prescription = this.calibratePrescription(slot, goal, item.isCompound);

        const estCal = (item.isCompound ? 10 : 7) * prescription.sets;
        const estDur = Math.round(prescription.sets * 2.5 + ((prescription.restSeconds / 60) * (prescription.sets - 1)));

        dayCalories += estCal;
        dayDuration += estDur;

        return {
          id: item.id,
          name: item.name,
          equipment: item.equipment,
          muscle: item.primaryMuscle,
          isCompound: item.isCompound,
          sets: prescription.sets,
          repRange: prescription.repRange,
          rest_seconds: prescription.restSeconds,
          calories: estCal,
          duration: estDur,
          animation_url: item.gifUrl,
          thumbnail_url: item.thumbnailUrl || item.gifUrl,
          progressiveOverloadTip: this.getProgressiveTip(item.isCompound, goal),
          prescription: {
            sets: prescription.sets,
            repsTarget: prescription.repsTarget,
            weightKg: 0,
            progressionNote: `Aim for ${prescription.repRange} reps. Increase weight when hitting top of rep range.`,
            target_sets: prescription.sets,
            target_reps: prescription.repRange,
            rest_seconds: prescription.restSeconds,
          },
        };
      });

      return {
        dayNumber: dayTemplate.dayNumber,
        dayLabel: dayTemplate.dayLabel,
        focus: dayTemplate.focus,
        exercises,
        estimatedDurationMinutes: Math.max(35, Math.round(dayDuration)),
        estimatedCalories: Math.max(220, Math.round(dayCalories)),
      };
    });

    const injuryNotice = injuries.length > 0
      ? ` | Biomechanically adjusted for ${injuries.join(', ')} protection.`
      : '';

    return {
      generatedAt: new Date().toISOString(),
      programId: template.id,
      programName: `${template.name}${injuryNotice}`,
      days: resolvedDays,
      progressiveOverloadNotice:
        'Evidence-Based Progressive Overload Active: Add 1 rep per workout until you hit the upper rep target, then increase weight by 2.5%–5%.',
    };
  }

  /**
   * Generates a complete 30-day schedule with workout and active recovery days.
   */
  static generateAdaptive30DayPlan(answers?: QuestionnaireAnswers): AdaptiveWorkoutPlan {
    const basePlan = this.generatePlan(answers);
    const daysPerWeek = parseDaysPerWeek(answers?.weeklyGoal ?? null);
    const routineDays = basePlan.days;

    const thirtyDayPlan: AdaptiveDay[] = [];
    let routineCycleIdx = 0;

    for (let dayNum = 1; dayNum <= 30; dayNum++) {
      const dayOfWeekMod = (dayNum - 1) % 7;
      let isWorkoutDay = true;

      if (daysPerWeek === 2) {
        isWorkoutDay = dayOfWeekMod === 0 || dayOfWeekMod === 3;
      } else if (daysPerWeek === 3) {
        isWorkoutDay = dayOfWeekMod === 0 || dayOfWeekMod === 2 || dayOfWeekMod === 4;
      } else if (daysPerWeek === 4) {
        isWorkoutDay = dayOfWeekMod === 0 || dayOfWeekMod === 1 || dayOfWeekMod === 3 || dayOfWeekMod === 4;
      } else if (daysPerWeek === 5) {
        isWorkoutDay = dayOfWeekMod !== 2 && dayOfWeekMod !== 6;
      } else {
        isWorkoutDay = dayOfWeekMod !== 6;
      }

      if (isWorkoutDay) {
        const routineDay = routineDays[routineCycleIdx % routineDays.length];
        routineCycleIdx++;

        const reindexedExercises = routineDay.exercises.map((ex, idx) => ({
          ...ex,
          id: `p30_d${dayNum}_ex${idx}_${ex.id.replace(/\//g, '_')}`,
        }));

        thirtyDayPlan.push({
          dayNumber: dayNum,
          dayLabel: `Day ${dayNum}: ${routineDay.dayLabel.split(': ')[1] || routineDay.dayLabel}`,
          focus: routineDay.focus,
          isRestDay: false,
          exercises: reindexedExercises,
          estimatedDurationMinutes: routineDay.estimatedDurationMinutes,
          estimatedCalories: routineDay.estimatedCalories,
        });
      } else {
        // Recovery day
        const plankEx = EXERCISE_DATABASE['abs/weighted-front-plank'] || EXERCISE_DATABASE['abs/front-plank-with-twist'];
        thirtyDayPlan.push({
          dayNumber: dayNum,
          dayLabel: `Day ${dayNum}: Active Recovery`,
          focus: 'Mobility, Core & Muscle Recovery',
          isRestDay: true,
          exercises: [
            {
              id: `p30_d${dayNum}_ex0_recovery_plank`,
              name: plankEx ? plankEx.name : 'Core Plank Hold',
              equipment: plankEx ? plankEx.equipment : 'Bodyweight',
              muscle: 'Core',
              isCompound: false,
              sets: 2,
              repRange: '45-60 sec',
              rest_seconds: 60,
              calories: 25,
              duration: 5,
              animation_url: plankEx ? plankEx.gifUrl : 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/weighted-front-plank.gif',
              thumbnail_url: plankEx ? plankEx.thumbnailUrl : 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/weighted-front-plank.gif',
              progressiveOverloadTip: 'Focus on diaphragmatic breathing and deep pelvic floor engagement.',
              prescription: {
                sets: 2,
                repsTarget: 45,
                weightKg: 0,
                progressionNote: 'Focus on core stabilization and recovery.',
                target_sets: 2,
                target_reps: '45-60 sec',
                rest_seconds: 60,
              },
            },
          ],
          estimatedDurationMinutes: 15,
          estimatedCalories: 50,
        });
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      programId: basePlan.programId,
      programName: basePlan.programName,
      days: thirtyDayPlan,
      progressiveOverloadNotice: basePlan.progressiveOverloadNotice,
    };
  }

  /**
   * Selects the best program blueprint for given frequency and equipment.
   */
  private static selectProgramTemplate(days: number, equipment: EquipmentTier): ProgramTemplate {
    if (days <= 2) {
      return PROGRAM_TEMPLATES.find((p) => p.id === 'full_body_2day') || PROGRAM_TEMPLATES[0];
    }
    if (days === 4) {
      return PROGRAM_TEMPLATES.find((p) => p.id === 'upper_lower_4day') || PROGRAM_TEMPLATES[0];
    }
    // Default 3, 5, or 6 days -> PPL
    return PROGRAM_TEMPLATES.find((p) => p.id === 'ppl_3day') || PROGRAM_TEMPLATES[0];
  }

  /**
   * Resolves the optimal exercise for a given movement slot considering equipment, injury constraints, and variety.
   */
  private static resolveSlotExercise(
    slot: MovementSlot,
    equipment: EquipmentTier,
    injuries: InjuryType[],
    excludeIds: Set<string> = new Set()
  ): string {
    // Check if any active injury requires substituting this slot
    if (slot.injurySubstitutes) {
      for (const injury of injuries) {
        const subs = slot.injurySubstitutes[injury];
        if (subs && subs.length > 0) {
          // Find substitutes available for this equipment tier
          const validSubs = subs.filter(
            (subId) => EXERCISE_DATABASE[subId] && this.isEquipmentCompatible(EXERCISE_DATABASE[subId].equipment, equipment)
          );
          if (validSubs.length > 0) {
            const available = validSubs.filter((id) => !excludeIds.has(id));
            const pool = available.length > 0 ? available : validSubs;
            return pool[Math.floor(Math.random() * pool.length)];
          }
        }
      }
    }

    // Otherwise, gather candidates matching user equipment tier
    let candidates: string[] = [];
    if (equipment === 'bodyweight') {
      candidates = slot.bodyweightAlternatives.filter((id) => EXERCISE_DATABASE[id]);
    } else if (equipment === 'dumbbells') {
      candidates = slot.dumbbellAlternatives.filter((id) => EXERCISE_DATABASE[id]);
    } else {
      candidates = slot.gymAlternatives.filter((id) => EXERCISE_DATABASE[id]);
    }

    // If candidates pool has fewer than 3 options, discover compatible exercises from EXERCISE_DATABASE
    if (candidates.length < 3) {
      const targetLower = slot.targetMuscle.toLowerCase();
      const dbMatches = Object.keys(EXERCISE_DATABASE).filter((key) => {
        const item = EXERCISE_DATABASE[key];
        if (!item) return false;
        const itemMuscle = (item.primaryMuscle || '').toLowerCase();
        const matchesMuscle =
          itemMuscle === targetLower ||
          targetLower.includes(itemMuscle) ||
          itemMuscle.includes(targetLower) ||
          (targetLower.includes('core') && itemMuscle.includes('abs')) ||
          (targetLower.includes('abs') && itemMuscle.includes('core')) ||
          (targetLower.includes('back') && (itemMuscle.includes('lats') || itemMuscle.includes('traps'))) ||
          (targetLower.includes('arms') && (itemMuscle.includes('biceps') || itemMuscle.includes('triceps')));

        if (!matchesMuscle) return false;
        if (!this.isEquipmentCompatible(item.equipment, equipment)) return false;
        if (slot.isCompound && !item.isCompound && candidates.length > 0) return false;
        return true;
      });

      for (const dbId of dbMatches) {
        if (!candidates.includes(dbId)) {
          candidates.push(dbId);
        }
      }
    }

    if (candidates.length > 0) {
      const available = candidates.filter((id) => !excludeIds.has(id));
      const pool = available.length > 0 ? available : candidates;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Default fallback
    return slot.defaultExerciseId;
  }

  private static isEquipmentCompatible(itemEquip: string, userTier: EquipmentTier): boolean {
    if (userTier === 'full_gym') return true;
    if (userTier === 'dumbbells') {
      return ['Dumbbells', 'Bodyweight', 'Resistance Bands'].includes(itemEquip);
    }
    return ['Bodyweight', 'Resistance Bands'].includes(itemEquip);
  }

  private static calibratePrescription(
    slot: MovementSlot,
    goal: TrainingGoal,
    isCompound: boolean
  ): { sets: number; repRange: string; repsTarget: number; restSeconds: number } {
    if (goal === 'strength') {
      if (isCompound) {
        return { sets: 4, repRange: '4-6', repsTarget: 5, restSeconds: 180 };
      }
      return { sets: 3, repRange: '6-8', repsTarget: 8, restSeconds: 120 };
    }

    if (goal === 'fat_loss' || goal === 'endurance') {
      if (isCompound) {
        return { sets: 3, repRange: '10-12', repsTarget: 12, restSeconds: 75 };
      }
      return { sets: 3, repRange: '12-15', repsTarget: 15, restSeconds: 60 };
    }

    // Default Hypertrophy / Muscle Building
    if (isCompound) {
      return { sets: 4, repRange: '6-8', repsTarget: 8, restSeconds: 120 };
    }
    return { sets: 3, repRange: '10-12', repsTarget: 12, restSeconds: 90 };
  }

  private static getProgressiveTip(isCompound: boolean, goal: TrainingGoal): string {
    if (goal === 'strength') {
      return isCompound
        ? 'Power Focus: Rest 3 mins. Prioritize maximal bar speed with flawless bracing.'
        : 'Accessory Strength: Maintain 2 RIR (Reps in Reserve) to build structural support.';
    }
    if (goal === 'fat_loss') {
      return 'Metabolic Density: Keep rest intervals short (60s) to elevate heart rate and maximize caloric expenditure.';
    }
    return isCompound
      ? 'Hypertrophy Focus: Double progression: hit 8 reps across all sets before adding 2.5kg.'
      : 'Targeted Isolation: Focus on deep stretch and peak contraction with a 3-second eccentric tempo.';
  }

  private static getFallbackItem(slot: MovementSlot): ExerciseItem {
    return {
      id: slot.defaultExerciseId,
      name: slot.targetMuscle + ' Movement',
      description: 'Perform with controlled tempo and strict form.',
      primaryMuscle: slot.targetMuscle as any,
      secondaryMuscles: [],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      category: 'Strength',
      movementPattern: 'Push',
      bodyRegion: 'Full Body',
      isCompound: slot.isCompound,
      gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-curl.gif',
      thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-curl.gif',
      instructions: ['Set up safely.', 'Execute repetition with control.'],
      formTips: ['Keep core braced.'],
      commonMistakes: ['Avoid rushing reps.'],
      safetyTips: ['Warm up properly.'],
      setsRepsRecommendation: '3 SETS × 8 - 12 REPS',
    };
  }
}
