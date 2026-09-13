import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, X, Calendar, Clock, CheckCircle2, Sparkles, ChevronUp, ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { typography } from '../styles/typography';
import { sendTestNotificationAsync } from '../hooks/useNotificationObserver';

const REMINDER_STORAGE_KEY = '@arise_workout_reminder';

export interface ReminderConfig {
  isEnabled: boolean;
  timeHour: number; // 1-12
  timeMinute: number; // 0, 15, 30, 45
  timeAmPm: 'AM' | 'PM';
  repeatMode: 'Every Day' | 'Weekdays' | 'Weekends' | 'Custom';
  selectedDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

const DEFAULT_CONFIG: ReminderConfig = {
  isEnabled: false,
  timeHour: 7,
  timeMinute: 0,
  timeAmPm: 'PM',
  repeatMode: 'Every Day',
  selectedDays: [0, 1, 2, 3, 4, 5, 6],
};

const DAY_NAMES = [
  { key: 1, label: 'MON', full: 'Monday' },
  { key: 2, label: 'TUE', full: 'Tuesday' },
  { key: 3, label: 'WED', full: 'Wednesday' },
  { key: 4, label: 'THU', full: 'Thursday' },
  { key: 5, label: 'FRI', full: 'Friday' },
  { key: 6, label: 'SAT', full: 'Saturday' },
  { key: 0, label: 'SUN', full: 'Sunday' },
];

const PRESET_MODES: ('Every Day' | 'Weekdays' | 'Weekends' | 'Custom')[] = [
  'Every Day',
  'Weekdays',
  'Weekends',
  'Custom',
];

interface WorkoutReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function WorkoutReminderModal({
  visible,
  onClose,
  onSaved,
}: WorkoutReminderModalProps) {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');

  // Form State
  const [isEnabled, setIsEnabled] = useState(DEFAULT_CONFIG.isEnabled);
  const [timeHour, setTimeHour] = useState(DEFAULT_CONFIG.timeHour);
  const [timeMinute, setTimeMinute] = useState(DEFAULT_CONFIG.timeMinute);
  const [timeAmPm, setTimeAmPm] = useState<'AM' | 'PM'>(DEFAULT_CONFIG.timeAmPm);
  const [repeatMode, setRepeatMode] = useState<'Every Day' | 'Weekdays' | 'Weekends' | 'Custom'>(
    DEFAULT_CONFIG.repeatMode
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(DEFAULT_CONFIG.selectedDays);

  // Animation values
  const sheetProgress = useSharedValue(0);

  // Load saved configuration from AsyncStorage
  const loadSavedConfig = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
      if (stored) {
        const parsed: ReminderConfig = JSON.parse(stored);
        setIsEnabled(parsed.isEnabled ?? false);
        setTimeHour(parsed.timeHour ?? 7);
        setTimeMinute(parsed.timeMinute ?? 0);
        setTimeAmPm(parsed.timeAmPm ?? 'PM');
        setRepeatMode(parsed.repeatMode ?? 'Every Day');
        setSelectedDays(parsed.selectedDays ?? [0, 1, 2, 3, 4, 5, 6]);
      }
    } catch (e) {
      console.error('Failed to load reminder settings:', e);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadSavedConfig();
      sheetProgress.value = withSpring(1, {
        damping: 24,
        stiffness: 220,
        mass: 0.8,
      });
    } else {
      sheetProgress.value = 0;
    }
  }, [visible, loadSavedConfig, sheetProgress]);

  const handleClose = useCallback(() => {
    sheetProgress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  }, [sheetProgress, onClose]);

  // Haptic Feedback Helper
  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      Haptics.impactAsync(style);
    } catch (e) {
      // Fallback for non-supported platforms
    }
  };

  // Toggle Switch Handler
  const handleToggleEnable = (value: boolean) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsEnabled(value);
  };

  // Repeat Preset Handler
  const handleSelectPreset = (mode: 'Every Day' | 'Weekdays' | 'Weekends' | 'Custom') => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setRepeatMode(mode);
    if (mode === 'Every Day') {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (mode === 'Weekdays') {
      setSelectedDays([1, 2, 3, 4, 5]);
    } else if (mode === 'Weekends') {
      setSelectedDays([0, 6]);
    }
  };

  // Individual Day Chip Toggle Handler
  const handleToggleDay = (dayKey: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    let updated: number[];
    if (selectedDays.includes(dayKey)) {
      if (selectedDays.length === 1) {
        // Keep at least one day selected
        return;
      }
      updated = selectedDays.filter((d) => d !== dayKey);
    } else {
      updated = [...selectedDays, dayKey].sort();
    }
    setSelectedDays(updated);

    // Auto update repeat mode based on selection
    if (updated.length === 7) {
      setRepeatMode('Every Day');
    } else if (
      updated.length === 5 &&
      updated.includes(1) &&
      updated.includes(2) &&
      updated.includes(3) &&
      updated.includes(4) &&
      updated.includes(5)
    ) {
      setRepeatMode('Weekdays');
    } else if (updated.length === 2 && updated.includes(0) && updated.includes(6)) {
      setRepeatMode('Weekends');
    } else {
      setRepeatMode('Custom');
    }
  };

  // Steppers for Time Selection
  const incrementHour = () => {
    triggerHaptic();
    setTimeHour((prev) => (prev % 12) + 1);
  };

  const decrementHour = () => {
    triggerHaptic();
    setTimeHour((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const toggleMinute = () => {
    triggerHaptic();
    setTimeMinute((prev) => (prev === 0 ? 15 : prev === 15 ? 30 : prev === 30 ? 45 : 0));
  };

  const toggleAmPm = () => {
    triggerHaptic();
    setTimeAmPm((prev) => (prev === 'AM' ? 'PM' : 'AM'));
  };

  // Convert 12h to 24h for calculations and scheduling
  const hour24 = useMemo(() => {
    if (timeAmPm === 'AM') {
      return timeHour === 12 ? 0 : timeHour;
    } else {
      return timeHour === 12 ? 12 : timeHour + 12;
    }
  }, [timeHour, timeAmPm]);

  const formattedTimeStr = useMemo(() => {
    const minStr = timeMinute < 10 ? `0${timeMinute}` : `${timeMinute}`;
    return `${timeHour}:${minStr} ${timeAmPm}`;
  }, [timeHour, timeMinute, timeAmPm]);

  // Live Summary String
  const summaryText = useMemo(() => {
    if (!isEnabled) {
      return 'Stay consistent by scheduling a daily workout reminder to keep your streak alive.';
    }

    let daysStr = '';
    if (repeatMode === 'Every Day' || selectedDays.length === 7) {
      daysStr = 'every day';
    } else if (repeatMode === 'Weekdays' && selectedDays.length === 5) {
      daysStr = 'every weekday';
    } else if (repeatMode === 'Weekends' && selectedDays.length === 2) {
      daysStr = 'on weekends';
    } else {
      const dayNames = DAY_NAMES.filter((d) => selectedDays.includes(d.key)).map((d) => d.full);
      if (dayNames.length === 1) {
        daysStr = `every ${dayNames[0]}`;
      } else if (dayNames.length === 2) {
        daysStr = `every ${dayNames[0]} and ${dayNames[1]}`;
      } else {
        const last = dayNames.pop();
        daysStr = `every ${dayNames.join(', ')}, and ${last}`;
      }
    }

    return `You'll be reminded ${daysStr} at ${formattedTimeStr}.`;
  }, [isEnabled, repeatMode, selectedDays, formattedTimeStr]);

  // Calculate Next Scheduled Reminder Date
  const nextReminderText = useMemo(() => {
    if (!isEnabled || selectedDays.length === 0) return null;

    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    for (let offset = 0; offset < 7; offset++) {
      const checkDay = (currentDay + offset) % 7;
      if (selectedDays.includes(checkDay)) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + offset);
        targetDate.setHours(hour24, timeMinute, 0, 0);

        if (targetDate > now) {
          if (offset === 0) {
            return `Today at ${formattedTimeStr}`;
          } else if (offset === 1) {
            return `Tomorrow at ${formattedTimeStr}`;
          } else {
            const dayObj = DAY_NAMES.find((d) => d.key === checkDay);
            return `${dayObj?.full || ''} at ${formattedTimeStr}`;
          }
        }
      }
    }

    // Default fallback to 7 days ahead
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 7);
    const dayObj = DAY_NAMES.find((d) => d.key === targetDate.getDay());
    return `${dayObj?.full || ''} at ${formattedTimeStr}`;
  }, [isEnabled, selectedDays, hour24, timeMinute, formattedTimeStr]);

  // Schedule Push Notifications via Expo Notifications
  const scheduleNotifications = async (config: ReminderConfig) => {
    try {
      // Cancel previous scheduled workout notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!config.isEnabled) {
        return;
      }

      // Check or request permissions
      const settings = await Notifications.getPermissionsAsync();
      let granted = settings.granted;
      if (!granted && settings.canAskAgain) {
        const req = await Notifications.requestPermissionsAsync();
        granted = req.granted;
      }

      if (!granted) {
        Alert.alert(
          'Notification Permission',
          'Please allow notification permissions in your device settings to receive workout reminders.',
        );
        return;
      }

      // Convert 12h to 24h
      let h24 = config.timeHour;
      if (config.timeAmPm === 'PM' && h24 < 12) h24 += 12;
      if (config.timeAmPm === 'AM' && h24 === 12) h24 = 0;

      // Schedule weekly notifications for each selected day
      for (const dayOfWeek of config.selectedDays) {
        const expoWeekday = dayOfWeek === 0 ? 1 : dayOfWeek + 1;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚔️ Time to Train, Hunter!',
            body: 'Your daily workout quest is waiting. Rise up and keep your streak alive!',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' && { channelId: 'workout-reminders' }),
            data: {
              url: '/(tabs)/home',
              type: 'workout_reminder',
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: expoWeekday,
            hour: h24,
            minute: config.timeMinute,
            ...(Platform.OS === 'android' && { channelId: 'workout-reminders' }),
          },
        });
      }
    } catch (e) {
      console.error('Error scheduling notification:', e);
    }
  };

  const handleTestNotification = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const res = await sendTestNotificationAsync(3, '/(tabs)/home');
    if (res.success) {
      Alert.alert(
        '⚔️ Test Push Notification',
        'Notification scheduled in 3 seconds! Minimize the app or lock your screen, then tap the notification to test opening Arise directly to your daily quests.',
        [{ text: 'GOT IT' }]
      );
    } else {
      Alert.alert('Notification Notice', res.reason || 'Could not schedule notification. Please ensure permissions are enabled.');
    }
  };

  // Save Reminder Handler
  const handleSave = async () => {
    try {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      const config: ReminderConfig = {
        isEnabled,
        timeHour,
        timeMinute,
        timeAmPm,
        repeatMode,
        selectedDays,
      };

      await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(config));
      await scheduleNotifications(config);

      sheetProgress.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(onClose)();
          runOnJS(onSaved)();
        }
      });
    } catch (e) {
      console.error('Error saving workout reminder:', e);
    }
  };

  // Gesture Pan for Drag to Dismiss
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        const progress = 1 - Math.min(1, e.translationY / 400);
        sheetProgress.value = progress;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        sheetProgress.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        sheetProgress.value = withSpring(1, { damping: 24, stiffness: 220 });
      }
    });

  // Animated Styles
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(sheetProgress.value, [0, 1], [0, 0.75], Extrapolation.CLAMP);
    return { opacity };
  });

  const sheetStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      sheetProgress.value,
      [0, 1],
      [SCREEN_HEIGHT * 0.9, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlayContainer}>
        {/* Dimmed Backdrop */}
        <Reanimated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Reanimated.View>

        {/* Bottom Sheet Modal Container */}
        <GestureDetector gesture={panGesture}>
          <Reanimated.View style={[styles.sheetCard, sheetStyle]}>
            {/* Drag Pill */}
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.iconCircle}>
                  <Bell size={18} color="#4080E7" />
                </View>
                <Text style={styles.headerTitle}>WORKOUT REMINDER</Text>
              </View>

              <Pressable onPress={handleClose} style={styles.closeBtn}>
                <X size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
            >
              {/* Top Toggle Card */}
              <View style={[styles.cardSection, isEnabled && styles.cardSectionActive]}>
                <View style={styles.toggleLeft}>
                  <Text style={styles.toggleTitle}>Enable Workout Reminder</Text>
                  <Text style={styles.toggleSubtitle}>Get notified when it's time to train</Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={handleToggleEnable}
                  trackColor={{ false: 'rgba(255,255,255,0.12)', true: 'rgba(64,128,231,0.4)' }}
                  thumbColor={isEnabled ? '#4080E7' : '#9CA3AF'}
                />
              </View>

              {/* Time Picker Section */}
              <View style={[styles.sectionBlock, !isEnabled && styles.sectionDisabled]}>
                <Text style={styles.sectionTitle}>REMINDER TIME</Text>
                <View style={styles.timePickerRow}>
                  {/* Hour Selector */}
                  <View style={styles.timeUnitBox}>
                    <Text style={styles.timeUnitLabel}>HOUR</Text>
                    <View style={styles.stepperControl}>
                      <Pressable style={styles.stepperBtn} onPress={incrementHour} disabled={!isEnabled}>
                        <ChevronUp size={16} color={isEnabled ? '#4080E7' : 'rgba(255,255,255,0.2)'} />
                      </Pressable>
                      <Text style={styles.timeUnitValue}>
                        {timeHour < 10 ? `0${timeHour}` : timeHour}
                      </Text>
                      <Pressable style={styles.stepperBtn} onPress={decrementHour} disabled={!isEnabled}>
                        <ChevronDown size={16} color={isEnabled ? '#4080E7' : 'rgba(255,255,255,0.2)'} />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.timeColon}>:</Text>

                  {/* Minute Selector */}
                  <View style={styles.timeUnitBox}>
                    <Text style={styles.timeUnitLabel}>MINUTE</Text>
                    <Pressable style={styles.timeDisplayBox} onPress={toggleMinute} disabled={!isEnabled}>
                      <Text style={styles.timeUnitValue}>
                        {timeMinute < 10 ? `0${timeMinute}` : timeMinute}
                      </Text>
                    </Pressable>
                  </View>

                  {/* AM/PM Toggle */}
                  <View style={styles.amPmContainer}>
                    <Pressable
                      style={[styles.amPmBtn, timeAmPm === 'AM' && styles.amPmBtnActive]}
                      onPress={toggleAmPm}
                      disabled={!isEnabled}
                    >
                      <Text style={[styles.amPmText, timeAmPm === 'AM' && styles.amPmTextActive]}>
                        AM
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.amPmBtn, timeAmPm === 'PM' && styles.amPmBtnActive]}
                      onPress={toggleAmPm}
                      disabled={!isEnabled}
                    >
                      <Text style={[styles.amPmText, timeAmPm === 'PM' && styles.amPmTextActive]}>
                        PM
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Repeat Section */}
              <View style={[styles.sectionBlock, !isEnabled && styles.sectionDisabled]}>
                <Text style={styles.sectionTitle}>REPEAT</Text>

                {/* Preset Chips */}
                <View style={styles.presetRow}>
                  {PRESET_MODES.map((mode) => {
                    const isActive = repeatMode === mode;
                    return (
                      <Pressable
                        key={mode}
                        style={[styles.presetChip, isActive && styles.presetChipActive]}
                        onPress={() => handleSelectPreset(mode)}
                        disabled={!isEnabled}
                      >
                        <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                          {mode}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Day Selection Chips */}
                <View style={styles.daysRow}>
                  {DAY_NAMES.map((day) => {
                    const isSelected = selectedDays.includes(day.key);
                    return (
                      <Pressable
                        key={day.label}
                        style={[styles.dayChip, isSelected && styles.dayChipActive]}
                        onPress={() => handleToggleDay(day.key)}
                        disabled={!isEnabled}
                      >
                        <Text style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>
                          {day.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Live Summary Card */}
              <View style={[styles.summaryCard, isEnabled ? styles.summaryCardActive : styles.summaryCardDisabled]}>
                <View style={[styles.summaryBar, { backgroundColor: isEnabled ? '#4080E7' : 'rgba(255,255,255,0.2)' }]} />
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryText}>{summaryText}</Text>
                  {isEnabled && nextReminderText && (
                    <View style={styles.nextReminderRow}>
                      <Clock size={13} color="#4080E7" />
                      <Text style={styles.nextReminderText}>
                        Next reminder: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{nextReminderText}</Text>
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Test Push Notification */}
              <View style={styles.testSection}>
                <Pressable
                  style={styles.testBtn}
                  onPress={handleTestNotification}
                >
                  <Bell size={16} color="#4080E7" />
                  <Text style={styles.testBtnText}>TEST PUSH NOTIFICATION</Text>
                </Pressable>
                <Text style={styles.testSubtext}>
                  Sends a notification in 3s so you can test tapping it to open Arise.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.actionFooter}>
              <Pressable style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </Pressable>

              <Pressable style={styles.saveBtnWrapper} onPress={handleSave}>
                <LinearGradient
                  colors={['#4080E7', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>SAVE REMINDER</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Reanimated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheetCard: {
    backgroundColor: '#121215',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.25)',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
  },
  headerTitle: {
    ...typography.h2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    gap: 16,
    paddingBottom: 12,
  },
  cardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardSectionActive: {
    borderColor: 'rgba(64, 128, 231, 0.35)',
    backgroundColor: 'rgba(64, 128, 231, 0.06)',
  },
  toggleLeft: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionDisabled: {
    opacity: 0.4,
  },
  sectionTitle: {
    ...typography.h2,
  },

  // Time Picker
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  timeUnitBox: {
    alignItems: 'center',
    gap: 4,
  },
  timeUnitLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.8,
  },
  stepperControl: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepperBtn: {
    padding: 2,
  },
  timeDisplayBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  timeUnitValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  timeColon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4080E7',
    marginTop: 14,
  },
  amPmContainer: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 3,
    gap: 4,
    marginLeft: 8,
  },
  amPmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  amPmBtnActive: {
    backgroundColor: '#4080E7',
  },
  amPmText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  amPmTextActive: {
    color: '#FFFFFF',
  },

  // Presets & Days
  presetRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.18)',
    borderColor: '#4080E7',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  presetTextActive: {
    color: '#4080E7',
    fontWeight: '700',
  },

  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayChip: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: '#4080E7',
    borderColor: '#4080E7',
  },
  dayChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summaryCardActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    borderColor: 'rgba(64, 128, 231, 0.25)',
  },
  summaryCardDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
    gap: 6,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  nextReminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  nextReminderText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  testSection: {
    marginTop: 14,
    alignItems: 'center',
    gap: 6,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: 'rgba(64, 128, 231, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#4080E7',
    textTransform: 'uppercase',
  },
  testSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
  },

  // Action Footer
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1.2,
  },
  saveBtnWrapper: {
    flex: 1.6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
