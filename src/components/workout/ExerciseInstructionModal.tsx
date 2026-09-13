import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pencil, ShieldCheck, Trophy } from 'lucide-react-native';
import { EXERCISE_DATABASE, ExerciseItem } from '../../data/exercises/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, toTitleCase } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

interface ExerciseInstructionModalProps {
  visible: boolean;
  exerciseName: string;
  exerciseId?: string;
  onClose: () => void;
}

export default function ExerciseInstructionModal({
  visible,
  exerciseName,
  exerciseId,
  onClose,
}: ExerciseInstructionModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'INSTRUCTIONS' | 'RECORDS'>('INSTRUCTIONS');
  const [userNote, setUserNote] = useState('');
  const [exerciseData, setExerciseData] = useState<ExerciseItem | null>(null);

  // Look up real exercise data from EXERCISE_DATABASE by ID or name
  useEffect(() => {
    if (!visible) return;

    let found: ExerciseItem | undefined;
    if (exerciseId) {
      // 1. Direct ID lookup
      if (EXERCISE_DATABASE[exerciseId]) {
        found = EXERCISE_DATABASE[exerciseId];
      }
      // 2. Strip prefix e.g. p30_d1_ex0_pectorals_barbell-bench-press
      const stripped = exerciseId.replace(/^p30_d\d+_ex\d+_/, '');
      if (!found && EXERCISE_DATABASE[stripped]) {
        found = EXERCISE_DATABASE[stripped];
      }
      // 3. Replace underscore with slash
      const slashed = stripped.replace(/_/g, '/');
      if (!found && EXERCISE_DATABASE[slashed]) {
        found = EXERCISE_DATABASE[slashed];
      }
      // 4. Look up in values by slug or name
      if (!found) {
        found = Object.values(EXERCISE_DATABASE).find(
          (ex) =>
            ex.id.endsWith(stripped) ||
            ex.id.endsWith(slashed) ||
            ex.name.toLowerCase() === stripped.toLowerCase() ||
            ex.name.toLowerCase() === (exerciseName || '').toLowerCase()
        );
      }
    }

    if (!found && exerciseName) {
      found = Object.values(EXERCISE_DATABASE).find(
        (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase()
      );
    }

    if (found) {
      setExerciseData(found);
    } else {
      // Fallback object matching real data structure with live CDN gif
      setExerciseData({
        id: exerciseId || 'exercise',
        name: exerciseName || 'Exercise Technique',
        description: 'Standard strength movement for overall development.',
        primaryMuscle: 'Full Body',
        secondaryMuscles: [],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        movementPattern: 'Push',
        bodyRegion: 'Upper Body',
        isCompound: true,
        gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-curl.gif',
        thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-curl.gif',
        instructions: [
          'Stand with feet shoulder-width apart and brace your core.',
          'Lower under control keeping chest elevated.',
          'Drive back up to starting position.',
        ],
        formTips: ['Keep spine neutral and control the movement.'],
        commonMistakes: ['Rushing the movement', 'Losing core brace'],
        safetyTips: ['Warm up thoroughly before working sets.'],
        setsRepsRecommendation: '3 SETS × 8 - 12 REPS',
      });
    }

    // Load saved note for this exercise
    loadNote(exerciseId || exerciseName);
  }, [visible, exerciseName, exerciseId]);

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
      await AsyncStorage.setItem(`@exercise_note_${exerciseId || exerciseName}`, text);
    } catch (e) {
      console.error('Failed to save note', e);
    }
  };

  if (!exerciseData) return null;

  // Split instructions into preparation (step 1) and execution steps (steps 2+)
  const prepText = exerciseData.instructions[0] || 'Position yourself correctly with proper posture.';
  const executionSteps = exerciseData.instructions.slice(1).length > 0
    ? exerciseData.instructions.slice(1)
    : [
        'Perform the motion smoothly under full muscular control.',
        'Squeeze target muscles at peak contraction.',
        'Lower back to starting position under tension.',
      ];

  const focusAreaText = [
    exerciseData.primaryMuscle,
    ...(exerciseData.secondaryMuscles || []),
  ].join(', ');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.dragHandle} />

          {/* Top Tabs Bar */}
          <View style={styles.tabsHeader}>
            <Pressable
              onPress={() => setActiveTab('INSTRUCTIONS')}
              style={styles.tabBtn}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'INSTRUCTIONS' && styles.tabTextActive,
                ]}
              >
                INSTRUCTIONS
              </Text>
              {activeTab === 'INSTRUCTIONS' && <View style={styles.tabIndicator} />}
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('RECORDS')}
              style={styles.tabBtn}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'RECORDS' && styles.tabTextActive,
                ]}
              >
                RECORDS
              </Text>
              {activeTab === 'RECORDS' && <View style={styles.tabIndicator} />}
            </Pressable>
          </View>

          {/* Content Area */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
          >
            {activeTab === 'INSTRUCTIONS' ? (
              <>
                {/* Exercise GIF Media Card */}
                <View style={styles.mediaCard}>
                  <ExpoImage
                    source={{ uri: exerciseData.gifUrl }}
                    style={styles.gifImage}
                    contentFit="contain"
                    autoplay={true}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.playIconCircle}>
                    <Play size={16} color={ACCENT_BLUE} />
                  </View>
                </View>

                {/* Exercise Title */}
                <Text style={styles.exerciseTitle}>{toTitleCase(exerciseData.name)}</Text>

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
                  <Text style={styles.metaValue}>{exerciseData.equipment}</Text>
                </View>

                <View style={styles.divider} />

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

                {/* Key Tips Section */}
                {exerciseData.formTips && exerciseData.formTips.length > 0 && (
                  <>
                    <Text style={styles.sectionHeader}>KEY TIPS</Text>
                    {exerciseData.formTips.map((tip, idx) => (
                      <View key={idx} style={styles.tipRow}>
                        <ShieldCheck size={16} color="#38B6FF" style={{ marginTop: 2 }} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            ) : (
              /* Records Tab Content */
              <View style={styles.recordsContainer}>
                <Trophy size={48} color="#38B6FF" style={{ alignSelf: 'center', marginBottom: 12 }} />
                <Text style={styles.recordsTitle}>PERSONAL RECORDS</Text>
                <Text style={styles.recordsSub}>
                  Log your sets in workouts to track weight & volume progression for {exerciseData.name}.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Fixed Bottom Done Button */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Pressable style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>DONE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161820',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 12,
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
    fontWeight: 'bold',
    fontSize: 14,
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
    backgroundColor: '#3B59FF',
    borderRadius: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  mediaCard: {
    width: '100%',
    height: 200,
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
  playIconCircle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#38B6FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseTitle: {
    ...typography.body,
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
    fontWeight: 'normal',
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#7E8597',
    width: 110,
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
    fontWeight: 'bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 10,
  },
  sectionParagraph: {
    fontWeight: 'normal',
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
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF',
    width: 14,
  },
  stepText: {
    fontWeight: 'normal',
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
    fontWeight: 'normal',
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
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 8,
  },
  recordsSub: {
    fontWeight: 'normal',
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
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3B59FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B59FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
