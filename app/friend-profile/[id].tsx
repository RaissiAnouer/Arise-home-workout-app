import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Swords,
  Scale,
  Flame,
  Dumbbell,
  Zap,
  Trophy,
  Activity,
  Plus,
  Footprints,
  Brain,
  Eye,
  Gauge,
  Circle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MOCK_FRIENDS, MOCK_REQUESTS } from '../../src/data/friendsMockData';
import { Friend } from '../../src/types/friends';
import { RANK_CONFIG, HunterRank, computeAttributes, xpForLevel } from '../../src/data/levelConfig';
import { typography } from '../../src/styles/typography';
import Avatar from '../../src/components/Avatar';
import ChallengeNotificationModal from '../../src/components/friends/ChallengeNotificationModal';
import CompareProfileModal from '../../src/components/friends/CompareProfileModal';
import { useProgression } from '../../src/context/ProgressionContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BG_IMAGE = require('../../src/images/quest.jpg');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.28;
const AVATAR_SIZE = 96;
const ACCENT_BLUE = '#4080E7';

export default function FriendProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userProgression = useProgression();

  const [isChallengeModalVisible, setIsChallengeModalVisible] = useState(false);
  const [isCompareModalVisible, setIsCompareModalVisible] = useState(false);

  // Find friend from mock friends or requests
  const friend: Friend = useMemo(() => {
    const fromFriends = MOCK_FRIENDS.find((f) => f.id === id);
    if (fromFriends) return fromFriends;

    const fromReqs = MOCK_REQUESTS.find((r) => r.from.id === id || r.id === id)?.from;
    if (fromReqs) return fromReqs;

    // Fallback friend if not found in list
    return {
      id: id || 'f_unknown',
      username: 'Hunter Shadow',
      avatar: null,
      level: 45,
      rank: 'B' as HunterRank,
      streak: 18,
      xp: 82000,
      weeklyXp: 2100,
      totalWorkouts: 172,
      isOnline: true,
      lastActive: 'Just now',
      achievements: 24,
      favoriteWorkout: 'Push / Pull / Legs',
      profileFrame: null,
    };
  }, [id]);

  const rankConfig = RANK_CONFIG[friend.rank] || RANK_CONFIG.E;

  // Compute friend's RPG Attributes based on their level and stats
  const friendAttributes = useMemo(() => {
    return computeAttributes(friend.level, {
      totalVolumeKg: friend.totalWorkouts * 850,
      totalExercisesCompleted: friend.totalWorkouts * 6,
      restDaysCompleted: Math.floor(friend.totalWorkouts * 0.3),
      streakDays: friend.streak,
      longestStreak: friend.streak + 5,
      totalWorkouts: friend.totalWorkouts,
      prCount: Math.floor(friend.totalWorkouts * 0.15),
      uniqueExerciseCount: 28,
      daysSinceStart: Math.max(1, friend.totalWorkouts * 2),
    });
  }, [friend]);

  // Derived RPG metrics
  const xpNeeded = xpForLevel(friend.level);
  const expProgressPercent = Math.min(100, Math.max(10, Math.round(((friend.xp % xpNeeded) / xpNeeded) * 100)));
  const maxHp = 100 + friend.level * 25 + friendAttributes.VIT * 8;
  const currentHp = maxHp;
  const hpPercent = 100;

  // Format 8-character ID
  const displayId = useMemo(() => {
    const raw = (friend.username + friend.id).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return raw.slice(0, 8).padEnd(8, '0');
  }, [friend]);

  const handleBack = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/friends' as any);
    }
  };

  const handleChallengePress = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsChallengeModalVisible(true);
  };

  const handleComparePress = () => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsCompareModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top 30% Header Hero Background */}
      <View style={styles.heroWrapper}>
        <Image
          source={BG_IMAGE}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.45)', '#000000']}
          style={styles.heroGradient}
        />
      </View>

      {/* Top Nav Header Bar (Back button, Title) */}
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={handleBack} style={styles.headerIconBtn} hitSlop={12}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>HUNTER PROFILE</Text>
          <View style={styles.headerRightSpacer} />
        </View>
      </SafeAreaView>

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top spacer matching hero height minus half avatar */}
        <View style={{ height: HERO_HEIGHT - (AVATAR_SIZE / 2) }} />

        {/* ── Centered Profile Avatar (STRICTLY READ ONLY: No camera, no edit) ── */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarWrapper, { borderColor: rankConfig.color }]}>
            <Avatar
              source={friend.avatar}
              size={AVATAR_SIZE - 6}
            />
            {/* Rank badge overlay on bottom right of avatar */}
            <View style={[styles.rankLetterBadge, { backgroundColor: rankConfig.color }]}>
              <Text style={styles.rankLetterText}>{friend.rank}</Text>
            </View>
          </View>

          {/* Hunter Username (Strictly Read-Only Text) */}
          <Text style={styles.hunterNameText} numberOfLines={1}>
            {friend.username}
          </Text>

          {/* User ID Tag (#XXXXXXXX) */}
          <Text style={styles.userIdText}>#{displayId}</Text>

          {/* Online & Rank Meta Pill */}
          <View style={styles.metaRow}>
            <View style={[styles.rankTag, { borderColor: rankConfig.color }]}>
              <Text style={[styles.rankTagText, { color: rankConfig.color }]}>
                {rankConfig.title}
              </Text>
            </View>

            <View style={styles.statusPill}>
              <Circle
                size={7}
                fill={friend.isOnline ? '#34C759' : 'rgba(255, 255, 255, 0.4)'}
                color={friend.isOnline ? '#34C759' : 'rgba(255, 255, 255, 0.4)'}
              />
              <Text style={styles.statusText}>
                {friend.isOnline ? 'ONLINE' : friend.lastActive || 'OFFLINE'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── VISITOR ACTION BUTTONS ── */}
        <View style={styles.visitorActionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryActionBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleChallengePress}
          >
            <Swords size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.primaryActionBtnText}>CHALLENGE</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryActionBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleComparePress}
          >
            <Scale size={16} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.secondaryActionBtnText}>COMPARE</Text>
          </Pressable>
        </View>

        {/* ── 3. MAIN HOLOGRAPHIC RPG STATUS WINDOW (Solo Leveling System Window) ── */}
        <View style={styles.statusWindow}>
          {/* Corner Brackets */}
          <View style={[styles.cornerBracket, styles.topLeftBracket]} />
          <View style={[styles.cornerBracket, styles.topRightBracket]} />
          <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
          <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

          {/* Header Bar */}
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusHeaderBox}>
              <Text style={styles.statusHeaderText}>HUNTER STATUS</Text>
            </View>
          </View>

          {/* Level + Class / Title */}
          <View style={styles.levelJobSection}>
            <View style={styles.levelCol}>
              <Text style={styles.levelValue}>{friend.level}</Text>
              <Text style={styles.levelTitle}>LEVEL</Text>
            </View>

            <View style={styles.jobTitleCol}>
              <View style={styles.jobTitleRow}>
                <Text style={styles.metaLabel}>CLASS:</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {rankConfig.title}
                </Text>
              </View>
              <View style={styles.jobTitleRow}>
                <Text style={styles.metaLabel}>SPECIALTY:</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {friend.favoriteWorkout || 'Full Body'}
                </Text>
              </View>
            </View>
          </View>

          {/* Resource Bars Subpanel: HP, EXP, FATIGUE */}
          <View style={styles.resourceSubpanel}>
            {/* EXP Bar */}
            <View style={styles.resourceBarBlock}>
              <View style={styles.resourceHeader}>
                <Zap size={14} color="#9E9E9E" />
                <Text style={styles.resourceName}>EXP</Text>
              </View>
              <View style={styles.capsuleTrack}>
                <View style={[styles.capsuleFillExp, { width: `${expProgressPercent}%` }]} />
              </View>
              <Text style={styles.resourceNumText}>
                {friend.xp.toLocaleString()}{' '}
                <Text style={styles.resourceMaxText}>TOTAL XP</Text>
              </Text>
            </View>

            {/* HP Bar */}
            <View style={styles.resourceBarBlock}>
              <View style={styles.resourceHeader}>
                <Plus size={14} color="#9E9E9E" strokeWidth={2.5} />
                <Text style={styles.resourceName}>HP</Text>
              </View>
              <View style={styles.capsuleTrack}>
                <View style={[styles.capsuleFillHp, { width: `${hpPercent}%` }]} />
              </View>
              <Text style={styles.resourceNumText}>
                {currentHp} <Text style={styles.resourceMaxText}>/ {maxHp}</Text>
              </Text>
            </View>

            {/* Fatigue Meter */}
            <View style={styles.fatigueBlock}>
              <Gauge size={15} color="#9E9E9E" />
              <Text style={styles.fatigueLabel}>
                FATIGUE: <Text style={styles.fatigueVal}>0</Text>
              </Text>
            </View>
          </View>

          {/* RPG Core Attributes Subpanel */}
          <View style={styles.attributesSubpanel}>
            {/* Left Column: STR, AGI, VIT */}
            <View style={styles.attrCol}>
              <View style={styles.attrItem}>
                <View style={styles.attrIconWrapper}>
                  <Dumbbell size={15} color="#9E9E9E" />
                </View>
                <Text style={styles.attrLabel}>STR:</Text>
                <Text style={styles.attrValue}>{friendAttributes.STR}</Text>
              </View>

              <View style={styles.attrItem}>
                <View style={styles.attrIconWrapper}>
                  <Footprints size={15} color="#9E9E9E" />
                </View>
                <Text style={styles.attrLabel}>AGI:</Text>
                <Text style={styles.attrValue}>{friendAttributes.AGI}</Text>
              </View>

              <View style={styles.attrItem}>
                <View style={styles.attrIconWrapper}>
                  <Activity size={15} color="#9E9E9E" />
                </View>
                <Text style={styles.attrLabel}>VIT:</Text>
                <Text style={styles.attrValue}>{friendAttributes.VIT}</Text>
              </View>
            </View>

            {/* Right Column: INT, PER */}
            <View style={styles.attrCol}>
              <View style={styles.attrItem}>
                <View style={styles.attrIconWrapper}>
                  <Brain size={15} color="#9E9E9E" />
                </View>
                <Text style={styles.attrLabel}>INT:</Text>
                <Text style={styles.attrValue}>{friendAttributes.INT}</Text>
              </View>

              <View style={styles.attrItem}>
                <View style={styles.attrIconWrapper}>
                  <Eye size={15} color="#9E9E9E" />
                </View>
                <Text style={styles.attrLabel}>PER:</Text>
                <Text style={styles.attrValue}>{friendAttributes.PER}</Text>
              </View>

              <View style={styles.attrItem}>
                <View style={styles.attrIconWrapper}>
                  <Zap size={15} color="#9E9E9E" />
                </View>
                <Text style={styles.attrLabel}>PTS:</Text>
                <Text style={[styles.attrValue, { color: '#34C759' }]}>0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 4. TRAINING RECORDS & STATS MATRIX ── */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionHeader}>HUNTER RECORDS</Text>

          <View style={styles.statsGrid}>
            {/* Streak */}
            <View style={styles.statTile}>
              <View style={styles.statTileIconWrap}>
                <Flame size={18} color="#FF6B35" />
              </View>
              <Text style={styles.statTileVal}>{friend.streak} Days</Text>
              <Text style={styles.statTileLabel}>CURRENT STREAK</Text>
            </View>

            {/* Total Workouts */}
            <View style={styles.statTile}>
              <View style={styles.statTileIconWrap}>
                <Dumbbell size={18} color={ACCENT_BLUE} />
              </View>
              <Text style={styles.statTileVal}>{friend.totalWorkouts}</Text>
              <Text style={styles.statTileLabel}>WORKOUTS</Text>
            </View>

            {/* Weekly XP */}
            <View style={styles.statTile}>
              <View style={styles.statTileIconWrap}>
                <Zap size={18} color="#F59E0B" />
              </View>
              <Text style={styles.statTileVal}>+{friend.weeklyXp.toLocaleString()}</Text>
              <Text style={styles.statTileLabel}>WEEKLY XP</Text>
            </View>

            {/* Achievements */}
            <View style={styles.statTile}>
              <View style={styles.statTileIconWrap}>
                <Trophy size={18} color="#FFD700" />
              </View>
              <Text style={styles.statTileVal}>{friend.achievements}</Text>
              <Text style={styles.statTileLabel}>ACHIEVEMENTS</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Challenge Duel Modal */}
      <ChallengeNotificationModal
        visible={isChallengeModalVisible}
        onClose={() => setIsChallengeModalVisible(false)}
        opponent={friend}
        onStartChallenge={() => {
          setIsChallengeModalVisible(false);
        }}
      />

      {/* Compare Profile Modal */}
      <CompareProfileModal
        visible={isCompareModalVisible}
        onClose={() => setIsCompareModalVisible(false)}
        friend={friend}
        userStats={{
          level: userProgression.level,
          rank: userProgression.rank,
          streak: userProgression.streakDays,
          totalWorkouts: userProgression.totalWorkouts,
          xp: userProgression.xp,
          weeklyXp: userProgression.totalXp,
          achievements: 18,
          profilePicture: userProgression.profilePicture,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.65,
  },
  safeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  headerRightSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  // ── Avatar & Identity ──
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2.5,
    backgroundColor: '#12141C',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  rankLetterBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLetterText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
  },
  hunterNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  userIdText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: 3,
    letterSpacing: 1.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  rankTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  rankTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  // ── Visitor Action Row ──
  visitorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    marginBottom: 20,
    width: '100%',
  },
  primaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: ACCENT_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // ── Holographic Status Window ──
  statusWindow: {
    position: 'relative',
    backgroundColor: '#121216',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  },
  cornerBracket: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  topLeftBracket: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRightBracket: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeftBracket: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRightBracket: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  statusHeaderRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusHeaderBox: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  levelJobSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  levelCol: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    paddingRight: 10,
  },
  levelValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
  },
  levelTitle: {
    color: '#A0A0A0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  jobTitleCol: {
    flex: 1,
    paddingLeft: 14,
    gap: 6,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '700',
    width: 85,
    letterSpacing: 0.5,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  // Resource bars
  resourceSubpanel: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 14,
    marginBottom: 14,
    gap: 10,
  },
  resourceBarBlock: {
    gap: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resourceName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  capsuleTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  capsuleFillExp: {
    height: '100%',
    backgroundColor: ACCENT_BLUE,
    borderRadius: 4,
  },
  capsuleFillHp: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  resourceNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  resourceMaxText: {
    color: '#A0A0A0',
    fontSize: 10,
    fontWeight: '500',
  },
  fatigueBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  fatigueLabel: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '700',
  },
  fatigueVal: {
    color: '#34C759',
    fontWeight: '800',
  },
  // Attributes subpanel
  attributesSubpanel: {
    flexDirection: 'row',
    gap: 16,
  },
  attrCol: {
    flex: 1,
    gap: 8,
  },
  attrItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attrIconWrapper: {
    width: 22,
    alignItems: 'center',
  },
  attrLabel: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '700',
    width: 38,
    letterSpacing: 0.5,
  },
  attrValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  // ── Training Records Grid ──
  statsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    ...typography.h2,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#121216',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
    gap: 6,
  },
  statTileIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTileVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  statTileLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.8,
  },
});
