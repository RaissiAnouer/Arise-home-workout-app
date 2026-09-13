import { EXERCISE_DATABASE, ExerciseItem } from '../data/exercises/database';
import { STRUCTURED_WORKOUT_PLANS } from '../data/plans/structuredPlans';
import { StructuredWorkoutPlan, WorkoutDayPlan, PlanExerciseRef } from '../data/plans/types';
import { AdaptiveExercise, AdaptiveDay, AdaptiveWorkoutPlan } from './AdaptiveEngine';

export interface ResolvedExercise {
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  isCompound: boolean;
  gifUrl: string;
  thumbnailUrl?: string;
  sets: number;
  repRange: string;
  restSeconds: number;
  instructions: string[];
  formTips: string[];
}

export interface ResolvedDay {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: ResolvedExercise[];
  estimatedDurationMinutes: number;
  estimatedCalories: number;
}

export interface ResolvedPlan {
  id: string;
  name: string;
  daysPerWeek: number;
  description: string;
  days: ResolvedDay[];
}

/**
 * Service to manage, resolve, and hydrate structured workout plans.
 */
export class PlanResolverService {
  /**
   * Retrieves an exercise item by exerciseId from master database.
   */
  static getExercise(exerciseId: string): ExerciseItem | undefined {
    return EXERCISE_DATABASE[exerciseId];
  }

  /**
   * Returns all available structured workout plans.
   */
  static getAllPlans(): StructuredWorkoutPlan[] {
    return STRUCTURED_WORKOUT_PLANS;
  }

  /**
   * Finds a workout plan by plan ID.
   */
  static getPlanById(planId: string): StructuredWorkoutPlan | undefined {
    return STRUCTURED_WORKOUT_PLANS.find(p => p.id === planId);
  }

  /**
   * Finds plans matching specific daysPerWeek.
   */
  static getPlansByDays(daysPerWeek: number): StructuredWorkoutPlan[] {
    return STRUCTURED_WORKOUT_PLANS.filter(p => p.daysPerWeek === daysPerWeek);
  }

  /**
   * Resolves a PlanExerciseRef into a fully hydrated ResolvedExercise object.
   */
  static resolveExerciseRef(ref: PlanExerciseRef): ResolvedExercise {
    const base = EXERCISE_DATABASE[ref.exerciseId];
    if (!base) {
      // Fallback if exerciseId is not found
      return {
        exerciseId: ref.exerciseId,
        name: ref.exerciseId.replace(/_/g, ' ').toUpperCase(),
        primaryMuscle: 'Full Body',
        secondaryMuscles: [],
        equipment: 'Gym Equipment',
        difficulty: 'Intermediate',
        isCompound: true,
        gifUrl: 'https://static.exercisedb.dev/media/RYcV1kH.gif',
        thumbnailUrl: 'https://static.exercisedb.dev/media/RYcV1kH.gif',
        sets: ref.sets,
        repRange: ref.repRange,
        restSeconds: ref.restSeconds || 90,
        instructions: ['Perform sets as prescribed.'],
        formTips: ['Keep core braced.'],
      };
    }

    return {
      exerciseId: base.id,
      name: base.name,
      primaryMuscle: base.primaryMuscle,
      secondaryMuscles: base.secondaryMuscles,
      equipment: base.equipment,
      difficulty: base.difficulty,
      isCompound: base.isCompound,
      gifUrl: base.gifUrl,
      thumbnailUrl: base.thumbnailUrl || base.gifUrl,
      sets: ref.sets,
      repRange: ref.repRange,
      restSeconds: ref.restSeconds || (base.isCompound ? 150 : 90),
      instructions: base.instructions,
      formTips: base.formTips,
    };
  }

  /**
   * Hydrates a single WorkoutDayPlan into a ResolvedDay object.
   */
  static resolveDay(day: WorkoutDayPlan): ResolvedDay {
    let dayCalories = 0;
    let dayDuration = 0;

    const resolvedExercises = day.exercises.map((ref) => {
      const resolved = this.resolveExerciseRef(ref);
      const isComp = resolved.isCompound;
      const estCal = (isComp ? 10 : 7) * resolved.sets;
      const estDur = Math.round((resolved.sets * 2.5) + ((resolved.restSeconds / 60) * (resolved.sets - 1)));

      dayCalories += estCal;
      dayDuration += estDur;

      return resolved;
    });

    return {
      dayNumber: day.dayNumber,
      dayName: day.dayName,
      focus: day.focus,
      exercises: resolvedExercises,
      estimatedDurationMinutes: Math.round(dayDuration),
      estimatedCalories: Math.round(dayCalories),
    };
  }

