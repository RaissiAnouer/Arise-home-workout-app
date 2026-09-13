import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Share,
  Pressable,
} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Users,
  Trophy,
  Swords,
  Plus,
  Bell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';
import PrimaryButton from '../../src/components/PrimaryButton';
import Avatar from '../../src/components/Avatar';
import InviteActionsBottomSheet from '../../src/components/friends/InviteActionsBottomSheet';
import SearchFriendsModal from '../../src/components/friends/SearchFriendsModal';
import ReferralCodeModal from '../../src/components/friends/ReferralCodeModal';
import ChallengeNotificationModal from '../../src/components/friends/ChallengeNotificationModal';
import PendingRequestsModal, { PendingRequestItem } from '../../src/components/friends/PendingRequestsModal';
import LeaderboardSection from '../../src/components/friends/LeaderboardSection';
import { ReferralService } from '../../src/services/ReferralService';
import { useProgression } from '../../src/context/ProgressionContext';
import {
  MOCK_FRIENDS,
  MOCK_REQUESTS,
  MOCK_CHALLENGES,
} from '../../src/data/friendsMockData';
import {
  Friend,
  FriendRequest,
  WeeklyChallenge,
} from '../../src/types/friends';
import { RANK_CONFIG, HunterRank } from '../../src/data/levelConfig';
import { typography } from '../../src/styles/typography';

const ACCENT_BLUE = '#4080E7';

