import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DEFAULT_AVATAR = require('../images/avatar_placeholder.png');

export type HunterStatusCardProps = {
  avatar?: ImageSourcePropType;
  title: string;
  status: string;
  progress: number; // 0-100
  level?: string;
  expText?: string;
  borderColor?: string;
  innerBorderColor?: string;
  glowColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
};

export default function HunterStatusCard({
  avatar = DEFAULT_AVATAR,
  title,
  status,
  progress,
  level,
  expText,
  borderColor = '#00eeff', // default neon blue border
  innerBorderColor = 'rgba(0, 238, 255, 0.2)',
  glowColor = '#00eeff',
  accentColor = '#39FF14', // default bright green accent
  backgroundColor = '#101826', // default dark navy
  onPress,
}: HunterStatusCardProps) {
  // Animation Values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smoothly animate progress bar when progress prop changes
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false, // width interpolation cannot use native driver
    }).start();
  }, [progress, progressAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Interpolate progress to percentage string for the width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressableWrapper}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            backgroundColor,
            borderColor,
            shadowColor: glowColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.innerCard, { borderColor: innerBorderColor, backgroundColor }]}>
          
          {/* Avatar Section */}
          <View
            style={[
              styles.avatarContainer,
              { borderColor, shadowColor: borderColor },
            ]}
          >
            <Image source={avatar} style={styles.avatarImage} resizeMode="cover" />
            <View
              style={[
                styles.avatarAccent,
                {
                  backgroundColor: accentColor,
                  shadowColor: accentColor,
                  borderColor: backgroundColor,
                },
              ]}
            />
          </View>

          {/* Info & Progress Section */}
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.titleText}>{title}</Text>
              {level && <Text style={styles.levelText}>Lv.{level}</Text>}
            </View>

            <View style={styles.progressHeader}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.statusText,
                  { color: accentColor, textShadowColor: accentColor },
                ]}
              >
                {status}
              </Text>
              {expText && <Text style={styles.expText}>{expText}</Text>}
            </View>

            <View style={styles.progressTrackContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFillWrapper, { width: progressWidth }]}>
                  <LinearGradient
                    colors={[accentColor, accentColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressFill}
                  />
                </Animated.View>
              </View>
            </View>
          </View>

          {/* Action Chevron */}
          <View style={styles.iconContainer}>
            <ChevronRight size={20} color={borderColor} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  cardContainer: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 0.5,
    // Soft shadow for the neon glow border
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    // Removed padding to make inner border flush with outer border
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: 18,
    borderWidth: 0.5, // Inner Stroke
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    marginRight: 12,
    position: 'relative',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarAccent: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  levelText: {
    fontWeight: '500',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 13,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expText: {
    fontWeight: 'normal',
    fontSize: 10,
    color: '#8FABB8',
    opacity: 0.85,
  },
  progressTrackContainer: {
    width: '100%',
    paddingTop: 4, // space for glow
    paddingBottom: 4,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1E1E1E', // Dark gray interior
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444444', // Gray outline
    overflow: 'hidden',
  },
  progressFillWrapper: {
    height: '100%',
  },
  progressFill: {
    flex: 1,
  },
  iconContainer: {
    width: 20,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
