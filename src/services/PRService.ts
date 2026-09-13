import { WorkoutSession, PRResult, PRType } from '../types/workoutSession';
import { calculate1RM } from '../utils/workoutStats';

export class PRService {
  /**
   * Checks if a completed set breaks a Personal Record across historical sessions
   */
  static checkSetPR(
    exerciseId: string,
    weight: number,
    reps: number,
    history: WorkoutSession[]
  ): PRResult {
    if (weight <= 0 || reps <= 0) {
      return { isPR: false };
    }

    const current1RM = calculate1RM(weight, reps);
    const currentSetVolume = weight * reps;

    let maxHistoricalWeight = 0;
    let maxHistoricalReps = 0;
    let maxHistorical1RM = 0;
    let maxHistoricalVolume = 0;

    // Scan through all completed sessions for historical bests of this exercise
    history.forEach((session) => {
      session.exercises.forEach((ex) => {
        if (ex.exerciseId === exerciseId || ex.exerciseName.toLowerCase() === exerciseId.toLowerCase()) {
          ex.sets.forEach((set) => {
            if (set.completed) {
              if (set.weight > maxHistoricalWeight) {
                maxHistoricalWeight = set.weight;
              }
              if (set.weight === weight && set.reps > maxHistoricalReps) {
                maxHistoricalReps = set.reps;
              }
              const past1RM = calculate1RM(set.weight, set.reps);
              if (past1RM > maxHistorical1RM) {
                maxHistorical1RM = past1RM;
              }
              const pastVol = set.weight * set.reps;
              if (pastVol > maxHistoricalVolume) {
                maxHistoricalVolume = pastVol;
              }
            }
          });
        }
      });
    });

    // Check PR criteria
    if (weight > maxHistoricalWeight && maxHistoricalWeight > 0) {
      return {
        isPR: true,
        prType: 'weight',
        estimated1RM: current1RM,
        previousBestWeight: maxHistoricalWeight,
      };
    }

    if (current1RM > maxHistorical1RM && maxHistorical1RM > 0) {
      return {
        isPR: true,
        prType: 'oneRM',
        estimated1RM: current1RM,
      };
    }

    if (reps > maxHistoricalReps && maxHistoricalReps > 0) {
      return {
        isPR: true,
        prType: 'reps',
        previousBestReps: maxHistoricalReps,
      };
    }

    if (currentSetVolume > maxHistoricalVolume && maxHistoricalVolume > 0) {
      return {
        isPR: true,
        prType: 'volume',
      };
    }

    return { isPR: false, estimated1RM: current1RM };
  }
}
