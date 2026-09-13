/**
 * Shadow Collection — Card Data
 *
 * 45 achievements spanning all rarity tiers and unlock conditions
 * for the Shadow Collection page.
 */

// ── Rarity Types ────────────────────────────────────────────
export type ShadowRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

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
}

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

// ── 45 Shadow Cards / Achievements ──────────────────────────
export const SHADOW_CARDS: ShadowCard[] = [
  // ─── COMMON (12) ───
  {
    id: 'ember',
    name: 'EMBER',
    title: 'Flame Wisp',
    rarity: 'Common',
    level: 1,
    element: 'fire',
    stats: { STR: 12, AGI: 18, END: 10, POW: 15 },
    lore: 'A flickering spirit born from the first spark of determination. Small but relentless.',
    unlockRequirement: 'Complete 1 Workout',
    unlockCondition: { type: 'workouts', value: 1 },
  },
  {
    id: 'thornback',
    name: 'THORNBACK',
    title: 'Briar Sentinel',
    rarity: 'Common',
    level: 2,
    element: 'earth',
    stats: { STR: 20, AGI: 8, END: 22, POW: 10 },
    lore: 'An ancient guardian wrapped in living thorns. Its patience is its greatest weapon.',
    unlockRequirement: 'Complete 2 Workouts',
    unlockCondition: { type: 'workouts', value: 2 },
  },
  {
    id: 'dustwalker',
    name: 'DUSTWALKER',
    title: 'Sand Phantom',
    rarity: 'Common',
    level: 2,
    element: 'wind',
    stats: { STR: 10, AGI: 24, END: 14, POW: 12 },
    lore: 'Moves through dust storms unseen. Strikes before the wind settles.',
    unlockRequirement: 'Reach Level 2',
    unlockCondition: { type: 'level', value: 2 },
  },
  {
    id: 'ashveil',
    name: 'ASHVEIL',
    title: 'Cinder Wraith',
    rarity: 'Common',
    level: 3,
    element: 'shadow',
    stats: { STR: 14, AGI: 16, END: 12, POW: 18 },
    lore: 'Born from cooled embers and sorrow. It drifts between realms seeking purpose.',
    unlockRequirement: 'Complete 3 Workouts',
    unlockCondition: { type: 'workouts', value: 3 },
  },
  {
    id: 'ironmaw',
    name: 'IRONMAW',
    title: 'Steel Devourer',
    rarity: 'Common',
    level: 3,
    element: 'earth',
    stats: { STR: 26, AGI: 6, END: 20, POW: 8 },
    lore: 'Jaws forged from deep-earth ore. It consumes weakness and spits out resolve.',
    unlockRequirement: 'Complete 20 Exercises',
    unlockCondition: { type: 'exercises', value: 20 },
  },
  {
    id: 'coilshadow',
    name: 'COILSHADOW',
    title: 'Serpent Shade',
    rarity: 'Common',
    level: 4,
    element: 'shadow',
    stats: { STR: 15, AGI: 22, END: 11, POW: 14 },
    lore: 'A coiling shadow that wraps around doubt and crushes it silently.',
    unlockRequirement: 'Reach Level 3',
    unlockCondition: { type: 'level', value: 3 },
  },
  {
    id: 'breezewhisper',
    name: 'BREEZEWHISPER',
    title: 'Zephyr Scout',
    rarity: 'Common',
    level: 4,
    element: 'wind',
    stats: { STR: 11, AGI: 25, END: 13, POW: 12 },
    lore: 'A whisper in the canopy signaling the approach of storm season.',
    unlockRequirement: 'Maintain 2-Day Streak',
    unlockCondition: { type: 'streak', value: 2 },
  },
  {
    id: 'flintstone',
    name: 'FLINTSTONE',
    title: 'Pebble Brute',
    rarity: 'Common',
    level: 5,
    element: 'earth',
    stats: { STR: 24, AGI: 10, END: 25, POW: 9 },
    lore: 'Solid stone imbued with basic sentience. It stands ground without fear.',
    unlockRequirement: 'Complete 5 Workouts',
    unlockCondition: { type: 'workouts', value: 5 },
  },
  {
    id: 'sparkling',
    name: 'SPARKLING',
    title: 'Static Sprite',
    rarity: 'Common',
    level: 5,
    element: 'lightning',
    stats: { STR: 13, AGI: 26, END: 12, POW: 19 },
    lore: 'A tiny charge that gathers intensity with every repeated motion.',
    unlockRequirement: 'Complete 40 Exercises',
    unlockCondition: { type: 'exercises', value: 40 },
  },
  {
    id: 'mirecreeper',
    name: 'MIRECREEPER',
    title: 'Swamp Stalker',
    rarity: 'Common',
    level: 6,
    element: 'shadow',
    stats: { STR: 18, AGI: 17, END: 21, POW: 15 },
    lore: 'Hides beneath still murky waters until the ideal hunting moment arrives.',
    unlockRequirement: 'Reach Level 5',
    unlockCondition: { type: 'level', value: 5 },
  },
  {
    id: 'chillfang',
    name: 'CHILLFANG',
    title: 'Frost Pup',
    rarity: 'Common',
    level: 6,
    element: 'ice',
    stats: { STR: 17, AGI: 21, END: 18, POW: 16 },
    lore: 'Breath as sharp as glass needles. Loyal to any hunter who endures the cold.',
    unlockRequirement: 'Maintain 3-Day Streak',
    unlockCondition: { type: 'streak', value: 3 },
  },
  {
    id: 'slateguard',
    name: 'SLATEGUARD',
    title: 'Crag Defender',
    rarity: 'Common',
    level: 7,
    element: 'earth',
    stats: { STR: 27, AGI: 9, END: 28, POW: 11 },
    lore: 'An ancient boundary marker animated to shield fledglings from danger.',
    unlockRequirement: 'Complete 7 Workouts',
    unlockCondition: { type: 'workouts', value: 7 },
  },

  // ─── RARE (12) ───
  {
    id: 'ironclad',
    name: 'IRONCLAD',
    title: 'Fortress Knight',
    rarity: 'Rare',
    level: 8,
    element: 'earth',
    stats: { STR: 32, AGI: 12, END: 35, POW: 18 },
    lore: 'A warrior encased in living armor. Each blow against it makes it stronger.',
    unlockRequirement: 'Complete 10 Workouts',
    unlockCondition: { type: 'workouts', value: 10 },
  },
  {
    id: 'stormfang',
    name: 'STORMFANG',
    title: 'Tempest Wolf',
    rarity: 'Rare',
    level: 8,
    element: 'lightning',
    stats: { STR: 28, AGI: 34, END: 20, POW: 24 },
    lore: 'Rides the lightning across battlefields. Its howl splits the sky in two.',
    unlockRequirement: 'Reach Level 8',
    unlockCondition: { type: 'level', value: 8 },
  },
  {
    id: 'veilstalker',
    name: 'VEILSTALKER',
    title: 'Mist Assassin',
    rarity: 'Rare',
    level: 9,
    element: 'shadow',
    stats: { STR: 22, AGI: 38, END: 16, POW: 30 },
    lore: 'Exists between the folds of reality. You feel its blade before you see it.',
    unlockRequirement: 'Maintain 5-Day Streak',
    unlockCondition: { type: 'streak', value: 5 },
  },
  {
    id: 'gravewing',
    name: 'GRAVEWING',
    title: 'Dusk Raptor',
    rarity: 'Rare',
    level: 10,
    element: 'wind',
    stats: { STR: 24, AGI: 36, END: 22, POW: 20 },
    lore: 'Descends from twilight skies. Its wingspan blocks out the fading sun.',
    unlockRequirement: 'Complete 12 Workouts',
    unlockCondition: { type: 'workouts', value: 12 },
  },
  {
    id: 'frostbane',
    name: 'FROSTBANE',
    title: 'Glacial Warden',
    rarity: 'Rare',
    level: 10,
    element: 'ice',
    stats: { STR: 30, AGI: 18, END: 34, POW: 26 },
    lore: 'Guards the frozen gates with unshakable discipline. Nothing passes without its permission.',
    unlockRequirement: 'Complete 75 Exercises',
    unlockCondition: { type: 'exercises', value: 75 },
  },
  {
    id: 'thunderclaw',
    name: 'THUNDERCLAW',
    title: 'Voltaic Behemoth',
    rarity: 'Rare',
    level: 11,
    element: 'lightning',
    stats: { STR: 33, AGI: 28, END: 26, POW: 31 },
    lore: 'Charged claws rend steel barriers as if they were wet parchment.',
    unlockRequirement: 'Reach Level 10',
    unlockCondition: { type: 'level', value: 10 },
  },
  {
    id: 'duskprowler',
    name: 'DUSKPROWLER',
    title: 'Midnight Stalker',
    rarity: 'Rare',
    level: 12,
    element: 'shadow',
    stats: { STR: 26, AGI: 39, END: 21, POW: 29 },
    lore: 'Moves like spilled ink over battlefield shadows. Never misses its mark.',
    unlockRequirement: 'Maintain 7-Day Streak',
    unlockCondition: { type: 'streak', value: 7 },
  },
  {
    id: 'tidalwarden',
    name: 'TIDALWARDEN',
    title: 'Aquatic Phalanx',
    rarity: 'Rare',
    level: 12,
    element: 'ice',
    stats: { STR: 29, AGI: 22, END: 36, POW: 25 },
    lore: 'Stands firm against crushing ocean depths. Its stance is unbreakable.',
    unlockRequirement: 'Complete 15 Workouts',
    unlockCondition: { type: 'workouts', value: 15 },
  },
  {
    id: 'obsidiangolem',
    name: 'OBSIDIANGOLEM',
    title: 'Volcanic Core',
    rarity: 'Rare',
    level: 13,
    element: 'fire',
    stats: { STR: 37, AGI: 14, END: 38, POW: 28 },
    lore: 'Magma runs through glassy black veins. Radiates heat with every step.',
    unlockRequirement: 'Complete 120 Exercises',
    unlockCondition: { type: 'exercises', value: 120 },
  },
  {
    id: 'galeblade',
    name: 'GALEBLADE',
    title: 'Cyclone Dervish',
    rarity: 'Rare',
    level: 13,
    element: 'wind',
    stats: { STR: 25, AGI: 42, END: 20, POW: 30 },
    lore: 'Twin wind-forged blades cut through air currents like silver ribbons.',
    unlockRequirement: 'Reach Level 12',
    unlockCondition: { type: 'level', value: 12 },
  },
  {
    id: 'emeraldserpent',
    name: 'EMERALDSERPENT',
    title: 'Jade Drake',
    rarity: 'Rare',
    level: 14,
    element: 'earth',
    stats: { STR: 31, AGI: 33, END: 30, POW: 27 },
    lore: 'Scales harder than diamond reflect forest sunlight. An ancient guardian.',
    unlockRequirement: 'Maintain 10-Day Streak',
    unlockCondition: { type: 'streak', value: 10 },
  },
  {
    id: 'sunstriker',
    name: 'SUNSTRIKER',
    title: 'Solar Lancer',
    rarity: 'Rare',
    level: 14,
    element: 'light',
    stats: { STR: 34, AGI: 30, END: 27, POW: 35 },
    lore: 'Channels concentrated daylight into blazing spears of holy precision.',
    unlockRequirement: 'Complete 18 Workouts',
    unlockCondition: { type: 'workouts', value: 18 },
  },

  // ─── EPIC (10) ───
  {
    id: 'ignis',
    name: 'IGNIS',
    title: 'Infernal Commander',
    rarity: 'Epic',
    level: 16,
    element: 'fire',
    stats: { STR: 40, AGI: 28, END: 36, POW: 42 },
    lore: 'Commands the legions of the scorched earth. Its blade burns with a flame that never dies.',
    unlockRequirement: 'Complete 20 Workouts',
    unlockCondition: { type: 'workouts', value: 20 },
  },
  {
    id: 'shadowweaver',
    name: 'SHADOWWEAVER',
    title: 'Umbral Architect',
    rarity: 'Epic',
    level: 17,
    element: 'void',
    stats: { STR: 25, AGI: 44, END: 28, POW: 48 },
    lore: 'Spins threads of darkness to trap enemies in perpetual nightmare.',
    unlockRequirement: 'Reach Level 15',
    unlockCondition: { type: 'level', value: 15 },
  },
  {
    id: 'voidwalker',
    name: 'VOIDWALKER',
    title: 'Abyssal Nomad',
    rarity: 'Epic',
    level: 18,
    element: 'void',
    stats: { STR: 32, AGI: 42, END: 30, POW: 45 },
    lore: 'Steps through dimensions as easily as crossing a threshold. Reality bends around it.',
    unlockRequirement: 'Maintain 14-Day Streak',
    unlockCondition: { type: 'streak', value: 14 },
  },
  {
    id: 'dreadnought',
    name: 'DREADNOUGHT',
    title: 'Colossus of Ruin',
    rarity: 'Epic',
    level: 19,
    element: 'earth',
    stats: { STR: 48, AGI: 16, END: 46, POW: 34 },
    lore: 'A walking fortress carved from a fallen mountain. Nothing can stop its advance.',
    unlockRequirement: 'Complete 25 Workouts',
    unlockCondition: { type: 'workouts', value: 25 },
  },
  {
    id: 'frostmonarch',
    name: 'FROSTMONARCH',
    title: 'Blizzard Sovereign',
    rarity: 'Epic',
    level: 20,
    element: 'ice',
    stats: { STR: 36, AGI: 35, END: 40, POW: 46 },
    lore: 'A monarch of absolute zero. Freezes entire landscapes with a single sigh.',
    unlockRequirement: 'Complete 200 Exercises',
    unlockCondition: { type: 'exercises', value: 200 },
  },
  {
    id: 'crimsonreaper',
    name: 'CRIMSONREAPER',
    title: 'Blood Scythe',
    rarity: 'Epic',
    level: 21,
    element: 'shadow',
    stats: { STR: 44, AGI: 38, END: 32, POW: 44 },
    lore: 'Harvests the exhaustion of foes, converting their fatigue into devastating energy.',
    unlockRequirement: 'Reach Level 18',
    unlockCondition: { type: 'level', value: 18 },
  },
  {
    id: 'zephyrlord',
    name: 'ZEPHYRLORD',
    title: 'Storm Emperor',
    rarity: 'Epic',
    level: 22,
    element: 'wind',
    stats: { STR: 35, AGI: 48, END: 31, POW: 43 },
    lore: 'Rides supersonic gale winds that tear enemy armor to atomic dust.',
    unlockRequirement: 'Maintain 21-Day Streak',
    unlockCondition: { type: 'streak', value: 21 },
  },
  {
    id: 'titancrusher',
    name: 'TITANCRUSHER',
    title: 'Earthshaker',
    rarity: 'Epic',
    level: 23,
    element: 'earth',
    stats: { STR: 50, AGI: 20, END: 47, POW: 38 },
    lore: 'Strikes the ground to split tectonic faults. A testament to pure physical power.',
    unlockRequirement: 'Complete 30 Workouts',
    unlockCondition: { type: 'workouts', value: 30 },
  },
  {
    id: 'astralhunter',
    name: 'ASTRALHUNTER',
    title: 'Starlight Stalker',
    rarity: 'Epic',
    level: 24,
    element: 'light',
    stats: { STR: 38, AGI: 45, END: 34, POW: 47 },
    lore: 'Draws arrows of stellar radiation. Pinpoints quarry across infinite light years.',
    unlockRequirement: 'Reach Level 22',
    unlockCondition: { type: 'level', value: 22 },
  },
  {
    id: 'tempestsovereign',
    name: 'TEMPESTSOVEREIGN',
    title: 'Thunder Herald',
    rarity: 'Epic',
    level: 25,
    element: 'lightning',
    stats: { STR: 42, AGI: 43, END: 35, POW: 49 },
    lore: 'Birthplace of thunderbolts. It commands atmospheric fury at will.',
    unlockRequirement: 'Complete 350 Exercises',
    unlockCondition: { type: 'exercises', value: 350 },
  },

  // ─── LEGENDARY (7) ───
  {
    id: 'abyssal_lord',
    name: 'ABYSSAL LORD',
    title: 'Keeper of the Deep',
    rarity: 'Legendary',
    level: 26,
    element: 'void',
    stats: { STR: 48, AGI: 36, END: 50, POW: 52 },
    lore: 'Guards the boundary between existence and nothingness. Its gaze holds the weight of eternity.',
    unlockRequirement: 'Reach Level 25',
    unlockCondition: { type: 'level', value: 25 },
  },
  {
    id: 'eclipsion',
    name: 'ECLIPSION',
    title: 'Solar Devourer',
    rarity: 'Legendary',
    level: 28,
    element: 'light',
    stats: { STR: 44, AGI: 40, END: 42, POW: 56 },
    lore: 'Swallows stars and wears their light as armor. When it speaks, suns go dark.',
    unlockRequirement: 'Maintain 30-Day Streak',
    unlockCondition: { type: 'streak', value: 30 },
  },
  {
    id: 'soulforger',
    name: 'SOULFORGER',
    title: 'Spirit Smith',
    rarity: 'Legendary',
    level: 30,
    element: 'fire',
    stats: { STR: 52, AGI: 30, END: 48, POW: 50 },
    lore: 'Hammers raw willpower into unbreakable weapons. Each creation holds a fragment of its maker\'s soul.',
    unlockRequirement: 'Complete 40 Workouts',
    unlockCondition: { type: 'workouts', value: 40 },
  },
  {
    id: 'celestial_aegis',
    name: 'CELESTIAL AEGIS',
    title: 'Divine Bulwark',
    rarity: 'Legendary',
    level: 32,
    element: 'light',
    stats: { STR: 46, AGI: 35, END: 56, POW: 54 },
    lore: 'Shields whole civilizations from cataclysms. Nothing evil can pierce its light.',
    unlockRequirement: 'Reach Level 30',
    unlockCondition: { type: 'level', value: 30 },
  },
  {
    id: 'phantom_overlord',
    name: 'PHANTOM OVERLORD',
    title: 'Nether King',
    rarity: 'Legendary',
    level: 34,
    element: 'shadow',
    stats: { STR: 50, AGI: 48, END: 44, POW: 58 },
    lore: 'Commands millions of fallen hunter spirits. A phantom court of unrivaled martial prowess.',
    unlockRequirement: 'Maintain 45-Day Streak',
    unlockCondition: { type: 'streak', value: 45 },
  },
  {
    id: 'dragonslayer',
    name: 'DRAGONSLAYER',
    title: 'Wyrm Scourge',
    rarity: 'Legendary',
    level: 36,
    element: 'fire',
    stats: { STR: 56, AGI: 38, END: 52, POW: 55 },
    lore: 'Bane of elder dragons. Wears dragonbone armor impervious to molten breath.',
    unlockRequirement: 'Complete 50 Workouts',
    unlockCondition: { type: 'workouts', value: 50 },
  },
  {
    id: 'starforged_behemoth',
    name: 'STARFORGED',
    title: 'Cosmic Juggernaut',
    rarity: 'Legendary',
    level: 38,
    element: 'void',
    stats: { STR: 58, AGI: 32, END: 55, POW: 57 },
    lore: 'Forged within the heart of collapsing stars. Its density exerts gravitational pull.',
    unlockRequirement: 'Complete 500 Exercises',
    unlockCondition: { type: 'exercises', value: 500 },
  },

  // ─── MYTHIC (4) ───
  {
    id: 'sovereign',
    name: 'SOVEREIGN',
    title: 'Shadow Monarch\'s Hand',
    rarity: 'Mythic',
    level: 40,
    element: 'shadow',
    stats: { STR: 62, AGI: 56, END: 60, POW: 68 },
    lore: 'The right hand of the Shadow Monarch. Commands legions with a single gesture. Power beyond measure.',
    unlockRequirement: 'Reach Level 40',
    unlockCondition: { type: 'level', value: 40 },
  },
  {
    id: 'immortal_shadow',
    name: 'IMMORTAL SHADOW',
    title: 'Eternal Vanguard',
    rarity: 'Mythic',
    level: 44,
    element: 'void',
    stats: { STR: 65, AGI: 62, END: 64, POW: 72 },
    lore: 'Cannot be destroyed, only summoned. Every defeat only crystallizes its immortal resolve.',
    unlockRequirement: 'Maintain 60-Day Streak',
    unlockCondition: { type: 'streak', value: 60 },
  },
  {
    id: 'transcendent',
    name: 'TRANSCENDENT',
    title: 'Deity of Shadows',
    rarity: 'Mythic',
    level: 48,
    element: 'light',
    stats: { STR: 70, AGI: 68, END: 68, POW: 78 },
    lore: 'Surpassed the realm of hunters. The universe itself parts ways to allow its passage.',
    unlockRequirement: 'Reach Level 50',
    unlockCondition: { type: 'level', value: 50 },
  },
  {
    id: 'monarch',
    name: 'MONARCH',
    title: 'The Absolute Ruler',
    rarity: 'Mythic',
    level: 50,
    element: 'shadow',
    stats: { STR: 78, AGI: 74, END: 75, POW: 85 },
    lore: 'The pinnacle of all shadows. Born when a hunter transcends mortality. There can only be one.',
    unlockRequirement: 'Complete 100 Workouts',
    unlockCondition: { type: 'workouts', value: 100 },
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
