/**
 * StreakService.ts
 *
 * Single Source of Truth for Workout-Plan-Aware Streak & Calendar Tracking.
 *
 * Rules:
 * - WORKOUT day completed -> COMPLETED (✓)
 * - WORKOUT day missed in the past -> MISSED_WORKOUT (Red ✕)
 * - REST day -> REST (Neutral, never receives ✕, never breaks streak)
 * - FUTURE day -> FUTURE (No ✕)
 * - TODAY pending workout -> TODAY_PENDING (No ✕ while day is active)
 *
 * Streak Calculation:
 * - Counts consecutive completed scheduled workout days.
 * - Scheduled rest days are skipped without breaking the streak.
 * - Missed scheduled workout days reset the streak.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AdaptiveWorkoutPlan } from './AdaptiveEngine';

export type DayStatusType =
  | 'COMPLETED'
  | 'MISSED_WORKOUT'
  | 'REST'
  | 'FUTURE'
  | 'TODAY_PENDING';

export type ScheduledType = 'WORKOUT' | 'REST';

export interface CalendarDayStatus {
  dateStr: string; // YYYY-MM-DD
  dayOfWeekIndex: number; // 0=Sun..6=Sat
  dayLabel: string; // "M", "T", "W", etc.
  fullDayName: string; // "MON", "TUE", etc.
  dayNumber: number; // Day of month (e.g. 19)
  scheduledType: ScheduledType;
  status: DayStatusType;
  isToday: boolean;
  isCompleted: boolean;
}

export interface PlanAwareStreakResult {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  lastCompletedDate: string | null;
  weekDays: CalendarDayStatus[];
}

const STREAK_STORAGE_KEY = '@arise_streak_v2';
const FULL_DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const SHORT_DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export class StreakService {
  /**
   * Returns today's calendar date string in YYYY-MM-DD (local time)
   */
  static getTodayDateStr(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper to format a Date object as YYYY-MM-DD
   */
  static formatDateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Converts startDay string (e.g. 'MONDAY') to day-of-week index (0=Sun..6=Sat)
   */
  static getStartDow(startDay: string | null | undefined): number {
    if (!startDay) return 1; // Default Monday
    const map: Record<string, number> = {
      SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
      THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
    };
    return map[startDay.toUpperCase()] ?? 1;
  }

  /**
   * Builds an ordered array of 7 day-of-week indices starting from startDow
   */
  static buildWeekOrder(startDow: number): number[] {
    return Array.from({ length: 7 }, (_, i) => (startDow + i) % 7);
  }

  /**
   * Analyzes the active workout plan to determine if a day of the week is WORKOUT or REST.
   * If plan is not available, uses the user's weeklyGoal frequency split or weekend rest fallback.
   */
  static getScheduleForDayOfWeek(
    dow: number,
    plan: AdaptiveWorkoutPlan | null,
    startDow: number,
    weeklyGoalOrDays?: string | number | null
  ): ScheduledType {
    if (plan && plan.days && plan.days.length > 0) {
      // Map day-of-week (0..6) relative to startDow to find day in plan (0..6 of week 1)
      const dayIndexInPlan = (dow - startDow + 7) % 7;
      const planDay = plan.days[dayIndexInPlan];

      if (planDay) {
        return planDay.isRestDay ? 'REST' : 'WORKOUT';
      }
    }

    // If plan is not available or doesn't have the day, parse weeklyGoalOrDays
    let daysPerWeek = 7;
    if (typeof weeklyGoalOrDays === 'number') {
      daysPerWeek = weeklyGoalOrDays;
    } else if (typeof weeklyGoalOrDays === 'string') {
      const match = weeklyGoalOrDays.match(/\d+/);
      daysPerWeek = match ? parseInt(match[0], 10) : 7;
    }

    const dayOfWeekMod = (dow - startDow + 7) % 7;
    if (daysPerWeek === 2) {
      return (dayOfWeekMod === 0 || dayOfWeekMod === 3) ? 'WORKOUT' : 'REST';
    } else if (daysPerWeek === 3) {
      return (dayOfWeekMod === 0 || dayOfWeekMod === 2 || dayOfWeekMod === 4) ? 'WORKOUT' : 'REST';
    } else if (daysPerWeek === 4) {
      return (dayOfWeekMod === 0 || dayOfWeekMod === 1 || dayOfWeekMod === 3 || dayOfWeekMod === 4) ? 'WORKOUT' : 'REST';
    } else if (daysPerWeek === 5) {
      return (dayOfWeekMod !== 2 && dayOfWeekMod !== 6) ? 'WORKOUT' : 'REST';
    } else if (daysPerWeek === 6) {
      return dayOfWeekMod !== 6 ? 'WORKOUT' : 'REST';
    } else if (daysPerWeek >= 7) {
      return 'WORKOUT';
    }

    // Default fallback: 0(Sun) & 6(Sat) are REST, others WORKOUT
    return dow === 0 || dow === 6 ? 'REST' : 'WORKOUT';
  }

  /**
   * Determines the status of a specific calendar date against the active plan & completion records.
   */
  static getDayStatusForDate(
    dateStr: string,
    todayStr: string,
    scheduledType: ScheduledType,
    completedDatesSet: Set<string>
  ): DayStatusType {
    const isCompleted = completedDatesSet.has(dateStr);

    if (dateStr > todayStr) {
      // Future date
      return scheduledType === 'REST' ? 'REST' : 'FUTURE';
    }

    if (dateStr === todayStr) {
      // Today
      if (isCompleted) return 'COMPLETED';
      if (scheduledType === 'REST') return 'REST';
      return 'TODAY_PENDING';
    }

    // Past date (dateStr < todayStr)
    if (scheduledType === 'REST') {
      return isCompleted ? 'COMPLETED' : 'REST';
    }

    // Past scheduled workout day
    return isCompleted ? 'COMPLETED' : 'MISSED_WORKOUT';
  }

  /**
   * Generates the 7-day calendar status list for the current week.
   */
  static getWeekCalendarStatus(
    completedDates: string[],
    plan: AdaptiveWorkoutPlan | null,
    startDay: string | null | undefined
  ): CalendarDayStatus[] {
    const todayStr = this.getTodayDateStr();
    const today = new Date();
    const todayDow = today.getDay();
    const startDow = this.getStartDow(startDay);
    const weekOrder = this.buildWeekOrder(startDow);

    // Find start date of current week cycle
    const daysBack = (todayDow - startDow + 7) % 7;
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - daysBack);

    const completedSet = new Set(completedDates);

    return weekOrder.map((dow, index) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + index);
      const dateStr = this.formatDateStr(d);
      const isToday = dateStr === todayStr;
      const scheduledType = this.getScheduleForDayOfWeek(dow, plan, startDow);
      const status = this.getDayStatusForDate(dateStr, todayStr, scheduledType, completedSet);

      const dayIndex = d.getDay();
      const fullDayName = FULL_DAY_NAMES[dayIndex];
      const dayLabel = fullDayName.charAt(0);

      return {
        dateStr,
        dayOfWeekIndex: dayIndex,
        dayLabel,
        fullDayName,
        dayNumber: d.getDate(),
        scheduledType,
        status,
        isToday,
        isCompleted: completedSet.has(dateStr),
      };
    });
  }

  /**
   * Calculates plan-aware current streak and longest streak.
   *
   * Streak counts consecutive completed scheduled WORKOUT days.
   * Scheduled REST days do not break the streak.
   * A missed past scheduled WORKOUT day breaks the streak.
   */
  static calculatePlanAwareStreak(
    completedDates: string[],
    plan: AdaptiveWorkoutPlan | null,
    startDay: string | null | undefined,
    previousLongestStreak = 0,
    weeklyGoalOrDays?: string | number | null
  ): { currentStreak: number; longestStreak: number } {
    const todayStr = this.getTodayDateStr();
    const startDow = this.getStartDow(startDay);
    const completedSet = new Set(completedDates);

    if (completedDates.length === 0) {
      return { currentStreak: 0, longestStreak: previousLongestStreak };
    }

    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);

    // Look back day by day starting from today or yesterday
    const todayDateStr = this.formatDateStr(checkDate);
    const todayDow = checkDate.getDay();
    const todayScheduled = this.getScheduleForDayOfWeek(todayDow, plan, startDow, weeklyGoalOrDays);

    // If today's workout was completed, include today in the streak count
    if (completedSet.has(todayDateStr)) {
      currentStreak += 1;
    } else if (todayScheduled === 'WORKOUT') {
      // Today's workout is not completed yet, so we start counting from yesterday
    }

    // Walk backward in calendar days
    checkDate.setDate(checkDate.getDate() - 1);

    // Maximum search window of 365 days
    for (let i = 0; i < 365; i++) {
      const dateStr = this.formatDateStr(checkDate);
      const dow = checkDate.getDay();
      const scheduledType = this.getScheduleForDayOfWeek(dow, plan, startDow, weeklyGoalOrDays);
      const isCompleted = completedSet.has(dateStr);

      if (scheduledType === 'REST') {
        // Scheduled rest day:
        // If completed an extra workout on rest day, count it!
        // Otherwise, skip without breaking the streak.
        if (isCompleted) {
          currentStreak += 1;
        }
      } else {
        // Scheduled workout day:
        if (isCompleted) {
          currentStreak += 1;
        } else {
          // Missed scheduled workout day -> streak breaks here!
          break;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    const longestStreak = Math.max(previousLongestStreak, currentStreak);

    return { currentStreak, longestStreak };
  }

  /**
   * Persists streak data locally and synchronizes with Supabase database (player_stats & profiles).
   */
  static async syncStreakToDatabase(
    userId: string,
    streakData: {
      currentStreak: number;
      longestStreak: number;
      lastWorkoutDate: string | null;
      totalWorkouts: number;
    }
  ): Promise<void> {
    try {
      // 1. Local Persistence
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));

      // 2. Supabase Sync if user is authenticated
      if (userId && userId !== 'anonymous' && userId !== 'local_user') {
        try {
          // Update player_stats
          await supabase
            .from('player_stats')
            .upsert({
              user_id: userId,
              streak_days: streakData.currentStreak,
              longest_streak: streakData.longestStreak,
              last_workout_date: streakData.lastWorkoutDate,
              total_workouts: streakData.totalWorkouts,
              updated_at: new Date().toISOString(),
            });
        } catch (err) {
          console.warn('[StreakService] player_stats sync warning:', err);
        }

        try {
          // Update profiles summary columns
          await supabase
            .from('profiles')
            .update({
              streak_days: streakData.currentStreak,
              last_workout_date: streakData.lastWorkoutDate,
              workouts_completed: streakData.totalWorkouts,
            })
            .eq('id', userId);
        } catch (err) {
          console.warn('[StreakService] profiles sync warning:', err);
        }
      }
    } catch (e) {
      console.error('[StreakService] Failed to sync streak to database', e);
    }
  }

  /**
   * Loads streak data from Supabase database or falls back to local storage.
   */
  static async loadStreakFromDatabase(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
    totalWorkouts: number;
  } | null> {
    try {
      // Try Supabase first if authenticated
      if (userId && userId !== 'anonymous' && userId !== 'local_user') {
        const { data, error } = await supabase
          .from('player_stats')
          .select('streak_days, longest_streak, last_workout_date, total_workouts')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return {
            currentStreak: data.streak_days ?? 0,
            longestStreak: data.longest_streak ?? 0,
            lastWorkoutDate: data.last_workout_date ?? null,
            totalWorkouts: data.total_workouts ?? 0,
          };
        }
      }

      // Fallback to local storage
      const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[StreakService] Failed to load streak from database', e);
    }
    return null;
  }
}
