import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function GoalScreen() {
  return (
    <QuestionScreen 
      title="What is your goal?" 
      options={['BUILD MUSCLE', 'KEEP FIT', 'LOSE WEIGHT']} 
      icons={[
        { library: 'material', name: 'arm-flex' },
        { library: 'material', name: 'run-fast' },
        { library: 'material', name: 'fire' },
      ]}
      answerKey="goal" 
      nextRoute="/q-focus-area"
      currentStep={3}
    />
  );
}
