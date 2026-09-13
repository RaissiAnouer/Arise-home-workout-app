import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Crown } from 'lucide-react-native';
import { GuildMember } from '../../types/guild';
import { typography } from '../../styles/typography';
import { RANK_CONFIG } from '../../data/levelConfig';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';

interface GuildLeaderboardSectionProps {
  members: GuildMember[];
  monthlyExpTarget: number;
}

export default function GuildLeaderboardSection({
  members,
  monthlyExpTarget,
}: GuildLeaderboardSectionProps) {
  const [activeMetric, setActiveMetric] = useState<'exp' | 'workouts' | 'streak'>('exp');

  const sortedMembers = useMemo(() => {
    const list = [...members];
    if (activeMetric === 'exp') {
      return list.sort((a, b) => b.monthlyContributionXp - a.monthlyContributionXp);
    }
    if (activeMetric === 'workouts') {
      return list.sort((a, b) => b.totalWorkoutsCompleted - a.totalWorkoutsCompleted);
    }
    if (activeMetric === 'streak') {
      return list.sort((a, b) => b.streakDays - a.streakDays);
    }
    return list;
  }, [members, activeMetric]);

  const maxContribution = useMemo(() => {
    if (sortedMembers.length === 0) return 1;
    if (activeMetric === 'exp') return Math.max(1, sortedMembers[0].monthlyContributionXp);
    if (activeMetric === 'workouts') return Math.max(1, sortedMembers[0].totalWorkoutsCompleted);
    return Math.max(1, sortedMembers[0].streakDays);
  }, [sortedMembers, activeMetric]);

  const getMedalIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <View style={styles.container}>
      {/* Header & Metric Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.sectionTitle}>Monthly Guild Contribution</Text>
          <Text style={styles.sectionSub}>Ranked by active training & guild EXP</Text>
        </View>

        {/* Metric Selector Tabs */}
        <View style={styles.metricSwitchRow}>
          <Pressable
            style={[styles.metricPill, activeMetric === 'exp' && styles.metricPillActive]}
            onPress={() => setActiveMetric('exp')}
          >
            <Text style={[styles.metricPillText, activeMetric === 'exp' && styles.metricPillTextActive]}>
              EXP
            </Text>
          </Pressable>

          <Pressable
            style={[styles.metricPill, activeMetric === 'workouts' && styles.metricPillActive]}
            onPress={() => setActiveMetric('workouts')}
          >
            <Text style={[styles.metricPillText, activeMetric === 'workouts' && styles.metricPillTextActive]}>
              Workouts
            </Text>
          </Pressable>

          <Pressable
            style={[styles.metricPill, activeMetric === 'streak' && styles.metricPillActive]}
            onPress={() => setActiveMetric('streak')}
          >
            <Text style={[styles.metricPillText, activeMetric === 'streak' && styles.metricPillTextActive]}>
              Streak
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Leaderboard Cards */}
      <View style={styles.leaderboardList}>
        {sortedMembers.map((member, index) => {
          const isCurrentUser = member.isCurrentUser || member.id === 'current_user_hunter';
          const val =
            activeMetric === 'exp'
              ? member.monthlyContributionXp
              : activeMetric === 'workouts'
              ? member.totalWorkoutsCompleted
              : member.streakDays;

          const progressPercent = Math.min(100, Math.max(8, Math.round((val / maxContribution) * 100)));
          const rankColor = RANK_CONFIG[member.rank]?.color || '#3B82F6';

          return (
            <View
              key={member.id}
              style={[
                styles.memberCard,
                isCurrentUser && styles.currentUserCard,
                index === 0 && styles.topOneCard,
              ]}
            >
              {/* Rank Position */}
              <View style={styles.rankPositionCol}>
                <Text
                  style={[
                    styles.rankPosText,
                    index < 3 && styles.topThreePosText,
                    isCurrentUser && styles.currentUserPosText,
                  ]}
                >
                  {getMedalIcon(index)}
                </Text>
              </View>

              {/* Avatar Circle */}
              <View style={styles.avatarWrap}>
                <Avatar
                  source={member.avatar}
                  size={38}
                  borderColor={rankColor}
                  borderWidth={1.5}
                />
                {member.role === 'leader' && (
                  <View style={styles.crownBadge}>
                    <Crown size={8} color="#000000" />
                  </View>
                )}
              </View>

              {/* Info & Progress Bar */}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={[styles.memberName, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
                    {member.username}
                  </Text>
                  <View style={[styles.rankTag, { borderColor: rankColor }]}>
                    <Text style={[styles.rankTagText, { color: rankColor }]}>{member.rank}</Text>
                  </View>
                </View>

                {/* RPG Progress Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      isCurrentUser ? styles.progressFillUser : styles.progressFillOther,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Metric Value */}
              <View style={styles.valueCol}>
                <Text style={[styles.valueText, isCurrentUser && styles.currentUserValueText]}>
                  {activeMetric === 'exp'
                    ? `${val.toLocaleString()} EXP`
                    : activeMetric === 'workouts'
                    ? `${val} Workouts`
                    : `${val} Days`}
                </Text>
                <Text style={styles.subContribution}>
                  Lv.{member.level} · {member.totalWorkoutsCompleted} sets
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    marginBottom: 12,
  },
  headerTitleCol: {
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  metricSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#181A20',
    borderRadius: 10,
    padding: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metricPillActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.2)',
    borderColor: '#4080E7',
    borderWidth: 1,
  },
  metricPillText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  metricPillTextActive: {
    color: '#4080E7',
    fontWeight: '700',
  },
  leaderboardList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  currentUserCard: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  topOneCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  rankPositionCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rankPosText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    fontWeight: '700',
  },
  topThreePosText: {
    fontSize: 16,
  },
  currentUserPosText: {
    color: '#4080E7',
  },
  avatarWrap: {
    marginRight: 10,
    position: 'relative',
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    marginRight: 10,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  initialsBox: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    width: 13,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 120,
  },
  currentUserName: {
    color: '#38B6FF',
    fontWeight: '700',
  },
  rankTag: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  rankTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFillUser: {
    backgroundColor: '#4080E7',
  },
  progressFillOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  valueCol: {
    alignItems: 'flex-end',
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  currentUserValueText: {
    color: '#4080E7',
  },
  subContribution: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    marginTop: 2,
  },
});
