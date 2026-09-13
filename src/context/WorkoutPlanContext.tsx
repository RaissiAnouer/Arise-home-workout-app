import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAdaptivePlan, AdaptiveWorkoutPlan } from '../services/AdaptiveEngine';
import { useQuestionnaire, QuestionnaireAnswers } from './QuestionnaireContext';
import { supabase } from '../lib/supabase';

type WorkoutPlanContextType = {
  currentPlan: AdaptiveWorkoutPlan | null;
  isLoadingPlan: boolean;
  createAndSavePlan: (customAnswers?: QuestionnaireAnswers) => Promise<void>;
  regeneratePlan: (customAnswers?: QuestionnaireAnswers) => Promise<void>;
  regenerateDayWorkout: (dayNumber: number) => Promise<void>;
  clearPlan: () => Promise<void>;
  updateDayExercises: (dayNumber: number, newExercises: any[]) => Promise<void>;
};

const WorkoutPlanContext = createContext<WorkoutPlanContextType | undefined>(undefined);

const PLAN_STORAGE_KEY = '@arise_workout_plan_v4';

export const WorkoutPlanProvider = ({ children }: { children: ReactNode }) => {
  const { answers } = useQuestionnaire();
  const [currentPlan, setCurrentPlan] = useState<AdaptiveWorkoutPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setIsLoadingPlan(true);
    try {
      const stored = await AsyncStorage.getItem(PLAN_STORAGE_KEY);
      if (stored) {
        setCurrentPlan(JSON.parse(stored));
      } else {
        await createAndSavePlan();
      }
    } catch (e) {
      console.error('Failed to load plan', e);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const createAndSavePlan = async (customAnswers?: QuestionnaireAnswers) => {
    setIsLoadingPlan(true);
    try {
      // Get authenticated user ID for history lookup
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? 'anonymous';
      const effectiveAnswers = customAnswers || answers;

      const newPlan = await generateAdaptivePlan(
        userId,
        effectiveAnswers,
        {}, // lastWorkedDates — empty on first load
        0,  // lastSessionScore
        999 // daysSinceLastWorkout — first time
      );
      setCurrentPlan(newPlan);
      await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(newPlan));
    } catch (e) {
      console.error('Failed to generate adaptive plan', e);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const regenerateDayWorkout = async (dayNumber: number) => {
    if (!currentPlan) return;
    setIsLoadingPlan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? 'anonymous';
      const freshPlan = await generateAdaptivePlan(
        userId,
        answers,
        {},
        0,
        999
      );
      const freshDay = freshPlan.days.find((d) => d.dayNumber === dayNumber) || freshPlan.days[0];
      if (freshDay) {
        const updatedDays = currentPlan.days.map((d) =>
          d.dayNumber === dayNumber
            ? {
                ...d,
                exercises: freshDay.exercises,
                estimatedDurationMinutes: freshDay.estimatedDurationMinutes,
                estimatedCalories: freshDay.estimatedCalories,
              }
            : d
        );
        const updatedPlan = { ...currentPlan, days: updatedDays };
        setCurrentPlan(updatedPlan);
        await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));
      }
    } catch (e) {
      console.error('Failed to regenerate day workout', e);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const clearPlan = async () => {
    setCurrentPlan(null);
    await AsyncStorage.removeItem(PLAN_STORAGE_KEY);
  };

  const updateDayExercises = async (dayNumber: number, newExercises: any[]) => {
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map((day) => 
        day.dayNumber === dayNumber 
          ? { ...day, exercises: newExercises } 
          : day
      ),
    };
    
    setCurrentPlan(updatedPlan);
    await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));
  };

  return (
    <WorkoutPlanContext.Provider
      value={{
        currentPlan,
        isLoadingPlan,
        createAndSavePlan,
        regeneratePlan: createAndSavePlan,
        regenerateDayWorkout,
        clearPlan,
        updateDayExercises,
      }}
    >
      {children}
    </WorkoutPlanContext.Provider>
  );
};

export const useWorkoutPlan = () => {
  const context = useContext(WorkoutPlanContext);
  if (context === undefined) {
    throw new Error('useWorkoutPlan must be used within a WorkoutPlanProvider');
  }
  return context;
};
