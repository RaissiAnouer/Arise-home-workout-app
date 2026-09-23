import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle, Animated } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Check, X } from 'lucide-react-native';

export interface WeekDayItem {
  key: string;
  label: string;
  dayNumber: number;
  isToday: boolean;
  isPast?: boolean;
  isFuture?: boolean;
  isRestDay?: boolean;
  isWorkoutDay?: boolean;
  isCompleted?: boolean;
  isMissed?: boolean;
}

interface MiniWeekProgressProps {
  weekDays: WeekDayItem[];
  onPressDay?: (day: WeekDayItem, index: number) => void;
  onPressContainer?: () => void;
  style?: StyleProp<ViewStyle>;
  selectedDayKey?: string | null;
  todayScale?: any;
}

/**
 * Solo Leveling Glowing Pin Badge for Today or Active Selected Day.
 * Features:
 * - Circular HUD ring with downward indicator arrow at the bottom
 * - Neon blue electric stroke with drop shadow glow
 * - Dual-arc highlight (bright white on top-left, cyan-blue on top-right)
 * - Centered date number or completion checkmark
 */
export const GlowingPinBadge = memo(function GlowingPinBadge({
  day,
  todayScale,
}: {
  day: WeekDayItem;
  todayScale?: any;
}) {
  const pinContent = (
    <View style={styles.pinWrapper}>
      <Svg width={42} height={50} viewBox="0 0 42 50">
        <Defs>
          {/* Main neon blue outline gradient */}
          <LinearGradient id="pinStrokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#93C5FD" />
            <Stop offset="35%" stopColor="#4080E7" />
            <Stop offset="80%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#3B82F6" />
          </LinearGradient>

          {/* Dark futuristic background fill */}
          <LinearGradient id="pinBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="rgba(40, 95, 210, 0.28)" />
            <Stop offset="55%" stopColor="rgba(10, 20, 45, 0.90)" />
            <Stop offset="100%" stopColor="rgba(5, 10, 25, 0.96)" />
          </LinearGradient>
        </Defs>

        {/* Outer glowing body: circle curving into downward pointing arrow */}
        <Path
          d="M 15.6 36.6 A 17.5 17.5 0 1 1 26.4 36.6 L 23 41.5 L 25.2 41.5 L 21 47.5 L 16.8 41.5 L 19 41.5 Z"
          fill="url(#pinBgGrad)"
          stroke="url(#pinStrokeGrad)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />

        {/* Top-left white reflection arc (matching reference image) */}
        <Path
          d="M 7 10 A 17.5 17.5 0 0 1 19.5 2.57"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />

        {/* Top-right bright cyan reflection arc (matching reference image) */}
        <Path
          d="M 22.5 2.57 A 17.5 17.5 0 0 1 35.3 10"
          stroke="#93C5FD"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      {/* Centered content inside the circular portion */}
      <View style={styles.pinContent}>
        {day.isCompleted ? (
          <Check size={16} color="#FFFFFF" strokeWidth={3} />
        ) : day.isMissed ? (
          <X size={15} color="#FF3B30" strokeWidth={2.8} />
        ) : (
          <Text style={styles.pinNumberText}>{day.dayNumber}</Text>
        )}
      </View>
    </View>
  );
});

/**
 * Standard Day Badge for non-active days (completed, missed, rest, or upcoming).
 */
export const StandardDayBadge = memo(function StandardDayBadge({
  day,
}: {
  day: WeekDayItem;
}) {
  return (
    <View style={styles.standardBadgeContainer}>
      <View
        style={[
          styles.dayCircle,
          day.isCompleted && styles.dayCircleCompleted,
          day.isMissed && styles.dayCircleMissed,
          day.isRestDay && !day.isCompleted && styles.dayCircleRest,
          day.isFuture && !day.isRestDay && styles.dayCircleFuture,
        ]}
      >
        {day.isCompleted ? (
          <Check size={15} color="#4080E7" strokeWidth={2.8} />
        ) : day.isMissed ? (
          <X size={14} color="#FF3B30" strokeWidth={2.8} />
        ) : (
          <Text
            style={[
              styles.dayNumberText,
              day.isRestDay && styles.restDayNumberText,
              day.isFuture && styles.futureNumberText,
            ]}
          >
            {day.dayNumber}
          </Text>
        )}
      </View>
    </View>
  );
});

/**
 * MiniWeekProgress Component
 * Renders the 7-day weekly streak / progress row with the new glowing pin design.
 */
export const MiniWeekProgress = memo(function MiniWeekProgress({
  weekDays,
  onPressDay,
  onPressContainer,
  style,
  selectedDayKey,
}: MiniWeekProgressProps) {
  const content = (
    <View style={[styles.weekDaysContainer, style]}>
      {weekDays.map((day, index) => {
        // A day gets the glowing pin if it's explicitly selected or if it's Today
        const isPin = selectedDayKey ? day.key === selectedDayKey : day.isToday;

        return (
          <Pressable
            key={day.key}
            style={styles.dayCol}
            onPress={onPressDay ? () => onPressDay(day, index) : undefined}
            disabled={!onPressDay}
          >
            {/* Day of Week Label: "M", "T", "W", "T", "F", "S", "S" */}
            <Text style={[styles.dayLabel, (isPin || day.isToday) && styles.todayLabel]}>
              {day.label}
            </Text>

            {/* Day Badge */}
            {isPin ? <GlowingPinBadge day={day} /> : <StandardDayBadge day={day} />}
          </Pressable>
        );
      })}
    </View>
  );

  if (onPressContainer) {
    return (
      <Pressable onPress={onPressContainer} activeOpacity={0.88}>
        {content}
      </Pressable>
    );
  }

  return content;
});

export default MiniWeekProgress;

const styles = StyleSheet.create({
  weekDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(10, 15, 26, 0.65)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  dayCol: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 44,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    textAlign: 'center',
  },
  todayLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(64, 128, 231, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // Pin Wrapper (with neon glow)
  pinWrapper: {
    width: 42,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#4080E7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 7,
  },
  pinContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Non-pin container maintains same 50px height so horizontal baselines align
  standardBadgeContainer: {
    width: 42,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dayCircle: {
    width: 38,
    height: 38,
    marginTop: 1,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayCircleCompleted: {
    backgroundColor: 'rgba(64, 128, 231, 0.16)',
    borderColor: '#4080E7',
    shadowColor: '#4080E7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
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
  dayCircleRest: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  dayCircleFuture: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restDayNumberText: {
    color: 'rgba(255, 255, 255, 0.35)',
  },
  futureNumberText: {
    color: 'rgba(255, 255, 255, 0.35)',
  },
});
