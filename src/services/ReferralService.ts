import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReferralState, ReferredHunter, RedeemResult } from '../types/referral';

const REFERRAL_STORAGE_KEY = '@arise_referral_state_v1';
const REFERRAL_BASE_URL = 'https://arise.app/invite';
const REFERRAL_BONUS_EXP = 250;

function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ARISE-${result}`;
}

export class ReferralService {
  private static cachedState: ReferralState | null = null;

  static async getReferralState(): Promise<ReferralState> {
    if (this.cachedState) {
      return this.cachedState;
    }

    try {
      const raw = await AsyncStorage.getItem(REFERRAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.cachedState = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load referral state from storage', e);
    }

    // Initialize fresh state
    const myCode = generateRandomCode();
    const initialState: ReferralState = {
      myReferralCode: myCode,
      referralLink: `${REFERRAL_BASE_URL}/${myCode}`,
      referredHunters: [],
      totalExpEarned: 0,
      redeemedCode: null,
      redeemedAt: null,
    };

    await this.saveReferralState(initialState);
    return initialState;
  }

  static async saveReferralState(state: ReferralState): Promise<void> {
    this.cachedState = state;
    try {
      await AsyncStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save referral state', e);
    }
  }

  static async redeemCode(inputCode: string): Promise<RedeemResult> {
    const state = await this.getReferralState();
    const sanitized = inputCode.trim().toUpperCase();

    if (!sanitized || sanitized.length < 4) {
      return {
        success: false,
        message: 'Please enter a valid referral code.',
      };
    }

    // 1. Prevent self-referral
    if (sanitized === state.myReferralCode.toUpperCase()) {
      return {
        success: false,
        message: 'You cannot use your own referral code.',
      };
    }

    // 2. Prevent multiple redemptions
    if (state.redeemedCode) {
      return {
        success: false,
        message: `You have already redeemed referral code ${state.redeemedCode}.`,
      };
    }

    // 3. Basic code validation pattern check (e.g. ARISE-XXXXX or similar alphanumeric)
    const isValidFormat = /^[A-Z0-9_-]{4,16}$/.test(sanitized);
    if (!isValidFormat) {
      return {
        success: false,
        message: 'Invalid referral code format. Please check the code and try again.',
      };
    }

    // 4. Successfully redeem
    const updatedState: ReferralState = {
      ...state,
      redeemedCode: sanitized,
      redeemedAt: new Date().toISOString(),
      totalExpEarned: state.totalExpEarned + REFERRAL_BONUS_EXP,
    };

    await this.saveReferralState(updatedState);

    return {
      success: true,
      message: `Referral code ${sanitized} redeemed successfully! +${REFERRAL_BONUS_EXP} EXP received.`,
      expReward: REFERRAL_BONUS_EXP,
    };
  }

  static async simulateFriendJoined(friendName: string): Promise<ReferredHunter> {
    const state = await this.getReferralState();
    const newHunter: ReferredHunter = {
      id: `hunter_${Date.now()}`,
      code: state.myReferralCode,
      name: friendName,
      rankTier: 'E-Rank',
      joinedAt: new Date().toISOString(),
      rewardClaimed: true,
      rewardExp: REFERRAL_BONUS_EXP,
    };

    const updatedState: ReferralState = {
      ...state,
      referredHunters: [newHunter, ...state.referredHunters],
      totalExpEarned: state.totalExpEarned + REFERRAL_BONUS_EXP,
    };

    await this.saveReferralState(updatedState);
    return newHunter;
  }
}
