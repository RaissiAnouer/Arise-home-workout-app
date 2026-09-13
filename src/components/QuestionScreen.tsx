import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuestionnaire, QuestionnaireAnswers } from '../context/QuestionnaireContext';
import { ChevronLeft } from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

export type QuestionIcon =
  | { library?: string; name: string }
  | React.ComponentType<{ size?: number; color?: string }>;

type Props = {
  title: string;
  options: string[];
  icons?: (QuestionIcon | any)[];
  answerKey: keyof QuestionnaireAnswers;
  nextRoute: string | ((answer: any) => string);
  isFinal?: boolean;
  multiSelect?: boolean;
  currentStep?: number;
  totalSteps?: number;
};

function renderIcon(icon: any, size = 24, color = '#fff') {
  if (!icon) return null;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
    return React.createElement(icon, { size, color });
  }
  if (typeof icon === 'object' && icon.name) {
    if (icon.library === 'fa5') {
      return <FontAwesome5 name={icon.name} size={size} color={color} />;
    }
    if (icon.library === 'ionicons') {
      return <Ionicons name={icon.name} size={size} color={color} />;
    }
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  }
  return null;
}

export const QuestionScreen = ({
  title,
  options,
  icons,
  answerKey,
  nextRoute,
  isFinal,
  multiSelect = false,
  currentStep = 1,
  totalSteps = 9,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { answers, updateAnswer } = useQuestionnaire();
  const router = useRouter();

  const rawInitial = answers[answerKey];
  const initialMulti: string[] = Array.isArray(rawInitial)
    ? (rawInitial as string[])
    : rawInitial ? [rawInitial as string] : [options[0]];

  const [selectedMulti, setSelectedMulti] = useState<string[]>(initialMulti);
  const [selectedSingle, setSelectedSingle] = useState<string | null>(
    typeof rawInitial === 'string' ? rawInitial : null
  );

  const hasIcons = icons && icons.length === options.length;

  const handleSelectSingle = (option: string) => {
    setSelectedSingle(option);
    updateAnswer(answerKey, option);
    if (isFinal) {
      alert('Questionnaire complete!');
    } else {
      const targetRoute = typeof nextRoute === 'function' ? nextRoute(option) : nextRoute;
      router.push(targetRoute as any);
    }
  };

  const handleToggleMulti = (option: string) => {
    const isNone = option.toUpperCase().includes('NO ') || option.toUpperCase().includes('NONE');
    if (isNone) {
      setSelectedMulti([option]);
      return;
    }

    let next = selectedMulti.filter(
      (item) => !item.toUpperCase().includes('NO ') && !item.toUpperCase().includes('NONE')
    );
    if (next.includes(option)) {
      next = next.filter((item) => item !== option);
    } else {
      next.push(option);
    }

    if (next.length === 0) {
      const noneOpt = options.find(
        (o) => o.toUpperCase().includes('NO ') || o.toUpperCase().includes('NONE')
      );
      next = [noneOpt || options[0]];
    }
    setSelectedMulti(next);
  };

  const handleContinueMulti = () => {
    updateAnswer(answerKey, selectedMulti);
    if (isFinal) {
      alert('Questionnaire complete!');
    } else {
      const targetRoute = typeof nextRoute === 'function' ? nextRoute(selectedMulti) : nextRoute;
      router.push(targetRoute as any);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Header section with back button and progress bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </Pressable>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>

        <View style={styles.options}>
          {options.map((option, index) => {
            const isSelected = multiSelect
              ? selectedMulti.includes(option)
              : selectedSingle === option;

            return (
              <Pressable
                key={option}
                onPress={() => (multiSelect ? handleToggleMulti(option) : handleSelectSingle(option))}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                {hasIcons && (
                  <View style={styles.iconWrap}>
                    {renderIcon(icons[index])}
                  </View>
                )}
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {multiSelect && (
          <Pressable style={styles.continueButton} onPress={handleContinueMulti}>
            <Text style={styles.continueButtonText}>CONTINUE</Text>
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
    backgroundColor: '#4080E7',
    borderColor: '#4080E7',
  },
  iconWrap: {
    width: 32,
    marginRight: 14,
    alignItems: 'center',
  },
  optionText: {
    fontWeight: 'normal',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 2,
  },
  continueButton: {
    marginTop: 28,
    backgroundColor: '#4080E7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
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
