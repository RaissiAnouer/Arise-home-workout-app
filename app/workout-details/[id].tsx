import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  SectionList,
  TextInput,
  Animated,
  PanResponder,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Plus,
  ArrowLeftRight,
  Play,
  X,
  Search,
  Dumbbell,
  Trash2,
  Check,
  RotateCw,
} from 'lucide-react-native';
import { useWorkoutPlan } from '../../src/context/WorkoutPlanContext';
import { useCustomWorkouts } from '../../src/context/CustomWorkoutsContext';
import { useProgression } from '../../src/context/ProgressionContext';
import ExerciseInstructionModal from '../../src/components/workout/ExerciseInstructionModal';
import WorkoutMuscleHighlighter from '../../src/components/workout/WorkoutMuscleHighlighter';
import type { MuscleHeatmapEntry } from '../../src/services/ReportsService';
import { typography, toTitleCase } from '../../src/styles/typography';
import { ExerciseMediaDB } from '../../src/data/exerciseMedia';
import { EXERCISE_DATABASE } from '../../src/data/exercises/database';
import { allExercises, Exercise, ALL_MUSCLE_GROUPS, ALL_EQUIPMENT } from '../../src/data/exercises';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AddBrowseMode = 'all' | 'muscle' | 'equipment';
function compareAlphaFirst(a: string, b: string): number {
  const isALetter = /^[a-zA-Z]/.test(a);
  const isBLetter = /^[a-zA-Z]/.test(b);
  if (isALetter && !isBLetter) return -1;
  if (!isALetter && isBLetter) return 1;
  return a.localeCompare(b);
}
const ADD_MUSCLE_FILTERS = ALL_MUSCLE_GROUPS.filter((m: string) => allExercises.some((ex) => ex.primaryMuscle === m));
const ADD_EQUIPMENT_FILTERS = ALL_EQUIPMENT.filter((eq: string) => allExercises.some((ex) => ex.equipment === eq));
import FrontBodySVG from '../../src/components/reports/body/FrontBodySVG';
import BackBodySVG from '../../src/components/reports/body/BackBodySVG';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';

function MuscleBodyThumbnail({ muscle }: { muscle: string }) {
  const norm = muscle.toLowerCase();
  const isBackMuscle = [
    'upper back',
    'back',
    'lats',
    'traps',
    'triceps',
    'glutes',
    'hamstrings',
    'calves',
  ].some((m) => norm.includes(m));

  const heatmapData = [
    {
      muscle: muscle,
      intensity: 1.0,
      count: 1,
      volume: 100,
      totalSets: 1,
      totalVolume: 100,
      workoutCount: 1,
      lastTrainedDate: 'Today',
      percentOfTotal: 100,
    },
  ];

  return (
    <View style={styles.muscleThumbBox}>
      {isBackMuscle ? (
        <BackBodySVG width={40} height={40} data={heatmapData} />
      ) : (
        <FrontBodySVG width={40} height={40} data={heatmapData} />
      )}
    </View>
  );
}

