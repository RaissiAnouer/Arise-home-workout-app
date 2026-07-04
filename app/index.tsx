import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';

export default function HomeScreen() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const router = useRouter();

  // Temporary redirect for testing the home page directly
  return <Redirect href="/home" />;

  /*
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../src/images/background.png')} 
        style={styles.background} 
        resizeMode="cover"
        blurRadius={10}
      >
        {/* Dark gradient overlay to create mood and contrast for text *\/}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          {/* Main Title Area with Glow *\/}
          <View style={styles.titleContainer}>
            <Text style={styles.titleGlow}>Arise</Text>
            <Text style={styles.title}>Arise</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.subtitle}>YOUR HOME WORKOUT APP</Text>
        </View>

        {/* Action Button *\/}
        <Pressable 
          onPress={() => router.push('/questionnaire')}
          style={({ pressed }) => [
            styles.tapButton,
            pressed && { transform: [{ scale: 0.95 }] }
          ]}
        >
          <Animated.View style={{ opacity: pulseAnim }}>
            <Text style={styles.tapText}>TAP TO START</Text>
          </Animated.View>
        </Pressable>

      </ImageBackground>
    </View>
  );
  */
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '20%',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Eternal',
    fontSize: 75,
    color: '#FFFFFF',
    letterSpacing: 10,
    textTransform: 'uppercase',
  },
  titleGlow: {
    position: 'absolute',
    fontFamily: 'Eternal',
    fontSize: 75,
    color: 'transparent', 
    letterSpacing: 10,
    textTransform: 'uppercase',
    textShadowColor: '#1b45d7', // Deep neon blue
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#1b45d7',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#1b45d7',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 10,
    textAlign: 'center',
    paddingLeft: 10, // offsets the right-side letter spacing of the final character for perfect optical centering
  },
  tapButton: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  tapText: {
    fontFamily: 'LatoRegular',
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: 6,
  }
});
