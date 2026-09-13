import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Check, X, Bell, Swords, UserPlus, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';

export interface PendingChallengeItem {
  id: string;
  fromName: string;
  fromRank: string;
  fromLevel: number;
  avatar?: string | null;
  avatarColor: string;
  challengeTitle: string;
  workoutType?: string;
  xpReward?: number;
  sentAt?: string;
}

export interface PendingRequestItem {
  id: string;
  name: string;
  avatar?: string | null;
  phone?: string;
  avatarColor: string;
  initials: string;
  sentAt?: string;
}

interface PendingRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  challenges?: PendingChallengeItem[];
  requests: PendingRequestItem[];
  onAcceptChallenge?: (challengeId: string) => void;
  onDeclineChallenge?: (challengeId: string) => void;
  onAccept: (request: PendingRequestItem) => void;
  onDecline: (requestId: string) => void;
}

export default function PendingRequestsModal({
  visible,
  onClose,
  challenges = [],
  requests,
  onAcceptChallenge,
  onDeclineChallenge,
  onAccept,
  onDecline,
}: PendingRequestsModalProps) {
  const insets = useSafeAreaInsets();
  const totalCount = challenges.length + requests.length;

  const handleAcceptRequest = (item: PendingRequestItem) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onAccept(item);
  };

  const handleDeclineRequest = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDecline(id);
  };

  const handleAcceptChall = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onAcceptChallenge) onAcceptChallenge(id);
  };

  const handleDeclineChall = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onDeclineChallenge) onDeclineChallenge(id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        {/* Modal Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={8}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
            {totalCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{totalCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        {totalCount === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Bell size={28} color="rgba(255, 255, 255, 0.4)" />
            </View>
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              You have no pending challenges or friend requests at this time.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 40 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* ── SECTION 1: DUEL CHALLENGES (Friends who challenged you) ── */}
            {challenges.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Swords size={16} color="#FF6B35" />
                  <Text style={styles.sectionHeader}>
                    CHALLENGES ({challenges.length})
                  </Text>
                </View>

                <View style={styles.cardsList}>
                  {challenges.map((chall) => (
                    <View key={chall.id} style={styles.challengeCard}>
                      <Avatar
                        source={chall.avatar}
                        size={42}
                        borderColor={chall.avatarColor || '#F59E0B'}
                        borderWidth={2}
                      />

                      {/* Info */}
                      <View style={styles.cardInfo}>
                        <View style={styles.titleRow}>
                          <Text style={styles.senderName} numberOfLines={1}>
                            {chall.fromName}
                          </Text>
                          <Text style={styles.timeText}>{chall.sentAt || 'Recently'}</Text>
                        </View>
                        <Text style={styles.challengeTitle} numberOfLines={1}>
                          {chall.challengeTitle}
                        </Text>
                        {chall.workoutType && (
                          <Text style={styles.challengeDesc} numberOfLines={1}>
                            {chall.workoutType}
                          </Text>
                        )}
                        {chall.xpReward && (
                          <View style={styles.xpTag}>
                            <Zap size={10} color="#F59E0B" />
                            <Text style={styles.xpTagText}>+{chall.xpReward} XP REWARD</Text>
                          </View>
                        )}
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionButtonsRow}>
                        <Pressable
                          style={styles.declineBtn}
                          onPress={() => handleDeclineChall(chall.id)}
                          hitSlop={6}
                        >
                          <X size={15} color="rgba(255, 255, 255, 0.6)" strokeWidth={2.2} />
                        </Pressable>

                        <Pressable
                          style={styles.acceptChallengeBtn}
                          onPress={() => handleAcceptChall(chall.id)}
                          hitSlop={6}
                        >
                          <Text style={styles.acceptBtnText}>ACCEPT</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── SECTION 2: PENDING FRIEND REQUESTS ── */}
            {requests.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <UserPlus size={16} color={ACCENT_BLUE} />
                  <Text style={styles.sectionHeader}>
                    PENDING REQUESTS ({requests.length})
                  </Text>
                </View>

                <View style={styles.cardsList}>
                  {requests.map((req) => (
                    <View key={req.id} style={styles.requestCard}>
                      <Avatar
                        source={req.avatar}
                        size={42}
                        borderColor={req.avatarColor || ACCENT_BLUE}
                        borderWidth={2}
                      />

                      {/* Info Column */}
                      <View style={styles.cardInfo}>
                        <Text style={styles.senderName} numberOfLines={1}>
                          {req.name}
                        </Text>
                        <Text style={styles.requestMeta}>
                          {req.sentAt || 'Wants to connect with you'}
                        </Text>
                      </View>

                      {/* Actions (Accept / Decline) */}
                      <View style={styles.actionButtonsRow}>
                        <Pressable
                          style={styles.declineBtn}
                          onPress={() => handleDeclineRequest(req.id)}
                          hitSlop={6}
                        >
                          <X size={15} color="rgba(255, 255, 255, 0.6)" strokeWidth={2.2} />
                        </Pressable>

                        <Pressable
                          style={styles.acceptBtn}
                          onPress={() => handleAcceptRequest(req)}
                          hitSlop={6}
                        >
                          <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.acceptBtnText}>ACCEPT</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0E1015',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  headerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 36,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 24,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    ...typography.h2,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
  },
  cardsList: {
    gap: 10,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.25)',
    gap: 10,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  rankAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankAvatarText: {
    fontSize: 17,
    fontWeight: '900',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  senderName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
  },
  challengeTitle: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeDesc: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  xpTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  xpTagText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  requestMeta: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  acceptChallengeBtn: {
    backgroundColor: ACCENT_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ACCENT_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 19,
  },
});
