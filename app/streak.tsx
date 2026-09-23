import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, Check, X } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgression } from '../src/context/ProgressionContext';
import { useWorkoutPlan } from '../src/context/WorkoutPlanContext';
import { useQuestionnaire } from '../src/context/QuestionnaireContext';
import { StreakService } from '../src/services/StreakService';
import PrimaryButton from '../src/components/PrimaryButton';
import MiniWeekProgress from '../src/components/MiniWeekProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOTTIE_SIZE = Math.min(SCREEN_WIDTH * 0.65, 260);

const WEEKLY_LOG_KEY = '@awaken_weekly_log';
const FULL_DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CONFETTI_COLORS = [
  '#4080E7',
  '#FF6B35',
  '#FFB800',
  '#00F0FF',
  '#A855F7',
  '#22C55E',
  '#FFFFFF',
];

const NUM_PARTICLES = 24;

const WEEK_ORDER_MONDAY: number[] = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

function getWeekDates(): number[] {
  const now = new Date();
  const todayDow = now.getDay();
  const daysBack = (todayDow - 1 + 7) % 7; // Monday is 1
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysBack);
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.getDate();
  });
}

function getTodaySlotIndex(): number {
  const todayDow = new Date().getDay();
  return (todayDow - 1 + 7) % 7;
}

function getWeekStartDate(): string {
  const now = new Date();
  const todayDow = now.getDay();
  const daysBack = (todayDow - 1 + 7) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysBack);
  return weekStart.toISOString().split('T')[0];
}

function getSlotDate(slotIndex: number): string {
  const now = new Date();
  const todayDow = now.getDay();
  const daysBack = (todayDow - 1 + 7) % 7;
  const slotDate = new Date(now);
  slotDate.setDate(now.getDate() - daysBack + slotIndex);
  return slotDate.toISOString().split('T')[0];
}

