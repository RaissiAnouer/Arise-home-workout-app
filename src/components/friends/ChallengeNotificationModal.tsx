import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import {
  Swords,
  Clock,
  Check,
  X,
  Info,
} from 'lucide-react-native';
import { Friend } from '../../types/friends';
import { RANK_CONFIG, HunterRank } from '../../data/levelConfig';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── App Default Streak Accent Blue Palette ──
const ACCENT_BLUE = '#4080E7';
const BLUE_LIGHT = '#6BA4F8';
const BLUE_BRIGHT = '#8ABEFF';
const BLUE_TEXT = '#EBF3FF';
const BLUE_DARK = '#2563EB';
const BG_DARK = '#030814';

const notificationSound = require('../../sound effects/solo_leveling_notifcation_sound.mp3');

type ChallengeNotificationModalProps = {
  visible: boolean;
  onClose: () => void;
  onStartChallenge?: (opponent: Friend) => void;
  userStats?: {
    level: number;
    rank: HunterRank;
    streak: number;
    username: string;
    xp?: number;
  };
  opponent?: Friend;
  isAlreadyChallenged?: boolean;
};

export default function ChallengeNotificationModal({
  visible,
  onClose,
  onStartChallenge,
  userStats = { level: 25, rank: 'C', streak: 12, username: 'You', xp: 4200 },
  opponent = {
    id: 'opp1',
    username: 'ShadowMonarch',
    avatar: null,
    level: 87,
    rank: 'S',
    streak: 142,
    xp: 245000,
    weeklyXp: 4200,
    totalWorkouts: 412,
    isOnline: true,
    lastActive: 'Just now',
    achievements: 48,
    favoriteWorkout: 'Full Body',
    profileFrame: null,
  },
  isAlreadyChallenged = false,
}: ChallengeNotificationModalProps) {
  let player: any = null;
  try {
    player = useAudioPlayer(notificationSound);
  } catch (e) {
    // Fallback if audio module is unavailable
  }

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.92)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.75)).current;

  // 1-Week Timer State (Starts ticking only when challenge is started)
  const [timeLeft, setTimeLeft] = useState({
    days: 6,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const [isAccepted, setIsAccepted] = useState(isAlreadyChallenged);

  useEffect(() => {
    setIsAccepted(isAlreadyChallenged);
  }, [isAlreadyChallenged]);

  // Entrance & Audio
  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web' && player) {
        try {
          player.seekTo(0);
          player.play();
        } catch (e) {}
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(40),
          Animated.parallel([
            Animated.timing(modalOpacity, {
              toValue: 1,
              duration: 240,
              useNativeDriver: true,
            }),
            Animated.spring(modalScale, {
              toValue: 1,
              friction: 7.5,
              tension: 80,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    } else {
      bgOpacity.setValue(0);
      modalOpacity.setValue(0);
      modalScale.setValue(0.92);
    }
  }, [visible]);

  // Pulsing glow loop
  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.65,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, glowAnim]);

  // 1-Week Timer Countdown - ONLY runs when challenge is started (isAccepted === true)
  useEffect(() => {
    if (!visible || !isAccepted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, isAccepted]);

  const handleDismiss = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.92,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleStart = () => {
    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsAccepted(true);
    if (onStartChallenge) {
      onStartChallenge(opponent);
    } else {
      setTimeout(() => {
        handleDismiss();
      }, 350);
    }
  };

  const userRankColor = RANK_CONFIG[userStats.rank]?.color || ACCENT_BLUE;
  const opponentRankColor = RANK_CONFIG[opponent.rank]?.color || '#F59E0B';

  const formattedTimer = isAccepted
    ? `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m ${String(timeLeft.seconds).padStart(2, '0')}s`
    : '7d 00h 00m 00s';

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            { opacity: bgOpacity },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        </Animated.View>

        {/* Modal Content Wrapper (Bigger Modal Size) */}
        <Animated.View
          style={[
            styles.dialogContainer,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          {/* Solo Leveling Notification Window */}
          <View style={styles.windowWrapper}>
            {/* Border Gradient Layer with Home Streak Blue */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowAnim }]} pointerEvents="none">
              <LinearGradient
                colors={[BLUE_DARK, ACCENT_BLUE, BLUE_LIGHT, ACCENT_BLUE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Dark Inner Panel */}
            <View style={styles.innerPanel}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: BG_DARK }]} />

              {/* ── Inner Shadow & Inset Glow Layers (Softened Streak Blue) ── */}
              <View style={styles.innerGlow} pointerEvents="none" />
              <View style={styles.innerGlow2} pointerEvents="none" />
              <View style={styles.innerGlow3} pointerEvents="none" />
              <View style={styles.innerGlow4} pointerEvents="none" />

              {/* Top Inset Shadow Gradient */}
              <LinearGradient
                colors={['rgba(64, 128, 231, 0.32)', 'rgba(64, 128, 231, 0.08)', 'transparent']}
                style={styles.innerShadowTop}
                pointerEvents="none"
              />
              {/* Bottom Inset Shadow Gradient */}
              <LinearGradient
                colors={['transparent', 'rgba(64, 128, 231, 0.08)', 'rgba(64, 128, 231, 0.32)']}
                style={styles.innerShadowBottom}
                pointerEvents="none"
              />
              {/* Left Inset Shadow Gradient */}
              <LinearGradient
                colors={['rgba(64, 128, 231, 0.24)', 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.innerShadowLeft}
                pointerEvents="none"
              />
              {/* Right Inset Shadow Gradient */}
              <LinearGradient
                colors={['transparent', 'rgba(64, 128, 231, 0.24)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.innerShadowRight}
                pointerEvents="none"
              />

              {/* Close Button */}
              <Pressable onPress={handleDismiss} style={styles.closeBtn} hitSlop={10}>
                <X size={16} color="rgba(255, 255, 255, 0.7)" strokeWidth={2.4} />
              </Pressable>

              {/* Header: Info Icon + QUEST NOTIFICATION Box */}
              <View style={styles.headerRow}>
                <View style={styles.infoIconBox}>
                  <View style={styles.infoCircle}>
                    <Info size={13} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </View>

                <View style={styles.titleBadge}>
                  <Text style={styles.titleBadgeText}>QUEST NOTIFICATION</Text>
                </View>
              </View>

              {/* Scrollable Quest Content */}
              <ScrollView
                style={styles.scrollBody}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Title: Start A Duel */}
                <View style={styles.questTitleBlock}>
                  <Text style={styles.questMainTitle}>Start A Duel</Text>
                </View>

                {/* 2. Matchup VS Row */}
                <View style={styles.vsContainer}>
                  {/* User Hunter */}
                  <View style={styles.hunterCol}>
                    <View style={[styles.avatarCircle, { borderColor: userRankColor }]}>
                      <Text style={[styles.avatarRankText, { color: userRankColor }]}>
                        {userStats.rank}
                      </Text>
                    </View>
                    <Text style={styles.hunterName} numberOfLines={1}>
                      {userStats.username}
                    </Text>
                    <Text style={styles.hunterMeta}>
                      Lv.{userStats.level} · {userStats.rank}-Rank
                    </Text>
                  </View>

                  {/* VS Badge */}
                  <View style={styles.vsBadgeCol}>
                    <View style={styles.vsCircle}>
                      <Swords size={16} color="#FFFFFF" strokeWidth={2.4} />
                    </View>
                    <Text style={styles.vsText}>VS</Text>
                  </View>

                  {/* Opponent Hunter */}
                  <View style={styles.hunterCol}>
                    <View style={[styles.avatarCircle, { borderColor: opponentRankColor }]}>
                      <Text style={[styles.avatarRankText, { color: opponentRankColor }]}>
                        {opponent.rank}
                      </Text>
                    </View>
                    <Text style={styles.hunterName} numberOfLines={1}>
                      {opponent.username}
                    </Text>
                    <Text style={styles.hunterMeta}>
                      Lv.{opponent.level} · {opponent.rank}-Rank
                    </Text>
                  </View>
                </View>

                {/* 3. Timer in the Center with White Clock Icon */}
                <View style={styles.centeredTimerRow}>
                  <Clock size={16} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.centeredTimerText}>{formattedTimer}</Text>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* ── Action Button UNDER the Notification Model (Outside) ── */}
          <View style={styles.actionsUnderModal}>
            {/* White Button: START CHALLENGE / PENDING... */}
            <Pressable
              style={({ pressed }) => [
                styles.startBtnWhite,
                isAccepted && styles.startBtnPending,
                pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
              ]}
              onPress={isAccepted ? undefined : handleStart}
            >
              {isAccepted && (
                <Clock size={17} color={ACCENT_BLUE} strokeWidth={2.4} />
              )}
              <Text
                style={[
                  styles.startBtnWhiteText,
                  isAccepted && styles.startBtnPendingText,
                ]}
              >
                {isAccepted ? 'PENDING...' : 'START CHALLENGE'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    backgroundColor: 'rgba(2, 6, 16, 0.88)',
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 440, // Bigger modal width
    alignItems: 'center',
    gap: 14,
    zIndex: 10,
  },
  windowWrapper: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.74, // Bigger modal height
    borderRadius: 22,
    overflow: 'hidden',
  },
  innerPanel: {
    margin: 1.5, // Slim 1.5px border
    borderRadius: 20.5,
    backgroundColor: BG_DARK,
    overflow: 'hidden',
    position: 'relative',
  },
  // ── Inner Glow & Inset Borders ──
  innerGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20.5,
    borderWidth: 1.5,
    borderColor: 'rgba(64, 128, 231, 0.55)',
    zIndex: 10,
  },
  innerGlow2: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20.5,
    borderWidth: 5,
    borderColor: 'rgba(64, 128, 231, 0.20)',
    zIndex: 9,
  },
  innerGlow3: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20.5,
    borderWidth: 12,
    borderColor: 'rgba(64, 128, 231, 0.08)',
    zIndex: 8,
  },
  innerGlow4: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20.5,
    borderWidth: 20,
    borderColor: 'rgba(64, 128, 231, 0.03)',
    zIndex: 7,
  },
  // ── Softened Inner Shadow Gradients ──
  innerShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 6,
  },
  innerShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 6,
  },
  innerShadowLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 24,
    zIndex: 6,
  },
  innerShadowRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 24,
    zIndex: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    gap: 8,
    zIndex: 2,
  },
  infoIconBox: {
    width: 32,
    height: 28,
    borderWidth: 1.5,
    borderColor: ACCENT_BLUE,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBadge: {
    borderWidth: 1.5,
    borderColor: ACCENT_BLUE,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 14,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  titleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: BLUE_TEXT,
    letterSpacing: 2.5,
    textShadowColor: ACCENT_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  scrollBody: {
    maxHeight: SCREEN_HEIGHT * 0.58,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 56,
    gap: 14,
  },
  questTitleBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  questMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.4,
    textAlign: 'center',
    textShadowColor: 'rgba(64, 128, 231, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  hunterCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRankText: {
    fontSize: 19,
    fontWeight: '900',
  },
  hunterName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hunterMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  vsBadgeCol: {
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(64, 128, 231, 0.22)',
    borderWidth: 1.5,
    borderColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  // ── Centered Timer Row with Clock Icon ──
  centeredTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingVertical: 8,
    marginTop: 4,
  },
  centeredTimerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: 'rgba(64, 128, 231, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  // ── Action Button Underneath Notification Window ──
  actionsUnderModal: {
    width: '100%',
    alignItems: 'center',
  },
  startBtnWhite: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnPending: {
    backgroundColor: 'rgba(64, 128, 231, 0.22)',
    borderWidth: 1.5,
    borderColor: ACCENT_BLUE,
    opacity: 0.95,
  },
  startBtnWhiteText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  startBtnPendingText: {
    color: ACCENT_BLUE,
  },
});
