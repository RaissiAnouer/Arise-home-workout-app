import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function QuestionnaireScreen() {
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
    />
  );
}
