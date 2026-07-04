import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function NutritionScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>NUTRITION</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020D1A',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 24,
    color: '#00A3FF',
  }
});
