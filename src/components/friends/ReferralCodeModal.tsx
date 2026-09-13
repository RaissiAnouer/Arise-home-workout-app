import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Copy, Check, Sparkles, KeyRound } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ReferralService } from '../../services/ReferralService';
import { ReferralState } from '../../types/referral';
import { copyToClipboard } from '../../utils/clipboard';
import { useProgression } from '../../context/ProgressionContext';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

interface ReferralCodeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReferralCodeModal({ visible, onClose }: ReferralCodeModalProps) {
  const insets = useSafeAreaInsets();
  const { awardXp } = useProgression();

  const [referralState, setReferralState] = useState<ReferralState | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (visible) {
      loadState();
      setCopiedCode(false);
      setInputCode('');
      setFeedback(null);
    }
  }, [visible]);

  const loadState = async () => {
    const state = await ReferralService.getReferralState();
    setReferralState(state);
  };

  const handleCopyCode = async () => {
    if (!referralState) return;
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const success = await copyToClipboard(referralState.myReferralCode);
    if (success) {
      setCopiedCode(true);
      setFeedback({ message: 'Referral code copied to clipboard!', isError: false });
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleRedeem = async () => {
    if (!inputCode.trim()) {
      setFeedback({ message: 'Please enter a referral code.', isError: true });
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
      setFeedback({ message: result.message, isError: false });
      await loadState();
      setInputCode('');
    } else {
      if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback({ message: result.message, isError: true });
    }
  };

  const myCode = referralState?.myReferralCode || 'ARISE-HUNTER';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.dialogCard, { marginBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <View style={styles.headerTitleWrap}>
              <KeyRound size={18} color={ACCENT_BLUE} strokeWidth={2.4} />
              <Text style={styles.dialogTitle}>REFERRAL CODE</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color="rgba(255, 255, 255, 0.7)" />
            </Pressable>
          </View>

          {/* Feedback Banner */}
          {feedback && (
            <View
              style={[
                styles.feedbackBanner,
                feedback.isError ? styles.feedbackError : styles.feedbackSuccess,
              ]}
            >
              <Text style={styles.feedbackText}>{feedback.message}</Text>
            </View>
          )}

          {/* Section 1: User's Unique Referral Code */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionLabel}>YOUR UNIQUE CODE</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeValue}>{myCode}</Text>

              <Pressable
                style={[styles.copyBtn, copiedCode && styles.copyBtnSuccess]}
                onPress={handleCopyCode}
              >
                {copiedCode ? (
                  <>
                    <Check size={13} color="#10B981" strokeWidth={2.5} />
                    <Text style={styles.copyBtnTextSuccess}>COPIED</Text>
                  </>
                ) : (
                  <>
                    <Copy size={13} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.copyBtnText}>COPY</Text>
                  </>
                )}
              </Pressable>
            </View>
            <Text style={styles.hintText}>
              Share this code with friends. You both receive +250 EXP!
            </Text>
          </View>

          {/* Section 2: Redeem Friend's Code */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionLabel}>ENTER FRIEND'S CODE</Text>

            {referralState?.redeemedCode ? (
              <View style={styles.redeemedBox}>
                <Check size={15} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.redeemedText}>
                  Redeemed: <Text style={styles.boldWhite}>{referralState.redeemedCode}</Text> (+250 EXP)
                </Text>
              </View>
            ) : (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. ARISE-7K9"
                  placeholderTextColor="rgba(255, 255, 255, 0.35)"
                  value={inputCode}
                  onChangeText={setInputCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={18}
                />

                <Pressable
                  style={[styles.redeemBtn, isRedeeming && styles.redeemBtnDisabled]}
                  onPress={handleRedeem}
                  disabled={isRedeeming}
                >
                  <Text style={styles.redeemBtnText}>
                    {isRedeeming ? '...' : 'REDEEM'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#12141A',
    borderColor: 'rgba(64, 128, 231, 0.35)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: {
    ...typography.h2,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  feedbackError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  feedbackText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.6,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    borderColor: 'rgba(64, 128, 231, 0.3)',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ACCENT_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  copyBtnSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderWidth: 1,
  },
  copyBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  copyBtnTextSuccess: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hintText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 16,
  },
  redeemedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  redeemedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    letterSpacing: 0.8,
  },
});
