import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useProgression } from '../../context/ProgressionContext';

interface ProfileStatsPaneProps {
  onPressRank?: () => void;
  onPressLevel?: () => void;
  onPressWorkouts?: () => void;
  onPressStreak?: () => void;
}

const BADGE_SIZE = 64;
const CENTER = BADGE_SIZE / 2; // 32

export default function ProfileStatsPane({
  onPressRank,
  onPressLevel,
  onPressWorkouts,
  onPressStreak,
}: ProfileStatsPaneProps) {
  const router = useRouter();
  const { rank, level, totalWorkouts, streakDays } = useProgression();

  // 1. Compute Level Dial Ticks (36 ticks around 360°)
  const levelTicks = useMemo(() => {
    const ticks = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count;
      const rad = (angle * Math.PI) / 180;
      const rInner = 22.5;
      const rOuter = 26;
      ticks.push({
        id: `level-tick-${i}`,
        x1: CENTER + rInner * Math.cos(rad),
        y1: CENTER + rInner * Math.sin(rad),
        x2: CENTER + rOuter * Math.cos(rad),
        y2: CENTER + rOuter * Math.sin(rad),
      });
    }
    return ticks;
  }, []);

  // 2. Compute Workouts Tactical HUD Ticks (36 ticks + 4 cardinal crosshairs)
  const workoutTicks = useMemo(() => {
    const ticks = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count;
      const rad = (angle * Math.PI) / 180;
      const isCardinal = i % 9 === 0; // 0°, 90°, 180°, 270°

      const rInner = isCardinal ? 19 : 21.5;
      const rOuter = isCardinal ? 29.5 : 25;

      ticks.push({
        id: `workout-tick-${i}`,
        isCardinal,
        x1: CENTER + rInner * Math.cos(rad),
        y1: CENTER + rInner * Math.sin(rad),
        x2: CENTER + rOuter * Math.cos(rad),
        y2: CENTER + rOuter * Math.sin(rad),
      });
    }
    return ticks;
  }, []);

  // Format rank display
  const rankDisplay = useMemo(() => {
    if (!rank) return 'E';
    if (rank === 'National') return 'NAT';
    if (rank === 'SSS') return 'SSS';
    return rank;
  }, [rank]);

  const handleRankPress = () => {
    if (onPressRank) {
      onPressRank();
      return;
    }
    try {
      if (typeof (router as any).navigate === 'function') {
        (router as any).navigate('/rank-result');
      } else {
        router.push('/rank-result' as any);
      }
    } catch (e) {
      console.warn('Error navigating to rank-result:', e);
      router.push('/rank-result' as any);
    }
  };

  const handleLevelPress = () => {
    if (onPressLevel) {
      onPressLevel();
      return;
    }
    try {
      if (typeof (router as any).navigate === 'function') {
        (router as any).navigate('/plan');
      } else {
        router.push('/plan' as any);
      }
    } catch (e) {
      console.warn('Error navigating to plan:', e);
      router.push('/plan' as any);
    }
  };

  const handleWorkoutsPress = () => {
    if (onPressWorkouts) {
      onPressWorkouts();
      return;
    }
    try {
      if (typeof (router as any).navigate === 'function') {
        (router as any).navigate('/(tabs)/reports');
      } else {
        router.push('/(tabs)/reports' as any);
      }
    } catch (e) {
      console.warn('Error navigating to reports:', e);
      try {
        router.push('/reports' as any);
      } catch (err2) {
        console.error('Fallback navigation failed:', err2);
      }
    }
  };

  const handleStreakPress = () => {
    if (onPressStreak) {
      onPressStreak();
      return;
    }
    try {
      if (typeof (router as any).navigate === 'function') {
        (router as any).navigate('/streak');
      } else {
        router.push('/streak' as any);
      }
    } catch (e) {
      console.warn('Error navigating to streak:', e);
      router.push('/streak' as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── 1. RANK ─── */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={handleRankPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Hunter Rank"
      >
        <View style={styles.badgeWrapper} pointerEvents="none">
          <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox={`0 0 ${BADGE_SIZE} ${BADGE_SIZE}`} pointerEvents="none">
            {/* Dark base circle */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={27}
              fill="#0B0D13"
            />
            {/* Outer metallic bezel */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={26.5}
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth={2}
              fill="transparent"
            />
            {/* Inner subtle guide ring */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={23}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={1}
              fill="transparent"
            />
          </Svg>

          <View style={styles.badgeContent} pointerEvents="none">
            <Text style={styles.valueText}>{rankDisplay}</Text>
          </View>
        </View>
        <Text style={styles.labelText} pointerEvents="none">Rank</Text>
      </TouchableOpacity>

      {/* ─── 2. LEVEL ─── */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={handleLevelPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Hunter Level"
      >
        <View style={styles.badgeWrapper} pointerEvents="none">
          <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox={`0 0 ${BADGE_SIZE} ${BADGE_SIZE}`} pointerEvents="none">
            {/* Dark background */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={27}
              fill="#090E17"
            />
            {/* Radial Dial Ticks */}
            {levelTicks.map((tick) => (
              <Line
                key={tick.id}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="#4F6D94"
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            ))}
            {/* Inner ring */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={21}
              stroke="rgba(79, 109, 148, 0.3)"
              strokeWidth={1}
              fill="transparent"
            />
          </Svg>

          <View style={styles.badgeContent} pointerEvents="none">
            <Text style={styles.valueText}>{level}</Text>
          </View>
        </View>
        <Text style={styles.labelText} pointerEvents="none">Level</Text>
      </TouchableOpacity>

      {/* ─── 3. WORKOUTS ─── */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={handleWorkoutsPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Total Workouts"
      >
        <View style={styles.badgeWrapper} pointerEvents="none">
          <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox={`0 0 ${BADGE_SIZE} ${BADGE_SIZE}`} pointerEvents="none">
            {/* Dark background */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={27}
              fill="#0D0D1E"
            />
            {/* Dial and Crosshair Ticks */}
            {workoutTicks.map((tick) => (
              <Line
                key={tick.id}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={tick.isCardinal ? '#8B95FD' : 'rgba(99, 102, 241, 0.6)'}
                strokeWidth={tick.isCardinal ? 1.8 : 1.2}
                strokeLinecap="round"
              />
            ))}
            {/* Inner HUD Ring */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={20}
              stroke="rgba(129, 140, 248, 0.3)"
              strokeWidth={1}
              fill="transparent"
            />
          </Svg>

          <View style={styles.badgeContent} pointerEvents="none">
            <Text style={styles.valueText}>{totalWorkouts}</Text>
          </View>
        </View>
        <Text style={styles.labelText} pointerEvents="none">Workouts</Text>
      </TouchableOpacity>

      {/* ─── 4. STREAK ─── */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={handleStreakPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Streak Tracker"
      >
        <View style={styles.badgeWrapper} pointerEvents="none">
          <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox={`0 0 ${BADGE_SIZE} ${BADGE_SIZE}`} pointerEvents="none">
            <Defs>
              {/* Flame Vertical Gradient */}
              <LinearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFA100" stopOpacity="0.9" />
                <Stop offset="50%" stopColor="#FF4B00" stopOpacity="0.75" />
                <Stop offset="100%" stopColor="#7E1700" stopOpacity="0.3" />
              </LinearGradient>
              {/* Inner Ember Glow */}
              <RadialGradient
                id="emberGlow"
                cx="50%"
                cy="60%"
                r="50%"
                fx="50%"
                fy="60%"
              >
                <Stop offset="0%" stopColor="#FF5722" stopOpacity="0.35" />
                <Stop offset="70%" stopColor="#B71C1C" stopOpacity="0.12" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Dark ember base */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={27}
              fill="#140804"
            />

            {/* Ember glow backdrop */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={25}
              fill="url(#emberGlow)"
            />

            {/* Stylized organic flame silhouette behind the number */}
            <Path
              d="M 32 15 C 30.5 21 24.5 25 24.5 31 C 24.5 36.5 28 41 32 47 C 36 41 39.5 36.5 39.5 31 C 39.5 25 33.5 21 32 15 Z"
              fill="url(#flameGrad)"
            />
            {/* Flame inner bright core */}
            <Path
              d="M 32 24 C 31 28 27.5 31 27.5 34.5 C 27.5 38 29.5 41.5 32 45 C 34.5 41.5 36.5 38 36.5 34.5 C 36.5 31 33 28 32 24 Z"
              fill="#FFA726"
              opacity={0.65}
            />

            {/* Outer fiery copper ring */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={26.5}
              stroke="#D9480F"
              strokeWidth={2}
              fill="transparent"
            />
          </Svg>

          <View style={styles.badgeContent} pointerEvents="none">
            <Text style={styles.valueText}>{streakDays}</Text>
          </View>
        </View>
        <Text style={styles.labelText} pointerEvents="none">Streak</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    marginTop: 24,
    marginBottom: 16,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: BADGE_SIZE,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  badgeWrapper: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.2,
  },
});
