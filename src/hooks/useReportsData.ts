import { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkoutSession } from '../types/workoutSession';
import { WorkoutSessionService } from '../services/WorkoutSessionService';
import { WeightLogRepository, WeightEntry } from '../repositories/WeightLogRepository';
import {
  ReportsService,
  OverviewStats,
  FrequencyDataPoint,
  MuscleHeatmapEntry,
  WorkoutHistoryEntry,
  TimeFilter,
} from '../services/ReportsService';

const USER_ID = 'local_user';

export function useReportsData() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [frequencyFilter, setFrequencyFilter] = useState<TimeFilter>('month');
  const [weightFilter, setWeightFilter] = useState<TimeFilter>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyData, weightData] = await Promise.all([
        WorkoutSessionService.getWorkoutHistory(USER_ID),
        WeightLogRepository.getEntries(),
      ]);
      setSessions(historyData);
      setWeightEntries(weightData);
    } catch (e) {
      console.error('[useReportsData] Failed to fetch data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Computed Data ─────────────────────────────────────────────────

  const overviewStats: OverviewStats = useMemo(
    () => ReportsService.getOverviewStats(sessions),
    [sessions]
  );

  const frequencyData: FrequencyDataPoint[] = useMemo(
    () => ReportsService.getWorkoutFrequency(sessions, frequencyFilter),
    [sessions, frequencyFilter]
  );

  const muscleHeatmap: MuscleHeatmapEntry[] = useMemo(
    () => ReportsService.getMuscleHeatmapData(sessions),
    [sessions]
  );

  const workoutHistory: WorkoutHistoryEntry[] = useMemo(
    () => ReportsService.getWorkoutHistory(sessions),
    [sessions]
  );

  const consistencyData = useMemo(
    () => ReportsService.getDailyConsistencyData(sessions, 112),
    [sessions]
  );

  const streakStats = useMemo(
    () => ReportsService.getStreakStats(sessions),
    [sessions]
  );

  // Weight entries filtered by time
  const filteredWeightEntries: WeightEntry[] = useMemo(() => {
    if (weightFilter === 'all') return weightEntries;

    const now = new Date();
    let cutoff: Date;

    switch (weightFilter) {
      case 'week':
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff = new Date(now);
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return weightEntries;
    }

    return weightEntries.filter((e) => new Date(e.date) >= cutoff);
  }, [weightEntries, weightFilter]);

  // ─── Weight Actions ────────────────────────────────────────────────

  const addWeightEntry = useCallback(async (weight: number, date?: string) => {
    await WeightLogRepository.addEntry(weight, date);
    const updated = await WeightLogRepository.getEntries();
    setWeightEntries(updated);
  }, []);

  const deleteWeightEntry = useCallback(async (id: string) => {
    await WeightLogRepository.deleteEntry(id);
    const updated = await WeightLogRepository.getEntries();
    setWeightEntries(updated);
  }, []);

  return {
    isLoading,
    refreshData: fetchData,
    // Overview
    overviewStats,
    // Frequency
    frequencyData,
    frequencyFilter,
    setFrequencyFilter,
    // Muscle heatmap
    muscleHeatmap,
    // Consistency & Streaks
    consistencyData,
    streakStats,
    // Workout history
    workoutHistory,
    // Weight
    weightEntries: filteredWeightEntries,
    allWeightEntries: weightEntries,
    weightFilter,
    setWeightFilter,
    addWeightEntry,
    deleteWeightEntry,
  };
}
