import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgression } from '../../src/context/ProgressionContext';
import ShadowCard from '../../src/components/cards/ShadowCard';
import {
  SHADOW_CARDS,
  ShadowCard as ShadowCardType,
  isCardUnlocked,
} from '../../src/data/shadowCardsData';

const SCREEN_PADDING = 16;
const CARD_GAP = 10;
const BACKGROUND_COLOR = '#000000';
const UNLOCKED_CARDS_STORAGE_KEY = '@arise_unlocked_shadow_cards_v2';
const TOTAL_GRID_SLOTS = 20;

// Placeholder slots to fill the grid up to 20
const PLACEHOLDER_CARDS: ShadowCardType[] = Array.from(
  { length: Math.max(0, TOTAL_GRID_SLOTS - SHADOW_CARDS.length) },
  (_, i) => ({
    id: `placeholder-${i + 1}`,
    name: '???',
    title: 'Locked Shadow',
    rank: 'E-RANK' as const,
    rarity: 'Common' as const,
    level: 0,
    element: 'shadow' as const,
    stats: { STR: 0, AGI: 0, END: 0, POW: 0 },
    quote: '“The shadows remain dormant until awakened by sufficient hunter prowess.”',
    description: 'Locked shadow slot awaiting discovery.',
    lore: 'Locked shadow slot.',
    unlockRequirement: `Conquer Dungeon Tier ${i + 2}`,
    unlockCondition: { type: 'workouts' as const, value: 99999 },
  })
);

const GRID_CARDS: ShadowCardType[] = [...SHADOW_CARDS, ...PLACEHOLDER_CARDS];
const UNLOCKED_REAL_SHADOW_IDS = SHADOW_CARDS.map((c) => c.id);

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    totalWorkouts,
    level,
    streakDays,
    totalExercisesCompleted,
  } = useProgression();

  const [unlockedCardIds, setUnlockedCardIds] = useState<string[]>(UNLOCKED_REAL_SHADOW_IDS);

  // Unlock all real shadows and persist to storage
  useEffect(() => {
    (async () => {
      try {
        setUnlockedCardIds(UNLOCKED_REAL_SHADOW_IDS);
        await AsyncStorage.setItem(UNLOCKED_CARDS_STORAGE_KEY, JSON.stringify(UNLOCKED_REAL_SHADOW_IDS));
      } catch (e) {
        console.warn('Failed to save unlocked shadows:', e);
      }
    })();
  }, []);

  const progression = useMemo(() => ({
    totalWorkouts,
    level,
    streakDays,
    totalExercisesCompleted,
  }), [totalWorkouts, level, streakDays, totalExercisesCompleted]);

  // Compute unlocked state for each card in the 20-slot grid
  const cardsWithState = useMemo(() =>
    GRID_CARDS.map((card) => {
      const isPlaceholder = card.id.startsWith('placeholder-');
      const isUnlocked = !isPlaceholder && unlockedCardIds.includes(card.id);
      const canClaim = !isPlaceholder && !isUnlocked && isCardUnlocked(card, progression);
      return {
        card,
        isUnlocked,
        canClaim,
      };
    }),
    [unlockedCardIds, progression]
  );

  // Collection stats
  const totalCards = GRID_CARDS.length;
  const unlockedCount = useMemo(
    () => cardsWithState.filter((c) => c.isUnlocked).length,
    [cardsWithState]
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  // Navigate to dedicated dynamic Shadow Detail page
  const handleCardPress = useCallback((card: ShadowCardType) => {
    router.push({
      pathname: '/shadow-detail/[id]',
      params: { id: card.id },
    });
  }, [router]);

  // Render card item in 4-column grid (tapping any card opens Shadow Detail page)
  const renderCard = useCallback(
    ({ item }: { item: { card: ShadowCardType; isUnlocked: boolean; canClaim: boolean } }) => (
      <ShadowCard
        card={item.card}
        isUnlocked={item.isUnlocked}
        onPress={() => handleCardPress(item.card)}
      />
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: { card: ShadowCardType }) => item.card.id, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FlatList
        data={cardsWithState}
        renderItem={renderCard}
        keyExtractor={keyExtractor}
        numColumns={4}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 95,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={handleBack}
              hitSlop={8}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Shadows</Text>
              <Text style={styles.subtitle}>
                You currently have{' '}
                <Text style={styles.subtitleBold}>
                  {unlockedCount} {unlockedCount === 1 ? 'shadow' : 'shadows'}
                </Text>
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
  },
  headerContainer: {
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#12141C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  titleSection: {
    marginTop: 22,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.2,
  },
  subtitleBold: {
    fontWeight: '700',
    color: '#4080E7',
  },
  row: {
    justifyContent: 'flex-start',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
});
