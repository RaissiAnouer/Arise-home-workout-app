import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Modal,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { LevelUpEvent } from '../context/ProgressionContext';
import { RANK_CONFIG } from '../data/levelConfig';
import SystemNotification from './SystemNotification';
import RankBadge from './rank/RankBadge';

const notificationSound = require('../sound effects/solo_leveling_notifcation_sound.mp3');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type LevelUpNotificationProps = {
  event: LevelUpEvent;
  onDismiss: () => void;
};

export default function LevelUpNotification({ event, onDismiss }: LevelUpNotificationProps) {
  const player = useAudioPlayer(notificationSound);

  // ── Shared animations ───────────────────────────────────
  const bgOpacity = useRef(new Animated.Value(0)).current;

  // ── Regular level-up animations ─────────────────────────
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // ── Rank-up animations (Smooth little-to-big expansion) ───
  const rankScale = useRef(new Animated.Value(0.08)).current;
  const rankOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;

  const isRankUp = event.rankChanged;
  const rankConfig = RANK_CONFIG[event.newRank];

  useEffect(() => {
    // Sound & haptics
    if (Platform.OS !== 'web') {
      try {
        player.seekTo(0);
        player.play();
      } catch (e) {}
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    if (isRankUp) {
      // ── Smooth little-to-big expansion animation ───────────
      Animated.parallel([
        // 1. Deep black void overlay fades in
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // 2. Badge opacity fades in quickly so the growth is fully visible
        Animated.timing(rankOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // 3. Badge scales smoothly from little (0.08) to big (1.0)
        Animated.timing(rankScale, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // 4. Rank title emerges smoothly as the badge reaches full size
        Animated.sequence([
          Animated.delay(260),
          Animated.parallel([
            Animated.timing(titleOpacity, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(titleTranslateY, {
              toValue: 0,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    } else {
      // ── Regular level-up animation ────────────────────────
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(60),
          Animated.parallel([
            Animated.timing(modalOpacity, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.spring(modalScale, {
              toValue: 1,
              friction: 7,
              tension: 80,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }
  }, []);

  const handleDismiss = () => {
    if (isRankUp) {
      onDismiss();
    } else {
      // ── Regular level-up dismiss ──────────────────────────
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
      ]).start(() => onDismiss());
    }
  };

  return (
    <Modal transparent animationType="none" visible statusBarTranslucent>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Pressable style={styles.modalRoot} onPress={handleDismiss}>
        {/* Dark Dim Overlay: Pure pitch black for rank up */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: bgOpacity,
              backgroundColor: isRankUp ? '#000000' : 'rgba(0, 0, 0, 0.85)',
            },
          ]}
        />

        {isRankUp ? (
          /* ── Rank-Up Overlay: Clean Rank Crest floating on pitch black void ─────── */
          <View style={styles.rankUpCenter}>
            {/* Rank Badge Crest */}
            <Animated.View
              style={{
                opacity: rankOpacity,
                transform: [{ scale: rankScale }],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RankBadge rank={event.newRank} size={220} showGlow={false} animated={false} />
            </Animated.View>

            {/* Rank Title Block */}
            <Animated.View
              style={{
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
                alignItems: 'center',
                marginTop: 24,
              }}
            >
              <Text style={styles.rankUpSubheader}>RANK ADVANCEMENT</Text>
              <Text
                style={[
                  styles.rankUpTitle,
                  {
                    color: rankConfig.color,
                    textShadowColor: `${rankConfig.glowColor}80`,
                  },
                ]}
              >
                {rankConfig.title}
              </Text>
            </Animated.View>
          </View>
        ) : (
          /* ── Regular Level-Up Notification ──────────────────── */
          <Animated.View
            style={[
              styles.notificationContainer,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <SystemNotification
              title="NOTIFICATION"
              visible={true}
              style={styles.systemNotification}
            >
              <View style={styles.contentBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.levelUpHeading}>Leveled up!</Text>
                </View>
              </View>
            </SystemNotification>
          </Animated.View>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // ── Rank-Up Styles ──────────────────────────────────────
  rankUpCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  rankUpSubheader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#8890A0',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  rankUpTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  // ── Regular Level-Up Styles ─────────────────────────────
  notificationContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    zIndex: 10,
  },
  systemNotification: {
    width: '100%',
  },
  contentBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    width: '100%',
  },
  titleRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
