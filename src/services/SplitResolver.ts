/**
 * SplitResolver.ts
 *
 * Defines movement patterns, slot requirements, and blueprint generation
 * for weekly workout assembly.
 */

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type MovementPattern =
  | 'horizontal_press'
  | 'incline_press'
  | 'vertical_press'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'hip_thrust'
  | 'lateral_delt_isolation'
  | 'rear_delt_isolation'
  | 'bicep_isolation'
  | 'tricep_isolation'
  | 'chest_fly'
  | 'calf_isolation'
  | 'core_anti_extension'
  | 'core_flexion'
  | 'core_rotation'
  | 'glute_isolation'
  | 'leg_extension_isolation'
  | 'leg_curl_isolation'
  | 'shrug'
  | 'pullover'
  | 'wrist_forearm';

export interface SlotRequirement {
  targetMuscle: string;
  pattern: MovementPattern;
  priority: 'primary' | 'accessory' | 'isolation';
  sets: number;
  repRange: string;
}

export interface DayBlueprint {
  dayNumber: number;
  dayLabel: string;
  focus: string;
  slots: SlotRequirement[];
}

/**
 * Maps questionnaire inputs (days, equipment, experience) to day blueprints.
 */
export function resolveSplit(
  daysPerWeek: number = 3,
  equipment: string = 'full_gym',
  experience: ExperienceLevel = 'intermediate'
): DayBlueprint[] {
  // Return standard blueprints based on requested frequency
  if (daysPerWeek <= 2) {
    return [
      {
        dayNumber: 1,
        dayLabel: 'Day 1: Full Body A',
        focus: 'Full Body Compound & Arms',
        slots: [
          { targetMuscle: 'Quadriceps', pattern: 'squat', priority: 'primary', sets: 3, repRange: '6-8' },
          { targetMuscle: 'Chest', pattern: 'horizontal_press', priority: 'primary', sets: 3, repRange: '6-8' },
          { targetMuscle: 'Back', pattern: 'vertical_pull', priority: 'primary', sets: 3, repRange: '8-12' },
          { targetMuscle: 'Hamstrings', pattern: 'hinge', priority: 'accessory', sets: 3, repRange: '8-10' },
          { targetMuscle: 'Shoulders', pattern: 'lateral_delt_isolation', priority: 'isolation', sets: 2, repRange: '12-15' },
          { targetMuscle: 'Triceps', pattern: 'tricep_isolation', priority: 'isolation', sets: 2, repRange: '10-15' },
          { targetMuscle: 'Calves', pattern: 'calf_isolation', priority: 'isolation', sets: 3, repRange: '12-15' },
          { targetMuscle: 'Core', pattern: 'core_flexion', priority: 'isolation', sets: 3, repRange: '10-15' },
        ],
      },
      {
        dayNumber: 2,
        dayLabel: 'Day 2: Full Body B',
        focus: 'Hinge, Incline & Pull',
        slots: [
          { targetMuscle: 'Back', pattern: 'hinge', priority: 'primary', sets: 3, repRange: '5' },
          { targetMuscle: 'Chest', pattern: 'incline_press', priority: 'primary', sets: 3, repRange: '8-10' },
          { targetMuscle: 'Back', pattern: 'horizontal_pull', priority: 'primary', sets: 3, repRange: '8-12' },
          { targetMuscle: 'Quadriceps', pattern: 'lunge', priority: 'accessory', sets: 3, repRange: '8-10' },
          { targetMuscle: 'Shoulders', pattern: 'rear_delt_isolation', priority: 'isolation', sets: 2, repRange: '12-15' },
          { targetMuscle: 'Biceps', pattern: 'bicep_isolation', priority: 'isolation', sets: 2, repRange: '10-15' },
          { targetMuscle: 'Calves', pattern: 'calf_isolation', priority: 'isolation', sets: 3, repRange: '12-15' },
          { targetMuscle: 'Core', pattern: 'core_flexion', priority: 'isolation', sets: 3, repRange: '12-15' },
        ],
      },
    ];
  }

  if (daysPerWeek === 3) {
    return [
      {
        dayNumber: 1,
        dayLabel: 'Day 1: Push',
        focus: 'Chest, Shoulders & Triceps',
        slots: [
          { targetMuscle: 'Chest', pattern: 'horizontal_press', priority: 'primary', sets: 4, repRange: '6-10' },
          { targetMuscle: 'Chest', pattern: 'incline_press', priority: 'accessory', sets: 3, repRange: '8-10' },
          { targetMuscle: 'Shoulders', pattern: 'vertical_press', priority: 'accessory', sets: 3, repRange: '6-8' },
          { targetMuscle: 'Shoulders', pattern: 'lateral_delt_isolation', priority: 'isolation', sets: 3, repRange: '12-15' },
          { targetMuscle: 'Triceps', pattern: 'tricep_isolation', priority: 'isolation', sets: 3, repRange: '10-12' },
        ],
      },
      {
        dayNumber: 2,
        dayLabel: 'Day 2: Pull',
        focus: 'Back, Rear Delts & Biceps',
        slots: [
          { targetMuscle: 'Back', pattern: 'vertical_pull', priority: 'primary', sets: 4, repRange: '6-10' },
          { targetMuscle: 'Back', pattern: 'horizontal_pull', priority: 'primary', sets: 3, repRange: '6-8' },
          { targetMuscle: 'Shoulders', pattern: 'rear_delt_isolation', priority: 'isolation', sets: 3, repRange: '12-15' },
          { targetMuscle: 'Biceps', pattern: 'bicep_isolation', priority: 'isolation', sets: 3, repRange: '10-12' },
        ],
      },
      {
        dayNumber: 3,
        dayLabel: 'Day 3: Legs',
        focus: 'Quads, Hamstrings & Calves',
        slots: [
          { targetMuscle: 'Quadriceps', pattern: 'squat', priority: 'primary', sets: 4, repRange: '6-8' },
          { targetMuscle: 'Hamstrings', pattern: 'hinge', priority: 'primary', sets: 3, repRange: '8-10' },
          { targetMuscle: 'Quadriceps', pattern: 'leg_extension_isolation', priority: 'isolation', sets: 3, repRange: '10-12' },
          { targetMuscle: 'Hamstrings', pattern: 'leg_curl_isolation', priority: 'isolation', sets: 3, repRange: '10-12' },
          { targetMuscle: 'Calves', pattern: 'calf_isolation', priority: 'isolation', sets: 4, repRange: '12-15' },
          { targetMuscle: 'Core', pattern: 'core_anti_extension', priority: 'isolation', sets: 3, repRange: '10-15' },
        ],
      },
    ];
  }

  // 4 to 6 days default to 4-day Upper Lower or PPL
  return [
    {
      dayNumber: 1,
      dayLabel: 'Day 1: Upper A',
      focus: 'Upper Body Heavy',
      slots: [
        { targetMuscle: 'Chest', pattern: 'horizontal_press', priority: 'primary', sets: 4, repRange: '6-8' },
        { targetMuscle: 'Back', pattern: 'horizontal_pull', priority: 'primary', sets: 4, repRange: '6-8' },
        { targetMuscle: 'Chest', pattern: 'incline_press', priority: 'accessory', sets: 3, repRange: '8-10' },
        { targetMuscle: 'Back', pattern: 'vertical_pull', priority: 'accessory', sets: 3, repRange: '8-12' },
        { targetMuscle: 'Shoulders', pattern: 'lateral_delt_isolation', priority: 'isolation', sets: 3, repRange: '12-15' },
        { targetMuscle: 'Triceps', pattern: 'tricep_isolation', priority: 'isolation', sets: 3, repRange: '10-15' },
        { targetMuscle: 'Biceps', pattern: 'bicep_isolation', priority: 'isolation', sets: 3, repRange: '10-15' },
      ],
    },
    {
      dayNumber: 2,
      dayLabel: 'Day 2: Lower A',
      focus: 'Lower Body Heavy',
      slots: [
        { targetMuscle: 'Quadriceps', pattern: 'squat', priority: 'primary', sets: 4, repRange: '6-8' },
        { targetMuscle: 'Hamstrings', pattern: 'hinge', priority: 'primary', sets: 4, repRange: '8-10' },
        { targetMuscle: 'Quadriceps', pattern: 'lunge', priority: 'accessory', sets: 3, repRange: '10-12' },
        { targetMuscle: 'Hamstrings', pattern: 'leg_curl_isolation', priority: 'isolation', sets: 3, repRange: '10-12' },
        { targetMuscle: 'Calves', pattern: 'calf_isolation', priority: 'isolation', sets: 4, repRange: '12-15' },
        { targetMuscle: 'Core', pattern: 'core_flexion', priority: 'isolation', sets: 3, repRange: '10-15' },
      ],
    },
    {
      dayNumber: 3,
      dayLabel: 'Day 3: Upper B',
      focus: 'Overhead Press & Pull Focus',
      slots: [
        { targetMuscle: 'Shoulders', pattern: 'vertical_press', priority: 'primary', sets: 4, repRange: '6-8' },
        { targetMuscle: 'Back', pattern: 'vertical_pull', priority: 'primary', sets: 4, repRange: '6-10' },
        { targetMuscle: 'Chest', pattern: 'chest_fly', priority: 'accessory', sets: 3, repRange: '8-12' },
        { targetMuscle: 'Back', pattern: 'horizontal_pull', priority: 'accessory', sets: 3, repRange: '8-12' },
        { targetMuscle: 'Shoulders', pattern: 'rear_delt_isolation', priority: 'isolation', sets: 3, repRange: '12-15' },
        { targetMuscle: 'Triceps', pattern: 'tricep_isolation', priority: 'isolation', sets: 3, repRange: '10-12' },
        { targetMuscle: 'Biceps', pattern: 'bicep_isolation', priority: 'isolation', sets: 3, repRange: '10-12' },
      ],
    },
    {
      dayNumber: 4,
      dayLabel: 'Day 4: Lower B',
      focus: 'Quads, Glutes & Abs',
      slots: [
        { targetMuscle: 'Quadriceps', pattern: 'squat', priority: 'primary', sets: 4, repRange: '6-8' },
        { targetMuscle: 'Glutes', pattern: 'hip_thrust', priority: 'primary', sets: 4, repRange: '8-12' },
        { targetMuscle: 'Quadriceps', pattern: 'leg_extension_isolation', priority: 'isolation', sets: 3, repRange: '12-15' },
        { targetMuscle: 'Calves', pattern: 'calf_isolation', priority: 'isolation', sets: 4, repRange: '12-15' },
        { targetMuscle: 'Core', pattern: 'core_flexion', priority: 'isolation', sets: 3, repRange: '12-15' },
      ],
    },
  ];
}
