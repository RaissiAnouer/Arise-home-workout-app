import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import {
  Sword,
  Shield,
  Gem,
  Flame,
  X,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

interface ArsenalItem {
  slot: string;
  name: string;
  tier: 'S' | 'A' | 'B';
  tierColor: string;
  icon: any;
  buff: string;
  lore: string;
  fitnessBonus: string;
}

const ARSENAL_SLOTS: ArsenalItem[] = [
  {
    slot: 'MAIN WEAPON',
    name: 'Kasaka\'s Venom Fang',
    tier: 'A',
    tierColor: '#FF4500',
    icon: Sword,
    buff: '+12% Grip Strength & Forearm Power',
    lore: 'A dagger forged from the hardened blue venom gland of the Great Serpent Kasaka. Enhances wrist stability during heavy pull workouts.',
    fitnessBonus: 'Grip Endurance +15%',
  },
  {
    slot: 'BODY ARMOR',
    name: 'Monarch\'s Battle Robe',
    tier: 'S',
    tierColor: '#FFD700',
    icon: Shield,
    buff: '+15 Core Stability & Intra-Abdominal Pressure',
    lore: 'An ebony cloak surging with pure mana. Reinforces the lumbar spine and maintains posture during compound squats and deadlifts.',
    fitnessBonus: 'Spine Protection & Posture Form',
  },
  {
    slot: 'HUNTER RELIC',
    name: 'Amulet of Agility',
    tier: 'B',
    tierColor: '#38BDF8',
    icon: Gem,
    buff: '+10 Joint Mobility & Warmup Pace',
    lore: 'A glowing cyan pendant containing compressed dimensional mana. Accelerates blood flow and limberness before intense exercise.',
    fitnessBonus: 'Warmup Efficiency +20%',
  },
  {
    slot: 'SKILL RUNE',
    name: 'Ruler\'s Authority',
    tier: 'S',
    tierColor: '#A855F7',
    icon: Flame,
    buff: '-20% Fatigue Accumulation Rate',
    lore: 'An invisible gravitational telekinetic force that supports the user against gravity itself, delaying muscular exhaustion on final reps.',
    fitnessBonus: 'Final Rep Threshold Mastery',
  },
];

export default function HunterArsenalSection() {
  const [selectedItem, setSelectedItem] = useState<ArsenalItem | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>HUNTER ARSENAL & EQUIPMENT</Text>

      <View style={styles.slotsGrid}>
        {ARSENAL_SLOTS.map((item) => {
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={item.slot}
              style={[
                styles.slotCard,
                { borderColor: `${item.tierColor}40` },
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedItem(item)}
            >
              <View style={styles.slotTop}>
                <Text style={styles.slotLabel}>{item.slot}</Text>
                <View style={[styles.tierPill, { borderColor: item.tierColor, backgroundColor: `${item.tierColor}15` }]}>
                  <Text style={[styles.tierText, { color: item.tierColor }]}>{item.tier}-TIER</Text>
                </View>
              </View>

              <View style={styles.slotIconWrapper}>
                <View style={[styles.slotIconCircle, { backgroundColor: `${item.tierColor}15`, borderColor: `${item.tierColor}30` }]}>
                  <IconComponent size={22} color={item.tierColor} />
                </View>
              </View>

              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemBuff} numberOfLines={1}>
                {item.buff}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Equipment Inspector Modal */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedItem(null)} />

          {selectedItem && (
            <View style={[styles.modalCard, { borderColor: `${selectedItem.tierColor}80` }]}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.tl, { borderColor: selectedItem.tierColor }]} />
              <View style={[styles.corner, styles.tr, { borderColor: selectedItem.tierColor }]} />
              <View style={[styles.corner, styles.bl, { borderColor: selectedItem.tierColor }]} />
              <View style={[styles.corner, styles.br, { borderColor: selectedItem.tierColor }]} />

              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <View style={[styles.tierBigPill, { borderColor: selectedItem.tierColor, backgroundColor: `${selectedItem.tierColor}15` }]}>
                    <Text style={[styles.tierBigText, { color: selectedItem.tierColor }]}>
                      RANK {selectedItem.tier}
                    </Text>
                  </View>
                  <Text style={styles.modalSlotLabel}>{selectedItem.slot}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedItem(null)} hitSlop={10}>
                  <X size={20} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.itemHeroRow}>
                  <View style={[styles.modalIconWrap, { backgroundColor: `${selectedItem.tierColor}15`, borderColor: `${selectedItem.tierColor}40` }]}>
                    <selectedItem.icon size={32} color={selectedItem.tierColor} />
                  </View>
                  <View style={styles.itemHeroMeta}>
                    <Text style={styles.modalItemTitle}>{selectedItem.name}</Text>
                    <Text style={[styles.modalEquippedTag, { color: '#10B981' }]}>[ SYSTEM EQUIPPED ]</Text>
                  </View>
                </View>

                {/* Lore description */}
                <View style={styles.loreBox}>
                  <Text style={styles.loreText}>{selectedItem.lore}</Text>
                </View>

                {/* Buff Stats */}
                <View style={styles.buffsContainer}>
                  <View style={styles.buffRow}>
                    <Zap size={15} color={ACCENT_BLUE} />
                    <Text style={styles.buffText}>{selectedItem.buff}</Text>
                  </View>
                  <View style={styles.buffRow}>
                    <Sparkles size={15} color="#FFD700" />
                    <Text style={styles.buffText}>{selectedItem.fitnessBonus}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                activeOpacity={0.8}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.closeBtnText}>CLOSE INSPECTION</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionTitle: {
    ...typography.h2,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '48.3%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  slotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.8,
  },
  tierPill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  slotIconWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  slotIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  itemBuff: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
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
    padding: 18,
    gap: 16,
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
  },
  tl: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBigPill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tierBigText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalSlotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  modalBody: {
    gap: 14,
  },
  itemHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemHeroMeta: {
    flex: 1,
    gap: 4,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalEquippedTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  loreBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
  },
  loreText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  buffsContainer: {
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.2)',
    padding: 12,
    gap: 8,
  },
  buffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buffText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
