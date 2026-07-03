import React, { createContext, useContext, useState, ReactNode } from 'react';

export type QuestionnaireAnswers = {
  gender: string | null;
  motive: string | null;
  goal: string | null;
  focusArea: string | null;
  pushups: string | null;
  weeklyGoal: string | null;
  weight: string | null;
  height: string | null;
};

type QuestionnaireContextType = {
  answers: QuestionnaireAnswers;
  updateAnswer: (key: keyof QuestionnaireAnswers, value: string | null) => void;
};

const defaultAnswers: QuestionnaireAnswers = {
  gender: null,
  motive: null,
  goal: null,
  focusArea: null,
  pushups: null,
  weeklyGoal: null,
  weight: null,
  height: null,
};

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(defaultAnswers);

  const updateAnswer = (key: keyof QuestionnaireAnswers, value: string | null) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <QuestionnaireContext.Provider value={{ answers, updateAnswer }}>
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
};
