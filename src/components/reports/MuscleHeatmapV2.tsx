import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
  Platform,
  Modal,
} from 'react-native';
import { Dumbbell, X, User, Calendar, Clock, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { MuscleHeatmapEntry } from '../../services/ReportsService';
import Body, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { HEATMAP_LEGEND_STOPS } from './body/muscleColors';
import { typography } from '../../styles/typography';

interface MuscleHeatmapV2Props {
  data: MuscleHeatmapEntry[];
  title?: string;
}

type ViewMode = 'front' | 'back';

const SLUG_TO_MUSCLE: Record<string, string> = {
  chest: 'Chest',
  deltoids: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearm: 'Forearms',
  abs: 'Core',
  obliques: 'Hip Flexors',
  adductors: 'Quadriceps',
  quadriceps: 'Quadriceps',
  hamstring: 'Hamstrings',
  gluteal: 'Glutes',
  calves: 'Calves',
  trapezius: 'Traps',
  'upper-back': 'Back',
  'lower-back': 'Back',
};

// ─── Muscle Detail Modal ────────────────────────────────────────────

function MuscleDetailModal({
  visible,
  entry,
  onClose,
}: {
  visible: boolean;
  entry: MuscleHeatmapEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.muscleBadge}>
              <Dumbbell size={16} color="#4080E7" />
            </View>
            <Text style={modalStyles.muscleName}>{entry.muscle}</Text>
            <Pressable onPress={onClose} style={modalStyles.closeButton}>
              <X size={18} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>

          {/* Stats Grid */}
          <View style={modalStyles.statsGrid}>
            <StatItem
              icon="barbell-outline"
              label="Total Sets"
              value={`${entry.totalSets}`}
              color="#4080E7"
            />
            <StatItem
              icon="trending-up-outline"
              label="Total Volume"
              value={formatVolume(entry.totalVolume)}
              color="#4080E7"
            />
            <StatItem
              icon="calendar-outline"
              label="Workouts"
              value={`${entry.workoutCount}`}
              color="#4080E7"
            />
            <StatItem
              icon="time-outline"
              label="Last Trained"
              value={entry.lastTrainedDate}
              color="#4080E7"
            />
          </View>

          {/* Intensity Bar */}
          <View style={modalStyles.intensitySection}>
            <Text style={modalStyles.intensityLabel}>TRAINING INTENSITY</Text>
            <View style={modalStyles.intensityBarTrack}>
              <LinearGradient
                colors={['rgba(64, 128, 231, 0.4)', '#4080E7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[modalStyles.intensityBarFill, { width: `${entry.intensity}%` }]}
              />
            </View>
            <Text style={modalStyles.intensityValue}>{entry.intensity}%</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const STAT_ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  'barbell-outline': Dumbbell,
  'trending-up-outline': TrendingUp,
  'calendar-outline': Calendar,
  'time-outline': Clock,
};

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  const IconComponent = STAT_ICON_MAP[icon] || Dumbbell;
  return (
    <View style={modalStyles.statItem}>
      <View style={[modalStyles.statIcon, { backgroundColor: 'rgba(64, 128, 231, 0.12)' }]}>
        <IconComponent size={14} color={color} />
      </View>
      <Text style={modalStyles.statLabel}>{label}</Text>
      <Text style={modalStyles.statValue}>{value}</Text>
    </View>
  );
}

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M kg`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K kg`;
  return `${vol} kg`;
}

// ─── Main Component ─────────────────────────────────────────────────

const MUSCLE_TO_SLUGS: Record<string, Slug[]> = {
  'Chest': ['chest'],
  'Shoulders': ['deltoids'],
  'Biceps': ['biceps'],
  'Triceps': ['triceps'],
  'Forearms': ['forearm'],
  'Core': ['abs'],
  'Hip Flexors': ['obliques'],
  'Quadriceps': ['quadriceps', 'adductors'],
  'Hamstrings': ['hamstring'],
  'Glutes': ['gluteal'],
  'Calves': ['calves', 'tibialis'],
  'Traps': ['trapezius'],
  'Back': ['upper-back', 'lower-back'],
};

export default function MuscleHeatmapV2({ data, title }: MuscleHeatmapV2Props) {
  const { width: screenWidth } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const hasData = data.length > 0;

  const bodyData = useMemo<ExtendedBodyPart[]>(() => {
    const result: ExtendedBodyPart[] = [];
    data.forEach((entry) => {
      const slugs = MUSCLE_TO_SLUGS[entry.muscle] || [];
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

  const toggleView = useCallback((mode: ViewMode) => {
    if (mode === viewMode) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setViewMode(mode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    Animated.timing(slideAnim, {
      toValue: mode === 'front' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [viewMode, fadeAnim, slideAnim]);

  const handleBodyPartPress = useCallback((part: ExtendedBodyPart) => {
    if (!part?.slug) return;
    const muscleName = SLUG_TO_MUSCLE[part.slug];
    if (muscleName) {
      const entry = data.find((d) => d.muscle.toLowerCase() === muscleName.toLowerCase());
      if (entry) {
        setSelectedMuscle(muscleName);
        setModalVisible(true);
      }
    }
  }, [data]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedMuscle(null);
  }, []);

  const selectedEntry = useMemo(() => {
    if (!selectedMuscle) return null;
    return data.find((d) => d.muscle.toLowerCase() === selectedMuscle.toLowerCase()) || null;
  }, [selectedMuscle, data]);

  const toggleSlide = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.container}>
      {/* Section Title & View Toggle */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title || 'Muscle Distribution'}</Text>
        <View style={styles.toggleTrack}>
          <Animated.View
            style={[
              styles.toggleIndicator,
              { left: toggleSlide },
            ]}
          />
          <Pressable
            style={styles.toggleButton}
            onPress={() => toggleView('front')}
          >
            <User
              size={13}
              color={viewMode === 'front' ? '#4080E7' : 'rgba(255,255,255,0.4)'}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'front' && styles.toggleTextActive,
              ]}
            >
              FRONT
            </Text>
          </Pressable>
          <Pressable
            style={styles.toggleButton}
            onPress={() => toggleView('back')}
          >
            <User
              size={13}
              color={viewMode === 'back' ? '#4080E7' : 'rgba(255,255,255,0.4)'}
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'back' && styles.toggleTextActive,
              ]}
            >
              BACK
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Body Illustration */}
      <Animated.View style={[styles.bodyContainer, { opacity: fadeAnim }]}>
        <Body
          data={bodyData}
          side={viewMode}
          gender="male"
          scale={1.2}
          border="rgba(255,255,255,0.15)"
          defaultFill="rgba(255,255,255,0.05)"
          colors={[
            'rgba(64, 128, 231, 0.35)',
            'rgba(64, 128, 231, 0.55)',
            'rgba(64, 128, 231, 0.75)',
            '#4080E7',
            '#60A5FA',
          ]}
          onBodyPartPress={handleBodyPartPress}
        />

        {!hasData && (
          <View style={styles.emptyOverlay}>
            <User size={40} color="rgba(255,255,255,0.12)" />
            <Text style={styles.emptyTitle}>No Muscle Data</Text>
            <Text style={styles.emptySubtitle}>Complete workouts to view your muscle heatmap</Text>
          </View>
        )}

        {hasData && (
          <Text style={styles.tapHint}>Tap a muscle for details</Text>
        )}
      </Animated.View>

      {/* Intensity Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={styles.legendGradient}>
          {HEATMAP_LEGEND_STOPS.map((stop, i) => (
            <View
              key={i}
              style={[
                styles.legendBlock,
                { backgroundColor: stop.color },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendLabel}>More</Text>
      </View>

      {/* Muscle Detail Modal */}
      <MuscleDetailModal
        visible={modalVisible}
        entry={selectedEntry}
        onClose={handleCloseModal}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h2,
  },

  // Toggle
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 3,
    position: 'relative',
    width: 150,
  },
  toggleIndicator: {
    position: 'absolute',
    top: 3,
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(64, 128, 231, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4080E7',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
    zIndex: 1,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
  },
  toggleTextActive: {
    color: '#4080E7',
  },

  // Body
  bodyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 260,
  },
  tapHint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 6,
    textAlign: 'center',
  },

  emptyOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 2,
  },

  // Legend
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 3,
  },
  legendBlock: {
    width: 22,
    height: 8,
    borderRadius: 2,
  },

  // Ranking
  rankingSection: {
    gap: 6,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rankingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderRadius: 8,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.2)',
    borderWidth: 1,
    borderColor: '#4080E7',
  },
  rankNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  rankNumberTop: {
    color: '#4080E7',
  },
  rankMuscle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rankSubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
  },
  rankRight: {
    flex: 1,
    maxWidth: 90,
    justifyContent: 'center',
  },
  rankBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rankBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  emptyRanking: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyRankTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  emptyRankSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 2,
  },
});

// ─── Modal Styles ───────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  muscleBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'flex-start',
    gap: 4,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  intensitySection: {
    gap: 6,
  },
  intensityLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
  },
  intensityBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  intensityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  intensityValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4080E7',
    textAlign: 'right',
  },
});

