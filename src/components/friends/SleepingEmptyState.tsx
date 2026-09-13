import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { typography } from '../../styles/typography';
import PrimaryButton from '../PrimaryButton';

interface SleepingEmptyStateProps {
  onInvitePress: () => void;
  title?: string;
  subtitle?: string;
  buttonTitle?: string;
}

export default function SleepingEmptyState({
  onInvitePress,
  title = 'You have no contacts yet!',
  subtitle = 'Invite friends to Arise to see them here.',
  buttonTitle = 'INVITE A FRIEND',
}: SleepingEmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Central Illustration with Glowing Circles & Sleeping Avatar */}
      <View style={styles.illustrationWrapper}>
        {/* Floating "Z z" texts in top-left */}
        <View style={styles.floatingZContainer}>
          <Text style={styles.largeZ}>Z</Text>
          <Text style={styles.smallZ}>z</Text>
        </View>

        {/* Floating Sparkle Stars */}
        <Text style={[styles.sparkle, styles.sparkleTopRight]}>✦</Text>
        <Text style={[styles.sparkle, styles.sparkleLeft]}>✧</Text>
        <Text style={[styles.sparkle, styles.sparkleBottomRight]}>✦</Text>
        <Text style={[styles.sparkle, styles.sparkleBottomLeft]}>✧</Text>

        {/* Circular Face Graphic */}
        <Svg width={180} height={180} viewBox="0 0 180 180" style={styles.svg}>
          <Defs>
            <RadialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#4080E7" stopOpacity="0.25" />
              <Stop offset="60%" stopColor="#4080E7" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#4080E7" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#222530" stopOpacity="1" />
              <Stop offset="100%" stopColor="#171922" stopOpacity="1" />
            </RadialGradient>
          </Defs>

          {/* Outer Ambient Glow Ring */}
          <Circle cx="90" cy="90" r="86" fill="url(#ambientGlow)" />

          {/* Outer Dotted / Halo Circle */}
          <Circle
            cx="90"
            cy="90"
            r="66"
            fill="none"
            stroke="rgba(64, 128, 231, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="4, 4"
          />

          {/* Main Face Circle */}
          <Circle
            cx="90"
            cy="90"
            r="56"
            fill="url(#faceGrad)"
            stroke="#4080E7"
            strokeWidth="3.5"
          />

          {/* Left Sleeping Eye (Curved Arc: ◡) */}
          <Path
            d="M 64 82 Q 74 95 84 82"
            fill="none"
            stroke="#4080E7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right Sleeping Eye (Curved Arc: ◡) */}
          <Path
            d="M 96 82 Q 106 95 116 82"
            fill="none"
            stroke="#4080E7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Calm Resting Mouth (Flat Line: —) */}
          <Path
            d="M 81 110 L 99 110"
            fill="none"
            stroke="#4080E7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Title & Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Bottom Invite Action Button */}
      <View style={styles.buttonWrapper}>
        <PrimaryButton
          title={buttonTitle}
          onPress={onInvitePress}
          style={styles.inviteButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  illustrationWrapper: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  svg: {
    alignSelf: 'center',
  },
  floatingZContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  largeZ: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4080E7',
    letterSpacing: -1,
    transform: [{ rotate: '-12deg' }],
  },
  smallZ: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4080E7',
    marginLeft: 14,
    marginTop: -4,
    opacity: 0.85,
    transform: [{ rotate: '8deg' }],
  },
  sparkle: {
    position: 'absolute',
    color: 'rgba(64, 128, 231, 0.65)',
    fontWeight: 'bold',
  },
  sparkleTopRight: {
    top: 24,
    right: 28,
    fontSize: 20,
  },
  sparkleLeft: {
    top: 110,
    left: 12,
    fontSize: 16,
    color: 'rgba(64, 128, 231, 0.45)',
  },
  sparkleBottomRight: {
    bottom: 30,
    right: 20,
    fontSize: 22,
  },
  sparkleBottomLeft: {
    bottom: 40,
    left: 36,
    fontSize: 14,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 16,
  },
  inviteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
