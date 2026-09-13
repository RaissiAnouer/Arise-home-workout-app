import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Crown, Flame, Dumbbell, Zap, Trophy, TrendingUp } from 'lucide-react-native';
import { Friend, CompareStatKey } from '../../types/friends';
import { RANK_CONFIG } from '../../data/levelConfig';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CompareProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  friend: Friend | null;
  userStats: {
    level: number;
    rank: string;
    streak: number;
    totalWorkouts: number;
    xp: number;
    weeklyXp: number;
    achievements: number;
    profilePicture?: string | null;
  };
};

type StatRow = {
  key: CompareStatKey;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  userValue: number;
  friendValue: number;
  format?: (v: number) => string;
};

export default function CompareProfileModal({
  visible,
  onClose,
  friend,
  userStats,
}: CompareProfileModalProps) {
  if (!friend) return null;

  const friendRankConfig = RANK_CONFIG[friend.rank];

  const stats: StatRow[] = [
    {
      key: 'level',
      label: 'Level',
      icon: Crown,
      userValue: userStats.level,
      friendValue: friend.level,
    },
    {
      key: 'streak',
      label: 'Streak',
      icon: Flame,
      userValue: userStats.streak,
      friendValue: friend.streak,
      format: (v) => `${v} days`,
    },
    {
      key: 'totalWorkouts',
      label: 'Workouts',
      icon: Dumbbell,
      userValue: userStats.totalWorkouts,
      friendValue: friend.totalWorkouts,
    },
    {
      key: 'xp',
      label: 'Total XP',
      icon: Zap,
      userValue: userStats.xp,
      friendValue: friend.xp,
      format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`,
    },
    {
      key: 'weeklyXp',
      label: 'Weekly XP',
      icon: TrendingUp,
      userValue: userStats.weeklyXp,
      friendValue: friend.weeklyXp,
      format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`,
    },
    {
      key: 'achievements',
      label: 'Achievements',
      icon: Trophy,
      userValue: userStats.achievements,
      friendValue: friend.achievements,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={typography.h2}>Compare Profiles</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </View>

          {/* Player Labels */}
          <View style={styles.playerRow}>
            <View style={styles.playerLabel}>
              <Avatar
                source={userStats.profilePicture}
                size={52}
                borderColor="#4080E7"
                borderWidth={2}
              />
              <Text style={styles.playerName} numberOfLines={1}>You</Text>
              <View style={[styles.rankBadge, { backgroundColor: 'rgba(64, 128, 231, 0.15)', borderColor: 'rgba(64, 128, 231, 0.3)' }]}>
                <Text style={[styles.rankText, { color: '#4080E7' }]}>Lv.{userStats.level}</Text>
              </View>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.playerLabel}>
              <Avatar
                source={friend.avatar}
                size={52}
                borderColor={friendRankConfig.color}
                borderWidth={2}
              />
              <Text style={styles.playerName} numberOfLines={1}>{friend.username}</Text>
              <View style={[styles.rankBadge, { backgroundColor: `${friendRankConfig.color}20`, borderColor: `${friendRankConfig.color}50` }]}>
                <Text style={[styles.rankText, { color: friendRankConfig.color }]}>
                  {friend.rank}-Rank
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Comparison */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.statsList}>
            {stats.map((stat) => {
              const max = Math.max(stat.userValue, stat.friendValue, 1);
              const userPct = (stat.userValue / max) * 100;
              const friendPct = (stat.friendValue / max) * 100;
              const userWins = stat.userValue > stat.friendValue;
              const tie = stat.userValue === stat.friendValue;
              const formatFn = stat.format || ((v: number) => `${v}`);
              const IconComp = stat.icon;

              return (
                <View key={stat.key} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <IconComp size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>

                  <View style={styles.statBarsRow}>
                    {/* User bar */}
                    <View style={styles.barColumn}>
                      <Text style={[
                        styles.statValue,
                        userWins && !tie && { color: '#4080E7' },
                      ]}>
                        {formatFn(stat.userValue)}
                      </Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFillLeft,
                            {
                              width: `${userPct}%`,
                              backgroundColor: userWins && !tie ? '#4080E7' : 'rgba(255,255,255,0.15)',
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Friend bar */}
                    <View style={styles.barColumn}>
                      <Text style={[
                        styles.statValue,
                        { textAlign: 'right' },
                        !userWins && !tie && { color: friendRankConfig.color },
                      ]}>
                        {formatFn(stat.friendValue)}
                      </Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFillRight,
                            {
                              width: `${friendPct}%`,
                              backgroundColor: !userWins && !tie ? friendRankConfig.color : 'rgba(255,255,255,0.15)',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Player labels
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  playerLabel: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: 100,
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  vsContainer: {
    width: 40,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 2,
  },

  // Stats
  statsList: {
    flex: 1,
  },
  statCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statBarsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  barColumn: {
    flex: 1,
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFillLeft: {
    height: '100%',
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  barFillRight: {
    height: '100%',
    borderRadius: 3,
    alignSelf: 'flex-end',
  },
});
