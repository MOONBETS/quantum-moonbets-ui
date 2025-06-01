import { BN, web3 } from "@coral-xyz/anchor";

export interface DailyWithdrawal {
  date: BN;    // i64 in Rust
  amount: BN;  // u64 in Rust
}

export interface PlatformStats {
  isInitialized: boolean;
  lastReset: BN;
  withdrawnToday: BN;
  primaryAdmin: web3.PublicKey;
  adminCount: number;
  totalBets: BN;
  totalVolume: BN;
  totalUsers: BN;
  dailyWithdrawal: DailyWithdrawal;
  totalProfit: BN;
  totalOwed: BN;
  currentActiveUsers: BN;
  maxBetLamports: BN;
  dailyWithdrawLimit: BN;
}


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