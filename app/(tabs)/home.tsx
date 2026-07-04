import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function HomeDashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>HOME</Text>
          <Text style={styles.subtitle}>PLAYER DASHBOARD</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020D1A', // Base dark app background
  },
  container: {
    flex: 1,
  },
  // Main Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 32,
    color: '#00A3FF',
    letterSpacing: 4,
    textShadowColor: '#00A3FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#E6F7FF',
    letterSpacing: 4,
    opacity: 0.8,
  },
});
