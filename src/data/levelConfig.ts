export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SSS' | 'National';

export const RANK_CONFIG: Record<HunterRank, {
  title: string;
  color: string;
  glowColor: string;
  minLevel: number;
}> = {
  E: { title: 'E-RANK HUNTER', color: '#8B4513', glowColor: '#A0522D', minLevel: 1 },
  D: { title: 'D-RANK HUNTER', color: '#A9A9A9', glowColor: '#C0C0C0', minLevel: 10 },
  C: { title: 'C-RANK HUNTER', color: '#32CD32', glowColor: '#00FF7F', minLevel: 25 },
  B: { title: 'B-RANK HUNTER', color: '#1B45D7', glowColor: '#38B6FF', minLevel: 40 },
  A: { title: 'A-RANK HUNTER', color: '#FF4500', glowColor: '#FF6347', minLevel: 55 },
  S: { title: 'S-RANK HUNTER', color: '#FFD700', glowColor: '#FFEC8B', minLevel: 70 },
  SSS: { title: 'SSS-RANK HUNTER', color: '#A855F7', glowColor: '#C084FC', minLevel: 85 },
  National: { title: 'NATIONAL LEVEL HUNTER', color: '#00F0FF', glowColor: '#38B6FF', minLevel: 100 },
};

const RANK_THRESHOLDS: { rank: HunterRank; minLevel: number }[] = [
  { rank: 'National', minLevel: 100 },
  { rank: 'SSS', minLevel: 85 },
  { rank: 'S', minLevel: 70 },
  { rank: 'A', minLevel: 55 },
  { rank: 'B', minLevel: 40 },
  { rank: 'C', minLevel: 25 },
  { rank: 'D', minLevel: 10 },
  { rank: 'E', minLevel: 1 },
];

// ── XP Curve (Continuous multi-tiered scaling) ──────────────────
export const MAX_LEVEL = 150;

/**
 * Calculates XP required to advance from Level L to Level L + 1
 */
export function xpForLevel(level: number): number {
  const L = Math.max(1, Math.floor(level));

  if (L === 1) return 100; // Exactly 1 standard session

  if (L <= 10) {
    // Beginner Tier (Levels 2-10): Rapid onboarding (1–3 sessions per level)
    return Math.round(100 * Math.pow(L, 1.15));
  }

  if (L <= 30) {
    // Intermediate Tier (Levels 11-30): Steady weekly progression (3–6 sessions per level)
    const base10 = 100 * Math.pow(10, 1.15);
    return Math.round(base10 * Math.pow(L / 10, 1.35));
  }

  if (L <= 70) {
    // Advanced Tier (Levels 31-70): Significant milestones (7–15 sessions per level)
    const base10 = 100 * Math.pow(10, 1.15);
    const xp30 = base10 * Math.pow(30 / 10, 1.35);
    return Math.round(xp30 * Math.pow(L / 30, 1.55));
  }

  // Master & Endgame Tier (Levels 71+): Smooth soft-cap scaling without impossible walls
  const base10 = 100 * Math.pow(10, 1.15);
  const xp30 = base10 * Math.pow(30 / 10, 1.35);
  const xp70 = xp30 * Math.pow(70 / 30, 1.55);
  return Math.round(xp70 + 180 * Math.pow(L - 70, 1.25));
}

/**
 * Total Cumulative XP from Level 1 up to Level L
 */
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += xpForLevel(l);
  }
  return total;
}

// ── XP Tuning Knobs ───────────────────────────────────────────
export const XP_TUNING = {
  BASE_MIN: 40,
  BASE_MAX: 65,
  PER_EXERCISE: 10,
  PER_SET: 3,
  PER_100KG_VOLUME: 2,
  COMPOUND_MULTIPLIER_MAX: 0.25,
  COMPLETION_POWER: 1.5,
  DURATION_BONUS_PER_MIN: 0.5,
  DURATION_CAP_MINUTES: 90,
  PR_BONUS: 80,
  PR_COMBO_MULTIPLIER: 1.15,
  STREAK_PER_DAY: 8,
  STREAK_CAP: 200,
  STREAK_7_BONUS: 50,
  STREAK_30_BONUS: 150,
  STREAK_100_BONUS: 500,
  PERFECT_WORKOUT_BONUS: 40,
  FIRST_WORKOUT_OF_DAY: 15,
  REST_DAY_BASE: 30,
  RANDOM_VARIANCE: 0.08,
  EXERCISE_COMPLETE_XP: 15,
} as const;

// ── Level-Up Rewards ──────────────────────────────────────────
export type LevelReward = {
  type: 'coins' | 'title' | 'skillPoints' | 'hunterRankXp';
  label: string;
  value: number | string;
  icon: string;
};

