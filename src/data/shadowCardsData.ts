/**
 * Shadow Collection — Card Data
 *
 * Exactly 6 unique shadows mapping 1-to-1 with the shadow artwork assets.
 * No repeated shadows or duplicated images.
 */

import { ImageSourcePropType } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Rarity Types ────────────────────────────────────────────
export type ShadowRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type ShadowRank = 'E-RANK' | 'D-RANK' | 'C-RANK' | 'B-RANK' | 'A-RANK' | 'S-RANK';

export type ShadowElement = 'fire' | 'ice' | 'shadow' | 'lightning' | 'earth' | 'void' | 'light' | 'wind';

export interface ShadowStats {
  STR: number;
  AGI: number;
  END: number;
  POW: number;
}

export type UnlockConditionKey =
  | 'workouts'
  | 'level'
  | 'streak'
  | 'exercises';

export interface ShadowCard {
  id: string;
  name: string;
  title: string;
  rank: ShadowRank;
  quote: string;
  description: string;
  rarity: ShadowRarity;
  level: number;
  element: ShadowElement;
  stats: ShadowStats;
  lore: string;
  unlockRequirement: string;
  unlockCondition: {
    type: UnlockConditionKey;
    value: number;
  };
  unlockDate?: string;
}

// ── Rank Visual Config (Solo Leveling Ranks) ─────────────────
export const RANK_CONFIG: Record<ShadowRank, {
  label: string;
  color: string;
  glowColor: string;
  badgeBg: string;
  borderColor: string;
  glowIntensity: number;
}> = {
  'E-RANK': {
    label: 'E-RANK',
    color: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    badgeBg: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.35)',
    glowIntensity: 4,
  },
  'D-RANK': {
    label: 'D-RANK',
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    badgeBg: 'rgba(56, 189, 248, 0.14)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    glowIntensity: 6,
  },
  'C-RANK': {
    label: 'C-RANK',
    color: '#4080E7',
    glowColor: 'rgba(64, 128, 231, 0.55)',
    badgeBg: 'rgba(64, 128, 231, 0.15)',
    borderColor: 'rgba(64, 128, 231, 0.45)',
    glowIntensity: 8,
  },
  'B-RANK': {
    label: 'B-RANK',
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    badgeBg: 'rgba(168, 85, 247, 0.18)',
    borderColor: 'rgba(168, 85, 247, 0.55)',
    glowIntensity: 12,
  },
  'A-RANK': {
    label: 'A-RANK',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.75)',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.65)',
    glowIntensity: 16,
  },
  'S-RANK': {
    label: 'S-RANK',
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.9)',
    badgeBg: 'rgba(239, 68, 68, 0.24)',
    borderColor: 'rgba(239, 68, 68, 0.8)',
    glowIntensity: 22,
  },
};

// ── Rarity Visual Config ────────────────────────────────────
export const RARITY_CONFIG: Record<ShadowRarity, {
  color: string;
  glowColor: string;
  borderColor: string;
  bgTint: string;
  label: string;
  sortOrder: number;
}> = {
  Common: {
    color: '#9E9E9E',
    glowColor: 'rgba(158, 158, 158, 0.3)',
    borderColor: 'rgba(158, 158, 158, 0.5)',
    bgTint: 'rgba(158, 158, 158, 0.06)',
    label: 'COMMON',
    sortOrder: 0,
  },
  Rare: {
    color: '#4080E7',
    glowColor: 'rgba(64, 128, 231, 0.35)',
    borderColor: 'rgba(64, 128, 231, 0.55)',
    bgTint: 'rgba(64, 128, 231, 0.08)',
    label: 'RARE',
    sortOrder: 1,
  },
  Epic: {
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    borderColor: 'rgba(168, 85, 247, 0.55)',
    bgTint: 'rgba(168, 85, 247, 0.08)',
    label: 'EPIC',
    sortOrder: 2,
  },
  Legendary: {
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    borderColor: 'rgba(245, 158, 11, 0.6)',
    bgTint: 'rgba(245, 158, 11, 0.08)',
    label: 'LEGENDARY',
    sortOrder: 3,
  },
  Mythic: {
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    borderColor: 'rgba(239, 68, 68, 0.65)',
    bgTint: 'rgba(239, 68, 68, 0.1)',
    label: 'MYTHIC',
    sortOrder: 4,
  },
};

// ── Element Visual Config ───────────────────────────────────
export const ELEMENT_CONFIG: Record<ShadowElement, {
  color: string;
  icon: string;
}> = {
  fire:      { color: '#FF6B35', icon: '🔥' },
  ice:       { color: '#38BDF8', icon: '❄️' },
  shadow:    { color: '#7C3AED', icon: '🌑' },
  lightning: { color: '#FACC15', icon: '⚡' },
  earth:     { color: '#84CC16', icon: '🪨' },
  void:      { color: '#6366F1', icon: '🕳️' },
  light:     { color: '#FBBF24', icon: '✨' },
  wind:      { color: '#67E8F9', icon: '💨' },
};

