import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, ChevronUp, ChevronDown, Play } from 'lucide-react-native';
import { useWorkoutPlan } from '../src/context/WorkoutPlanContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarVisibility } from '../src/context/TabBarVisibilityContext';
import {
  ALL_WORKOUT_ROUTINES,
  PROGRESSIVE_OVERLOAD_GUIDE,
  SETS_AND_REPS_GUIDE,
  WorkoutProgram,
} from '../src/data/workoutRoutines';
import { typography, toTitleCase } from '../src/styles/typography';

export default function WorkoutPlanScreen() {
  const insets = useSafeAreaInsets();
  const { onScroll } = useTabBarVisibility();
  const router = useRouter();
  const { currentPlan, createAndSavePlan, isLoadingPlan } = useWorkoutPlan();
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<'all' | 'gym' | 'bodyweight' | 'dumbbells'>('all');
  const [showOverloadRules, setShowOverloadRules] = useState(false);

  const filteredRoutines = ALL_WORKOUT_ROUTINES.filter(
    r => selectedEquipmentFilter === 'all' || r.equipment === selectedEquipmentFilter
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Active Training Routine</Text>
          <Text style={styles.headerSubtitle}>
            {currentPlan?.programName || 'Evidence-Based Hypertrophy & Strength'}
          </Text>
        </View>

        {/* Progressive Overload Notice Banner */}
        <Pressable
          style={styles.overloadBanner}
          onPress={() => setShowOverloadRules(!showOverloadRules)}
        >
          <View style={styles.overloadHeader}>
            <TrendingUp size={20} color="#00FF9D" />
            <Text style={styles.overloadTitle}>Progressive Overload Rules</Text>
            {showOverloadRules
              ? <ChevronUp size={18} color="#00FF9D" />
              : <ChevronDown size={18} color="#00FF9D" />}
          </View>

          {showOverloadRules && (
            <View style={styles.overloadBody}>
              <Text style={styles.overloadRuleItem}>
                • <Text style={styles.boldText}>Weight Increases:</Text> {PROGRESSIVE_OVERLOAD_GUIDE.weightIncrease}
              </Text>
              <Text style={styles.overloadRuleItem}>
                • <Text style={styles.boldText}>Weekly Volume:</Text> {PROGRESSIVE_OVERLOAD_GUIDE.weeklyVolume}
              </Text>
              <Text style={styles.overloadRuleItem}>
                • <Text style={styles.boldText}>Intensity Target:</Text> {PROGRESSIVE_OVERLOAD_GUIDE.intensityRIR}
              </Text>
              <Text style={styles.overloadRuleItem}>
                • <Text style={styles.boldText}>Rest Intervals:</Text> {PROGRESSIVE_OVERLOAD_GUIDE.restIntervals.compound} for compound lifts, {PROGRESSIVE_OVERLOAD_GUIDE.restIntervals.isolation} for isolation exercises.
              </Text>

              {/* Sets & Reps Prescriptions Table */}
              <View style={styles.tableContainer}>
                <Text style={styles.tableTitle}>Sets & Reps Prescriptions</Text>
                {Object.entries(SETS_AND_REPS_GUIDE).map(([key, val]) => (
                  <View key={key} style={styles.tableRow}>
                    <Text style={styles.tableCellGoal}>{val.description}</Text>
                    <Text style={styles.tableCellSets}>{val.sets} Sets</Text>
                    <Text style={styles.tableCellReps}>{val.reps} Reps</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Pressable>

        {/* Active Days Breakdown */}
        {currentPlan?.days && currentPlan.days.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Daily Quests</Text>
            {currentPlan.days.map((day) => (
              <View key={day.dayNumber} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={styles.dayLabel}>DAY {day.dayNumber}: {day.dayLabel}</Text>
                    <Text style={styles.dayFocus}>{day.focus}</Text>
                  </View>
                  <Pressable
                    style={styles.startWorkoutBtn}
                    onPress={() => router.push(`/workout-details/${day.dayNumber}`)}
                  >
                    <Text style={styles.startWorkoutBtnText}>START</Text>
                    <Play size={14} color="#000" />
                  </Pressable>
                </View>

                {/* Exercise List */}
                <View style={styles.exerciseList}>
                  {day.exercises.map((ex, idx) => (
                    <View key={ex.id || idx} style={styles.exerciseRow}>
                      <View style={styles.exInfo}>
                        <Text style={styles.exName}>{toTitleCase(ex.name)}</Text>
                        <Text style={styles.exMeta}>{ex.muscle} • {ex.equipment}</Text>
                      </View>
                      <View style={styles.exBadge}>
                        <Text style={styles.exBadgeText}>{ex.sets} × {ex.repRange}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.dayFooter}>
                  <Text style={styles.dayMeta}>
                    ⏱ ~{day.estimatedDurationMinutes} mins  |  🔥 ~{day.estimatedCalories} kcal
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Program Library Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRAINING PROGRAM LIBRARIES</Text>

          {/* Filter Pills */}
          <View style={styles.filterBar}>
            {(['all', 'gym', 'bodyweight', 'dumbbells'] as const).map((filter) => (
              <Pressable
                key={filter}
                style={[
                  styles.filterPill,
                  selectedEquipmentFilter === filter && styles.filterPillActive,
                ]}
                onPress={() => setSelectedEquipmentFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedEquipmentFilter === filter && styles.filterPillTextActive,
                  ]}
                >
                  {filter.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Program Cards */}
          {filteredRoutines.map((prog) => (
            <View key={prog.id} style={styles.programCard}>
              <View style={styles.programHeader}>
                <View style={styles.flex1}>
                  <Text style={styles.programName}>{prog.name}</Text>
                  <Text style={styles.programMeta}>
                    {prog.daysPerWeek} DAYS / WEEK • {prog.equipment.toUpperCase()}
                  </Text>
                </View>
                <Pressable
                  style={styles.selectProgramBtn}
                  onPress={async () => {
                    // Regenerate plan with this program
                    await createAndSavePlan();
                  }}
                >
                  <Text style={styles.selectProgramBtnText}>SELECT</Text>
                </Pressable>
              </View>
              <Text style={styles.programDesc}>{prog.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020D1A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    ...typography.h1,
  },
  headerSubtitle: {
    ...typography.body,
    marginTop: 4,
  },
  overloadBanner: {
    backgroundColor: 'rgba(0, 255, 157, 0.08)',
    borderWidth: 1,
    borderColor: '#00FF9D',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  overloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overloadTitle: {
    color: '#00FF9D',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    flex: 1,
    marginLeft: 8,
  },
  overloadBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 157, 0.2)',
  },
  overloadRuleItem: {
    color: '#E6F7FF',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  boldText: {
    fontWeight: '700',
    color: '#00FF9D',
  },
  tableContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 10,
  },
  tableTitle: {
    color: '#38B6FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tableCellGoal: {
    flex: 2,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  tableCellSets: {
    flex: 1,
    color: '#38B6FF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableCellReps: {
    flex: 1,
    color: '#00FF9D',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#0A1829',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 182, 255, 0.25)',
    padding: 16,
    marginBottom: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dayFocus: {
    color: '#38B6FF',
    fontSize: 12,
    marginTop: 2,
  },
  startWorkoutBtn: {
    backgroundColor: '#00FF9D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startWorkoutBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    borderRadius: 8,
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    ...typography.body,
    color: '#FFFFFF',
  },
  exMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  exBadge: {
    backgroundColor: 'rgba(56, 182, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exBadgeText: {
    color: '#38B6FF',
    fontSize: 12,
    fontWeight: '700',
  },
  dayFooter: {
    marginTop: 12,
    paddingTop: 8,
  },
  dayMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterPillActive: {
    backgroundColor: '#38B6FF',
    borderColor: '#38B6FF',
  },
  filterPillText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#000000',
  },
  programCard: {
    backgroundColor: '#091522',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    marginBottom: 10,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  flex1: {
    flex: 1,
  },
  programName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  programMeta: {
    color: '#38B6FF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  programDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  selectProgramBtn: {
    borderWidth: 1,
    borderColor: '#38B6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectProgramBtnText: {
    color: '#38B6FF',
    fontSize: 11,
    fontWeight: '800',
  },
});