export function getLevelUpRewards(newLevel: number, rankChanged: boolean, newRank?: HunterRank): LevelReward[] {
  const rewards: LevelReward[] = [];

  const coinBase = 10 + Math.floor(newLevel * 1.5);
  rewards.push({ type: 'coins', label: 'Gold Coins', value: coinBase, icon: '🪙' });

  if (newLevel % 5 === 0) {
    rewards.push({ type: 'skillPoints', label: 'Skill Points', value: 1, icon: '⚡' });
  }
  if (newLevel % 10 === 0) {
    rewards.push({ type: 'skillPoints', label: 'Bonus Skill Points', value: 2, icon: '💎' });
  }

  if (rankChanged && newRank) {
    const rankCoins: Record<HunterRank, number> = {
      E: 0,
      D: 50,
      C: 150,
      B: 300,
      A: 500,
      S: 1000,
      SSS: 2000,
      National: 5000,
    };
    rewards.push({ type: 'coins', label: 'Rank Promotion Bonus', value: rankCoins[newRank] || 500, icon: '🏅' });
    rewards.push({ type: 'hunterRankXp', label: 'Hunter Rank EXP', value: 100, icon: '🛡️' });
  }

  const titles: Record<number, string> = {
    5: 'Initiate',
    10: 'Iron Will',
    15: 'Steel Body',
    20: 'Beast Slayer',
    25: 'Shadow Warrior',
    30: 'Dungeon Crawler',
    40: 'Gate Breaker',
    55: 'Monarch\'s Vessel',
    70: 'Sovereign',
    85: 'Shadow Monarch',
    100: 'National Level Sovereign',
    120: 'Absolute Being',
  };
  if (titles[newLevel]) {
    rewards.push({ type: 'title', label: 'Title Unlocked', value: titles[newLevel], icon: '👑' });
  }

  return rewards;
}

// ── XP Breakdown Type ─────────────────────────────────────────
export type XpBreakdown = {
  base: number;
  exerciseCount: number;
  setsCompleted: number;
  volume: number;
  completion: number;
  difficulty: number;
  streak: number;
  streakMilestone: number;
  personalRecords: number;
  perfectBonus: number;
  firstWorkout: number;
  durationBonus: number;
  randomBonus: number;
  exerciseXp: number;
  total: number;
};

export type WorkoutMetadata = {
  exerciseCount: number;
  totalSets: number;
  completedSets: number;
  totalVolumeKg: number;
  completionPercent: number;
  compoundRatio: number;
  isRestDay?: boolean;
  prCount?: number;
  durationMinutes?: number;
  isFirstWorkoutToday?: boolean;
};

export function calculateWorkoutXp(
  meta: WorkoutMetadata,
  streakDays: number,
): XpBreakdown {
  const T = XP_TUNING;

  if (meta.isRestDay) {
    const restTotal = T.REST_DAY_BASE + Math.min(streakDays * 2, 30);
    return {
      base: T.REST_DAY_BASE,
      exerciseCount: 0,
      setsCompleted: 0,
      volume: 0,
      completion: 0,
      difficulty: 0,
      streak: Math.min(streakDays * 2, 30),
      streakMilestone: 0,
      personalRecords: 0,
      perfectBonus: 0,
      firstWorkout: 0,
      durationBonus: 0,
      randomBonus: 0,
      exerciseXp: 0,
      total: restTotal,
    };
  }

  const base = Math.floor(T.BASE_MIN + Math.random() * (T.BASE_MAX - T.BASE_MIN + 1));
  const exerciseCount = meta.exerciseCount * T.PER_EXERCISE;
  const setsCompleted = meta.completedSets * T.PER_SET;
  const volume = Math.floor((meta.totalVolumeKg / 100) * T.PER_100KG_VOLUME);

  const completionRatio = Math.min(1, Math.max(0, meta.completionPercent / 100));
  const completionMultiplier = Math.pow(completionRatio, T.COMPLETION_POWER);
  const rawSubtotal = base + exerciseCount + setsCompleted + volume;
  const afterCompletion = Math.round(rawSubtotal * completionMultiplier);
  const completionDelta = afterCompletion - rawSubtotal;

  const difficultyMultiplier = 1 + (meta.compoundRatio * T.COMPOUND_MULTIPLIER_MAX);
  const afterDifficulty = Math.round(afterCompletion * difficultyMultiplier);
  const difficultyDelta = afterDifficulty - afterCompletion;

  const cappedDuration = Math.min(meta.durationMinutes ?? 0, T.DURATION_CAP_MINUTES);
  const durationBonus = Math.round(cappedDuration * T.DURATION_BONUS_PER_MIN);

  const streak = Math.min(streakDays * T.STREAK_PER_DAY, T.STREAK_CAP);

  let streakMilestone = 0;
  if (streakDays >= 100) streakMilestone = T.STREAK_100_BONUS;
  else if (streakDays >= 30) streakMilestone = T.STREAK_30_BONUS;
  else if (streakDays >= 7) streakMilestone = T.STREAK_7_BONUS;

  const prCount = meta.prCount ?? 0;
  let personalRecords = 0;
  if (prCount > 0) {
    personalRecords = Math.round(
      T.PR_BONUS * Math.pow(T.PR_COMBO_MULTIPLIER, prCount - 1)
    );
  }

  const perfectBonus = meta.completionPercent >= 100 ? T.PERFECT_WORKOUT_BONUS : 0;
  const firstWorkout = meta.isFirstWorkoutToday ? T.FIRST_WORKOUT_OF_DAY : 0;

  const preRandom = afterDifficulty + durationBonus + streak + streakMilestone + personalRecords + perfectBonus + firstWorkout;
  const variance = (Math.random() * 2 - 1) * T.RANDOM_VARIANCE;
  const randomBonus = Math.round(preRandom * Math.abs(variance)) * (variance >= 0 ? 1 : -1);

  const total = Math.max(1, preRandom + randomBonus);

  return {
    base, exerciseCount, setsCompleted, volume,
    completion: completionDelta, difficulty: difficultyDelta,
    streak, streakMilestone, personalRecords,
    perfectBonus, firstWorkout, durationBonus,
    randomBonus, exerciseXp: 0, total,
  };
}

