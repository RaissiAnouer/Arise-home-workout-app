import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import {
  Crown,
  Shield,
  Swords,
  Flame,
  Dumbbell,
  UserMinus,
  ArrowUpRight,
  Zap,
  MoreVertical,
  X,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GuildMember, GuildMemberRole } from '../../types/guild';
import { typography } from '../../styles/typography';
import { RANK_CONFIG } from '../../data/levelConfig';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';

interface GuildMembersSectionProps {
  members: GuildMember[];
  isCurrentUserLeader: boolean;
  onKickMember?: (memberId: string) => Promise<void>;
  onPromoteMember?: (memberId: string, role: GuildMemberRole) => Promise<void>;
  onDuelMember?: (member: GuildMember) => void;
}

export default function GuildMembersSection({
  members,
  isCurrentUserLeader,
  onKickMember,
  onPromoteMember,
  onDuelMember,
}: GuildMembersSectionProps) {
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);

  const getRoleBadge = (role: GuildMemberRole) => {
    switch (role) {
      case 'leader':
        return { label: 'GUILD MASTER', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', icon: Crown };
      case 'officer':
        return { label: 'OFFICER', bg: 'rgba(139, 92, 246, 0.15)', color: '#A855F7', icon: Swords };
      case 'elite':
        return { label: 'ELITE HUNTER', bg: 'rgba(56, 182, 255, 0.15)', color: '#38B6FF', icon: Zap };
      default:
        return { label: 'MEMBER', bg: 'rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.5)', icon: Shield };
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
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Guild Roster ({members.length})</Text>
        <Text style={styles.sectionSub}>All active guild members & ranks</Text>
      </View>

      {/* Members List */}
      <View style={styles.membersList}>
        {members.map((m) => {
          const isCurrentUser = m.isCurrentUser || m.id === 'current_user_hunter';
          const roleData = getRoleBadge(m.role);
          const rankColor = RANK_CONFIG[m.rank]?.color || '#4080E7';
          const RoleIcon = roleData.icon;

          return (
            <Pressable
              key={m.id}
              style={[styles.memberCard, isCurrentUser && styles.currentUserCard]}
              onPress={() => {
                if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMember(m);
              }}
            >
              {/* Avatar Circle with Online indicator */}
              <View style={styles.avatarWrap}>
                <Avatar
                  source={m.avatar}
                  size={38}
                  borderColor={rankColor}
                  borderWidth={2}
                />
                <View style={[styles.onlineDot, { backgroundColor: m.isOnline ? '#10B981' : '#6B7280' }]} />
              </View>

              {/* Info Column */}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={[styles.nameText, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
                    {m.username}
                  </Text>
                  <View style={[styles.rankBadge, { borderColor: rankColor }]}>
                    <Text style={[styles.rankText, { color: rankColor }]}>{m.rank}</Text>
                  </View>
                </View>

                {/* Role Pill */}
                <View style={[styles.rolePill, { backgroundColor: roleData.bg }]}>
                  <RoleIcon size={10} color={roleData.color} />
                  <Text style={[styles.roleText, { color: roleData.color }]}>{roleData.label}</Text>
                </View>
              </View>

              {/* Stats Column */}
              <View style={styles.statsCol}>
                <Text style={styles.statXp}>{m.monthlyContributionXp.toLocaleString()} EXP</Text>
                <View style={styles.subStatsRow}>
                  <Text style={styles.statSub}>Lv.{m.level}</Text>
                  <Text style={styles.statDot}>•</Text>
                  <Text style={styles.statSub}>{m.streakDays}d Streak</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Member Details / Action Modal */}
      {selectedMember && (
        <Modal
          visible={Boolean(selectedMember)}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedMember(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.memberActionSheet}>
              {/* Header with Close */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Hunter Profile</Text>
                <Pressable onPress={() => setSelectedMember(null)} style={styles.sheetCloseBtn}>
                  <X size={18} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Hunter Card Summary */}
              <View style={styles.sheetHunterCard}>
                <Avatar
                  source={selectedMember.avatar}
                  size={52}
                  borderColor={RANK_CONFIG[selectedMember.rank]?.color || '#4080E7'}
                  borderWidth={2}
                />
                <View style={styles.sheetMeta}>
                  <Text style={styles.sheetName}>{selectedMember.username}</Text>
                  <Text style={styles.sheetSub}>
                    Lv.{selectedMember.level} · {selectedMember.rank} Hunter
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.sheetStatsGrid}>
                <View style={styles.statBox}>
                  <Zap size={16} color="#4080E7" />
                  <Text style={styles.statBoxNum}>{selectedMember.monthlyContributionXp.toLocaleString()}</Text>
                  <Text style={styles.statBoxLabel}>Monthly EXP</Text>
                </View>
                <View style={styles.statBox}>
                  <Dumbbell size={16} color="#38B6FF" />
                  <Text style={styles.statBoxNum}>{selectedMember.totalWorkoutsCompleted}</Text>
                  <Text style={styles.statBoxLabel}>Workouts</Text>
                </View>
                <View style={styles.statBox}>
                  <Flame size={16} color="#F97316" />
                  <Text style={styles.statBoxNum}>{selectedMember.streakDays}d</Text>
                  <Text style={styles.statBoxLabel}>Streak</Text>
                </View>
              </View>

              {/* Actions */}
              {!selectedMember.isCurrentUser && selectedMember.id !== 'current_user_hunter' && (
                <View style={styles.sheetActionsCol}>
                  <Pressable
                    style={styles.sheetDuelBtn}
                    onPress={() => {
                      const target = selectedMember;
                      setSelectedMember(null);
                      if (onDuelMember) onDuelMember(target);
                    }}
                  >
                    <Swords size={16} color="#000000" strokeWidth={2.4} />
                    <Text style={styles.sheetDuelBtnText}>CHALLENGE TO 1V1 DUEL</Text>
                  </Pressable>

                  {/* Leader Controls */}
                  {isCurrentUserLeader && (
                    <View style={styles.leaderActionsRow}>
                      {selectedMember.role !== 'officer' ? (
                        <Pressable
                          style={styles.promoteBtn}
                          onPress={async () => {
                            if (onPromoteMember) await onPromoteMember(selectedMember.id, 'officer');
                            setSelectedMember(null);
                          }}
                        >
                          <Text style={styles.promoteBtnText}>PROMOTE TO OFFICER</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={styles.promoteBtn}
                          onPress={async () => {
                            if (onPromoteMember) await onPromoteMember(selectedMember.id, 'member');
                            setSelectedMember(null);
                          }}
                        >
                          <Text style={styles.promoteBtnText}>DEMOTE TO MEMBER</Text>
                        </Pressable>
                      )}

                      <Pressable style={styles.kickBtn} onPress={() => handleKick(selectedMember)}>
                        <UserMinus size={14} color="#EF4444" />
                        <Text style={styles.kickBtnText}>REMOVE</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
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
  membersList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  currentUserCard: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    marginRight: 10,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  avatarInitials: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#181A20',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 130,
  },
  currentUserName: {
    color: '#38B6FF',
    fontWeight: '700',
  },
  rankBadge: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  rankText: {
    fontSize: 9,
    fontWeight: '800',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statsCol: {
    alignItems: 'flex-end',
  },
  statXp: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
  },
  statDot: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  memberActionSheet: {
    backgroundColor: '#181A20',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHunterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27272A',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sheetAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sheetMeta: {
    flex: 1,
  },
  sheetName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  sheetSub: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  sheetStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statBoxNum: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  statBoxLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
  },
  sheetActionsCol: {
    gap: 10,
  },
  sheetDuelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
  },
  sheetDuelBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  leaderActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoteBtn: {
    flex: 1,
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderColor: 'rgba(64, 128, 231, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoteBtnText: {
    color: '#4080E7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  kickBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
});
