export type WorkoutSessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type PRType = 'weight' | 'reps' | 'oneRM' | 'volume';

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  duration?: number; // seconds (for static exercises like plank)
  distance?: number; // meters (if applicable)
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  restSeconds?: number;
  setType?: SetType;
  isPR?: boolean;
  prType?: PRType;
  previousBestWeight?: number;
  previousBestReps?: number;
}

export interface ExerciseSession {
  exerciseId: string;
  exerciseName: string;
  order: number;
  completed: boolean;
  personalRecord: boolean;
  notes?: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  workoutDayId: number | string;
  dayTitle?: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  durationSeconds: number;
  status: WorkoutSessionStatus;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  exercises: ExerciseSession[];
  isSynced?: boolean;
}

export interface SessionStats {
  totalVolume: number;
  totalReps: number;
  totalSets: number;
  durationSeconds: number;
  completedExercises: number;
  totalExercises: number;
  completionPercentage: number;
  prCount: number;
}

export interface PRResult {
  isPR: boolean;
  prType?: PRType;
  estimated1RM?: number;
  previousBestWeight?: number;
  previousBestReps?: number;
}
