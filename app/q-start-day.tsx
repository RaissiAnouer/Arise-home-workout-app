import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function StartDayScreen() {
  return (
    <QuestionScreen 
      title="What day does your week start?" 
      options={['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']} 
      icons={[
        { library: 'material', name: 'calendar-start' },
        { library: 'material', name: 'calendar-start' },
        { library: 'material', name: 'calendar-start' },
        { library: 'material', name: 'calendar-start' },
        { library: 'material', name: 'calendar-start' },
        { library: 'material', name: 'calendar-start' },
        { library: 'material', name: 'calendar-start' },
      ]}
      answerKey="startDay" 
      nextRoute="/q-body-stats"
      currentStep={8}
      totalSteps={9}
    />
  );
}
