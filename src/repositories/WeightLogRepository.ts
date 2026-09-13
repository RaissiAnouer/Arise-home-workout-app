import AsyncStorage from '@react-native-async-storage/async-storage';

const WEIGHT_LOG_KEY = '@weight_log_entries_v1';

export interface WeightEntry {
  id: string;
  weight: number; // kg
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO string
}

export class WeightLogRepository {
  /**
   * Adds a new weight entry
   */
  static async addEntry(weight: number, date?: string): Promise<WeightEntry> {
    const entry: WeightEntry = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      weight,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = await AsyncStorage.getItem(WEIGHT_LOG_KEY);
      const entries: WeightEntry[] = raw ? JSON.parse(raw) : [];

      // Prevent duplicate entries for the same date – update instead
      const existingIdx = entries.findIndex((e) => e.date === entry.date);
      if (existingIdx >= 0) {
        entries[existingIdx] = { ...entries[existingIdx], weight, createdAt: entry.createdAt };
      } else {
        entries.push(entry);
      }

      // Sort by date ascending
      entries.sort((a, b) => a.date.localeCompare(b.date));
      await AsyncStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(entries));
      return entry;
    } catch (e) {
      console.error('[WeightLogRepository] Failed to add entry', e);
      return entry;
    }
  }

  /**
   * Returns all weight entries sorted by date ascending
   */
  static async getEntries(): Promise<WeightEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(WEIGHT_LOG_KEY);
      if (!raw) return [];
      const entries: WeightEntry[] = JSON.parse(raw);
      return entries.sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {
      console.error('[WeightLogRepository] Failed to get entries', e);
      return [];
    }
  }

  /**
   * Returns the most recent weight entry
   */
  static async getLatestEntry(): Promise<WeightEntry | null> {
    const entries = await this.getEntries();
    return entries.length > 0 ? entries[entries.length - 1] : null;
  }

  /**
   * Deletes a weight entry by ID
   */
  static async deleteEntry(id: string): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(WEIGHT_LOG_KEY);
      if (!raw) return;
      let entries: WeightEntry[] = JSON.parse(raw);
      entries = entries.filter((e) => e.id !== id);
      await AsyncStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('[WeightLogRepository] Failed to delete entry', e);
    }
  }
}
