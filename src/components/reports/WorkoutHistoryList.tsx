import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FileText, Clock, Dumbbell } from 'lucide-react-native';
import type { WorkoutHistoryEntry } from '../../services/ReportsService';
import { typography } from '../../styles/typography';

interface WorkoutHistoryListProps {
  data: WorkoutHistoryEntry[];
}

export default function WorkoutHistoryList({ data }: WorkoutHistoryListProps) {
  const formatVolume = (vol: number): string => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Workouts</Text>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={36} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>No workouts recorded</Text>
          <Text style={styles.emptySubText}>Finished workout sessions will appear here</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {data.slice(0, 5).map((entry, index) => (
            <View key={entry.id} style={[styles.card, index === 0 && styles.cardFirst]}>
              <View style={styles.cardAccent} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.workoutName} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={styles.workoutDate}>{entry.date}</Text>
                </View>
                <View style={styles.cardStats}>
                  <View style={styles.statItem}>
                    <Clock size={13} color="#4080E7" />
                    <Text style={styles.statText}>{entry.durationFormatted}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Dumbbell size={13} color="#4080E7" />
                    <Text style={styles.statText}>{formatVolume(entry.totalVolume)} kg</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {data.length > 5 && (
            <Text style={styles.moreText}>
              + {data.length - 5} more sessions
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    ...typography.h2,
  },
  list: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 2,
        }),
  },
  cardFirst: {
    borderColor: 'rgba(64, 128, 231, 0.3)',
  },
  cardAccent: {
    width: 3,
    backgroundColor: '#4080E7',
    opacity: 0.8,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  workoutDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontWeight: '500',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  moreText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyText: {
    fontWeight: '600',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
  },
});