// ── Shadow Artwork Mapping (1-to-1 with actual image assets) ─
export const SHADOW_CARD_IMAGES: Record<string, ImageSourcePropType> = {
  'iron-soldier': require('../images/shadows/e-rank.png'),
  'jade-knight': require('../images/shadows/c-rank.png'),
  'fang-beast': require('../images/shadows/c-rank2.png'),
  'arcane-commander': require('../images/shadows/b-rank.png'),
  'flame-general': require('../images/shadows/a-rank.png'),
  'shadow-sovereign': require('../images/shadows/s-rank.png'),
};

export const SHADOW_IMAGES: Record<string, ImageSourcePropType> = {
  E: require('../images/shadows/e-rank.png'),
  C: require('../images/shadows/c-rank.png'),
  C2: require('../images/shadows/c-rank2.png'),
  B: require('../images/shadows/b-rank.png'),
  A: require('../images/shadows/a-rank.png'),
  S: require('../images/shadows/s-rank.png'),
};

export function getShadowImage(card: ShadowCard): ImageSourcePropType {
  return SHADOW_CARD_IMAGES[card.id] || SHADOW_CARD_IMAGES['iron-soldier'];
}

// ── Unlock Dates Storage ────────────────────────────────────
export const SHADOW_UNLOCK_DATES_KEY = '@arise_shadow_unlock_dates_v2';

export const DEFAULT_SHADOW_UNLOCK_DATES: Record<string, string> = {
  'iron-soldier': 'August 2, 2026',
  'jade-knight': 'August 15, 2026',
  'fang-beast': 'August 28, 2026',
  'arcane-commander': 'September 5, 2026',
  'flame-general': 'September 18, 2026',
  'shadow-sovereign': 'September 24, 2026',
};

export function formatShadowDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'August 2, 2026';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function getShadowUnlockDate(cardId: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(SHADOW_UNLOCK_DATES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed[cardId]) return parsed[cardId];
    if (DEFAULT_SHADOW_UNLOCK_DATES[cardId]) return DEFAULT_SHADOW_UNLOCK_DATES[cardId];
    return null;
  } catch {
    return DEFAULT_SHADOW_UNLOCK_DATES[cardId] || null;
  }
}

