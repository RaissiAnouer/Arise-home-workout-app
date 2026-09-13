import { WorkoutSession } from '../types/workoutSession';
import { EXERCISE_DATABASE } from '../data/exercises';
import type { MuscleGroup } from '../data/exerciseTypes';

// ─── Types ──────────────────────────────────────────────────────────

export interface OverviewStats {
  totalWorkoutTimeSeconds: number;
  totalWorkoutTimeFormatted: string; // e.g. "12h 34m"
  totalTrainingVolume: number; // sum of weight × reps for all completed sets
  totalWorkouts: number;
}

export type TimeFilter = 'week' | 'month' | 'year' | 'all';

export interface FrequencyDataPoint {
  label: string; // x-axis label (e.g. "Mon", "W1", "Jan")
  count: number; // number of workouts
}

export interface MuscleHeatmapEntry {
  muscle: string;
  totalSets: number;
  intensity: number; // 0–100 percentage relative to the most-trained muscle
  totalVolume: number; // sum of weight × reps for this muscle
  workoutCount: number; // distinct workouts that trained this muscle
  lastTrainedDate: string; // formatted date of last training session
  percentOfTotal: number; // percentage of overall training volume
}

export interface BodyHighlighterSlugData {
  slug: string;
  intensity: number;
  color: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  name: string;
  date: string; // formatted date string
  rawDate: string; // ISO string for sorting
  durationFormatted: string;
  totalVolume: number;
}

export interface DailyConsistencyEntry {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  monthLabel: string; // "Jan", "Feb", etc.
  dayOfMonth: number;
  workoutCount: number;
  totalVolume: number;
  completedSets: number;
  intensityLevel: number; // 0 to 4
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  completionPercentage: number;
}

// ─── Helpers ────────────────────────────────────────────────────────

function getFilteredSessions(sessions: WorkoutSession[], filter: TimeFilter): WorkoutSession[] {
  if (filter === 'all') return sessions;

  const now = new Date();
  let cutoff: Date;

  switch (filter) {
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
      return sessions;
  }

  return sessions.filter((s) => new Date(s.startTime) >= cutoff);
}