function SwipeableExerciseRow({
  children,
  onDelete,
  disabled = false,
  fontFamily,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  disabled?: boolean;
  fontFamily?: string;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disabled) return false;
        return Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        let newX = gestureState.dx;
        if (isOpen) newX -= 76;
        if (newX > 0) newX = 0;
        if (newX < -120) newX = -120 + (newX + 120) * 0.2;
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        let finalX = gestureState.dx;
        if (isOpen) finalX -= 76;
        if (finalX < -35) {
          Animated.spring(translateX, {
            toValue: -76,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(false);
        }
      },
    })
  ).current;

  const handlePressDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(translateX, {
      toValue: -350,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  return (
    <View style={styles.swipeRowWrapper}>
      <View style={styles.deleteButtonContainer}>
        <Pressable style={styles.deleteButton} onPress={handlePressDelete}>
          <Trash2 size={18} color="#FFFFFF" />
          <Text style={[styles.deleteButtonText, { fontFamily }]}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: '#121212',
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export default function WorkoutDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentPlan, updateDayExercises, regenerateDayWorkout } = useWorkoutPlan();
  const { customRoutines, updateRoutine } = useCustomWorkouts();
  const { isDayCompleted } = useProgression();

  const isCustomRoutine = id?.startsWith('routine_');
  const dayNumber = isCustomRoutine ? NaN : parseInt(id, 10);
  
  const customRoutine = isCustomRoutine ? customRoutines.find((r) => r.id === id) : null;
  const workoutDay = isCustomRoutine ? null : currentPlan?.days.find((d) => d.dayNumber === dayNumber);

  const initialData = isCustomRoutine 
    ? (customRoutine?.exercises || []) 
    : (workoutDay?.exercises || []);

  const [data, setData] = useState<any[]>(initialData);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Modal States
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState<any | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailExercise, setDetailExercise] = useState<{ name: string; id?: string } | null>(null);
  const [addBrowseMode, setAddBrowseMode] = useState<AddBrowseMode>('all');
  const [addSelectedMuscle, setAddSelectedMuscle] = useState<string | null>(null);
  const [addSelectedEquipment, setAddSelectedEquipment] = useState<string | null>(null);

  useEffect(() => {
    if (isCustomRoutine && customRoutine) {
      setData(customRoutine.exercises);
    } else if (!isCustomRoutine && workoutDay) {
      setData(workoutDay.exercises);
    }
  }, [workoutDay, customRoutine, isCustomRoutine]);

  const handleRegenerateThisDay = async () => {
    if (isCustomRoutine || !workoutDay || isRegenerating) return;
    try {
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setIsRegenerating(true);
      await regenerateDayWorkout(dayNumber);
      if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error('Failed to regenerate day workout', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const saveUpdatedExercises = (newData: any[]) => {
    if (isCustomRoutine && customRoutine) {
      updateRoutine(customRoutine.id, newData);
    } else {
      updateDayExercises(dayNumber, newData);
    }
  };

  const isCompleted = isCustomRoutine ? false : isDayCompleted(dayNumber);

  // Dynamic estimated duration calculation
  const estimatedTime = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, ex) => {
      const sets = ex.prescription?.sets || ex.sets || 3;
      const rest = ex.prescription?.rest_seconds || ex.rest_seconds || 60;
      const timePerSet = 45 + rest;
      return acc + Math.round((sets * timePerSet) / 60);
    }, 5);
  }, [data]);

  // Dynamic Muscle Distribution Calculation using real exercise DB
  const muscleDistribution = useMemo(() => {
    if (!data || data.length === 0) return [];
    const muscleScores: Record<string, number> = {};

    data.forEach((ex) => {
      const matchedDbEx = allExercises.find(
        (item) => item.name.toLowerCase() === ex.name?.toLowerCase() || item.id === ex.id
      );
      const primary = matchedDbEx?.primaryMuscle || ex.muscle || 'Full Body';
      const secondaries = matchedDbEx?.secondaryMuscles || [];

      muscleScores[primary] = (muscleScores[primary] || 0) + 3;
      secondaries.forEach((sec) => {
        muscleScores[sec] = (muscleScores[sec] || 0) + 1;
      });
    });

    const totalScore = Object.values(muscleScores).reduce((a, b) => a + b, 0);
    if (totalScore === 0) return [];

    return Object.entries(muscleScores)
      .map(([muscle, score]) => ({
        muscle,
        percentage: Math.round((score / totalScore) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [data]);

  // Dynamic Muscle Heatmap Data for the Body Highlighter - ONLY direct targeted muscles for this day
  const workoutHeatmapData = useMemo<MuscleHeatmapEntry[]>(() => {
    if (!data || data.length === 0) return [];
    const muscleMap: Record<string, { totalSets: number; totalVolume: number }> = {};

    data.forEach((ex) => {
      const stripped = ex.id ? ex.id.replace(/^p30_d\d+_ex\d+_/, '').replace(/_/g, '/') : '';
      const matched =
        (ex.id && EXERCISE_DATABASE[ex.id]) ||
        (stripped && EXERCISE_DATABASE[stripped]) ||
        Object.values(EXERCISE_DATABASE).find(
          (item) => item.name.toLowerCase() === (ex.name || '').toLowerCase()
        ) ||
        allExercises.find(
          (item) => item.name.toLowerCase() === (ex.name || '').toLowerCase() || item.id === ex.id
        );

      const primary = matched?.primaryMuscle || ex.muscle;
      if (!primary || primary === 'Full Body') return;

      const sets = ex.prescription?.sets || ex.sets || 3;
      const weight = ex.prescription?.weightKg || 0;
      const reps = parseInt(ex.prescription?.target_reps || ex.repRange || '10', 10) || 10;
      const vol = sets * (weight > 0 ? weight : 20) * reps;

      if (!muscleMap[primary]) {
        muscleMap[primary] = { totalSets: 0, totalVolume: 0 };
      }
      muscleMap[primary].totalSets += sets;
      muscleMap[primary].totalVolume += vol;
    });

    const maxSets = Math.max(...Object.values(muscleMap).map((m) => m.totalSets), 1);

    return Object.entries(muscleMap).map(([muscle, stats]) => ({
      muscle,
      totalSets: stats.totalSets,
      totalVolume: stats.totalVolume,
      workoutCount: 1,
      intensity: 100, // Clean direct highlight for the targeted muscles of the day
      percentOfTotal: 100,
      lastTrainedDate: 'Targeted in this workout',
    }));
  }, [data]);

  const handleStartWorkout = () => {
    router.push(`/workout/${id}` as any);
  };

  // Delete Exercise Logic
  const handleDeleteExercise = (exId: string, exName: string) => {
    const updated = data.filter((item) => item.id !== exId && item.name !== exName);
    setData(updated);
    saveUpdatedExercises(updated);
    if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Swap Exercise Logic
  const handleOpenSwapModal = (exercise: any) => {
    setExerciseToSwap(exercise);
    setSearchQuery('');
    setSwapModalVisible(true);
  };

  const handleSelectSwapExercise = (newDbEx: Exercise) => {
    if (!exerciseToSwap) return;
    const updated = data.map((item) => {
      if (item.id === exerciseToSwap.id || item.name === exerciseToSwap.name) {
        return {
          ...item,
          id: newDbEx.id,
          name: newDbEx.name,
          equipment: newDbEx.equipment,
          muscle: newDbEx.primaryMuscle,
          prescription: {
            ...item.prescription,
            sets: item.prescription?.sets || 3,
            target_reps: item.prescription?.target_reps || '10',
          },
        };
      }
      return item;
    });

    setData(updated);
    saveUpdatedExercises(updated);
    setSwapModalVisible(false);
    setExerciseToSwap(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Add Exercise Logic
  const [selectedModalExercises, setSelectedModalExercises] = useState<Exercise[]>([]);

  const toggleModalExerciseSelection = useCallback((exercise: Exercise) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedModalExercises((prev) => {
      const isSelected = prev.some((ex) => ex.id === exercise.id);
      if (isSelected) {
        return prev.filter((ex) => ex.id !== exercise.id);
      }
      return [...prev, exercise];
    });
  }, []);

  const handleBatchAddExercises = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newItems = selectedModalExercises.map(newDbEx => ({
      id: `${newDbEx.id}_${Date.now()}_${Math.random()}`,
      name: newDbEx.name,
      equipment: newDbEx.equipment,
      muscle: newDbEx.primaryMuscle,
      isCompound: newDbEx.isCompound,
      sets: 3,
      repRange: '10-12',
      rest_seconds: 60,
      calories: 45,
      duration: 8,
      animation_url: null,
      thumbnail_url: null,
      prescription: {
        sets: 3,
        repsTarget: 10,
        target_reps: '10',
        weightKg: 0,
        progressionNote: 'Standard set',
      },
    }));

    const updated = [...data, ...newItems];
    setData(updated);
    saveUpdatedExercises(updated);
    setSelectedModalExercises([]);
    setAddModalVisible(false);
    if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [selectedModalExercises, data, saveUpdatedExercises]);



  const filteredExercisesForModal = useMemo(() => {
    let pool = [...allExercises];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.primaryMuscle.toLowerCase().includes(q) ||
          e.equipment.toLowerCase().includes(q)
      );
    }
    if (addBrowseMode === 'muscle' && addSelectedMuscle) {
      pool = pool.filter((e) => e.primaryMuscle === addSelectedMuscle);
    }
    if (addBrowseMode === 'equipment' && addSelectedEquipment) {
      pool = pool.filter((e) => e.equipment === addSelectedEquipment);
    }
    return pool.sort((a, b) => compareAlphaFirst(a.name, b.name));
  }, [searchQuery, addBrowseMode, addSelectedMuscle, addSelectedEquipment]);

  const addSections = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    filteredExercisesForModal.forEach((ex) => {
      const letter = ex.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(ex);
    });
    return Object.keys(groups).sort((a, b) => compareAlphaFirst(a, b)).map((letter) => ({ title: letter, data: groups[letter] }));
  }, [filteredExercisesForModal]);

  const iosFont = Platform.select({
    ios: 'System',
    web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "San Francisco", sans-serif',
    default: 'System',
  });

  if (!workoutDay && !isCustomRoutine) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerNavRow}>
        <Pressable onPress={() => router.back()} style={styles.navIconBtn}>
          <ChevronLeft size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { fontFamily: iosFont }]}>Workout Day not found.</Text>
      </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Compact Side-by-Side Target Muscles Body Highlighter */}
      {workoutHeatmapData.length > 0 && (
        <View style={styles.heatmapWrapper}>
          <WorkoutMuscleHighlighter data={workoutHeatmapData} />
        </View>
      )}

      {/* Exercises Header Section */}
      <View style={styles.exercisesHeaderRow}>
        <Text style={[styles.sectionHeaderTitle, { fontFamily: iosFont }]}>
          {data.length} Exercises
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {!isCustomRoutine && (
            <Pressable
              style={styles.regenerateHeaderBtn}
              onPress={handleRegenerateThisDay}
              disabled={isRegenerating}
            >
              <RotateCw size={13} color="#4080E7" style={isRegenerating ? { opacity: 0.4 } : {}} />
              <Text style={[styles.regenerateHeaderBtnText, { fontFamily: iosFont }]}>
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              setSearchQuery('');
              setSelectedModalExercises([]);
              setAddModalVisible(true);
            }}
          >
            <Plus size={18} color="#8E8E93" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item: ex, drag, isActive }: any) => {
    const strippedId = ex.id ? ex.id.replace(/^p30_d\d+_ex\d+_/, '').replace(/_/g, '/') : '';
    const mediaUrl =
      ex.gifUrl ||
      ex.animation_url ||
      ex.thumbnail_url ||
      (ex.id && EXERCISE_DATABASE[ex.id]?.gifUrl) ||
      (strippedId && EXERCISE_DATABASE[strippedId]?.gifUrl) ||
      (ex.name && Object.values(EXERCISE_DATABASE).find((i) => i.name.toLowerCase() === ex.name.toLowerCase())?.gifUrl) ||
      ExerciseMediaDB[ex.name];
    const sets = ex.prescription?.sets || ex.sets || 3;
    const reps = ex.prescription?.target_reps || ex.prescription?.repsTarget || ex.repRange || '10';

    return (
      <ScaleDecorator>
        <SwipeableExerciseRow
          onDelete={() => handleDeleteExercise(ex.id, ex.name)}
          disabled={isActive}
          fontFamily={iosFont}
        >
          <Pressable
            onPress={() => setDetailExercise({ name: ex.name, id: ex.id })}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              drag();
            }}
            delayLongPress={180}
            disabled={isActive}
            style={[styles.exerciseCardItem, isActive && styles.activeExerciseCardItem]}
          >
            {/* White Circular Background Thumbnail */}
            <View style={styles.exerciseImageWrapper}>
              {mediaUrl ? (
                <ExpoImage
                  source={{ uri: mediaUrl }}
                  style={styles.exImage}
                  contentFit="contain"
                  autoplay={false}
                  cachePolicy="memory-disk"
                />
              ) : (
                <Dumbbell size={20} color="#38B6FF" />
              )}
            </View>

            {/* Info */}
            <View style={styles.exerciseInfoCol}>
              <Text style={[styles.prescriptionText, { fontFamily: iosFont }]}>
                {sets} sets × {reps} reps
              </Text>
              <Text style={[styles.exTitleText, { fontFamily: iosFont }]} numberOfLines={1}>
                {toTitleCase(ex.name)}
              </Text>
            </View>
          </Pressable>
        </SwipeableExerciseRow>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Navigation Top Bar with QUEST INFO in center */}
      <View style={styles.headerNavRow}>
        <Pressable onPress={() => router.back()} style={styles.navIconBtn} accessibilityLabel="Back">
          <ChevronLeft size={22} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTopTitle, { fontFamily: iosFont }]} numberOfLines={1}>
            QUEST INFO
          </Text>
        </View>

        {!isCustomRoutine ? (
          <Pressable
            onPress={handleRegenerateThisDay}
            style={styles.navIconBtn}
            accessibilityLabel="Regenerate Workout"
            disabled={isRegenerating}
          >
            <RotateCw size={19} color="#4080E7" style={isRegenerating ? { opacity: 0.4 } : {}} />
          </Pressable>
        ) : (
          <View style={styles.headerRightSpacer} />
        )}
      </View>

      {/* Main Content List */}
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={data}
          onDragEnd={({ data: newData }) => {
            setData(newData);
            saveUpdatedExercises(newData);
            if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          keyExtractor={(item, index) => item.id || `ex-${index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyListWrapper}>
              <Dumbbell size={36} color="rgba(255, 255, 255, 0.2)" />
              <Text style={[styles.emptyListTitle, { fontFamily: iosFont }]}>
                No exercises added yet
              </Text>
              <Text style={[styles.emptyListSub, { fontFamily: iosFont }]}>
                Add exercises to start tracking your sets and reps
              </Text>
              <Pressable
                style={styles.emptyAddButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedModalExercises([]);
                  setAddModalVisible(true);
                }}
              >
                <Plus size={16} color="#000000" />
                <Text style={[styles.emptyAddButtonText, { fontFamily: iosFont }]}>
                  ADD EXERCISES
                </Text>
              </Pressable>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 80 },
          ]}
          containerStyle={{ flex: 1 }}
        />
      </View>

      {/* Sticky Bottom Start Workout Bar */}
      <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.startWorkoutButton} onPress={handleStartWorkout}>
          <Play size={16} color="#000000" fill="#000000" />
          <Text style={[styles.startWorkoutText, { fontFamily: iosFont }]}>
            {data.length === 0 ? 'Add Exercises to Start' : isCompleted ? 'Restart Workout' : 'Start Workout'}
          </Text>
        </Pressable>
      </View>

      {/* ─── SWAP EXERCISE MODAL ────────────────────────────────────── */}
      <Modal visible={swapModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { fontFamily: iosFont }]}>Replace Exercise</Text>
                {exerciseToSwap && (
                  <Text style={[styles.modalSubtitle, { fontFamily: iosFont }]}>
                    Replacing: {exerciseToSwap.name}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => setSwapModalVisible(false)} style={styles.closeModalBtn}>
                <X size={20} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Search Input */}
            <View style={styles.searchBox}>
              <Search size={18} color="#8E95A5" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercise database..."
                placeholderTextColor="#64748B"
                style={[styles.searchInput, { fontFamily: iosFont }]}
              />
            </View>

            {/* Exercise Database List */}
            <FlatList
              data={filteredExercisesForModal}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const thumbUri = item.thumbnailUrl || item.gifUrl || ExerciseMediaDB[item.name];

                return (
                  <Pressable
                    style={styles.modalExItem}
                    onPress={() => handleSelectSwapExercise(item)}
                  >
                    <View style={styles.modalExThumb}>
                      {thumbUri ? (
                        <ExpoImage
                          source={{ uri: thumbUri }}
                          style={styles.modalThumbImage}
                          contentFit="contain"
                          autoplay={false}
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <Dumbbell size={18} color="#38B6FF" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalExTitle, { fontFamily: iosFont }]}>{item.name}</Text>
                      <Text style={[styles.modalExMeta, { fontFamily: iosFont }]}>
                        {item.primaryMuscle} • {item.equipment}
                      </Text>
                    </View>
                    <ArrowLeftRight size={18} color="#38B6FF" />
                  </Pressable>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* ─── ADD EXERCISE MODAL ─────────────────────────────────────── */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontFamily: iosFont }]}>Add Exercise</Text>
              {selectedModalExercises.length > 0 ? (
                <Pressable onPress={handleBatchAddExercises} style={styles.headerAddBtn}>
                  <Text style={styles.headerAddBtnText}>Add ({selectedModalExercises.length})</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => { setAddModalVisible(false); setAddBrowseMode('all'); setAddSelectedMuscle(null); setAddSelectedEquipment(null); }} style={styles.closeModalBtn}>
                  <X size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            <View style={styles.searchBox}>
              <Search size={18} color="#8E95A5" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercise to add..."
                placeholderTextColor="#64748B"
                style={[styles.searchInput, { fontFamily: iosFont }]}
              />
            </View>

            {/* Browse Mode Tabs */}
            <View style={styles.addBrowseTabs}>
              {(['all', 'muscle', 'equipment'] as AddBrowseMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  style={[styles.addBrowseTab, addBrowseMode === mode && styles.addBrowseTabActive]}
                  onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAddBrowseMode(mode); setAddSelectedMuscle(null); setAddSelectedEquipment(null); }}
                >
                  <Text style={[styles.addBrowseTabText, addBrowseMode === mode && styles.addBrowseTabTextActive]}>
                    {mode === 'all' ? 'All' : mode === 'muscle' ? 'Muscle' : 'Equipment'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Filter Chips */}
            {addBrowseMode === 'muscle' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addFilterChipsScroll} style={styles.addFilterChipsContainer}>
                {ADD_MUSCLE_FILTERS.map((muscle) => (
                  <Pressable key={muscle} style={[styles.addFilterChip, addSelectedMuscle === muscle && styles.addFilterChipActive]} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAddSelectedMuscle((prev) => prev === muscle ? null : muscle); }}>
                    <Text style={[styles.addFilterChipText, addSelectedMuscle === muscle && styles.addFilterChipTextActive]}>{muscle}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {addBrowseMode === 'equipment' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addFilterChipsScroll} style={styles.addFilterChipsContainer}>
                {ADD_EQUIPMENT_FILTERS.map((eq) => (
                  <Pressable key={eq} style={[styles.addFilterChip, addSelectedEquipment === eq && styles.addFilterChipActive]} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAddSelectedEquipment((prev) => prev === eq ? null : eq); }}>
                    <Text style={[styles.addFilterChipText, addSelectedEquipment === eq && styles.addFilterChipTextActive]}>{eq}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Result count */}
            {(addSelectedMuscle || addSelectedEquipment) && (
              <View style={styles.addResultRow}>
                <Text style={styles.addResultCount}>{filteredExercisesForModal.length} exercises</Text>
              </View>
            )}

            {/* SectionList */}
            <SectionList
              sections={addSections}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={11}
              renderSectionHeader={({ section }) => (
                <View style={styles.addSectionHeaderRow}>
                  <Text style={styles.addSectionHeaderLetter}>{section.title}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelected = selectedModalExercises.some((ex) => ex.id === item.id);
                const thumbUri = item.thumbnailUrl || item.gifUrl || ExerciseMediaDB[item.name];

                return (
                  <Pressable
                    style={[styles.modalExItem, isSelected && styles.modalExItemSelected]}
                    onPress={() => toggleModalExerciseSelection(item)}
                  >
                    <Pressable
                      style={styles.modalExThumb}
                      onPress={(e) => {
                        e.stopPropagation();
                        setDetailExercise({ name: item.name, id: item.id });
                      }}
                      hitSlop={8}
                    >
                      {thumbUri ? (
                        <ExpoImage source={{ uri: thumbUri }} style={styles.modalThumbImage} contentFit="contain" autoplay={false} cachePolicy="memory-disk" />
                      ) : (
                        <Dumbbell size={18} color="#38B6FF" />
                      )}
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalExTitle, { fontFamily: iosFont }]}>{toTitleCase(item.name)}</Text>
                      <Text style={[styles.modalExMeta, { fontFamily: iosFont }]}>{item.primaryMuscle} • {item.equipment}</Text>
                    </View>
                    <View style={[styles.checkboxCircle, isSelected && styles.checkboxCircleSelected]}>
                      {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.addEmptyState}>
                  <Dumbbell size={40} color="rgba(255,255,255,0.15)" />
                  <Text style={styles.addEmptyText}>No exercises found</Text>
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* Exercise Detail Bottom Sheet Modal */}
      <ExerciseInstructionModal
        visible={!!detailExercise}
        exerciseName={detailExercise?.name || ''}
        exerciseId={detailExercise?.id}
        onClose={() => setDetailExercise(null)}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTopTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  questInfoHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  questHeroSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9E9EA4',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  questGoalsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00E676',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 36,
  },
  headerSection: {
    marginBottom: 4,
  },
  heatmapWrapper: {
    marginBottom: 16,
  },
  mainTitle: {
    ...typography.h1,
    marginBottom: 6,
  },
  subtitleText: {
    ...typography.body,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    ...typography.h2,
    marginBottom: 8,
  },
  muscleScrollContent: {
    paddingRight: 20,
    marginBottom: 28,
  },
  muscleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    minWidth: 145,
  },
  muscleThumbBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#141416',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  muscleTextCol: {
    flex: 1,
  },
  muscleName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  musclePercent: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyMuscleCard: {
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    marginBottom: 28,
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  regenerateHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
  },
  regenerateHeaderBtnText: {
    color: '#4080E7',
    fontSize: 12,
    fontWeight: '600',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeRowWrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
    borderRadius: 14,
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    width: 68,
    height: '88%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingVertical: 6,
  },
  activeExerciseCardItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingHorizontal: 8,
  },
  exerciseImageWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
    padding: 3,
  },
  exImage: {
    width: '100%',
    height: '100%',
  },
  exerciseInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  prescriptionText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 3,
  },
  exTitleText: {
    ...typography.body,
    color: '#FFFFFF',
  },
  swapActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  startWorkoutButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  startWorkoutText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#38B6FF',
    marginTop: 2,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalExItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  modalExItemSelected: {
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    borderColor: 'rgba(64, 128, 231, 0.3)',
    borderWidth: 1,
    marginHorizontal: -1,
    marginVertical: -1,
  },
  modalExThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 3,
  },
  modalThumbImage: {
    width: '100%',
    height: '100%',
  },
  modalExTitle: {
    ...typography.body,
    color: '#FFFFFF',
  },
  modalExMeta: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },

  // ─── Add Exercise Modal: Browse Tabs ─────────────────────────
  addBrowseTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  addBrowseTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addBrowseTabActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderColor: '#4080E7',
  },
  addBrowseTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  addBrowseTabTextActive: {
    color: '#4080E7',
  },

  // ─── Add Exercise Modal: Filter Chips ────────────────────────
  addFilterChipsContainer: {
    marginBottom: 8,
  },
  addFilterChipsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  addFilterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addFilterChipActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.18)',
    borderColor: '#4080E7',
  },
  addFilterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  addFilterChipTextActive: {
    color: '#4080E7',
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxCircleSelected: {
    backgroundColor: '#4080E7',
    borderColor: '#4080E7',
  },
  headerAddBtn: {
    backgroundColor: '#4080E7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAddBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // ─── Add Exercise Modal: Result Count ────────────────────────
  addResultRow: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  addResultCount: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
  },

  // ─── Add Exercise Modal: List with A-Z ───────────────────────
  addListWithIndex: {
    flex: 1,
    flexDirection: 'row',
  },
  addSectionHeaderRow: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  addSectionHeaderLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4080E7',
    letterSpacing: 0.5,
  },

  // ─── Add Exercise Modal: A-Z Index ───────────────────────────
  addAlphabetIndex: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 2,
  },
  addAlphabetBtn: {
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAlphabetLetter: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.15)',
  },
  addAlphabetLetterActive: {
    color: '#4080E7',
  },

  // ─── Add Exercise Modal: Empty State ─────────────────────────
  addEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  addEmptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 12,
  },
  // ─── Quest Info Empty List State ───────────────────────────────
  emptyListWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#171A24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 8,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyListSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E95A5',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38B6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  emptyAddButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.8,
  },
});
