import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, KeyRound, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import PrimaryButton from '../PrimaryButton';
import { typography } from '../../styles/typography';

interface InviteActionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  sheetProgress: SharedValue<number>;
  onOpenSearch: () => void;
  onOpenReferral: () => void;
  onShareInvite: () => void;
}

export default function InviteActionsBottomSheet({
  visible,
  onClose,
  sheetProgress,
  onOpenSearch,
  onOpenReferral,
  onShareInvite,
}: InviteActionsBottomSheetProps) {
  const insets = useSafeAreaInsets();

  const handleSearchPress = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      onOpenSearch();
    }, 250);
  };

  const handleReferralPress = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      onOpenReferral();
    }, 250);
  };

  const handleSharePress = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShareInvite();
  };

  const sheetContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      sheetProgress.value,
      [0, 1],
      [360, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Instant static backdrop without slow animation */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Reanimated.View
          style={[
            styles.sheetContainer,
            sheetContainerStyle,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Handle Drag Bar */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>INVITE & CONNECT</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color="rgba(255, 255, 255, 0.6)" />
            </Pressable>
          </View>

          {/* 3 Buttons Layout: 2 on top, 1 below */}
          <View style={styles.buttonsContainer}>
            {/* Top Row: Search & Referral Code */}
            <View style={styles.topRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && styles.secondaryBtnPressed,
                ]}
                onPress={handleSearchPress}
              >
                <Search size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.secondaryBtnText}>SEARCH</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && styles.secondaryBtnPressed,
                ]}
                onPress={handleReferralPress}
              >
                <KeyRound size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.secondaryBtnText}>REFERRAL CODE</Text>
              </Pressable>
            </View>

            {/* Bottom Button: Invite Friend */}
            <PrimaryButton
              title="INVITE FRIEND"
              onPress={handleSharePress}
              style={styles.primaryInviteBtn}
            />
          </View>
        </Reanimated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  sheetTitle: {
    ...typography.h2,
    fontSize: 15,
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
  buttonsContainer: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  primaryInviteBtn: {
    width: '100%',
  },
});
