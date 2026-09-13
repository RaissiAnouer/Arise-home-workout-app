import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
import type { MuscleHeatmapEntry } from '../../services/ReportsService';
import { User } from 'lucide-react-native';

interface MuscleHeatmapProps {
  data: MuscleHeatmapEntry[];
}

// ─── Realistic front body muscle regions ────────────────────────────
// ViewBox: 0 0 200 440  (centered human, head at top, feet at bottom)

const FRONT_BODY_OUTLINE =
  // Head
  'M100,10 C115,10 125,22 125,38 C125,54 115,64 100,64 C85,64 75,54 75,38 C75,22 85,10 100,10 Z' +
  // Neck
  ' M88,62 L88,76 L112,76 L112,62' +
  // Torso + shoulders
  ' M88,76 L68,80 L52,86 L42,96 L38,108' +
  // Left arm
  ' L36,130 L34,152 L30,172 L28,190 L26,200 L30,202 L38,192 L40,180 L44,164 L48,148 L50,132 L52,118' +
  // Left torso side
  ' L54,130 L56,150 L58,168 L60,180' +
  // Crotch area
  ' L68,190 L80,196 L100,200 L120,196 L132,190' +
  // Right leg start connects back up
  ' L140,180 L142,168 L144,150 L146,130 L148,118' +
  // Right arm
  ' L150,132 L152,148 L156,164 L160,180 L162,192 L170,202 L174,200 L172,190 L170,172 L166,152 L164,130' +
  // Right shoulder
  ' L162,108 L158,96 L148,86 L132,80 L112,76' +
  // Left leg
  ' M60,180 L58,210 L56,240 L54,265 L52,290 L50,315 L48,340 L46,365 L44,385 L42,400 L38,415 L36,425 L44,430 L52,425 L52,415 L50,400 L52,385 L54,365 L56,340 L58,315 L60,290 L64,265 L68,240 L72,220 L78,205 L84,198' +
  // Right leg
  ' M116,198 L122,205 L128,220 L132,240 L136,265 L140,290 L142,315 L144,340 L146,365 L148,385 L150,400 L148,415 L148,425 L156,430 L164,425 L162,415 L158,400 L156,385 L154,365 L152,340 L150,315 L148,290 L146,265 L144,240 L142,210 L140,180';

const FRONT_MUSCLES: Record<string, string> = {
  // Left pec
  Chest:
    'M68,92 C72,86 84,82 96,84 L98,86 L98,110 C92,116 80,118 70,114 L66,108 Z' +
    ' M132,92 C128,86 116,82 104,84 L102,86 L102,110 C108,116 120,118 130,114 L134,108 Z',
  // Front delts
  Shoulders:
    'M52,88 C56,82 66,80 70,82 L68,92 L66,108 L54,112 L42,100 C42,96 46,90 52,88 Z' +
    ' M148,88 C144,82 134,80 130,82 L132,92 L134,108 L146,112 L158,100 C158,96 154,90 148,88 Z',
  // Biceps
  Biceps:
    'M42,100 L54,112 L52,126 L50,140 L46,150 L40,148 L36,136 L36,120 Z' +
    ' M158,100 L146,112 L148,126 L150,140 L154,150 L160,148 L164,136 L164,120 Z',
  // Forearms
  Forearms:
    'M46,150 L50,140 L52,152 L50,168 L46,182 L42,192 L36,196 L32,192 L30,180 L34,164 Z' +
    ' M154,150 L150,140 L148,152 L150,168 L154,182 L158,192 L164,196 L168,192 L170,180 L166,164 Z',
  // Abs / core
  Core:
    'M82,110 L98,110 L100,112 L102,110 L118,110 L120,120 L122,140 L124,160 L122,176 L118,186 L112,192 L100,196 L88,192 L82,186 L78,176 L76,160 L78,140 L80,120 Z',
  // Quads
  Quadriceps:
    'M62,192 L78,186 L82,200 L84,220 L84,250 L82,275 L78,295 L72,290 L66,270 L60,245 L58,220 Z' +
    ' M138,192 L122,186 L118,200 L116,220 L116,250 L118,275 L122,295 L128,290 L134,270 L140,245 L142,220 Z',
  // Hip Flexors (small area)
  'Hip Flexors':
    'M82,186 L88,192 L100,196 L112,192 L118,186 L122,176 L120,186 L110,194 L100,198 L90,194 L80,186 L78,176 Z',
  // Front calves (tibialis)
  Calves:
    'M54,300 L64,290 L72,295 L70,320 L66,345 L62,365 L58,375 L52,370 L50,350 L50,330 Z' +
    ' M146,300 L136,290 L128,295 L130,320 L134,345 L138,365 L142,375 L148,370 L150,350 L150,330 Z',
};

