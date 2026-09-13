import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';
import {
  ShadowCard as ShadowCardType,
  RARITY_CONFIG,
  ELEMENT_CONFIG,
} from '../../data/shadowCardsData';

const SCREEN_PADDING = 16;
const CARD_GAP = 10;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - SCREEN_PADDING * 2 - CARD_GAP * 3) / 4);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.08);

// ── Mini Character Silhouette Art for Unlocked Cards ────────
function MiniArt({
  element,
  rarity,
  size,
}: {
  element: string;
  rarity: string;
  size: number;
}) {
  const rarityConf = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.Common;
  const elementConf = ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG] || ELEMENT_CONFIG.shadow;
  const color = elementConf.color;
  const glowColor = rarityConf.color;
  const w = size;
  const h = size * 1.1;
  const cx = w / 2;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id={`miniGrad-${element}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.95" />
          <Stop offset="1" stopColor={glowColor} stopOpacity="0.45" />
        </LinearGradient>
      </Defs>

      <Circle cx={cx} cy={h * 0.45} r={w * 0.35} fill={glowColor} opacity={0.25} />

      {element === 'fire' || element === 'light' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.15} L${cx + w * 0.22} ${h * 0.4} L${cx + w * 0.18} ${h * 0.55} L${cx + w * 0.25} ${h * 0.85} L${cx + w * 0.08} ${h * 0.75} L${cx} ${h * 0.9} L${cx - w * 0.08} ${h * 0.75} L${cx - w * 0.25} ${h * 0.85} L${cx - w * 0.18} ${h * 0.55} L${cx - w * 0.22} ${h * 0.4} Z`}
            fill={`url(#miniGrad-${element})`}
          />
          <Circle cx={cx} cy={h * 0.18} r={w * 0.11} fill={color} opacity={0.9} />
          <Circle cx={cx - w * 0.04} cy={h * 0.17} r={1.5} fill="#FFFFFF" />
          <Circle cx={cx + w * 0.04} cy={h * 0.17} r={1.5} fill="#FFFFFF" />
        </G>
      ) : element === 'ice' || element === 'wind' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.12} Q${cx + w * 0.16} ${h * 0.25} ${cx + w * 0.22} ${h * 0.45} Q${cx + w * 0.25} ${h * 0.6} ${cx + w * 0.15} ${h * 0.78} L${cx + w * 0.05} ${h * 0.9} L${cx - w * 0.05} ${h * 0.9} L${cx - w * 0.15} ${h * 0.78} Q${cx - w * 0.25} ${h * 0.6} ${cx - w * 0.22} ${h * 0.45} Q${cx - w * 0.16} ${h * 0.25} ${cx} ${h * 0.12}`}
            fill={`url(#miniGrad-${element})`}
          />
          <Circle cx={cx} cy={h * 0.16} r={w * 0.1} fill={color} opacity={0.9} />
          <Circle cx={cx - w * 0.035} cy={h * 0.155} r={1.5} fill="#FFFFFF" />
          <Circle cx={cx + w * 0.035} cy={h * 0.155} r={1.5} fill="#FFFFFF" />
        </G>
      ) : element === 'earth' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.15} L${cx + w * 0.12} ${h * 0.25} L${cx + w * 0.28} ${h * 0.4} L${cx + w * 0.3} ${h * 0.65} L${cx + w * 0.2} ${h * 0.9} L${cx - w * 0.2} ${h * 0.9} L${cx - w * 0.3} ${h * 0.65} L${cx - w * 0.28} ${h * 0.4} L${cx - w * 0.12} ${h * 0.25} Z`}
            fill={`url(#miniGrad-${element})`}
          />
          <Circle cx={cx} cy={h * 0.17} r={w * 0.12} fill={color} opacity={0.9} />
          <Circle cx={cx - w * 0.045} cy={h * 0.165} r={1.5} fill="#FFFFFF" />
          <Circle cx={cx + w * 0.045} cy={h * 0.165} r={1.5} fill="#FFFFFF" />
        </G>
      ) : element === 'lightning' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.12} L${cx + w * 0.18} ${h * 0.32} L${cx + w * 0.12} ${h * 0.42} L${cx + w * 0.22} ${h * 0.58} L${cx + w * 0.15} ${h * 0.72} L${cx + w * 0.08} ${h * 0.9} L${cx - w * 0.08} ${h * 0.9} L${cx - w * 0.15} ${h * 0.72} L${cx - w * 0.22} ${h * 0.58} L${cx - w * 0.12} ${h * 0.42} L${cx - w * 0.18} ${h * 0.32} Z`}
            fill={`url(#miniGrad-${element})`}
          />
          <Circle cx={cx} cy={h * 0.15} r={w * 0.1} fill={color} opacity={0.9} />
          <Circle cx={cx - w * 0.035} cy={h * 0.145} r={1.5} fill="#FFFFFF" />
          <Circle cx={cx + w * 0.035} cy={h * 0.145} r={1.5} fill="#FFFFFF" />
        </G>
      ) : (
        <G>
          <Path
            d={`M${cx} ${h * 0.1} Q${cx + w * 0.2} ${h * 0.2} ${cx + w * 0.18} ${h * 0.4} L${cx + w * 0.22} ${h * 0.55} Q${cx + w * 0.2} ${h * 0.7} ${cx + w * 0.12} ${h * 0.82} Q${cx + w * 0.05} ${h * 0.92} ${cx} ${h * 0.95} Q${cx - w * 0.05} ${h * 0.92} ${cx - w * 0.12} ${h * 0.82} Q${cx - w * 0.2} ${h * 0.7} ${cx - w * 0.22} ${h * 0.55} L${cx - w * 0.18} ${h * 0.4} Q${cx - w * 0.2} ${h * 0.2} ${cx} ${h * 0.1}`}
            fill={`url(#miniGrad-${element})`}
          />
          <Circle cx={cx} cy={h * 0.14} r={w * 0.11} fill={color} opacity={0.9} />
          <Circle cx={cx - w * 0.04} cy={h * 0.135} r={1.5} fill="#FFFFFF" />
          <Circle cx={cx + w * 0.04} cy={h * 0.135} r={1.5} fill="#FFFFFF" />
        </G>
      )}
    </Svg>
  );
}

