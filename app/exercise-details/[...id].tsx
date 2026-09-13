import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Play,
  Pencil,
  ShieldCheck,
  Trophy,
  AlertTriangle,
  ShieldAlert,
  Share2,
  Info,
} from 'lucide-react-native';
import { EXERCISE_DATABASE, ExerciseItem } from '../../src/data/exercises/database';
import { allExercises, Exercise } from '../../src/data/exercises';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, toTitleCase } from '../../src/styles/typography';

const ACCENT_BLUE = '#4080E7';

export default function ExerciseDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id.join('/') : (params.id || '');

  const [activeTab, setActiveTab] = useState<'INSTRUCTIONS' | 'RECORDS'>('INSTRUCTIONS');
  const [userNote, setUserNote] = useState('');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    // 1. Try finding in allExercises by ID, slug, or name
    let found = allExercises.find(
      (e) =>
        e.id === id ||
        e.id.toLowerCase() === id.toLowerCase() ||
        e.name.toLowerCase() === id.toLowerCase() ||
        e.id.endsWith(`/${id}`)
    );

    // 2. Try finding direct in EXERCISE_DATABASE
    if (!found && EXERCISE_DATABASE[id]) {
      const exItem = EXERCISE_DATABASE[id];
      found = {
        id: exItem.id,
        name: exItem.name,
        description: exItem.description,
        primaryMuscle: exItem.primaryMuscle,
        secondaryMuscles: exItem.secondaryMuscles,
        equipment: exItem.equipment,
        difficulty: exItem.difficulty,
        category: exItem.category,
        movementPattern: exItem.movementPattern,
        bodyRegion: exItem.bodyRegion,
        isCompound: exItem.isCompound,
        isUnilateral: false,
        instructions: exItem.instructions,
        commonMistakes: exItem.commonMistakes || [],
        formTips: exItem.formTips || [],
        safetyTips: exItem.safetyTips || [],
        setsRepsRecommendation: exItem.setsRepsRecommendation || '3 SETS × 8 - 12 REPS',
        exerciseTags: [exItem.primaryMuscle, exItem.equipment],
        gifUrl: exItem.gifUrl,
        thumbnailUrl: exItem.thumbnailUrl,
      };
    }

    setExercise(found || null);
    setIsLoading(false);
    loadNote(id);
  }, [id]);

  const loadNote = async (keyId: string) => {
    try {
      const saved = await AsyncStorage.getItem(`@exercise_note_${keyId}`);
      if (saved) setUserNote(saved);
    } catch {
      setUserNote('');
    }
  };

  const saveNote = async (text: string) => {
    setUserNote(text);
    try {
      if (id) await AsyncStorage.setItem(`@exercise_note_${id}`, text);
    } catch (e) {
      console.error('Failed to save note', e);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/exercises');
    }
  };

  const handleShare = async () => {
    if (!exercise) return;
    try {
      await Share.share({
        title: exercise.name,
        message: `Check out ${exercise.name} on Arise Workout!`,
      });
    } catch {
      // Ignored
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_BLUE} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.notFoundContainer}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable style={styles.backTopBtn} onPress={handleBack}>
            <ChevronLeft size={20} color="#FFFFFF" />
            <Text style={styles.backTopBtnText}>BACK TO EXERCISES</Text>
          </Pressable>
          <View style={styles.notFoundCard}>
            <Info size={44} color="rgba(255, 255, 255, 0.4)" />
            <Text style={styles.notFoundTitle}>Exercise Not Found</Text>
            <Text style={styles.notFoundSub}>The selected exercise could not be loaded.</Text>
            <Pressable style={styles.doneBtn} onPress={handleBack}>
              <Text style={styles.doneBtnText}>BACK TO EXERCISES</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const prepText = exercise.instructions[0] || 'Position yourself correctly with proper form.';
  const executionSteps =
    exercise.instructions.slice(1).length > 0
      ? exercise.instructions.slice(1)
      : [
          'Perform the movement smoothly under full control.',
          'Squeeze target muscles at peak contraction.',
          'Lower back to starting position under tension.',
        ];

  const focusAreaText = [exercise.primaryMuscle, ...(exercise.secondaryMuscles || [])].join(', ');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Navigation Bar */}
        <View style={styles.navHeaderRow}>
          <Pressable style={styles.navBackBtn} onPress={handleBack} accessibilityRole="button">
            <ChevronLeft size={20} color="#FFFFFF" />
            <Text style={styles.navBackBtnText}>BACK TO EXERCISES</Text>
          </Pressable>

          <Pressable style={styles.shareBtn} onPress={handleShare} accessibilityRole="button">
            <Share2 size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Top Tabs Bar (Instructions / Records) */}
        <View style={styles.tabsHeader}>
          <Pressable onPress={() => setActiveTab('INSTRUCTIONS')} style={styles.tabBtn}>
            <Text style={[styles.tabText, activeTab === 'INSTRUCTIONS' && styles.tabTextActive]}>
              INSTRUCTIONS
            </Text>
            {activeTab === 'INSTRUCTIONS' && <View style={styles.tabIndicator} />}
          </Pressable>

          <Pressable onPress={() => setActiveTab('RECORDS')} style={styles.tabBtn}>
            <Text style={[styles.tabText, activeTab === 'RECORDS' && styles.tabTextActive]}>
              RECORDS
            </Text>
            {activeTab === 'RECORDS' && <View style={styles.tabIndicator} />}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 80 },
          ]}
        >
          {activeTab === 'INSTRUCTIONS' ? (
            <>
              {/* Exercise GIF Media Card */}
              <View style={styles.mediaCard}>
                {exercise.gifUrl ? (
                  <Image
                    source={{ uri: exercise.gifUrl }}
                    style={styles.gifImage}
                    contentFit="contain"
                    autoplay={true}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={styles.gifFallback}>
                    <Trophy size={48} color={ACCENT_BLUE} />
                  </View>
                )}
                <View style={styles.playIconCircle}>
                  <Play size={16} color={ACCENT_BLUE} />
                </View>
              </View>

              {/* Exercise Title */}
              <Text style={styles.exerciseTitle}>{toTitleCase(exercise.name)}</Text>

              {/* Add Note Pill Input */}
              <View style={styles.noteBox}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add note"
                  placeholderTextColor="#7E8597"
                  value={userNote}
                  onChangeText={saveNote}
                />
                <Pencil size={16} color="#7E8597" />
              </View>

              {/* Metadata Grid */}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>FOCUS AREA</Text>
                <Text style={styles.metaValue}>{focusAreaText}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>EQUIPMENT</Text>
                <Text style={styles.metaValue}>{exercise.equipment}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>DIFFICULTY</Text>
                <Text style={styles.metaValue}>{exercise.difficulty}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>RECOMMENDED</Text>
                <Text style={styles.metaValue}>{exercise.setsRepsRecommendation}</Text>
              </View>

              <View style={styles.divider} />

              {/* Overview Description */}
              {exercise.description && (
                <>
                  <Text style={styles.sectionHeader}>OVERVIEW</Text>
                  <Text style={styles.sectionParagraph}>{exercise.description}</Text>
                </>
              )}

              {/* Preparation Section */}
              <Text style={styles.sectionHeader}>PREPARATION</Text>
              <Text style={styles.sectionParagraph}>{prepText}</Text>

              {/* Execution Section */}
              <Text style={styles.sectionHeader}>EXECUTION</Text>
              <View style={styles.executionList}>
                {executionSteps.map((step, idx) => (
                  <View key={idx} style={styles.executionStepRow}>
                    <Text style={styles.stepNumber}>{idx + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Key Form Tips Section */}
              {exercise.formTips && exercise.formTips.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>KEY TIPS</Text>
                  {exercise.formTips.map((tip, idx) => (
                    <View key={idx} style={styles.tipRow}>
                      <ShieldCheck size={16} color={ACCENT_BLUE} style={{ marginTop: 2 }} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Common Mistakes Section */}
              {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                <>
                  <Text style={[styles.sectionHeader, { color: '#F59E0B' }]}>COMMON MISTAKES</Text>
                  {exercise.commonMistakes.map((mistake, idx) => (
                    <View key={idx} style={styles.tipRow}>
                      <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: 2 }} />
                      <Text style={[styles.tipText, { color: '#FCE7F3' }]}>{mistake}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Safety Tips Section */}
              {exercise.safetyTips && exercise.safetyTips.length > 0 && (
                <>
                  <Text style={[styles.sectionHeader, { color: '#EF4444' }]}>SAFETY TIPS</Text>
                  {exercise.safetyTips.map((safety, idx) => (
                    <View key={idx} style={styles.tipRow}>
                      <ShieldAlert size={16} color="#EF4444" style={{ marginTop: 2 }} />
                      <Text style={styles.tipText}>{safety}</Text>
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            /* Records Tab Content */
            <View style={styles.recordsContainer}>
              <Trophy size={48} color={ACCENT_BLUE} style={{ alignSelf: 'center', marginBottom: 12 }} />
              <Text style={styles.recordsTitle}>PERSONAL RECORDS</Text>
              <Text style={styles.recordsSub}>
                Log your sets in workouts to track weight & volume progression for {toTitleCase(exercise.name)}.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable style={styles.doneBtn} onPress={handleBack}>
            <Text style={styles.doneBtnText}>BACK TO EXERCISES</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161820',
  },
  safeArea: {
    flex: 1,
  },
  navHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBackBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  shareBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#222532',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 20,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#656C7D',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 60,
    height: 3,
    backgroundColor: ACCENT_BLUE,
    borderRadius: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  mediaCard: {
    width: '100%',
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 18,
  },
  gifImage: {
    width: '90%',
    height: '90%',
  },
  gifFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E212B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconCircle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseTitle: {
    ...typography.h1,
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222532',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 18,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontWeight: '700',
    fontSize: 12,
    color: '#7E8597',
    width: 120,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontWeight: '600',
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 16,
  },
  sectionHeader: {
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionParagraph: {
    fontSize: 13,
    color: '#C0C5D2',
    lineHeight: 20,
    marginBottom: 14,
  },
  executionList: {
    gap: 12,
    marginBottom: 14,
  },
  executionStepRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF',
    width: 14,
  },
  stepText: {
    fontSize: 13,
    color: '#C0C5D2',
    flex: 1,
    lineHeight: 19,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#C0C5D2',
    flex: 1,
    lineHeight: 18,
  },
  recordsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  recordsTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 8,
  },
  recordsSub: {
    fontSize: 13,
    color: '#7E8597',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#161820',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  doneBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#161820',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#161820',
    paddingHorizontal: 16,
  },
  backTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  backTopBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  notFoundCard: {
    backgroundColor: '#1E212B',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  notFoundTitle: {
    ...typography.h2,
    marginTop: 12,
    marginBottom: 6,
  },
  notFoundSub: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 20,
  },
});
