import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, Image, StyleSheet, Modal, Pressable, ScrollView, ImageBackground, LayoutAnimation, Platform, UIManager, Alert, AppState, Linking, Dimensions } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  LinearTransition,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgression } from '../../src/context/ProgressionContext';
import { useWorkoutPlan } from '../../src/context/WorkoutPlanContext';
import { useQuestionnaire } from '../../src/context/QuestionnaireContext';
import { useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';
import { StreakService } from '../../src/services/StreakService';
import { AdaptiveDay } from '../../src/services/AdaptiveEngine';
import { useFocusEffect, useRouter } from 'expo-router';
import HunterStatusCard from '../../src/components/HunterStatusCard';
import PredictedRankCard from '../../src/components/PredictedRankCard';
import LevelUpNotification from '../../src/components/LevelUpNotification';
import PrimaryButton from '../../src/components/PrimaryButton';
import { HunterRank, RANK_CONFIG } from '../../src/data/levelConfig';
import { Bell, Check, X, Dumbbell, Calendar, PlusCircle, Sparkles, PlayCircle, RotateCw, Trash2, Play, ChevronDown, ChevronUp, ChevronRight, Flame, Target, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SystemBorder from '../../src/components/SystemBorder';
import { typography } from '../../src/styles/typography';
import { useCustomWorkouts } from '../../src/context/CustomWorkoutsContext';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

const WEEKLY_LOG_KEY = '@awaken_weekly_log';
const FULL_DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const LONG_DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const MOTIVATIONAL_QUOTES = [
  { text: "I alone am the one who levels up.", author: "Sung Jin-Woo" },
  { text: "If you can't fly, run. If you can't run, walk. If you can't walk, crawl — but keep moving.", author: "Martin Luther King Jr." },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Arise from the shadows. Become the hunter, not the hunted.", author: "Arise" },
  { text: "No one is born strong. You become strong by never giving up.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Discipline is choosing what you want most over what you want now.", author: "Abraham Lincoln" },
  { text: "The Iron never lies. Two hundred pounds is always two hundred pounds.", author: "Henry Rollins" },
  { text: "Don't wish for it. Work for it.", author: "Unknown" },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  { text: "Today's pain is tomorrow's power.", author: "Arise" },
  { text: "The system has chosen you. Will you rise?", author: "Arise" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

function getDailyQuote() {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Dynamically selects matching artwork for a workout card based on its target focus.
 */
function getWorkoutCardImage(focus?: string, isRestDay?: boolean) {
  if (isRestDay) {
    return require('../../src/images/quest.jpg');
  }
  const f = (focus || '').toLowerCase();
  // Chest / Push / Full body workouts
  if (f.includes('chest') || f.includes('push') || f.includes('press') || f.includes('full') || f.includes('compound')) {
    return require('../../src/images/chest.jpg');
  }
  // Back / Pull workouts
  if (f.includes('back') || f.includes('pull') || f.includes('bicep') || f.includes('rear') || f.includes('lat')) {
    return require('../../src/images/back.jpg');
  }
  // Leg / Lower body workouts
  if (f.includes('leg') || f.includes('lower') || f.includes('quad') || f.includes('glute') || f.includes('calv') || f.includes('squat') || f.includes('hinge')) {
    return require('../../src/images/leg.jpg');
  }
  // Stamina / Cardio / Core
  if (f.includes('stamina') || f.includes('cardio') || f.includes('core') || f.includes('endurance') || f.includes('abs')) {
    return require('../../src/images/strength training.png');
  }
  // Default / Full body fallback
  return require('../../src/images/chest.jpg');
}

/**
 * Maps a startDay answer string (e.g. 'MONDAY') to a JS Date weekday index (0=Sun..6=Sat).
 * Defaults to Monday (1) if not set.
 */
function getStartDow(startDay: string | null | undefined): number {
  if (!startDay) return 1; // default Monday
  const map: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };
  return map[startDay.toUpperCase()] ?? 1;
}

/**
 * Build an ordered array of 7 weekday indices starting from startDow.
 * e.g. startDow=0 (Sun) → [0,1,2,3,4,5,6]
 *      startDow=3 (Wed) → [3,4,5,6,0,1,2]
 */
function buildWeekOrder(startDow: number): number[] {
  return Array.from({ length: 7 }, (_, i) => (startDow + i) % 7);
}

const WEEK_ORDER_MONDAY: number[] = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

/**
 * Compute the calendar date (day of month) for each slot in the Monday–Sunday week.
 */
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

/**
 * Get the index within Monday–Sunday week that matches today (0 = Mon ... 6 = Sun).
 */
function getTodaySlotIndex(): number {
  const todayDow = new Date().getDay();
  return (todayDow - 1 + 7) % 7;
}

/**
 * Get the Monday week-start date string (YYYY-MM-DD) for the current week.
 */
function getWeekStartDate(): string {
  const now = new Date();
  const todayDow = now.getDay();
  const daysBack = (todayDow - 1 + 7) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysBack);
  return weekStart.toISOString().split('T')[0];
}

/**
 * Get the ISO date string (YYYY-MM-DD) for slot index (0 = Mon ... 6 = Sun).
 */
function getSlotDate(slotIndex: number): string {
  const now = new Date();
  const todayDow = now.getDay();
  const daysBack = (todayDow - 1 + 7) % 7;
  const slotDate = new Date(now);
  slotDate.setDate(now.getDate() - daysBack + slotIndex);
  return slotDate.toISOString().split('T')[0];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { onScroll } = useTabBarVisibility();
  const { lastWorkoutDate, totalWorkouts, level, xp, xpToNextLevel, xpProgress, rank, rankTitle, rankColor, streakDays, isDayCompleted, completedDates, profilePicture, updateProfilePicture } = useProgression();
  const isTodayCompleted = lastWorkoutDate === getToday();
  const { currentPlan, createAndSavePlan } = useWorkoutPlan();
  const { customRoutines, deleteRoutine } = useCustomWorkouts();
  const { answers, updateAnswer } = useQuestionnaire();
  const router = useRouter();
  const [completedDays, setCompletedDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isWelcomeQuestModalVisible, setIsWelcomeQuestModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(true);
  const [isPushNotificationsGranted, setIsPushNotificationsGranted] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── TEST: Rank-up overlay trigger with rank picker ──
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [selectedTestRank, setSelectedTestRank] = useState<HunterRank | null>(null);
  const ALL_TEST_RANKS: HunterRank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SSS', 'National'];

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Check actual device/system notification permissions
  const checkNotificationPermissions = useCallback(async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      const granted = Boolean(
        settings.granted ||
        settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
        settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      );
      setIsPushNotificationsGranted(granted);
    } catch (e) {
      console.error('Error checking notification permissions:', e);
    }
  }, []);

  // Listen to AppState foreground transitions so permission changes update instantly
  useEffect(() => {
    checkNotificationPermissions();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkNotificationPermissions();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [checkNotificationPermissions]);

  // Check onboarding status reactively
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem('@arise_onboarding_completed');
        const hasAnswers = Boolean(answers.gender || answers.goal || answers.weeklyGoal || answers.startDay);
        if (stored === 'true' || hasAnswers) {
          setIsOnboardingCompleted(true);
        } else {
          setIsOnboardingCompleted(false);
        }
      } catch (e) {
        console.error('Error checking onboarding status:', e);
      }
    };
    checkOnboardingStatus();
  }, [answers]);

  const handleRequestNotificationPermission = useCallback(async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.granted) {
        setIsPushNotificationsGranted(true);
        return;
      }

      if (settings.canAskAgain) {
        const res = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        setIsPushNotificationsGranted(Boolean(res.granted));
      } else {
        Alert.alert(
          'Push Notifications',
          'Notification permissions are currently disabled. Please enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (e) {
      console.error('Error requesting notification permissions:', e);
    }
  }, []);

  const handlePickProfilePicture = async () => {
    if (Platform.OS === 'web') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        updateProfilePicture(uri);
      }
      return;
    }

    Alert.alert(
      'Profile Picture',
      'Choose an option to set your profile picture:',
      [
        {
          text: 'Choose from Library',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert('Permission to access camera roll is required!');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
              updateProfilePicture(uri);
            }
          },
        },
        {
          text: 'Take Photo',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert('Permission to access camera is required!');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
              updateProfilePicture(uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const isProfilePictureSet = Boolean(profilePicture && profilePicture.trim().length > 0);
  const isFirstWorkoutCompleted = totalWorkouts > 0;

  const questTasks = useMemo(() => [
    {
      id: 'join_us',
      title: 'Join Us',
      isDone: true,
      onPress: undefined,
    },
    {
      id: 'onboarding',
      title: 'Complete Onboarding',
      isDone: isOnboardingCompleted,
      onPress: !isOnboardingCompleted ? () => {
        setIsWelcomeQuestModalVisible(false);
        router.push('/questionnaire' as any);
      } : undefined,
    },
    {
      id: 'push_notifications',
      title: 'Enable Push Notifications',
      isDone: isPushNotificationsGranted,
      onPress: handleRequestNotificationPermission,
    },
    {
      id: 'profile_picture',
      title: 'Set Profile Picture',
      isDone: isProfilePictureSet,
      onPress: handlePickProfilePicture,
    },
    {
      id: 'first_workout',
      title: 'Complete Your First Workout',
      isDone: isFirstWorkoutCompleted,
      onPress: !isFirstWorkoutCompleted ? () => {
        setIsWelcomeQuestModalVisible(false);
        router.push('/workout-details/1');
      } : undefined,
    },
  ], [
    isOnboardingCompleted,
    isPushNotificationsGranted,
    isProfilePictureSet,
    isFirstWorkoutCompleted,
    handleRequestNotificationPermission,
    handlePickProfilePicture,
    router,
  ]);

  const completedTasksCount = useMemo(() => questTasks.filter((t) => t.isDone).length, [questTasks]);
  const questProgressPercent = useMemo(() => Math.round((completedTasksCount / questTasks.length) * 100), [completedTasksCount, questTasks.length]);
  
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');

  // iOS-style sheet animation progress: 0 = closed, 1 = fully open
  const sheetProgress = useSharedValue(0);

  const openWelcomeQuestModal = useCallback(() => {
    setIsWelcomeQuestModalVisible(true);
    sheetProgress.value = withTiming(1, {
      duration: 360,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [sheetProgress]);

  const closeWelcomeQuestModal = useCallback(() => {
    sheetProgress.value = withTiming(0, {
      duration: 280,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    }, (finished) => {
      if (finished) {
        runOnJS(setIsWelcomeQuestModalVisible)(false);
      }
    });
  }, [sheetProgress]);

  useEffect(() => {
    if (isWelcomeQuestModalVisible && sheetProgress.value === 0) {
      sheetProgress.value = withTiming(1, {
        duration: 360,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
    }
  }, [isWelcomeQuestModalVisible, sheetProgress]);

  // Receding background page transform style (iOS Card presentation)
  const backgroundCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(sheetProgress.value, [0, 1], [1, 0.95], Extrapolation.CLAMP);
    const translateY = interpolate(sheetProgress.value, [0, 1], [0, 10], Extrapolation.CLAMP);
    const borderRadius = interpolate(sheetProgress.value, [0, 1], [0, 20], Extrapolation.CLAMP);
    const opacity = interpolate(sheetProgress.value, [0, 1], [1, 0.85], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateY }],
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      opacity,
      overflow: 'hidden',
    };
  });

  // Dark dim backdrop overlay style behind sheet
  const sheetBackdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(sheetProgress.value, [0, 1], [0, 0.65], Extrapolation.CLAMP);
    return { opacity };
  });

  // Sheet vertical translation style
  const sheetContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(sheetProgress.value, [0, 1], [SCREEN_HEIGHT, 0], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }],
    };
  });

  // Pan gesture for smooth drag-to-dismiss with real-time background tracking
  const sheetPanGesture = useMemo(() => {
    return Gesture.Pan()
      .onUpdate((event) => {
        if (event.translationY > 0) {
          const progress = Math.max(0, Math.min(1, 1 - event.translationY / (SCREEN_HEIGHT * 0.7)));
          sheetProgress.value = progress;
        }
      })
      .onEnd((event) => {
        if (event.translationY > 120 || event.velocityY > 600) {
          sheetProgress.value = withTiming(0, {
            duration: 250,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          }, (finished) => {
            if (finished) {
              runOnJS(setIsWelcomeQuestModalVisible)(false);
            }
          });
        } else {
          sheetProgress.value = withSpring(1, {
            damping: 20,
            stiffness: 200,
          });
        }
      });
  }, [SCREEN_HEIGHT, sheetProgress]);
  
  const toggleRoutinesExpanded = () => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRoutinesExpanded((prev) => !prev);
  };

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withTiming(isRoutinesExpanded ? '90deg' : '0deg', {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        },
      ],
    };
  }, [isRoutinesExpanded]);

  const handleGenerateWorkout = async () => {
    try {
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setIsGenerating(true);
      await createAndSavePlan(answers);
      triggerToast(currentPlan ? 'Workout regenerated with new exercises!' : 'AI Workout Plan generated successfully!');
    } catch (e) {
      console.error('Failed generating workout', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const rankConfig = RANK_CONFIG[rank];

  // Week layout is strictly Monday -> Sunday
  const weekOrder = WEEK_ORDER_MONDAY;
  const startDow = useMemo(() => getStartDow(answers.startDay), [answers.startDay]);
  const weekDates = useMemo(() => getWeekDates(), []);
  const todaySlotIndex = useMemo(() => getTodaySlotIndex(), []);

  // Determine target days from the questionnaire weeklyGoal answer
  const targetDays = useMemo(() => {
    if (!answers.weeklyGoal) return 7;
    const match = answers.weeklyGoal.match(/\d+/);
    return match ? parseInt(match[0], 10) : 7;
  }, [answers.weeklyGoal]);

  const daysOptions = ['2 DAYS', '3 DAYS', '4 DAYS', '5 DAYS', '6+ DAYS'];
  const startDayOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  // Load/reconcile weekly log for the current Monday-to-Sunday week
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
      setCompletedDays(days);
    } catch (e) {
      console.error('Failed to load weekly log', e);
    }
  }, [todaySlotIndex, completedDates, lastWorkoutDate]);

  // Compute weekDays for current calendar week (Monday to Sunday)
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
        completedDays[index] === true ||
        lastWorkoutDate === slotDate;

      let isCompleted = false;
      if (isToday) {
        isCompleted = Boolean(isTodayCompleted || isDateRecordedCompleted);
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
    completedDays,
    lastWorkoutDate,
    isTodayCompleted,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadWeeklyLog();
    }, [loadWeeklyLog])
  );

  useEffect(() => {
    if (!lastWorkoutDate) return;
    const today = getToday();
    if (lastWorkoutDate === today) {
      markTodayCompleted();
    }
  }, [lastWorkoutDate, totalWorkouts]);

  const markTodayCompleted = async () => {
    try {
      const currentWeekStart = getWeekStartDate();
      const index = todaySlotIndex;
      if (index < 0) return;
      const stored = await AsyncStorage.getItem(WEEKLY_LOG_KEY);
      let log = stored ? JSON.parse(stored) : { weekStart: currentWeekStart, days: [false, false, false, false, false, false, false] };

      if (log.weekStart !== currentWeekStart) {
        log = { weekStart: currentWeekStart, days: [false, false, false, false, false, false, false] };
      }

      log.days[index] = true;
      await AsyncStorage.setItem(WEEKLY_LOG_KEY, JSON.stringify(log));
      setCompletedDays([...log.days]);
    } catch (e) {
      console.error('Failed to mark today completed', e);
    }
  };

  const completedCount = completedDays.filter(Boolean).length;
  const dailyQuote = useMemo(() => getDailyQuote(), []);

  // Memoize ordered workout quest cards for the current week / next active workout.
  // Rule: Never focus on completed session. If completed, focus on next workout and use next workout image.
  const { orderedCards, nextActiveDayNumber } = useMemo(() => {
    const planGenDate = currentPlan?.generatedAt
      ? new Date(currentPlan.generatedAt)
      : new Date();

    const genDow = planGenDate.getDay();
    const genDaysBack = (genDow - 1 + 7) % 7;
    const genWeekMonday = new Date(planGenDate);
    genWeekMonday.setHours(0, 0, 0, 0);
    genWeekMonday.setDate(planGenDate.getDate() - genDaysBack);

    const now = new Date();
    const nowDow = now.getDay();
    const nowDaysBack = (nowDow - 1 + 7) % 7;
    const currentWeekMonday = new Date(now);
    currentWeekMonday.setHours(0, 0, 0, 0);
    currentWeekMonday.setDate(now.getDate() - nowDaysBack);

    const msElapsed = currentWeekMonday.getTime() - genWeekMonday.getTime();
    const weekIndex = Math.min(3, Math.max(0, Math.floor(msElapsed / (7 * 86400000))));
    const weekStart = weekIndex * 7 + 1;
    const weekEnd = Math.min(30, weekStart + 6);

    const todayPlanDayNum = Math.min(30, weekStart + (todaySlotIndex >= 0 ? todaySlotIndex : 0));

    const workoutDays = (currentPlan?.days ?? []).filter(
      (d) => !d.isRestDay && d.dayNumber >= weekStart && d.dayNumber <= weekEnd
    );

    const isWorkoutCompleted = (dayNumber: number) => {
      const dowIndex = (startDow + (dayNumber - 1)) % 7;
      const slotIndex = weekOrder.indexOf(dowIndex);
      const isTodaySlot = dayNumber === todayPlanDayNum;
      return Boolean(
        isDayCompleted(dayNumber) ||
        (slotIndex >= 0 && completedDays[slotIndex]) ||
        (isTodaySlot && isTodayCompleted)
      );
    };

    const todayWorkout = workoutDays.find((d) => d.dayNumber === todayPlanDayNum);
    const isTodayWorkoutActive = Boolean(todayWorkout && !isWorkoutCompleted(todayWorkout.dayNumber));

    const uncompletedWorkoutDays = workoutDays.filter((d) => !isWorkoutCompleted(d.dayNumber));
    const completedWorkoutDays = workoutDays.filter((d) => isWorkoutCompleted(d.dayNumber));

    type CardItem = {
      day: AdaptiveDay;
      badge: 'today' | 'upcoming' | null;
      isCompleted: boolean;
    };

    const cards: CardItem[] = [];
    const usedDayNumbers = new Set<number>();

    if (isTodayWorkoutActive && todayWorkout) {
      cards.push({ day: todayWorkout, badge: 'today', isCompleted: false });
      usedDayNumbers.add(todayWorkout.dayNumber);

      const nextWorkout = uncompletedWorkoutDays.find((d) => d.dayNumber > todayWorkout.dayNumber);
      if (nextWorkout && !usedDayNumbers.has(nextWorkout.dayNumber)) {
        cards.push({ day: nextWorkout, badge: 'upcoming', isCompleted: false });
        usedDayNumbers.add(nextWorkout.dayNumber);
      }
    } else {
      // Today is completed OR today is rest day -> Never focus on completed session.
      // Focus on the next uncompleted workout and use next workout image.
      let nextWorkout = uncompletedWorkoutDays.find((d) => d.dayNumber > todayPlanDayNum);

      if (!nextWorkout && uncompletedWorkoutDays.length > 0) {
        nextWorkout = uncompletedWorkoutDays[0];
      }

      // If all workouts this week are completed, look ahead to next week
      if (!nextWorkout && currentPlan?.days) {
        nextWorkout = currentPlan.days.find(
          (d) => !d.isRestDay && d.dayNumber > weekEnd && !isWorkoutCompleted(d.dayNumber)
        );
      }

      // Fallback: any uncompleted workout in the entire plan
      if (!nextWorkout && currentPlan?.days) {
        nextWorkout = currentPlan.days.find(
          (d) => !d.isRestDay && !isWorkoutCompleted(d.dayNumber)
        );
      }

      if (nextWorkout) {
        cards.push({ day: nextWorkout, badge: 'upcoming', isCompleted: false });
        usedDayNumbers.add(nextWorkout.dayNumber);
      }
    }

    // Add remaining uncompleted workouts from this week
    uncompletedWorkoutDays.forEach((d) => {
      if (!usedDayNumbers.has(d.dayNumber)) {
        cards.push({ day: d, badge: null, isCompleted: false });
        usedDayNumbers.add(d.dayNumber);
      }
    });

    // Add completed workouts at the end so they do not take focus
    completedWorkoutDays.forEach((d) => {
      if (!usedDayNumbers.has(d.dayNumber)) {
        cards.push({ day: d, badge: null, isCompleted: true });
        usedDayNumbers.add(d.dayNumber);
      }
    });

    const activeDayNum = cards.find((c) => !c.isCompleted)?.day?.dayNumber ?? cards[0]?.day?.dayNumber ?? 1;

    return { orderedCards: cards, nextActiveDayNumber: activeDayNum };
  }, [
    currentPlan,
    todaySlotIndex,
    startDow,
    weekOrder,
    completedDays,
    isTodayCompleted,
    isDayCompleted,
  ]);

  return (
    <View style={styles.container}>
      {/* Receding Background Card Container */}
      <Reanimated.View style={[{ flex: 1, backgroundColor: '#0A0A0C' }, backgroundCardStyle]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {/* Header / Top Navbar (Scrollable) */}
          <View style={styles.header}>
            {/* Profile & Connected Game HUD Bar */}
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.headerProfileContainer}
            >
              {/* Avatar Unit */}
              <View style={styles.hudAvatarUnit}>
                <Image
                  source={profilePicture ? { uri: profilePicture } : require('../../src/images/avatar_placeholder.png')}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                />
                <View style={[styles.hudLevelBadge, { borderColor: rankConfig.color }]}>
                  <Text style={styles.hudLevelText}>LV.{level}</Text>
                </View>
              </View>

              {/* Connected HUD Bar */}
              <View style={styles.hudBarWrapper}>
                <View style={[styles.hudBarTrack, { borderColor: rankConfig.color }]}>
                  <View
                    style={[
                      styles.hudBarFill,
                      { width: `${Math.min(100, Math.max(0, xpProgress))}%` }
                    ]}
                  />
                </View>

                <Text style={styles.hudXpText}>
                  {Math.floor(xp)}/{xpToNextLevel}<Text style={{ color: '#FFFFFF', fontWeight: '900' }}> XP</Text>
                </Text>
              </View>
            </Pressable>

            <View style={{ flex: 1 }} />

            {/* Right Header Controls / Streak Pill */}
            <View style={styles.streakContainer}>
              <Pressable
                style={styles.streakTouchable}
                onPress={() => router.push('/streak' as any)}
              >
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={[
                  styles.streakNumber,
                  streakDays > 0 && styles.streakNumberActive,
                ]}>
                  {streakDays}
                </Text>
              </Pressable>

              <View style={styles.pillDivider} />

              <Pressable style={styles.notificationBell} onPress={() => router.push('/reminder' as any)}>
                <Bell size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

           {/* ── TEST BUTTON: Trigger Rank-Up Animation with Rank Selector Dropdown ── */}
           <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
             <Pressable
               onPress={() => setShowRankDropdown(!showRankDropdown)}
               style={{
                 backgroundColor: '#FF4500',
                 paddingVertical: 12,
                 paddingHorizontal: 16,
                 borderRadius: 8,
                 flexDirection: 'row',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: 8,
               }}
             >
               <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13, letterSpacing: 1.2 }}>
                 TEST RANK-UP ANIMATION
               </Text>
               <ChevronDown
                 size={18}
                 color="#FFF"
                 style={{ transform: [{ rotate: showRankDropdown ? '180deg' : '0deg' }] }}
               />
             </Pressable>

             {showRankDropdown && (
               <View
                 style={{
                   backgroundColor: '#0A0F1D',
                   borderColor: 'rgba(255, 69, 0, 0.45)',
                   borderWidth: 1.5,
                   borderRadius: 10,
                   marginTop: 8,
                   padding: 12,
                 }}
               >
                 <Text style={{ color: '#8890A0', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, textAlign: 'center' }}>
                   SELECT A RANK TO PREVIEW
                 </Text>
                 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
                   {ALL_TEST_RANKS.map((r) => {
                     const cfg = RANK_CONFIG[r];
                     return (
                       <Pressable
                         key={r}
                         onPress={() => {
                           setShowRankDropdown(false);
                           setSelectedTestRank(r);
                         }}
                         style={{
                           flexDirection: 'row',
                           alignItems: 'center',
                           backgroundColor: 'rgba(255, 255, 255, 0.04)',
                           borderColor: cfg.color,
                           borderWidth: 1.5,
                           borderRadius: 8,
                           paddingVertical: 9,
                           paddingHorizontal: 12,
                           gap: 8,
                           width: '48%',
                         }}
                       >
                         <View
                           style={{
                             width: 10,
                             height: 10,
                             borderRadius: 5,
                             backgroundColor: cfg.color,
                           }}
                         />
                         <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }} numberOfLines={1}>
                           {r === 'National' ? 'National' : `${r} Rank`}
                         </Text>
                       </Pressable>
                     );
                   })}
                 </View>
               </View>
             )}
           </View>

           {selectedTestRank && (
             <LevelUpNotification
               event={{
                 previousLevel: RANK_CONFIG[selectedTestRank].minLevel - 1,
                 newLevel: RANK_CONFIG[selectedTestRank].minLevel,
                 previousRank: selectedTestRank === 'E' ? 'E' : 'D',
                 newRank: selectedTestRank,
                 rankChanged: true,
                 xpGained: 500,
                 rewards: [],
                 xpToNext: 1000,
                 currentXp: 0,
               }}
               onDismiss={() => setSelectedTestRank(null)}
             />
           )}

          {/* Weekly Streak Tracker (Matching Streak Page) */}
          <Reanimated.View entering={FadeInDown.duration(400)} style={styles.weeklySection}>
            <Pressable
              style={styles.weekDaysContainer}
              onPress={() => router.push('/streak' as any)}
            >
              {weekDays.map((day, index) => {
                return (
                  <View key={day.key} style={styles.dayCol}>
                    <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>
                      {day.label}
                    </Text>
                    <View
                      style={[
                        styles.dayCircle,
                        day.isCompleted && styles.dayCircleCompleted,
                        day.isMissed && styles.dayCircleMissed,
                        day.isRestDay && !day.isCompleted && styles.dayCircleRest,
                        day.isToday && !day.isCompleted && !day.isMissed && styles.dayCircleToday,
                      ]}
                    >
                      {day.isCompleted ? (
                        <Check size={16} color="#000000" strokeWidth={2.8} />
                      ) : day.isMissed ? (
                        <X size={15} color="#FF3B30" strokeWidth={2.8} />
                      ) : (
                        <Text
                          style={[
                            styles.dayNumberText,
                            day.isToday && styles.todayNumberText,
                            day.isFuture && styles.futureNumberText,
                            day.isRestDay && styles.restDayNumberText,
                          ]}
                        >
                          {day.dayNumber}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </Pressable>
          </Reanimated.View>

          {/* Predicted Rank Section */}
          <Reanimated.View entering={FadeInDown.delay(150).duration(450)} style={styles.rankCardSection}>
            <Text style={styles.gettingStartedTitle}>Getting Started</Text>
            <PredictedRankCard
              predictedRank="Welcome Player"
              percentileText="Complete the tasks to win a prize"
              buttonText="Continue"
              progressPercent={questProgressPercent}
              onClassifyPress={openWelcomeQuestModal}
            />
          </Reanimated.View>

          {/* Quests Section — Dynamic Workout Cards */}
          <View style={styles.questsSection}>
            <View style={styles.questsHeader}>
              <Text style={styles.questsTitle}>Quests</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.questCardsScroll}
            >
              {orderedCards.length > 0 ? (
                orderedCards.map(({ day, badge, isCompleted }, idx) => {
                  const dowIndex = (startDow + (day.dayNumber - 1)) % 7;
                  const dayName = LONG_DAY_NAMES[dowIndex];

                  return (
                    <Reanimated.View
                      key={day.dayNumber}
                      entering={FadeInRight.delay(idx * 70).springify().damping(15)}
                      style={styles.questCard}
                    >
                      <Pressable
                        style={{ flex: 1 }}
                        onPress={() => router.push(`/workout-details/${day.dayNumber}` as any)}
                      >
                        <ImageBackground
                          source={getWorkoutCardImage(day.focus, day.isRestDay)}
                          style={styles.questBgImage}
                          imageStyle={{ borderRadius: 16 }}
                        >
                          {isCompleted ? (
                            /* Completed state: dark overlay + centered text only + day name top right */
                            <View style={styles.questCompletedOverlay}>
                              <View style={styles.questTopRightBadge}>
                                <Text style={styles.questTopRightBadgeText}>{dayName}</Text>
                              </View>
                              <Check size={28} color="#FFFFFF" strokeWidth={2.5} />
                              <Text style={styles.questCompletedText}>COMPLETED</Text>
                            </View>
                          ) : (
                            /* Active state: full card content */
                            <LinearGradient
                              colors={badge === 'today'
                                ? ['rgba(10, 10, 10, 0.25)', 'rgba(10, 10, 10, 0.92)']
                                : ['rgba(10, 10, 10, 0.4)', 'rgba(10, 10, 10, 0.95)']}
                              style={styles.questGradient}
                            >
                              <View style={styles.questTopRightBadge}>
                                <Text style={styles.questTopRightBadgeText}>{dayName}</Text>
                              </View>

                              <Text style={styles.questCardTitle} numberOfLines={1}>
                                {day.focus?.toUpperCase() || 'WORKOUT'}
                              </Text>
                              <Text style={styles.questCardSubtitle} numberOfLines={1}>
                                {day.dayLabel} • {day.exercises.length} {day.exercises.length === 1 ? 'Exercise' : 'Exercises'}
                              </Text>

                              <PrimaryButton
                                title="START WORKOUT"
                                onPress={() => router.push(`/workout-details/${day.dayNumber}` as any)}
                              />
                            </LinearGradient>
                          )}
                        </ImageBackground>
                      </Pressable>
                    </Reanimated.View>
                  );
                })
              ) : (
                /* Fallback when no plan exists yet */
                <View style={styles.questCard}>
                  <Pressable style={{ flex: 1 }} onPress={handleGenerateWorkout}>
                    <ImageBackground
                      source={require('../../src/images/strength training.png')}
                      style={styles.questBgImage}
                      imageStyle={{ borderRadius: 16 }}
                    >
                      <LinearGradient
                        colors={['rgba(10, 10, 10, 0.3)', 'rgba(10, 10, 10, 0.92)']}
                        style={styles.questGradient}
                      >
                        <Text style={styles.questCardTitle}>GENERATE A PLAN</Text>
                        <Text style={styles.questCardSubtitle}>Tap below to create your personalized workout plan</Text>
                        <PrimaryButton
                          title="GENERATE WORKOUT"
                          onPress={handleGenerateWorkout}
                        />
                      </LinearGradient>
                    </ImageBackground>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Your Workout Section */}
          <Reanimated.View entering={FadeInUp.duration(400)} style={styles.yourWorkoutSection}>
            <Text style={styles.yourWorkoutTitle}>Your Workout</Text>

            <View style={styles.yourWorkoutList}>
              {/* Generate Workout */}
              <Pressable
                style={styles.yourWorkoutItem}
                onPress={handleGenerateWorkout}
                disabled={isGenerating}
              >
                <View style={styles.yourWorkoutItemLeft}>
                  {isGenerating ? (
                    <RotateCw size={17} color="rgba(255, 255, 255, 0.85)" />
                  ) : (
                    <Sparkles size={17} color="rgba(255, 255, 255, 0.85)" />
                  )}
                  <Text style={styles.yourWorkoutItemText}>
                    {isGenerating ? 'Generating...' : currentPlan ? 'Regenerate Workout' : 'Generate Workout'}
                  </Text>
                </View>
              </Pressable>

              {/* Start New Workout */}
              <Pressable
                style={styles.yourWorkoutItem}
                onPress={() => router.push(`/workout-details/${nextActiveDayNumber}` as any)}
              >
                <View style={styles.yourWorkoutItemLeft}>
                  <PlayCircle size={17} color="rgba(255, 255, 255, 0.85)" />
                  <Text style={styles.yourWorkoutItemText}>Start New Workout</Text>
                </View>
              </Pressable>
            </View>

            {/* Routines Sub-Section under Your Workout */}
            <View style={styles.customRoutinesContainer}>
              <Pressable
                style={styles.customRoutinesHeader}
                onPress={toggleRoutinesExpanded}
              >
                <Text style={styles.customRoutinesTitle}>Routines ({customRoutines.length})</Text>
                <Reanimated.View style={[styles.routinesArrowContainer, arrowAnimatedStyle]}>
                  <ChevronRight size={18} color="rgba(255, 255, 255, 0.7)" />
                </Reanimated.View>
              </Pressable>

              {isRoutinesExpanded && (
                <View>
                  {customRoutines.length > 0 ? (
                    customRoutines.map((routine) => (
                      <View
                        key={routine.id}
                        style={styles.routineCard}
                      >
                        <View style={styles.routineCardMain}>
                          <Pressable
                            style={styles.routineInfoPressable}
                            onPress={() => router.push(`/workout-details/${routine.id}` as any)}
                          >
                            <View style={styles.routineBadge}>
                              <Dumbbell size={16} color="#4080E7" />
                            </View>
                            <View style={styles.routineInfo}>
                              <Text style={styles.routineName} numberOfLines={1}>
                                {routine.name}
                              </Text>
                              <Text style={styles.routineSubtext}>
                                {routine.exercises.length} {routine.exercises.length === 1 ? 'exercise' : 'exercises'}
                              </Text>
                            </View>
                          </Pressable>

                          <Pressable
                            style={styles.routineDeleteBtn}
                            onPress={() => deleteRoutine(routine.id)}
                          >
                            <Trash2 size={16} color="rgba(255, 255, 255, 0.4)" />
                          </Pressable>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Pressable
                      style={styles.emptyRoutinesBox}
                      onPress={() => router.push('/custom-workout' as any)}
                    >
                      <Text style={styles.emptyRoutinesText}>No routines created yet. Tap to create one.</Text>
                    </Pressable>
                  )}

                  {customRoutines.length > 0 && (
                    <Pressable
                      style={[styles.yourWorkoutItem, { marginTop: 12, marginBottom: 8 }]}
                      onPress={() => router.push('/custom-workout' as any)}
                    >
                      <View style={styles.yourWorkoutItemLeft}>
                        <PlusCircle size={17} color="rgba(255, 255, 255, 0.85)" />
                        <Text style={styles.yourWorkoutItemText}>Create Workout</Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </Reanimated.View>
        </ScrollView>
      </Reanimated.View>

      {/* iOS Style Bottom Sheet Modal for Welcome Quest */}
      <Modal
        visible={isWelcomeQuestModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeWelcomeQuestModal}
      >
        <View style={styles.sheetOverlay}>
          {/* Animated Backdrop overlay */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeWelcomeQuestModal}
          >
            <Reanimated.View style={[styles.sheetBackdrop, sheetBackdropStyle]} />
          </Pressable>

          {/* Bottom Sheet Card Content with Pan Gesture for Drag-to-Dismiss */}
          <GestureDetector gesture={sheetPanGesture}>
            <Reanimated.View
              style={[
                styles.bottomSheetContainer,
                sheetContainerStyle,
                { paddingBottom: Math.max(insets.bottom + 20, 36) },
              ]}
            >
              <View style={styles.sheetHandleBar} />

              <View style={styles.sheetHeaderRow}>
                <Pressable
                  onPress={closeWelcomeQuestModal}
                  style={styles.sheetCloseBtn}
                  hitSlop={8}
                >
                  <X size={20} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.sheetTitle}>Welcome Player</Text>
                <View style={{ width: 28 }} />
              </View>

              {/* Task Items List */}
              <View style={styles.questTasksList}>
                {questTasks.map((task) => (
                  <Pressable
                    key={task.id}
                    style={styles.questTaskRow}
                    onPress={task.onPress}
                    disabled={!task.onPress}
                  >
                    <Text style={[styles.questTaskTitle, task.isDone ? styles.questTaskTitleDone : styles.questTaskTitleActive]}>
                      {task.title}
                    </Text>
                    <View style={[styles.questTaskIconCircle, task.isDone ? styles.questTaskIconCircleDone : styles.questTaskIconCircleActive]}>
                      {task.isDone ? (
                        <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                      ) : (
                        <ChevronRight size={16} color="#FFFFFF" strokeWidth={2} />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Bottom Reward Progress Section */}
              <View style={styles.questProgressCard}>
                <Text style={styles.questProgressSubtitle}>Complete the tasks to win a prize</Text>
                <View style={styles.questProgressRow}>
                  <Text style={styles.questProgressPercentText}>{questProgressPercent}%</Text>
                  <View style={styles.questProgressBarTrack}>
                    <View style={[styles.questProgressBarFill, { width: `${questProgressPercent}%` }]} />
                  </View>
                  <Gift size={24} color="#D4AF37" />
                </View>
              </View>
            </Reanimated.View>
          </GestureDetector>
        </View>
      </Modal>

      {/* Modal for Editing Weekly Goal */}
      <Modal
        visible={isEditModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={[styles.modalFullScreen, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Configure Goal</Text>
              <Text style={styles.modalSubtitle}>Customize your weekly training schedule</Text>
            </View>
            <Pressable onPress={() => setIsEditModalVisible(false)} style={styles.modalCloseBtn}>
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
            {/* Section 1: Days per week */}
            <View style={styles.modalSectionContainer}>
              <View style={styles.modalSectionHeader}>
                <Dumbbell size={18} color="#FFFFFF" />
                <Text style={styles.modalSectionLabel}>Target Days per Week</Text>
              </View>

              <View style={styles.modalOptionsStack}>
                {daysOptions.map((opt) => {
                  const isSelected = answers.weeklyGoal === opt || (!answers.weeklyGoal && opt === '3 DAYS');
                  return (
                    <Pressable
                      key={opt}
                      style={[
                        styles.modalOptionRow,
                        isSelected && styles.modalOptionRowSelected,
                      ]}
                      onPress={() => updateAnswer('weeklyGoal', opt)}
                    >
                      <View style={styles.modalOptionLeft}>
                        <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                        <Text
                          style={[
                            styles.modalOptionRowText,
                            isSelected && styles.modalOptionRowTextSelected,
                          ]}
                        >
                          {opt}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>SELECTED</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Start Day */}
            <View style={[styles.modalSectionContainer, { marginTop: 24 }]}>
              <View style={styles.modalSectionHeader}>
                <Calendar size={18} color="#FFFFFF" />
                <Text style={styles.modalSectionLabel}>Week Start Day</Text>
              </View>

              <View style={styles.modalDayGrid}>
                {startDayOptions.map((day) => {
                  const isSelected = answers.startDay === day || (!answers.startDay && day === 'MONDAY');
                  return (
                    <Pressable
                      key={day}
                      style={[
                        styles.modalDayCard,
                        isSelected && styles.modalDayCardSelected,
                      ]}
                      onPress={() => updateAnswer('startDay', day)}
                    >
                      <Text
                        style={[
                          styles.modalDayText,
                          isSelected && styles.modalDayTextSelected,
                        ]}
                      >
                        {day.substring(0, 3)}
                      </Text>
                      <Text
                        style={[
                          styles.modalDaySubtext,
                          isSelected && styles.modalDaySubtextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Button */}
          <Pressable
            style={styles.modalSaveBtn}
            onPress={async () => {
              setIsEditModalVisible(false);
              await createAndSavePlan();
            }}
          >
            <Check size={20} color="#000000" style={{ marginRight: 6 }} />
            <Text style={styles.modalSaveBtnText}>Save Changes</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <Check size={16} color="#4080E7" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </View>
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
    paddingBottom: 12,
  },
  headerProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudAvatarUnit: {
    zIndex: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudLevelBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#07101B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    zIndex: 12,
  },
  hudLevelText: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  hudBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
    zIndex: 1,
  },
  hudBarTrack: {
    width: 95,
    height: 12,
    backgroundColor: '#050D18',
    borderRadius: 6,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  hudBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  hudXpText: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  notificationBell: {
    padding: 4,
    marginLeft: 2,
  },
  pillDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },

  // Streak
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakFire: {
    fontSize: 20,
    transform: [{ translateY: -3 }],
  },
  streakNumber: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  streakNumberActive: {
    color: '#FFFFFF',
    textShadowColor: '#FF6B00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // Predicted Rank Section
  rankCardSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  gettingStartedTitle: {
    ...typography.h2,
    marginBottom: 12,
  },

  // User Profile
  profileSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },

  // Motivational Quote
  quoteSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  quoteCard: {
    backgroundColor: 'rgba(56, 182, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#38B6FF',
  },
  quoteDecor: {
    fontWeight: 'bold',
    fontSize: 36,
    color: 'rgba(56, 182, 255, 0.35)',
    lineHeight: 40,
    marginBottom: -8,
  },
  quoteText: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#E0E0E0',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontWeight: '600',
    fontSize: 11,
    color: 'rgba(56, 182, 255, 0.7)',
    marginTop: 8,
    letterSpacing: 0.5,
  },

  // Your Workout Section
  yourWorkoutSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  yourWorkoutTitle: {
    ...typography.h2,
    marginBottom: 12,
  },
  yourWorkoutList: {
    gap: 4,
  },
  yourWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  yourWorkoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yourWorkoutItemText: {
    fontWeight: '500',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
  },

  // Custom Routines List in Workout Section
  customRoutinesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 10,
  },
  customRoutinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  routinesArrowContainer: {
    padding: 4,
  },
  customRoutinesTitle: {
    ...typography.h2,
  },
  emptyRoutinesBox: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyRoutinesText: {
    fontWeight: '500',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  routineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  routineCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  routineInfoPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routineBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  routineSubtext: {
    fontWeight: '500',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  routinePlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  routinePlayText: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#000000',
    letterSpacing: 0.5,
  },
  routineDeleteBtn: {
    padding: 6,
    marginLeft: 4,
  },

  // Quests
  questsSection: {
    marginTop: 24,
  },
  questsHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  questsTitle: {
    ...typography.h2,
  },
  questsSubtitle: {
    fontWeight: 'normal',
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
    letterSpacing: 1,
  },
  questCardsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  questCard: {
    width: 320,
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
  },
  questCardToday: {},
  questCompletedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  questCompletedText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  questBgImage: {
    width: '100%',
    height: '100%',
  },
  questGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
  },
  questTopBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(64, 128, 231, 0.2)',
    borderWidth: 1,
    borderColor: '#4080E7',
  },
  questBadgeText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#4080E7',
    letterSpacing: 1,
  },
  questTopRightBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  questTopRightBadgeText: {
    fontWeight: '700',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  questCardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  questCardSubtitle: {
    fontWeight: 'normal',
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 18,
    textAlign: 'center',
  },
  questDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  questDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  questDetailText: {
    fontWeight: '500',
    fontSize: 11,
    color: '#E0E0E0',
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  startWorkoutBtnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000000',
    letterSpacing: 1.2,
  },
  workoutCompletedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.4)',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  workoutCompletedBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#4080E7',
    letterSpacing: 0.8,
  },

  // Custom Quest
  customQuestSection: {
    marginTop: 28,
    paddingBottom: 8,
  },
  customQuestCardWrapper: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 182, 255, 0.2)',
  },
  customQuestBgImage: {
    width: '100%',
    height: 220,
  },
  customQuestGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  customQuestContent: {
    alignItems: 'center',
    gap: 8,
  },
  customQuestTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  customQuestSubtitle: {
    fontWeight: 'normal',
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  customQuestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 182, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#38B6FF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    width: '100%',
  },
  customQuestBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },

  // Weekly Goal
  weeklySection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  weeklyRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weeklyTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weeklyCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weeklyCountHighlight: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#4080E7',
    textShadowColor: 'rgba(64, 128, 231, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  weeklyCountSlash: {
    fontWeight: '600',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },

  // Modal Styles (Fullscreen Monochrome Redesign)
  modalFullScreen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontWeight: 'normal',
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalSectionContainer: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  modalSectionLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  modalOptionsStack: {
    gap: 8,
  },
  modalOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalOptionRowSelected: {
    backgroundColor: '#262626',
    borderColor: '#FFFFFF',
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555555',
    backgroundColor: 'transparent',
  },
  radioDotSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  modalOptionRowText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#777777',
  },
  modalOptionRowTextSelected: {
    color: '#FFFFFF',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  activeBadgeText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#000000',
    letterSpacing: 0.5,
  },
  modalDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalDayCard: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalDayCardSelected: {
    backgroundColor: '#262626',
    borderColor: '#FFFFFF',
  },
  modalDayText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#777777',
  },
  modalDayTextSelected: {
    color: '#FFFFFF',
  },
  modalDaySubtext: {
    fontWeight: 'normal',
    fontSize: 10,
    color: '#555555',
    marginTop: 2,
  },
  modalDaySubtextSelected: {
    color: '#999999',
  },
  modalSaveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 14,
  },
  modalSaveBtnText: {
    fontWeight: '500',
    fontSize: 15,
    color: '#000000',
    letterSpacing: 1.5,
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
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  todayLabel: {
    color: '#4080E7',
    fontWeight: '700',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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

  // Welcome Quest Bottom Sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  bottomSheetContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 22,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sheetCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  questTasksList: {
    gap: 18,
    marginBottom: 28,
  },
  questTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  questTaskTitle: {
    fontSize: 15,
    flex: 1,
    paddingRight: 12,
  },
  questTaskTitleDone: {
    color: '#6E6E78',
    fontWeight: '500',
  },
  questTaskTitleActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  questTaskIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTaskIconCircleDone: {
    backgroundColor: '#4080E7',
  },
  questTaskIconCircleActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  questProgressCard: {
    paddingTop: 4,
  },
  questProgressSubtitle: {
    fontSize: 13,
    color: '#9E9EA8',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  questProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questProgressPercentText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 42,
  },
  questProgressBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E1E24',
    overflow: 'hidden',
  },
  questProgressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#4080E7',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1E24',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.4)',
    shadowColor: '#4080E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
