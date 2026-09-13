import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronUp, ChevronDown, Bell } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { typography } from '../src/styles/typography';
import { sendTestNotificationAsync } from '../src/hooks/useNotificationObserver';

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

export default function ReminderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State
  const [isEnabled, setIsEnabled] = useState(DEFAULT_CONFIG.isEnabled);
  const [timeHour, setTimeHour] = useState(DEFAULT_CONFIG.timeHour);
  const [timeMinute, setTimeMinute] = useState(DEFAULT_CONFIG.timeMinute);
  const [timeAmPm, setTimeAmPm] = useState<'AM' | 'PM'>(DEFAULT_CONFIG.timeAmPm);
  const [repeatMode, setRepeatMode] = useState<'Every Day' | 'Weekdays' | 'Weekends' | 'Custom'>(
    DEFAULT_CONFIG.repeatMode
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(DEFAULT_CONFIG.selectedDays);
  const [isSaving, setIsSaving] = useState(false);

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
    loadSavedConfig();
  }, [loadSavedConfig]);

  // Haptic Feedback Helper
  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style).catch(() => {});
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
        return; // Keep at least one day selected
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

  // Schedule Push Notifications via Expo Notifications
  const scheduleNotifications = async (config: ReminderConfig) => {
    if (Platform.OS === 'web') return; // Notifications not supported on web
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!config.isEnabled) {
        return;
      }

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

      let h24 = config.timeHour;
      if (config.timeAmPm === 'PM' && h24 < 12) h24 += 12;
      if (config.timeAmPm === 'AM' && h24 === 12) h24 = 0;

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
      setIsSaving(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

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

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home' as any);
      }
    } catch (e) {
      console.error('Error saving workout reminder:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
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
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>WORKOUT REMINDER</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enable Workout Reminder Clean Row */}
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleTitle, { color: isEnabled ? '#4080E7' : '#FFFFFF' }]}>
            Enable Workout Reminder
          </Text>
          <Switch
            value={isEnabled}
            onValueChange={handleToggleEnable}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(64,128,231,0.5)' }}
            thumbColor={isEnabled ? '#4080E7' : '#FFFFFF'}
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
                  <ChevronUp size={18} color={isEnabled ? '#4080E7' : 'rgba(255,255,255,0.2)'} />
                </Pressable>
                <Text style={styles.timeUnitValue}>
                  {timeHour < 10 ? `0${timeHour}` : timeHour}
                </Text>
                <Pressable style={styles.stepperBtn} onPress={decrementHour} disabled={!isEnabled}>
                  <ChevronDown size={18} color={isEnabled ? '#4080E7' : 'rgba(255,255,255,0.2)'} />
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

            {/* AM/PM Toggle (White & Dark styling) */}
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
          <Text style={styles.sectionTitle}>REPEAT SCHEDULE</Text>

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
        </View>
      </ScrollView>

      {/* Bottom Action Button (White & Dark styling with no icon, 3-button phone navigation bar safety) */}
      <View style={[styles.bottomActionContainer, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
        <Pressable
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? 'SAVING...' : 'SAVE REMINDER'}
          </Text>
        </Pressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
    ...typography.h2,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  testSection: {
    marginTop: 10,
    alignItems: 'center',
    gap: 8,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#4080E7',
    textTransform: 'uppercase',
  },
  testSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionBlock: {
    gap: 14,
  },
  sectionDisabled: {
    opacity: 0.35,
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
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 16,
  },
  timeUnitBox: {
    alignItems: 'center',
    gap: 6,
  },
  timeUnitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.8,
  },
  stepperControl: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepperBtn: {
    padding: 4,
  },
  timeDisplayBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  timeUnitValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  timeColon: {
    fontSize: 26,
    fontWeight: '800',
    color: '#4080E7',
    marginTop: 18,
  },
  amPmContainer: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginLeft: 8,
  },
  amPmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  amPmBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  amPmText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  amPmTextActive: {
    color: '#000000',
    fontWeight: '800',
  },

  // Presets & Days
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderColor: '#4080E7',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayChipActive: {
    backgroundColor: '#4080E7',
    borderColor: '#4080E7',
    shadowColor: '#4080E7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },

  // Bottom Action
  bottomActionContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  saveBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});
