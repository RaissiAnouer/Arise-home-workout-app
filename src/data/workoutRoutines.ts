/**
 * workoutRoutines.ts
 *
 * Evidence-based workout routines focused on muscle growth and strength.
 * Covers Gym, Bodyweight, and Dumbbell-Only modalities across 2, 3, 4, 5, and 6-day splits.
 */

export interface RoutineExercise {
  name: string;
  setsReps: string;
  sets: number;
  repRange: string;
  restSeconds: number;
  category: 'compound' | 'isolation' | 'core_calves';
  targetMuscle?: string;
}

export interface RoutineDay {
  dayNumber: number;
  dayName: string; // e.g. "Day 1", "Push", "Upper A"
  focus: string;   // e.g. "Full Body", "Chest, Shoulders, Triceps"
  exercises: RoutineExercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  equipment: 'gym' | 'bodyweight' | 'dumbbells';
  daysPerWeek: number;
  description: string;
  days: RoutineDay[];
}

// ── Sets & Reps Prescriptions ─────────────────────────────────────────────
export const SETS_AND_REPS_GUIDE = {
  strength: { sets: '3-5', reps: '3-6', description: 'Best for pure strength gains' },
  strengthAndMuscle: { sets: '3-4', reps: '5-8', description: 'Heavy muscle building & power' },
  muscleGrowth: { sets: '3-4', reps: '6-12', description: 'Hypertrophy sweet spot for most lifters' },
  isolation: { sets: '2-4', reps: '10-20', description: 'Single joint focus & metabolic stress' },
  calvesAndAbs: { sets: '3-5', reps: '12-20', description: 'High endurance & density muscles' },
};

// ── Progressive Overload Principles ──────────────────────────────────────
export const PROGRESSIVE_OVERLOAD_GUIDE = {
  weightIncrease: 'When you hit the top of the rep range for all sets with good form, increase weight by 2.5% to 5%.',
  weeklyVolume: '10 to 20 hard sets per target muscle group per week.',
  intensityRIR: 'Leave 1 to 3 Reps in Reserve (RIR) on most working sets.',
  restIntervals: {
    compound: '2 to 3 minutes',
    isolation: '60 to 90 seconds',
  },
};

