import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import { ChevronLeft } from 'lucide-react-native';

export const BodyStatsScreen = ({ isFinal }: { isFinal?: boolean }) => {
  const insets = useSafeAreaInsets();
  const { answers, updateAnswer } = useQuestionnaire();
  const [weight, setWeight] = useState(answers.weight || '');
  const [height, setHeight] = useState(answers.height || '');
  const router = useRouter();

  const isValid = weight.trim().length > 0 && height.trim().length > 0;

  const handleFinish = () => {
    if (isValid) {
      updateAnswer('weight', weight.trim());
      updateAnswer('height', height.trim());
      const finalData = { ...answers, weight: weight.trim(), height: height.trim() };
      console.log('--- FINAL ONBOARDING DATA ---');
      console.log(JSON.stringify(finalData, null, 2));
      router.push('/rank-result');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header section with back button and progress bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </Pressable>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Your body stats</Text>

        <View style={styles.field}>
          <Text style={styles.label}>WEIGHT (KG)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="75"
            placeholderTextColor="rgba(255,255,255,0.25)"
            keyboardType="numeric"
            selectionColor="#4080E7"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>HEIGHT (CM)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="180"
            placeholderTextColor="rgba(255,255,255,0.25)"
            keyboardType="numeric"
            selectionColor="#4080E7"
          />
        </View>

        {isValid && (
          <Pressable style={styles.doneBtn} onPress={handleFinish}>
            <Text style={styles.doneText}>FINISH</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  title: {
    fontWeight: 'normal',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontWeight: 'normal',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#111',
    fontWeight: 'normal',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  doneBtn: {
    marginTop: 30,
    backgroundColor: '#4080E7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4080E7',
    borderRadius: 2,
  },
});
