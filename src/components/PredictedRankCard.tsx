import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  ImageBackground,
} from 'react-native';
import Svg, { Path, Polygon, G, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Info } from 'lucide-react-native';
import PrimaryButton from './PrimaryButton';

export type PredictedRankCardProps = {
  predictedRank?: string;
  percentileText?: string;
  remainingCount?: number;
  progressPercent?: number;
  buttonText?: string;
  onClassifyPress?: () => void;
  onInfoPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

// Sparkle/Star SVG component used in badges
function SparkleStar({ size = 10, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
        fill={color}
      />
    </Svg>
  );
}

// 1. Triangular Rank Badge (like Iron II, Iron III, etc.)
function TriangleRankBadge({
  tier = 'II',
  active = false,
  badgeColor,
  textColor,
  size = 28,
}: {
  tier?: string;
  active?: boolean;
  badgeColor?: string;
  textColor?: string;
  size?: number;
}) {
  const bg = badgeColor || (active ? '#A5A5AA' : '#5E5E64');
  const txt = textColor || (active ? '#FFFFFF' : '#8E8E93');

  return (
    <View style={styles.badgeWrapper}>
      <View style={[styles.triangleShape, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          {/* Rounded Triangle Path */}
          <Path
            d="M16 3 C17 3, 18 4.5, 29 23 C30 25, 29 27, 26.5 27 L5.5 27 C3 27, 2 25, 3 23 Z"
            fill={bg}
            opacity={active ? 0.95 : 0.6}
          />
        </Svg>
        <View style={styles.badgeCenterStar}>
          <SparkleStar size={10} color={active ? '#FFFFFF' : '#C2C2C7'} />
        </View>
      </View>
      {tier ? <Text style={[styles.badgeSubTierText, { color: txt }]}>{tier}</Text> : null}
    </View>
  );
}

// 2. Shield Rank Badge (Bronze III - brown glow)
function BronzeShieldBadge({ tier = 'III', size = 26 }: { tier?: string; size?: number }) {
  return (
    <View style={styles.badgeWrapper}>
      <View style={[styles.shieldShape, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M5 6 C5 4, 7 3, 16 3 C25 3, 27 4, 27 6 L27 18 C27 24, 16 29, 16 29 C16 29, 5 24, 5 18 Z"
            fill="#9C6036"
          />
        </Svg>
        <View style={styles.badgeCenterStar}>
          <SparkleStar size={9} color="#FFD9B3" />
        </View>
      </View>
      <Text style={[styles.badgeSubTierText, { color: '#C88A58' }]}>{tier}</Text>
    </View>
  );
}

// 3. Silver / Cyan Shield Badge (Silver III)
function SilverShieldBadge({ tier = 'III', size = 26 }: { tier?: string; size?: number }) {
  return (
    <View style={styles.badgeWrapper}>
      <View style={[styles.shieldShape, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M16 2 L28 14 L16 30 L4 14 Z"
            fill="#80BFCF"
          />
        </Svg>
        <View style={styles.badgeCenterStar}>
          <SparkleStar size={9} color="#FFFFFF" />
        </View>
      </View>
      <Text style={[styles.badgeSubTierText, { color: '#80BFCF' }]}>{tier}</Text>
    </View>
  );
}

// 4. Hexagon Rank Badge (Unranked / Higher Tiers)
function HexagonBadge({ size = 26 }: { size?: number }) {
  return (
    <View style={styles.badgeWrapper}>
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Polygon
            points="16,2 29,9 29,23 16,30 3,23 3,9"
            fill="#1E1E22"
            stroke="#44444C"
            strokeWidth="2"
          />
        </Svg>
        <View style={styles.badgeCenterStar}>
          <SparkleStar size={8} color="#66666E" />
        </View>
      </View>
    </View>
  );
}

// 5. Large Main Hero Badge (Top Right of Card)
function MainHeroRankBadge({ tier = 'II' }: { tier?: string }) {
  return (
    <View style={styles.heroBadgeContainer}>
      <Svg width={54} height={54} viewBox="0 0 48 48">
        <Path
          d="M24 4 C25.5 4, 27 6, 43 34 C44.5 37, 43 40 39.5 40 L8.5 40 C5 40, 3.5 37, 5 34 Z"
          fill="#787880"
          opacity={0.85}
        />
        <Path
          d="M24 7 C25 7, 26 8.5, 40 33 C41 35, 40 37, 37.5 37 L10.5 37 C8 37, 7 35, 8 33 Z"
          fill="#4A4A52"
        />
      </Svg>
      <View style={styles.heroBadgeStar}>
        <SparkleStar size={16} color="#FFFFFF" />
      </View>
      {tier ? <Text style={styles.heroBadgeTierText}>{tier}</Text> : null}
    </View>
  );
}

export default function PredictedRankCard({
  predictedRank = 'Welcome Player',
  percentileText = 'Complete the tasks to win a prize',
  remainingCount,
  progressPercent = 0,
  buttonText = 'Continue',
  onClassifyPress,
  onInfoPress,
  style,
}: PredictedRankCardProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, progressPercent)) / 100);

  return (
    <View style={[styles.cardContainer, style]}>
      <ImageBackground
        source={require('../images/strength training.png')}
        style={styles.bgImage}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={['rgba(10, 10, 10, 0.65)', 'rgba(10, 10, 10, 0.92)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.cardMainRow}>
            <View style={styles.cardInfoCol}>
              <Text style={styles.rankMainTitle}>{predictedRank}</Text>
              <Text style={styles.rankSubtitle}>{percentileText}</Text>
            </View>

            {/* Circular Progress Indicator */}
            <View style={styles.progressRingWrapper}>
              <Svg width={50} height={50} viewBox="0 0 50 50">
                {/* Background Track Circle */}
                <Circle
                  cx={25}
                  cy={25}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth={4}
                  fill="none"
                />
                {/* Accent Blue Active Circle */}
                <Circle
                  cx={25}
                  cy={25}
                  r={radius}
                  stroke="#4080E7"
                  strokeWidth={4}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 25 25)"
                />
              </Svg>
              <View style={styles.progressPercentCenter}>
                <Text style={styles.progressPercentText}>{progressPercent}%</Text>
              </View>
            </View>
          </View>

          {/* Action Button at Bottom */}
          <Pressable style={styles.classifyBtn} onPress={onClassifyPress}>
            <Text style={styles.classifyBtnText}>{buttonText ? buttonText.toUpperCase() : ''}</Text>
          </Pressable>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bgImage: {
    width: '100%',
  },
  gradientOverlay: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    width: '100%',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardInfoCol: {
    flex: 1,
    paddingRight: 12,
  },
  progressRingWrapper: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressPercentCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleInfoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  headerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  infoIconWrapper: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  rankSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9E9EA4',
    lineHeight: 16,
  },
  heroBadgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginTop: -2,
  },
  heroBadgeStar: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 17,
  },
  heroBadgeTierText: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  tierBadgesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  triangleShape: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shieldShape: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeCenterStar: {
    position: 'absolute',
    top: '32%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSubTierText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    position: 'absolute',
    bottom: -10,
    right: -3,
    fontFamily: 'serif',
  },
  classifyBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  classifyBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});
