import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Zap,
  Trophy,
  Dumbbell,
  Flame,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import { Friend } from '../../types/friends';
import { RANK_CONFIG, HunterRank } from '../../data/levelConfig';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

type FilterType = 'weeklyXp' | 'xp' | 'workouts' | 'streak';

type LeaderboardSectionProps = {
  friends: Friend[];
  userStats: {
    level: number;
    rank: HunterRank;
    streak: number;
    totalWorkouts: number;
    xp: number;
    weeklyXp: number;
    username: string;
    profilePicture?: string | null;
  };
  onSelectFriend?: (friendId: string) => void;
};

const FILTERS: { id: FilterType; label: string; icon: React.ComponentType<{ size: number; color: string }> }[] = [
  { id: 'weeklyXp', label: 'Weekly XP', icon: Zap },
  { id: 'xp', label: 'Total XP', icon: Trophy },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'streak', label: 'Streak', icon: Flame },
];

function getValue(friend: Friend | null, filter: FilterType, userStats?: LeaderboardSectionProps['userStats']): number {
  if (!friend && userStats) {
    switch (filter) {
      case 'weeklyXp': return userStats.weeklyXp;
      case 'xp': return userStats.xp;
      case 'workouts': return userStats.totalWorkouts;
      case 'streak': return userStats.streak;
    }
  }
  if (!friend) return 0;
  switch (filter) {
    case 'weeklyXp': return friend.weeklyXp;
    case 'xp': return friend.xp;
    case 'workouts': return friend.totalWorkouts;
    case 'streak': return friend.streak;
  }
}

function formatValue(v: number, filter: FilterType): string {
  if (filter === 'xp' || filter === 'weeklyXp') {
    return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`;
  }
  return `${v}`;
}

type RankedEntry = {
  id: string;
  username: string;
  avatar?: string | null;
  rank: HunterRank;
  level: number;
  value: number;
  isUser: boolean;
  position: number;
};

export default function LeaderboardSection({ friends, userStats, onSelectFriend }: LeaderboardSectionProps) {
  const [filter, setFilter] = useState<FilterType>('weeklyXp');

  // Build sorted leaderboard
  const entries: RankedEntry[] = [
    ...friends.map((f) => ({
      id: f.id,
      username: f.username,
      avatar: f.avatar,
      rank: f.rank,
      level: f.level,
      value: getValue(f, filter),
      isUser: false,
      position: 0,
    })),
    {
      id: 'user',
      username: userStats.username,
      avatar: userStats.profilePicture,
      rank: userStats.rank,
      level: userStats.level,
      value: getValue(null, filter, userStats),
      isUser: true,
      position: 0,
    },
  ];

  // Sort descending by value
  entries.sort((a, b) => b.value - a.value);

  // Assign positions
  entries.forEach((e, idx) => {
    e.position = idx + 1;
  });

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const handleEntryPress = (entry: RankedEntry) => {
    if (!entry.isUser && onSelectFriend) {
      onSelectFriend(entry.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <View style={styles.headerRow}>
        <Text style={typography.h2}>Leaderboard</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = filter === f.id;
          const IconComp = f.icon;
          return (
            <Pressable
              key={f.id}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setFilter(f.id)}
            >
              <IconComp size={12} color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Podium — Top 3 */}
      <View style={styles.podium}>
        {/* 2nd place */}
        {top3[1] && (
          <PodiumCard
            entry={top3[1]}
            filter={filter}
            height={90}
            medalColor="#A9A9A9"
            onPress={() => handleEntryPress(top3[1])}
          />
        )}
        {/* 1st place */}
        {top3[0] && (
          <PodiumCard
            entry={top3[0]}
            filter={filter}
            height={110}
            medalColor="#FFD700"
            isFirst
            onPress={() => handleEntryPress(top3[0])}
          />
        )}
        {/* 3rd place */}
        {top3[2] && (
          <PodiumCard
            entry={top3[2]}
            filter={filter}
            height={75}
            medalColor="#CD7F32"
            onPress={() => handleEntryPress(top3[2])}
          />
        )}
      </View>

      {/* Remaining */}
      {rest.map((entry) => (
        <Pressable
          key={entry.id}
          style={({ pressed }) => [
            styles.listRow,
            entry.isUser && styles.listRowUser,
            !entry.isUser && pressed && { opacity: 0.8 },
          ]}
          onPress={() => handleEntryPress(entry)}
          disabled={entry.isUser}
        >
          <Text style={[styles.positionNum, entry.isUser && { color: '#4080E7' }]}>
            {entry.position}
          </Text>

          <Avatar
            source={entry.avatar}
            size={34}
            borderColor={RANK_CONFIG[entry.rank].color}
            borderWidth={1.5}
          />

          <View style={styles.listInfo}>
            <Text style={[styles.listName, entry.isUser && { color: '#4080E7' }]} numberOfLines={1}>
              {entry.isUser ? 'You' : entry.username}
            </Text>
            <Text style={styles.listMeta}>Lv.{entry.level}</Text>
          </View>

          <View style={styles.listValueContainer}>
            <Text style={[styles.listValue, entry.isUser && { color: '#4080E7' }]}>
              {formatValue(entry.value, filter)}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

// ── Podium Card ─────────────────────────────────────────────────
function PodiumCard({
  entry,
  filter,
  height,
  medalColor,
  isFirst,
  onPress,
}: {
  entry: RankedEntry;
  filter: FilterType;
  height: number;
  medalColor: string;
  isFirst?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.podiumCard,
        { minHeight: height },
        entry.isUser && styles.podiumCardUser,
        !entry.isUser && pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
      disabled={entry.isUser}
    >
      {/* Position medal */}
      <View style={[styles.medal, { backgroundColor: medalColor }]}>
        <Text style={styles.medalText}>{entry.position}</Text>
      </View>

      {isFirst && (
        <Crown size={16} color="#FFD700" style={styles.crownIcon} />
      )}

      <Avatar
        source={entry.avatar}
        size={36}
        borderColor={RANK_CONFIG[entry.rank].color}
        borderWidth={2}
      />

      <Text style={styles.podiumName} numberOfLines={1}>
        {entry.isUser ? 'You' : entry.username}
      </Text>

      <View style={[styles.podiumRankBadge, { backgroundColor: `${RANK_CONFIG[entry.rank].color}20`, borderColor: `${RANK_CONFIG[entry.rank].color}40` }]}>
        <Text style={[styles.podiumRankText, { color: RANK_CONFIG[entry.rank].color }]}>{entry.rank}</Text>
      </View>

      <Text style={[styles.podiumValue, entry.isUser && { color: '#4080E7' }]}>
        {formatValue(entry.value, filter)}
      </Text>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterPillActive: {
    backgroundColor: '#4080E7',
    borderColor: '#4080E7',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Podium
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  podiumCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 6,
    position: 'relative',
  },
  podiumCardUser: {
    borderColor: 'rgba(64, 128, 231, 0.3)',
    backgroundColor: 'rgba(64, 128, 231, 0.06)',
  },
  medal: {
    position: 'absolute',
    top: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  medalText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  crownIcon: {
    marginTop: 4,
  },
  podiumAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumRankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  podiumRankText: {
    fontSize: 9,
    fontWeight: '800',
  },
  podiumValue: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },

  // List Rows
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 10,
  },
  listRowUser: {
    borderColor: 'rgba(64, 128, 231, 0.3)',
    backgroundColor: 'rgba(64, 128, 231, 0.08)',
  },
  positionNum: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
  listAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  listName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.35)',
  },
  listValueContainer: {
    alignItems: 'flex-end',
  },
  listValue: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
});
