import React, { useState, useMemo, useCallback } from 'react';
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
import { useProgression } from '../../src/context/ProgressionContext';
import ShadowCard from '../../src/components/cards/ShadowCard';
import ShadowCardDetailModal from '../../src/components/cards/ShadowCardDetailModal';
import {
  SHADOW_CARDS,
  ShadowCard as ShadowCardType,
  isCardUnlocked,
} from '../../src/data/shadowCardsData';

const SCREEN_PADDING = 16;
const CARD_GAP = 10;
const BACKGROUND_COLOR = '#ECE5D8';

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    totalWorkouts,
    level,
    streakDays,
    totalExercisesCompleted,
  } = useProgression();

  const [selectedCard, setSelectedCard] = useState<ShadowCardType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const progression = useMemo(() => ({
    totalWorkouts,
    level,
    streakDays,
    totalExercisesCompleted,
  }), [totalWorkouts, level, streakDays, totalExercisesCompleted]);

  // Compute unlocked state for each card
  const cardsWithState = useMemo(() =>
    SHADOW_CARDS.map((card) => ({
      card,
      isUnlocked: isCardUnlocked(card, progression),
    })),
    [progression]
  );

  // Collection stats
  const totalCards = SHADOW_CARDS.length;
  const unlockedCount = cardsWithState.filter((c) => c.isUnlocked).length;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  const handleCardPress = useCallback((card: ShadowCardType) => {
    setSelectedCard(card);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedCard(null);
  }, []);

  const isSelectedUnlocked = useMemo(() => {
    if (!selectedCard) return false;
    return isCardUnlocked(selectedCard, progression);
  }, [selectedCard, progression]);

  // Render card item in 4-column grid
  const renderCard = useCallback(
    ({ item }: { item: { card: ShadowCardType; isUnlocked: boolean } }) => (
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

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
              <ArrowLeft size={20} color="#1A1A1A" strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Achievements</Text>
              <Text style={styles.subtitle}>
                You have unlocked{' '}
                <Text style={styles.subtitleBold}>
                  {unlockedCount}/{totalCards} achievements
                </Text>
              </Text>
            </View>
          </View>
        }
      />

      {/* Detail Modal */}
      <ShadowCardDetailModal
        visible={modalVisible}
        card={selectedCard}
        isUnlocked={isSelectedUnlocked}
        progression={progression}
        onClose={handleCloseModal}
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
    backgroundColor: '#DFD8CA',
    borderWidth: 1,
    borderColor: '#D2C9B7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  titleSection: {
    marginTop: 22,
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F0F0F',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#3B362F',
    letterSpacing: 0.2,
  },
  subtitleBold: {
    fontWeight: '700',
    color: '#0F0F0F',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
});
