import { WorkoutSession, SessionStats, ExerciseSet } from '../types/workoutSession';

/**
 * Calculates estimated 1 Rep Max using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Calculates total volume for a single set (weight * reps)
 */
export function calculateSetVolume(set: ExerciseSet): number {
  if (!set.completed) return 0;
  return set.weight * set.reps;
}

/**
 * Summarizes statistics for an entire workout session
 */
export function calculateSessionStats(session: WorkoutSession): SessionStats {
  let totalVolume = 0;
  let totalReps = 0;
  let totalSets = 0;
  let completedExercises = 0;
  let prCount = 0;

  session.exercises.forEach((ex) => {
    let exCompletedSets = 0;

    ex.sets.forEach((set) => {
      if (set.completed) {
        totalVolume += set.weight * set.reps;
        totalReps += set.reps;
        totalSets += 1;
        exCompletedSets += 1;
        if (set.isPR) {
          prCount += 1;
        }
      }
    });

    if (ex.sets.length > 0 && exCompletedSets === ex.sets.length) {
      completedExercises += 1;
    }
  });

  const totalExercises = session.exercises.length;
  const completionPercentage =
    totalExercises > 0
      ? Math.min(100, Math.round((completedExercises / totalExercises) * 100))
      : 0;

  return {
    totalVolume,
    totalReps,
    totalSets,
    durationSeconds: session.durationSeconds,
    completedExercises,
    totalExercises,
    completionPercentage,
    prCount,
  };
}

/**
 * Formats duration seconds into HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
