import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SoloLevelingTitleProps {
  line1?: string;
  line2?: string;
}

export function SoloLevelingTitle({
  line1 = "SOLO LEVELING",
  line2 = "WORKOUT"
}: SoloLevelingTitleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.titleContainer}>
        {/* Layer 5: Deepest, widest glow */}
        <View style={styles.glowLayer5}>
          <Text style={[styles.line, styles.shadow5]}>{line1}</Text>
          <Text style={[styles.line, styles.shadow5]}>{line2}</Text>
        </View>

        {/* Layer 4 */}
        <View style={styles.glowLayer4}>
          <Text style={[styles.line, styles.shadow4]}>{line1}</Text>
          <Text style={[styles.line, styles.shadow4]}>{line2}</Text>
        </View>

        {/* Layer 3 */}
        <View style={styles.glowLayer3}>
          <Text style={[styles.line, styles.shadow3]}>{line1}</Text>
          <Text style={[styles.line, styles.shadow3]}>{line2}</Text>
        </View>

        {/* Layer 2 */}
        <View style={styles.glowLayer2}>
          <Text style={[styles.line, styles.shadow2]}>{line1}</Text>
          <Text style={[styles.line, styles.shadow2]}>{line2}</Text>
        </View>

        {/* Layer 1: Brightest, tightest glow (also serves as the base text layer) */}
        <View style={styles.mainTextContainer}>
          <Text style={[styles.line, styles.shadow1]}>{line1}</Text>
          <Text style={[styles.line, styles.shadow1]}>{line2}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    // Radial gradient is not supported natively, so we let the screen's dark background show through.
  },
  titleContainer: {
    alignItems: 'center',
    transform: [{ skewX: '-8deg' }],
  },
  line: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#000000', // Black text with glowing aura
  },
  // We use absolute positioning for all underlying glow layers
  glowLayer5: {
    position: 'absolute',
    alignItems: 'center',
  },
  glowLayer4: {
    position: 'absolute',
    alignItems: 'center',
  },
  glowLayer3: {
    position: 'absolute',
    alignItems: 'center',
  },
  glowLayer2: {
    position: 'absolute',
    alignItems: 'center',
  },
  mainTextContainer: {
    alignItems: 'center',
  },
  // Multi-layered shadows
  shadow5: {
    color: 'transparent',
    textShadowColor: '#01579b',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 80,
  },
  shadow4: {
    color: 'transparent',
    textShadowColor: '#0091ea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 48,
  },
  shadow3: {
    color: 'transparent',
    textShadowColor: '#29b6f6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  shadow2: {
    color: 'transparent',
    textShadowColor: '#4fc3f7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  shadow1: {
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
