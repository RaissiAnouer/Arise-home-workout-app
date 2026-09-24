import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Platform,
  BackHandler,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Lock } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SHADOW_CARDS,
  ShadowCard,
  RANK_CONFIG,
  RARITY_CONFIG,
  getShadowImage,
  getShadowUnlockDate,
  formatShadowDate,
  isCardUnlocked,
} from '../../src/data/shadowCardsData';
import { useProgression } from '../../src/context/ProgressionContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const UNLOCKED_CARDS_STORAGE_KEY = '@arise_unlocked_shadow_cards_v2';
const ACCENT_BLUE = '#4080E7';

export default function ShadowDetailPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    totalWorkouts,
    level,
    streakDays,
    totalExercisesCompleted,
  } = useProgression();

  // Find the selected shadow from data
  const card: ShadowCard = useMemo(() => {
    const found = SHADOW_CARDS.find((c) => c.id === id);
    if (found) return found;

    // Fallback for placeholder or missing card
    return {
      id: id || 'unknown',
      name: 'UNKNOWN SHADOW',
      title: 'Locked Shadow',
      rank: 'E-RANK',
      rarity: 'Common',
      level: 1,
      element: 'shadow',
      stats: { STR: 10, AGI: 10, END: 10, POW: 10 },
      quote: '“The shadows whisper of power yet to be awakened.”',
      description: 'A dormant shadow awaiting hunter prowess to step into reality.',
      lore: 'A dormant shadow awaiting hunter prowess.',
      unlockRequirement: 'Complete hunter trials to awaken this shadow.',
      unlockCondition: { type: 'workouts', value: 999 },
    };
  }, [id]);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [unlockDate, setUnlockDate] = useState<string | null>(null);

  // Animation values for smooth entrance
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);
  const contentTranslateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withSpring(1, {
      damping: 24,
      stiffness: 220,
    });
    contentTranslateY.value = withTiming(0, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  // Determine unlock state and unlock date dynamically
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(UNLOCKED_CARDS_STORAGE_KEY);
        const unlockedIds: string[] = raw ? JSON.parse(raw) : SHADOW_CARDS.map((c) => c.id);
        const userUnlocked = unlockedIds.includes(card.id);

        // Also check progression requirements as fallback
        const progUnlocked = isCardUnlocked(card, {
          totalWorkouts,
          level,
          streakDays,
          totalExercisesCompleted,
        });

        const activeUnlockState = userUnlocked || progUnlocked;

        if (isMounted) {
          setIsUnlocked(activeUnlockState);

          if (activeUnlockState) {
            const savedDate = await getShadowUnlockDate(card.id);
            setUnlockDate(savedDate || card.unlockDate || formatShadowDate(new Date()));
          } else {
            setUnlockDate(null);
          }
        }
      } catch (err) {
        console.warn('Error loading shadow detail status:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [card, totalWorkouts, level, streakDays, totalExercisesCompleted]);

  // Back handler for hardware back button (Android)
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/cards');
    }
  }, [router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  const animatedPageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const rankConf = RANK_CONFIG[card.rank] || RANK_CONFIG['E-RANK'];
  const rarityConf = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.Common;
  const shadowImageSource = getShadowImage(card);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background: The Shadow Image Itself with Translucent Overlay ── */}
      <View style={styles.bgArtworkWrapper} pointerEvents="none">
        <Image
          source={shadowImageSource}
          style={[
            styles.bgArtworkImage,
            { opacity: isUnlocked ? 0.85 : 0.55 },
          ]}
          blurRadius={Platform.OS === 'ios' ? 8 : 4}
          resizeMode="cover"
        />
        {/* Dark Tint Overlay to keep content perfectly readable while showcasing the shadow artwork */}
        <LinearGradient
          colors={[
            'rgba(6, 8, 16, 0.52)',
            'rgba(5, 7, 14, 0.62)',
            'rgba(3, 5, 10, 0.82)',
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Animated.View style={[styles.mainAnimatedContainer, animatedPageStyle]}>
        {/* ── Top Bar with Close / Back Button ─────────────────── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 36 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={animatedContentStyle}>
            {/* ── 2. Shadow Title ──────────────────────────────── */}
            {/* ── 2. Shadow Title ──────────────────────────────── */}
            <View style={styles.titleSection}>
              <Text style={styles.shadowTitle} numberOfLines={2}>
                {card.title || card.name}
              </Text>
            </View>

            {/* ── 3. Shadow Artwork ────────────────────────────── */}
            <View style={styles.artworkOuterContainer}>
              <View
                style={[
                  styles.artworkFrame,
                  {
                    borderColor: isUnlocked
                      ? rankConf.borderColor
                      : 'rgba(255, 255, 255, 0.14)',
                    shadowColor: isUnlocked ? rankConf.glowColor : '#000000',
                    shadowRadius: isUnlocked ? Math.max(16, rankConf.glowIntensity * 1.2) : 8,
                    shadowOpacity: isUnlocked ? 0.6 : 0.35,
                    elevation: isUnlocked ? 14 : 4,
                  },
                ]}
              >
                <Image
                  source={shadowImageSource}
                  style={[
                    styles.artworkImage,
                    !isUnlocked && styles.lockedArtworkImage,
                  ]}
                  resizeMode="cover"
                />

                {/* Bottom subtle gradient on artwork */}
                <LinearGradient
                  colors={['transparent', 'rgba(10, 14, 24, 0.45)']}
                  style={StyleSheet.absoluteFill}
                />

                {/* Locked overlay badge if locked */}
                {!isUnlocked && (
                  <View style={styles.lockedArtworkOverlay}>
                    <View style={styles.lockIconCircle}>
                      <Lock size={28} color="#FFFFFF" strokeWidth={2.4} />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* ── Unlock Information ────────────────────────── */}
            <View style={styles.unlockInfoContainer}>
              {isUnlocked ? (
                <>
                  <Text style={styles.unlockHeader}>
                    You unlocked this Shadow on
                  </Text>
                  <Text style={styles.unlockDate}>
                    {unlockDate || 'August 2, 2026'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.unlockHeaderLocked}>
                    Shadow not yet unlocked
                  </Text>
                  {card.unlockRequirement && (
                    <Text style={styles.requirementNote}>
                      {card.unlockRequirement}
                    </Text>
                  )}
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04060A',
  },
  mainAnimatedContainer: {
    flex: 1,
  },
  // Background Artwork & Atmospheric Overlays
  bgArtworkWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgArtworkImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.08 }],
  },

  // Top Bar
  topBar: {
    paddingHorizontal: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  shadowTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  // Artwork Container
  artworkOuterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  artworkFrame: {
    width: Math.min(SCREEN_WIDTH * 0.74, 300),
    aspectRatio: 0.98,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#0A0D16',
    position: 'relative',
    shadowOffset: { width: 0, height: 6 },
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  lockedArtworkImage: {
    opacity: 0.38,
  },
  lockedArtworkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 6, 12, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  // Unlock Information
  unlockInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  unlockHeader: {
    fontSize: 13.5,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 0.2,
  },
  unlockDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  unlockHeaderLocked: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.3,
  },
  requirementNote: {
    fontSize: 12.5,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
