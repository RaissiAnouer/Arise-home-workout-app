import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  SectionList,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Dumbbell, Check, Play, X, Search } from 'lucide-react-native';
import { typography } from '../../src/styles/typography';
import PrimaryButton from '../../src/components/PrimaryButton';
import Input from '../../src/components/Input';
import { allExercises, Exercise, ALL_MUSCLE_GROUPS, ALL_EQUIPMENT } from '../../src/data/exercises';
import { ExerciseMediaDB } from '../../src/data/exerciseMedia';
import FrontBodySVG from '../../src/components/reports/body/FrontBodySVG';
import BackBodySVG from '../../src/components/reports/body/BackBodySVG';
import ExerciseInstructionModal from '../../src/components/workout/ExerciseInstructionModal';
import { useCustomWorkouts } from '../../src/context/CustomWorkoutsContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ──────────────────────────────────────────────────────────

type BrowseMode = 'all' | 'muscle' | 'equipment';

// ─── Helpers ────────────────────────────────────────────────────────
function compareAlphaFirst(a: string, b: string): number {
  const isALetter = /^[a-zA-Z]/.test(a);
  const isBLetter = /^[a-zA-Z]/.test(b);
  if (isALetter && !isBLetter) return -1;
  if (!isALetter && isBLetter) return 1;
  return a.localeCompare(b);
}

// Filter out muscle groups & equipment that have no exercises
const MUSCLE_FILTERS = ALL_MUSCLE_GROUPS.filter((m) =>
  allExercises.some((ex) => ex.primaryMuscle === m)
);
const EQUIPMENT_FILTERS = ALL_EQUIPMENT.filter((eq) =>
  allExercises.some((ex) => ex.equipment === eq)
);

