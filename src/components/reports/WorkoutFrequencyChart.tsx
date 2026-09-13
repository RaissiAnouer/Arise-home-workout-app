import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import type { FrequencyDataPoint, TimeFilter } from '../../services/ReportsService';
import { BarChart2 } from 'lucide-react-native';
import { typography } from '../../styles/typography';

interface WorkoutFrequencyChartProps {
  data: FrequencyDataPoint[];
  filter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All' },
];

const CHART_HEIGHT = 160;
const CHART_PADDING_LEFT = 30;
const CHART_PADDING_RIGHT = 16;
const BAR_RADIUS = 4;

export default function WorkoutFrequencyChart({ data, filter, onFilterChange }: WorkoutFrequencyChartProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [filter]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const yMax = Math.ceil(maxCount / (maxCount > 4 ? 2 : 1)) * (maxCount > 4 ? 2 : 1);
  const ySteps = Math.min(yMax, 5);

  const chartWidth = 340;
  const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const barWidth = data.length > 0 ? Math.min(28, (usableWidth / data.length) * 0.6) : 20;
  const barGap = data.length > 0 ? (usableWidth - barWidth * data.length) / (data.length) : 0;

  return (
    <View style={styles.container}>
      {/* Header & Filter Row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Workout Frequency</Text>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
              onPress={() => onFilterChange(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Chart */}
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BarChart2 size={36} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>No workout history</Text>
          <Text style={styles.emptySubText}>Complete workouts to track your consistency</Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Svg width={chartWidth} height={CHART_HEIGHT + 30} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT + 30}`}>
            <Defs>
              <SvgLinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#4080E7" stopOpacity="1" />
                <Stop offset="1" stopColor="#4080E7" stopOpacity="0.35" />
              </SvgLinearGradient>
            </Defs>

            {/* Y-axis labels & grid lines */}
            {Array.from({ length: ySteps + 1 }).map((_, i) => {
              const val = Math.round((yMax / ySteps) * i);
              const y = CHART_HEIGHT - (i / ySteps) * CHART_HEIGHT;
              return (
                <React.Fragment key={`y-${i}`}>
                  <SvgText
                    x={CHART_PADDING_LEFT - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.35)"
                    fontSize={10}
                  >
                    {val}
                  </SvgText>
                  <Rect
                    x={CHART_PADDING_LEFT}
                    y={y}
                    width={usableWidth}
                    height={0.5}
                    fill="rgba(255,255,255,0.06)"
                  />
                </React.Fragment>
              );
            })}

            {/* Bars */}
            {data.map((point, index) => {
              const barHeight = yMax > 0 ? (point.count / yMax) * CHART_HEIGHT : 0;
              const x = CHART_PADDING_LEFT + barGap / 2 + index * (barWidth + barGap);
              const y = CHART_HEIGHT - barHeight;

              return (
                <React.Fragment key={`bar-${index}`}>
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, point.count > 0 ? 3 : 0)}
                    rx={BAR_RADIUS}
                    ry={BAR_RADIUS}
                    fill="url(#barGrad)"
                  />
                  <SvgText
                    x={x + barWidth / 2}
                    y={CHART_HEIGHT + 16}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.45)"
                    fontSize={9}
                  >
                    {point.label}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </Animated.View>
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
    borderColor: 'rgba(255,255,255,0.08)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 2,
        }),
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
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.2)',
    borderColor: '#4080E7',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  filterTextActive: {
    color: '#4080E7',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
  },
});

