import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function FocusAreaScreen() {
  return (
    <QuestionScreen 
      title="Choose your focus" 
      options={['FULL BODY', 'UPPER BODY', 'LOWER BODY', 'CORE']} 
      icons={[
        { library: 'material', name: 'human-handsup' },
        { library: 'material', name: 'arm-flex-outline' },
        { library: 'fa5', name: 'walking' },
        { library: 'material', name: 'yoga' },
      ]}
      answerKey="focusArea" 
      nextRoute="/q-pushups"
      currentStep={4}
    />
  );
}
