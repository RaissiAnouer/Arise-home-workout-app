import { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkoutSession, ExerciseSet, SessionStats } from '../types/workoutSession';
import { WorkoutSessionService } from '../services/WorkoutSessionService';
import { calculateSessionStats } from '../utils/workoutStats';

interface UseWorkoutSessionProps {
  userId: string;
  workoutPlanId?: string;
  workoutDayId?: number | string;
  dayTitle?: string;
  initialExercises?: { id: string; name: string; setsCount: number; targetWeight?: number; targetReps?: number }[];
  autoStart?: boolean;
}

export function useWorkoutSession({
  userId,
  workoutPlanId = 'default_plan',
  workoutDayId = 1,
  dayTitle = 'Workout Session',
  initialExercises = [],
  autoStart = true,
}: UseWorkoutSessionProps) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prFlashMessage, setPrFlashMessage] = useState<string | null>(null);

  // Initialize or resume workout session
  const initSession = useCallback(async () => {
    try {
      let active = await WorkoutSessionService.resumeWorkout(userId);
      if (!active && autoStart) {
        active = await WorkoutSessionService.startWorkout(
          userId,
          workoutPlanId,
          workoutDayId,
          dayTitle,
          initialExercises
        );
      }
      setSession(active);
    } catch (e) {
      console.error('[useWorkoutSession] Failed to initialize session', e);
    } finally {
      setIsLoaded(true);
    }
  }, [userId, workoutPlanId, workoutDayId, dayTitle, initialExercises, autoStart]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Update a single set
  const updateSet = useCallback(
    async (exerciseId: string, setIndex: number, updates: Partial<ExerciseSet>) => {
      if (!session) return;
      const updated = await WorkoutSessionService.updateSet(session, exerciseId, setIndex, updates);
      setSession({ ...updated });
    },
    [session]
  );

  // Complete a single set (with automatic PR check)
  const completeSet = useCallback(
    async (exerciseId: string, setIndex: number) => {
      if (!session) return;
      const { session: updated, isPR } = await WorkoutSessionService.completeSet(
        session,
        exerciseId,
        setIndex
      );
      setSession({ ...updated });

      if (isPR) {
        setPrFlashMessage(`🏆 NEW PERSONAL RECORD!`);
        setTimeout(() => setPrFlashMessage(null), 3000);
      }
    },
    [session]
  );

  // Complete an entire exercise
  const completeExercise = useCallback(
    async (exerciseId: string) => {
      if (!session) return;
      const updated = await WorkoutSessionService.completeExercise(session, exerciseId);
      setSession({ ...updated });
    },
    [session]
  );

  // Add a new set to an exercise
  const addSet = useCallback(
    async (exerciseId: string) => {
      if (!session) return;
      const ex = session.exercises.find((e) => e.exerciseId === exerciseId || e.exerciseName === exerciseId);
      if (!ex) return;

      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: ExerciseSet = {
        id: `set_${ex.exerciseId}_${ex.sets.length + 1}_${Date.now()}`,
        setNumber: ex.sets.length + 1,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
        setType: 'normal',
      };

      ex.sets.push(newSet);
      const updated = await WorkoutSessionService.updateSet(session, exerciseId, ex.sets.length - 1, {});
      setSession({ ...updated });
    },
    [session]
  );

  // Pause session
  const pauseSession = useCallback(async () => {
    if (!session) return;
    const updated = await WorkoutSessionService.pauseWorkout(session);
    setSession({ ...updated });
  }, [session]);

  // Finish session
  const finishSession = useCallback(async () => {
    if (!session) return null;
    const completed = await WorkoutSessionService.finishWorkout(session);
    setSession(null);
    return completed;
  }, [session]);

  // Cancel/Abandon session
  const cancelSession = useCallback(async () => {
    if (!session) return;
    await WorkoutSessionService.cancelWorkout(session);
    setSession(null);
  }, [session]);

  // Update timer in session
  const updateTimer = useCallback(
    (durationSeconds: number) => {
      if (!session) return;
      session.durationSeconds = durationSeconds;
      WorkoutSessionService.updateSet(session, '', -1, {}); // trigger background persist
    },
    [session]
  );

  // Calculate live statistics
  const stats: SessionStats = useMemo(() => {
    if (!session) {
      return {
        totalVolume: 0,
        totalReps: 0,
        totalSets: 0,
        durationSeconds: 0,
        completedExercises: 0,
        totalExercises: 0,
        completionPercentage: 0,
        prCount: 0,
      };
    }
    return calculateSessionStats(session);
  }, [session]);

  return {
    session,
    isLoaded,
    stats,
    prFlashMessage,
    updateSet,
    completeSet,
    completeExercise,
    addSet,
    pauseSession,
    finishSession,
    cancelSession,
    updateTimer,
  };
}
