import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import { ChevronUp, ChevronDown, Dumbbell, Check, Circle, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdaptiveExercise } from '../services/AdaptiveEngine';
import { useProgression } from '../context/ProgressionContext';
import ExerciseInstructionModal from './workout/ExerciseInstructionModal';
import SwipeableSetRow from './workout/SwipeableSetRow';
import SetTypePicker, { SetType, SET_TYPE_CONFIG } from './workout/SetTypePicker';
import { typography, toTitleCase } from '../styles/typography';
import { ExerciseMediaDB } from '../data/exerciseMedia';
import { EXERCISE_DATABASE } from '../data/exercises';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  isPR?: boolean;
  setType?: SetType;
}

interface ExerciseCardProps {
  exercise: AdaptiveExercise;
  dayId: number;
  planId: string;
  onSetChange?: (exerciseId: string, setIndex: number, sets: SetData[]) => void;
}

function computeNormalNumber(sets: SetData[], index: number): number {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    const t = sets[i].setType || 'normal';
    if (t === 'normal') count++;
  }
  return count;
}

export default function ExerciseCard({ exercise, dayId, planId, onSetChange }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [openSetId, setOpenSetId] = useState<string | null>(null);
  const [sets, setSets] = useState<SetData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [exerciseXpAwarded, setExerciseXpAwarded] = useState(false);
  const [showXpFlash, setShowXpFlash] = useState(false);
  const xpFlashOpacity = useRef(new Animated.Value(0)).current;

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSetIndex, setPickerSetIndex] = useState<number>(0);
  const [pickerAnchorY, setPickerAnchorY] = useState(0);
  const [pickerAnchorX, setPickerAnchorX] = useState(0);

  const { completeExercise, checkPersonalRecord } = useProgression();

  const textFont = Platform.select({
    ios: 'System',
    web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "San Francisco", sans-serif',
    default: 'System',
  });
  
  const storageKey = `@workout_${planId}_day_${dayId}_ex_${exercise.id}`;
  const xpAwardedKey = `@xp_awarded_${planId}_day_${dayId}_ex_${exercise.id}`;

  useEffect(() => {
    loadSets();
  }, [exercise.id]);

  const loadSets = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      const xpDone = await AsyncStorage.getItem(xpAwardedKey);
      if (xpDone === 'true') {
        setExerciseXpAwarded(true);
      }
      if (stored) {
        const parsed = JSON.parse(stored) as SetData[];
        const migrated = parsed.map(s => ({ ...s, setType: s.setType || 'normal' as SetType }));
        setSets(migrated);
      } else {
        const initialSets: SetData[] = Array.from({ length: exercise.prescription.sets }).map((_, i) => ({
          id: `set_${i + 1}`,
          weight: exercise.prescription.weightKg > 0 ? String(exercise.prescription.weightKg) : '',
          reps: String(exercise.prescription.repsTarget),
          completed: false,
          isPR: false,
          setType: 'normal' as SetType,
        }));
        setSets(initialSets);
      }
    } catch (e) {
      console.error('Failed to load sets', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSets = async (newSets: SetData[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newSets));
    } catch (e) {
      console.error('Failed to save sets', e);
    }
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleSetChange = (index: number, field: keyof SetData, value: string | boolean) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
    saveSets(newSets);
    if (onSetChange) onSetChange(exercise.id, index, newSets);
  };

  const toggleSetComplete = (index: number) => {
    const set = sets[index];
    const newCompleted = !set.completed;
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], completed: newCompleted };

    if (newCompleted) {
      const weight = parseFloat(set.weight) || 0;
      const reps = parseInt(set.reps) || 0;
      if (weight > 0 && reps > 0) {
        const isPR = checkPersonalRecord(exercise.name, weight, reps);
        newSets[index].isPR = isPR;
      }
    } else {
      newSets[index].isPR = false;
    }

    setSets(newSets);
    saveSets(newSets);
    if (onSetChange) onSetChange(exercise.id, index, newSets);

    const allCompleted = newSets.every(s => s.completed);
    if (allCompleted && !exerciseXpAwarded) {
      setExerciseXpAwarded(true);
      AsyncStorage.setItem(xpAwardedKey, 'true').catch(() => {});
      completeExercise(exercise.name);
      triggerXpFlash();
    }
  };

  const triggerXpFlash = () => {
    setShowXpFlash(true);
    Animated.sequence([
      Animated.timing(xpFlashOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.delay(1200),
      Animated.timing(xpFlashOpacity, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start(() => setShowXpFlash(false));
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet: SetData = {
      id: `set_${sets.length + 1}_${Date.now()}`,
      weight: lastSet ? lastSet.weight : (exercise.prescription.weightKg > 0 ? String(exercise.prescription.weightKg) : ''),
      reps: lastSet ? lastSet.reps : String(exercise.prescription.repsTarget),
      completed: false,
      isPR: false,
      setType: 'normal',
    };
    const newSets = [...sets, newSet];
    setSets(newSets);
    saveSets(newSets);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const deleteSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
    saveSets(newSets);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const openSetTypePicker = useCallback((index: number, event: any) => {
    event?.target?.measure?.((x: number, y: number, w: number, h: number, px: number, py: number) => {
      setPickerAnchorX(px);
      setPickerAnchorY(py + h);
      setPickerSetIndex(index);
      setPickerVisible(true);
    });
    if (!event?.target?.measure) {
      setPickerAnchorX(60);
      setPickerAnchorY(200);
      setPickerSetIndex(index);
      setPickerVisible(true);
    }
  }, []);

  const handleSetTypeSelect = useCallback((type: SetType) => {
    const newSets = [...sets];
    newSets[pickerSetIndex] = { ...newSets[pickerSetIndex], setType: type };
    setSets(newSets);
    saveSets(newSets);
    setPickerVisible(false);
    if (onSetChange) onSetChange(exercise.id, pickerSetIndex, newSets);
  }, [sets, pickerSetIndex]);

  const completedCount = sets.filter(s => s.completed).length;
  const totalSets = sets.length;

  if (!isLoaded) return null;

  const getSetBadgeDisplay = (set: SetData, index: number): { text: string; color: string; bgColor: string } => {
    const type = set.setType || 'normal';
    const cfg = SET_TYPE_CONFIG[type];
    if (type === 'normal') {
      return { text: String(computeNormalNumber(sets, index)), color: cfg.color, bgColor: cfg.bgColor };
    }
    return { text: cfg.short, color: cfg.color, bgColor: cfg.bgColor };
  };

  return (
    <View style={styles.cardContainer}>
      <Pressable style={styles.headerBox} onPress={toggleExpand}>
        {isExpanded
          ? <ChevronUp size={20} color="#7E8597" style={styles.chevronIcon} />
          : <ChevronDown size={20} color="#7E8597" style={styles.chevronIcon} />}

        <Pressable
          style={styles.thumbnailContainer}
          onPress={(e) => {
            e.stopPropagation();
            setShowInstructionModal(true);
          }}
        >
          {(() => {
            const strippedId = exercise.id ? exercise.id.replace(/^p30_d\d+_ex\d+_/, '').replace(/_/g, '/') : '';
            const thumbUrl =
              exercise.thumbnail_url ||
              exercise.animation_url ||
              (exercise.id && EXERCISE_DATABASE[exercise.id]?.gifUrl) ||
              (strippedId && EXERCISE_DATABASE[strippedId]?.gifUrl) ||
              (exercise.name && Object.values(EXERCISE_DATABASE).find((i) => i.name.toLowerCase() === exercise.name.toLowerCase())?.gifUrl) ||
              ExerciseMediaDB[exercise.name];
            return thumbUrl ? (
              <Image
                source={{ uri: thumbUrl }}
                style={styles.thumbnailImage}
                contentFit="cover"
                autoplay={false}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={styles.thumbnailFallback}>
                <Dumbbell size={24} color="#38B6FF" />
              </View>
            );
          })()}
          <View style={styles.helpBadge}>
            <Text style={styles.helpBadgeText}>?</Text>
          </View>
        </Pressable>

        <View style={styles.centerInfo}>
          <Text style={[styles.exerciseName, { fontFamily: textFont }]} numberOfLines={1}>
            {toTitleCase(exercise.name)}
          </Text>
        </View>
        <Text style={[styles.statusDoneText, { fontFamily: textFont }]}>
          [{completedCount}/{totalSets}]
        </Text>
      </Pressable>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.setsList}>
            {sets.map((set, index) => {
              const isChecked = set.completed;
              const badge = getSetBadgeDisplay(set, index);
              const setType = set.setType || 'normal';
              const isSpecial = setType !== 'normal';

              return (
                <SwipeableSetRow
                  key={set.id}
                  isOpen={openSetId === set.id}
                  onOpen={() => setOpenSetId(set.id)}
                  onClose={() => {
                    if (openSetId === set.id) setOpenSetId(null);
                  }}
                  onDelete={() => deleteSet(index)}
                >
                  <View
                    style={[
                      styles.setCardRow,
                      isChecked && styles.setCardRowCompleted,
                    ]}
                  >
                    <Pressable
                      style={styles.setCheckCircleRow}
                      onPress={() => toggleSetComplete(index)}
                    >
                      <View style={[styles.circleCheck, isChecked && styles.circleCheckActive]}>
                        {isChecked
                          ? <Check size={16} color="#FFFFFF" />
                          : <Circle size={16} color="#5B6275" />}
                      </View>

                      <Pressable
                        onPress={(e) => openSetTypePicker(index, e)}
                        style={[
                          styles.setTypeBadge,
                          { backgroundColor: badge.bgColor, borderColor: `${badge.color}30` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.setTypeBadgeText,
                            { color: badge.color },
                            isSpecial && styles.setTypeBadgeSpecial,
                          ]}
                        >
                          {badge.text}
                        </Text>
                      </Pressable>
                    </Pressable>

                    <View style={styles.inputWithLabelRow}>
                      <View style={styles.inputBoxPillOnly}>
                        <TextInput
                          style={styles.inputPillText}
                          keyboardType="numeric"
                          value={set.weight}
                          onChangeText={(val) => handleSetChange(index, 'weight', val)}
                          placeholder="0"
                          placeholderTextColor="#454A5A"
                          editable={!isChecked}
                        />
                      </View>
                      <Text style={styles.inputOutsideLabel}>KG</Text>
                    </View>

                    <View style={styles.inputWithLabelRow}>
                      <View style={styles.inputBoxPillOnly}>
                        <TextInput
                          style={styles.inputPillText}
                          keyboardType="numeric"
                          value={set.reps}
                          onChangeText={(val) => handleSetChange(index, 'reps', val)}
                          placeholder="0"
                          placeholderTextColor="#454A5A"
                          editable={!isChecked}
                        />
                      </View>
                      <Text style={styles.inputOutsideLabel}>Reps</Text>
                    </View>
                  </View>
                </SwipeableSetRow>
              );
            })}

            <Pressable style={styles.addSetFullBtn} onPress={addSet}>
              <Text style={styles.addSetFullText}>+ Add a set</Text>
            </Pressable>
          </View>
        </View>
      )}



      <ExerciseInstructionModal
        visible={showInstructionModal}
        exerciseName={exercise.name}
        exerciseId={exercise.id}
        onClose={() => setShowInstructionModal(false)}
      />

      <SetTypePicker
        visible={pickerVisible}
        currentType={(sets[pickerSetIndex]?.setType || 'normal') as SetType}
        onSelect={handleSetTypeSelect}
        onClose={() => setPickerVisible(false)}
        anchorY={pickerAnchorY}
        anchorX={pickerAnchorX}
      />
    </View>
  );
}

const iosFont = Platform.select({
  ios: 'System',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "San Francisco", sans-serif',
  default: 'System',
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E212B',
    borderRadius: 14,
    marginBottom: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chevronIcon: {
    marginRight: 8,
  },
  thumbnailContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
    overflow: 'visible',
  },
  thumbnailImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#7E8597',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  helpBadgeText: {
    fontSize: 10,
    fontFamily: iosFont,
    fontWeight: '700',
    color: '#7E8597',
  },
  centerInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.body,
    color: '#FFFFFF',
    fontFamily: iosFont,
  },
  statusDoneText: {
    color: '#8A8F9E',
    fontSize: 12,
    fontFamily: iosFont,
    fontWeight: '500',
    marginTop: 2,
  },
  overflowMenuBtn: {
    padding: 6,
  },
  expandedContent: {
    paddingHorizontal: 0,
    paddingBottom: 8,
    paddingTop: 2,
  },
  setsList: {
    gap: 2,
  },
  setCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  setCardRowCompleted: {
    backgroundColor: 'rgba(54, 82, 225, 0.08)',
    borderRadius: 0,
  },
  setCheckCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCheckActive: {
    backgroundColor: '#3652E1',
  },
  setTypeBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1,
  },
  setTypeBadgeText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 14,
  },
  setTypeBadgeSpecial: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  inputWithLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputBoxPillOnly: {
    width: 52,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPillText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
    padding: 0,
  },
  inputOutsideLabel: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 13,
    color: '#FFFFFF',
  },
  addSetFullBtn: {
    backgroundColor: '#252834',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginHorizontal: 12,
  },
  addSetFullText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF',
  },
  xpFlash: {
    position: 'absolute',
    top: -4,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(8, 18, 32, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  xpFlashText: {
    fontFamily: iosFont,
    fontWeight: '700',
    fontSize: 11,
    color: '#FFD700',
    letterSpacing: 1,
  },
});
