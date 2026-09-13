import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Crown,
  Lock,
  Globe,
  Check,
  X,
  UserCheck,
  Trash2,
  LogOut,
  ShieldAlert,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Guild } from '../../types/guild';
import { HunterRank } from '../../data/levelConfig';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

const ACCENT_BLUE = '#4080E7';

const RANK_REQUIREMENTS: HunterRank[] = [
  'E',
  'D',
  'C',
  'B',
  'A',
  'S',
  'SSS',
  'National',
];

interface GuildLeadershipModalProps {
  visible: boolean;
  onClose: () => void;
  guild: Guild;
  onAcceptRequest: (requestId: string) => Promise<void>;
  onDeclineRequest: (requestId: string) => Promise<void>;
  onUpdateSettings: (settings: Partial<Guild>) => Promise<void>;
  onDisbandGuild: () => Promise<void>;
  onLeaveGuild: () => Promise<void>;
  isLeader: boolean;
}

export default function GuildLeadershipModal({
  visible,
  onClose,
  guild,
  onAcceptRequest,
  onDeclineRequest,
  onUpdateSettings,
  onDisbandGuild,
  onLeaveGuild,
  isLeader,
}: GuildLeadershipModalProps) {
  const insets = useSafeAreaInsets();

  const [motto, setMotto] = useState(guild?.motto || '');
  const [description, setDescription] = useState(guild?.description || '');
  const [isPrivate, setIsPrivate] = useState(guild?.isPrivate || false);
  const [minRank, setMinRank] = useState<HunterRank>(guild?.minRankRequirement || 'E-Rank');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'leave' | 'disband' | null>(null);

  if (!guild) return null;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSaveSettings = async () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await onUpdateSettings({
      motto: motto.trim(),
      description: description.trim(),
      isPrivate,
      minRankRequirement: minRank,
    });
    triggerToast('Guild settings saved successfully!');
  };

  const handleExecuteLeave = async () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setConfirmAction(null);
    onClose();
    await onLeaveGuild();
  };

  const handleExecuteDisband = async () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setConfirmAction(null);
    onClose();
    await onDisbandGuild();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setConfirmAction(null);
        onClose();
      }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={8}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isLeader ? 'Guild Master Headquarters' : 'Guild Settings'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {toastMsg && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Join Requests Section (If Leader) */}
          {isLeader && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Pending Join Requests ({guild.joinRequests.length})
                </Text>
                {guild.joinRequests.length > 0 && (
                  <View style={styles.reqBadge}>
                    <Text style={styles.reqBadgeText}>{guild.joinRequests.length} NEW</Text>
                  </View>
                )}
              </View>

              {guild.joinRequests.length === 0 ? (
                <View style={styles.emptyRequestsBox}>
                  <UserCheck size={24} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyRequestsText}>No pending join requests.</Text>
                </View>
              ) : (
                <View style={styles.requestsList}>
                  {guild.joinRequests.map((req) => (
                    <View key={req.id} style={styles.requestCard}>
                      <Avatar
                        source={req.avatar}
                        size={36}
                      />
                      <View style={styles.reqInfo}>
                        <Text style={styles.reqName}>{req.username}</Text>
                        <Text style={styles.reqMeta}>
                          Lv.{req.level} · {req.rank} · {req.requestedAt}
                        </Text>
                      </View>
                      <View style={styles.reqActions}>
                        <Pressable
                          style={styles.declineReqBtn}
                          onPress={() => onDeclineRequest(req.id)}
                        >
                          <X size={15} color="rgba(255,255,255,0.6)" />
                        </Pressable>
                        <Pressable
                          style={styles.acceptReqBtn}
                          onPress={() => onAcceptRequest(req.id)}
                        >
                          <Check size={15} color="#FFFFFF" strokeWidth={2.5} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Edit Settings (If Leader) */}
          {isLeader && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Guild Customization</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GUILD MOTTO</Text>
                <TextInput
                  style={styles.textInput}
                  value={motto}
                  onChangeText={setMotto}
                  maxLength={48}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={160}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ACCESS TYPE</Text>
                <View style={styles.typeRow}>
                  <Pressable
                    style={[styles.typePill, !isPrivate && styles.typePillActive]}
                    onPress={() => setIsPrivate(false)}
                  >
                    <Globe size={14} color={!isPrivate ? '#4080E7' : 'rgba(255,255,255,0.4)'} />
                    <Text style={[styles.typePillText, !isPrivate && styles.typePillTextActive]}>
                      Public (Instant Join)
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.typePill, isPrivate && styles.typePillActive]}
                    onPress={() => setIsPrivate(true)}
                  >
                    <Lock size={14} color={isPrivate ? '#4080E7' : 'rgba(255,255,255,0.4)'} />
                    <Text style={[styles.typePillText, isPrivate && styles.typePillTextActive]}>
                      Private (Approval Required)
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MINIMUM HUNTER RANK REQUIREMENT</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ranksScroll}>
                  {RANK_REQUIREMENTS.map((r) => (
                    <Pressable
                      key={r}
                      style={[styles.rankPill, minRank === r && styles.rankPillActive]}
                      onPress={() => setMinRank(r)}
                    >
                      <Text style={[styles.rankPillText, minRank === r && styles.rankPillTextActive]}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Pressable style={styles.saveBtn} onPress={handleSaveSettings}>
                <Text style={styles.saveBtnText}>SAVE GUILD SETTINGS</Text>
              </Pressable>
            </View>
          )}

          {/* Danger Zone */}
          <View style={[styles.sectionBlock, styles.dangerBlock]}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>

            {confirmAction === 'leave' ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmPrompt}>
                  Are you sure you want to leave "{guild.name}"?
                </Text>
                <View style={styles.confirmButtonsRow}>
                  <Pressable
                    style={styles.cancelConfirmBtn}
                    onPress={() => setConfirmAction(null)}
                  >
                    <Text style={styles.cancelConfirmText}>CANCEL</Text>
                  </Pressable>
                  <Pressable
                    style={styles.actionConfirmBtn}
                    onPress={handleExecuteLeave}
                  >
                    <Text style={styles.actionConfirmText}>CONFIRM LEAVE</Text>
                  </Pressable>
                </View>
              </View>
            ) : confirmAction === 'disband' ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmPrompt}>
                  Permanently disband "{guild.name}"? All members will be removed.
                </Text>
                <View style={styles.confirmButtonsRow}>
                  <Pressable
                    style={styles.cancelConfirmBtn}
                    onPress={() => setConfirmAction(null)}
                  >
                    <Text style={styles.cancelConfirmText}>CANCEL</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionConfirmBtn, { backgroundColor: '#EF4444' }]}
                    onPress={handleExecuteDisband}
                  >
                    <Text style={styles.actionConfirmText}>CONFIRM DISBAND</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.dangerActionsList}>
                <Pressable
                  style={styles.leaveBtn}
                  onPress={() => setConfirmAction('leave')}
                >
                  <LogOut size={16} color="#EF4444" />
                  <Text style={styles.leaveBtnText}>LEAVE GUILD</Text>
                </Pressable>

                {isLeader && (
                  <Pressable
                    style={styles.disbandBtn}
                    onPress={() => setConfirmAction('disband')}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text style={styles.disbandBtnText}>DISBAND GUILD PERMANENTLY</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 36,
  },
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: '#1E2028',
    borderColor: '#4080E7',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionBlock: {
    backgroundColor: '#181A20',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reqBadge: {
    backgroundColor: ACCENT_BLUE,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reqBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyRequestsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyRequestsText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
  },
  requestsList: {
    gap: 8,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
  },
  reqAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reqAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reqInfo: {
    flex: 1,
  },
  reqName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  reqMeta: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    marginTop: 2,
  },
  reqActions: {
    flexDirection: 'row',
    gap: 6,
  },
  declineReqBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptReqBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#101114',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#FFFFFF',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#101114',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typePillActive: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
  },
  typePillText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  typePillTextActive: {
    color: '#4080E7',
    fontWeight: '700',
  },
  ranksScroll: {
    gap: 6,
  },
  rankPill: {
    backgroundColor: '#101114',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rankPillActive: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
  },
  rankPillText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  rankPillTextActive: {
    color: '#4080E7',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  dangerBlock: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerTitle: {
    ...typography.h2,
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 12,
  },
  dangerActionsList: {
    gap: 10,
  },
  confirmBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  confirmPrompt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelConfirmBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelConfirmText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionConfirmBtn: {
    flex: 1.2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionConfirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disbandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 12,
  },
  disbandBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 12,
  },
  leaveBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
