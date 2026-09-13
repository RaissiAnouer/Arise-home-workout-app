import { HunterRank } from '../data/levelConfig';

export type GuildRankTier = 'S-Rank' | 'A-Rank' | 'B-Rank' | 'C-Rank' | 'D-Rank';
export type GuildActivityTier = 'Hardcore' | 'Active' | 'Casual';
export type GuildMemberRole = 'leader' | 'officer' | 'elite' | 'member';

export type GuildEmblemType =
  | 'guild_1'
  | 'guild_2'
  | 'guild_3'
  | 'guild_4'
  | 'guild_5'
  | 'guild_6'
  | 'shadow_monarch'
  | 'dragon_fang'
  | 'dual_daggers'
  | 'titan_aegis'
  | 'void_crown'
  | 'phoenix_blaze'
  | 'iron_fortress'
  | 'eclipse_gate';

export interface GuildMember {
  id: string;
  username: string;
  avatar: string | null;
  avatarColor?: string;
  initials?: string;
  rank: HunterRank;
  level: number;
  role: GuildMemberRole;
  monthlyContributionXp: number;
  totalWorkoutsCompleted: number;
  streakDays: number;
  joinedAt: string;
  isOnline: boolean;
  isCurrentUser?: boolean;
}

export type DuelChallengeType =
  | 'most_xp_week'
  | 'most_workouts'
  | 'longest_streak'
  | 'highest_volume'
  | 'most_calories'
  | 'dungeon_clears';

export interface GuildDuel {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerAvatar: string | null;
  challengerRank: HunterRank;
  challengerProgress: number;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string | null;
  opponentRank: HunterRank;
  opponentProgress: number;
  challengeType: DuelChallengeType;
  challengeTitle: string;
  durationDays: number;
  daysRemaining: number;
  wagerExp: number;
  status: 'active' | 'completed' | 'pending';
  winnerId?: string;
  createdAt: string;
}

export interface GuildChallenge {
  id: string;
  title: string;
  description: string;
  category: 'workouts' | 'exp' | 'streak' | 'dungeon';
  targetGoal: number;
  currentProgress: number;
  unit: string;
  daysRemaining: number;
  rewardExp: number;
  participantsCount: number;
  participants: {
    memberId: string;
    memberName: string;
    progress: number;
  }[];
  isJoined?: boolean;
}

export interface GuildJoinRequest {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  avatarColor?: string;
  initials?: string;
  rank: HunterRank;
  level: number;
  requestedAt: string;
}

export interface Guild {
  id: string;
  name: string;
  motto: string;
  description: string;
  emblem: GuildEmblemType;
  rankTier: GuildRankTier;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  monthlyExp: number;
  monthlyExpTarget: number;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  minRankRequirement: HunterRank;
  activityTier: GuildActivityTier;
  leaderId: string;
  leaderName: string;
  leaderAvatar: string | null;
  createdAt: string;
  members: GuildMember[];
  duels: GuildDuel[];
  challenges: GuildChallenge[];
  joinRequests: GuildJoinRequest[];
}
