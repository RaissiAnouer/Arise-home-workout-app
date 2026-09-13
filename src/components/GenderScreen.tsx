import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useQuestionnaire } from '../context/QuestionnaireContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 24 * 2 - 16) / 2; // two cards with gap

type GenderOption = 'MALE' | 'FEMALE';

export const GenderScreen = () => {
  const { answers, updateAnswer } = useQuestionnaire();
  const [selected, setSelected] = useState<GenderOption | null>(
    (answers.gender as GenderOption) || null
  );
  const router = useRouter();

  const handleSelect = (gender: GenderOption) => {
    setSelected(gender);
    updateAnswer('gender', gender);
    
    // Auto-advance after a short delay
    setTimeout(() => {
      router.push('/q-motive');
    }, 350);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.stepLabel}>1 / 7</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Progress Bar ── */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(1 / 7) * 100}%` as any }]} />
        </View>

        {/* ── Question ── */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>What's your{'\n'}gender?</Text>
          <Text style={styles.subtitle}>Choose the option that fits you best.</Text>
        </View>

        {/* ── Gender Cards ── */}
        <View style={styles.cardsRow}>
          {(['MALE', 'FEMALE'] as GenderOption[]).map((gender) => {
            const isSelected = selected === gender;
            return (
              <Pressable
                key={gender}
                onPress={() => handleSelect(gender)}
                style={({ pressed }) => [
                  styles.card,
                  isSelected && styles.cardSelected,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                {/* Checkmark */}
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check size={13} color="#fff" />
                  </View>
                )}

                {/* Silhouette image */}
                <Image
                  source={
                    gender === 'MALE'
                      ? require('../images/male_character.png')
                      : require('../images/avatar_placeholder.png')
                  }
                  style={[styles.silhouette, isSelected && styles.silhouetteSelected]}
                  resizeMode="contain"
                />

                {/* Label */}
                <View style={[styles.labelPill, isSelected && styles.labelPillSelected]}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                    {gender}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerSpacer: { width: 40 },
  stepLabel: {
    fontWeight: 'normal',
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
  },

  // Progress
  progressTrack: {
    marginHorizontal: 20,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: 36,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4080E7',
    borderRadius: 2,
  },

  // Title
  titleBlock: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 38,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontWeight: 'normal',
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 10,
    letterSpacing: 0.5,
    lineHeight: 20,
  },

  // Cards row
  cardsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    flex: 1,
    maxHeight: height * 0.44,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingBottom: 16,
  },
  cardSelected: {
    borderColor: '#4080E7',
    backgroundColor: '#4080E7',
  },

  // Checkmark badge
  checkBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4080E7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Image
  silhouette: {
    width: '100%',
    flex: 1,
    opacity: 1,
  },
  silhouetteSelected: {
    opacity: 1,
  },

  // Label pill
  labelPill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 12,
  },
  labelPillSelected: {
    backgroundColor: '#4080E7',
  },
  cardLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 3,
    fontWeight: '800',
  },
  cardLabelSelected: {
    color: '#fff',
  },

});
