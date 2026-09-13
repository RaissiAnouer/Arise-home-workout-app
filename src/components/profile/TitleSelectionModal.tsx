import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Crown, Check, Lock, X, Sparkles, Shield, Zap } from 'lucide-react-native';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

export interface HunterTitleItem {
  id: string;
  name: string;
  minLevel: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  buffDescription: string;
  iconColor: string;
}

export const ALL_HUNTER_TITLES: HunterTitleItem[] = [
  {
    id: 'Initiate',
    name: 'Initiate',
    minLevel: 1,
    rarity: 'Common',
    buffDescription: '+5% EXP bonus on beginner routine sets',
    iconColor: '#9E9E9E',
  },
  {
    id: 'Iron Will',
    name: 'Iron Will',
    minLevel: 10,
    rarity: 'Common',
    buffDescription: '1-day streak forgiveness buffer active',
    iconColor: '#A0AEC0',
  },
  {
    id: 'Steel Body',
    name: 'Steel Body',
    minLevel: 15,
    rarity: 'Rare',
    buffDescription: '+5 Vitality passive & enhanced core resilience',
    iconColor: '#38BDF8',
  },
  {
    id: 'Beast Slayer',
    name: 'Beast Slayer',
    minLevel: 20,
    rarity: 'Rare',
    buffDescription: '+10% XP bonus on heavy compound lifts',
    iconColor: '#34D399',
  },
  {
    id: 'Shadow Warrior',
    name: 'Shadow Warrior',
    minLevel: 25,
    rarity: 'Epic',
    buffDescription: '+5 Strength & +5 Agility attribute synergy',
    iconColor: '#818CF8',
  },
  {
    id: 'Dungeon Crawler',
    name: 'Dungeon Crawler',
    minLevel: 30,
    rarity: 'Epic',
    buffDescription: 'Fatigue accumulation reduced by 15%',
    iconColor: '#A78BFA',
  },
  {
    id: 'Gate Breaker',
    name: 'Gate Breaker',
    minLevel: 40,
    rarity: 'Epic',
    buffDescription: 'Personal Record (PR) XP bonus is doubled',
    iconColor: '#F43F5E',
  },
  {
    id: 'Monarch\'s Vessel',
    name: 'Monarch\'s Vessel',
    minLevel: 55,
    rarity: 'Legendary',
    buffDescription: '+8 bonus to all combat attributes',
    iconColor: '#F59E0B',
  },
  {
    id: 'Sovereign',
    name: 'Sovereign',
    minLevel: 70,
    rarity: 'Legendary',
    buffDescription: '+25% total XP gained from completed routines',
    iconColor: '#EAB308',
  },
  {
    id: 'Shadow Monarch',
    name: 'Shadow Monarch',
    minLevel: 85,
    rarity: 'Mythic',
    buffDescription: 'Awakened Dark Aura: Maximum recovery & limitless stamina',
    iconColor: '#C084FC',
  },
  {
    id: 'National Level Sovereign',
    name: 'National Level Sovereign',
    minLevel: 100,
    rarity: 'Mythic',
    buffDescription: 'Authority of the Ruler: Transcendent physical mastery',
    iconColor: '#00F0FF',
  },
  {
    id: 'Absolute Being',
    name: 'Absolute Being',
    minLevel: 120,
    rarity: 'Mythic',
    buffDescription: 'System Omnipotence: Omnipresent strength & godlike constitution',
    iconColor: '#FFD700',
  },
];

interface TitleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  activeTitle: string;
  unlockedTitles: string[];
  userLevel: number;
  onSelectTitle: (title: string) => void;
}

