import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlanScreen() {
  const router = useRouter();
  const { rank } = useLocalSearchParams<{ rank: string }>();

  const getPlanDetails = (hunterRank: string) => {
    switch (hunterRank) {
      case 'S':
        return { pushups: 100, situps: 100, squats: 100, run: '10km' };
      case 'A':
        return { pushups: 80, situps: 80, squats: 80, run: '8km' };
      case 'B':
        return { pushups: 60, situps: 60, squats: 60, run: '6km' };
      case 'C':
        return { pushups: 40, situps: 40, squats: 40, run: '4km' };
      case 'D':
        return { pushups: 20, situps: 20, squats: 20, run: '2km' };
      case 'E':
      default:
        return { pushups: 10, situps: 10, squats: 10, run: '1km' };
    }
  };

  const plan = getPlanDetails(rank || 'E');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>DAILY QUEST</Text>
          <Text style={styles.subtitle}>PREPARING TO BECOME POWERFUL</Text>
        </View>

        <Text style={styles.introText}>
          The system has generated a customized training plan based on your current Rank ({rank || 'E'}).
        </Text>
        
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(0, 163, 255, 0.1)', 'rgba(0, 0, 0, 0)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.taskContainer}>
            <View style={styles.taskItem}>
              <Text style={styles.taskLabel}>[Incomplete] Push-ups</Text>
              <Text style={styles.taskValue}>0 / {plan.pushups}</Text>
            </View>
            <View style={styles.taskItem}>
              <Text style={styles.taskLabel}>[Incomplete] Sit-ups</Text>
              <Text style={styles.taskValue}>0 / {plan.situps}</Text>
            </View>
            <View style={styles.taskItem}>
              <Text style={styles.taskLabel}>[Incomplete] Squats</Text>
              <Text style={styles.taskValue}>0 / {plan.squats}</Text>
            </View>
            <View style={styles.taskItem}>
              <Text style={styles.taskLabel}>[Incomplete] Running</Text>
              <Text style={styles.taskValue}>0 / {plan.run}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.warningText}>
          Warning: Failure to complete this Daily Quest will result in a penalty.
        </Text>

        <Pressable
          style={styles.startBtn}
          onPress={() => alert('Starting workout...')}
        >
          <Text style={styles.startBtnText}>START QUEST</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020D1A',
  },
  container: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 28,
    color: '#00A3FF',
    letterSpacing: 2,
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
  introText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#E6F7FF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(56, 182, 255, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: '#0B192C',
  },
  taskContainer: {
    padding: 20,
    gap: 16,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 182, 255, 0.15)',
    paddingBottom: 12,
  },
  taskLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#E6F7FF',
  },
  taskValue: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 16,
    color: '#38B6FF',
  },
  warningText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FF4500',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  startBtn: {
    width: '100%',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#39FF14',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 16,
    color: '#39FF14',
    letterSpacing: 2,
    textShadowColor: '#39FF14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
