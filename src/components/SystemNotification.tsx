import React, { useEffect, useRef, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  ScrollView,
  ImageSourcePropType,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Info } from 'lucide-react-native';

// ─── Types ──────────────────────────────────────────────────────
type SystemNotificationProps = {
  /** Title displayed in the header bar. Defaults to "NOTIFICATION". */
  title?: string;
  /** Content rendered inside the notification body. */
  children: ReactNode;
  /** Whether the notification is currently visible (drives fade-in). */
  visible?: boolean;
  /** Optional extra styles for the outer wrapper. */
  style?: ViewStyle;
  /** Whether to show the pulsing glow animation. Defaults to true. */
  animated?: boolean;
  /** Content rendered outside the scroll view, fixed at the bottom. */
  footer?: ReactNode;
  /** Background image to cover the entire notification panel. */
  backgroundImage?: ImageSourcePropType;
  /** Whether to show the corner brackets. Defaults to false. */
  showCorners?: boolean;
};

// ─── Constants (Home Streak Blue #4080E7) ───────────────────────
const ACCENT_BLUE = '#4080E7';
const BLUE_LIGHT  = '#6BA4F8';
const BLUE_BRIGHT = '#8ABEFF';
const BLUE_TEXT   = '#EBF3FF';
const BLUE_DARK   = '#2563EB';
const BG_DARK     = '#030814';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Info icon box matching the Solo Leveling system notification style */
const InfoIcon = () => (
  <View style={iconStyles.box}>
    <View style={iconStyles.circle}>
      <Info size={13} color="#FFFFFF" strokeWidth={2.5} />
    </View>
  </View>
);

const iconStyles = StyleSheet.create({
  box: {
    width: 32,
    height: 28,
    borderWidth: 1.5,
    borderColor: ACCENT_BLUE,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Main Component ─────────────────────────────────────────────
export const SystemNotification: React.FC<SystemNotificationProps> = ({
  title = 'NOTIFICATION',
  children,
  visible = true,
  style,
  animated = true,
  footer,
  backgroundImage,
  showCorners = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleYAnim = useRef(new Animated.Value(0.96)).current;
  const glowAnim = useRef(new Animated.Value(0.75)).current;

  // Fade-in and expand when visible changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleYAnim, {
          toValue: 1,
          friction: 7.5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleYAnim.setValue(0.96);
    }
  }, [visible, fadeAnim, scaleYAnim]);

  // Pulsing glow loop
  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.65,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, glowAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: fadeAnim,
          transform: [{ scaleY: scaleYAnim }],
        },
        style,
      ]}
    >
      {/* ── Gradient Border Layer ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowAnim }]} pointerEvents="none">
        <LinearGradient
          colors={[BLUE_DARK, ACCENT_BLUE, BLUE_LIGHT, ACCENT_BLUE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ── Dark Inner Panel (Slim 1.5px border effect) ── */}
      <View style={styles.innerPanel}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: BG_DARK }]} />

        {backgroundImage && (
          <>
            <Image
              source={backgroundImage}
              style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
              resizeMode="cover"
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(3, 8, 20, 0.75)' }]} />
          </>
        )}

        {/* ── Inner Shadow & Inset Glow Layers (Softened Streak Blue) ── */}
        <View style={styles.innerGlow} pointerEvents="none" />
        <View style={styles.innerGlow2} pointerEvents="none" />
        <View style={styles.innerGlow3} pointerEvents="none" />
        <View style={styles.innerGlow4} pointerEvents="none" />

        {/* Top Inset Shadow Gradient */}
        <LinearGradient
          colors={['rgba(64, 128, 231, 0.32)', 'rgba(64, 128, 231, 0.08)', 'transparent']}
          style={styles.innerShadowTop}
          pointerEvents="none"
        />
        {/* Bottom Inset Shadow Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(64, 128, 231, 0.08)', 'rgba(64, 128, 231, 0.32)']}
          style={styles.innerShadowBottom}
          pointerEvents="none"
        />
        {/* Left Inset Shadow Gradient */}
        <LinearGradient
          colors={['rgba(64, 128, 231, 0.24)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.innerShadowLeft}
          pointerEvents="none"
        />
        {/* Right Inset Shadow Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(64, 128, 231, 0.24)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.innerShadowRight}
          pointerEvents="none"
        />

        {/* ── Inner Frame ── */}
        <View style={styles.innerFrame}>
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentArea}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <InfoIcon />
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>{title}</Text>
              </View>
            </View>

            {children}
          </ScrollView>
        </View>

        {/* ── Footer ── */}
        {footer && <View style={styles.footerContainer}>{footer}</View>}
      </View>
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    width: '94%',
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  innerPanel: {
    margin: 1.5, // slim 1.5px border
    borderRadius: 18.5,
    backgroundColor: BG_DARK,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 1,
  },
  // ── Inner Glow & Inset Borders ──
  innerGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18.5,
    borderWidth: 1.5,
    borderColor: 'rgba(64, 128, 231, 0.55)',
    zIndex: 10,
  },
  innerGlow2: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18.5,
    borderWidth: 5,
    borderColor: 'rgba(64, 128, 231, 0.20)',
    zIndex: 9,
  },
  innerGlow3: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18.5,
    borderWidth: 12,
    borderColor: 'rgba(64, 128, 231, 0.08)',
    zIndex: 8,
  },
  innerGlow4: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18.5,
    borderWidth: 20,
    borderColor: 'rgba(64, 128, 231, 0.03)',
    zIndex: 7,
  },
  // ── Inner Shadow Gradients ──
  innerShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 6,
  },
  innerShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 6,
  },
  innerShadowLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 24,
    zIndex: 6,
  },
  innerShadowRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 24,
    zIndex: 6,
  },
  innerFrame: {
    paddingTop: 24,
    paddingHorizontal: 6,
    overflow: 'hidden',
    zIndex: 2,
    flexShrink: 1,
  },
  contentScroll: {
    flexShrink: 1,
  },
  contentArea: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 24,
    zIndex: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
    gap: 8,
    zIndex: 2,
  },
  titleBox: {
    borderWidth: 1.5,
    borderColor: ACCENT_BLUE,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 14,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  titleText: {
    fontSize: 11,
    fontWeight: '800',
    color: BLUE_TEXT,
    letterSpacing: 2.5,
    textShadowColor: ACCENT_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 8,
    zIndex: 2,
  },
});

export default SystemNotification;
