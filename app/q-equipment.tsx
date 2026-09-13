import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function EquipmentScreen() {
  return (
    <QuestionScreen 
      title="Where will you train?" 
      options={['HOME (NO EQUIPMENT)', 'HOME (DUMBBELLS)', 'FULL GYM']} 
      icons={[
        { library: 'material', name: 'home' },
        { library: 'material', name: 'dumbbell' },
        { library: 'material', name: 'weight-lifter' },
      ]}
      answerKey="equipment" 
      nextRoute="/q-injuries"
      currentStep={5}
      totalSteps={10}
    />
  );
}
