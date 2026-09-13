import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HunterRank,
  PlayerAttributes,
  XpBreakdown,
  WorkoutMetadata,
  LevelReward,
  xpForLevel,
  getRankForLevel,
  getRankConfig,
  calculateWorkoutXp,
  computeAttributes,
  getLevelUpRewards,
  XP_TUNING,
  MAX_LEVEL,
} from '../data/levelConfig';
import { StreakService } from '../services/StreakService';
import { WorkoutSessionRepository } from '../repositories/WorkoutSessionRepository';

export type XpSource =
  | 'workout_complete'
  | 'exercise_complete'
  | 'daily_quest'
  | 'streak_bonus'
  | 'personal_record';

export type LevelUpEvent = {
  previousLevel: number;
  newLevel: number;
  previousRank: HunterRank;
  newRank: HunterRank;
  rankChanged: boolean;
  xpGained: number;
  rewards: LevelReward[];
  xpToNext: number;
  currentXp: number;
};

type PersonalRecord = {
  bestVolume: number;
  bestWeight: number;
  bestReps: number;
  timesBeaten: number;
};

type ProgressionState = {
  userId: string;
  hunterName: string;
  level: number;
  xp: number;
  totalXp: number;
  rank: HunterRank;
  coins: number;
  skillPoints: number;
  unlockedTitles: string[];
  activeTitle: string;
  streakDays: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  completedDays: number[];
  completedDates: string[];
  totalVolumeKg: number;
  totalExercisesCompleted: number;
  totalWorkouts: number;
  restDaysCompleted: number;
  uniqueExercises: string[];
  personalRecords: Record<string, PersonalRecord>;
  sessionPrCount: number;
  firstWorkoutDate: string | null;
  profilePicture: string | null;
  allocatedAttributes?: PlayerAttributes;
};

type ProgressionContextType = ProgressionState & {
  xpToNextLevel: number;
  xpProgress: number;
  rankTitle: string;
  rankColor: string;
  attributes: PlayerAttributes;

  awardXp: (amount: number, source: XpSource) => LevelUpEvent | null;
  completeWorkout: (dayNumber: number, meta: WorkoutMetadata) => { levelUp: LevelUpEvent | null; breakdown: XpBreakdown };
  completeExercise: (exerciseName: string) => void;
  checkPersonalRecord: (exerciseName: string, weight: number, reps: number) => boolean;
  isDayCompleted: (dayNumber: number) => boolean;
  resetCompletedDays: () => void;

  pendingLevelUp: LevelUpEvent | null;
  dismissLevelUp: () => void;
  updateProfilePicture: (uri: string) => void;
  updateHunterName: (name: string) => void;
  updateActiveTitle: (title: string) => void;
  allocateSkillPoint: (attr: keyof PlayerAttributes) => boolean;
  resetAllocatedSkillPoints: () => void;
};

const STORAGE_KEY = '@arise_progression_v3';
const PERMANENT_PROFILE_PICTURE_KEY = '@arise_profile_picture_permanent';
const USER_ID_KEY = '@arise_user_id';
const HUNTER_NAME_KEY = '@arise_hunter_name';

/**
 * Generate a random 8-character alphanumeric ID.
 * Uses uppercase letters (A-Z) and digits (0-9).
 */
function generateUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCalendarDayDiff(fromDateStr: string, toDateStr: string): number {
  try {
    const [y1, m1, d1] = fromDateStr.split('-').map(Number);
    const [y2, m2, d2] = toDateStr.split('-').map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

const DEFAULT_STATE: ProgressionState = {
  userId: '',
  hunterName: 'Hunter',
  level: 1,
  xp: 0,
  totalXp: 0,
  rank: 'E',
  coins: 0,
  skillPoints: 5,
  unlockedTitles: ['Initiate'],
  activeTitle: 'Initiate',
  streakDays: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
  completedDays: [],
  completedDates: [],
  totalVolumeKg: 0,
  totalExercisesCompleted: 0,
  totalWorkouts: 0,
  restDaysCompleted: 0,
  uniqueExercises: [],
  personalRecords: {},
  sessionPrCount: 0,
  firstWorkoutDate: null,
  profilePicture: null,
  allocatedAttributes: { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 },
};

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export const ProgressionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ProgressionState>(DEFAULT_STATE);
  const [pendingLevelUp, setPendingLevelUp] = useState<LevelUpEvent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      let loadedState = { ...DEFAULT_STATE };
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const today = getLocalDateStr();

        if (stored) {
          const parsed = JSON.parse(stored) as ProgressionState;
          loadedState = {
            ...DEFAULT_STATE,
            ...parsed,
            unlockedTitles: parsed.unlockedTitles && parsed.unlockedTitles.length > 0 ? parsed.unlockedTitles : ['Initiate'],
            activeTitle: parsed.activeTitle || 'Initiate',
            allocatedAttributes: parsed.allocatedAttributes || { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 },
            skillPoints: parsed.skillPoints !== undefined ? parsed.skillPoints : 5,
          };
        } else {
          const oldStored = await AsyncStorage.getItem('@arise_progression_v2');
          if (oldStored) {
            const parsed = JSON.parse(oldStored) as any;
            loadedState = {
              ...DEFAULT_STATE,
              ...parsed,
              coins: parsed.coins ?? 0,
              skillPoints: parsed.skillPoints ?? 5,
              unlockedTitles: (parsed.unlockedTitles && parsed.unlockedTitles.length > 0) ? parsed.unlockedTitles : ['Initiate'],
              activeTitle: parsed.activeTitle || 'Initiate',
              allocatedAttributes: parsed.allocatedAttributes || { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 },
            };
          }
        }

        // ── Profile identity: load from dedicated keys (take precedence) ──

        // User ID — persistent across state resets
        let storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!storedUserId) {
          storedUserId = generateUserId();
          await AsyncStorage.setItem(USER_ID_KEY, storedUserId);
        }
        loadedState.userId = storedUserId;

        // Hunter name — persistent across state resets
        const storedName = await AsyncStorage.getItem(HUNTER_NAME_KEY);
        if (storedName) {
          loadedState.hunterName = storedName;
        }

        // Profile picture — persistent across state resets
        try {
          const permanentAvatar = await AsyncStorage.getItem(PERMANENT_PROFILE_PICTURE_KEY);
          if (permanentAvatar && permanentAvatar.trim().length > 0) {
            loadedState.profilePicture = permanentAvatar;
          } else if (loadedState.profilePicture && loadedState.profilePicture.trim().length > 0) {
            await AsyncStorage.setItem(PERMANENT_PROFILE_PICTURE_KEY, loadedState.profilePicture);
          }
        } catch (e) {
          console.warn('[ProgressionContext] Could not load permanent avatar:', e);
        }

        // ── Cross-verify with historical sessions ──
        try {
          const history = await WorkoutSessionRepository.getWorkoutHistory('local_user');
          if (history && history.length > 0) {
            const historyDates = history
              .map((s) => getLocalDateStr(new Date(s.startTime)))
              .filter(Boolean);
            const mergedDates = Array.from(new Set([...(loadedState.completedDates || []), ...historyDates])).sort();
            loadedState.completedDates = mergedDates;

            if (historyDates.length > loadedState.totalWorkouts) {
              loadedState.totalWorkouts = historyDates.length;
            }

            const latestHistoryDate = historyDates[0];
            if (!loadedState.lastWorkoutDate || latestHistoryDate > loadedState.lastWorkoutDate) {
              loadedState.lastWorkoutDate = latestHistoryDate;
            }
          }
        } catch (err) {
          console.warn('[ProgressionContext] Could not load workout history:', err);
        }

        // Validate streak using plan-aware streak calculation (rest days never break streak)
        try {
          const planStored = await AsyncStorage.getItem('@arise_workout_plan_v4');
          const plan = planStored ? JSON.parse(planStored) : null;
          const questStored = await AsyncStorage.getItem('@arise_questionnaire_v1');
          const questAnswers = questStored ? JSON.parse(questStored) : null;

          const streakResult = StreakService.calculatePlanAwareStreak(
            loadedState.completedDates || [],
            plan,
            questAnswers?.startDay,
            loadedState.longestStreak || 0,
            questAnswers?.weeklyGoal
          );
          loadedState.streakDays = streakResult.currentStreak;
          loadedState.longestStreak = streakResult.longestStreak;
        } catch (streakErr) {
          console.warn('[ProgressionContext] Plan-aware streak calc fallback:', streakErr);
          if (loadedState.lastWorkoutDate) {
            const diffDays = getCalendarDayDiff(loadedState.lastWorkoutDate, today);
            if (diffDays > 4) {
              loadedState.streakDays = 0;
            }
          }
        }

        setState(loadedState);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedState));
      } catch (e) {
        console.error('Failed to load progression data', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.error('Failed to save progression data', e)
    );
  }, [state, isLoaded]);

  const awardXp = useCallback(
    (amount: number, _source: XpSource): LevelUpEvent | null => {
      let levelUpEvent: LevelUpEvent | null = null;

      setState((prev) => {
        let { level, xp, totalXp, rank, coins, skillPoints, unlockedTitles } = prev;
        const previousLevel = level;
        const previousRank = rank;

        xp += amount;
        totalXp += amount;

        let xpNeeded = xpForLevel(level);
        let allRewards: LevelReward[] = [];

        while (xp >= xpNeeded && level < MAX_LEVEL) {
          xp -= xpNeeded;
          level += 1;
          const newRank = getRankForLevel(level);
          const rankChanged = newRank !== getRankForLevel(level - 1);

          const rewards = getLevelUpRewards(level, rankChanged, newRank);
          allRewards = [...allRewards, ...rewards];

          for (const r of rewards) {
            if (r.type === 'coins') coins += (r.value as number);
            if (r.type === 'skillPoints') skillPoints += (r.value as number);
            if (r.type === 'title' && typeof r.value === 'string' && !unlockedTitles.includes(r.value)) {
              unlockedTitles = [...unlockedTitles, r.value];
            }
          }

          xpNeeded = xpForLevel(level);
        }

        if (level >= MAX_LEVEL) {
          level = MAX_LEVEL;
          xp = Math.min(xp, xpForLevel(MAX_LEVEL));
        }

        const newRank = getRankForLevel(level);
        rank = newRank;

        if (level > previousLevel) {
          levelUpEvent = {
            previousLevel,
            newLevel: level,
            previousRank,
            newRank,
            rankChanged: newRank !== previousRank,
            xpGained: amount,
            rewards: allRewards,
            xpToNext: xpForLevel(level),
            currentXp: xp,
          };
          setTimeout(() => setPendingLevelUp(levelUpEvent), 50);
        }

        const next = { ...prev, level, xp, totalXp, rank, coins, skillPoints, unlockedTitles };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });

      return levelUpEvent;
    },
    []
  );

  const completeExercise = useCallback(
    (exerciseName: string) => {
      setState((prev) => {
        const newUnique = prev.uniqueExercises.includes(exerciseName)
          ? prev.uniqueExercises
          : [...prev.uniqueExercises, exerciseName];

        const next = {
          ...prev,
          totalExercisesCompleted: prev.totalExercisesCompleted + 1,
          uniqueExercises: newUnique,
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });

      awardXp(XP_TUNING.EXERCISE_COMPLETE_XP, 'exercise_complete');
    },
    [awardXp]
  );

  const checkPersonalRecord = useCallback(
    (exerciseName: string, weight: number, reps: number): boolean => {
      const setVolume = weight * reps;
      if (setVolume <= 0) return false;

      const currentPR = state.personalRecords[exerciseName];
      const isNewPR = !currentPR || setVolume > currentPR.bestVolume;

      if (isNewPR) {
        setState((prev) => {
          const next = {
            ...prev,
            personalRecords: {
              ...prev.personalRecords,
              [exerciseName]: {
                bestVolume: setVolume,
                bestWeight: Math.max(weight, currentPR?.bestWeight ?? 0),
                bestReps: Math.max(reps, currentPR?.bestReps ?? 0),
                timesBeaten: (currentPR?.timesBeaten ?? 0) + 1,
              },
            },
            sessionPrCount: prev.sessionPrCount + 1,
          };
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });

        awardXp(XP_TUNING.PR_BONUS, 'personal_record');
      }

      return isNewPR;
    },
    [state.personalRecords, awardXp]
  );

  const completeWorkout = useCallback(
    (dayNumber: number, meta: WorkoutMetadata): { levelUp: LevelUpEvent | null; breakdown: XpBreakdown } => {
      const today = getLocalDateStr();
      let newStreak = state.streakDays;

      if (state.lastWorkoutDate) {
        if (state.lastWorkoutDate === today) {
          // Already worked out today: keep current streak (at least 1)
          newStreak = Math.max(1, state.streakDays);
        } else {
          const diffDays = getCalendarDayDiff(state.lastWorkoutDate, today);

          // Consecutive day or within scheduled rest day window (up to 4 days for rest days):
          // maintain and increment streak!
          if (diffDays <= 4) {
            newStreak = (state.streakDays > 0 ? state.streakDays : 0) + 1;
          } else {
            // Streak reset only after extended missed workout days
            newStreak = 1;
          }
        }
      } else {
        newStreak = 1;
      }

      const newLongestStreak = Math.max(state.longestStreak || 0, newStreak);
      const isFirstToday = state.lastWorkoutDate !== today;

      const enrichedMeta: WorkoutMetadata = {
        ...meta,
        prCount: state.sessionPrCount,
        isFirstWorkoutToday: isFirstToday,
      };

      const breakdown = calculateWorkoutXp(enrichedMeta, newStreak);
      const newTotalVolume = (state.totalVolumeKg || 0) + (meta.totalVolumeKg || 0);

      const updatedCompletedDays = Array.from(new Set([...(state.completedDays || []), dayNumber]));
      const updatedCompletedDates = Array.from(new Set([...(state.completedDates || []), today]));
      const updatedTotalWorkouts = (state.totalWorkouts || 0) + (meta.isRestDay ? 0 : 1);

      const nextState: ProgressionState = {
        ...state,
        completedDays: updatedCompletedDays,
        completedDates: updatedCompletedDates,
        streakDays: newStreak,
        longestStreak: newLongestStreak,
        lastWorkoutDate: today,
        firstWorkoutDate: state.firstWorkoutDate || today,
        totalVolumeKg: newTotalVolume,
        totalWorkouts: updatedTotalWorkouts,
        restDaysCompleted: (state.restDaysCompleted || 0) + (meta.isRestDay ? 1 : 0),
        sessionPrCount: 0,
      };

      // Immediately persist to disk and sync database
      setState(nextState);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)).catch((err) =>
        console.error('Failed to immediately save progression on workout complete', err)
      );

      StreakService.syncStreakToDatabase('local_user', {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastWorkoutDate: today,
        totalWorkouts: updatedTotalWorkouts,
      }).catch(() => {});

      const levelUp = awardXp(breakdown.total, 'workout_complete');

      return { levelUp, breakdown };
    },
    [state, awardXp]
  );

  const isDayCompleted = useCallback(
    (dayNumber: number): boolean => {
      return (state.completedDays || []).includes(dayNumber);
    },
    [state.completedDays]
  );

  const resetCompletedDays = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        completedDays: [],
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const dismissLevelUp = useCallback(() => setPendingLevelUp(null), []);

  const updateProfilePicture = useCallback((uri: string) => {
    const cleanUri = uri && uri.trim().length > 0 ? uri : null;
    setState((prev) => {
      const next = { ...prev, profilePicture: cleanUri };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    if (cleanUri) {
      AsyncStorage.setItem(PERMANENT_PROFILE_PICTURE_KEY, cleanUri).catch(() => {});
    } else {
      AsyncStorage.removeItem(PERMANENT_PROFILE_PICTURE_KEY).catch(() => {});
    }
  }, []);

  const updateHunterName = useCallback((name: string) => {
    const trimmed = name.trim() || 'Hunter';
    setState((prev) => {
      const next = { ...prev, hunterName: trimmed };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    AsyncStorage.setItem(HUNTER_NAME_KEY, trimmed).catch(() => {});
  }, []);

  const updateActiveTitle = useCallback((title: string) => {
    setState((prev) => {
      const next = { ...prev, activeTitle: title };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const allocateSkillPoint = useCallback((attr: keyof PlayerAttributes): boolean => {
    let success = false;
    setState((prev) => {
      if ((prev.skillPoints || 0) <= 0) return prev;
      const currentAlloc = prev.allocatedAttributes || { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 };
      const nextAlloc = {
        ...currentAlloc,
        [attr]: (currentAlloc[attr] || 0) + 1,
      };
      const next = {
        ...prev,
        skillPoints: prev.skillPoints - 1,
        allocatedAttributes: nextAlloc,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      success = true;
      return next;
    });
    return success;
  }, []);

  const resetAllocatedSkillPoints = useCallback(() => {
    setState((prev) => {
      const currentAlloc = prev.allocatedAttributes || { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 };
      const refunded = (currentAlloc.STR || 0) + (currentAlloc.AGI || 0) + (currentAlloc.VIT || 0) + (currentAlloc.INT || 0) + (currentAlloc.PER || 0);
      const next = {
        ...prev,
        skillPoints: (prev.skillPoints || 0) + refunded,
        allocatedAttributes: { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const attributes = useMemo(() => {
    const daysSinceStart = state.firstWorkoutDate
      ? Math.max(1, getCalendarDayDiff(state.firstWorkoutDate, getLocalDateStr()))
      : 0;

    const prCount = Object.values(state.personalRecords).reduce(
      (sum, pr) => sum + pr.timesBeaten, 0
    );

    const base = computeAttributes(state.level, {
      totalVolumeKg: state.totalVolumeKg,
      totalExercisesCompleted: state.totalExercisesCompleted,
      restDaysCompleted: state.restDaysCompleted,
      streakDays: state.streakDays,
      longestStreak: state.longestStreak,
      totalWorkouts: state.totalWorkouts,
      prCount,
      uniqueExerciseCount: state.uniqueExercises.length,
      daysSinceStart,
    });

    const alloc = state.allocatedAttributes || { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 };
    return {
      STR: base.STR + (alloc.STR || 0),
      AGI: base.AGI + (alloc.AGI || 0),
      VIT: base.VIT + (alloc.VIT || 0),
      INT: base.INT + (alloc.INT || 0),
      PER: base.PER + (alloc.PER || 0),
    };
  }, [
    state.level, state.totalVolumeKg, state.totalExercisesCompleted, state.restDaysCompleted,
    state.streakDays, state.longestStreak, state.totalWorkouts,
    state.personalRecords, state.uniqueExercises, state.firstWorkoutDate, state.allocatedAttributes,
  ]);

  const effectiveStreakDays = useMemo(() => {
    if (!state.lastWorkoutDate || state.streakDays <= 0) return 0;
    const today = getLocalDateStr();
    const diffDays = getCalendarDayDiff(state.lastWorkoutDate, today);

    // Keep streak intact across scheduled rest days (gap up to 4 calendar days)
    if (diffDays > 4) return 0;
    return state.streakDays;
  }, [state.lastWorkoutDate, state.streakDays]);

  const xpToNextLevel = xpForLevel(state.level);
  const xpProgress = Math.min(100, (state.xp / xpToNextLevel) * 100);
  const rankConfig = getRankConfig(state.level);

  const contextValue: ProgressionContextType = {
    ...state,
    streakDays: effectiveStreakDays,
    xpToNextLevel,
    xpProgress,
    rankTitle: rankConfig.title,
    rankColor: rankConfig.color,
    attributes,
    awardXp,
    completeWorkout,
    completeExercise,
    checkPersonalRecord,
    isDayCompleted,
    resetCompletedDays,
    pendingLevelUp,
    dismissLevelUp,
    updateProfilePicture,
    updateHunterName,
    updateActiveTitle,
    allocateSkillPoint,
    resetAllocatedSkillPoints,
  };

  return (
    <ProgressionContext.Provider value={contextValue}>
      {children}
    </ProgressionContext.Provider>
  );
};

export const useProgression = () => {
  const context = useContext(ProgressionContext);
  if (context === undefined) {
    throw new Error('useProgression must be used within a ProgressionProvider');
  }
  return context;
};
