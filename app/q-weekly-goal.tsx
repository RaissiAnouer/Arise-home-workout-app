import React from 'react';
import { QuestionScreen } from '../src/components/QuestionScreen';

export default function WeeklyGoalScreen() {
  return (
    <QuestionScreen 
      title="Weekly workout goal?" 
      options={['2 DAYS', '3 DAYS', '4 DAYS', '5 DAYS', '6+ DAYS']} 
      icons={[
        { library: 'material', name: 'calendar-week-begin' },
        { library: 'material', name: 'calendar-week-begin' },
        { library: 'material', name: 'calendar-clock' },
        { library: 'material', name: 'calendar-check' },
        { library: 'material', name: 'calendar-star' },
      ]}
      answerKey="weeklyGoal" 
      nextRoute="/q-start-day"
      currentStep={7}
      totalSteps={9}
    />
  );
}