// ─── Helpers ────────────────────────────────────────────────────────
function MuscleBodyThumbnail({ muscle }: { muscle: string }) {
  const norm = (muscle || '').toLowerCase();
  const isBackMuscle = [
    'upper back', 'back', 'lats', 'traps', 'triceps', 'glutes', 'hamstrings', 'calves',
  ].some((m) => norm.includes(m));

  const heatmapData = [{
    muscle, intensity: 1.0, count: 1, volume: 100,
    totalSets: 1, totalVolume: 100, workoutCount: 1,
    lastTrainedDate: 'Today', percentOfTotal: 100,
  }];

  return (
    <View style={styles.modalThumb}>
      {isBackMuscle
        ? <BackBodySVG width={36} height={36} data={heatmapData} />
        : <FrontBodySVG width={36} height={36} data={heatmapData} />
      }
    </View>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function CustomWorkoutScreen() {
  const router = useRouter();
  const { customRoutines, saveRoutine, deleteRoutine } = useCustomWorkouts();
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailExercise, setSelectedDetailExercise] = useState<{ name: string; id?: string } | null>(null);
  const [selectedModalExercises, setSelectedModalExercises] = useState<Exercise[]>([]);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  // Browse filters
  const [browseMode, setBrowseMode] = useState<BrowseMode>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const sectionListRef = useRef<SectionList>(null);

  // ─── Filter + Group Logic ──────────────────────────────────────
  const filteredExercises = useMemo(() => {
    let pool = allExercises;

    // Apply text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.primaryMuscle.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (browseMode === 'muscle' && selectedMuscle) {
      pool = pool.filter((ex) => ex.primaryMuscle === selectedMuscle);
    }
    if (browseMode === 'equipment' && selectedEquipment) {
      pool = pool.filter((ex) => ex.equipment === selectedEquipment);
    }

    // Sort alphabetically with letters first, numbers last
    return [...pool].sort((a, b) => compareAlphaFirst(a.name, b.name));
  }, [searchQuery, browseMode, selectedMuscle, selectedEquipment]);

  // Group exercises into A–Z sections (letters first, numbers last)
  const sections = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    filteredExercises.forEach((ex) => {
      const letter = ex.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(ex);
    });
    return Object.keys(groups)
      .sort((a, b) => compareAlphaFirst(a, b))
      .map((letter) => ({ title: letter, data: groups[letter] }));
  }, [filteredExercises]);

  // ─── Handlers ──────────────────────────────────────────────────
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

  const commitBatchAddExercises = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newItems = selectedModalExercises.map((ex) => ({
      id: Date.now().toString() + Math.random().toString(),
      exerciseId: ex.id,
      name: ex.name,
      primaryMuscle: ex.primaryMuscle,
      equipment: ex.equipment,
      sets: 3,
      reps: 10,
    }));
    await saveRoutine(workoutTitle, newItems);
    setSelectedModalExercises([]);
    setWorkoutTitle('');
    setIsSearchModalOpen(false);
    setIsNameModalOpen(false);
  }, [selectedModalExercises, workoutTitle, saveRoutine]);

  const handleBatchAddExercises = useCallback(() => {
    if (!workoutTitle.trim()) {
      setIsNameModalOpen(true);
    } else {
      commitBatchAddExercises();
    }
  }, [workoutTitle, commitBatchAddExercises]);


  const handleRemoveRoutine = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    deleteRoutine(id);
  }, [deleteRoutine]);



  const handleBrowseModeChange = useCallback((mode: BrowseMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBrowseMode(mode);
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSearchQuery('');
  }, []);

  const handleSelectMuscle = useCallback((muscle: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedMuscle((prev) => (prev === muscle ? null : muscle));
  }, []);

  const handleSelectEquipment = useCallback((eq: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedEquipment((prev) => (prev === eq ? null : eq));
  }, []);

  const openModal = useCallback(() => {
    setSearchQuery('');
    setBrowseMode('all');
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSelectedModalExercises([]);
    setIsSearchModalOpen(true);
  }, []);

  // ─── Render Exercise Row (modal) ───────────────────────────────
  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => {
    const isSelected = selectedModalExercises.some((ex) => ex.id === item.id);
    const thumbUri = item.thumbnailUrl || item.gifUrl || ExerciseMediaDB[item.name];

    // Already added items could be visually distinct or just selected by default.
    // For now, let's treat selection separately from already added.
    return (
      <Pressable
        style={[styles.modalItem, isSelected && styles.modalItemSelected]}
        onPress={() => toggleModalExerciseSelection(item)}
      >
        <Pressable
          style={styles.modalThumb}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedDetailExercise({ name: item.name, id: item.id });
          }}
          hitSlop={8}
        >
          {thumbUri ? (
            <ExpoImage
              source={{ uri: thumbUri }}
              style={styles.modalThumbImage}
              contentFit="contain"
              autoplay={false}
              cachePolicy="memory-disk"
            />
          ) : (
            <Dumbbell size={20} color="#38B6FF" />
          )}
        </Pressable>
        <View style={styles.modalItemInfo}>
          <Text style={styles.modalItemName}>{item.name}</Text>
          <Text style={styles.modalItemMeta}>
            {item.primaryMuscle} • {item.equipment}
          </Text>
        </View>
        <View style={[styles.checkboxCircle, isSelected && styles.checkboxCircleSelected]}>
          {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
        </View>
      </Pressable>
    );
  }, [selectedModalExercises, toggleModalExerciseSelection]);


  // ─── Active filter label ───────────────────────────────────────
  const activeFilterLabel = browseMode === 'muscle' && selectedMuscle
    ? selectedMuscle
    : browseMode === 'equipment' && selectedEquipment
      ? selectedEquipment
      : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Custom Workout</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Custom Routines Library List */}
          {customRoutines.length > 0 && (
            <View style={styles.exerciseListContainer}>
              <Text style={styles.sectionTitle}>Your Routines ({customRoutines.length})</Text>
              {customRoutines.map((routine, index) => (
                <View key={routine.id} style={styles.exerciseRow}>
                  <Pressable
                    style={styles.exerciseInfo}
                    onPress={() => router.push(`/workout-details/${routine.id}` as any)}
                  >
                    <Text style={styles.exerciseIndex}>{index + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{routine.name}</Text>
                      <Text style={styles.exerciseMeta}>{routine.exercises.length} Workouts • Custom</Text>
                    </View>
                  </Pressable>

                  <View style={styles.counterGroup}>
                    <Pressable onPress={() => handleRemoveRoutine(routine.id)} style={styles.deleteBtn}>
                      <Trash2 size={18} color="#FF4D4D" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          <PrimaryButton
            title="Add Workout"
            icon={<Plus size={18} color="#000000" />}
            onPress={openModal}
          />

        </ScrollView>
      </SafeAreaView>

      {/* ─── Exercise Selection Modal ──────────────────────────────── */}
      <Modal visible={isSearchModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setIsSearchModalOpen(false)} style={styles.backBtn}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.headerTitle}>Select Workout</Text>
              {selectedModalExercises.length > 0 ? (
                <Pressable onPress={handleBatchAddExercises} style={styles.headerAddBtn}>
                  <Text style={styles.headerAddBtnText}>Add ({selectedModalExercises.length})</Text>
                </Pressable>
              ) : (
                <View style={{ width: 40 }} />
              )}
            </View>

            {/* Search Input */}
            <View style={styles.modalSearchPadding}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search workout..."
                leftIcon={<Search size={20} color="rgba(255,255,255,0.4)" />}
              />
            </View>

            {/* Browse Mode Tabs */}
            <View style={styles.browseTabs}>
              {(['all', 'muscle', 'equipment'] as BrowseMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  style={[styles.browseTab, browseMode === mode && styles.browseTabActive]}
                  onPress={() => handleBrowseModeChange(mode)}
                >
                  <Text style={[styles.browseTabText, browseMode === mode && styles.browseTabTextActive]}>
                    {mode === 'all' ? 'All' : mode === 'muscle' ? 'Muscle' : 'Equipment'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Filter Chips (muscle or equipment) */}
            {browseMode === 'muscle' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsScroll}
                style={styles.filterChipsContainer}
              >
                {MUSCLE_FILTERS.map((muscle) => (
                  <Pressable
                    key={muscle}
                    style={[styles.filterChip, selectedMuscle === muscle && styles.filterChipActive]}
                    onPress={() => handleSelectMuscle(muscle)}
                  >
                    <Text style={[styles.filterChipText, selectedMuscle === muscle && styles.filterChipTextActive]}>
                      {muscle}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {browseMode === 'equipment' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsScroll}
                style={styles.filterChipsContainer}
              >
                {EQUIPMENT_FILTERS.map((eq) => (
                  <Pressable
                    key={eq}
                    style={[styles.filterChip, selectedEquipment === eq && styles.filterChipActive]}
                    onPress={() => handleSelectEquipment(eq)}
                  >
                    <Text style={[styles.filterChipText, selectedEquipment === eq && styles.filterChipTextActive]}>
                      {eq}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Active filter badge */}
            {activeFilterLabel && (
              <View style={styles.activeFilterRow}>
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterText}>{activeFilterLabel}</Text>
                  <Pressable
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      if (browseMode === 'muscle') setSelectedMuscle(null);
                      else setSelectedEquipment(null);
                    }}
                    hitSlop={8}
                  >
                    <X size={14} color="#4080E7" />
                  </Pressable>
                </View>
                <Text style={styles.resultCount}>{filteredExercises.length} exercises</Text>
              </View>
            )}

            {/* Exercise List */}
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderExerciseItem}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderLetter}>{section.title}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalListContent}
              stickySectionHeadersEnabled={false}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={11}
              getItemLayout={undefined}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Dumbbell size={40} color="rgba(255,255,255,0.15)" />
                  <Text style={styles.emptyText}>No workouts found</Text>
                  <Text style={styles.emptySubText}>Try a different search or filter</Text>
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* ─── Name Routine Modal ────────────────────────────────────── */}
      <Modal visible={isNameModalOpen} animationType="fade" transparent>
        <View style={styles.nameModalOverlay}>
          <View style={styles.nameModalContainer}>
            <Text style={styles.nameModalTitle}>Name Your Routine</Text>
            <Text style={styles.nameModalSubtitle}>Give this custom routine a name before adding workouts.</Text>
            <Input
              value={workoutTitle}
              onChangeText={setWorkoutTitle}
              placeholder="e.g., Upper Body Power"
              style={styles.nameModalInput}
              autoFocus
            />
            <View style={styles.nameModalActions}>
              <Pressable style={styles.nameModalCancelBtn} onPress={() => setIsNameModalOpen(false)}>
                <Text style={styles.nameModalCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.nameModalSaveBtn, !workoutTitle.trim() && { opacity: 0.5 }]}
                onPress={() => {
                  if (workoutTitle.trim()) {
                    commitBatchAddExercises();
                  }
                }}
                disabled={!workoutTitle.trim()}
              >
                <Text style={styles.nameModalSaveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Detail Bottom Sheet Modal */}
      <ExerciseInstructionModal
        visible={!!selectedDetailExercise}
        exerciseName={selectedDetailExercise?.name || ''}
        exerciseId={selectedDetailExercise?.id}
        onClose={() => setSelectedDetailExercise(null)}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h1,
  },
  content: {
    padding: 16,
    gap: 16,
    marginTop: 10,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 15,
    marginBottom: 8,
    color: '#8E95A5',
  },
  exerciseListContainer: {
    gap: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121214',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  exerciseIndex: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#8E95A5',
    width: 18,
  },
  exerciseName: {
    fontWeight: '600',
    fontSize: 15,
    color: '#FFFFFF',
  },
  exerciseMeta: {
    fontWeight: '400',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  counterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  counterBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  counterBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  counterValue: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 2,
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4080E7',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  startWorkoutBtnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },

  // ─── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalSearchPadding: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },

  // ─── Browse Tabs ────────────────────────────────────────────────
  browseTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  browseTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  browseTabActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderColor: '#4080E7',
  },
  browseTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.3,
  },
  browseTabTextActive: {
    color: '#4080E7',
  },

  // ─── Filter Chips ──────────────────────────────────────────────
  filterChipsContainer: {
    marginBottom: 8,
  },
  filterChipsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.18)',
    borderColor: '#4080E7',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  filterChipTextActive: {
    color: '#4080E7',
  },

  // ─── Active Filter Badge ───────────────────────────────────────
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.25)',
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4080E7',
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
  },

  // ─── List with A-Z Index ───────────────────────────────────────
  listWithIndex: {
    flex: 1,
    flexDirection: 'row',
  },

  // ─── Section Headers ───────────────────────────────────────────
  sectionHeaderRow: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  sectionHeaderLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4080E7',
    letterSpacing: 0.5,
  },

  modalListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
    borderRadius: 12,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    borderColor: 'rgba(64, 128, 231, 0.3)',
    borderWidth: 1,
    // Negative margin to offset border and avoid jumping layout
    marginHorizontal: -1,
    marginVertical: -1,
  },
  modalThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 2,
  },
  modalThumbImage: {
    width: '100%',
    height: '100%',
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontWeight: '600',
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalItemMeta: {
    fontWeight: '400',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
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

  // ─── Header Add Button ───────────────────────────────────────
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

  // ─── Name Routine Modal ────────────────────────────────────────
  nameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  nameModalContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  nameModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  nameModalSubtitle: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 20,
  },
  nameModalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  nameModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  nameModalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  nameModalCancelBtnText: {
    color: '#AAAAAA',
    fontWeight: '600',
    fontSize: 14,
  },
  nameModalSaveBtn: {
    backgroundColor: '#4080E7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nameModalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // ─── A–Z Alphabet Index ────────────────────────────────────────
  alphabetIndex: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 2,
  },
  alphabetLetterBtn: {
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetLetter: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.15)',
    letterSpacing: 0.2,
  },
  alphabetLetterActive: {
    color: '#4080E7',
  },

  // ─── Empty State ───────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.2)',
    marginTop: 4,
  },
});
