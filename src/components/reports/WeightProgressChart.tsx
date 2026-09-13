import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, Animated, Platform } from 'react-native';
import Svg, {
  Polyline,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
  Text as SvgText,
  Path,
} from 'react-native-svg';
import { Plus, TrendingUp, Scale } from 'lucide-react-native';
import type { WeightEntry } from '../../repositories/WeightLogRepository';
import type { TimeFilter } from '../../services/ReportsService';
import { typography } from '../../styles/typography';

interface WeightProgressChartProps {
  entries: WeightEntry[];
  filter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  onAddEntry: (weight: number, date?: string) => void;
  targetWeight?: string | null;
}

const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All' },
];

const CHART_WIDTH = 320;
const CHART_HEIGHT = 150;
const PADDING_LEFT = 38;
const PADDING_RIGHT = 16;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 24;

export default function WeightProgressChart({
  entries,
  filter,
  onFilterChange,
  onAddEntry,
  targetWeight,
}: WeightProgressChartProps) {
  const [showModal, setShowModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [filter, entries.length]);

  const handleAdd = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0) {
      onAddEntry(w);
      setWeightInput('');
      setShowModal(false);
    }
  };

  // ─── Chart calculations ────────────────────────────────────────────

  const usableW = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const usableH = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const weights = entries.map((e) => e.weight);
  const minW = weights.length > 0 ? Math.min(...weights) - 2 : 0;
  const maxW = weights.length > 0 ? Math.max(...weights) + 2 : 100;
  const range = maxW - minW || 1;

  const points = entries.map((entry, i) => {
    const x = PADDING_LEFT + (entries.length > 1 ? (i / (entries.length - 1)) * usableW : usableW / 2);
    const y = PADDING_TOP + usableH - ((entry.weight - minW) / range) * usableH;
    return { x, y, entry };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const areaPath =
    points.length > 1
      ? `M${points[0].x},${PADDING_TOP + usableH} ` +
        points.map((p) => `L${p.x},${p.y}`).join(' ') +
        ` L${points[points.length - 1].x},${PADDING_TOP + usableH} Z`
      : '';

  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }).map((_, i) => {
    const val = minW + (range / ySteps) * i;
    return Math.round(val * 10) / 10;
  });

  const targetW = targetWeight ? parseFloat(targetWeight) : null;
  const targetY = targetW ? PADDING_TOP + usableH - ((targetW - minW) / range) * usableH : null;

  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;

  return (
    <View style={styles.container}>
      {/* Title & Add Button */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Body Weight Progress</Text>
        <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>LOG WEIGHT</Text>
        </Pressable>
      </View>

      {/* Current Weight & Goal row */}
      <View style={styles.statSummaryRow}>
        <View style={styles.currentWeightBlock}>
          <Text style={styles.statLabel}>CURRENT WEIGHT</Text>
          <View style={styles.weightValueRow}>
            <Text style={styles.weightValue}>{currentWeight !== null ? currentWeight : '--'}</Text>
            <Text style={styles.weightUnit}> kg</Text>
          </View>
        </View>

        {targetW && (
          <View style={styles.targetWeightBlock}>
            <Text style={styles.statLabel}>GOAL WEIGHT</Text>
            <View style={styles.weightValueRow}>
              <Text style={styles.targetValue}>{targetW}</Text>
              <Text style={styles.weightUnit}> kg</Text>
            </View>
          </View>
        )}
      </View>

      {/* Filter Pills */}
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

      {/* Chart */}
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Scale size={36} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>No weight entries</Text>
          <Text style={styles.emptySubText}>Log your weight regularly to track progress</Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
            <Defs>
              <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#4080E7" stopOpacity="0.35" />
                <Stop offset="1" stopColor="#4080E7" stopOpacity="0.02" />
              </SvgLinearGradient>
            </Defs>

            {/* Y-axis labels & grid */}
            {yLabels.map((val, i) => {
              const y = PADDING_TOP + usableH - (i / ySteps) * usableH;
              return (
                <React.Fragment key={`y-${i}`}>
                  <SvgText
                    x={PADDING_LEFT - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.3)"
                    fontSize={9}
                  >
                    {val.toFixed(0)}
                  </SvgText>
                  <Rect
                    x={PADDING_LEFT}
                    y={y}
                    width={usableW}
                    height={0.5}
                    fill="rgba(255,255,255,0.05)"
                  />
                </React.Fragment>
              );
            })}

            {/* Target weight line */}
            {targetY !== null && targetY > PADDING_TOP && targetY < PADDING_TOP + usableH && (
              <>
                <Rect
                  x={PADDING_LEFT}
                  y={targetY}
                  width={usableW}
                  height={1}
                  fill="rgba(64, 128, 231, 0.4)"
                />
                <SvgText
                  x={PADDING_LEFT + usableW + 2}
                  y={targetY + 3}
                  fill="#4080E7"
                  fontSize={8}
                >
                  Goal
                </SvgText>
              </>
            )}

            {/* Area fill */}
            {areaPath && <Path d={areaPath} fill="url(#areaGrad)" />}

            {/* Line */}
            {points.length > 1 && (
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke="#4080E7"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Data points */}
            {points.map((p, i) => (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={3}
                fill="#FFFFFF"
              />
            ))}

            {/* X-axis labels */}
            {entries.length > 0 && (
              <>
                <SvgText
                  x={PADDING_LEFT}
                  y={CHART_HEIGHT - 4}
                  fill="rgba(255,255,255,0.35)"
                  fontSize={9}
                >
                  {entries[0].date.slice(5)}
                </SvgText>
                {entries.length > 2 && (
                  <SvgText
                    x={PADDING_LEFT + usableW / 2}
                    y={CHART_HEIGHT - 4}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.35)"
                    fontSize={9}
                  >
                    {entries[Math.floor(entries.length / 2)].date.slice(5)}
                  </SvgText>
                )}
                <SvgText
                  x={PADDING_LEFT + usableW}
                  y={CHART_HEIGHT - 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.35)"
                  fontSize={9}
                >
                  {entries[entries.length - 1].date.slice(5)}
                </SvgText>
              </>
            )}
          </Svg>
        </Animated.View>
      )}

      {/* Add Weight Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>LOG BODY WEIGHT</Text>
            <Text style={styles.modalSubtitle}>Enter your current weight in kg</Text>

            <TextInput
              style={styles.modalInput}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="e.g. 75.5"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="numeric"
              selectionColor="#4080E7"
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>CANCEL</Text>
              </Pressable>
              <Pressable style={styles.modalSaveBtn} onPress={handleAdd}>
                <Text style={styles.modalSaveText}>SAVE</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    ...typography.h2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#4080E7',
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },

  statSummaryRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
  },
  currentWeightBlock: {
    gap: 2,
  },
  targetWeightBlock: {
    gap: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
  },
  weightValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  targetValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4080E7',
  },
  weightUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 12,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.2)',
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontWeight: '700',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontWeight: '600',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#4080E7',
    alignItems: 'center',
  },
  modalSaveText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

