import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Shield, ChevronRight, Award, Zap, Sparkles, Eye } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { HunterRank, RANK_CONFIG } from '../../data/levelConfig';
import { typography } from '../../styles/typography';
import RankBadge from '../rank/RankBadge';
import RankBadgeShowcaseModal from '../rank/RankBadgeShowcaseModal';

const ACCENT_BLUE = '#4080E7';

const RANK_LEVEL_TIERS: { rank: HunterRank; minLevel: number; nextRank?: HunterRank }[] = [
  { rank: 'E', minLevel: 1, nextRank: 'D' },
  { rank: 'D', minLevel: 10, nextRank: 'C' },
  { rank: 'C', minLevel: 25, nextRank: 'B' },
  { rank: 'B', minLevel: 40, nextRank: 'A' },
  { rank: 'A', minLevel: 55, nextRank: 'S' },
  { rank: 'S', minLevel: 70, nextRank: 'SSS' },
  { rank: 'SSS', minLevel: 85, nextRank: 'National' },
  { rank: 'National', minLevel: 100 },
];

interface RankProgressionCardProps {
  currentRank: HunterRank;
  currentLevel: number;
}

export default function RankProgressionCard({
  currentRank,
  currentLevel,
}: RankProgressionCardProps) {
  const router = useRouter();
  const [showShowcase, setShowShowcase] = useState(false);

  const currentTierInfo = RANK_LEVEL_TIERS.find((t) => t.rank === currentRank) || RANK_LEVEL_TIERS[0];
  const nextRank = currentTierInfo.nextRank;
  const nextTierInfo = nextRank ? RANK_LEVEL_TIERS.find((t) => t.rank === nextRank) : null;

  const minLevel = currentTierInfo.minLevel;
  const targetLevel = nextTierInfo ? nextTierInfo.minLevel : 120;
  const levelSpan = Math.max(1, targetLevel - minLevel);
  const levelsEarned = Math.max(0, currentLevel - minLevel);
  const progressPercent = Math.min(100, Math.max(5, Math.round((levelsEarned / levelSpan) * 100)));

  const currentRankMeta = RANK_CONFIG[currentRank] || RANK_CONFIG.E;
  const nextRankMeta = nextRank ? RANK_CONFIG[nextRank] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>RANK AWAKENING JOURNEY</Text>

      <View style={[styles.card, { borderColor: `${currentRankMeta.color}40` }]}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.rankBadgeCol}>
            <RankBadge
              rank={currentRank}
              size="md"
              showGlow
              animated
              onPress={() => setShowShowcase(true)}
            />
            <View>
              <Text style={[styles.rankTitleText, { color: currentRankMeta.color }]}>
                {currentRankMeta.title}
              </Text>
              <Text style={styles.statusSubtitle}>Verified System Classification</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.rankPill, { borderColor: currentRankMeta.color, backgroundColor: `${currentRankMeta.color}15` }]}
            onPress={() => setShowShowcase(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.rankPillText, { color: currentRankMeta.color }]}>
              {currentRank} TIER
            </Text>
          </TouchableOpacity>
        </View>

        {/* Promotion Target Section */}
        {nextRankMeta && nextRank && (
          <View style={styles.promotionBox}>
            <View style={styles.promoHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <RankBadge rank={nextRank} size="xs" showGlow={false} />
                <Text style={styles.promoLabel}>NEXT PROMOTION: {nextRankMeta.title}</Text>
              </View>
              <Text style={styles.promoReqText}>Level {targetLevel} Required</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: currentRankMeta.color }]} />
            </View>

            <View style={styles.progressMetaRow}>
              <Text style={styles.progressLevelText}>
                Level {currentLevel} <Text style={styles.progressMaxText}>/ {targetLevel}</Text>
              </Text>
              <Text style={styles.progressPctText}>{progressPercent}% To Promotion</Text>
            </View>
          </View>
        )}

        {/* Actions Row */}
        <View style={styles.actionsCol}>
          {/* Inspect All Rank Crests */}
          <TouchableOpacity
            style={styles.viewCrestsBtn}
            activeOpacity={0.75}
            onPress={() => setShowShowcase(true)}
          >
            <View style={styles.evaluateBtnLeft}>
              <Sparkles size={15} color="#4080E7" />
              <Text style={styles.viewCrestsBtnText}>INSPECT ALL RANK CRESTS</Text>
            </View>
            <ChevronRight size={16} color="#4080E7" />
          </TouchableOpacity>

          {/* Evaluation CTA */}
          <TouchableOpacity
            style={styles.evaluateBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/rank-result' as any)}
          >
            <View style={styles.evaluateBtnLeft}>
              <Shield size={15} color="#FFFFFF" />
              <Text style={styles.evaluateBtnText}>TAKE RANK RE-ASSESSMENT</Text>
            </View>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Rank Showcase Modal */}
      <RankBadgeShowcaseModal
        visible={showShowcase}
        onClose={() => setShowShowcase(false)}
        currentRank={currentRank}
        currentLevel={currentLevel}
      />
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankBadgeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTitleText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  rankPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rankPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  promotionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    gap: 8,
  },
  promoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  promoReqText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLevelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressMaxText: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  progressPctText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionsCol: {
    gap: 8,
  },
  viewCrestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(64, 128, 231, 0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(64, 128, 231, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  viewCrestsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4080E7',
    letterSpacing: 1,
  },
  evaluateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ACCENT_BLUE,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  evaluateBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  evaluateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
