import { HunterRank } from '../data/levelConfig';

// ── Friend ──────────────────────────────────────────────────────
export type Friend = {
  id: string;
  username: string;
  avatar: string | null;
  level: number;
  rank: HunterRank;
  streak: number;
  xp: number;
  weeklyXp: number;
  totalWorkouts: number;
  isOnline: boolean;
  lastActive: string; // ISO date string
  achievements: number;
  favoriteWorkout: string;
  profileFrame: string | null;
};

// ── Friend Request ──────────────────────────────────────────────
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export type FriendRequest = {
  id: string;
  from: Friend;
  timestamp: string; // ISO date string
  status: FriendRequestStatus;
};

// ── Activity Feed ───────────────────────────────────────────────
export type ActivityType =
  | 'workout'
  | 'levelup'
  | 'achievement'
  | 'streak'
  | 'dungeon';

export type ActivityItem = {
  id: string;
  friend: Friend;
  type: ActivityType;
  description: string;
  timestamp: string; // ISO date string
  xpGained?: number;
};

// ── Weekly Challenge ────────────────────────────────────────────
export type ChallengeType = 'xp' | 'workouts' | 'streak';

export type ChallengeParticipant = {
  friend: Friend;
  progress: number; // current value
};

export type WeeklyChallenge = {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  goal: number;
  startDate: string;
  endDate: string;
  participants: ChallengeParticipant[];
  reward: string;
  currentUserProgress: number;
  joined: boolean;
};

// ── Compare Stats ───────────────────────────────────────────────
export type CompareStatKey =
  | 'level'
  | 'streak'
  | 'totalWorkouts'
  | 'xp'
  | 'achievements'
  | 'weeklyXp';
