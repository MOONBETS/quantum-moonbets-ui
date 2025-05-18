import { BN, web3 } from "@coral-xyz/anchor";

export interface PlatformStats {
  isInitialized: boolean;
  lastReset: BN;
  withdrawnToday: BN;
  primaryAdmin: web3.PublicKey;
  adminCount: number;
};

export interface Player {
  lastResult: number;
  currentBet: number;
  lastBetAmount: BN;
  pendingWithdrawal: BN;
  wins: number;
  losses: number;
  totalGames: number;
}

export interface Admin {
  pubkey: web3.PublicKey;
  isActive: boolean;
}