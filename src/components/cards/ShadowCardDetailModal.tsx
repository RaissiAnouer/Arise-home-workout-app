import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Zap, Shield, Sword, Wind, Flame, Lock, CheckCircle2 } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G, RadialGradient } from 'react-native-svg';
import {
  ShadowCard,
  RARITY_CONFIG,
  ELEMENT_CONFIG,
  getCardUnlockProgress,
  CardUnlockProgress,
} from '../../data/shadowCardsData';
import { typography } from '../../styles/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ART_SIZE = SCREEN_WIDTH * 0.52;
const ACCENT_BLUE = '#4080E7';

// ── Large Character Art ─────────────────────────────────────
function LargeCharacterArt({
  element,
  rarity,
  isUnlocked,
}: {
  element: string;
  rarity: string;
  isUnlocked: boolean;
}) {
  const rarityConf = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.Common;
  const elementConf = ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG] || ELEMENT_CONFIG.shadow;
  const color = isUnlocked ? elementConf.color : '#4A463E';
  const glowColor = isUnlocked ? rarityConf.color : '#2A2722';
  const w = ART_SIZE;
  const h = ART_SIZE * 1.15;
  const cx = w / 2;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id="detailBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={isUnlocked ? '0.95' : '0.4'} />
          <Stop offset="1" stopColor={glowColor} stopOpacity={isUnlocked ? '0.35' : '0.1'} />
        </LinearGradient>
        <RadialGradient id="detailAura" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={glowColor} stopOpacity={isUnlocked ? '0.3' : '0.05'} />
          <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background aura */}
      <Circle cx={cx} cy={h * 0.45} r={w * 0.42} fill="url(#detailAura)" />

      {/* Character */}
      {element === 'fire' || element === 'light' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.1} L${cx + w * 0.2} ${h * 0.28} L${cx + w * 0.25} ${h * 0.38} L${cx + w * 0.18} ${h * 0.5} L${cx + w * 0.22} ${h * 0.62} L${cx + w * 0.28} ${h * 0.82} L${cx + w * 0.08} ${h * 0.72} L${cx} ${h * 0.88} L${cx - w * 0.08} ${h * 0.72} L${cx - w * 0.28} ${h * 0.82} L${cx - w * 0.22} ${h * 0.62} L${cx - w * 0.18} ${h * 0.5} L${cx - w * 0.25} ${h * 0.38} L${cx - w * 0.2} ${h * 0.28} Z`}
            fill="url(#detailBodyGrad)"
          />
          <Circle cx={cx} cy={h * 0.14} r={w * 0.1} fill={color} opacity={isUnlocked ? 0.9 : 0.4} />
          {isUnlocked && (
            <>
              <Circle cx={cx - w * 0.04} cy={h * 0.135} r={3} fill="#FFFFFF" opacity={0.9} />
              <Circle cx={cx + w * 0.04} cy={h * 0.135} r={3} fill="#FFFFFF" opacity={0.9} />
            </>
          )}
        </G>
      ) : element === 'ice' || element === 'wind' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.08} Q${cx + w * 0.16} ${h * 0.22} ${cx + w * 0.22} ${h * 0.42} Q${cx + w * 0.27} ${h * 0.58} ${cx + w * 0.18} ${h * 0.76} L${cx + w * 0.06} ${h * 0.9} L${cx - w * 0.06} ${h * 0.9} L${cx - w * 0.18} ${h * 0.76} Q${cx - w * 0.27} ${h * 0.58} ${cx - w * 0.22} ${h * 0.42} Q${cx - w * 0.16} ${h * 0.22} ${cx} ${h * 0.08}`}
            fill="url(#detailBodyGrad)"
          />
          <Circle cx={cx} cy={h * 0.12} r={w * 0.09} fill={color} opacity={isUnlocked ? 0.85 : 0.4} />
          {isUnlocked && (
            <>
              <Circle cx={cx - w * 0.035} cy={h * 0.115} r={2.5} fill="#FFFFFF" opacity={0.9} />
              <Circle cx={cx + w * 0.035} cy={h * 0.115} r={2.5} fill="#FFFFFF" opacity={0.9} />
            </>
          )}
        </G>
      ) : element === 'earth' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.1} L${cx + w * 0.14} ${h * 0.22} L${cx + w * 0.3} ${h * 0.38} L${cx + w * 0.32} ${h * 0.62} L${cx + w * 0.22} ${h * 0.88} L${cx - w * 0.22} ${h * 0.88} L${cx - w * 0.32} ${h * 0.62} L${cx - w * 0.3} ${h * 0.38} L${cx - w * 0.14} ${h * 0.22} Z`}
            fill="url(#detailBodyGrad)"
          />
          <Circle cx={cx} cy={h * 0.13} r={w * 0.11} fill={color} opacity={isUnlocked ? 0.9 : 0.4} />
          {isUnlocked && (
            <>
              <Circle cx={cx - w * 0.045} cy={h * 0.125} r={3} fill="#FFFFFF" opacity={0.85} />
              <Circle cx={cx + w * 0.045} cy={h * 0.125} r={3} fill="#FFFFFF" opacity={0.85} />
            </>
          )}
        </G>
      ) : element === 'lightning' ? (
        <G>
          <Path
            d={`M${cx} ${h * 0.08} L${cx + w * 0.2} ${h * 0.28} L${cx + w * 0.14} ${h * 0.4} L${cx + w * 0.24} ${h * 0.55} L${cx + w * 0.17} ${h * 0.7} L${cx + w * 0.1} ${h * 0.88} L${cx - w * 0.1} ${h * 0.88} L${cx - w * 0.17} ${h * 0.7} L${cx - w * 0.24} ${h * 0.55} L${cx - w * 0.14} ${h * 0.4} L${cx - w * 0.2} ${h * 0.28} Z`}
            fill="url(#detailBodyGrad)"
          />
          <Circle cx={cx} cy={h * 0.12} r={w * 0.09} fill={color} opacity={isUnlocked ? 0.9 : 0.4} />
          {isUnlocked && (
            <>
              <Circle cx={cx - w * 0.035} cy={h * 0.115} r={2.5} fill="#FFFFFF" opacity={0.95} />
              <Circle cx={cx + w * 0.035} cy={h * 0.115} r={2.5} fill="#FFFFFF" opacity={0.95} />
            </>
          )}
        </G>
      ) : (
        <G>
          <Path
            d={`M${cx} ${h * 0.06} Q${cx + w * 0.22} ${h * 0.18} ${cx + w * 0.2} ${h * 0.38} L${cx + w * 0.24} ${h * 0.52} Q${cx + w * 0.22} ${h * 0.68} ${cx + w * 0.14} ${h * 0.8} Q${cx + w * 0.06} ${h * 0.92} ${cx} ${h * 0.95} Q${cx - w * 0.06} ${h * 0.92} ${cx - w * 0.14} ${h * 0.8} Q${cx - w * 0.22} ${h * 0.68} ${cx - w * 0.24} ${h * 0.52} L${cx - w * 0.2} ${h * 0.38} Q${cx - w * 0.22} ${h * 0.18} ${cx} ${h * 0.06}`}
            fill="url(#detailBodyGrad)"
          />
          <Circle cx={cx} cy={h * 0.1} r={w * 0.1} fill={color} opacity={isUnlocked ? 0.85 : 0.35} />
          {isUnlocked && (
            <>
              <Circle cx={cx - w * 0.04} cy={h * 0.095} r={2.8} fill="#FFFFFF" opacity={0.9} />
              <Circle cx={cx + w * 0.04} cy={h * 0.095} r={2.8} fill="#FFFFFF" opacity={0.9} />
            </>
          )}
        </G>
      )}
    </Svg>
  );
}

// ── Stat Bar ────────────────────────────────────────────────
function StatBar({
  label,
  value,
  maxValue,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}) {
  const fillPercent = Math.min(100, (value / maxValue) * 100);

  return (
    <View style={styles.statRow}>
      <View style={styles.statLabelRow}>
        <Icon size={13} color={color} strokeWidth={2.2} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <View style={styles.statBarTrack}>
        <View
          style={[
            styles.statBarFill,
            { width: `${fillPercent}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ── Main Modal ──────────────────────────────────────────────
