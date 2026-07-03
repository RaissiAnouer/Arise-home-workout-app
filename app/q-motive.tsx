import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function MotiveScreen() {
  return (
    <QuestionScreen 
      title="What motivates you?" 
      options={['LOOK BETTER', 'FEEL HEALTHIER', 'BOOST CONFIDENCE', 'RELIEVE STRESS', 'BUILD DISCIPLINE']} 
      icons={[
        { library: 'material', name: 'mirror' },
        { library: 'material', name: 'heart-pulse' },
        { library: 'material', name: 'lightning-bolt' },
        { library: 'material', name: 'meditation' },
        { library: 'material', name: 'shield-check' },
      ]}
      answerKey="motive" 
      nextRoute="/q-goal"
      currentStep={2}
    />
  );
}
