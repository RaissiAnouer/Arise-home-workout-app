import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';
import { Friend } from '../../types/friends';
import { RANK_CONFIG, HunterRank } from '../../data/levelConfig';
import Avatar from '../Avatar';

const CYAN_START = '#00A3FF';
const ACCENT_BLUE = '#4080E7';

type WeeklyChallengesSectionProps = {
  userStats?: {
    level: number;
    rank: HunterRank;
    streak: number;
    username: string;
    profilePicture?: string | null;
  };
  opponent?: Friend;
  onPress?: () => void;
};

export default function WeeklyChallengesSection({
  userStats = { level: 25, rank: 'C', streak: 12, username: 'You' },
  opponent = {
    id: 'opp1',
    username: 'ShadowMonarch',
    avatar: null,
    level: 87,
    rank: 'S',
    streak: 142,
    xp: 245000,
    weeklyXp: 4200,
    totalWorkouts: 412,
    isOnline: true,
    lastActive: 'Just now',
    achievements: 48,
    favoriteWorkout: 'Full Body',
    profileFrame: null,
  },
  onPress,
}: WeeklyChallengesSectionProps) {
  const targetHoursToday = 2.0;
  const userHoursToday = 1.5;
  const opponentHoursToday = 1.8;

  const userRankColor = RANK_CONFIG[userStats.rank]?.color || ACCENT_BLUE;
  const opponentRankColor = RANK_CONFIG[opponent.rank]?.color || '#F59E0B';

  const userPct = Math.min(100, Math.round((userHoursToday / targetHoursToday) * 100));
  const opponentPct = Math.min(100, Math.round((opponentHoursToday / targetHoursToday) * 100));

  const content = (
    <View style={styles.systemWindowWrapper}>
      <ImageBackground
        source={require('../../images/challenge.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <View style={styles.systemWindow}>
        {/* Row 1: You */}
        <View style={styles.hunterRow}>
          {/* Profile Picture to the Left */}
          <Avatar
            source={userStats.profilePicture}
            size={44}
            borderColor={userRankColor}
            borderWidth={2}
          />

          {/* Progress Bar & Hours Workout */}
          <View style={styles.progressCol}>
            <View style={styles.infoRow}>
              <Text style={styles.hunterName}>{userStats.username}</Text>
              <Text style={styles.hoursText}>
                <Text style={styles.hoursHighlight}>{userHoursToday}h</Text> / {targetHoursToday}h
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFillWhite,
                  { width: `${userPct}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Row 2: Challenged Friend */}
        <View style={styles.hunterRow}>
          {/* Profile Picture to the Left */}
          <Avatar
            source={opponent.avatar}
            size={44}
            borderColor={opponentRankColor}
            borderWidth={2}
          />

          {/* Progress Bar & Hours Workout */}
          <View style={styles.progressCol}>
            <View style={styles.infoRow}>
              <Text style={styles.hunterName}>{opponent.username}</Text>
              <Text style={styles.hoursText}>
                <Text style={styles.hoursHighlight}>
                  {opponentHoursToday}h
                </Text> / {targetHoursToday}h
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFillWhite,
                  { width: `${opponentPct}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 8,
  },
  systemWindowWrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 182, 255, 0.55)',
    overflow: 'hidden',
    shadowColor: CYAN_START,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  systemWindow: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 16,
  },
  hunterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRankText: {
    fontSize: 18,
    fontWeight: '900',
  },
  progressCol: {
    flex: 1,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hunterName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  hoursText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  hoursHighlight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillWhite: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
