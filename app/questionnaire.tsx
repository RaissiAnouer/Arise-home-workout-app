import React, { useEffect } from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';
import { useQuestionnaire } from '../src/context/QuestionnaireContext';
import { supabase } from '../src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuestionnaireScreen() {
  const { resetAnswers } = useQuestionnaire();

  useEffect(() => {
    resetAnswers();
    supabase.auth.signOut().catch(() => {});
    AsyncStorage.multiRemove([
      '@arise_onboarding_completed',
      '@arise_auth_user',
      '@arise_questionnaire_answers',
    ]).catch(() => {});
  }, []);

  return (
    <QuestionScreen 
      title="What's your gender?" 
      options={['MALE', 'FEMALE', 'OTHER']} 
      icons={[
        { library: 'material', name: 'gender-male' },
        { library: 'material', name: 'gender-female' },
        { library: 'material', name: 'gender-non-binary' },
      ]}
      answerKey="gender" 
      nextRoute="/q-motive"
      currentStep={1}
      totalSteps={9}
    />
  );
}
