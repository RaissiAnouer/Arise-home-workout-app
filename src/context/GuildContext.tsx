import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Guild,
  GuildMember,
  GuildDuel,
  GuildChallenge,
  GuildJoinRequest,
  GuildEmblemType,
  DuelChallengeType,
  GuildMemberRole,
} from '../types/guild';
import { INITIAL_GUILDS } from '../data/initialGuilds';
import { useProgression } from './ProgressionContext';
import { HunterRank } from '../data/levelConfig';

const STORAGE_KEY_GUILD_REGISTRY = '@arise_guild_registry_v3';
const STORAGE_KEY_USER_GUILD_ID = '@arise_user_guild_id_v3';
const STORAGE_KEY_SENT_REQUESTS = '@arise_sent_guild_requests_v3';

interface CreateGuildInput {
  name: string;
  motto: string;
  description: string;
  emblem: GuildEmblemType;
  isPrivate: boolean;
  minRankRequirement: HunterRank;
  maxMembers: number;
}

interface GuildContextType {
  currentGuild: Guild | null;
  guilds: Guild[];
  sentRequestGuildIds: Set<string>;
  isLoading: boolean;
  joinGuild: (guildId: string) => Promise<{ success: boolean; message: string }>;
  requestToJoinGuild: (guildId: string) => Promise<{ success: boolean; message: string }>;
  createGuild: (input: CreateGuildInput) => Promise<{ success: boolean; guild: Guild | null }>;
  leaveGuild: () => Promise<void>;
  disbandGuild: () => Promise<void>;
  issueDuel: (opponentId: string, challengeType: DuelChallengeType, durationDays: number, wagerExp: number) => Promise<{ success: boolean; duel: GuildDuel | null }>;
  createGuildChallenge: (title: string, description: string, category: 'workouts' | 'exp' | 'streak' | 'dungeon', targetGoal: number, days: number, rewardExp: number) => Promise<void>;
  joinGuildChallenge: (challengeId: string) => Promise<void>;
  acceptJoinRequest: (requestId: string) => Promise<void>;
  declineJoinRequest: (requestId: string) => Promise<void>;
  kickMember: (memberId: string) => Promise<void>;
  promoteMember: (memberId: string, role: GuildMemberRole) => Promise<void>;
  updateGuildSettings: (updated: Partial<Guild>) => Promise<void>;
  refreshGuildData: () => Promise<void>;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export function GuildProvider({ children }: { children: ReactNode }) {
  const { rank, level, xp, totalWorkouts, streakDays, profilePicture } = useProgression();
  const [guilds, setGuilds] = useState<Guild[]>(INITIAL_GUILDS);
  const [currentGuildId, setCurrentGuildId] = useState<string | null>(null);
  const [sentRequestGuildIds, setSentRequestGuildIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage
  useEffect(() => {
    loadGuildState();
  }, []);

  const loadGuildState = async () => {
    try {
      setIsLoading(true);
      const storedRegistry = await AsyncStorage.getItem(STORAGE_KEY_GUILD_REGISTRY);
      const storedUserGuildId = await AsyncStorage.getItem(STORAGE_KEY_USER_GUILD_ID);
      const storedSentRequests = await AsyncStorage.getItem(STORAGE_KEY_SENT_REQUESTS);

      if (storedRegistry) {
        setGuilds(JSON.parse(storedRegistry));
      } else {
        setGuilds(INITIAL_GUILDS);
        await AsyncStorage.setItem(STORAGE_KEY_GUILD_REGISTRY, JSON.stringify(INITIAL_GUILDS));
      }

      if (storedUserGuildId) {
        setCurrentGuildId(storedUserGuildId);
      }

      if (storedSentRequests) {
        setSentRequestGuildIds(new Set(JSON.parse(storedSentRequests)));
      }
    } catch (e) {
      console.error('Failed to load guild state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRegistry = async (updatedGuilds: Guild[]) => {
    setGuilds(updatedGuilds);
    await AsyncStorage.setItem(STORAGE_KEY_GUILD_REGISTRY, JSON.stringify(updatedGuilds));
  };

  // Find Current Guild
  const currentGuild = useMemo(() => {
    if (!currentGuildId) return null;
    const found = guilds.find((g) => g.id === currentGuildId);
    if (!found) return null;

    // Inject/Sync current user real fitness data into member record
    const updatedMembers = found.members.map((m) => {
      if (m.isCurrentUser || m.id === 'current_user_hunter') {
        return {
          ...m,
          username: 'You (Hunter)',
          avatar: profilePicture,
          rank: rank,
          level: level,
          streakDays: streakDays,
          totalWorkoutsCompleted: totalWorkouts,
          monthlyContributionXp: Math.max(m.monthlyContributionXp || 0, Math.floor(xp * 0.4) + totalWorkouts * 150),
        };
      }
      return m;
    });

    return {
      ...found,
      members: updatedMembers,
    };
  }, [currentGuildId, guilds, rank, level, xp, totalWorkouts, streakDays, profilePicture]);

  // Join a Public Guild
  const joinGuild = useCallback(
    async (guildId: string): Promise<{ success: boolean; message: string }> => {
      const targetGuild = guilds.find((g) => g.id === guildId);
      if (!targetGuild) return { success: false, message: 'Guild not found' };

      if (targetGuild.memberCount >= targetGuild.maxMembers) {
        return { success: false, message: 'Guild is full' };
      }

      const currentUserMember: GuildMember = {
        id: 'current_user_hunter',
        username: 'You (Hunter)',
        avatar: profilePicture,
        avatarColor: '#4080E7',
        initials: 'YO',
        rank: rank,
        level: level,
        role: 'member',
        monthlyContributionXp: Math.floor(xp * 0.4) + totalWorkouts * 150,
        totalWorkoutsCompleted: totalWorkouts,
        streakDays: streakDays,
        joinedAt: new Date().toISOString().split('T')[0],
        isOnline: true,
        isCurrentUser: true,
      };

      const updatedGuilds = guilds.map((g) => {
        if (g.id === guildId) {
          const exists = g.members.some((m) => m.id === 'current_user_hunter' || m.isCurrentUser);
          const members = exists ? g.members : [...g.members, currentUserMember];
          return {
            ...g,
            members,
            memberCount: members.length,
            monthlyExp: g.monthlyExp + currentUserMember.monthlyContributionXp,
          };
        }
        return g;
      });

      setCurrentGuildId(guildId);
      await AsyncStorage.setItem(STORAGE_KEY_USER_GUILD_ID, guildId);
      await saveRegistry(updatedGuilds);

      return { success: true, message: `Welcome to ${targetGuild.name}!` };
    },
    [guilds, profilePicture, rank, level, xp, totalWorkouts, streakDays]
  );

  // Request to Join Private Guild
  const requestToJoinGuild = useCallback(
    async (guildId: string): Promise<{ success: boolean; message: string }> => {
      const targetGuild = guilds.find((g) => g.id === guildId);
      if (!targetGuild) return { success: false, message: 'Guild not found' };

      if (sentRequestGuildIds.has(guildId)) {
        return { success: false, message: 'Request already sent to this guild' };
      }

      const newRequest: GuildJoinRequest = {
        id: `req_${Date.now()}`,
        userId: 'current_user_hunter',
        username: 'You (Hunter)',
        avatar: profilePicture,
        avatarColor: '#4080E7',
        initials: 'YO',
        rank: rank,
        level: level,
        requestedAt: 'Just now',
      };

      const updatedGuilds = guilds.map((g) => {
        if (g.id === guildId) {
          return {
            ...g,
            joinRequests: [newRequest, ...g.joinRequests],
          };
        }
        return g;
      });

      const nextSent = new Set(sentRequestGuildIds);
      nextSent.add(guildId);
      setSentRequestGuildIds(nextSent);
      await AsyncStorage.setItem(STORAGE_KEY_SENT_REQUESTS, JSON.stringify(Array.from(nextSent)));
      await saveRegistry(updatedGuilds);

      return { success: true, message: 'Join request sent to Guild Leader' };
    },
    [guilds, sentRequestGuildIds, profilePicture, rank, level]
  );

  // Create Guild
  const createGuild = useCallback(
    async (input: CreateGuildInput): Promise<{ success: boolean; guild: Guild | null }> => {
      const newGuildId = `guild_${Date.now()}`;
      const leaderMember: GuildMember = {
        id: 'current_user_hunter',
        username: 'You (Guild Master)',
        avatar: profilePicture,
        avatarColor: '#4080E7',
        initials: 'GM',
        rank: rank,
        level: level,
        role: 'leader',
        monthlyContributionXp: Math.floor(xp * 0.4) + totalWorkouts * 150 + 500,
        totalWorkoutsCompleted: totalWorkouts,
        streakDays: streakDays,
        joinedAt: new Date().toISOString().split('T')[0],
        isOnline: true,
        isCurrentUser: true,
      };

      const newGuild: Guild = {
        id: newGuildId,
        name: input.name.trim(),
        motto: input.motto.trim() || 'Arise and conquer.',
        description: input.description.trim() || 'A new guild of aspiring hunters aiming for the pinnacle.',
        emblem: input.emblem,
        rankTier: 'B-Rank',
        level: 1,
        currentExp: 500,
        expToNextLevel: 2500,
        monthlyExp: 500,
        monthlyExpTarget: 5000,
        memberCount: 1,
        maxMembers: input.maxMembers || 30,
        isPrivate: input.isPrivate,
        minRankRequirement: input.minRankRequirement || 'E-Rank',
        activityTier: 'Active',
        leaderId: 'current_user_hunter',
        leaderName: 'You (Guild Master)',
        leaderAvatar: profilePicture,
        createdAt: new Date().toISOString(),
        members: [leaderMember],
        challenges: [
          {
            id: `chal_init_${Date.now()}`,
            title: 'Founding Hunter Quest',
            description: 'Complete 10 workouts as a guild to establish your hunter stronghold.',
            category: 'workouts',
            targetGoal: 10,
            currentProgress: Math.min(10, totalWorkouts),
            unit: 'Workouts',
            daysRemaining: 30,
            rewardExp: 1000,
            participantsCount: 1,
            participants: [{ memberId: 'current_user_hunter', memberName: 'You', progress: Math.min(10, totalWorkouts) }],
            isJoined: true,
          },
        ],
        duels: [],
        joinRequests: [],
      };

      const updated = [newGuild, ...guilds];
      setCurrentGuildId(newGuildId);
      await AsyncStorage.setItem(STORAGE_KEY_USER_GUILD_ID, newGuildId);
      await saveRegistry(updated);

      return { success: true, guild: newGuild };
    },
    [guilds, profilePicture, rank, level, xp, totalWorkouts, streakDays]
  );

  // Leave Guild
  const leaveGuild = useCallback(async () => {
    const targetId = currentGuildId;
    if (!targetId) return;

    setCurrentGuildId(null);
    await AsyncStorage.removeItem(STORAGE_KEY_USER_GUILD_ID);

    const updated = guilds.map((g) => {
      if (g.id === targetId) {
        const remaining = g.members.filter((m) => !m.isCurrentUser && m.id !== 'current_user_hunter');
        return {
          ...g,
          members: remaining,
          memberCount: remaining.length,
        };
      }
      return g;
    });

    await saveRegistry(updated);
  }, [currentGuildId, guilds]);

  // Disband Guild
  const disbandGuild = useCallback(async () => {
    const targetId = currentGuildId;
    if (!targetId) return;

    setCurrentGuildId(null);
    await AsyncStorage.removeItem(STORAGE_KEY_USER_GUILD_ID);

    const updated = guilds.filter((g) => g.id !== targetId);
    await saveRegistry(updated);
  }, [currentGuildId, guilds]);

  // Issue 1v1 Duel
  const issueDuel = useCallback(
    async (
      opponentId: string,
      challengeType: DuelChallengeType,
      durationDays: number,
      wagerExp: number
    ): Promise<{ success: boolean; duel: GuildDuel | null }> => {
      if (!currentGuild) return { success: false, duel: null };
      const opponent = currentGuild.members.find((m) => m.id === opponentId);
      if (!opponent) return { success: false, duel: null };

      const typeTitles: Record<DuelChallengeType, string> = {
        most_xp_week: 'EXP Hunter Clash',
        most_workouts: 'Workout Volume Showdown',
        longest_streak: 'Daily Streak Endurance',
        highest_volume: 'Total Volume Heavyweight',
        most_calories: 'Calorie Burn Blitz',
        dungeon_clears: 'Raid Clear Race',
      };

      const newDuel: GuildDuel = {
        id: `duel_${Date.now()}`,
        challengerId: 'current_user_hunter',
        challengerName: 'You (Hunter)',
        challengerAvatar: profilePicture,
        challengerRank: rank,
        challengerProgress: 0,
        opponentId: opponent.id,
        opponentName: opponent.username,
        opponentAvatar: opponent.avatar,
        opponentRank: opponent.rank,
        opponentProgress: 0,
        challengeType,
        challengeTitle: `${typeTitles[challengeType]} (${durationDays} Days)`,
        durationDays,
        daysRemaining: durationDays,
        wagerExp,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          return {
            ...g,
            duels: [newDuel, ...g.duels],
          };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
      return { success: true, duel: newDuel };
    },
    [currentGuild, guilds, profilePicture, rank]
  );

  // Create Guild Challenge
  const createGuildChallenge = useCallback(
    async (
      title: string,
      description: string,
      category: 'workouts' | 'exp' | 'streak' | 'dungeon',
      targetGoal: number,
      days: number,
      rewardExp: number
    ) => {
      if (!currentGuild) return;

      const newChallenge: GuildChallenge = {
        id: `chal_${Date.now()}`,
        title,
        description,
        category,
        targetGoal,
        currentProgress: 0,
        unit: category === 'workouts' ? 'Workouts' : category === 'exp' ? 'EXP' : 'Days',
        daysRemaining: days,
        rewardExp,
        participantsCount: 1,
        participants: [{ memberId: 'current_user_hunter', memberName: 'You', progress: 0 }],
        isJoined: true,
      };

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          return {
            ...g,
            challenges: [newChallenge, ...g.challenges],
          };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
    },
    [currentGuild, guilds]
  );

  // Join Guild Challenge
  const joinGuildChallenge = useCallback(
    async (challengeId: string) => {
      if (!currentGuild) return;

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          const challenges = g.challenges.map((c) => {
            if (c.id === challengeId) {
              const exists = c.participants.some((p) => p.memberId === 'current_user_hunter');
              if (exists) return c;
              return {
                ...c,
                participantsCount: c.participantsCount + 1,
                participants: [...c.participants, { memberId: 'current_user_hunter', memberName: 'You', progress: 0 }],
                isJoined: true,
              };
            }
            return c;
          });
          return { ...g, challenges };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
    },
    [currentGuild, guilds]
  );

  // Accept Join Request
  const acceptJoinRequest = useCallback(
    async (requestId: string) => {
      if (!currentGuild) return;
      const request = currentGuild.joinRequests.find((r) => r.id === requestId);
      if (!request) return;

      const newMember: GuildMember = {
        id: request.userId,
        username: request.username,
        avatar: request.avatar,
        avatarColor: request.avatarColor || '#38B6FF',
        initials: request.initials || 'HN',
        rank: request.rank,
        level: request.level,
        role: 'member',
        monthlyContributionXp: 1200,
        totalWorkoutsCompleted: 35,
        streakDays: 8,
        joinedAt: new Date().toISOString().split('T')[0],
        isOnline: true,
      };

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          const members = [...g.members, newMember];
          const joinRequests = g.joinRequests.filter((r) => r.id !== requestId);
          return {
            ...g,
            members,
            memberCount: members.length,
            joinRequests,
          };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
    },
    [currentGuild, guilds]
  );

  // Decline Join Request
  const declineJoinRequest = useCallback(
    async (requestId: string) => {
      if (!currentGuild) return;

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          return {
            ...g,
            joinRequests: g.joinRequests.filter((r) => r.id !== requestId),
          };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
    },
    [currentGuild, guilds]
  );

  // Kick Member
  const kickMember = useCallback(
    async (memberId: string) => {
      if (!currentGuild) return;

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          const members = g.members.filter((m) => m.id !== memberId);
          return {
            ...g,
            members,
            memberCount: members.length,
          };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
    },
    [currentGuild, guilds]
  );

  // Promote Member
  const promoteMember = useCallback(
    async (memberId: string, role: GuildMemberRole) => {
      if (!currentGuild) return;

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          const members = g.members.map((m) => (m.id === memberId ? { ...m, role } : m));
          return { ...g, members };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
    },
    [currentGuild, guilds]
  );

  // Update Guild Settings
  const updateGuildSettings = useCallback(
    async (updatedFields: Partial<Guild>) => {
      if (!currentGuild) return;

      const updatedGuilds = guilds.map((g) => {
        if (g.id === currentGuild.id) {
          return { ...g, ...updatedFields };
        }
        return g;
      });

      await saveRegistry(updatedGuilds);
    },
    [currentGuild, guilds]
  );

  const refreshGuildData = useCallback(async () => {
    await loadGuildState();
  }, []);

  return (
    <GuildContext.Provider
      value={{
        currentGuild,
        guilds,
        sentRequestGuildIds,
        isLoading,
        joinGuild,
        requestToJoinGuild,
        createGuild,
        leaveGuild,
        disbandGuild,
        issueDuel,
        createGuildChallenge,
        joinGuildChallenge,
        acceptJoinRequest,
        declineJoinRequest,
        kickMember,
        promoteMember,
        updateGuildSettings,
        refreshGuildData,
      }}
    >
      {children}
    </GuildContext.Provider>
  );
}

export function useGuild() {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error('useGuild must be used within a GuildProvider');
  }
  return context;
}