// ── Main Card Component ─────────────────────────────────────
interface ShadowCardProps {
  card: ShadowCardType;
  isUnlocked: boolean;
  onPress: () => void;
}

export default function ShadowCard({ card, isUnlocked, onPress }: ShadowCardProps) {
  const rarityConf = RARITY_CONFIG[card.rarity];
  const elementConf = ELEMENT_CONFIG[card.element];

  // ─── LOCKED STATE (Matches user screenshot) ───
  if (!isUnlocked) {
    return (
      <TouchableOpacity
        style={styles.lockedCard}
        activeOpacity={0.65}
        onPress={onPress}
      >
        <Text style={styles.questionMark}>?</Text>
      </TouchableOpacity>
    );
  }

  // ─── UNLOCKED STATE (Vibrant, collectible) ────
  return (
    <TouchableOpacity
      style={[
        styles.unlockedCard,
        {
          borderColor: rarityConf.color,
          backgroundColor: '#DFD8CC',
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Rarity dot in top right */}
      <View
        style={[
          styles.unlockedDot,
          { backgroundColor: rarityConf.color },
        ]}
      />

      {/* Mini Artwork */}
      <View style={styles.miniArtContainer}>
        <MiniArt
          element={card.element}
          rarity={card.rarity}
          size={CARD_WIDTH * 0.56}
        />
      </View>

      {/* Element / Name subtle tag at bottom */}
      <View style={styles.bottomTag}>
        <Text style={styles.elementIcon}>{elementConf.icon}</Text>
        <Text
          style={[styles.miniCardName, { color: '#2B2620' }]}
          numberOfLines={1}
        >
          {card.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Locked Card: Exactly matches reference screenshot
  lockedCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    backgroundColor: '#C5BFB3',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9E9789',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontSize: 26,
    fontWeight: '600',
    color: '#7F796E',
    includeFontPadding: false,
  },

  // Unlocked Card: Collectible card in grid
  unlockedCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    borderWidth: 1.8,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unlockedDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniArtContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
    paddingHorizontal: 2,
  },
  elementIcon: {
    fontSize: 8,
  },
  miniCardName: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
