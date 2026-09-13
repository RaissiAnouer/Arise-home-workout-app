import React, { useEffect, useRef, ReactNode } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SystemBorderProps = {
  /** Content rendered inside the border. */
  children: ReactNode;
  /** Whether the component is currently visible (drives fade-in). */
  visible?: boolean;
  /** Optional extra styles for the outer wrapper. */
  style?: ViewStyle;
  /** Whether to show the pulsing glow animation. Defaults to true. */
  animated?: boolean;
};

const CYAN_START = '#00A3FF';
const CYAN_MID   = '#38B6FF';
const CYAN_END   = '#00A3FF';
const BG_DARK    = '#020D1A'; 

const CORNER_SIZE  = 28;
const CORNER_THICK = 3;

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
      <View
        style={[
          cornerStyles.horizontal,
          isTop ? { top: 0 } : { bottom: 0 },
          isLeft ? { left: 0 } : { right: 0 },
        ]}
      />
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

export const SystemBorder: React.FC<SystemBorderProps> = ({
  children,
  visible = true,
  style,
  animated = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

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
    <Animated.View style={[styles.root, { opacity: fadeAnim }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowAnim }]}>
        <LinearGradient
          colors={[CYAN_START, CYAN_MID, CYAN_END]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.innerPanel}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: BG_DARK, borderRadius: 6 }]} />
        
        <CornerBracket position="topLeft" />
        <CornerBracket position="topRight" />
        <CornerBracket position="bottomLeft" />
        <CornerBracket position="bottomRight" />

        <View style={styles.contentArea}>
          {children}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    borderRadius: 8,
    shadowColor: CYAN_MID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  innerPanel: {
    margin: 2, 
    borderRadius: 6,
    overflow: 'hidden',
  },
  contentArea: {
    padding: 16,
    zIndex: 3,
  },
});

export default SystemBorder;
