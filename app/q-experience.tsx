import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function ExperienceScreen() {
  return (
    <QuestionScreen 
      title="What is your gym experience?" 
      options={['BEGINNER', '6-12 MONTHS', '1-3 YEARS', '3+ YEARS']} 
      icons={[
        { library: 'material', name: 'seed' },
        { library: 'material', name: 'sprout' },
        { library: 'material', name: 'tree-outline' },
        { library: 'material', name: 'tree' },
      ]}
      answerKey="experience" 
      nextRoute="/q-weekly-goal"
      currentStep={6}
      totalSteps={9}
    />
  );
}
