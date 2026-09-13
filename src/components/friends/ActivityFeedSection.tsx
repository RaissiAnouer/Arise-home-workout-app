import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  Dumbbell,
  TrendingUp,
  Award,
  Flame,
  Swords,
  Zap,
} from 'lucide-react-native';
import { ActivityItem, ActivityType } from '../../types/friends';
import { RANK_CONFIG } from '../../data/levelConfig';
import { typography } from '../../styles/typography';
import Avatar from '../Avatar';

type ActivityFeedSectionProps = {
  activities: ActivityItem[];
};

// ── Activity type config ────────────────────────────────────────
const TYPE_CONFIG: Record<ActivityType, { icon: React.ComponentType<{ size: number; color: string }>; color: string; label: string }> = {
  workout: { icon: Dumbbell, color: '#4080E7', label: 'Workout' },
  levelup: { icon: TrendingUp, color: '#34C759', label: 'Level Up' },
  achievement: { icon: Award, color: '#FFD700', label: 'Achievement' },
  streak: { icon: Flame, color: '#FF6B35', label: 'Streak' },
  dungeon: { icon: Swords, color: '#BF5AF2', label: 'Dungeon' },
};

// ── Time formatting ─────────────────────────────────────────────
function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function ActivityFeedSection({ activities }: ActivityFeedSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={typography.h2}>Activity Feed</Text>
      </View>

      {activities.map((item) => {
        const config = TYPE_CONFIG[item.type];
        const IconComp = config.icon;
        const rankConfig = RANK_CONFIG[item.friend.rank];

        return (
          <View key={item.id} style={styles.card}>
            {/* Left accent line */}
            <View style={[styles.accentLine, { backgroundColor: config.color }]} />

            <View style={styles.cardContent}>
              {/* Top row: avatar + info */}
              <View style={styles.topRow}>
                <Avatar
                  source={item.friend.avatar}
                  size={36}
                  borderColor={rankConfig.color}
                  borderWidth={1.5}
                />

                <View style={styles.infoBlock}>
                  <View style={styles.nameRow}>
                    <Text style={styles.username} numberOfLines={1}>{item.friend.username}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: `${config.color}18` }]}>
                      <IconComp size={10} color={config.color} />
                      <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                </View>
              </View>

              {/* Bottom row: time + xp */}
              <View style={styles.bottomRow}>
                <Text style={styles.timeText}>{timeAgo(item.timestamp)}</Text>
                {item.xpGained !== undefined && item.xpGained > 0 && (
                  <View style={styles.xpBadge}>
                    <Zap size={10} color="#4080E7" />
                    <Text style={styles.xpText}>+{item.xpGained} XP</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  accentLine: {
    width: 3,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 10,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBlock: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 17,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 46, // align with text after avatar
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(64, 128, 231, 0.1)',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4080E7',
  },
});
