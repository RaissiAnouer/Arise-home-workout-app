import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type QuestionnaireAnswers = {
  gender: string;
  motive: string;
  goal: string;
  experience: string;
  focusArea: string;
  pushups: string;
  weeklyGoal: string;
  startDay: string;
  equipment: string;
  injuries: string[];
  weight: string;
  height: string;
};

type QuestionnaireContextType = {
  answers: QuestionnaireAnswers;
  updateAnswer: (key: keyof QuestionnaireAnswers, value: any) => void;
  resetAnswers: () => void;
};

const defaultAnswers: QuestionnaireAnswers = {
  gender: '',
  motive: '',
  goal: '',
  experience: '',
  focusArea: '',
  pushups: '',
  weeklyGoal: '',
  startDay: '',
  equipment: '',
  injuries: [],
  weight: '',
  height: '',
};

const STORAGE_KEY = '@arise_questionnaire_answers';

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(defaultAnswers);

  useEffect(() => {
    loadAnswers();
  }, []);

  const loadAnswers = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAnswers({ ...defaultAnswers, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load questionnaire answers', e);
    }
  };

  const updateAnswer = (key: keyof QuestionnaireAnswers, value: any) => {
    setAnswers((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  };

  const resetAnswers = () => {
    setAnswers(defaultAnswers);
    AsyncStorage.removeItem(STORAGE_KEY).catch(console.error);
  };

  return (
    <QuestionnaireContext.Provider value={{ answers, updateAnswer, resetAnswers }}>
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
};