function formatDurationHM(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDurationShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── Service ────────────────────────────────────────────────────────

export class ReportsService {
  /**
   * Computes overview statistics from all sessions
   */
  static getOverviewStats(sessions: WorkoutSession[]): OverviewStats {
    let totalSeconds = 0;
    let totalVolume = 0;

    sessions.forEach((session) => {
      totalSeconds += session.durationSeconds || 0;

      session.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed) {
            totalVolume += set.weight * set.reps;
          }
        });
      });
    });

    return {
      totalWorkoutTimeSeconds: totalSeconds,
      totalWorkoutTimeFormatted: formatDurationHM(totalSeconds),
      totalTrainingVolume: totalVolume,
      totalWorkouts: sessions.length,
    };
  }

  /**
   * Computes workout frequency data points for charting
   */
  static getWorkoutFrequency(sessions: WorkoutSession[], filter: TimeFilter): FrequencyDataPoint[] {
    const filtered = getFilteredSessions(sessions, filter);

    if (filtered.length === 0) return [];

    switch (filter) {
      case 'week':
        return this._frequencyByDay(filtered, 7);
      case 'month':
        return this._frequencyByWeek(filtered, 4);
      case 'year':
        return this._frequencyByMonth(filtered, 12);
      case 'all':
      default:
        return this._frequencyByMonth(filtered, 12);
    }
  }

  private static _frequencyByDay(sessions: WorkoutSession[], numDays: number): FrequencyDataPoint[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const points: FrequencyDataPoint[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = sessions.filter((s) => s.startTime.split('T')[0] === dateStr).length;
      points.push({ label: dayNames[d.getDay()], count });
    }

    return points;
  }

  private static _frequencyByWeek(sessions: WorkoutSession[], numWeeks: number): FrequencyDataPoint[] {
    const now = new Date();
    const points: FrequencyDataPoint[] = [];

    for (let i = numWeeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      const count = sessions.filter((s) => {
        const sd = new Date(s.startTime);
        return sd >= weekStart && sd <= weekEnd;
      }).length;

      const label = `W${numWeeks - i}`;
      points.push({ label, count });
    }

    return points;
  }

  private static _frequencyByMonth(sessions: WorkoutSession[], numMonths: number): FrequencyDataPoint[] {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const points: FrequencyDataPoint[] = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const count = sessions.filter((s) => {
        const sd = new Date(s.startTime);
        return sd.getMonth() === month && sd.getFullYear() === year;
      }).length;

      points.push({ label: monthNames[month], count });
    }

    return points;
  }

  /**
   * Builds muscle heatmap data by mapping exercises to primary muscle via EXERCISE_DATABASE
   */
  static getMuscleHeatmapData(sessions: WorkoutSession[]): MuscleHeatmapEntry[] {
    const muscleData: Record<string, {
      totalSets: number;
      totalVolume: number;
      workoutIds: Set<string>;
      lastTrainedDate: string;
    }> = {};

    // Build a lookup: exercise name (lowercase) → primaryMuscle
    const exerciseToMuscle: Record<string, MuscleGroup> = {};
    Object.values(EXERCISE_DATABASE).forEach((ex) => {
      exerciseToMuscle[ex.name.toLowerCase()] = ex.primaryMuscle;
      // Also index by id
      exerciseToMuscle[ex.id.toLowerCase()] = ex.primaryMuscle;
    });

    sessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        // Try to find the muscle group for this exercise
        let muscle: string | undefined =
          exerciseToMuscle[ex.exerciseId.toLowerCase()] ||
          exerciseToMuscle[ex.exerciseName.toLowerCase()];

        if (!muscle) {
          // Fuzzy partial match
          const nameLC = ex.exerciseName.toLowerCase();
          for (const [key, val] of Object.entries(exerciseToMuscle)) {
            if (nameLC.includes(key) || key.includes(nameLC)) {
              muscle = val;
              break;
            }
          }
        }

        if (!muscle) muscle = 'Other';

        const completedSets = ex.sets.filter((s) => s.completed);
        const setCount = completedSets.length;
        const volume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

        if (!muscleData[muscle]) {
          muscleData[muscle] = {
            totalSets: 0,
            totalVolume: 0,
            workoutIds: new Set(),
            lastTrainedDate: '',
          };
        }

        muscleData[muscle].totalSets += setCount;
        muscleData[muscle].totalVolume += volume;
        muscleData[muscle].workoutIds.add(session.id);

        // Track the most recent training date
        if (!muscleData[muscle].lastTrainedDate || session.startTime > muscleData[muscle].lastTrainedDate) {
          muscleData[muscle].lastTrainedDate = session.startTime;
        }
      });
    });

    // Compute total volume across all muscles for percentage calculation
    const grandTotalVolume = Object.values(muscleData).reduce((sum, d) => sum + d.totalVolume, 0);

    // Convert to sorted array and compute intensity
    const entries: MuscleHeatmapEntry[] = Object.entries(muscleData)
      .map(([muscle, d]) => ({
        muscle,
        totalSets: d.totalSets,
        intensity: 0,
        totalVolume: d.totalVolume,
        workoutCount: d.workoutIds.size,
        lastTrainedDate: d.lastTrainedDate ? formatDate(d.lastTrainedDate) : 'Never',
        percentOfTotal: grandTotalVolume > 0 ? Math.round((d.totalVolume / grandTotalVolume) * 100) : 0,
      }))
      .sort((a, b) => b.totalSets - a.totalSets);

    const maxSets = entries.length > 0 ? entries[0].totalSets : 1;

    entries.forEach((entry) => {
      entry.intensity = Math.round((entry.totalSets / maxSets) * 100);
    });

    return entries;
  }

  /**
   * Maps MuscleHeatmapEntry array into slug & intensity for react-native-body-highlighter
   */
  static getBodyHighlighterData(entries: MuscleHeatmapEntry[]): BodyHighlighterSlugData[] {
    const slugMap: Record<string, string> = {
      chest: 'chest',
      shoulders: 'deltoids',
      biceps: 'biceps',
      triceps: 'triceps',
      forearms: 'forearm',
      core: 'abs',
      'hip flexors': 'obliques',
      quadriceps: 'adductors',
      hamstrings: 'hamstring',
      glutes: 'gluteal',
      calves: 'calves',
      traps: 'trapezius',
      back: 'upper-back',
      lats: 'upper-back',
    };

    return entries.map((e) => {
      const slug = slugMap[e.muscle.toLowerCase()] || e.muscle.toLowerCase();
      // Map 0-100% intensity to 1-3 intensity range for body highlighter
      const intensity = Math.max(1, Math.min(3, Math.ceil((e.intensity / 100) * 3)));
      return { slug, intensity, color: '#4080E7' };
    });
  }

  /**
   * Formats workout history for display
   */
  static getWorkoutHistory(sessions: WorkoutSession[]): WorkoutHistoryEntry[] {
    return sessions.map((session) => {
      let totalVolume = 0;
      session.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed) {
            totalVolume += set.weight * set.reps;
          }
        });
      });

      return {
        id: session.id,
        name: session.workoutDayId ? `Workout Day ${session.workoutDayId}` : 'Workout Day',
        date: formatDate(session.startTime),
        rawDate: session.startTime,
        durationFormatted: formatDurationShort(session.durationSeconds || 0),
        totalVolume,
      };
    });
  }

  /**
   * Generates daily consistency grid entries for contribution graph (past N days)
   */
  static getDailyConsistencyData(sessions: WorkoutSession[], numDays = 112): DailyConsistencyEntry[] {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sessionMap: Record<string, { count: number; volume: number; sets: number }> = {};

    sessions.forEach((s) => {
      if (!s.startTime) return;
      const dateStr = s.startTime.split('T')[0];
      if (!sessionMap[dateStr]) {
        sessionMap[dateStr] = { count: 0, volume: 0, sets: 0 };
      }
      sessionMap[dateStr].count += 1;
      (s.exercises || []).forEach((ex) => {
        (ex.sets || []).forEach((st) => {
          if (st.completed) {
            sessionMap[dateStr].sets += 1;
            sessionMap[dateStr].volume += (st.weight || 0) * (st.reps || 0);
          }
        });
      });
    });

    const maxDailyVolume = Math.max(1, ...Object.values(sessionMap).map((m) => m.volume));

    const today = new Date();
    const entries: DailyConsistencyEntry[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const stats = sessionMap[dateStr] || { count: 0, volume: 0, sets: 0 };

      let intensityLevel = 0;
      if (stats.count > 0) {
        const ratio = stats.volume / maxDailyVolume;
        if (ratio >= 0.75) intensityLevel = 4;
        else if (ratio >= 0.45) intensityLevel = 3;
        else if (ratio >= 0.2) intensityLevel = 2;
        else intensityLevel = 1;
      }

      entries.push({
        dateStr,
        dayOfWeek: d.getDay(),
        monthLabel: monthNames[d.getMonth()],
        dayOfMonth: d.getDate(),
        workoutCount: stats.count,
        totalVolume: stats.volume,
        completedSets: stats.sets,
        intensityLevel,
      });
    }

    return entries;
  }

  /**
   * Calculates streak and completion stats
   */
  static getStreakStats(sessions: WorkoutSession[]): StreakStats {
    if (!sessions || sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalWorkouts: 0, completionPercentage: 0 };
    }

    const uniqueDates = Array.from(
      new Set(sessions.map((s) => s.startTime.split('T')[0]))
    ).sort();

    const dateSet = new Set(uniqueDates);
    const today = new Date();

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    let dateStr = checkDate.toISOString().split('T')[0];

    if (!dateSet.has(dateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
    }

    while (dateSet.has(dateStr)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;

    if (uniqueDates.length > 0) {
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
    }

    // Completion percentage over past 30 days
    const past30Cutoff = new Date(today);
    past30Cutoff.setDate(today.getDate() - 30);
    const activeDaysInPast30 = uniqueDates.filter(
      (d) => new Date(d) >= past30Cutoff
    ).length;
    const completionPercentage = Math.min(100, Math.round((activeDaysInPast30 / 30) * 100));

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalWorkouts: sessions.length,
      completionPercentage,
    };
  }
}