export async function setShadowUnlockDate(cardId: string, dateStr?: string): Promise<string> {
  const formatted = dateStr || formatShadowDate(new Date());
  try {
    const raw = await AsyncStorage.getItem(SHADOW_UNLOCK_DATES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[cardId] = formatted;
    await AsyncStorage.setItem(SHADOW_UNLOCK_DATES_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.warn('Failed to save shadow unlock date:', e);
  }
  return formatted;
}

// ── 6 Unique Shadows (1 per artwork file, no duplicates) ─────
export const SHADOW_CARDS: ShadowCard[] = [
  {
    id: 'iron-soldier',
    name: 'IRON SOLDIER',
    title: 'The Initiate',
    rank: 'E-RANK',
    rarity: 'Common',
    level: 1,
    element: 'earth',
    stats: { STR: 24, AGI: 16, END: 28, POW: 20 },
    quote: '“I begin where all must start; with one small step, I grow the heart.”',
    description: 'Armored in hardened resolve, this shadow holds the front lines through grueling trials. The first step on the path of shadows.',
    lore: 'Armored in hardened resolve, this shadow holds the front lines through grueling trials. The first step on the path of shadows.',
    unlockRequirement: 'Finishing the first task',
    unlockCondition: { type: 'workouts', value: 1 },
    unlockDate: 'August 2, 2026',
  },
  {
    id: 'jade-knight',
    name: 'JADE KNIGHT',
    title: 'The Emerald Blade',
    rank: 'C-RANK',
    rarity: 'Rare',
    level: 10,
    element: 'wind',
    stats: { STR: 36, AGI: 42, END: 32, POW: 38 },
    quote: '“A blade tempered in discipline cuts through every doubt and hesitation.”',
    description: 'Strikes with swift precision. Its blade glows with crystallized jade energy.',
    lore: 'Strikes with swift precision. Its blade glows with crystallized jade energy.',
    unlockRequirement: 'Complete 5 Workouts',
    unlockCondition: { type: 'workouts', value: 5 },
    unlockDate: 'August 15, 2026',
  },
  {
    id: 'fang-beast',
    name: 'FANG BEAST',
    title: 'The Primal Stalker',
    rank: 'C-RANK',
    rarity: 'Rare',
    level: 15,
    element: 'shadow',
    stats: { STR: 44, AGI: 48, END: 36, POW: 42 },
    quote: '“The relentless hunt turns fatigue to power; ferocity answers only to discipline.”',
    description: 'An apex predator that stalks in the gloom, unleashing ferocious flurry attacks.',
    lore: 'An apex predator that stalks in the gloom, unleashing ferocious flurry attacks.',
    unlockRequirement: 'Achieve a 3-Day Streak',
    unlockCondition: { type: 'streak', value: 3 },
    unlockDate: 'August 28, 2026',
  },
  {
    id: 'arcane-commander',
    name: 'ARCANE COMMANDER',
    title: 'The Abyssal Strategist',
    rank: 'B-RANK',
    rarity: 'Epic',
    level: 25,
    element: 'void',
    stats: { STR: 52, AGI: 50, END: 56, POW: 68 },
    quote: '“Power without strategy is merely fuel for the abyss. Order commands destiny.”',
    description: 'Commands dark void legions with tactical genius and unyielding psychic dominance.',
    lore: 'Commands dark void legions with tactical genius and unyielding psychic dominance.',
    unlockRequirement: 'Reach Hunter Level 15',
    unlockCondition: { type: 'level', value: 15 },
    unlockDate: 'September 5, 2026',
  },
  {
    id: 'flame-general',
    name: 'FLAME GENERAL',
    title: 'The Inferno Warlord',
    rank: 'A-RANK',
    rarity: 'Legendary',
    level: 40,
    element: 'fire',
    stats: { STR: 72, AGI: 65, END: 70, POW: 80 },
    quote: '“Burn away all mortal weakness until only pure, incandescent dominance remains.”',
    description: 'A towering conqueror bathed in eternal hellfire, incinerating any obstacle in its path.',
    lore: 'A towering conqueror bathed in eternal hellfire, incinerating any obstacle in its path.',
    unlockRequirement: 'Complete 25 Workouts',
    unlockCondition: { type: 'workouts', value: 25 },
    unlockDate: 'September 18, 2026',
  },
  {
    id: 'shadow-sovereign',
    name: 'SHADOW SOVEREIGN',
    title: 'The Absolute Monarch',
    rank: 'S-RANK',
    rarity: 'Mythic',
    level: 50,
    element: 'shadow',
    stats: { STR: 88, AGI: 85, END: 88, POW: 96 },
    quote: '“Arise. Death is not an ending, but the dawn of absolute monarch dominion.”',
    description: 'The supreme monarch of shadows. Transcends mortal limits and bends reality to its will.',
    lore: 'The supreme monarch of shadows. Transcends mortal limits and bends reality to its will.',
    unlockRequirement: 'Complete 50 Workouts',
    unlockCondition: { type: 'workouts', value: 50 },
    unlockDate: 'September 24, 2026',
  },
];

/**
 * Check if a card is unlocked based on user progression.
 */
export function isCardUnlocked(
  card: ShadowCard,
  progression: {
    totalWorkouts: number;
    level: number;
    streakDays: number;
    totalExercisesCompleted: number;
  }
): boolean {
  const { type, value } = card.unlockCondition;
  switch (type) {
    case 'workouts':
      return progression.totalWorkouts >= value;
    case 'level':
      return progression.level >= value;
    case 'streak':
      return progression.streakDays >= value;
    case 'exercises':
      return progression.totalExercisesCompleted >= value;
    default:
      return false;
  }
}

export interface CardUnlockProgress {
  current: number;
  required: number;
  percentage: number;
  unit: string;
}

/**
 * Get detailed unlock progress for a card.
 */
export function getCardUnlockProgress(
  card: ShadowCard,
  progression: {
    totalWorkouts: number;
    level: number;
    streakDays: number;
    totalExercisesCompleted: number;
  }
): CardUnlockProgress {
  const { type, value } = card.unlockCondition;
  let current = 0;
  let unit = '';
  switch (type) {
    case 'workouts':
      current = progression.totalWorkouts || 0;
      unit = 'Workouts';
      break;
    case 'level':
      current = progression.level || 1;
      unit = 'Level';
      break;
    case 'streak':
      current = progression.streakDays || 0;
      unit = 'Days Streak';
      break;
    case 'exercises':
      current = progression.totalExercisesCompleted || 0;
      unit = 'Exercises';
      break;
  }
  const percentage = Math.min(100, Math.round((current / value) * 100));
  return { current, required: value, percentage, unit };
}

/**
 * Get all rarity filter options.
 */
export const RARITY_FILTERS: Array<ShadowRarity | 'All'> = [
  'All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic',
];