type TabKey = 'friends' | 'rankings';

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { onScroll } = useTabBarVisibility();
  const progression = useProgression();

  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [requests, setRequests] = useState<FriendRequest[]>(MOCK_REQUESTS);
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(MOCK_CHALLENGES);
  const [challengedFriends, setChallengedFriends] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<TabKey>('friends');

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isReferralModalVisible, setIsReferralModalVisible] = useState(false);
  const [isChallengeModalVisible, setIsChallengeModalVisible] = useState(false);
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] = useState(false);

  // Background receding animation progress (0 = closed, 1 = sheet open)
  const sheetProgress = useSharedValue(0);

  const openBottomSheet = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsBottomSheetVisible(true);
    sheetProgress.value = withTiming(1, {
      duration: 320,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [sheetProgress]);

  const closeBottomSheet = useCallback(() => {
    sheetProgress.value = withTiming(
      0,
      {
        duration: 250,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsBottomSheetVisible)(false);
        }
      }
    );
  }, [sheetProgress]);

  // Receding background page transform style (iOS Card presentation matching home page)
  const backgroundCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(sheetProgress.value, [0, 1], [1, 0.95], Extrapolation.CLAMP);
    const translateY = interpolate(sheetProgress.value, [0, 1], [0, 10], Extrapolation.CLAMP);
    const borderRadius = interpolate(sheetProgress.value, [0, 1], [0, 20], Extrapolation.CLAMP);
    const opacity = interpolate(sheetProgress.value, [0, 1], [1, 0.85], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateY }],
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      opacity,
      overflow: 'hidden',
    };
  });

  const handleShareInvite = async () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const state = await ReferralService.getReferralState();
      const code = state.myReferralCode;
      const link = state.referralLink;
      await Share.share({
        message: `Join me on Arise! Awaken your hunter potential, conquer daily workouts, and use my referral code ${code} when you sign up: ${link}`,
        title: 'Join me on Arise!',
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  const handleAcceptRequest = (id: string) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const req = requests.find((r) => r.id === id);
    if (req) {
      setFriends((prev) => [req.from, ...prev]);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleDeclineRequest = (id: string) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const [selectedOpponent, setSelectedOpponent] = useState<Friend | null>(null);

  const handleAcceptIncomingChallenge = (id: string) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsChallengeModalVisible(true);
  };

  const handleDeclineIncomingChallenge = (id: string) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleChallengeFriend = (friend: Friend) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOpponent(friend);
    setIsChallengeModalVisible(true);
  };

  const handleOpenFriendProfile = (friend: Friend) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/friend-profile/${friend.id}` as any);
  };

  const handleStartChallenge = (opponent: Friend) => {
    if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChallengedFriends((prev) => {
      const next = new Set(prev);
      next.add(opponent.id);
      return next;
    });
    setIsChallengeModalVisible(false);
  };

  const handleJoinChallenge = (id: string) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChallenges((prev) =>
      prev.map((c) => ({
        ...c,
        joined: c.id === id,
      }))
    );
  };

  const handleLeaveChallenge = (id: string) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: false } : c))
    );
  };

  const userStats = useMemo(
    () => ({
      level: progression?.level || 1,
      rank: (progression?.rank as HunterRank) || 'E',
      streak: progression?.streakDays || 0,
      totalWorkouts: progression?.totalWorkouts || 0,
      xp: progression?.totalXp || progression?.xp || 0,
      weeklyXp: Math.min(2400, progression?.totalXp || progression?.xp || 1850),
      username: 'You',
      achievements: 15,
    }),
    [progression]
  );

  const activeOpponent = useMemo(() => {
    if (selectedOpponent) return selectedOpponent;
    if (challengedFriends.size > 0) {
      const firstChallengedId = Array.from(challengedFriends)[0];
      const found = friends.find((f) => f.id === firstChallengedId);
      if (found) return found;
    }
    return friends[0] || MOCK_FRIENDS[0];
  }, [selectedOpponent, challengedFriends, friends]);

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'pending'),
    [requests]
  );

  const formattedRequests = useMemo<PendingRequestItem[]>(() => {
    return pendingRequests.map((r) => ({
      id: r.id,
      name: r.from.username,
      avatar: r.from.avatar,
      avatarColor: RANK_CONFIG[r.from.rank]?.color || ACCENT_BLUE,
      initials: r.from.username.slice(0, 2).toUpperCase(),
      sentAt: '2h ago',
    }));
  }, [pendingRequests]);

  const totalNotificationCount = pendingRequests.length;

  const tabs: { id: TabKey; label: string; icon: React.ComponentType<{ size: number; color: string }>; badge?: number }[] = [
    { id: 'friends', label: 'Friends', icon: Users, badge: friends.length },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
  ];

  return (
    <View style={styles.rootContainer}>
      <Reanimated.View style={[{ flex: 1, backgroundColor: '#0A0A0C' }, backgroundCardStyle]}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>FRIENDS</Text>

            {/* Right Action Controls: White Notification Bell Icon + Plus Add Friend Button */}
            <View style={styles.headerRightActions}>
              {/* Notification Bell Button (Opens Notifications modal) */}
              <Pressable
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.iconBtnPressed,
                ]}
                onPress={() => {
                  if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsNotificationsModalVisible(true);
                }}
                hitSlop={6}
              >
                <Bell size={19} color="#FFFFFF" strokeWidth={2.2} />
                {totalNotificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {totalNotificationCount}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Add Friend Button (+ icon only) */}
              <Pressable
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.iconBtnPressed,
                ]}
                onPress={openBottomSheet}
                hitSlop={6}
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>

          {/* Segmented Navigation Tabs (Fit in screen, no horizontal scroll) */}
          <View style={styles.tabsWrapper}>
            <View style={styles.tabsRow}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <Pressable
                    key={tab.id}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                    onPress={() => {
                      if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveTab(tab.id);
                    }}
                  >
                    <IconComponent
                      size={14}
                      color={isActive ? '#000000' : 'rgba(255, 255, 255, 0.5)'}
                    />
                    <Text
                      style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <View
                        style={[
                          styles.tabBadge,
                          isActive && styles.tabBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tabBadgeText,
                            isActive && styles.tabBadgeTextActive,
                          ]}
                        >
                          {tab.badge}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Main Scroll Content */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 110 },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {/* TAB: FRIENDS */}
            {activeTab === 'friends' && (
              <View style={styles.tabContentBlock}>
                {/* Empty State if No Friends */}
                {friends.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Image
                      source={require('../../assets/sad.png')}
                      style={styles.emptyHeroImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.emptyTitle}>NO FRIENDS YET</Text>
                    <Text style={styles.emptySub}>
                      You haven't added any friends yet. Invite fellow Hunters to train and rise together.
                    </Text>
                    <PrimaryButton
                      title="+ ADD A FRIEND"
                      onPress={openBottomSheet}
                      style={styles.emptyActionBtn}
                    />
                  </View>
                ) : (
                  /* Hunter Friends Row List (No Cards) */
                  <View style={styles.friendsListContainer}>
                    {friends.map((friend, index) => {
                      const rankColor = RANK_CONFIG[friend.rank]?.color || ACCENT_BLUE;
                      const isChallenged = challengedFriends.has(friend.id);

                      return (
                        <View key={friend.id}>
                          <View style={styles.friendRow}>
                            {/* Clickable Friend Profile (Avatar with Level underneath + Name beside) */}
                            <Pressable
                              style={({ pressed }) => [
                                styles.friendProfilePressable,
                                pressed && { opacity: 0.8 },
                              ]}
                              onPress={() => handleOpenFriendProfile(friend)}
                            >
                              {/* Avatar with Level underneath */}
                              <View style={styles.avatarCol}>
                                <Avatar
                                  source={friend.avatar}
                                  size={42}
                                />
                                <View style={styles.levelBadge}>
                                  <Text style={styles.levelBadgeText}>Lv.{friend.level}</Text>
                                </View>
                              </View>

                              {/* Info Column: Name only */}
                              <View style={styles.friendInfo}>
                                <Text
                                  style={styles.friendName}
                                  numberOfLines={1}
                                >
                                  {friend.username}
                                </Text>
                              </View>
                            </Pressable>

                            {/* Challenge Button */}
                            <Pressable
                              style={({ pressed }) => [
                                styles.challengeBtn,
                                isChallenged && styles.challengeBtnActive,
                                pressed && styles.challengeBtnPressed,
                              ]}
                              onPress={() => handleChallengeFriend(friend)}
                            >
                              <Text
                                style={[
                                  styles.challengeBtnText,
                                  isChallenged && styles.challengeBtnTextActive,
                                ]}
                              >
                                {isChallenged ? 'PENDING...' : 'CHALLENGE'}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* TAB: RANKINGS */}
            {activeTab === 'rankings' && (
              <LeaderboardSection
                friends={friends}
                userStats={userStats}
                onSelectFriend={(friendId) => router.push(`/friend-profile/${friendId}` as any)}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Reanimated.View>

      {/* 30% Bottom Sheet with the 3 Buttons */}
      <InviteActionsBottomSheet
        visible={isBottomSheetVisible}
        onClose={closeBottomSheet}
        sheetProgress={sheetProgress}
        onOpenSearch={() => setIsSearchModalVisible(true)}
        onOpenReferral={() => setIsReferralModalVisible(true)}
        onShareInvite={handleShareInvite}
      />

      {/* Search Friends Modal */}
      <SearchFriendsModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
      />

      {/* Referral Code Modal */}
      <ReferralCodeModal
        visible={isReferralModalVisible}
        onClose={() => setIsReferralModalVisible(false)}
      />

      {/* Solo Leveling Challenge Notification Modal */}
      <ChallengeNotificationModal
        visible={isChallengeModalVisible}
        onClose={() => setIsChallengeModalVisible(false)}
        onStartChallenge={handleStartChallenge}
        userStats={userStats}
        opponent={activeOpponent}
        isAlreadyChallenged={activeOpponent ? challengedFriends.has(activeOpponent.id) : false}
      />

      {/* Notifications Modal (Friend Requests & Alerts) */}
      <PendingRequestsModal
        visible={isNotificationsModalVisible}
        onClose={() => setIsNotificationsModalVisible(false)}
        requests={formattedRequests}
        onAccept={(item) => handleAcceptRequest(item.id)}
        onDecline={(requestId) => handleDeclineRequest(requestId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0A0A0C',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
    marginLeft: 1,
  },
  tabBadgeActive: {
    backgroundColor: '#000000',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tabContentBlock: {
    gap: 18,
  },
  friendsListContainer: {
    width: '100%',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    gap: 12,
  },
  friendProfilePressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginLeft: 54,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  levelBadge: {
    marginTop: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.3,
  },
  rankAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankAvatarText: {
    fontSize: 16,
    fontWeight: '900',
  },
  friendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  challengeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4080E7',
    borderColor: '#4080E7',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  challengeBtnActive: {
    backgroundColor: 'rgba(64, 128, 231, 0.15)',
    borderColor: '#4080E7',
    borderWidth: 1,
  },
  challengeBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  challengeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  challengeBtnTextActive: {
    color: '#4080E7',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  emptyHeroImage: {
    width: 180,
    height: 180,
  },
  emptyTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.1,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  emptyActionBtn: {
    marginTop: 8,
  },
});