interface ShadowCardDetailModalProps {
  visible: boolean;
  card: ShadowCard | null;
  isUnlocked: boolean;
  progression?: {
    totalWorkouts: number;
    level: number;
    streakDays: number;
    totalExercisesCompleted: number;
  };
  onClose: () => void;
}

export default function ShadowCardDetailModal({
  visible,
  card,
  isUnlocked,
  progression,
  onClose,
}: ShadowCardDetailModalProps) {
  if (!card) return null;

  const rarityConf = RARITY_CONFIG[card.rarity];
  const elementConf = ELEMENT_CONFIG[card.element];
  const maxStat = Math.max(card.stats.STR, card.stats.AGI, card.stats.END, card.stats.POW, 80);

  const progress: CardUnlockProgress | null = progression
    ? getCardUnlockProgress(card, progression)
    : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7} hitSlop={12}>
            <X size={20} color="#1A1A1A" strokeWidth={2.4} />
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Character Art Section */}
            <View style={[styles.artSection, { backgroundColor: isUnlocked ? '#E5DED1' : '#D5CEC0' }]}>
              <LargeCharacterArt
                element={card.element}
                rarity={card.rarity}
                isUnlocked={isUnlocked}
              />

              {/* Status Ribbon */}
              <View
                style={[
                  styles.statusRibbon,
                  isUnlocked
                    ? { backgroundColor: '#10B981' }
                    : { backgroundColor: '#78716C' },
                ]}
              >
                {isUnlocked ? (
                  <View style={styles.ribbonContent}>
                    <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.ribbonText}>UNLOCKED</Text>
                  </View>
                ) : (
                  <View style={styles.ribbonContent}>
                    <Lock size={12} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.ribbonText}>LOCKED ACHIEVEMENT</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Header Info */}
            <View style={styles.headerSection}>
              {/* Name */}
              <Text style={styles.characterName}>
                {isUnlocked ? card.name : `??? (${card.rarity} Shadow)`}
              </Text>
              <Text style={styles.characterTitle}>
                {isUnlocked ? card.title : 'Unrevealed Hunter Rank Shadow'}
              </Text>

              {/* Rarity + Level + Element Row */}
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.rarityPill,
                    {
                      backgroundColor: `${rarityConf.color}20`,
                      borderColor: `${rarityConf.color}60`,
                    },
                  ]}
                >
                  <Text style={[styles.rarityPillText, { color: rarityConf.color }]}>
                    {rarityConf.label}
                  </Text>
                </View>

                {isUnlocked && (
                  <>
                    <View style={styles.levelPill}>
                      <Zap size={11} color="#333333" strokeWidth={2.5} />
                      <Text style={styles.levelPillText}>LEVEL {card.level}</Text>
                    </View>

                    <View
                      style={[
                        styles.elementPill,
                        {
                          backgroundColor: `${elementConf.color}20`,
                          borderColor: `${elementConf.color}50`,
                        },
                      ]}
                    >
                      <Text style={styles.elementEmoji}>{elementConf.icon}</Text>
                      <Text style={[styles.elementPillText, { color: elementConf.color }]}>
                        {card.element.toUpperCase()}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Unlock Requirement & Progress (Always shown when locked) */}
            {!isUnlocked && (
              <View style={styles.lockProgressSection}>
                <Text style={styles.sectionLabel}>UNLOCK REQUIREMENT</Text>
                <View style={styles.requirementCard}>
                  <Text style={styles.requirementText}>{card.unlockRequirement}</Text>

                  {progress && (
                    <View style={styles.progressDetailBox}>
                      <View style={styles.progressNumbersRow}>
                        <Text style={styles.progressCurrentText}>
                          Current Progress: <Text style={styles.progressBold}>{progress.current}</Text> / {progress.required} {progress.unit}
                        </Text>
                        <Text style={styles.progressPercentText}>{progress.percentage}%</Text>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.max(4, progress.percentage)}%` },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Stats Section (If unlocked) */}
            {isUnlocked && (
              <View style={styles.statsSection}>
                <Text style={styles.sectionLabel}>COMBAT STATS</Text>
                <View style={styles.statsGrid}>
                  <StatBar label="STR" value={card.stats.STR} maxValue={maxStat} color="#EF4444" icon={Sword} />
                  <StatBar label="AGI" value={card.stats.AGI} maxValue={maxStat} color="#0284C7" icon={Wind} />
                  <StatBar label="END" value={card.stats.END} maxValue={maxStat} color="#16A34A" icon={Shield} />
                  <StatBar label="POW" value={card.stats.POW} maxValue={maxStat} color="#D97706" icon={Flame} />
                </View>
              </View>
            )}

            {/* Lore Section */}
            <View style={styles.loreSection}>
              <Text style={styles.sectionLabel}>
                {isUnlocked ? 'SHADOW LORE' : 'SYSTEM TRANSMISSION'}
              </Text>
              <Text style={styles.loreText}>
                {isUnlocked
                  ? `"${card.lore}"`
                  : 'Fulfill the training requirement to awaken this shadow entity into your collection.'}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    backgroundColor: '#ECE5D8',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D8D0C2',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DFD8CA',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 26,
  },
  artSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 22,
    position: 'relative',
  },
  statusRibbon: {
    position: 'absolute',
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ribbonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ribbonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 6,
  },
  characterName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1816',
    letterSpacing: 0.4,
  },
  characterTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#655F55',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  rarityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  rarityPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DFD8CB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B2620',
    letterSpacing: 0.4,
  },
  elementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  elementEmoji: {
    fontSize: 11,
  },
  elementPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#756E63',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  lockProgressSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  requirementCard: {
    backgroundColor: '#DFD7C8',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1816',
    letterSpacing: 0.3,
  },
  progressDetailBox: {
    gap: 6,
    marginTop: 2,
  },
  progressNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCurrentText: {
    fontSize: 12,
    color: '#524C42',
    fontWeight: '500',
  },
  progressBold: {
    fontWeight: '800',
    color: '#1A1816',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: ACCENT_BLUE,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC3B2',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: ACCENT_BLUE,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  statsGrid: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 54,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B453D',
  },
  statBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8D0C2',
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    width: 28,
    textAlign: 'right',
  },
  loreSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 6,
  },
  loreText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4A443B',
    lineHeight: 19,
    fontStyle: 'italic',
  },
});
