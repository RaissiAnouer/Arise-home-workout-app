import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AddedExerciseItem {
  id: string; // unique ID in the routine
  exerciseId: string; // db exercise ID
  name: string;
  primaryMuscle: string;
  equipment: string;
  sets: number;
  reps: number;
}

export interface CustomRoutine {
  id: string;
  name: string;
  exercises: AddedExerciseItem[];
  createdAt: number;
}

type CustomWorkoutsContextType = {
  customRoutines: CustomRoutine[];
  isLoadingRoutines: boolean;
  saveRoutine: (name: string, exercises: AddedExerciseItem[]) => Promise<void>;
  updateRoutine: (id: string, exercises: AddedExerciseItem[]) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
};

const CustomWorkoutsContext = createContext<CustomWorkoutsContextType | undefined>(undefined);

const STORAGE_KEY = '@arise_custom_workouts_v1';

export const CustomWorkoutsProvider = ({ children }: { children: ReactNode }) => {
  const [customRoutines, setCustomRoutines] = useState<CustomRoutine[]>([]);
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setIsLoadingRoutines(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomRoutines(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load custom routines', e);
    } finally {
      setIsLoadingRoutines(false);
    }
  };

  const saveRoutine = useCallback(async (name: string, exercises: AddedExerciseItem[]) => {
    try {
      const newRoutine: CustomRoutine = {
        id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        exercises,
        createdAt: Date.now(),
      };
      const updated = [newRoutine, ...customRoutines];
      setCustomRoutines(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom routine', e);
    }
  }, [customRoutines]);

  const updateRoutine = useCallback(async (id: string, exercises: AddedExerciseItem[]) => {
    try {
      const updated = customRoutines.map((routine) => 
        routine.id === id ? { ...routine, exercises } : routine
      );
      setCustomRoutines(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update custom routine', e);
    }
  }, [customRoutines]);

  const deleteRoutine = useCallback(async (id: string) => {
    try {
      const updated = customRoutines.filter((routine) => routine.id !== id);
      setCustomRoutines(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete custom routine', e);
    }
  }, [customRoutines]);

  return (
    <CustomWorkoutsContext.Provider value={{ customRoutines, isLoadingRoutines, saveRoutine, updateRoutine, deleteRoutine }}>
      {children}
    </CustomWorkoutsContext.Provider>
  );
};

export const useCustomWorkouts = () => {
  const context = useContext(CustomWorkoutsContext);
  if (context === undefined) {
    throw new Error('useCustomWorkouts must be used within a CustomWorkoutsProvider');
  }
  return context;
};
