import {
  WorkoutSession,
  ExerciseSession,
  ExerciseSet,
  WorkoutSessionStatus,
} from '../types/workoutSession';
import { WorkoutSessionRepository } from '../repositories/WorkoutSessionRepository';
import { PRService } from './PRService';
import { calculateSessionStats } from '../utils/workoutStats';

export class WorkoutSessionService {
  /**
   * Starts a new workout session or returns existing active session
   */
  static async startWorkout(
    userId: string,
    workoutPlanId: string,
    workoutDayId: number | string,
    dayTitle: string,
    initialExercises: { id: string; name: string; setsCount: number; targetWeight?: number; targetReps?: number }[]
  ): Promise<WorkoutSession> {
    // Check if active session already exists for user
    const active = await WorkoutSessionRepository.getActiveSession(userId);
    if (active) {
      if (active.status === 'paused') {
        active.status = 'active';
        active.updatedAt = new Date().toISOString();
        await WorkoutSessionRepository.saveActiveSession(active);
      }
      return active;
    }

    const now = new Date().toISOString();
    const sessionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const exercises: ExerciseSession[] = initialExercises.map((ex, order) => {
      const sets: ExerciseSet[] = Array.from({ length: ex.setsCount }).map((_, idx) => ({
        id: `set_${order}_${idx + 1}_${Date.now()}`,
        setNumber: idx + 1,
        weight: ex.targetWeight || 0,
        reps: ex.targetReps || 10,
        completed: false,
        setType: 'normal',
      }));

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        order: order + 1,
        completed: false,
        personalRecord: false,
        sets,
      };
    });

    const newSession: WorkoutSession = {
      id: sessionId,
      userId,
      workoutPlanId,
      workoutDayId,
      dayTitle,
      startTime: now,
      durationSeconds: 0,
      status: 'active',
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      createdAt: now,
      updatedAt: now,
      exercises,
    };

    await WorkoutSessionRepository.saveActiveSession(newSession);
    return newSession;
  }

  /**
   * Resumes an existing active/paused workout session
   */
  static async resumeWorkout(userId: string): Promise<WorkoutSession | null> {
    const active = await WorkoutSessionRepository.getActiveSession(userId);
    if (active && active.status === 'paused') {
      active.status = 'active';
      active.updatedAt = new Date().toISOString();
      await WorkoutSessionRepository.saveActiveSession(active);
    }
    return active;
  }

  /**
   * Pauses an active workout session
   */
  static async pauseWorkout(session: WorkoutSession): Promise<WorkoutSession> {
    session.status = 'paused';
    session.updatedAt = new Date().toISOString();
    await WorkoutSessionRepository.saveActiveSession(session);
    return session;
  }

  /**
   * Updates a specific set and automatically saves session state
   */
  static async updateSet(
    session: WorkoutSession,
    exerciseId: string,
    setIndex: number,
    updates: Partial<ExerciseSet>
  ): Promise<WorkoutSession> {
    const ex = session.exercises.find(
      (e) => e.exerciseId === exerciseId || e.exerciseName === exerciseId
    );
    if (ex && ex.sets[setIndex]) {
      ex.sets[setIndex] = {
        ...ex.sets[setIndex],
        ...updates,
      };

      // Recalculate summary metrics
      const stats = calculateSessionStats(session);
      session.totalVolume = stats.totalVolume;
      session.totalSets = stats.totalSets;
      session.totalReps = stats.totalReps;
      session.updatedAt = new Date().toISOString();

      await WorkoutSessionRepository.saveActiveSession(session);
    }
    return session;
  }

  /**
   * Toggles or marks a set complete, detecting PRs automatically
   */
  static async completeSet(
    session: WorkoutSession,
    exerciseId: string,
    setIndex: number
  ): Promise<{ session: WorkoutSession; isPR: boolean }> {
    const ex = session.exercises.find(
      (e) => e.exerciseId === exerciseId || e.exerciseName === exerciseId
    );
    let isPRDetected = false;

    if (ex && ex.sets[setIndex]) {
      const set = ex.sets[setIndex];
      const newCompleted = !set.completed;
      set.completed = newCompleted;

      if (newCompleted) {
        // Fetch history to check PR
        const history = await WorkoutSessionRepository.getWorkoutHistory(session.userId);
        const prCheck = PRService.checkSetPR(ex.exerciseId, set.weight, set.reps, history);

        if (prCheck.isPR) {
          set.isPR = true;
          set.prType = prCheck.prType;
          ex.personalRecord = true;
          isPRDetected = true;
        }
      } else {
        set.isPR = false;
      }

      // Check if all sets for this exercise are finished
      ex.completed = ex.sets.every((s) => s.completed);

      // Recalculate summary metrics
      const stats = calculateSessionStats(session);
      session.totalVolume = stats.totalVolume;
      session.totalSets = stats.totalSets;
      session.totalReps = stats.totalReps;
      session.updatedAt = new Date().toISOString();

      await WorkoutSessionRepository.saveActiveSession(session);
    }

    return { session, isPR: isPRDetected };
  }

  /**
   * Marks an entire exercise complete
   */
  static async completeExercise(
    session: WorkoutSession,
    exerciseId: string
  ): Promise<WorkoutSession> {
    const ex = session.exercises.find(
      (e) => e.exerciseId === exerciseId || e.exerciseName === exerciseId
    );
    if (ex) {
      ex.completed = true;
      ex.sets.forEach((s) => (s.completed = true));

      const stats = calculateSessionStats(session);
      session.totalVolume = stats.totalVolume;
      session.totalSets = stats.totalSets;
      session.totalReps = stats.totalReps;
      session.updatedAt = new Date().toISOString();

      await WorkoutSessionRepository.saveActiveSession(session);
    }
    return session;
  }

  /**
   * Finalizes and saves a completed workout session
   */
  static async finishWorkout(session: WorkoutSession): Promise<WorkoutSession> {
    const now = new Date().toISOString();
    const stats = calculateSessionStats(session);

    session.endTime = now;
    session.status = 'completed';
    session.totalVolume = stats.totalVolume;
    session.totalSets = stats.totalSets;
    session.totalReps = stats.totalReps;
    session.updatedAt = now;

    // Save completed session to history and clear active session
    await WorkoutSessionRepository.saveCompletedSession(session);
    await WorkoutSessionRepository.clearActiveSession(session.userId);

    return session;
  }

  /**
   * Cancels/abandons an active workout session
   */
  static async cancelWorkout(session: WorkoutSession): Promise<void> {
    session.status = 'abandoned';
    session.updatedAt = new Date().toISOString();
    await WorkoutSessionRepository.clearActiveSession(session.userId);
  }

  /**
   * Retrieves past workout history
   */
  static async getWorkoutHistory(userId: string): Promise<WorkoutSession[]> {
    return WorkoutSessionRepository.getWorkoutHistory(userId);
  }

  /**
   * Gets a specific session by ID
   */
  static async getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
    return WorkoutSessionRepository.getSessionById(sessionId);
  }

  /**
   * Deletes a session from history
   */
  static async deleteWorkoutSession(sessionId: string): Promise<void> {
    return WorkoutSessionRepository.deleteSession(sessionId);
  }
}