  /**
   * Hydrates a full StructuredWorkoutPlan into a ResolvedPlan object.
   */
  static resolvePlan(plan: StructuredWorkoutPlan): ResolvedPlan {
    return {
      id: plan.id,
      name: plan.name,
      daysPerWeek: plan.daysPerWeek,
      description: plan.description,
      days: plan.days.map((day) => this.resolveDay(day)),
    };
  }

  /**
   * Converts a StructuredWorkoutPlan into the AdaptiveWorkoutPlan format
   * consumed by the app's components (ExerciseCard, WorkoutSessionScreen, etc.).
   */
  static toAdaptivePlan(plan: StructuredWorkoutPlan): AdaptiveWorkoutPlan {
    const daysPerWeek = plan.daysPerWeek;
    const routineDays = plan.days;

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

        let dayCalories = 0;
        let dayDuration = 0;

        const exercises: AdaptiveExercise[] = routineDay.exercises.map((ref, idx) => {
          const resolved = this.resolveExerciseRef(ref);
          const isComp = resolved.isCompound;
          const restSec = resolved.restSeconds;
          const estCal = (isComp ? 10 : 7) * resolved.sets;
          const estDur = Math.round((resolved.sets * 2.5) + ((restSec / 60) * (resolved.sets - 1)));

          dayCalories += estCal;
          dayDuration += estDur;

          return {
            id: `p30_d${dayNum}_ex${idx}_${resolved.exerciseId}`,
            name: resolved.name,
            equipment: resolved.equipment,
            muscle: resolved.primaryMuscle,
            isCompound: isComp,
            sets: resolved.sets,
            repRange: resolved.repRange,
            rest_seconds: restSec,
            calories: estCal,
            duration: estDur,
            animation_url: resolved.gifUrl,
            thumbnail_url: resolved.thumbnailUrl || resolved.gifUrl,
            prescription: {
              sets: resolved.sets,
              repsTarget: parseInt(resolved.repRange.split('-')[0], 10) || 8,
              weightKg: 0,
              progressionNote: 'Increase weight by 2.5-5% when achieving top of rep range.',
              target_sets: resolved.sets,
              target_reps: resolved.repRange,
              rest_seconds: restSec,
            },
          };
        });

        thirtyDayPlan.push({
          dayNumber: dayNum,
          dayLabel: `Day ${dayNum}: ${routineDay.dayName}`,
          focus: routineDay.focus,
          isRestDay: false,
          exercises,
          estimatedDurationMinutes: Math.round(dayDuration),
          estimatedCalories: Math.round(dayCalories),
        });
      } else {
        // Recovery day
        const recoveryEx = this.resolveExerciseRef({ exerciseId: 'plank', sets: 2, repRange: '45-60 sec' });
        thirtyDayPlan.push({
          dayNumber: dayNum,
          dayLabel: `Day ${dayNum}: Active Recovery`,
          focus: 'Mobility, Core & Muscle Recovery',
          isRestDay: true,
          exercises: [
            {
              id: `p30_d${dayNum}_ex0_plank`,
              name: recoveryEx.name,
              equipment: recoveryEx.equipment,
              muscle: recoveryEx.primaryMuscle,
              isCompound: false,
              sets: 2,
              repRange: '45-60 sec',
              rest_seconds: 60,
              calories: 20,
              duration: 5,
              animation_url: recoveryEx.gifUrl,
              thumbnail_url: recoveryEx.thumbnailUrl || recoveryEx.gifUrl,
              prescription: {
                sets: 2,
                repsTarget: 45,
                weightKg: 0,
                progressionNote: 'Focus on core stabilization.',
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
      programId: plan.id,
      programName: plan.name,
      days: thirtyDayPlan,
      progressiveOverloadNotice: 'Progressive Overload: When you hit top of rep range for all sets, increase weight by 2.5% to 5%.',
    };
  }
}
