/**
 * exerciseApi.ts
 *
 * API client methods for fetching exercises and filter options from the flat Supabase exercises database.
 */

import { supabase } from '../lib/supabase';
import { ExerciseRecord } from './ExerciseSelector';

export interface FilterOptions {
  search?: string;
  equipment?: string;
  muscle?: string;
  difficulty?: string;
  movementPattern?: string;
}

export const exerciseApi = {
  async getExercises(pageParam: number = 0, filters?: FilterOptions) {
    const pageSize = 20;
    const from = pageParam * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('exercises')
      .select('id, name, animation_url, muscle_group, equipment, is_compound')
      .range(from, to);

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.equipment && filters.equipment.toUpperCase() !== 'ALL') {
      query = query.ilike('equipment', `%${filters.equipment}%`);
    }

    if (filters?.muscle && filters.muscle.toUpperCase() !== 'ALL') {
      query = query.ilike('muscle_group', `%${filters.muscle}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching exercises from DB:', error.message);
      return { exercises: [], nextCursor: null };
    }

    const exercises: ExerciseRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      animation_url: row.animation_url,
      thumbnail_url: row.animation_url,
      sets: '3',
      reps: '8-12',
      rest_seconds: 90,
      calories: 30,
      duration: 10,
      is_compound: row.is_compound ?? false,
      efficiency_score: 80,
      min_experience_level: 'beginner',
      fatigue_cost: 'medium',
      popularity: 100,
      muscles: row.muscle_group ? { name: row.muscle_group } : { name: 'Full Body' },
      equipment: row.equipment ? { name: row.equipment } : { name: 'Bodyweight' },
      difficulties: { name: 'Beginner' },
      movement_patterns: null,
    }));

    const nextCursor = exercises.length === pageSize ? pageParam + 1 : null;
    return { exercises, nextCursor };
  },

  async getExerciseById(id: string): Promise<ExerciseRecord | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, animation_url, muscle_group, equipment, is_compound')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      animation_url: data.animation_url,
      thumbnail_url: data.animation_url,
      sets: '3',
      reps: '8-12',
      rest_seconds: 90,
      calories: 30,
      duration: 10,
      is_compound: data.is_compound ?? false,
      efficiency_score: 80,
      min_experience_level: 'beginner',
      fatigue_cost: 'medium',
      popularity: 100,
      muscles: data.muscle_group ? { name: data.muscle_group } : { name: 'Full Body' },
      equipment: data.equipment ? { name: data.equipment } : { name: 'Bodyweight' },
      difficulties: { name: 'Beginner' },
      movement_patterns: null,
    };
  },

  async getLookups() {
    // Attempt fetching distinct equipment and muscle groups from exercises table
    try {
      const { data } = await supabase
        .from('exercises')
        .select('equipment, muscle_group');

      if (data && data.length > 0) {
        const uniqueEqs = Array.from(new Set(data.map(d => d.equipment).filter(Boolean)));
        const uniqueMuscles = Array.from(new Set(data.map(d => d.muscle_group).filter(Boolean)));

        return {
          equipment: uniqueEqs.map((name, i) => ({ id: String(i + 1), name })),
          muscles: uniqueMuscles.map((name, i) => ({ id: String(i + 1), name })),
          difficulties: [
            { id: '1', name: 'Beginner' },
            { id: '2', name: 'Intermediate' },
            { id: '3', name: 'Advanced' },
          ],
          movementPatterns: [
            { id: '1', name: 'Push' },
            { id: '2', name: 'Pull' },
            { id: '3', name: 'Squat' },
            { id: '4', name: 'Hinge' },
          ],
        };
      }
    } catch (e) {
      console.warn('Fallback lookup options:', e);
    }

    return {
      equipment: [
        { id: '1', name: 'Bodyweight' },
        { id: '2', name: 'Dumbbells' },
        { id: '3', name: 'Barbell' },
        { id: '4', name: 'Cable Machine' },
        { id: '5', name: 'Machine' },
      ],
      muscles: [
        { id: '1', name: 'Chest' },
        { id: '2', name: 'Back' },
        { id: '3', name: 'Shoulders' },
        { id: '4', name: 'Biceps' },
        { id: '5', name: 'Triceps' },
        { id: '6', name: 'Quadriceps' },
        { id: '7', name: 'Hamstrings' },
        { id: '8', name: 'Calves' },
        { id: '9', name: 'Core' },
      ],
      difficulties: [
        { id: '1', name: 'Beginner' },
        { id: '2', name: 'Intermediate' },
        { id: '3', name: 'Advanced' },
      ],
      movementPatterns: [
        { id: '1', name: 'Push' },
        { id: '2', name: 'Pull' },
        { id: '3', name: 'Squat' },
        { id: '4', name: 'Hinge' },
      ],
    };
  },
};
