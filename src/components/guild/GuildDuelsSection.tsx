import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import {
  Swords,
  Flame,
  Zap,
  Target,
  Trophy,
  Plus,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Users,
  Check,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GuildMember, GuildDuel, GuildChallenge, DuelChallengeType } from '../../types/guild';
import { typography } from '../../styles/typography';
import { RANK_CONFIG } from '../../data/levelConfig';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';

const CHALLENGE_TYPES: { id: DuelChallengeType; title: string; desc: string }[] = [
  { id: 'most_xp_week', title: 'EXP Hunter Clash', desc: 'Accumulate the most EXP during the duel period.' },
  { id: 'most_workouts', title: 'Workout Volume Showdown', desc: 'Complete the highest number of training sessions.' },
  { id: 'longest_streak', title: 'Daily Streak Endurance', desc: 'Maintain the longest uninterrupted daily workout streak.' },
  { id: 'highest_volume', title: 'Total Volume Heavyweight', desc: 'Lift and move the most total volume in kg.' },
  { id: 'most_calories', title: 'Calorie Burn Blitz', desc: 'Burn the most workout calories.' },
];

interface GuildDuelsSectionProps {
  duels: GuildDuel[];
  challenges: GuildChallenge[];
  members: GuildMember[];
  onIssueDuel: (opponentId: string, challengeType: DuelChallengeType, durationDays: number, wagerExp: number) => Promise<any>;
  onJoinChallenge: (challengeId: string) => Promise<any>;
  onCreateChallenge?: (title: string, desc: string, category: 'workouts' | 'exp' | 'streak' | 'dungeon', goal: number, days: number, reward: number) => Promise<any>;
  isLeaderOrOfficer?: boolean;
}

