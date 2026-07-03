import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function PushupsScreen() {
  return (
    <QuestionScreen 
      title="Max push-ups in one set?" 
      options={['0 - 5', '6 - 15', '16 - 30', '31+']} 
      icons={[
        { library: 'material', name: 'speedometer-slow' },
        { library: 'material', name: 'speedometer-medium' },
        { library: 'material', name: 'speedometer' },
        { library: 'material', name: 'trophy' },
      ]}
      answerKey="pushups" 
      nextRoute="/q-weekly-goal"
      currentStep={5}
    />
  );
}
