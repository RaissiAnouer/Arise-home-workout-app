import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import {
  Flame,
  Clock,
  Trophy,
  CheckCircle2,
  Zap,
} from 'lucide-react-native';
import { GuildMember } from '../../types/guild';
import { typography } from '../../styles/typography';
import { RANK_CONFIG } from '../../data/levelConfig';

const ACCENT_BLUE = '#4080E7';

interface GuildWeeklyChallengeTabProps {
  members: GuildMember[];
}

export default function GuildWeeklyChallengeTab({ members }: GuildWeeklyChallengeTabProps) {
  // Compute weekly workout hours for each member based on their stats
  const memberChallenges = useMemo(() => {
    return members.map((m, idx) => {
      // Deterministic workout hours this week (between 2.5h and 7.5h)
      const baseHours = Number(((m.monthlyContributionXp % 35) / 10 + 2.5 + (idx % 3) * 0.8).toFixed(1));
      const goalHours = 6.0; // 6 hours weekly target
      const progressPct = Math.min(100, Math.round((baseHours / goalHours) * 100));
      const workoutsThisWeek = Math.max(1, Math.round(baseHours * 1.2));
      const isCompleted = baseHours >= goalHours;

      return {
        member: m,
        hours: baseHours,
        goalHours,
        progressPct,
        workoutsThisWeek,
        isCompleted,
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [members]);

  const totalGuildHours = useMemo(() => {
    return memberChallenges.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);
  }, [memberChallenges]);

  const collectiveGoal = (members.length * 6.0).toFixed(0);
  const collectiveProgress = Math.min(
    100,
    Math.round((Number(totalGuildHours) / Math.max(1, Number(collectiveGoal))) * 100)
  );

  return (
    <View style={styles.container}>
      {/* Collective Guild Challenge Summary Header */}
      <View style={styles.challengeHeaderCard}>
        <View style={styles.challengeHeaderTop}>
          <View style={styles.challengeTitleCol}>
            <View style={styles.challengeTagRow}>
              <View style={styles.activeTagBadge}>
                <View style={styles.activeTagDot} />
                <Text style={styles.activeTagText}>ACTIVE CHALLENGE</Text>
              </View>
              <Text style={styles.daysLeftText}>3 Days Left</Text>
            </View>
            <Text style={styles.challengeTitle}>Weekly Workout Endurance</Text>
            <Text style={styles.challengeSub}>
              Every member trains towards the 6.0 hrs weekly workout goal.
            </Text>
          </View>

          <View style={styles.trophyIconWrap}>
            <Trophy size={26} color="#F59E0B" />
          </View>
        </View>

        {/* Collective Progress Bar */}
        <View style={styles.collectiveProgressSection}>
          <View style={styles.collectiveMetaRow}>
            <Text style={styles.collectiveLbl}>Guild Collective Hours</Text>
            <Text style={styles.collectiveVal}>
              {totalGuildHours} / {collectiveGoal} hrs ({collectiveProgress}%)
            </Text>
          </View>
          <View style={styles.collectiveTrack}>
            <View style={[styles.collectiveFill, { width: `${collectiveProgress}%` }]} />
          </View>
        </View>
      </View>

      {/* Member Cards with Progress Bars */}
      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Member Workout Progress</Text>
        <Text style={styles.sectionHeadingSub}>{members.length} Hunters participating</Text>
      </View>

      <View style={styles.cardsList}>
        {memberChallenges.map(({ member, hours, goalHours, progressPct, workoutsThisWeek, isCompleted }) => {
          const isCurrentUser = member.isCurrentUser || member.id === 'current_user_hunter';
          const rankColor = RANK_CONFIG[member.rank]?.color || ACCENT_BLUE;

          return (
            <View
              key={member.id}
              style={[styles.memberChallengeCard, isCurrentUser && styles.currentUserChallengeCard]}
            >
              {/* Member Top Info Row */}
              <View style={styles.cardTopRow}>
                <View style={styles.memberInfoCol}>
                  <View style={[styles.avatarCircle, { borderColor: rankColor }]}>
                    {member.avatar ? (
                      <Image source={{ uri: member.avatar }} style={styles.avatarImg} />
                    ) : (
                      <View style={[styles.avatarInitials, { backgroundColor: member.avatarColor || '#3B82F6' }]}>
                        <Text style={styles.initialsText}>
                          {member.initials || member.username.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.nameMetaCol}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[styles.usernameText, isCurrentUser && styles.currentUsernameText]}
                        numberOfLines={1}
                      >
                        {member.username} {isCurrentUser ? '(You)' : ''}
                      </Text>
                      <View style={[styles.rankPill, { borderColor: rankColor }]}>
                        <Text style={[styles.rankPillText, { color: rankColor }]}>{member.rank}</Text>
                      </View>
                    </View>

                    <Text style={styles.memberSubDetails}>
                      Lv.{member.level} · {workoutsThisWeek} workouts this week
                    </Text>
                  </View>
                </View>

                {/* Hours Counter Badge */}
                <View style={[styles.hoursBadge, isCompleted && styles.hoursBadgeCompleted]}>
                  {isCompleted ? (
                    <CheckCircle2 size={13} color="#10B981" />
                  ) : (
                    <Clock size={13} color="#4080E7" />
                  )}
                  <Text style={[styles.hoursBadgeText, isCompleted && styles.hoursBadgeTextCompleted]}>
                    {hours} / {goalHours}h
                  </Text>
                </View>
              </View>

              {/* Workout Hours Progress Bar */}
              <View style={styles.progressBlock}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      isCompleted ? styles.progressFillGold : styles.progressFillBlue,
                      { width: `${progressPct}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Card Footer / Stats */}
              <View style={styles.cardFooter}>
                <View style={styles.streakFooterBadge}>
                  <Flame size={11} color="#F59E0B" />
                  <Text style={styles.streakFooterText}>{member.streakDays}d streak</Text>
                </View>

                <Text style={styles.statusFooterText}>
                  {isCompleted ? 'Target Achieved! ⚡' : `${(goalHours - hours).toFixed(1)}h to target`}
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
    paddingTop: 8,
  },
  challengeHeaderCard: {
    backgroundColor: '#131418',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  challengeHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  challengeTitleCol: {
    flex: 1,
    marginRight: 12,
  },
  challengeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  activeTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  activeTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  daysLeftText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  challengeTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 16,
  },
  trophyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectiveProgressSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  collectiveMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  collectiveLbl: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  collectiveVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4080E7',
  },
  collectiveTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  collectiveFill: {
    height: '100%',
    backgroundColor: '#4080E7',
    borderRadius: 4,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    ...typography.h2,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeadingSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '600',
  },

  cardsList: {
    gap: 10,
  },
  memberChallengeCard: {
    backgroundColor: '#131418',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currentUserChallengeCard: {
    borderColor: 'rgba(64, 128, 231, 0.5)',
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  memberInfoCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  nameMetaCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  currentUsernameText: {
    color: '#4080E7',
  },
  rankPill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  rankPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  memberSubDetails: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hoursBadgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  hoursBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4080E7',
  },
  hoursBadgeTextCompleted: {
    color: '#10B981',
  },

  progressBlock: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressFillBlue: {
    backgroundColor: '#4080E7',
  },
  progressFillGold: {
    backgroundColor: '#F59E0B',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakFooterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakFooterText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  statusFooterText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '600',
  },
});