export default function GuildDuelsSection({
  duels,
  challenges,
  members,
  onIssueDuel,
  onJoinChallenge,
  onCreateChallenge,
  isLeaderOrOfficer = false,
}: GuildDuelsSectionProps) {
  const [isDuelModalVisible, setIsDuelModalVisible] = useState(false);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DuelChallengeType>('most_workouts');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [wagerExp, setWagerExp] = useState<number>(500);

  const eligibleOpponents = members.filter((m) => !m.isCurrentUser && m.id !== 'current_user_hunter');

  const handleSendDuel = async () => {
    if (!selectedOpponentId) return;
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    await onIssueDuel(selectedOpponentId, selectedType, durationDays, wagerExp);
    setIsDuelModalVisible(false);
    setSelectedOpponentId(null);
  };

  return (
    <View style={styles.container}>
      {/* 1. Hunter 1v1 Duels Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <View style={styles.badgeRow}>
            <Swords size={16} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>1v1 Hunter Duels</Text>
          </View>
          <Text style={styles.sectionSub}>Challenge guild members to training showdowns</Text>
        </View>

        <Pressable
          style={styles.challengeCtaBtn}
          onPress={() => {
            if (eligibleOpponents.length > 0) {
              setSelectedOpponentId(eligibleOpponents[0].id);
            }
            setIsDuelModalVisible(true);
          }}
        >
          <Plus size={14} color="#000000" strokeWidth={2.5} />
          <Text style={styles.challengeCtaText}>ISSUE DUEL</Text>
        </Pressable>
      </View>

      {/* Duels List */}
      {duels.length === 0 ? (
        <View style={styles.emptyDuelBox}>
          <Swords size={28} color="rgba(255, 255, 255, 0.25)" />
          <Text style={styles.emptyDuelTitle}>No Active Duels</Text>
          <Text style={styles.emptyDuelSub}>
            Challenge a fellow Hunter to a 1v1 training race and earn bonus Guild EXP!
          </Text>
        </View>
      ) : (
        <View style={styles.duelsList}>
          {duels.map((duel) => {
            const total = Math.max(1, duel.challengerProgress + duel.opponentProgress);
            const challengerPct = Math.round((duel.challengerProgress / total) * 100);
            const opponentPct = 100 - challengerPct;

            return (
              <View key={duel.id} style={styles.duelCard}>
                <View style={styles.duelTopRow}>
                  <Text style={styles.duelTitle}>{duel.challengeTitle}</Text>
                  <View style={styles.daysLeftBadge}>
                    <Text style={styles.daysLeftText}>{duel.daysRemaining}d Left</Text>
                  </View>
                </View>

                {/* Head to Head Visual */}
                <View style={styles.headToHeadRow}>
                  <View style={styles.fighterCol}>
                    <Text style={styles.fighterName} numberOfLines={1}>{duel.challengerName}</Text>
                    <Text style={styles.fighterScore}>{duel.challengerProgress}</Text>
                  </View>

                  <View style={styles.vsBadge}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>

                  <View style={[styles.fighterCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.fighterName} numberOfLines={1}>{duel.opponentName}</Text>
                    <Text style={styles.fighterScore}>{duel.opponentProgress}</Text>
                  </View>
                </View>

                {/* Split Clash Progress Bar */}
                <View style={styles.clashTrack}>
                  <View style={[styles.clashFillLeft, { width: `${challengerPct}%` }]} />
                  <View style={[styles.clashFillRight, { width: `${opponentPct}%` }]} />
                </View>

                <View style={styles.duelFooter}>
                  <View style={styles.wagerTag}>
                    <Zap size={11} color="#F59E0B" />
                    <Text style={styles.wagerText}>Prize: {duel.wagerExp} EXP</Text>
                  </View>
                  <Text style={styles.statusActiveText}>● LIVE BATTLE</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 2. Guild-wide Raids & Challenges */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <View>
          <View style={styles.badgeRow}>
            <Target size={16} color="#38B6FF" />
            <Text style={styles.sectionTitle}>Guild Raids & Challenges</Text>
          </View>
          <Text style={styles.sectionSub}>Cooperative guild milestones with collective rewards</Text>
        </View>
      </View>

      <View style={styles.challengesList}>
        {challenges.map((chal) => {
          const progressPct = Math.min(100, Math.round((chal.currentProgress / chal.targetGoal) * 100));

          return (
            <View key={chal.id} style={styles.challengeCard}>
              <View style={styles.chalHeader}>
                <View style={styles.chalMeta}>
                  <Text style={styles.chalTitle}>{chal.title}</Text>
                  <Text style={styles.chalDesc}>{chal.description}</Text>
                </View>
                <View style={styles.rewardPill}>
                  <Zap size={11} color="#38B6FF" />
                  <Text style={styles.rewardPillText}>+{chal.rewardExp} EXP</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.chalProgressRow}>
                <View style={styles.chalProgressTrack}>
                  <View style={[styles.chalProgressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.chalProgressText}>{progressPct}%</Text>
              </View>

              <View style={styles.chalFooter}>
                <View style={styles.chalStatsRow}>
                  <Text style={styles.chalStatText}>
                    {chal.currentProgress.toLocaleString()} / {chal.targetGoal.toLocaleString()} {chal.unit}
                  </Text>
                  <Text style={styles.chalDot}>•</Text>
                  <Text style={styles.chalStatText}>{chal.participantsCount} Hunters Active</Text>
                </View>

                {chal.isJoined ? (
                  <View style={styles.joinedTag}>
                    <Check size={12} color="#10B981" strokeWidth={2.5} />
                    <Text style={styles.joinedTagText}>Participating</Text>
                  </View>
                ) : (
                  <Pressable style={styles.joinRaidBtn} onPress={() => onJoinChallenge(chal.id)}>
                    <Text style={styles.joinRaidBtnText}>JOIN RAID</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Modal: Issue 1v1 Duel */}
      <Modal
        visible={isDuelModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsDuelModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Issue 1v1 Hunter Duel</Text>
            <Pressable onPress={() => setIsDuelModalVisible(false)} style={styles.closeBtn}>
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
            {/* Select Opponent */}
            <Text style={styles.modalLabel}>SELECT GUILD OPPONENT</Text>
            {eligibleOpponents.length === 0 ? (
              <Text style={styles.noOpponentsText}>No other guild members available to duel yet.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.opponentsRow}>
                {eligibleOpponents.map((opp) => {
                  const isSelected = selectedOpponentId === opp.id;
                  const rankColor = RANK_CONFIG[opp.rank]?.color || '#4080E7';

                  return (
                    <Pressable
                      key={opp.id}
                      style={[styles.opponentPill, isSelected && styles.opponentPillSelected]}
                      onPress={() => setSelectedOpponentId(opp.id)}
                    >
                      <View style={{ marginBottom: 6 }}>
                        <Avatar
                          source={opp.avatar}
                          size={36}
                          borderColor={rankColor}
                          borderWidth={1.5}
                        />
                      </View>
                      <Text style={[styles.oppName, isSelected && styles.oppNameSelected]} numberOfLines={1}>
                        {opp.username}
                      </Text>
                      <Text style={styles.oppRank}>{opp.rank}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Duel Category */}
            <Text style={[styles.modalLabel, { marginTop: 18 }]}>CHOOSE DUEL CATEGORY</Text>
            <View style={styles.typeList}>
              {CHALLENGE_TYPES.map((ct) => {
                const isSelected = selectedType === ct.id;
                return (
                  <Pressable
                    key={ct.id}
                    style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                    onPress={() => setSelectedType(ct.id)}
                  >
                    <View style={styles.typeCardLeft}>
                      <Text style={[styles.typeTitle, isSelected && styles.typeTitleSelected]}>{ct.title}</Text>
                      <Text style={styles.typeDesc}>{ct.desc}</Text>
                    </View>
                    {isSelected && <Check size={18} color="#4080E7" strokeWidth={2.5} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Duration Selector */}
            <Text style={[styles.modalLabel, { marginTop: 18 }]}>DUEL DURATION</Text>
            <View style={styles.durationRow}>
              {[3, 7, 14].map((d) => (
                <Pressable
                  key={d}
                  style={[styles.durationPill, durationDays === d && styles.durationPillSelected]}
                  onPress={() => setDurationDays(d)}
                >
                  <Text style={[styles.durationText, durationDays === d && styles.durationTextSelected]}>
                    {d} Days
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Submit Duel Action */}
            <Pressable
              style={[styles.submitDuelBtn, !selectedOpponentId && styles.submitDuelBtnDisabled]}
              onPress={handleSendDuel}
              disabled={!selectedOpponentId}
            >
              <Swords size={16} color="#000000" strokeWidth={2.5} />
              <Text style={styles.submitDuelBtnText}>DECLARE 1V1 DUEL</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  challengeCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  challengeCtaText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  emptyDuelBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyDuelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyDuelSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
    lineHeight: 17,
  },
  duelsList: {
    gap: 10,
  },
  duelCard: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  duelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  duelTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  daysLeftBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  daysLeftText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '600',
  },
  headToHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fighterCol: {
    flex: 1,
  },
  fighterName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fighterScore: {
    color: '#4080E7',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  vsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  vsText: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '800',
  },
  clashTrack: {
    height: 6,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  clashFillLeft: {
    height: '100%',
    backgroundColor: '#4080E7',
  },
  clashFillRight: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  duelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wagerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  wagerText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  statusActiveText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  challengesList: {
    gap: 10,
  },
  challengeCard: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chalMeta: {
    flex: 1,
    marginRight: 10,
  },
  chalTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  chalDesc: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    lineHeight: 16,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 182, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardPillText: {
    color: '#38B6FF',
    fontSize: 11,
    fontWeight: '700',
  },
  chalProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  chalProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  chalProgressFill: {
    height: '100%',
    backgroundColor: '#38B6FF',
    borderRadius: 3,
  },
  chalProgressText: {
    color: '#38B6FF',
    fontSize: 12,
    fontWeight: '700',
    width: 38,
    textAlign: 'right',
  },
  chalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chalStatText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
  },
  chalDot: {
    color: 'rgba(255, 255, 255, 0.25)',
  },
  joinedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  joinedTagText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  joinRaidBtn: {
    backgroundColor: '#4080E7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinRaidBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0E0E10',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  noOpponentsText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
  },
  opponentsRow: {
    gap: 10,
    paddingVertical: 4,
  },
  opponentPill: {
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 10,
    width: 84,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  opponentPillSelected: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
  },
  oppAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272A',
    marginBottom: 6,
  },
  oppInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  oppName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  oppNameSelected: {
    color: '#4080E7',
    fontWeight: '700',
  },
  oppRank: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    marginTop: 2,
  },
  typeList: {
    gap: 8,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typeCardSelected: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
  },
  typeCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  typeTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  typeTitleSelected: {
    color: '#4080E7',
  },
  typeDesc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  durationPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  durationPillSelected: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  durationTextSelected: {
    color: '#4080E7',
    fontWeight: '700',
  },
  submitDuelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
  },
  submitDuelBtnDisabled: {
    opacity: 0.4,
  },
  submitDuelBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