export default function StreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ celebrate?: string; justCompletedWorkout?: string; ts?: string }>();
  const isWorkoutCompletion = params.celebrate === 'true' || params.justCompletedWorkout === 'true';

  const { streakDays, lastWorkoutDate, completedDates } = useProgression();
  const { currentPlan } = useWorkoutPlan();
  const { answers } = useQuestionnaire();
  const [weeklyLogDays, setWeeklyLogDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [isLottieReady, setIsLottieReady] = useState(false);
  const loadingOpacity = useRef(new Animated.Value(1)).current;

  const weekOrder = WEEK_ORDER_MONDAY;
  const startDow = useMemo(() => StreakService.getStartDow(answers.startDay), [answers.startDay]);
  const weekDates = useMemo(() => getWeekDates(), []);
  const todaySlotIndex = useMemo(() => getTodaySlotIndex(), []);

  // Load and reconcile weekly log for current Monday–Sunday week
  const loadWeeklyLog = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(WEEKLY_LOG_KEY);
      const currentWeekStart = getWeekStartDate();
      let days = [false, false, false, false, false, false, false];

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.weekStart === currentWeekStart && Array.isArray(parsed.days)) {
          days = parsed.days;
        }
      }

      // Reconcile with progression completedDates for the week
      for (let i = 0; i < 7; i++) {
        const slotDate = getSlotDate(i);
        const isFutureSlot = i > todaySlotIndex;

        if (
          days[i] ||
          (!isFutureSlot && (
            (completedDates || []).includes(slotDate) ||
            (lastWorkoutDate && lastWorkoutDate === slotDate)
          ))
        ) {
          days[i] = true;
        }
      }

      await AsyncStorage.setItem(
        WEEKLY_LOG_KEY,
        JSON.stringify({ weekStart: currentWeekStart, days })
      );
      setWeeklyLogDays(days);
    } catch (e) {
      console.error('Failed to load weekly log in streak screen', e);
    }
  }, [todaySlotIndex, completedDates, lastWorkoutDate]);

  useEffect(() => {
    loadWeeklyLog();
  }, [loadWeeklyLog]);

  // Target count: in workout completion mode, celebrate up to streak; in passive mode, show current streak directly
  const currentStreak = streakDays || 0;
  const targetStreak = isWorkoutCompletion ? (currentStreak > 0 ? currentStreak : 1) : currentStreak;
  const initialStartCount = isWorkoutCompletion ? Math.max(0, targetStreak - 1) : targetStreak;

  // Animation values
  const [displayedCount, setDisplayedCount] = useState(initialStartCount);
  const [isTodayAnimatedComplete, setIsTodayAnimatedComplete] = useState(!isWorkoutCompletion);

  const flameScale = useRef(new Animated.Value(1)).current;
  const numberScale = useRef(new Animated.Value(1)).current;
  const numberOpacity = useRef(new Animated.Value(1)).current;
  const todayCircleScale = useRef(new Animated.Value(1)).current;
  const numberTranslateY = useRef(new Animated.Value(0)).current;

  // Confetti particles state
  const particles = useRef(
    Array.from({ length: NUM_PARTICLES }, (_, i) => {
      const angle = (i / NUM_PARTICLES) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const distance = 85 + Math.random() * 95;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 25,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        anim: new Animated.Value(0),
      };
    })
  ).current;

  // Trigger celebration increment animation strictly upon workout completion
  const triggerCelebration = useCallback(() => {
    // Reset initial state
    setDisplayedCount(initialStartCount);
    setIsTodayAnimatedComplete(false);
    particles.forEach((p) => p.anim.setValue(0));
    flameScale.setValue(1);
    numberScale.setValue(1);
    numberOpacity.setValue(1);
    numberTranslateY.setValue(0);
    todayCircleScale.setValue(1);

    // Initial suspense delay (500ms), then visible tick up!
    setTimeout(() => {
      // Trigger Haptics
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      // 1. Number Tick Animation (slide down slightly, switch, then pop up vigorously)
      Animated.sequence([
        Animated.parallel([
          Animated.timing(numberScale, {
            toValue: 0.75,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(numberOpacity, {
            toValue: 0.2,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(numberTranslateY, {
            toValue: 12,
            duration: 160,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Switch number to target streak (+1 tick)
        setDisplayedCount(targetStreak);
        setIsTodayAnimatedComplete(true);
        numberTranslateY.setValue(-14);

        Animated.parallel([
          // Number Pop Bounce
          Animated.spring(numberScale, {
            toValue: 1,
            friction: 3.5,
            tension: 160,
            useNativeDriver: true,
          }),
          Animated.timing(numberOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.spring(numberTranslateY, {
            toValue: 0,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
          }),
          // Flame pulse scale
          Animated.sequence([
            Animated.timing(flameScale, {
              toValue: 1.25,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(flameScale, {
              toValue: 1,
              friction: 4,
              tension: 110,
              useNativeDriver: true,
            }),
          ]),
          // Today circle pop
          Animated.sequence([
            Animated.timing(todayCircleScale, {
              toValue: 1.35,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.spring(todayCircleScale, {
              toValue: 1,
              friction: 4,
              tension: 120,
              useNativeDriver: true,
            }),
          ]),
          // Confetti particle explosion
          ...particles.map((p) =>
            Animated.sequence([
              Animated.timing(p.anim, {
                toValue: 1,
                duration: 950 + Math.random() * 350,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start();
      });
    }, 500);
  }, [initialStartCount, targetStreak, flameScale, numberScale, numberOpacity, numberTranslateY, todayCircleScale, particles]);

  // Trigger active celebration every time the screen is focused with workout completion params
  useFocusEffect(
    useCallback(() => {
      if (isWorkoutCompletion) {
        triggerCelebration();
      }
    }, [isWorkoutCompletion, params.ts, triggerCelebration])
  );

  // Compute current week days matching home.tsx
  const weekDays = useMemo(() => {
    return weekOrder.map((dow, index) => {
      const isToday = index === todaySlotIndex;
      const isPast = index < todaySlotIndex;
      const isFuture = index > todaySlotIndex;
      const letter = FULL_DAY_NAMES[dow].charAt(0);
      const dateNumber = weekDates[index];
      const slotDate = getSlotDate(index);

      // Determine schedule using StreakService (plan-aware or training split)
      const scheduledType = StreakService.getScheduleForDayOfWeek(
        dow,
        currentPlan,
        startDow,
        answers.weeklyGoal
      );
      const isWorkoutDay = scheduledType === 'WORKOUT';
      const isRestDay = scheduledType === 'REST';

      const isDateRecordedCompleted =
        (completedDates && completedDates.includes(slotDate)) ||
        weeklyLogDays[index] === true ||
        lastWorkoutDate === slotDate;

      let isCompleted = false;
      if (isToday) {
        isCompleted = isWorkoutCompletion
          ? (isTodayAnimatedComplete || isDateRecordedCompleted)
          : isDateRecordedCompleted;
      } else if (isPast) {
        isCompleted = Boolean(isDateRecordedCompleted);
      }

      // Rest days NEVER fail or show missed status!
      // isMissed is strictly for scheduled workout days in the past that were missed.
      const isMissed = Boolean(isPast && !isCompleted && isWorkoutDay && !isRestDay);

      return {
        key: slotDate,
        label: letter,
        dayNumber: dateNumber,
        isToday,
        isPast,
        isFuture,
        isRestDay,
        isWorkoutDay,
        isCompleted,
        isMissed,
      };
    });
  }, [
    weekOrder,
    todaySlotIndex,
    weekDates,
    currentPlan,
    startDow,
    answers.weeklyGoal,
    completedDates,
    weeklyLogDays,
    lastWorkoutDate,
    isWorkoutCompletion,
    isTodayAnimatedComplete,
  ]);

  const handleContinue = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={handleContinue} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Main Content with Balanced Vertical Spacing */}
      <View style={styles.content}>
        {/* Hero Flame & Counter Section */}
        <View style={styles.heroSection}>
          {/* Confetti Particles Container */}
          <View style={styles.particlesContainer} pointerEvents="none">
            {particles.map((p, idx) => {
              const translateX = p.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, p.x],
              });
              const translateY = p.anim.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [0, p.y - 25, p.y + 45],
              });
              const opacity = p.anim.interpolate({
                inputRange: [0, 0.1, 0.75, 1],
                outputRange: [0, 1, 0.9, 0],
              });
              const scale = p.anim.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0.2, 1.25, 0.35],
              });

              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.particle,
                    {
                      width: p.size,
                      height: p.size,
                      borderRadius: p.size / 2,
                      backgroundColor: p.color,
                      opacity,
                      transform: [{ translateX }, { translateY }, { scale }],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Flame Animation */}
          <Pressable onPress={isWorkoutCompletion ? triggerCelebration : undefined} hitSlop={10} disabled={!isWorkoutCompletion}>
            <Animated.View
              style={[
                styles.animationContainer,
                { transform: [{ scale: flameScale }] },
              ]}
            >
              <LottieView
                source={require('../assets/Streak fire.json')}
                autoPlay
                loop
                style={styles.lottie}
                onAnimationLoaded={() => {
                  setIsLottieReady(true);
                  Animated.timing(loadingOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                }}
              />
            </Animated.View>
          </Pressable>

          {/* Loading overlay until Lottie is ready */}
          {!isLottieReady && (
            <Animated.View style={[styles.lottieLoader, { opacity: loadingOpacity }]}>
              <ActivityIndicator size="large" color="#4080E7" />
            </Animated.View>
          )}

          {/* Big Streak Number & Label */}
          <Animated.View
            style={[
              styles.counterContainer,
              {
                transform: [
                  { scale: numberScale },
                  { translateY: numberTranslateY },
                ],
                opacity: numberOpacity,
              },
            ]}
          >
            <Text style={styles.streakNumber}>{displayedCount}</Text>
            <Text style={styles.streakSublabel}>
              {displayedCount === 1 ? 'DAY STREAK' : 'DAYS STREAK'}
            </Text>
          </Animated.View>
        </View>

        {/* Streak Days Row Container */}
        <View style={styles.weekCardWrapper}>
          <MiniWeekProgress
            weekDays={weekDays}
            todayScale={todayCircleScale}
          />
        </View>

        {/* Bottom Primary Button with 3-button navigation bar safety clearance */}
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
          <PrimaryButton
            title="CONTINUE"
            onPress={handleContinue}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginTop: -16,
    marginBottom: 10,
  },
  particlesContainer: {
    position: 'absolute',
    top: LOTTIE_SIZE / 2,
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lottie: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
  },
  lottieLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 76,
  },
  streakSublabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 2,
    marginTop: 4,
  },
  weekCardWrapper: {
    width: '100%',
    paddingHorizontal: 4,
    marginVertical: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  dayCol: {
    alignItems: 'center',
    gap: 10,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  todayLabel: {
    color: '#4080E7',
    fontWeight: '700',
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayCircleCompleted: {
    backgroundColor: '#4080E7',
    borderColor: '#4080E7',
    shadowColor: '#4080E7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  dayCircleMissed: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  dayCircleToday: {
    borderColor: '#4080E7',
    borderWidth: 1.5,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
  },
  dayCircleRest: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  todayNumberText: {
    color: '#4080E7',
    fontWeight: '700',
  },
  restDayNumberText: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  futureNumberText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  bottomContainer: {
    width: '100%',
    paddingTop: 8,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 14,
    width: '100%',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});