// ─── Realistic back body muscle regions ─────────────────────────────

const BACK_BODY_OUTLINE = FRONT_BODY_OUTLINE; // Same silhouette shape

const BACK_MUSCLES: Record<string, string> = {
  // Traps (upper back / neck area)
  Traps:
    'M80,72 L88,68 L100,66 L112,68 L120,72 L126,80 L130,86 L120,82 L100,80 L80,82 L70,86 L74,80 Z',
  // Upper back / rhomboids
  Back:
    'M70,88 L80,84 L98,82 L102,82 L120,84 L130,88 L134,100 L132,112 L126,118 L118,114 L102,112 L98,112 L82,114 L74,118 L68,112 L66,100 Z',
  // Lats
  Lats:
    'M62,108 L68,112 L74,118 L82,120 L84,140 L82,158 L78,170 L72,168 L64,156 L58,140 L56,124 Z' +
    ' M138,108 L132,112 L126,118 L118,120 L116,140 L118,158 L122,170 L128,168 L136,156 L142,140 L144,124 Z',
  // Triceps
  Triceps:
    'M42,100 L54,112 L56,124 L54,140 L50,152 L44,150 L38,140 L36,124 Z' +
    ' M158,100 L146,112 L144,124 L146,140 L150,152 L156,150 L162,140 L164,124 Z',
  // Rear delts
  Shoulders:
    'M52,88 C56,82 66,80 70,84 L70,88 L62,108 L56,118 L42,100 C42,96 46,90 52,88 Z' +
    ' M148,88 C144,82 134,80 130,84 L130,88 L138,108 L144,118 L158,100 C158,96 154,90 148,88 Z',
  // Glutes
  Glutes:
    'M72,172 L82,170 L98,174 L100,176 L102,174 L118,170 L128,172 L132,186 L128,196 L118,200 L100,202 L82,200 L72,196 L68,186 Z',
  // Hamstrings
  Hamstrings:
    'M64,198 L78,196 L84,204 L86,230 L84,260 L80,285 L74,296 L66,280 L60,255 L58,230 L60,210 Z' +
    ' M136,198 L122,196 L116,204 L114,230 L116,260 L120,285 L126,296 L134,280 L140,255 L142,230 L140,210 Z',
  // Rear calves
  Calves:
    'M56,300 L66,290 L74,296 L72,320 L68,345 L64,365 L60,375 L54,370 L52,350 L52,330 Z' +
    ' M144,300 L134,290 L126,296 L128,320 L132,345 L136,365 L140,375 L146,370 L148,350 L148,330 Z',
};

function getMuscleColor(intensity: number): string {
  if (intensity <= 0) return 'rgba(56, 182, 255, 0.05)';
  const alpha = 0.12 + (intensity / 100) * 0.88;
  return `rgba(56, 182, 255, ${alpha.toFixed(2)})`;
}

function getIntensityForMuscle(muscleName: string, data: MuscleHeatmapEntry[]): number {
  const entry = data.find(
    (d) => d.muscle.toLowerCase() === muscleName.toLowerCase()
  );
  return entry ? entry.intensity : 0;
}

