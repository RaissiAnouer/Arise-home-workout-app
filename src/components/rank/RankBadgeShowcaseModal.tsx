import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { X, Lock, CheckCircle2, Shield, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HunterRank, RANK_CONFIG } from '../../data/levelConfig';
import RankBadge from './RankBadge';
import { typography } from '../../styles/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RankBadgeShowcaseModalProps {
  visible: boolean;
  onClose: () => void;
  currentRank: HunterRank;
  currentLevel: number;
}

const ALL_RANKS: {
  rank: HunterRank;
  title: string;
  levelSpan: string;
  minLevel: number;
  lore: string;
  perks: string[];
}[] = [
  {
    rank: 'E',
    title: 'E-RANK HUNTER',
    levelSpan: 'Levels 1 – 9',
    minLevel: 1,
    lore: 'The initial awakening. Novice hunter entering the threshold of supernatural potential.',
    perks: ['Basic quest access', 'Attributes unlocked', 'Daily training rewards'],
  },
  {
    rank: 'D',
    title: 'D-RANK HUNTER',
    levelSpan: 'Levels 10 – 24',
    minLevel: 10,
    lore: 'Hardened operative capable of clearing standard dungeons and handling basic beast incursions.',
    perks: ['Guild formation eligibility', '+5% XP bonus', 'D-Rank silver crest unlocked'],
  },
  {
    rank: 'C',
    title: 'C-RANK HUNTER',
    levelSpan: 'Levels 25 – 39',
    minLevel: 25,
    lore: 'Experienced veteran commanding respected guild raid party standing with balanced martial prowess.',
    perks: ['Dungeon raids access', '+10% XP bonus', 'C-Rank jade crest unlocked'],
  },
  {
    rank: 'B',
    title: 'B-RANK HUNTER',
    levelSpan: 'Levels 40 – 54',
    minLevel: 40,
    lore: 'Formidable elite hunter whose physical and mana presence alters local battlefield balance.',
    perks: ['Guild officer privileges', '+15% XP bonus', 'Arcane mana wing crest unlocked'],
  },
  {
    rank: 'A',
    title: 'A-RANK HUNTER',
    levelSpan: 'Levels 55 – 69',
    minLevel: 55,
    lore: 'Devastating warrior capable of confronting high-tier boss entities single-handedly in combat.',
    perks: ['Master routine creation', '+20% XP bonus', 'Molten flame dragon crest unlocked'],
  },
  {
    rank: 'S',
    title: 'S-RANK HUNTER',
    levelSpan: 'Levels 70 – 84',
    minLevel: 70,
    lore: 'Strategic national asset possessing cataclysmic individual combat and recovery power.',
    perks: ['Apex hunter privileges', '+25% XP bonus', 'Celestial golden apex crest unlocked'],
  },
  {
    rank: 'SSS',
    title: 'SSS-RANK HUNTER',
    levelSpan: 'Levels 85 – 99',
    minLevel: 85,
    lore: 'Mythical sovereign walking between mortality and supernatural divinity with void mana.',
    perks: ['Sovereign aura unlocked', '+30% XP bonus', 'Void shadow monarch crest unlocked'],
  },
  {
    rank: 'National',
    title: 'NATIONAL LEVEL HUNTER',
    levelSpan: 'Level 100+',
    minLevel: 100,
    lore: 'Living weapon of global consequence. Transcends human limitations with absolute Monarch authority.',
    perks: ['Global Sovereign standing', '+40% XP bonus', 'National Level Divine Crest unlocked'],
  },
];

