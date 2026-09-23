import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { HunterRank, RANK_CONFIG } from '../../data/levelConfig';

export type RankBadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface RankBadgeProps {
  rank: HunterRank;
  size?: RankBadgeSize;
  showGlow?: boolean;
  animated?: boolean;
  onPress?: () => void;
  style?: any;
}

const SIZE_MAP: Record<string, number> = {
  xs: 28,
  sm: 38,
  md: 56,
  lg: 84,
  xl: 128,
};

// High-res generated image badges for every rank tier
const BADGE_IMAGES: Record<HunterRank, ImageSourcePropType> = {
  E: require('../../../assets/ranks/badge_e.jpg'),
  D: require('../../../assets/ranks/badge_d.jpg'),
  C: require('../../../assets/ranks/badge_c.jpg'),
  B: require('../../../assets/ranks/badge_b.jpg'),
  A: require('../../../assets/ranks/badge_a.jpg'),
  S: require('../../../assets/ranks/badge_s.jpg'),
  SSS: require('../../../assets/ranks/badge_sss.jpg'),
  National: require('../../../assets/ranks/badge_national.jpg'),
};

/**
 * RankBadge: High-res image-based hunter crest badge system.
 * Every rank tier (E through National) uses a unique generated 3D badge image.
 */
export default function RankBadge({
  rank,
  size = 'md',
  showGlow = true,
  animated = false,
  onPress,
  style,
}: RankBadgeProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 56;
  const config = RANK_CONFIG[rank] || RANK_CONFIG.E;
  const imageSource = BADGE_IMAGES[rank] || BADGE_IMAGES.E;

  // Subtle breathing pulse animation when animated
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      pulse.value = withRepeat(
        withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = showGlow
    ? {
        shadowColor: config.glowColor || '#4080E7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.65,
        shadowRadius: Math.max(6, pixelSize * 0.15),
        elevation: 6,
      }
    : null;

  const content = (
    <Animated.View
      style={[
        styles.wrapper,
        { width: pixelSize, height: pixelSize },
        glowStyle,
        animated && animatedContainerStyle,
        style,
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          {
            width: pixelSize,
            height: pixelSize,
          },
        ]}
      >
        <Image
          source={imageSource}
          style={[styles.badgeImage, { width: pixelSize, height: pixelSize }]}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  badgeImage: {
    backgroundColor: 'transparent',
  },
});
