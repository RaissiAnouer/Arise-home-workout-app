import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';
import { useQuestionnaire } from '../src/context/QuestionnaireContext';

export default function InjuriesScreen() {
  const { answers } = useQuestionnaire();

  return (
    <QuestionScreen 
      title="Any joint injuries or limitations?" 
      options={[
        'NO LIMITATIONS',
        'SHOULDER SENSITIVITY',
        'LOWER BACK STRAIN',
        'KNEE SENSITIVITY',
        'WRISTS & ELBOWS',
      ]} 
      icons={[
        { library: 'material', name: 'shield-check' },
        { library: 'material', name: 'arm-flex-outline' },
        { library: 'material', name: 'human' },
        { library: 'fa5', name: 'walking' },
        { library: 'material', name: 'hand-back-right' },
      ]}
      answerKey="injuries" 
      multiSelect={true}
      nextRoute={() => (answers.equipment === 'FULL GYM' ? '/q-experience' : '/q-pushups')}
      currentStep={6}
      totalSteps={9}
    />
  );
}
