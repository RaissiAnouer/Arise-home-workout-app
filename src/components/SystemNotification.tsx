import React, { useEffect, useRef, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
};

// ─── Constants ──────────────────────────────────────────────────
const CYAN_START = '#00A3FF';
const CYAN_MID   = '#38B6FF';
const CYAN_END   = '#00A3FF';
const CYAN_LIGHT = '#80D4FF'; // slightly lighter than MID for accents
const CYAN_DIM   = '#0B192C'; // used for inner backgrounds / accents
const CYAN_TEXT  = '#E6F7FF'; // bright cyan/white
const BG_DARK    = '#020D1A'; // dark navy background

const CORNER_SIZE  = 28;
const CORNER_THICK = 3;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Sub-components ─────────────────────────────────────────────

/** Glowing L-shaped corner bracket */
const CornerBracket = ({
  position,
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) => {
  const isTop = position.includes('top');
  const isLeft = position.includes('Left');

  return (
    <View
      style={[
        cornerStyles.wrapper,
        isTop ? { top: -1 } : { bottom: -1 },
        isLeft ? { left: -1 } : { right: -1 },
      ]}
    >
      {/* Horizontal stroke */}
      <View
        style={[
          cornerStyles.horizontal,
          isTop ? { top: 0 } : { bottom: 0 },
          isLeft ? { left: 0 } : { right: 0 },
        ]}
      />
      {/* Vertical stroke */}
      <View
        style={[
          cornerStyles.vertical,
          isTop ? { top: 0 } : { bottom: 0 },
          isLeft ? { left: 0 } : { right: 0 },
        ]}
      />
    </View>
  );
};

const cornerStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  horizontal: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_THICK,
    backgroundColor: CYAN_MID,
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  vertical: {
    position: 'absolute',
    width: CORNER_THICK,
    height: CORNER_SIZE,
    backgroundColor: CYAN_MID,
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
});

/** Info icon (circle with "i") matching the SVG's icon box */
const InfoIcon = () => (
  <View style={iconStyles.box}>
    <View style={iconStyles.circle}>
      <View style={iconStyles.iBar} />
      <View style={iconStyles.iDot} />
    </View>
  </View>
);

const iconStyles = StyleSheet.create({
  box: {
    width: 40,
    height: 34,
    borderWidth: 1.5,
    borderColor: CYAN_MID,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: CYAN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iBar: {
    width: 1.5,
    height: 8,
    backgroundColor: CYAN_LIGHT,
    marginTop: 1,
  },
  iDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: CYAN_LIGHT,
    marginTop: 1,
  },
});

/** Side bracket accent (the small [ or ] shapes on left/right) */
const SideBracket = ({ side }: { side: 'left' | 'right' }) => (
  <View
    style={[
      bracketStyles.wrapper,
      side === 'left' ? { left: 6 } : { right: 6 },
    ]}
  >
    <View
      style={[
        bracketStyles.top,
        side === 'left'
          ? { borderLeftWidth: 2, borderTopWidth: 2 }
          : { borderRightWidth: 2, borderTopWidth: 2 },
      ]}
    />
    <View
      style={[
        bracketStyles.bottom,
        side === 'left'
          ? { borderLeftWidth: 2, borderBottomWidth: 2 }
          : { borderRightWidth: 2, borderBottomWidth: 2 },
      ]}
    />
  </View>
);

const bracketStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: '35%',
    height: 40,
    width: 14,
    justifyContent: 'space-between',
  },
  top: {
    width: 14,
    height: 16,
    borderColor: CYAN_MID,
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  bottom: {
    width: 14,
    height: 16,
    borderColor: CYAN_MID,
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
});

/** Horizontal scan lines across the content area */
const ScanLines = ({ count = 10 }: { count?: number }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={{
          position: 'absolute',
          top: `${((i + 1) / (count + 1)) * 100}%`,
          left: 16,
          right: 16,
          height: StyleSheet.hairlineWidth,
          backgroundColor: CYAN_DIM,
          opacity: 0.18,
        }}
      />
    ))}
  </View>
);

