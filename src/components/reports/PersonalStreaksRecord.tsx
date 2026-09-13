import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Flame, Trophy, Calendar, Zap, Target, TrendingUp } from 'lucide-react-native';
import { typography } from '../../styles/typography';

interface PersonalStreaksRecordProps {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  firstWorkoutDate: string | null;
}

// Streak milestone thresholds and their labels
const MILESTONES = [
  { days: 7, label: '7-Day', color: '#4080E7' },
  { days: 14, label: '14-Day', color: '#5B93ED' },
  { days: 30, label: '30-Day', color: '#FF9F43' },
  { days: 60, label: '60-Day', color: '#FF6B35' },
  { days: 100, label: '100-Day', color: '#EE5A24' },
  { days: 365, label: '365-Day', color: '#FF4757' },
];

export default function PersonalStreaksRecord({
  currentStreak,
  longestStreak,
  totalWorkouts,
  firstWorkoutDate,
}: PersonalStreaksRecordProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate days since first workout
  const daysSinceStart = firstWorkoutDate
    ? Math.max(1, Math.floor((Date.now() - new Date(firstWorkoutDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Consistency rate (workouts / days since start)
  const consistencyRate = daysSinceStart > 0
    ? Math.min(100, Math.round((totalWorkouts / daysSinceStart) * 100))
    : 0;

  // Determine next milestone
  const nextMilestone = MILESTONES.find(m => m.days > longestStreak) || MILESTONES[MILESTONES.length - 1];
  const nextMilestoneProgress = nextMilestone
    ? Math.min(100, Math.round((longestStreak / nextMilestone.days) * 100))
    : 100;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Personal Streaks</Text>

      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Current + Longest Streak Cards */}
        <View style={styles.topRow}>
          <View style={[styles.streakCard, styles.currentStreakCard]}>
            <View style={styles.streakCardIconRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 107, 53, 0.15)' }]}>
                <Flame size={18} color="#FF6B35" />
              </View>
            </View>
            <Text style={styles.streakValue}>{currentStreak}</Text>
            <Text style={styles.streakUnit}>day{currentStreak !== 1 ? 's' : ''}</Text>
            <Text style={styles.streakLabel}>CURRENT STREAK</Text>
          </View>

          <View style={[styles.streakCard, styles.bestStreakCard]}>
            <View style={styles.streakCardIconRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(64, 128, 231, 0.15)' }]}>
                <Trophy size={18} color="#4080E7" />
              </View>
            </View>
            <Text style={styles.streakValue}>{longestStreak}</Text>
            <Text style={styles.streakUnit}>day{longestStreak !== 1 ? 's' : ''}</Text>
            <Text style={styles.streakLabel}>LONGEST STREAK</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Calendar size={13} color="#4080E7" />
            <Text style={styles.statPillText}>{daysSinceStart} days active</Text>
          </View>
          <View style={styles.statPill}>
            <TrendingUp size={13} color="#4080E7" />
            <Text style={styles.statPillText}>{consistencyRate}% consistency</Text>
          </View>
        </View>

        {/* Next Milestone Progress */}
        {longestStreak < MILESTONES[MILESTONES.length - 1].days && (
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <View style={styles.milestoneHeaderLeft}>
                <Target size={14} color={nextMilestone.color} />
                <Text style={styles.milestoneTitle}>Next Milestone</Text>
              </View>
              <Text style={[styles.milestoneTarget, { color: nextMilestone.color }]}>
                {nextMilestone.label}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${nextMilestoneProgress}%`,
                    backgroundColor: nextMilestone.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.milestoneSubtext}>
              {longestStreak} / {nextMilestone.days} days — {nextMilestone.days - longestStreak} to go
            </Text>
          </View>
        )}

        {/* Milestone Badges */}
        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>Milestones</Text>
          <View style={styles.badgesGrid}>
            {MILESTONES.map((milestone) => {
              const achieved = longestStreak >= milestone.days;
              return (
                <View
                  key={milestone.days}
                  style={[
                    styles.badge,
                    achieved && { borderColor: milestone.color, backgroundColor: `${milestone.color}10` },
                  ]}
                >
                  <Zap
                    size={16}
                    color={achieved ? milestone.color : 'rgba(255,255,255,0.15)'}
                  />
                  <Text
                    style={[
                      styles.badgeDays,
                      achieved && { color: milestone.color },
                    ]}
                  >
                    {milestone.days}
                  </Text>
                  <Text
                    style={[
                      styles.badgeLabel,
                      achieved && { color: 'rgba(255,255,255,0.7)' },
                    ]}
                  >
                    {achieved ? 'Reached' : 'Locked'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    ...typography.h2,
  },

  // ─── Top Row (Current + Longest) ──────────────────────────────
  topRow: {
    flexDirection: 'row',
    gap: 10,
  },
  streakCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 2,
        }),
  },
  currentStreakCard: {
    backgroundColor: 'rgba(255, 107, 53, 0.06)',
    borderColor: 'rgba(255, 107, 53, 0.25)',
  },
  bestStreakCard: {
    backgroundColor: 'rgba(64, 128, 231, 0.06)',
    borderColor: 'rgba(64, 128, 231, 0.25)',
  },
  streakCardIconRow: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  streakUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    marginTop: -2,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
    marginTop: 6,
  },

  // ─── Stats Row ────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
  },

  // ─── Milestone Progress ───────────────────────────────────────
  milestoneCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  milestoneTarget: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneSubtext: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
  },

  // ─── Badges Grid ──────────────────────────────────────────────
  badgesContainer: {
    gap: 10,
  },
  badgesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.3,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 4,
  },
  badgeDays: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.2)',
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
