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
import {
  Zap,
  Dumbbell,
  Footprints,
  Heart,
  Brain,
  Eye,
  Plus,
  RotateCcw,
  X,
  Sparkles,
} from 'lucide-react-native';
import { PlayerAttributes } from '../../data/levelConfig';
import { typography } from '../../styles/typography';

const ACCENT_BLUE = '#4080E7';

interface StatMeta {
  key: keyof PlayerAttributes;
  label: string;
  fullName: string;
  desc: string;
  icon: any;
  color: string;
}

const STAT_METAS: StatMeta[] = [
  {
    key: 'STR',
    label: 'STR',
    fullName: 'Strength',
    desc: 'Heavy lift threshold, total volume load & explosive muscle contraction.',
    icon: Dumbbell,
    color: '#EF4444',
  },
  {
    key: 'AGI',
    label: 'AGI',
    fullName: 'Agility',
    desc: 'Rep tempo, transition speed, cardiovascular pace & calisthenics control.',
    icon: Footprints,
    color: '#10B981',
  },
  {
    key: 'VIT',
    label: 'VIT',
    fullName: 'Vitality',
    desc: 'Inter-set recovery rate, systemic endurance, stamina & tissue durability.',
    icon: Heart,
    color: '#F43F5E',
  },
  {
    key: 'INT',
    label: 'INT',
    fullName: 'Intelligence',
    desc: 'Mind-muscle connection, training volume efficiency & personal record strategy.',
    icon: Brain,
    color: '#A855F7',
  },
  {
    key: 'PER',
    label: 'PER',
    fullName: 'Perception',
    desc: 'Kinesthetic movement awareness, posture precision & neuromuscular focus.',
    icon: Eye,
    color: '#38BDF8',
  },
];

interface AllocatePointsModalProps {
  visible: boolean;
  onClose: () => void;
  skillPoints: number;
  attributes: PlayerAttributes;
  allocatedAttributes?: PlayerAttributes;
  onAllocatePoint: (attr: keyof PlayerAttributes) => void;
  onResetPoints: () => void;
}

export default function AllocatePointsModal({
  visible,
  onClose,
  skillPoints,
  attributes,
  allocatedAttributes = { STR: 0, AGI: 0, VIT: 0, INT: 0, PER: 0 },
  onAllocatePoint,
  onResetPoints,
}: AllocatePointsModalProps) {
  const totalAllocated =
    (allocatedAttributes.STR || 0) +
    (allocatedAttributes.AGI || 0) +
    (allocatedAttributes.VIT || 0) +
    (allocatedAttributes.INT || 0) +
    (allocatedAttributes.PER || 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Holographic corner brackets */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <Zap size={20} color={ACCENT_BLUE} />
              </View>
              <View>
                <Text style={styles.modalTitle}>ATTRIBUTE ALLOCATION</Text>
                <Text style={styles.modalSubtitle}>Distribute your awakening Ability Points (AP)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={10}>
              <X size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

          {/* AP Counter Box */}
          <View style={styles.apBox}>
            <View style={styles.apInfoCol}>
              <Text style={styles.apLabel}>AVAILABLE ABILITY POINTS</Text>
              <Text style={styles.apSublabel}>Earned through rank advancement & routine milestones</Text>
            </View>
            <View style={styles.apBadge}>
              <Zap size={18} color="#FFD700" />
              <Text style={styles.apValue}>{skillPoints}</Text>
              <Text style={styles.apUnit}>AP</Text>
            </View>
          </View>

          {/* Stat Allocation Rows */}
          <ScrollView
            style={styles.statsScroll}
            contentContainerStyle={styles.statsList}
            showsVerticalScrollIndicator={false}
          >
            {STAT_METAS.map((stat) => {
              const IconComponent = stat.icon;
              const bonus = allocatedAttributes[stat.key] || 0;
              const currentValue = attributes[stat.key] || 10;
              const canAllocate = skillPoints > 0;

              return (
                <View key={stat.key} style={styles.statCard}>
                  <View style={styles.statCardTop}>
                    <View style={styles.statLeft}>
                      <View style={[styles.statIconBox, { backgroundColor: `${stat.color}15`, borderColor: `${stat.color}40` }]}>
                        <IconComponent size={18} color={stat.color} />
                      </View>
                      <View>
                        <View style={styles.statNameRow}>
                          <Text style={styles.statKeyText}>{stat.label}</Text>
                          <Text style={styles.statFullName}>• {stat.fullName}</Text>
                        </View>
                        <Text style={styles.statDesc} numberOfLines={2}>
                          {stat.desc}
                        </Text>
                      </View>
                    </View>

                    {/* Stat Values & Plus Button */}
                    <View style={styles.statActionsCol}>
                      <View style={styles.statNumbers}>
                        <Text style={styles.statTotalNum}>{currentValue}</Text>
                        {bonus > 0 && (
                          <Text style={styles.statBonusNum}>(+{bonus})</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.plusBtn,
                          !canAllocate && styles.plusBtnDisabled,
                        ]}
                        activeOpacity={0.7}
                        disabled={!canAllocate}
                        onPress={() => onAllocatePoint(stat.key)}
                      >
                        <Plus size={16} color={canAllocate ? '#FFFFFF' : 'rgba(255, 255, 255, 0.25)'} strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Reset & Footer Actions */}
          <View style={styles.footer}>
            {totalAllocated > 0 && (
              <TouchableOpacity
                style={styles.resetBtn}
                activeOpacity={0.7}
                onPress={onResetPoints}
              >
                <RotateCcw size={14} color="#EF4444" />
                <Text style={styles.resetBtnText}>REFUND ALLOCATED POINTS ({totalAllocated} AP)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.confirmBtnText}>CONFIRM & SAVE STATS</Text>
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
  closeBtn: {
    padding: 6,
  },
  apBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(64, 128, 231, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  apInfoCol: {
    flex: 1,
    gap: 2,
  },
  apLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8ABEFF',
    letterSpacing: 1,
  },
  apSublabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  apBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  apValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
  },
  apUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 215, 0, 0.8)',
    marginLeft: -2,
  },
  statsScroll: {
    flexGrow: 0,
    marginVertical: 4,
  },
  statsList: {
    gap: 8,
    paddingVertical: 6,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statKeyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statFullName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
    lineHeight: 15,
  },
  statActionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statNumbers: {
    alignItems: 'flex-end',
    minWidth: 42,
  },
  statTotalNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statBonusNum: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT_BLUE,
  },
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  plusBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    shadowOpacity: 0,
    elevation: 0,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.8,
  },
  confirmBtn: {
    backgroundColor: ACCENT_BLUE,
    borderRadius: 8,
    paddingVertical: 13,
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