export default function RankBadgeShowcaseModal({
  visible,
  onClose,
  currentRank,
  currentLevel,
}: RankBadgeShowcaseModalProps) {
  const initialIndex = ALL_RANKS.findIndex((r) => r.rank === currentRank);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const selectedTier = ALL_RANKS[selectedIndex] || ALL_RANKS[0];
  const rankMeta = RANK_CONFIG[selectedTier.rank];
  const isUnlocked = currentLevel >= selectedTier.minLevel;
  const isCurrent = currentRank === selectedTier.rank;

  const handlePrev = () => {
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex < ALL_RANKS.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <View style={styles.headerPill}>
                <Sparkles size={12} color="#4080E7" />
                <Text style={styles.headerPillText}>SYSTEM CLASSIFICATION</Text>
              </View>
              <Text style={styles.title}>Hunter Rank Crests</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Rank Quick-Selector Ribbon */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ribbonContainer}
          >
            {ALL_RANKS.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isItemUnlocked = currentLevel >= item.minLevel;
              const itemConfig = RANK_CONFIG[item.rank];

              return (
                <Pressable
                  key={item.rank}
                  onPress={() => setSelectedIndex(idx)}
                  style={[
                    styles.ribbonItem,
                    isSelected && {
                      borderColor: itemConfig.color,
                      backgroundColor: `${itemConfig.color}20`,
                    },
                  ]}
                >
                  <RankBadge rank={item.rank} size="xs" showGlow={false} />
                  <Text
                    style={[
                      styles.ribbonText,
                      isSelected && { color: itemConfig.color, fontWeight: '700' },
                      !isItemUnlocked && styles.ribbonTextLocked,
                    ]}
                  >
                    {item.rank === 'National' ? 'NAT' : item.rank}
                  </Text>
                  {isItemUnlocked ? (
                    <CheckCircle2 size={10} color="#34C759" />
                  ) : (
                    <Lock size={10} color="rgba(255, 255, 255, 0.3)" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Central Showcase Card */}
          <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
            {/* Nav Arrows & Big Badge */}
            <View style={styles.badgeShowcaseRow}>
              <Pressable
                onPress={handlePrev}
                disabled={selectedIndex === 0}
                style={[styles.arrowBtn, selectedIndex === 0 && styles.arrowDisabled]}
                hitSlop={10}
              >
                <ChevronLeft size={22} color={selectedIndex === 0 ? 'rgba(255,255,255,0.2)' : '#FFFFFF'} />
              </Pressable>

              <View style={styles.largeBadgeWrapper}>
                <RankBadge rank={selectedTier.rank} size="xl" showGlow animated />
              </View>

              <Pressable
                onPress={handleNext}
                disabled={selectedIndex === ALL_RANKS.length - 1}
                style={[styles.arrowBtn, selectedIndex === ALL_RANKS.length - 1 && styles.arrowDisabled]}
                hitSlop={10}
              >
                <ChevronRight size={22} color={selectedIndex === ALL_RANKS.length - 1 ? 'rgba(255,255,255,0.2)' : '#FFFFFF'} />
              </Pressable>
            </View>

            {/* Rank Title & Status */}
            <View style={styles.titleSection}>
              <Text style={[styles.rankTitle, { color: rankMeta.color }]}>
                {selectedTier.title}
              </Text>
              <Text style={styles.levelSpanText}>{selectedTier.levelSpan}</Text>

              {/* Status Pill */}
              <View
                style={[
                  styles.statusBadge,
                  isCurrent
                    ? { borderColor: '#4080E7', backgroundColor: 'rgba(64, 128, 231, 0.18)' }
                    : isUnlocked
                    ? { borderColor: '#34C759', backgroundColor: 'rgba(52, 199, 89, 0.15)' }
                    : { borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                ]}
              >
                {isCurrent ? (
                  <Text style={[styles.statusText, { color: '#4080E7' }]}>CURRENT CLASSIFICATION</Text>
                ) : isUnlocked ? (
                  <Text style={[styles.statusText, { color: '#34C759' }]}>UNLOCKED TIER</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Lock size={11} color="rgba(255, 255, 255, 0.5)" />
                    <Text style={styles.statusText}>LOCKED (LEVEL {selectedTier.minLevel} REQUIRED)</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Lore Box */}
            <View style={styles.loreBox}>
              <Text style={styles.loreLabel}>SYSTEM LORE & STANDING</Text>
              <Text style={styles.loreText}>{selectedTier.lore}</Text>
            </View>

            {/* Perks List */}
            <View style={styles.perksBox}>
              <Text style={styles.perksLabel}>TIER ADVANTAGES</Text>
              {selectedTier.perks.map((perk, i) => (
                <View key={i} style={styles.perkRow}>
                  <Shield size={13} color={rankMeta.color} />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Close Bottom Action */}
          <Pressable onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>CLOSE</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 36,
  },
  container: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#070A12',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(64, 128, 231, 0.35)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleCol: {
    gap: 4,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4080E7',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.h2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Ribbon
  ribbonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  ribbonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  ribbonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ribbonTextLocked: {
    color: 'rgba(255, 255, 255, 0.4)',
  },

  // Card Content
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    alignItems: 'center',
  },
  badgeShowcaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },
  arrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  largeBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    width: 140,
  },

  titleSection: {
    alignItems: 'center',
    gap: 4,
  },
  rankTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  levelSpanText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  loreBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 14,
    gap: 6,
  },
  loreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4080E7',
    letterSpacing: 1.2,
  },
  loreText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18,
  },

  perksBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 14,
    gap: 8,
  },
  perksLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.2,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  doneBtn: {
    paddingVertical: 14,
    backgroundColor: '#4080E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});
