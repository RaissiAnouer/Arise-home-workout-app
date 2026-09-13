import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { Scale, Ruler, Activity, Target, Dumbbell, Calendar, Edit3, X, Check } from 'lucide-react-native';
import { useQuestionnaire } from '../../context/QuestionnaireContext';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

export default function HunterSpecsCard() {
  const { answers, updateAnswer } = useQuestionnaire();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Form states for quick edit
  const [weightInput, setWeightInput] = useState(answers.weight || '75');
  const [heightInput, setHeightInput] = useState(answers.height || '178');
  const [goalInput, setGoalInput] = useState(answers.goal || 'Build Muscle');
  const [weeklyGoalInput, setWeeklyGoalInput] = useState(answers.weeklyGoal || '4 days a week');

  const weightNum = parseFloat(answers.weight || weightInput || '75');
  const heightNum = parseFloat(answers.height || heightInput || '178');

  // Calculate BMI
  const heightInMeters = heightNum > 0 ? heightNum / 100 : 1.78;
  const bmiValue = heightInMeters > 0 ? (weightNum / (heightInMeters * heightInMeters)).toFixed(1) : '23.4';
  
  let bmiCategory = 'Optimal Hunter';
  const bmiFloat = parseFloat(bmiValue);
  if (bmiFloat < 18.5) bmiCategory = 'Lean Vessel';
  else if (bmiFloat <= 24.9) bmiCategory = 'Optimal Hunter';
  else if (bmiFloat <= 29.9) bmiCategory = 'Heavy Armor';
  else bmiCategory = 'Titan Build';

  const handleOpenEdit = () => {
    setWeightInput(answers.weight || '75');
    setHeightInput(answers.height || '178');
    setGoalInput(answers.goal || 'Build Muscle');
    setWeeklyGoalInput(answers.weeklyGoal || '4 days a week');
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (weightInput.trim()) updateAnswer('weight', weightInput.trim());
    if (heightInput.trim()) updateAnswer('height', heightInput.trim());
    if (goalInput.trim()) updateAnswer('goal', goalInput.trim());
    if (weeklyGoalInput.trim()) updateAnswer('weeklyGoal', weeklyGoalInput.trim());
    setIsEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>HUNTER SPECIFICATIONS</Text>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.7} onPress={handleOpenEdit}>
          <Edit3 size={13} color={ACCENT_BLUE} />
          <Text style={styles.editBtnText}>EDIT SPECS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.specsGrid}>
        {/* Weight */}
        <View style={styles.specItem}>
          <View style={styles.iconWrapper}>
            <Scale size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.specContent}>
            <Text style={styles.specValue}>{answers.weight ? `${answers.weight} kg` : '75 kg'}</Text>
            <Text style={styles.specLabel}>BODY WEIGHT</Text>
          </View>
        </View>

        {/* Height */}
        <View style={styles.specItem}>
          <View style={styles.iconWrapper}>
            <Ruler size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.specContent}>
            <Text style={styles.specValue}>{answers.height ? `${answers.height} cm` : '178 cm'}</Text>
            <Text style={styles.specLabel}>HUNTER STATURE</Text>
          </View>
        </View>

        {/* BMI Status */}
        <View style={styles.specItem}>
          <View style={styles.iconWrapper}>
            <Activity size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.specContent}>
            <Text style={styles.specValue}>{bmiValue} <Text style={styles.specValueSub}>BMI</Text></Text>
            <Text style={styles.specLabel}>{bmiCategory.toUpperCase()}</Text>
          </View>
        </View>

        {/* Primary Goal */}
        <View style={styles.specItem}>
          <View style={styles.iconWrapper}>
            <Target size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.specContent}>
            <Text style={styles.specValue} numberOfLines={1}>
              {answers.goal || 'Build Muscle'}
            </Text>
            <Text style={styles.specLabel}>TARGET DIRECTIVE</Text>
          </View>
        </View>

        {/* Focus Area */}
        <View style={styles.specItem}>
          <View style={styles.iconWrapper}>
            <Dumbbell size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.specContent}>
            <Text style={styles.specValue} numberOfLines={1}>
              {answers.focusArea || 'Full Body & Core'}
            </Text>
            <Text style={styles.specLabel}>COMBAT FOCUS</Text>
          </View>
        </View>

        {/* Weekly Frequency */}
        <View style={styles.specItem}>
          <View style={styles.iconWrapper}>
            <Calendar size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.specContent}>
            <Text style={styles.specValue} numberOfLines={1}>
              {answers.weeklyGoal || '4 Quests / Wk'}
            </Text>
            <Text style={styles.specLabel}>WEEKLY SCHEDULE</Text>
          </View>
        </View>
      </View>

      {/* Edit Specs Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade" onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsEditModalVisible(false)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Scale size={18} color="#FFFFFF" />
                <Text style={styles.modalTitle}>UPDATE PHYSICAL SPECS</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} hitSlop={10}>
                <X size={20} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                <TextInput
                  style={styles.textInput}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="numeric"
                  placeholder="75"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  selectionColor={ACCENT_BLUE}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  value={heightInput}
                  onChangeText={setHeightInput}
                  keyboardType="numeric"
                  placeholder="178"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  selectionColor={ACCENT_BLUE}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TARGET DIRECTIVE</Text>
                <TextInput
                  style={styles.textInput}
                  value={goalInput}
                  onChangeText={setGoalInput}
                  placeholder="e.g. Build Muscle & Strength"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  selectionColor={ACCENT_BLUE}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WEEKLY TARGET</Text>
                <TextInput
                  style={styles.textInput}
                  value={weeklyGoalInput}
                  onChangeText={setWeeklyGoalInput}
                  placeholder="e.g. 4 days a week"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  selectionColor={ACCENT_BLUE}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>SAVE SPECIFICATIONS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.h2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT_BLUE,
    letterSpacing: 0.8,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  specItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specContent: {
    flex: 1,
    gap: 2,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  specValueSub: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0D0F17',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(64, 128, 231, 0.6)',
    padding: 18,
    gap: 16,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  modalBody: {
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalFooter: {
    paddingTop: 8,
  },
  saveBtn: {
    backgroundColor: ACCENT_BLUE,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
