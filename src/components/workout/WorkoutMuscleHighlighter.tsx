import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Body, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import type { MuscleHeatmapEntry } from '../../services/ReportsService';
import { typography } from '../../styles/typography';

interface WorkoutMuscleHighlighterProps {
  data: MuscleHeatmapEntry[];
}

const MUSCLE_TO_SLUGS: Record<string, Slug[]> = {
  chest: ['chest'],
  pectorals: ['chest'],
  shoulders: ['deltoids'],
  delts: ['deltoids'],
  deltoids: ['deltoids'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  core: ['abs'],
  abs: ['abs'],
  'hip flexors': ['obliques'],
  quadriceps: ['quadriceps', 'adductors'],
  quads: ['quadriceps', 'adductors'],
  hamstrings: ['hamstring'],
  glutes: ['gluteal'],
  calves: ['calves', 'tibialis'],
  traps: ['trapezius'],
  back: ['upper-back', 'lower-back'],
  lats: ['upper-back'],
  'upper back': ['upper-back', 'trapezius'],
  'lower back': ['lower-back'],
  spine: ['lower-back'],
};

export default function WorkoutMuscleHighlighter({ data }: WorkoutMuscleHighlighterProps) {
  const bodyData = useMemo<ExtendedBodyPart[]>(() => {
    const result: ExtendedBodyPart[] = [];
    data.forEach((entry) => {
      const key = entry.muscle.toLowerCase().trim();
      const slugs = MUSCLE_TO_SLUGS[key] || [];
      const intensityLevel = Math.max(1, Math.min(5, Math.ceil((entry.intensity / 100) * 5)));
      slugs.forEach((slug) => {
        result.push({
          slug,
          intensity: intensityLevel,
        });
      });
    });
    return result;
  }, [data]);

  // Extract top targeted muscle names for quick pill badges
  const topMuscles = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalSets - a.totalSets)
      .slice(0, 4)
      .map((d) => d.muscle);
  }, [data]);

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Target Muscles</Text>
        <View style={styles.badgeRow}>
          {topMuscles.map((muscle) => (
            <View key={muscle} style={styles.muscleBadge}>
              <Text style={styles.badgeText}>{muscle}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Side-by-Side Front & Back Mini Bodies */}
      <View style={styles.bodiesRow}>
        {/* Front View */}
        <View style={styles.bodyCol}>
          <View style={styles.bodyWrapper}>
            <Body
              data={bodyData}
              side="front"
              gender="male"
              scale={0.78}
              border="rgba(255,255,255,0.18)"
              defaultFill="rgba(255,255,255,0.06)"
              colors={[
                'rgba(64, 128, 231, 0.45)',
                'rgba(64, 128, 231, 0.65)',
                'rgba(64, 128, 231, 0.85)',
                '#4080E7',
                '#60A5FA',
              ]}
            />
          </View>
          <Text style={styles.sideLabel}>FRONT</Text>
        </View>

        {/* Back View */}
        <View style={styles.bodyCol}>
          <View style={styles.bodyWrapper}>
            <Body
              data={bodyData}
              side="back"
              gender="male"
              scale={0.78}
              border="rgba(255,255,255,0.18)"
              defaultFill="rgba(255,255,255,0.06)"
              colors={[
                'rgba(64, 128, 231, 0.45)',
                'rgba(64, 128, 231, 0.65)',
                'rgba(64, 128, 231, 0.85)',
                '#4080E7',
                '#60A5FA',
              ]}
            />
          </View>
          <Text style={styles.sideLabel}>BACK</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleBadge: {
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderColor: 'rgba(64, 128, 231, 0.35)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#4080E7',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bodiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 2,
  },
  bodyCol: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bodyWrapper: {
    height: 165,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sideLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginTop: 2,
  },
});
