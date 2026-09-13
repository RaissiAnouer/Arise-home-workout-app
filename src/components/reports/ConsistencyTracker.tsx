import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import type { DailyConsistencyEntry, StreakStats } from '../../services/ReportsService';
import { typography } from '../../styles/typography';

interface ConsistencyTrackerProps {
  entries: DailyConsistencyEntry[];
  stats: StreakStats;
}

const SQUARE_SIZE = 14;
const SQUARE_GAP = 4;
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', ''];

const INTENSITY_COLORS = [
  { fill: 'rgba(255, 255, 255, 0.04)', stroke: 'rgba(255, 255, 255, 0.06)' }, // 0: None
  { fill: 'rgba(64, 128, 231, 0.28)', stroke: 'rgba(64, 128, 231, 0.45)' }, // 1: Low
  { fill: 'rgba(64, 128, 231, 0.55)', stroke: 'rgba(64, 128, 231, 0.75)' }, // 2: Medium
  { fill: 'rgba(64, 128, 231, 0.85)', stroke: '#4080E7' },                   // 3: High
  { fill: '#4080E7', stroke: '#00F0FF' },                                   // 4: Max Glow
];

export default function ConsistencyTracker({ entries }: ConsistencyTrackerProps) {
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

  // Group entries into weeks (columns)
  const { weeks, monthHeaders } = useMemo(() => {
    if (!entries || entries.length === 0) {
      return { weeks: [], monthHeaders: [] };
    }

    const cols: DailyConsistencyEntry[][] = [];
    let currentWeek: DailyConsistencyEntry[] = [];

    entries.forEach((entry, idx) => {
      currentWeek.push(entry);
      if (currentWeek.length === 7 || idx === entries.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    // Month headers positioning
    const headers: { month: string; colIndex: number }[] = [];
    let lastMonth = '';

    cols.forEach((week, colIdx) => {
      const firstDayOfWeek = week[0];
      if (firstDayOfWeek && firstDayOfWeek.monthLabel !== lastMonth) {
        lastMonth = firstDayOfWeek.monthLabel;
        headers.push({ month: lastMonth, colIndex: colIdx });
      }
    });

    return { weeks: cols, monthHeaders: headers };
  }, [entries]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Title */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Consistency Tracker</Text>
      </View>

      {/* Contribution Grid Container */}
      <View style={styles.gridContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridScrollContent}
        >
          {/* Day Labels Column */}
          <View style={styles.dayLabelsCol}>
            {DAY_LABELS.map((label, i) => (
              <View key={i} style={styles.dayLabelCell}>
                <Text style={styles.dayLabelText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Grid Columns */}
          <View style={styles.gridMain}>
            {/* Month Headers */}
            <View style={styles.monthHeaderRow}>
              {monthHeaders.map((mh, i) => (
                <Text
                  key={i}
                  style={[
                    styles.monthHeaderText,
                    { left: mh.colIndex * (SQUARE_SIZE + SQUARE_GAP) },
                  ]}
                >
                  {mh.month}
                </Text>
              ))}
            </View>

            {/* Weeks Columns */}
            <View style={styles.weeksContainer}>
              {weeks.map((week, colIdx) => (
                <View key={colIdx} style={styles.weekColumn}>
                  {week.map((entry) => {
                    const styleConfig = INTENSITY_COLORS[entry.intensityLevel] || INTENSITY_COLORS[0];

                    return (
                      <View
                        key={entry.dateStr}
                        style={[
                          styles.square,
                          {
                            backgroundColor: styleConfig.fill,
                            borderColor: styleConfig.stroke,
                            borderWidth: 0.8,
                          },
                          entry.intensityLevel === 4 && styles.squareGlow,
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Legend Row */}
        <View style={styles.legendRow}>
          <Text style={styles.legendText}>Less</Text>
          <View style={styles.legendBlocks}>
            {INTENSITY_COLORS.map((cfg, idx) => (
              <View
                key={idx}
                style={[
                  styles.legendSquare,
                  { backgroundColor: cfg.fill, borderColor: cfg.stroke },
                ]}
              />
            ))}
          </View>
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
  },
  subTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '400',
  },

  gridContainer: {
    gap: 12,
  },
  gridScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  dayLabelsCol: {
    paddingRight: 6,
    paddingTop: 18,
    gap: SQUARE_GAP,
  },
  dayLabelCell: {
    height: SQUARE_SIZE,
    justifyContent: 'center',
  },
  dayLabelText: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  gridMain: {
    position: 'relative',
  },
  monthHeaderRow: {
    height: 18,
    position: 'relative',
    marginBottom: 2,
  },
  monthHeaderText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: SQUARE_GAP,
  },
  weekColumn: {
    gap: SQUARE_GAP,
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 3,
  },
  squareGlow: {
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 6px rgba(0, 240, 255, 0.5)' }
      : {}),
  },

  // ─── Legend ──────────────────────────────────────────────────
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  legendBlocks: {
    flexDirection: 'row',
    gap: 3,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 0.8,
  },
});
