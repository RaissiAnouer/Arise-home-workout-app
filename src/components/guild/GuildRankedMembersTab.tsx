import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {
  Crown,
  Shield,
  Swords,
  Flame,
  Zap,
  Check,
  X,
  UserMinus,
  ArrowUpRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GuildMember, GuildMemberRole } from '../../types/guild';
import { typography } from '../../styles/typography';
import { RANK_CONFIG } from '../../data/levelConfig';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';

interface GuildRankedMembersTabProps {
  members: GuildMember[];
  isCurrentUserLeader: boolean;
  onKickMember?: (memberId: string) => Promise<void>;
  onPromoteMember?: (memberId: string, role: GuildMemberRole) => Promise<void>;
}

export default function GuildRankedMembersTab({
  members,
  isCurrentUserLeader,
  onKickMember,
  onPromoteMember,
}: GuildRankedMembersTabProps) {
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);

  // Sort members by Level & XP descending for ranked order
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.monthlyContributionXp - a.monthlyContributionXp;
    });
  }, [members]);

  const getRankLetter = (rankStr: string) => {
    if (rankStr.startsWith('S')) return 'S';
    if (rankStr.startsWith('A')) return 'A';
    if (rankStr.startsWith('B')) return 'B';
    if (rankStr.startsWith('C')) return 'C';
    if (rankStr.startsWith('D')) return 'D';
    return 'E';
  };

  const getRankMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRoleBadge = (role: GuildMemberRole) => {
    switch (role) {
      case 'leader':
        return { label: 'MASTER', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: Crown };
      case 'officer':
        return { label: 'OFFICER', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)', icon: Swords };
      case 'elite':
        return { label: 'ELITE', color: '#38B6FF', bg: 'rgba(56, 182, 255, 0.15)', icon: Zap };
      default:
        return null;
    }
  };

  const handleKick = (member: GuildMember) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.username} from the guild?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (onKickMember) await onKickMember(member.id);
            setSelectedMember(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Table Header Row */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.thText, styles.thMember]}>MEMBER</Text>
        <Text style={[styles.thText, styles.thRank]}>RANK</Text>
        <Text style={[styles.thText, styles.thLevel]}>LEVEL</Text>
        <Text style={[styles.thText, styles.thXp]}>XP</Text>
        <Text style={[styles.thText, styles.thStreak]}>STREAK</Text>
      </View>

      {/* Member Rows */}
      <View style={styles.rowsList}>
        {sortedMembers.map((m, index) => {
          const isCurrentUser = m.isCurrentUser || m.id === 'current_user_hunter';
          const rankLetter = getRankLetter(m.rank);
          const rankConfig = RANK_CONFIG[m.rank];
          const rankColor = rankConfig?.color || '#4080E7';
          const roleBadge = getRoleBadge(m.role);
          const medal = getRankMedal(index);

          return (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                styles.memberRow,
                isCurrentUser && styles.currentUserRow,
                pressed && styles.rowPressed,
              ]}
              onPress={() => {
                if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMember(m);
              }}
            >
              {/* Member Column (Rank Medal + Avatar + Username) */}
              <View style={[styles.tdCol, styles.tdMember]}>
                <Text style={styles.rankPosition}>{medal}</Text>

                <View style={styles.avatarWrap}>
                  <Avatar
                    source={m.avatar}
                    size={34}
                    borderColor={rankColor}
                    borderWidth={1.5}
                  />
                  <View style={[styles.onlineDot, { backgroundColor: m.isOnline ? '#10B981' : '#6B7280' }]} />
                </View>

                <View style={styles.nameBlock}>
                  <Text style={[styles.usernameText, isCurrentUser && styles.currentUsernameText]} numberOfLines={1}>
                    {m.username}
                  </Text>
                  {roleBadge && (
                    <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                      <roleBadge.icon size={9} color={roleBadge.color} />
                      <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Rank Column */}
              <View style={[styles.tdCol, styles.tdRank]}>
                <View style={[styles.rankLetterBadge, { borderColor: rankColor, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <Text style={[styles.rankLetterText, { color: rankColor }]}>{rankLetter}</Text>
                </View>
              </View>

              {/* Level Column */}
              <View style={[styles.tdCol, styles.tdLevel]}>
                <Text style={styles.levelText}>{m.level}</Text>
              </View>

              {/* XP Column */}
              <View style={[styles.tdCol, styles.tdXp]}>
                <Text style={styles.xpText}>{m.monthlyContributionXp.toLocaleString()}</Text>
              </View>

              {/* Streak Column */}
              <View style={[styles.tdCol, styles.tdStreak]}>
                <View style={styles.streakWrap}>
                  <Text style={styles.streakFire}>🔥</Text>
                  <Text style={styles.streakDays}>{m.streakDays}d</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Member Details Modal */}
      {selectedMember && (
        <Modal
          visible={Boolean(selectedMember)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMember(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedMember(null)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalUserRow}>
                  <Avatar
                    source={selectedMember.avatar}
                    size={44}
                    borderColor={RANK_CONFIG[selectedMember.rank]?.color || ACCENT_BLUE}
                    borderWidth={2}
                  />
                  <View style={styles.modalUserMeta}>
                    <Text style={styles.modalUserName}>{selectedMember.username}</Text>
                    <Text style={styles.modalRankText}>
                      {selectedMember.rank} · Lv.{selectedMember.level} · {selectedMember.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => setSelectedMember(null)} style={styles.modalCloseBtn}>
                  <X size={18} color="rgba(255, 255, 255, 0.6)" />
                </Pressable>
              </View>

              {/* Member Stats Grid */}
              <View style={styles.modalStatsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{selectedMember.monthlyContributionXp.toLocaleString()}</Text>
                  <Text style={styles.statBoxLbl}>MONTHLY XP</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{selectedMember.totalWorkoutsCompleted}</Text>
                  <Text style={styles.statBoxLbl}>WORKOUTS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>🔥 {selectedMember.streakDays}d</Text>
                  <Text style={styles.statBoxLbl}>STREAK</Text>
                </View>
              </View>

              {/* Leader Management Actions */}
              {isCurrentUserLeader && selectedMember.role !== 'leader' && (
                <View style={styles.leaderActionsRow}>
                  {onPromoteMember && (
                    <Pressable
                      style={styles.promoteBtn}
                      onPress={async () => {
                        const nextRole: GuildMemberRole = selectedMember.role === 'officer' ? 'elite' : 'officer';
                        await onPromoteMember(selectedMember.id, nextRole);
                        setSelectedMember(null);
                      }}
                    >
                      <Crown size={14} color="#F59E0B" />
                      <Text style={styles.promoteBtnText}>
                        {selectedMember.role === 'officer' ? 'SET ELITE' : 'PROMOTE OFFICER'}
                      </Text>
                    </Pressable>
                  )}

                  {onKickMember && (
                    <Pressable
                      style={styles.kickBtn}
                      onPress={() => handleKick(selectedMember)}
                    >
                      <UserMinus size={14} color="#EF4444" />
                      <Text style={styles.kickBtnText}>REMOVE</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  thText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.8,
  },
  thMember: {
    flex: 2.8,
  },
  thRank: {
    flex: 1,
    textAlign: 'center',
  },
  thLevel: {
    flex: 1,
    textAlign: 'center',
  },
  thXp: {
    flex: 1.5,
    textAlign: 'right',
  },
  thStreak: {
    flex: 1.4,
    textAlign: 'right',
  },

  rowsList: {
    gap: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#131418',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currentUserRow: {
    borderColor: 'rgba(64, 128, 231, 0.5)',
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
  },
  rowPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  tdCol: {
    justifyContent: 'center',
  },
  tdMember: {
    flex: 2.8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankPosition: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    width: 20,
    textAlign: 'center',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
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
    fontSize: 12,
    fontWeight: '800',
  },
  avatarWrap: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#131418',
  },
  nameBlock: {
    flex: 1,
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  currentUsernameText: {
    color: '#4080E7',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tdRank: {
    flex: 1,
    alignItems: 'center',
  },
  rankLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLetterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tdLevel: {
    flex: 1,
    alignItems: 'center',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tdXp: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  xpText: {
    color: '#38B6FF',
    fontSize: 12,
    fontWeight: '700',
  },
  tdStreak: {
    flex: 1.4,
    alignItems: 'flex-end',
  },
  streakWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakFire: {
    fontSize: 10,
  },
  streakDays: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#181A20',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#232630',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalUserMeta: {
    gap: 2,
  },
  modalUserName: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalRankText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statBoxVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statBoxLbl: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
  },
  leaderActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  promoteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  promoteBtnText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  kickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  kickBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
});