export default function MuscleHeatmap({ data }: MuscleHeatmapProps) {
  const hasData = data.length > 0;

  return (
    <View style={styles.container}>
      {/* Body Illustrations */}
      <View style={styles.bodyRow}>
        {/* Front View */}
        <View style={styles.bodyView}>
          <Text style={styles.viewLabel}>FRONT</Text>
          <Svg width={150} height={320} viewBox="10 0 180 440">
            {/* Body silhouette */}
            <Path
              d={FRONT_BODY_OUTLINE}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeLinejoin="round"
            />
            {/* Head fill */}
            <Ellipse cx={100} cy={38} rx={24} ry={26} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            {/* Muscle regions */}
            {Object.entries(FRONT_MUSCLES).map(([muscle, path]) => (
              <Path
                key={muscle}
                d={path}
                fill={getMuscleColor(getIntensityForMuscle(muscle, data))}
                stroke="rgba(56, 182, 255, 0.15)"
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        </View>

        {/* Back View */}
        <View style={styles.bodyView}>
          <Text style={styles.viewLabel}>BACK</Text>
          <Svg width={150} height={320} viewBox="10 0 180 440">
            {/* Body silhouette */}
            <Path
              d={BACK_BODY_OUTLINE}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeLinejoin="round"
            />
            {/* Head fill */}
            <Ellipse cx={100} cy={38} rx={24} ry={26} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            {/* Muscle regions */}
            {Object.entries(BACK_MUSCLES).map(([muscle, path]) => (
              <Path
                key={muscle}
                d={path}
                fill={getMuscleColor(getIntensityForMuscle(muscle, data))}
                stroke="rgba(56, 182, 255, 0.15)"
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        </View>
      </View>

      {/* Intensity Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={styles.legendGradient}>
          {[0, 20, 40, 60, 80, 100].map((val) => (
            <View
              key={val}
              style={[styles.legendBlock, { backgroundColor: getMuscleColor(val) }]}
            />
          ))}
        </View>
        <Text style={styles.legendLabel}>More</Text>
      </View>

      {/* Ranked Muscle List */}
      {hasData ? (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>DOMINANT MUSCLES</Text>
          {data.slice(0, 3).map((entry, index) => (
            <View key={entry.muscle} style={styles.rankRow}>
              <View style={styles.rankLeft}>
                <Text style={[
                  styles.rankNumber,
                  index === 0 && styles.rankNumberGold,
                  index === 1 && styles.rankNumberSilver,
                  index === 2 && styles.rankNumberBronze,
                ]}>#{index + 1}</Text>
                <Text style={styles.rankMuscle}>{entry.muscle}</Text>
              </View>
              <View style={styles.rankRight}>
                <View style={styles.rankBarTrack}>
                  <View
                    style={[
                      styles.rankBarFill,
                      { width: `${entry.intensity}%` },
                      index === 0 && { backgroundColor: '#38B6FF' },
                      index === 1 && { backgroundColor: 'rgba(56,182,255,0.7)' },
                      index === 2 && { backgroundColor: 'rgba(56,182,255,0.5)' },
                    ]}
                  />
                </View>
                <Text style={styles.rankSets}>{entry.totalSets} sets</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyRanking}>
          <User size={32} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>No muscle data yet</Text>
          <Text style={styles.emptySubText}>Train to see your muscle heatmap</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 182, 255, 0.12)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 12px rgba(56, 182, 255, 0.08)' }
      : {
          shadowColor: '#38B6FF',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }),
  },
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bodyView: {
    alignItems: 'center',
  },
  viewLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 4,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  legendLabel: {
    fontWeight: 'normal',
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 2,
  },
  legendBlock: {
    width: 20,
    height: 10,
    borderRadius: 2,
  },

  // Ranking
  rankingContainer: {
    gap: 10,
  },
  rankingTitle: {
    fontWeight: 'bold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rankNumber: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#38B6FF',
    width: 26,
  },
  rankNumberGold: {
    color: '#FFD700',
  },
  rankNumberSilver: {
    color: '#C0C0C0',
  },
  rankNumberBronze: {
    color: '#CD7F32',
  },
  rankMuscle: {
    fontWeight: '600',
    fontSize: 13,
    color: '#FFFFFF',
  },
  rankRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  rankBarTrack: {
    flex: 1,
    maxWidth: 80,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rankBarFill: {
    height: '100%',
    backgroundColor: 'rgba(56,182,255,0.35)',
    borderRadius: 3,
  },
  rankSets: {
    fontWeight: 'normal',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    width: 50,
    textAlign: 'right',
  },

  // Empty state
  emptyRanking: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  emptySubText: {
    fontWeight: 'normal',
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 4,
  },
});
