import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaire, QuestionnaireAnswers } from '../context/QuestionnaireContext';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

type IconDef = {
  library: 'material' | 'ionicons' | 'fa5';
  name: string;
};

type Props = {
  title: string;
  options: string[];
  icons?: IconDef[];
  answerKey: keyof QuestionnaireAnswers;
  nextRoute: any;
  isFinal?: boolean;
  currentStep?: number;
  totalSteps?: number;
};

const renderIcon = (icon: IconDef, color: string) => {
  const size = 24;
  switch (icon.library) {
    case 'material':
      return <MaterialCommunityIcons name={icon.name as any} size={size} color={color} />;
    case 'ionicons':
      return <Ionicons name={icon.name as any} size={size} color={color} />;
    case 'fa5':
      return <FontAwesome5 name={icon.name as any} size={size - 2} color={color} />;
  }
};

export const QuestionScreen = ({ title, options, icons, answerKey, nextRoute, isFinal, currentStep = 1, totalSteps = 7 }: Props) => {
  const { answers, updateAnswer } = useQuestionnaire();
  const [selected, setSelected] = useState<string | null>(answers[answerKey] as string | null);
  const router = useRouter();

  const hasIcons = icons && icons.length === options.length;

  const handleSelect = (option: string) => {
    setSelected(option);
    updateAnswer(answerKey, option);
    if (isFinal) {
      const finalData = { ...answers, [answerKey]: option };
      console.log('--- FINAL ONBOARDING DATA ---');
      console.log(JSON.stringify(finalData, null, 2));
      alert('Questionnaire complete!');
    } else {
      router.push(nextRoute);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Header section with back button and progress bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.options}>
          {options.map((option, index) => {
            const isSelected = selected === option;
            return (
              <Pressable
                key={option}
                onPress={() => handleSelect(option)}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                {hasIcons && (
                  <View style={styles.iconWrap}>
                    {renderIcon(icons[index], '#fff')}
                  </View>
                )}
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
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
    fontFamily: 'LatoRegular',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  options: {
    gap: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#111',
  },
  optionSelected: {
    backgroundColor: '#1b45d7',
    borderColor: '#1b45d7',
  },
  iconWrap: {
    width: 32,
    marginRight: 14,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'LatoRegular',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 2,
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
    backgroundColor: '#1b45d7',
    borderRadius: 2,
  },
});