/** Small decorative hexagon */
const HexDot = ({ style }: { style: ViewStyle }) => (
  <View style={[hexStyles.hex, style]}>
    <View style={hexStyles.inner} />
  </View>
);

const hexStyles = StyleSheet.create({
  hex: {
    position: 'absolute',
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: CYAN_DIM,
    opacity: 0.25,
    transform: [{ rotate: '45deg' }],
  },
});

// ─── Main Component ─────────────────────────────────────────────

export const SystemNotification: React.FC<SystemNotificationProps> = ({
  title = 'NOTIFICATION',
  children,
  visible = true,
  style,
  animated = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleYAnim = useRef(new Animated.Value(0.02)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  // Fade-in and expand when visible changes
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100, // quick fade in as a line
          useNativeDriver: true,
        }),
        Animated.spring(scaleYAnim, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleYAnim.setValue(0.02);
    }
  }, [visible, fadeAnim, scaleYAnim]);

  // Pulsing glow loop
  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, glowAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim, transform: [{ scaleY: scaleYAnim }] }, style]}>
      {/* ── Gradient Border Layer (fills entire root) ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowAnim }]}>
        <LinearGradient
          colors={[CYAN_START, CYAN_MID, CYAN_END]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ── Dark Inner Panel (creates border effect via 2px inset) ── */}
      <View style={styles.innerPanel}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: BG_DARK, borderRadius: 6 }]} />
        <GridOverlay />

        {/* ── Corner Brackets ──────────────────────── */}
        <CornerBracket position="topLeft" />
        <CornerBracket position="topRight" />
        <CornerBracket position="bottomLeft" />
        <CornerBracket position="bottomRight" />

        {/* ── Side Bracket Accents ─────────────────── */}
        {/* (Side brackets removed per user request) */}

        {/* ── Hex Decorations ──────────────────────── */}
        <HexDot style={{ top: '25%', left: 24 }} />
        <HexDot style={{ top: '65%', left: 24 }} />
        <HexDot style={{ top: '25%', right: 24 }} />
        <HexDot style={{ top: '65%', right: 24 }} />

        {/* ── Header ───────────────────────────────── */}
        <View style={styles.header}>
          <InfoIcon />
          <View style={styles.titleBox}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        </View>

        {/* ── Inner Frame ──────────────────────────── */}
        <View style={styles.innerFrame}>
          <View style={styles.contentArea}>{children}</View>
        </View>
      </View>
    </Animated.View>
  );
};

/** Faint grid overlay mimicking the SVG's <pattern> */
const GridOverlay = () => {
  const CELL = 20;
  const cols = Math.ceil(SCREEN_WIDTH / CELL);
  const rows = 20; // enough to cover typical notification height

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Vertical lines */}
      {Array.from({ length: cols }).map((_, i) => (
        <View
          key={`v${i}`}
          style={{
            position: 'absolute',
            left: i * CELL,
            top: 0,
            bottom: 0,
            width: StyleSheet.hairlineWidth,
            backgroundColor: CYAN_MID,
            opacity: 0.04,
          }}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={`h${i}`}
          style={{
            position: 'absolute',
            top: i * CELL,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: CYAN_MID,
            opacity: 0.04,
          }}
        />
      ))}
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    width: '92%',
    alignSelf: 'center',
    borderRadius: 8,
    // Outer glow
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  innerPanel: {
    margin: 2, // creates the 2px gradient border effect
    borderRadius: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    gap: 10,
    zIndex: 2,
  },
  titleBox: {
    borderWidth: 1.5,
    borderColor: CYAN_MID,
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  titleText: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 16,
    color: CYAN_TEXT,
    letterSpacing: 3,
    fontWeight: '700',
    textShadowColor: CYAN_MID,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  innerFrame: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 6,
    minHeight: 100,
    overflow: 'hidden',
    zIndex: 2,
  },
  contentArea: {
    padding: 20,
    zIndex: 3,
  },
});

export default SystemNotification;