// ── Attribute System ──────────────────────────────────────────
export type PlayerAttributes = {
  STR: number;
  AGI: number;
  VIT: number;
  INT: number;
  PER: number;
};

export const ATTRIBUTE_MAX = 100;

export function computeAttributes(
  level: number,
  stats: {
    totalVolumeKg: number;
    totalExercisesCompleted: number;
    restDaysCompleted: number;
    streakDays: number;
    longestStreak: number;
    totalWorkouts: number;
    prCount: number;
    uniqueExerciseCount: number;
    daysSinceStart: number;
  }
): PlayerAttributes {
  const BASE_STAT = 10;
  const pointsPerLevel = 5;
  const totalFreePoints = (Math.max(1, level) - 1) * pointsPerLevel;

  const strScore = stats.totalVolumeKg / 100; 
  const agiScore = stats.totalExercisesCompleted + (stats.restDaysCompleted * 2);
  const vitScore = (stats.streakDays * 3) + (stats.longestStreak * 2) + stats.totalWorkouts;
  const intScore = (stats.prCount * 5) + (stats.uniqueExerciseCount * 2);
  const perScore = stats.daysSinceStart > 0 
    ? (stats.totalWorkouts / stats.daysSinceStart) * 50 
    : stats.totalWorkouts * 2;

  const totalScore = strScore + agiScore + vitScore + intScore + perScore;

  if (totalScore <= 0) {
    const even = Math.floor(totalFreePoints / 5);
    const remainder = totalFreePoints % 5;
    return {
      STR: BASE_STAT + even + (remainder > 0 ? 1 : 0),
      AGI: BASE_STAT + even + (remainder > 1 ? 1 : 0),
      VIT: BASE_STAT + even + (remainder > 2 ? 1 : 0),
      INT: BASE_STAT + even + (remainder > 3 ? 1 : 0),
      PER: BASE_STAT + even,
    };
  }

  const distribute = (score: number) => Math.floor((score / totalScore) * totalFreePoints);

  const STR_alloc = distribute(strScore);
  const AGI_alloc = distribute(agiScore);
  const VIT_alloc = distribute(vitScore);
  const INT_alloc = distribute(intScore);
  const PER_alloc = Math.max(0, totalFreePoints - (STR_alloc + AGI_alloc + VIT_alloc + INT_alloc));

  return {
    STR: BASE_STAT + STR_alloc,
    AGI: BASE_STAT + AGI_alloc,
    VIT: BASE_STAT + VIT_alloc,
    INT: BASE_STAT + INT_alloc,
    PER: BASE_STAT + PER_alloc,
  };
}

// ── Helpers ───────────────────────────────────────────────────
export function getRankForLevel(level: number): HunterRank {
  for (const { rank, minLevel } of RANK_THRESHOLDS) {
    if (level >= minLevel) return rank;
  }
  return 'E';
}

export function getRankConfig(level: number) {
  const rank = getRankForLevel(level);
  return { rank, ...RANK_CONFIG[rank] };
}

export function getStreakBonus(streakDays: number): number {
  return Math.min(streakDays * XP_TUNING.STREAK_PER_DAY, XP_TUNING.STREAK_CAP);
}