// ── Master Program Library ───────────────────────────────────────────────
export const ALL_WORKOUT_ROUTINES: WorkoutProgram[] = [
  // =========================================================================
  // GYM WORKOUTS
  // =========================================================================
  {
    id: 'gym-2day',
    name: '2 Days Full Body (Gym)',
    equipment: 'gym',
    daysPerWeek: 2,
    description: 'Balanced 2-day full body split for maximum efficiency and recovery.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Day 1',
        focus: 'Full Body A',
        exercises: [
          { name: 'Barbell Squat', setsReps: '3×6-8', sets: 3, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Bench Press', setsReps: '3×6-8', sets: 3, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Lat Pulldown', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Romanian Deadlift', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Lateral Raise', setsReps: '2×12-15', sets: 2, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Triceps Pushdown', setsReps: '2×10-15', sets: 2, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Standing Calf Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Hanging Leg Raise', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2',
        focus: 'Full Body B',
        exercises: [
          { name: 'Deadlift', setsReps: '3×5', sets: 3, repRange: '5', restSeconds: 180, category: 'compound', targetMuscle: 'Back' },
          { name: 'Incline Dumbbell Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Seated Cable Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Bulgarian Split Squat', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Face Pull', setsReps: '2×12-15', sets: 2, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Dumbbell Curl', setsReps: '2×10-15', sets: 2, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Seated Calf Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Cable Crunch', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'gym-3day',
    name: '3 Days Push Pull Legs (Gym)',
    equipment: 'gym',
    daysPerWeek: 3,
    description: 'Classic 3-day Push Pull Legs split targeting specific muscle groups per workout.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Push',
        focus: 'Chest, Shoulders & Triceps',
        exercises: [
          { name: 'Bench Press', setsReps: '3-4×6-10', sets: 4, repRange: '6-10', restSeconds: 180, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Incline Dumbbell Press', setsReps: '3-4×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Overhead Press', setsReps: '3×6-8', sets: 3, repRange: '6-8', restSeconds: 120, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Lateral Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Triceps Pushdown', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Overhead Triceps Extension', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Pull',
        focus: 'Back, Rear Delts & Biceps',
        exercises: [
          { name: 'Pull-up / Lat Pulldown', setsReps: '3-4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Barbell Row', setsReps: '3-4×6-8', sets: 3, repRange: '6-8', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Chest Supported Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Face Pull', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Dumbbell Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Hammer Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Legs',
        focus: 'Quads, Hamstrings, Calves & Core',
        exercises: [
          { name: 'Back Squat', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Romanian Deadlift', setsReps: '3-4×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Leg Press', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Leg Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Standing Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Ab Wheel Rollout', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'gym-4day',
    name: '4 Days Upper Lower (Gym)',
    equipment: 'gym',
    daysPerWeek: 4,
    description: '4-day split providing high frequency hit rate for all muscle groups with variation A/B.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Upper A',
        focus: 'Upper Body Compound & Arms',
        exercises: [
          { name: 'Bench Press', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Barbell Row', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Incline Dumbbell Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Lat Pulldown', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Lateral Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Triceps Pushdown', setsReps: '2-3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Dumbbell Curl', setsReps: '2-3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Lower A',
        focus: 'Squats, Hinge & Core',
        exercises: [
          { name: 'Back Squat', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Romanian Deadlift', setsReps: '3-4×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Leg Press', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Leg Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Standing Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Hanging Leg Raise', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Upper B',
        focus: 'Overhead Press & Vertical Pull Focus',
        exercises: [
          { name: 'Overhead Press', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Pull-up', setsReps: '3-4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Chest Press Machine', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Seated Cable Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Rear Delt Fly', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Skull Crushers', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Hammer Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Lower B',
        focus: 'Quads & Glutes Dominant',
        exercises: [
          { name: 'Front Squat', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Barbell Hip Thrust', setsReps: '3-4×8-12', sets: 3, repRange: '8-12', restSeconds: 120, category: 'compound', targetMuscle: 'Glutes' },
          { name: 'Walking Lunges', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Leg Extension', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Quadriceps' },
          { name: 'Standing Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Cable Crunch', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'gym-5day',
    name: '5 Days PPL Upper Lower (Gym)',
    equipment: 'gym',
    daysPerWeek: 5,
    description: 'High volume 5-day hybrid split combining Push Pull Legs with Upper Lower days.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Push',
        focus: 'Chest, Shoulders & Triceps',
        exercises: [
          { name: 'Bench Press', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Incline Dumbbell Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Overhead Press', setsReps: '3×6-8', sets: 3, repRange: '6-8', restSeconds: 120, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Lateral Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Triceps Pushdown', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Pull',
        focus: 'Back & Biceps',
        exercises: [
          { name: 'Pull-up', setsReps: '3-4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Barbell Row', setsReps: '3-4×6-8', sets: 3, repRange: '6-8', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Seated Cable Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Rear Delt Fly', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Dumbbell Curl', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Legs',
        focus: 'Quads, Hamstrings & Calves',
        exercises: [
          { name: 'Back Squat', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Romanian Deadlift', setsReps: '3-4×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Leg Press', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Leg Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Standing Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Upper',
        focus: 'Upper Body Hypertrophy',
        exercises: [
          { name: 'Incline Bench Press', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Pull-up', setsReps: '3-4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Chest Supported Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Dumbbell Shoulder Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Super Arms (Bicep/Tricep superset)', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Lower',
        focus: 'Heavy Deadlift & Unilateral Leg Work',
        exercises: [
          { name: 'Deadlift', setsReps: '3×5', sets: 3, repRange: '5', restSeconds: 180, category: 'compound', targetMuscle: 'Back' },
          { name: 'Bulgarian Split Squat', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Leg Extension', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Quadriceps' },
          { name: 'Leg Curl', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Standing Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Cable Crunch', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'gym-6day',
    name: '6 Days Push Pull Legs x2 (Gym)',
    equipment: 'gym',
    daysPerWeek: 6,
    description: 'Maximum volume 6-day split with separate A/B workouts per body section.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Push A',
        focus: 'Chest Heavy Push',
        exercises: [
          { name: 'Bench Press', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Incline Dumbbell Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Overhead Press', setsReps: '3×6-8', sets: 3, repRange: '6-8', restSeconds: 120, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Lateral Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Triceps Pushdown', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Pull A',
        focus: 'Vertical & Row Heavy Pull',
        exercises: [
          { name: 'Pull-up', setsReps: '3-4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Barbell Row', setsReps: '3-4×6-8', sets: 3, repRange: '6-8', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Face Pull', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'EZ Bar Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Hammer Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Legs A',
        focus: 'Squat & RDL Heavy Legs',
        exercises: [
          { name: 'Back Squat', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Romanian Deadlift', setsReps: '3-4×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Leg Press', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Standing Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Hanging Leg Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Push B',
        focus: 'Incline & Machine Push',
        exercises: [
          { name: 'Incline Bench Press', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Machine Chest Press', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Dumbbell Shoulder Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Cable Fly', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Chest' },
          { name: 'Overhead Triceps Extension', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Pull B',
        focus: 'Lat Pulldown & Isolation Pull',
        exercises: [
          { name: 'Lat Pulldown', setsReps: '3-4×8-12', sets: 4, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Seated Cable Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Rear Delt Fly', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Preacher Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Cable Curl', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Legs B',
        focus: 'Front Squat & Hip Thrust Legs',
        exercises: [
          { name: 'Front Squat', setsReps: '3-4×6-8', sets: 4, repRange: '6-8', restSeconds: 180, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Barbell Hip Thrust', setsReps: '3-4×8-12', sets: 4, repRange: '8-12', restSeconds: 120, category: 'compound', targetMuscle: 'Glutes' },
          { name: 'Leg Extension', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Quadriceps' },
          { name: 'Leg Curl', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Seated Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Hanging Leg Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },

  // =========================================================================
  // BODYWEIGHT WORKOUTS
  // =========================================================================
  {
    id: 'bodyweight-2day',
    name: '2 Days Calisthenics (Bodyweight)',
    equipment: 'bodyweight',
    daysPerWeek: 2,
    description: 'Minimalist 2-day full body bodyweight routine requiring no equipment.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Day 1',
        focus: 'Upper Push & Quads',
        exercises: [
          { name: 'Push-ups', setsReps: '3-4×10-20', sets: 4, repRange: '10-20', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Pike Push-ups', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Bulgarian Split Squats', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Glute Bridge', setsReps: '3×15-20', sets: 3, repRange: '15-20', restSeconds: 60, category: 'isolation', targetMuscle: 'Glutes' },
          { name: 'Plank', setsReps: '3×45-60s', sets: 3, repRange: '45-60s', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2',
        focus: 'Upper Pull & Hamstrings',
        exercises: [
          { name: 'Pull-ups (or Table Rows)', setsReps: '3-4×6-12', sets: 4, repRange: '6-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Chin-ups', setsReps: '3×6-10', sets: 3, repRange: '6-10', restSeconds: 90, category: 'compound', targetMuscle: 'Biceps' },
          { name: 'Walking Lunges', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Nordic Curl (or Sliding Curl)', setsReps: '3×6-10', sets: 3, repRange: '6-10', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Hanging Knee Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'bodyweight-3day',
    name: '3 Days Push Pull Legs (Bodyweight)',
    equipment: 'bodyweight',
    daysPerWeek: 3,
    description: 'Bodyweight Push Pull Legs split focused on movement patterns and progression.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Push',
        focus: 'Chest, Shoulders & Triceps',
        exercises: [
          { name: 'Push-ups', setsReps: '3-4×12-20', sets: 4, repRange: '12-20', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Decline Push-ups', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Pike Push-ups', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Diamond Push-ups', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Bench Dips', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Pull',
        focus: 'Back & Posterior Chain',
        exercises: [
          { name: 'Pull-ups', setsReps: '3-4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Chin-ups', setsReps: '3×6-10', sets: 3, repRange: '6-10', restSeconds: 90, category: 'compound', targetMuscle: 'Biceps' },
          { name: 'Australian Rows', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Reverse Snow Angels', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Superman Hold', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Back' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Legs',
        focus: 'Quads, Glutes & Abs',
        exercises: [
          { name: 'Squats', setsReps: '4×15-25', sets: 4, repRange: '15-25', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Bulgarian Split Squats', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Jump Squats', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Single Leg Glute Bridge', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Glutes' },
          { name: 'Standing Calf Raises', setsReps: '4×15-20', sets: 4, repRange: '15-20', restSeconds: 60, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Hanging Leg Raises', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'bodyweight-4day',
    name: '4 Days Upper Lower (Bodyweight)',
    equipment: 'bodyweight',
    daysPerWeek: 4,
    description: '4-day calisthenics routine structured around Upper/Lower A & B days.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Upper A',
        focus: 'Standard Push Pull Compounds',
        exercises: [
          { name: 'Push-ups', setsReps: '4×12-20', sets: 4, repRange: '12-20', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Pull-ups', setsReps: '4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Pike Push-ups', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Australian Rows', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Plank', setsReps: '3×45-60s', sets: 3, repRange: '45-60s', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Lower A',
        focus: 'Squats, Lunges & Calves',
        exercises: [
          { name: 'Squats', setsReps: '4×15-20', sets: 4, repRange: '15-20', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Walking Lunges', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Glute Bridge', setsReps: '3×15-20', sets: 3, repRange: '15-20', restSeconds: 60, category: 'isolation', targetMuscle: 'Glutes' },
          { name: 'Standing Calf Raises', setsReps: '4×15-20', sets: 4, repRange: '15-20', restSeconds: 60, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Leg Raises', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Upper B',
        focus: 'Decline Push & Chin-up Focus',
        exercises: [
          { name: 'Decline Push-ups', setsReps: '4×10-15', sets: 4, repRange: '10-15', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Chin-ups', setsReps: '4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Biceps' },
          { name: 'Diamond Push-ups', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Reverse Snow Angels', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Hollow Body Hold', setsReps: '3×30-45s', sets: 3, repRange: '30-45s', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Lower B',
        focus: 'Unilateral Legs & Core Stability',
        exercises: [
          { name: 'Bulgarian Split Squats', setsReps: '4×10-12', sets: 4, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Single Leg RDL', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Jump Squats', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Nordic Curl', setsReps: '3×6-8', sets: 3, repRange: '6-8', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Side Plank', setsReps: '3×30-45s', sets: 3, repRange: '30-45s', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'bodyweight-5day',
    name: '5 Days Calisthenics Volume (Bodyweight)',
    equipment: 'bodyweight',
    daysPerWeek: 5,
    description: 'Higher volume 5-day bodyweight routine utilizing Push, Pull, Legs, Upper, Lower.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Push',
        focus: 'Push-up & Dip Variations',
        exercises: [
          { name: 'Push-ups', setsReps: '4×15-20', sets: 4, repRange: '15-20', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Decline Push-ups', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Pike Push-ups', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Diamond Push-ups', setsReps: '3×10-15', sets: 3, repRange: '10-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Pull',
        focus: 'Pull-ups & Australian Rows',
        exercises: [
          { name: 'Pull-ups', setsReps: '4×6-10', sets: 4, repRange: '6-10', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Chin-ups', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 90, category: 'compound', targetMuscle: 'Biceps' },
          { name: 'Australian Rows', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Superman', setsReps: '3×15', sets: 3, repRange: '15', restSeconds: 60, category: 'isolation', targetMuscle: 'Back' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Legs',
        focus: 'Bodyweight Quads & Hamstrings',
        exercises: [
          { name: 'Squats', setsReps: '4×20', sets: 4, repRange: '20', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Bulgarian Split Squats', setsReps: '3×12', sets: 3, repRange: '12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Nordic Curl', setsReps: '3×8', sets: 3, repRange: '8', restSeconds: 90, category: 'isolation', targetMuscle: 'Hamstrings' },
          { name: 'Calf Raises', setsReps: '4×20', sets: 4, repRange: '20', restSeconds: 60, category: 'core_calves', targetMuscle: 'Calves' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Upper',
        focus: 'Calisthenics Hypertrophy',
        exercises: [
          { name: 'Push-ups', setsReps: '4×15', sets: 4, repRange: '15', restSeconds: 90, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Pull-ups', setsReps: '4×8', sets: 4, repRange: '8', restSeconds: 120, category: 'compound', targetMuscle: 'Back' },
          { name: 'Bench Dips', setsReps: '3×15', sets: 3, repRange: '15', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Reverse Snow Angels', setsReps: '3×15', sets: 3, repRange: '15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Lower',
        focus: 'Single Leg Strength & Core',
        exercises: [
          { name: 'Walking Lunges', setsReps: '4×15', sets: 4, repRange: '15', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Single Leg Glute Bridge', setsReps: '3×15', sets: 3, repRange: '15', restSeconds: 60, category: 'isolation', targetMuscle: 'Glutes' },
          { name: 'Jump Squats', setsReps: '3×12', sets: 3, repRange: '12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Hollow Hold', setsReps: '3×45s', sets: 3, repRange: '45s', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },

  // =========================================================================
  // DUMBBELL ONLY WORKOUTS
  // =========================================================================
  {
    id: 'dumbbells-2day',
    name: '2 Days Dumbbell Only',
    equipment: 'dumbbells',
    daysPerWeek: 2,
    description: 'Full-body dumbbell training routine perfect for home workouts with dumbbells.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Day 1',
        focus: 'Full Body DB A',
        exercises: [
          { name: 'Goblet Squat', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Dumbbell Bench Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'One Arm Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Romanian Deadlift', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Shoulder Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Dumbbell Curl', setsReps: '2×10-15', sets: 2, repRange: '10-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Overhead Triceps Extension', setsReps: '2×10-15', sets: 2, repRange: '10-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2',
        focus: 'Full Body DB B',
        exercises: [
          { name: 'Bulgarian Split Squat', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Incline DB Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Chest Supported Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Lateral Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Hammer Curl', setsReps: '2×10-15', sets: 2, repRange: '10-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Skull Crusher', setsReps: '2×10-15', sets: 2, repRange: '10-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
          { name: 'Dumbbell Calf Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Calves' },
        ],
      },
    ],
  },
  {
    id: 'dumbbells-3day',
    name: '3 Days Push Pull Legs (Dumbbells)',
    equipment: 'dumbbells',
    daysPerWeek: 3,
    description: '3-day PPL routine structured entirely for dumbbell workouts.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Push',
        focus: 'Chest, Shoulders & Triceps',
        exercises: [
          { name: 'DB Bench Press', setsReps: '3-4×8-10', sets: 4, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Incline DB Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Shoulder Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Lateral Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Overhead Triceps Extension', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Pull',
        focus: 'Back, Rear Delts & Arms',
        exercises: [
          { name: 'One Arm Row', setsReps: '3-4×8-10', sets: 4, repRange: '8-10', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Chest Supported Row', setsReps: '3×8-12', sets: 3, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Rear Delt Fly', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Dumbbell Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 60, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Hammer Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 60, category: 'isolation', targetMuscle: 'Biceps' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Legs',
        focus: 'Legs & Weighted Core',
        exercises: [
          { name: 'Goblet Squat', setsReps: '3-4×8-10', sets: 4, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Romanian Deadlift', setsReps: '3-4×8-10', sets: 4, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Walking Lunges', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Dumbbell Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Weighted Sit-up', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
  {
    id: 'dumbbells-4day',
    name: '4 Days Upper Lower (Dumbbells)',
    equipment: 'dumbbells',
    daysPerWeek: 4,
    description: 'Comprehensive 4-day Upper/Lower split built for dumbbell training.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Upper A',
        focus: 'DB Bench & Heavy Rows',
        exercises: [
          { name: 'DB Bench Press', setsReps: '4×8-10', sets: 4, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'One Arm Row', setsReps: '4×8-10', sets: 4, repRange: '8-10', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Shoulder Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Lateral Raise', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Dumbbell Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 60, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Triceps Extension', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Lower A',
        focus: 'Squats & RDLs',
        exercises: [
          { name: 'Goblet Squat', setsReps: '4×8-10', sets: 4, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Romanian Deadlift', setsReps: '4×8-10', sets: 4, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Bulgarian Split Squat', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Calf Raise', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Weighted Sit-up', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Upper B',
        focus: 'Incline Bench & Arnold Press',
        exercises: [
          { name: 'Incline Bench', setsReps: '4×8-10', sets: 4, repRange: '8-10', restSeconds: 120, category: 'compound', targetMuscle: 'Chest' },
          { name: 'Chest Supported Row', setsReps: '4×8-12', sets: 4, repRange: '8-12', restSeconds: 90, category: 'compound', targetMuscle: 'Back' },
          { name: 'Arnold Press', setsReps: '3×8-10', sets: 3, repRange: '8-10', restSeconds: 90, category: 'compound', targetMuscle: 'Shoulders' },
          { name: 'Rear Delt Fly', setsReps: '3×12-15', sets: 3, repRange: '12-15', restSeconds: 60, category: 'isolation', targetMuscle: 'Shoulders' },
          { name: 'Hammer Curl', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 60, category: 'isolation', targetMuscle: 'Biceps' },
          { name: 'Skull Crusher', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 60, category: 'isolation', targetMuscle: 'Triceps' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Lower B',
        focus: 'Step-ups & Single Leg RDLs',
        exercises: [
          { name: 'Step-ups', setsReps: '4×10-12', sets: 4, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Single Leg RDL', setsReps: '4×10-12', sets: 4, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Hamstrings' },
          { name: 'Walking Lunges', setsReps: '3×10-12', sets: 3, repRange: '10-12', restSeconds: 90, category: 'compound', targetMuscle: 'Quadriceps' },
          { name: 'Calves', setsReps: '4×12-15', sets: 4, repRange: '12-15', restSeconds: 60, category: 'core_calves', targetMuscle: 'Calves' },
          { name: 'Russian Twist', setsReps: '3×15-20', sets: 3, repRange: '15-20', restSeconds: 60, category: 'core_calves', targetMuscle: 'Core' },
        ],
      },
    ],
  },
];

export function getRoutineById(id: string): WorkoutProgram | undefined {
  return ALL_WORKOUT_ROUTINES.find(r => r.id === id);
}

export function getRoutinesByEquipment(equipment: 'gym' | 'bodyweight' | 'dumbbells'): WorkoutProgram[] {
  return ALL_WORKOUT_ROUTINES.filter(r => r.equipment === equipment);
}
