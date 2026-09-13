import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Dumbbell, Clock, Flame } from 'lucide-react-native';
import type { OverviewStats } from '../../services/ReportsService';

interface OverviewCardsProps {
  stats: OverviewStats;
}

export default function OverviewCards({ stats }: OverviewCardsProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toLocaleString();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Total Workouts Card */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Dumbbell size={18} color="#4080E7" />
        </View>
        <Text style={styles.cardValue}>{stats.totalWorkouts || 0}</Text>
        <Text style={styles.cardLabel}>WORKOUTS</Text>
      </View>

      {/* Active Time Card */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Clock size={18} color="#4080E7" />
        </View>
        <Text style={styles.cardValue}>
          {stats.totalWorkoutTimeFormatted || '0m'}
        </Text>
        <Text style={styles.cardLabel}>TOTAL TIME</Text>
      </View>

      {/* Total Volume Card */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Flame size={18} color="#4080E7" />
        </View>
        <Text style={styles.cardValue}>
          {formatVolume(stats.totalTrainingVolume)}
          <Text style={styles.cardUnit}> kg</Text>
        </Text>
        <Text style={styles.cardLabel}>TOTAL VOLUME</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)' }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 2,
        }),
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});

