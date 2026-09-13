import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReportsData } from '../../src/hooks/useReportsData';
import MuscleHeatmapV2 from '../../src/components/reports/MuscleHeatmapV2';
import ConsistencyTracker from '../../src/components/reports/ConsistencyTracker';
import WeightProgressChart from '../../src/components/reports/WeightProgressChart';
import { useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';
import { typography } from '../../src/styles/typography';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { onScroll } = useTabBarVisibility();
  const {
    isLoading,
    refreshData,
    muscleHeatmap,
    consistencyData,
    streakStats,
    weightEntries,
    weightFilter,
    setWeightFilter,
    addWeightEntry,
  } = useReportsData();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4080E7" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4080E7"
            colors={['#4080E7']}
          />
        }
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>REPORT</Text>
          <Text style={styles.pageSubtitle}>Training Consistency & Muscle Distribution</Text>
        </View>

        {/* Training Frequency Body Highlighter Heatmap */}
        <MuscleHeatmapV2 data={muscleHeatmap} />

        {/* GitHub-Style Workout Consistency Tracker */}
        <ConsistencyTracker entries={consistencyData} stats={streakStats} />

        {/* Body Weight Progress Chart */}
        <WeightProgressChart
          entries={weightEntries}
          filter={weightFilter}
          onFilterChange={setWeightFilter}
          onAddEntry={addWeightEntry}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 24,
    paddingBottom: 40,
  },
  pageHeader: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  pageTitle: {
    ...typography.h1,
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
});


