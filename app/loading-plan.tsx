import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SystemNotification } from '../src/components/SystemNotification';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useWorkoutPlan } from '../src/context/WorkoutPlanContext';

export default function LoadingPlanScreen() {
  const router = useRouter();
  const { rank } = useLocalSearchParams<{ rank: string }>();
  const { createAndSavePlan } = useWorkoutPlan();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Generate custom plan in background
    createAndSavePlan().catch((e) => console.error('Error generating plan on onboarding:', e));

    // 0 to 100 over ~3800ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 38);

    const timer1 = setTimeout(() => setStep(1), 1200);
    const timer2 = setTimeout(() => setStep(2), 2400);
    const timer3 = setTimeout(() => {
      router.replace({ pathname: '/auth' as any, params: { rank } });
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [rank, router]);

  return (
    <View style={styles.container}>
      <SystemNotification title="SYSTEM" visible={true}>
        <View style={styles.content}>
          <Text style={styles.text}>
            {step >= 0 ? '> Analyzing Player Data...' : ' '}
          </Text>
          <Text style={styles.text}>
            {step >= 1 ? `> Evaluating Hunter Rank (${rank})...` : ' '}
          </Text>
          <Text style={[styles.text, styles.highlight]}>
            {step >= 2 ? '> GENERATING DAILY QUEST...' : ' '}
          </Text>
          
          {/* Progress Bar Container */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>
      </SystemNotification>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    minHeight: 140,
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#E6F7FF',
    lineHeight: 24,
    marginBottom: 8,
  },
  highlight: {
    color: '#00A3FF',
    textShadowColor: '#00A3FF',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
  progressContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(56, 182, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00A3FF',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#38B6FF',
    width: 45,
    textAlign: 'right',
  },
});
