import React, { useState, useRef, useMemo, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform, Pressable, Text, FlatList, Animated, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { ChevronLeft, Trophy, AlertTriangle, Clock, Info, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutPlan } from '../../src/context/WorkoutPlanContext';
import { useCustomWorkouts } from '../../src/context/CustomWorkoutsContext';
import { useProgression } from '../../src/context/ProgressionContext';
import ExerciseCard from '../../src/components/ExerciseCard';
import SystemNotification from '../../src/components/SystemNotification';
import { WorkoutMetadata } from '../../src/data/levelConfig';
import { useWorkoutSession } from '../../src/hooks/useWorkoutSession';
import { useWorkoutTimer } from '../../src/hooks/useWorkoutTimer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { currentPlan } = useWorkoutPlan();
  const { customRoutines } = useCustomWorkouts();
  const { completeWorkout, isDayCompleted } = useProgression();
  const isBypassingPreventRemove = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const textFont = Platform.select({
    ios: 'System',
    web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "San Francisco", sans-serif',
    default: 'System',
  });

  const isCustomRoutine = id?.startsWith('routine_') || false;
  const customRoutine = isCustomRoutine ? customRoutines.find((r) => r.id === id) : null;
  const dayNumber = isCustomRoutine ? 0 : parseInt(id, 10);
  const workoutDay = isCustomRoutine ? null : currentPlan?.days.find((d) => d.dayNumber === dayNumber);

  // Normalize exercises for both custom routines and daily plan workouts
  const exercises = useMemo(() => {
    if (isCustomRoutine && customRoutine) {
      return (customRoutine.exercises || []).map((ex: any, idx: number) => {
        const sets = ex.sets || ex.prescription?.sets || 3;
        const repsTarget = ex.reps || ex.prescription?.repsTarget || 10;
        return {
          id: ex.id || `custom_ex_${idx}`,
          name: ex.name,
          equipment: ex.equipment || 'Bodyweight',
          primaryMuscle: ex.primaryMuscle || 'Full Body',
          prescription: {
            sets,
            repsTarget,
            target_reps: String(repsTarget),
            weightKg: ex.prescription?.weightKg || 0,
            rest_seconds: ex.prescription?.rest_seconds || 60,
          },
          isCompound: false,
        };
      });
    }
    return workoutDay?.exercises || [];
  }, [isCustomRoutine, customRoutine, workoutDay]);

  const workoutPlanId = isCustomRoutine
    ? `custom_${id}`
    : (currentPlan?.generatedAt || 'unknown_plan');

  const workoutTitle = isCustomRoutine
    ? (customRoutine?.name || 'Custom Workout')
    : (workoutDay ? `Day ${dayNumber}-${workoutDay.focus}` : 'Body sculpting');

  const isRestDay = workoutDay?.isRestDay || false;
  const alreadyCompleted = isCustomRoutine ? false : isDayCompleted(dayNumber);

  // Map initial exercises for Clean Architecture WorkoutSessionService
  const initialExercisesPayload = useMemo(
    () =>
      exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        setsCount: ex.prescription?.sets || 3,
        targetWeight: ex.prescription?.weightKg || 0,
        targetReps: parseInt(ex.prescription?.target_reps || '10', 10) || 10,
      })),
    [exercises]
  );

  // Clean Architecture Session Hook
  const {
    session,
    stats,
    prFlashMessage,
    finishSession,
    pauseSession,
    cancelSession,
    completeSet,
    updateSet,
    updateTimer,
  } = useWorkoutSession({
    userId: 'local_user',
    workoutPlanId: workoutPlanId,
    workoutDayId: dayNumber,
    dayTitle: workoutTitle,
    initialExercises: initialExercisesPayload,
    autoStart: true,
  });

  useEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') return;
    try {
      const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
        if (isBypassingPreventRemove.current) return;
        e.preventDefault();
        setShowExitModal(true);
      });
      return unsubscribe;
    } catch (err) {
      // Suppress error if beforeRemove is unsupported on web navigator
    }
  }, [navigation]);

  // Resilient Session Timer Hook
  const { formattedTimer } = useWorkoutTimer({
    initialSeconds: session?.durationSeconds || 0,
    isPaused: session?.status === 'paused',
    onTick: updateTimer,
  });

  const gatherWorkoutMetadata = async (): Promise<WorkoutMetadata> => {
    let totalVolumeKg = 0;
    let totalSets = 0;
    let completedSets = 0;
    let compoundCount = 0;

    for (const ex of exercises) {
      const storageKey = `@workout_${workoutPlanId}_day_${dayNumber}_ex_${ex.id}`;
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const sets = JSON.parse(stored) as { weight: string; reps: string; completed: boolean }[];
          for (const set of sets) {
            totalSets++;
            if (set.completed) {
              completedSets++;
              const w = parseFloat(set.weight) || 0;
              const r = parseInt(set.reps) || 0;
              totalVolumeKg += w * r;
            }
          }
        } else {
          totalSets += ex.prescription?.sets || 3;
        }
      } catch {
        totalSets += ex.prescription?.sets || 3;
      }

      if (ex.isCompound) compoundCount++;
    }

    const completionPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    const compoundRatio = exercises.length > 0 ? compoundCount / exercises.length : 0;

    const durationMinutes = Math.round((session?.durationSeconds || 0) / 60);

    return {
      exerciseCount: exercises.length,
      totalSets,
      completedSets,
      totalVolumeKg,
      completionPercent,
      compoundRatio,
      isRestDay,
      prCount: stats.prCount,
      durationMinutes,
      isFirstWorkoutToday: true,
    };
  };

  const handleCompleteQuest = async () => {
    const meta = await gatherWorkoutMetadata();
    if (!isCustomRoutine) {
      completeWorkout(dayNumber, meta);
    } else {
      completeWorkout(0, meta);
    }

    // Save completed session into history
    await finishSession();

    isBypassingPreventRemove.current = true;
    router.replace({
      pathname: '/streak',
      params: { celebrate: 'true', justCompletedWorkout: 'true', ts: Date.now().toString() },
    } as any);
  };

  const handleBack = () => {
    setShowExitModal(true);
  };

  const handleConfirmDiscard = async () => {
    setShowExitModal(false);
    isBypassingPreventRemove.current = true;
    try {
      await cancelSession();
      for (const ex of exercises) {
        const storageKey = `@workout_${workoutPlanId}_day_${dayNumber}_ex_${ex.id}`;
        const xpAwardedKey = `@xp_awarded_${workoutPlanId}_day_${dayNumber}_ex_${ex.id}`;
        await AsyncStorage.removeItem(storageKey);
        await AsyncStorage.removeItem(xpAwardedKey);
      }
    } catch (e) {
      console.error('Failed to reset discarded workout session', e);
    }
    router.replace('/(tabs)/home');
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const [localCompletedSets, setLocalCompletedSets] = useState<Record<string, number>>({});
  const totalLocalCompletedSets = useMemo(
    () => Object.values(localCompletedSets).reduce((a, b) => a + b, 0),
    [localCompletedSets]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Header */}
      {(() => {
        return (
          <View style={styles.headerContainer}>
            <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </Pressable>

            <View style={styles.headerInfo}>
              <Text style={styles.headerSubtitleText} numberOfLines={1}>
                {workoutTitle}
              </Text>
              <View style={styles.timerRow}>
                <Text style={styles.timerLargeText}>{formattedTimer}</Text>
              </View>
            </View>

            {/* Top Right Finish Button */}
            <Pressable
              style={styles.topFinishBtn}
              onPress={handleCompleteQuest}
            >
              <Text style={styles.topFinishText}>
                FINISH
              </Text>
            </Pressable>
          </View>
        );
      })()}

      {/* PR Flash Notification Banner */}
      {prFlashMessage && (
        <View style={styles.prBanner}>
          <Trophy size={16} color="#FFD700" />
          <Text style={styles.prBannerText}>{prFlashMessage}</Text>
        </View>
      )}

      {/* Exercise List — Solo Leveling Notification Bar */}
      <ScrollView style={styles.container} contentContainerStyle={styles.containerContent} showsVerticalScrollIndicator={false}>
        <SystemNotification
          title="QUEST OBJECTIVES"
          visible={true}
          animated={true}
          showCorners={false}
          style={styles.questNotification}
          footer={
            <View style={styles.questTimerFooter}>
              <Text style={styles.questWarningLine}>
                <Text style={styles.questWarningLabel}>WARNING: </Text>
                <Text style={styles.questWarningText}>Failure to complete this workout will trigger a System Penalty.</Text>
              </Text>
              <View style={styles.questTimerRow}>
                <Clock size={13} color="#FFFFFF" />
                <Text style={styles.questTimerValue}>{formattedTimer}</Text>
              </View>
            </View>
          }
        >
          {exercises.length > 0 ? (
            <FlatList
              data={exercises as any[]}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ExerciseCard
                  exercise={item as any}
                  dayId={dayNumber}
                  planId={workoutPlanId}
                  onSetChange={(exId, setIdx, currentSets) => {
                    const completedCount = currentSets.filter((s) => s.completed).length;
                    setLocalCompletedSets((prev) => ({
                      ...prev,
                      [exId]: completedCount,
                    }));

                    const isComp = currentSets[setIdx]?.completed;
                    if (isComp) {
                      completeSet(exId, setIdx);
                    } else {
                      updateSet(exId, setIdx, { completed: false });
                    }
                  }}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.questSeparator} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { fontFamily: textFont }]}>No exercises available for this workout.</Text>
              <Pressable
                style={styles.emptyBackBtn}
                onPress={() => {
                  isBypassingPreventRemove.current = true;
                  router.back();
                }}
              >
                <Text style={styles.emptyBackBtnText}>ADD EXERCISES</Text>
              </Pressable>
            </View>
          )}
        </SystemNotification>
      </ScrollView>

      {/* Leave / Discard Workout Confirmation Modal (Clean Black & White Design) */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exitModalCard}>
            {/* Alert Icon */}
            <View style={styles.exitIconCircle}>
              <AlertTriangle size={24} color="#FFFFFF" strokeWidth={2.2} />
            </View>

            {/* Title & Description */}
            <Text style={styles.exitModalTitle}>Leave Workout?</Text>
            <Text style={styles.exitModalSubtext}>
              Your current workout session is in progress. Are you sure you want to discard your progress and exit?
            </Text>

            {/* Action Buttons (Black & White) */}
            <View style={styles.exitModalActionStack}>
              <Pressable
                style={({ pressed }) => [
                  styles.continueBtnWhite,
                  pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
                ]}
                onPress={handleCancelExit}
              >
                <Text style={styles.continueBtnWhiteText}>CONTINUE WORKOUT</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.discardBtnBW,
                  pressed && { opacity: 0.75, transform: [{ scale: 0.985 }] },
                ]}
                onPress={handleConfirmDiscard}
              >
                <Trash2 size={15} color="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
                <Text style={styles.discardBtnBWText}>DISCARD & EXIT</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const iosFont = Platform.select({
  ios: 'System',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "San Francisco", sans-serif',
  default: 'System',
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1117',
    ...(Platform.OS === 'web' ? { height: '100vh' as any, maxHeight: '100vh' as any, overflow: 'hidden' as any } : {}),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#151821',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    zIndex: 100,
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingRight: 8,
  },
  headerSubtitleText: {
    fontFamily: iosFont,
    fontWeight: '600',
    fontSize: 13,
    color: '#8A92A6',
    letterSpacing: 0.3,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  timerLargeText: {
    fontFamily: iosFont,
    fontWeight: '800',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  topFinishBtn: {
    backgroundColor: '#4080E7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#4080E7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topFinishBtnDisabled: {
    backgroundColor: '#252834',
    elevation: 0,
    shadowOpacity: 0,
    opacity: 0.6,
  },
  topFinishText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  topFinishTextDisabled: {
    color: '#7E8597',
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#332800',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  prBannerText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 13,
    color: '#FFD700',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  containerContent: {
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  questNotification: {
    width: '100%',
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 16,
  },
  questTimerFooter: {
    width: '100%',
    paddingTop: 0,
  },
  questWarningLine: {
    fontSize: 11,
    textAlign: 'left',
    lineHeight: 16,
    marginBottom: 8,
    width: '100%',
  },
  questWarningLabel: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 11,
    color: '#EF4444',
  },
  questWarningText: {
    fontFamily: iosFont,
    fontWeight: '400',
    fontSize: 11,
    color: '#FFFFFF',
  },
  questTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  questTimerValue: {
    fontFamily: iosFont,
    fontWeight: '500',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  questSeparator: {
    height: 1,
    backgroundColor: 'rgba(56, 182, 255, 0.1)',
    marginVertical: 4,
    marginLeft: 30,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 4,
    gap: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#8A92A6',
    fontSize: 15,
    marginBottom: 16,
  },
  emptyBackBtn: {
    backgroundColor: '#4080E7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBackBtnText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  // Modal styles (Clean Black & White Modal)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  exitModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#12141C',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  exitIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exitModalTitle: {
    fontFamily: iosFont,
    fontWeight: '800',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  exitModalSubtext: {
    fontFamily: iosFont,
    fontWeight: '400',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  exitModalActionStack: {
    width: '100%',
    gap: 10,
  },
  continueBtnWhite: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueBtnWhiteText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 13,
    color: '#000000',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  discardBtnBW: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  discardBtnBWText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
