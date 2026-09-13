import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Crown,
  Sparkles,
  Lock,
  Globe,
  Shield,
  Zap,
  Users,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGuild } from '../../context/GuildContext';
import { GuildEmblemType } from '../../types/guild';
import { HunterRank } from '../../data/levelConfig';
import GuildEmblem, { GUILD_IMAGE_OPTIONS } from './GuildEmblem';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

const RANK_REQUIREMENTS: HunterRank[] = [
  'E',
  'D',
  'C',
  'B',
  'A',
  'S',
];

interface CreateGuildModalProps {
  visible: boolean;
  onClose: () => void;
  onGuildCreated?: (guildName: string) => void;
}

export default function CreateGuildModal({ visible, onClose, onGuildCreated }: CreateGuildModalProps) {
  const insets = useSafeAreaInsets();
  const { createGuild } = useGuild();

  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmblem, setSelectedEmblem] = useState<GuildEmblemType>('guild_1');
  const [isPrivate, setIsPrivate] = useState(false);
  const [minRank, setMinRank] = useState<HunterRank>('E');
  const [maxMembers, setMaxMembers] = useState<number>(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter a Guild name.');
      return;
    }
    if (name.trim().length < 3) {
      setErrorMessage('Guild name must be at least 3 characters.');
      return;
    }

    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const res = await createGuild({
      name: name.trim(),
      motto: motto.trim() || 'Arise and conquer all limits.',
      description: description.trim() || 'An elite guild focused on relentless daily training.',
      emblem: selectedEmblem,
      isPrivate,
      minRankRequirement: minRank,
      maxMembers,
    });

    if (res.success && res.guild) {
      if (onGuildCreated) onGuildCreated(res.guild.name);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={8}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Establish New Guild</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Live Preview Card */}
          <Text style={styles.sectionHeader}>LIVE GUILD CARD PREVIEW</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <GuildEmblem emblem={selectedEmblem} size={46} />
              <View style={styles.previewMeta}>
                <View style={styles.previewNameRow}>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {name.trim() || 'Your Guild Name'}
                  </Text>
                  <View style={styles.previewRankBadge}>
                    <Text style={styles.previewRankText}>B-Rank</Text>
                  </View>
                </View>
                <Text style={styles.previewMotto} numberOfLines={1}>
                  "{motto.trim() || 'Your guild battle motto here'}"
                </Text>
                <View style={styles.previewTagsRow}>
                  <View style={styles.previewTag}>
                    <Crown size={10} color="#F59E0B" />
                    <Text style={styles.previewTagText}>Leader: You</Text>
                  </View>
                  <View style={styles.previewTag}>
                    <Users size={10} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.previewTagText}>1/{maxMembers}</Text>
                  </View>
                  <View style={[styles.previewTag, isPrivate ? styles.tagPrivate : styles.tagPublic]}>
                    <Text style={[styles.previewTagText, { color: isPrivate ? '#F59E0B' : '#10B981' }]}>
                      {isPrivate ? 'Private' : 'Public'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {/* Guild Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GUILD NAME *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Shadow Monarchs, Iron Vanguard"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={24}
            />
          </View>

          {/* Emblem Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CHOOSE GUILD IMAGE / EMBLEM</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emblemsScroll}>
              {GUILD_IMAGE_OPTIONS.map((opt) => {
                const isSelected = selectedEmblem === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[styles.emblemCard, isSelected && styles.emblemCardSelected]}
                    onPress={() => {
                      if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedEmblem(opt.id);
                    }}
                  >
                    <GuildEmblem emblem={opt.id} size={48} borderRadius={10} />
                    <Text style={[styles.emblemLabel, isSelected && styles.emblemLabelSelected]} numberOfLines={1}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Motto */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GUILD MOTTO</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Only the disciplined level up."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={motto}
              onChangeText={setMotto}
              maxLength={48}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DESCRIPTION & FOCUS</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your training ethos, raid goals, and member requirements..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={160}
            />
          </View>

          {/* Guild Type: Public vs Private */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GUILD ACCESS TYPE</Text>
            <View style={styles.typeSelectorRow}>
              <Pressable
                style={[styles.typeOption, !isPrivate && styles.typeOptionSelected]}
                onPress={() => setIsPrivate(false)}
              >
                <Globe size={18} color={!isPrivate ? '#4080E7' : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.typeTitle, !isPrivate && styles.typeTitleSelected]}>Public Guild</Text>
                <Text style={styles.typeSub}>Anyone can join instantly</Text>
              </Pressable>

              <Pressable
                style={[styles.typeOption, isPrivate && styles.typeOptionSelected]}
                onPress={() => setIsPrivate(true)}
              >
                <Lock size={18} color={isPrivate ? '#4080E7' : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.typeTitle, isPrivate && styles.typeTitleSelected]}>Private Guild</Text>
                <Text style={styles.typeSub}>Requires your approval</Text>
              </Pressable>
            </View>
          </View>

          {/* Minimum Rank Requirement */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MINIMUM HUNTER RANK REQUIREMENT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rankPillsRow}>
              {RANK_REQUIREMENTS.map((r) => {
                const isSelected = minRank === r;
                return (
                  <Pressable
                    key={r}
                    style={[styles.rankPill, isSelected && styles.rankPillSelected]}
                    onPress={() => setMinRank(r)}
                  >
                    <Text style={[styles.rankPillText, isSelected && styles.rankPillTextSelected]}>{r}-Rank</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Submit Button */}
          <Pressable style={styles.createSubmitBtn} onPress={handleCreate}>
            <Crown size={18} color="#000000" strokeWidth={2.4} />
            <Text style={styles.createSubmitBtnText}>ESTABLISH GUILD (AS GUILD MASTER)</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    ...typography.h2,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: '#181A20',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.4)',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewMeta: {
    flex: 1,
    marginLeft: 12,
  },
  previewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewName: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewRankBadge: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  previewRankText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '800',
  },
  previewMotto: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 6,
  },
  previewTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagPublic: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  tagPrivate: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  previewTagText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  textArea: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  emblemsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  emblemCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181A20',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: 82,
  },
  emblemCardSelected: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
  },
  emblemLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
  emblemLabelSelected: {
    color: '#4080E7',
    fontWeight: '700',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'flex-start',
  },
  typeOptionSelected: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
  },
  typeTitle: {
    ...typography.h2,
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    marginBottom: 2,
  },
  typeTitleSelected: {
    color: '#FFFFFF',
  },
  typeSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  rankPillsRow: {
    gap: 8,
  },
  rankPill: {
    backgroundColor: '#181A20',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rankPillSelected: {
    borderColor: '#4080E7',
    backgroundColor: 'rgba(64, 128, 231, 0.18)',
  },
  rankPillText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  rankPillTextSelected: {
    color: '#4080E7',
    fontWeight: '700',
  },
  createSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  createSubmitBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
