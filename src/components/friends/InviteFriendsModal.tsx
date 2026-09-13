import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Share,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Copy,
  Check,
  Share2,
  UserPlus,
  Sparkles,
  Award,
  MessageSquare,
  Send,
  Mail,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ReferralService } from '../../services/ReferralService';
import { ReferralState } from '../../types/referral';
import { copyToClipboard } from '../../utils/clipboard';
import { useProgression } from '../../context/ProgressionContext';
import PrimaryButton from '../PrimaryButton';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

interface InviteFriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InviteFriendsModal({ visible, onClose }: InviteFriendsModalProps) {
  const insets = useSafeAreaInsets();
  const { awardXp } = useProgression();

  const [referralState, setReferralState] = useState<ReferralState | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Redeem input state
  const [inputCode, setInputCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  // Animation values
  const toastFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadState();
      setCopiedCode(false);
      setCopiedLink(false);
      setInputCode('');
    }
  }, [visible]);

  const loadState = async () => {
    const state = await ReferralService.getReferralState();
    setReferralState(state);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);

    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  };

  const handleCopyCode = async () => {
    if (!referralState) return;
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const success = await copyToClipboard(referralState.myReferralCode);
    if (success) {
      setCopiedCode(true);
      showToast('Referral code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleCopyLink = async () => {
    if (!referralState) return;
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const success = await copyToClipboard(referralState.referralLink);
    if (success) {
      setCopiedLink(true);
      showToast('Referral link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareInvite = async () => {
    if (!referralState) return;
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const message = `Join me on Arise! Awaken your hunter potential, conquer daily workouts, and use my referral code ${referralState.myReferralCode} when you sign up: ${referralState.referralLink}`;

    try {
      await Share.share({
        message,
        title: 'Join me on Arise!',
      });
    } catch (e) {
      console.error('Share error', e);
    }
  };

  const handleRedeemCode = async () => {
    if (!inputCode.trim()) {
      showToast('Please enter a referral code.', 'error');
      return;
    }

    setIsRedeeming(true);
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ReferralService.redeemCode(inputCode);
    setIsRedeeming(false);

    if (result.success) {
      if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.expReward) {
        awardXp(result.expReward, 'daily_quest');
      }
      setRedeemSuccess(true);
      showToast(result.message, 'success');
      await loadState();
      setInputCode('');
    } else {
      if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(result.message, 'error');
    }
  };

  const myCode = referralState?.myReferralCode || 'ARISE-HUNTER';
  const myLink = referralState?.referralLink || `https://arise.app/invite/${myCode}`;
  const totalRecruits = referralState?.referredHunters.length || 0;
  const totalExp = referralState?.totalExpEarned || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          {/* Handle Bar */}
          <View style={styles.handleBarWrap}>
            <View style={styles.handleBar} />
          </View>

          {/* Toast Notification */}
          {toastMessage && (
            <Animated.View
              style={[
                styles.toastContainer,
                toastType === 'error' ? styles.toastError : styles.toastSuccess,
                { opacity: toastFade },
              ]}
            >
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          )}

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconBadge}>
                <UserPlus size={18} color={ACCENT_BLUE} strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.headerTitle}>INVITE FRIENDS</Text>
                <Text style={styles.headerSubtitle}>
                  Earn +250 EXP for each Hunter you recruit
                </Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color="rgba(255, 255, 255, 0.7)" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Option 1: Referral Code & Link ─────────────────── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Sparkles size={16} color={ACCENT_BLUE} />
                <Text style={styles.sectionTitle}>YOUR REFERRAL CODE</Text>
              </View>

              {/* Code Box */}
              <View style={styles.codeDisplayCard}>
                <View style={styles.codeTextCol}>
                  <Text style={styles.codeLabel}>REFERRAL CODE</Text>
                  <Text style={styles.codeValue}>{myCode}</Text>
                </View>

                <Pressable
                  style={[styles.copyBtn, copiedCode && styles.copyBtnSuccess]}
                  onPress={handleCopyCode}
                  hitSlop={6}
                >
                  {copiedCode ? (
                    <>
                      <Check size={14} color="#10B981" strokeWidth={2.5} />
                      <Text style={styles.copyBtnTextSuccess}>COPIED</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={14} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.copyBtnText}>COPY</Text>
                    </>
                  )}
                </Pressable>
              </View>

              {/* Link Box */}
              <View style={styles.linkRow}>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkLabel}>INVITE LINK</Text>
                  <Text style={styles.linkText} numberOfLines={1}>
                    {myLink}
                  </Text>
                </View>

                <Pressable
                  style={[styles.copyLinkBtn, copiedLink && styles.copyBtnSuccess]}
                  onPress={handleCopyLink}
                  hitSlop={6}
                >
                  {copiedLink ? (
                    <Check size={13} color="#10B981" strokeWidth={2.5} />
                  ) : (
                    <Copy size={13} color="rgba(255, 255, 255, 0.8)" strokeWidth={2.2} />
                  )}
                  <Text style={[styles.copyLinkText, copiedLink && styles.copyBtnTextSuccess]}>
                    {copiedLink ? 'COPIED' : 'COPY LINK'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* ── Option 2: Invite via Apps ──────────────────────── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Share2 size={16} color={ACCENT_BLUE} />
                <Text style={styles.sectionTitle}>INVITE VIA APPS</Text>
              </View>

              <Text style={styles.shareDesc}>
                Share your invite directly to WhatsApp, Messages, Telegram, Gmail, or any installed app.
              </Text>

              <PrimaryButton
                title="SHARE INVITE"
                icon={<Share2 size={17} color="#000000" strokeWidth={2.4} />}
                onPress={handleShareInvite}
                style={styles.mainShareBtn}
              />

              {/* Quick App Shortcut Chips */}
              <View style={styles.appChipsRow}>
                <Pressable style={styles.appChip} onPress={handleShareInvite}>
                  <MessageSquare size={14} color="#25D366" />
                  <Text style={styles.appChipText}>WhatsApp</Text>
                </Pressable>

                <Pressable style={styles.appChip} onPress={handleShareInvite}>
                  <Send size={14} color="#0088CC" />
                  <Text style={styles.appChipText}>Telegram</Text>
                </Pressable>

                <Pressable style={styles.appChip} onPress={handleShareInvite}>
                  <Mail size={14} color="#EA4335" />
                  <Text style={styles.appChipText}>Gmail</Text>
                </Pressable>

                <Pressable style={styles.appChip} onPress={handleShareInvite}>
                  <Share2 size={14} color={ACCENT_BLUE} />
                  <Text style={styles.appChipText}>More Apps</Text>
                </Pressable>
              </View>
            </View>

            {/* ── Option 3: Redeem Referral Code ──────────────────── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Award size={16} color="#F59E0B" />
                <Text style={styles.sectionTitle}>HAVE AN INVITE CODE?</Text>
              </View>

              {referralState?.redeemedCode ? (
                <View style={styles.redeemedSuccessBox}>
                  <Check size={16} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.redeemedSuccessText}>
                    Redeemed code: <Text style={styles.boldWhite}>{referralState.redeemedCode}</Text> (+250 EXP Claimed)
                  </Text>
                </View>
              ) : (
                <View style={styles.redeemInputRow}>
                  <TextInput
                    style={styles.redeemInput}
                    placeholder="Enter friend's code (e.g. ARISE-7K9)"
                    placeholderTextColor="rgba(255, 255, 255, 0.35)"
                    value={inputCode}
                    onChangeText={setInputCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={18}
                  />

                  <Pressable
                    style={[styles.redeemBtn, isRedeeming && styles.redeemBtnDisabled]}
                    onPress={handleRedeemCode}
                    disabled={isRedeeming}
                  >
                    <Text style={styles.redeemBtnText}>
                      {isRedeeming ? '...' : 'REDEEM'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* ── Option 4: Recruitment Stats ─────────────────────── */}
            <View style={styles.statsRow}>
              <View style={styles.statMiniCard}>
                <Users size={16} color={ACCENT_BLUE} />
                <Text style={styles.statMiniLabel}>RECRUITS</Text>
                <Text style={styles.statMiniValue}>{totalRecruits}</Text>
              </View>

              <View style={styles.statMiniCard}>
                <Sparkles size={16} color="#F59E0B" />
                <Text style={styles.statMiniLabel}>EXP EARNED</Text>
                <Text style={styles.statMiniValue}>+{totalExp} XP</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#0F1015',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: 'rgba(64, 128, 231, 0.25)',
    borderWidth: 1,
    maxHeight: '90%',
  },
  handleBarWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toastContainer: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    zIndex: 99,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: '#16221D',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  toastError: {
    backgroundColor: '#241417',
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    borderColor: 'rgba(64, 128, 231, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 16,
    gap: 14,
  },

  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },

  codeDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    borderColor: 'rgba(64, 128, 231, 0.35)',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  codeTextCol: {
    gap: 2,
  },
  codeLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  codeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACCENT_BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyBtnSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
  },
  copyBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  copyBtnTextSuccess: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  linkTextWrap: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  linkText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  copyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyLinkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },

  shareDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  mainShareBtn: {
    width: '100%',
  },
  appChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 4,
  },
  appChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  appChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  redeemedSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  redeemedSuccessText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  redeemInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redeemInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemBtnDisabled: {
    opacity: 0.5,
  },
  redeemBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statMiniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statMiniLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  statMiniValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 'auto',
  },
});
