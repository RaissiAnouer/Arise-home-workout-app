import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {
  ShadowCard as ShadowCardType,
  RARITY_CONFIG,
  getShadowImage,
} from '../../data/shadowCardsData';

const SCREEN_PADDING = 16;
const CARD_GAP = 10;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - SCREEN_PADDING * 2 - CARD_GAP * 3) / 4);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.18);

// ── Main Card Component ─────────────────────────────────────
interface ShadowCardProps {
  card: ShadowCardType;
  isUnlocked: boolean;
  onPress?: () => void;
}

export default function ShadowCard({ card, isUnlocked, onPress }: ShadowCardProps) {
  const rarityConf = RARITY_CONFIG[card.rarity];

  // ─── LOCKED STATE (Dark slate placeholder with dashed border) ───
  if (!isUnlocked) {
    return (
      <TouchableOpacity
        style={styles.lockedCard}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
      >
        <Text style={styles.questionMark}>?</Text>
      </TouchableOpacity>
    );
  }

  // ─── UNLOCKED STATE (Shadow artwork inside card) ────
  return (
    <TouchableOpacity
      style={[
        styles.unlockedCard,
        {
          borderColor: rarityConf.color,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Actual Shadow Artwork Image */}
      <Image
        source={getShadowImage(card)}
        style={styles.cardImage}
        resizeMode="cover"
      />

      {/* Rarity dot in top right */}
      <View
        style={[
          styles.unlockedDot,
          { backgroundColor: rarityConf.color },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Locked Card: Dark slate placeholder with dashed border
  lockedCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    backgroundColor: '#0D111A',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontSize: 26,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.25)',
    includeFontPadding: false,
  },

  // Unlocked Card: Collectible card in grid
  unlockedCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'solid',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F121C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  unlockedDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
  },
});
