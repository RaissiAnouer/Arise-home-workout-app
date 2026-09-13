import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function QuestCard() {
  const textFont = Platform.OS === 'ios' ? 'System' : 'sans-serif';

  return (
    <View style={styles.glowWrapper}>
      <LinearGradient
        colors={['#1A1029', '#2B1745']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Subtle top highlight */}
        <View style={styles.highlight} />
        
        {/* Decorative Corner Lines */}
        <View style={[styles.cornerLine, styles.topLeft]} />
        <View style={[styles.cornerLine, styles.topRight]} />
        <View style={[styles.cornerLine, styles.bottomLeft]} />
        <View style={[styles.cornerLine, styles.bottomRight]} />

        {/* Faint Particle Effects */}
        <View style={[styles.particle, { top: 15, left: 40, opacity: 0.3, transform: [{ scale: 0.8 }] }]} />
        <View style={[styles.particle, { top: 45, right: 30, opacity: 0.5, transform: [{ scale: 1.2 }] }]} />
        <View style={[styles.particle, { bottom: 20, left: '45%', opacity: 0.4, transform: [{ scale: 0.9 }] }]} />
        <View style={[styles.particle, { bottom: 10, right: '25%', opacity: 0.2, transform: [{ scale: 0.7 }] }]} />

        <View style={styles.contentContainer}>
          <View style={styles.leftColumn}>
            <Text style={[styles.title, { fontFamily: textFont }]}>Sit-ups</Text>
            <Text style={[styles.subtitle, { fontFamily: textFont }]}>Daily Quest</Text>
          </View>
          <View style={styles.rightColumn}>
            <Text style={[styles.progress, { fontFamily: textFont }]}>[50 / 100]</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrapper: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    // Ambient purple glow behind the card
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    // Soft neon violet border
    borderColor: 'rgba(138, 43, 226, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    // Semi-transparent glassmorphism base color
    backgroundColor: 'rgba(26, 16, 41, 0.7)',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cornerLine: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: 'rgba(138, 43, 226, 0.6)',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 16,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1C4E9',
    shadowColor: '#D1C4E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  leftColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    // Inner glow / drop shadow for text
    textShadowColor: 'rgba(138, 43, 226, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: '#C0C0D0', // light gray
    fontSize: 13,
  },
  rightColumn: {
    justifyContent: 'center',
  },
  progress: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500', // medium weight
    textShadowColor: 'rgba(138, 43, 226, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  }
});
