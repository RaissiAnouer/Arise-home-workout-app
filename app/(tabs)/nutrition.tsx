import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function NutritionScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>PLAYER FUEL</Text>
          <Text style={styles.subtitle}>DAILY INTAKE TRACKER</Text>
        </View>

        {/* Calories Overview */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(0, 163, 255, 0.1)', 'rgba(0, 0, 0, 0)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.cardContent}>
            <Text style={styles.sectionHeader}>ENERGY (CALORIES)</Text>
            <View style={styles.calorieRow}>
              <View style={styles.calorieInfo}>
                <Text style={styles.calorieValue}>1,450</Text>
                <Text style={styles.calorieLabel}>Consumed</Text>
              </View>
              <View style={styles.calorieInfo}>
                <Text style={styles.calorieTarget}>2,200</Text>
                <Text style={styles.calorieLabel}>Target</Text>
              </View>
            </View>
            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={['#00A3FF', '#38B6FF']}
                style={[styles.progressBarFill, { width: '65%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        </View>

        {/* Macros */}
        <Text style={styles.subTitle}>MACRONUTRIENTS</Text>
        <View style={styles.macroGrid}>
          {/* Protein */}
          <View style={styles.macroBox}>
            <Text style={styles.macroTitle}>PROTEIN</Text>
            <Text style={styles.macroValue}>85g / 150g</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, { width: '56%', backgroundColor: '#FF5C5C' }]} />
            </View>
          </View>
          {/* Carbs */}
          <View style={styles.macroBox}>
            <Text style={styles.macroTitle}>CARBS</Text>
            <Text style={styles.macroValue}>120g / 200g</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, { width: '60%', backgroundColor: '#FFB800' }]} />
            </View>
          </View>
          {/* Fats */}
          <View style={styles.macroBox}>
            <Text style={styles.macroTitle}>FATS</Text>
            <Text style={styles.macroValue}>45g / 70g</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, { width: '64%', backgroundColor: '#39FF14' }]} />
            </View>
          </View>
        </View>

        {/* Meals */}
        <Text style={styles.subTitle}>CONSUMABLES</Text>
        <View style={styles.mealList}>
          
          <Pressable style={styles.mealItem}>
            <View style={styles.mealIconWrapper}>
              <Ionicons name="sunny" size={24} color="#FFB800" />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Breakfast Item</Text>
              <Text style={styles.mealDetails}>Oatmeal & Eggs</Text>
            </View>
            <Text style={styles.mealCalories}>450 kcal</Text>
          </Pressable>

          <Pressable style={styles.mealItem}>
            <View style={styles.mealIconWrapper}>
              <Ionicons name="restaurant" size={24} color="#FF5C5C" />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Lunch Item</Text>
              <Text style={styles.mealDetails}>Chicken & Rice</Text>
            </View>
            <Text style={styles.mealCalories}>600 kcal</Text>
          </Pressable>

          <Pressable style={[styles.mealItem, styles.mealItemEmpty]}>
            <View style={styles.mealIconWrapperEmpty}>
              <Ionicons name="moon" size={24} color="#888888" />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealNameEmpty}>Dinner Item</Text>
              <Text style={styles.mealDetailsEmpty}>Not logged yet</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#00A3FF" />
          </Pressable>

        </View>

        {/* Hydration */}
        <Text style={styles.subTitle}>HYDRATION</Text>
        <View style={styles.hydrationCard}>
          <Ionicons name="water" size={32} color="#00A3FF" style={styles.hydrationIcon} />
          <View style={styles.hydrationInfo}>
            <Text style={styles.hydrationText}>1.5L / 3.0L</Text>
            <Text style={styles.hydrationLabel}>Keep drinking to avoid debuffs!</Text>
          </View>
          <Pressable style={styles.hydrationAddBtn}>
            <Ionicons name="add" size={24} color="#020D1A" />
          </Pressable>
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
  scrollContainer: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 28,
    color: '#00A3FF',
    letterSpacing: 2,
    textShadowColor: '#00A3FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#E6F7FF',
    letterSpacing: 4,
    opacity: 0.8,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(56, 182, 255, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#0B192C',
  },
  cardContent: {
    padding: 24,
  },
  sectionHeader: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 14,
    color: '#E6F7FF',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  calorieInfo: {
    alignItems: 'center',
  },
  calorieValue: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 32,
    color: '#38B6FF',
    textShadowColor: 'rgba(56, 182, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  calorieTarget: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 24,
    color: '#888888',
    marginTop: 6,
  },
  calorieLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
    letterSpacing: 1,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  subTitle: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 18,
    color: '#E6F7FF',
    letterSpacing: 2,
    marginBottom: 16,
    marginTop: 8,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  macroBox: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(56, 182, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  macroTitle: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 12,
    color: '#E6F7FF',
    marginBottom: 8,
  },
  macroValue: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  macroBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  mealList: {
    marginBottom: 32,
    gap: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B192C',
    borderWidth: 1,
    borderColor: 'rgba(56, 182, 255, 0.3)',
    borderRadius: 8,
    padding: 16,
  },
  mealItemEmpty: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
  },
  mealIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mealIconWrapperEmpty: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 14,
    color: '#E6F7FF',
    marginBottom: 4,
  },
  mealNameEmpty: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  mealDetails: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#CCCCCC',
  },
  mealDetailsEmpty: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#666666',
  },
  mealCalories: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 14,
    color: '#39FF14',
  },
  hydrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B192C',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  hydrationIcon: {
    marginRight: 16,
    textShadowColor: 'rgba(0, 163, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  hydrationInfo: {
    flex: 1,
  },
  hydrationText: {
    fontFamily: 'TruenoRoundBold',
    fontSize: 18,
    color: '#38B6FF',
    marginBottom: 4,
  },
  hydrationLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#CCCCCC',
  },
  hydrationAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#38B6FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38B6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});
