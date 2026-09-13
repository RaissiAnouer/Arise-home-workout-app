import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '../types/workoutSession';

const ACTIVE_SESSION_KEY_PREFIX = '@active_workout_session_';
const HISTORY_SESSIONS_KEY = '@workout_history_sessions_v1';
const SYNC_QUEUE_KEY = '@workout_sync_queue_v1';

export class WorkoutSessionRepository {
  /**
   * Saves or updates the currently active session locally immediately
   */
  static async saveActiveSession(session: WorkoutSession): Promise<void> {
    try {
      const key = `${ACTIVE_SESSION_KEY_PREFIX}${session.userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(session));
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to save active session', e);
    }
  }

  /**
   * Retrieves the current active session for a user (if any exists)
   */
  static async getActiveSession(userId: string): Promise<WorkoutSession | null> {
    try {
      const key = `${ACTIVE_SESSION_KEY_PREFIX}${userId}`;
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      const session = JSON.parse(raw) as WorkoutSession;
      if (session.status === 'active' || session.status === 'paused') {
        return session;
      }
      return null;
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to get active session', e);
      return null;
    }
  }

  /**
   * Clears active session state from storage
   */
  static async clearActiveSession(userId: string): Promise<void> {
    try {
      const key = `${ACTIVE_SESSION_KEY_PREFIX}${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to clear active session', e);
    }
  }

  /**
   * Saves a completed session into historical log storage
   */
  static async saveCompletedSession(session: WorkoutSession): Promise<void> {
    try {
      const rawHistory = await AsyncStorage.getItem(HISTORY_SESSIONS_KEY);
      let history: WorkoutSession[] = rawHistory ? JSON.parse(rawHistory) : [];

      // Update existing or prepend new completed session
      const existingIdx = history.findIndex((s) => s.id === session.id);
      if (existingIdx >= 0) {
        history[existingIdx] = session;
      } else {
        history.unshift(session);
      }

      await AsyncStorage.setItem(HISTORY_SESSIONS_KEY, JSON.stringify(history));

      // Queue for remote backend sync if offline
      await this.queueForSync(session);
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to save completed session', e);
    }
  }

  /**
   * Gets all historical sessions for a user
   */
  static async getWorkoutHistory(userId: string): Promise<WorkoutSession[]> {
    try {
      const rawHistory = await AsyncStorage.getItem(HISTORY_SESSIONS_KEY);
      if (!rawHistory) return [];
      const history: WorkoutSession[] = JSON.parse(rawHistory);
      return history
        .filter((s) => s.userId === userId && s.status === 'completed')
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to get workout history', e);
      return [];
    }
  }

  /**
   * Gets a specific session by ID
   */
  static async getSessionById(sessionId: string): Promise<WorkoutSession | null> {
    try {
      const rawHistory = await AsyncStorage.getItem(HISTORY_SESSIONS_KEY);
      if (!rawHistory) return null;
      const history: WorkoutSession[] = JSON.parse(rawHistory);
      return history.find((s) => s.id === sessionId) || null;
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to get session by id', e);
      return null;
    }
  }

  /**
   * Deletes a session from history
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const rawHistory = await AsyncStorage.getItem(HISTORY_SESSIONS_KEY);
      if (!rawHistory) return;
      let history: WorkoutSession[] = JSON.parse(rawHistory);
      history = history.filter((s) => s.id !== sessionId);
      await AsyncStorage.setItem(HISTORY_SESSIONS_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to delete session', e);
    }
  }

  /**
   * Queue session for backend sync when network is restored
   */
  private static async queueForSync(session: WorkoutSession): Promise<void> {
    try {
      const rawQueue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      let queue: WorkoutSession[] = rawQueue ? JSON.parse(rawQueue) : [];
      queue.push(session);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('[WorkoutSessionRepository] Failed to queue sync', e);
    }
  }
}
