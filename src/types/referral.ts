export interface ReferredHunter {
  id: string;
  code: string;
  name: string;
  rankTier?: string;
  joinedAt: string;
  avatar?: string | null;
  rewardClaimed: boolean;
  rewardExp: number;
}

export interface ReferralState {
  myReferralCode: string;
  referralLink: string;
  referredHunters: ReferredHunter[];
  totalExpEarned: number;
  redeemedCode: string | null;
  redeemedAt: string | null;
}

export interface RedeemResult {
  success: boolean;
  message: string;
  expReward?: number;
}
