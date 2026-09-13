import { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkoutSession } from '../types/workoutSession';
import { WorkoutSessionService } from '../services/WorkoutSessionService';
import { calculateSessionStats } from '../utils/workoutStats';

export function useWorkoutHistory(userId: string) {
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await WorkoutSessionService.getWorkoutHistory(userId);
      setHistory(data);
    } catch (e) {
      console.error('[useWorkoutHistory] Failed to fetch history', e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await WorkoutSessionService.deleteWorkoutSession(sessionId);
      await fetchHistory();
    },
    [fetchHistory]
  );

  // Overall lifetime stats
  const aggregateStats = useMemo(() => {
    let lifetimeVolume = 0;
    let lifetimeReps = 0;
    let lifetimeSets = 0;
    let lifetimeWorkouts = history.length;
    let totalPRs = 0;

    history.forEach((session) => {
      const s = calculateSessionStats(session);
      lifetimeVolume += s.totalVolume;
      lifetimeReps += s.totalReps;
      lifetimeSets += s.totalSets;
      totalPRs += s.prCount;
    });

    return {
      lifetimeVolume,
      lifetimeReps,
      lifetimeSets,
      lifetimeWorkouts,
      totalPRs,
    };
  }, [history]);

  return {
    history,
    isLoading,
    aggregateStats,
    refreshHistory: fetchHistory,
    deleteSession,
  };
}