export default function TitleSelectionModal({
  visible,
  onClose,
  activeTitle,
  unlockedTitles,
  userLevel,
  onSelectTitle,
}: TitleSelectionModalProps) {
  const isTitleUnlocked = (item: HunterTitleItem) => {
    return userLevel >= item.minLevel || (unlockedTitles && unlockedTitles.includes(item.name));
  };

  const getRarityBadgeStyle = (rarity: HunterTitleItem['rarity']) => {
    switch (rarity) {
      case 'Mythic':
        return { borderColor: '#C084FC', color: '#C084FC', bg: 'rgba(192, 132, 252, 0.15)' };
      case 'Legendary':
        return { borderColor: '#F59E0B', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'Epic':
        return { borderColor: '#818CF8', color: '#818CF8', bg: 'rgba(129, 140, 248, 0.15)' };
      case 'Rare':
        return { borderColor: '#38BDF8', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
      default:
        return { borderColor: '#9E9E9E', color: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.15)' };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Holographic corner accents */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <Crown size={20} color={ACCENT_BLUE} />
              </View>
              <View>
                <Text style={styles.modalTitle}>SYSTEM TITLE ARCHIVE</Text>
                <Text style={styles.modalSubtitle}>Equip an awakened title to enhance your hunter aura</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={10}>
              <X size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

          {/* Active Title Banner */}
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerLabel}>CURRENTLY EQUIPPED:</Text>
            <View style={styles.activeBannerRow}>
              <Crown size={14} color="#FFD700" />
              <Text style={styles.activeBannerName}>{activeTitle || 'Initiate'}</Text>
            </View>
          </View>

          {/* Titles List */}
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {ALL_HUNTER_TITLES.map((item) => {
              const unlocked = isTitleUnlocked(item);
              const isEquipped = activeTitle === item.name;
              const rarityStyle = getRarityBadgeStyle(item.rarity);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.titleItem,
                    isEquipped && styles.titleItemEquipped,
                    !unlocked && styles.titleItemLocked,
                  ]}
                  activeOpacity={unlocked ? 0.7 : 1}
                  onPress={() => {
                    if (unlocked) {
                      onSelectTitle(item.name);
                    }
                  }}
                >
                  <View style={styles.titleRow}>
                    <View style={styles.titleLeft}>
                      <View
                        style={[
                          styles.titleIconBox,
                          {
                            borderColor: unlocked ? item.iconColor : 'rgba(255, 255, 255, 0.1)',
                            backgroundColor: unlocked
                              ? `${item.iconColor}15`
                              : 'rgba(255, 255, 255, 0.03)',
                          },
                        ]}
                      >
                        {unlocked ? (
                          <Crown size={18} color={item.iconColor} />
                        ) : (
                          <Lock size={16} color="rgba(255, 255, 255, 0.3)" />
                        )}
                      </View>

                      <View style={styles.titleDetails}>
                        <View style={styles.titleNameRow}>
                          <Text
                            style={[
                              styles.titleName,
                              { color: unlocked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)' },
                            ]}
                          >
                            {item.name}
                          </Text>
                          <View
                            style={[
                              styles.rarityBadge,
                              { borderColor: rarityStyle.borderColor, backgroundColor: rarityStyle.bg },
                            ]}
                          >
                            <Text style={[styles.rarityText, { color: rarityStyle.color }]}>
                              {item.rarity.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.buffDesc,
                            { color: unlocked ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)' },
                          ]}
                        >
                          {item.buffDescription}
                        </Text>
                      </View>
                    </View>

                    {/* Right action status */}
                    <View style={styles.statusCol}>
                      {isEquipped ? (
                        <View style={styles.equippedBadge}>
                          <Check size={12} color="#10B981" strokeWidth={3} />
                          <Text style={styles.equippedText}>ACTIVE</Text>
                        </View>
                      ) : unlocked ? (
                        <View style={styles.equipBtn}>
                          <Text style={styles.equipBtnText}>EQUIP</Text>
                        </View>
                      ) : (
                        <View style={styles.lockedBadge}>
                          <Text style={styles.lockedText}>Lv.{item.minLevel}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.confirmBtnText}>CLOSE ARCHIVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#0D0F17',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(64, 128, 231, 0.6)',
    padding: 18,
    position: 'relative',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: ACCENT_BLUE,
  },
  tl: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  modalSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(64, 128, 231, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  activeBannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.8,
  },
  activeBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeBannerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
  },
  listScroll: {
    flexGrow: 0,
    marginVertical: 6,
  },
  listContent: {
    gap: 8,
    paddingVertical: 6,
  },
  titleItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  titleItemEquipped: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  titleItemLocked: {
    opacity: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  titleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleDetails: {
    flex: 1,
    gap: 3,
  },
  titleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleName: {
    fontSize: 14,
    fontWeight: '700',
  },
  rarityBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buffDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  statusCol: {
    marginLeft: 10,
  },
  equippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  equippedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  equipBtn: {
    backgroundColor: ACCENT_BLUE,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  equipBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  confirmBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
