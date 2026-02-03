/**
 * zkVault - NFT-Based Lending Vault Types
 *
 * Type definitions for the lending vault system including:
 * - NFT Positions with metadata
 * - Deposit/Withdrawal/Claim requests
 * - Yield calculation types
 * - Admin management types
 */

// Supported tokens for lending
export type SupportedToken = "USDC" | "USDT";

export interface TokenInfo {
  symbol: SupportedToken;
  name: string;
  mint: string;
  decimals: number;
  color: string;
}

export const SUPPORTED_TOKENS: TokenInfo[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    color: "#2775CA",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    color: "#26A17B",
  },
];

// NFT Position Metadata
export interface NFTPosition {
  id: string; // NFT mint address
  owner: string; // Lender wallet address
  depositAmount: number; // Principal amount
  token: SupportedToken;
  depositTimestamp: number; // Unix timestamp
  initialYieldIndex: number; // Yield index at deposit time
  currentYieldIndex: number; // Current yield index
  status: "active" | "withdrawal_pending" | "withdrawn" | "claimed";
  metadataUri?: string; // URI to NFT metadata
  transactionSignature: string; // Deposit tx signature
}

// Calculated position with yield
export interface PositionWithYield extends NFTPosition {
  accruedYield: number;
  totalValue: number; // Principal + accrued yield
  timeHeld: number; // Days
  estimatedApr: number; // Current APR based on pool performance
}

// Withdrawal Request Status
export type WithdrawalStatus = "pending" | "cooling_off" | "approved" | "rejected" | "executed";

// Withdrawal Request
export interface WithdrawalRequest {
  id: string;
  nftId: string;
  owner: string;
  amount: number; // Principal amount
  yieldAmount: number; // Yield to claim (optional)
  totalAmount: number; // Total to receive
  token: SupportedToken;
  status: WithdrawalStatus;
  submittedAt: number;
  coolingOffEndAt: number; // 48 hours after submission
  reviewedAt?: number;
  reviewedBy?: string;
  executedAt?: number;
  executionTx?: string;
  rejectionReason?: string;
}

// Yield Claim Request
export interface YieldClaimRequest {
  id: string;
  nftId: string;
  owner: string;
  claimAmount: number;
  token: SupportedToken;
  status: "pending" | "approved" | "rejected" | "executed";
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  executedAt?: number;
  executionTx?: string;
}

// Pool Statistics
export interface PoolStats {
  totalValueLocked: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activePositions: number;
  currentYieldIndex: number;
  baseApr: number; // Base APR set by admin
  utilizationRate: number; // Percentage of funds lent out
  availableLiquidity: number;
  lastUpdated: number;
}

// Admin Request (combined type for admin dashboard)
export interface AdminRequest {
  id: string;
  type: "withdrawal" | "yield_claim";
  status: WithdrawalStatus | "pending" | "approved" | "rejected" | "executed";
  submittedAt: number;
  user: string;
  nftId: string;
  amount: number;
  token: SupportedToken;
  coolingOffEndAt?: number;
  metadata?: WithdrawalRequest | YieldClaimRequest;
}

// Vault Configuration
export interface VaultConfig {
  vaultAddress: string; // Multisig-controlled vault wallet
  minDeposit: number;
  maxDeposit: number;
  coolingOffPeriod: number; // Hours (48)
  supportedTokens: SupportedToken[];
  isPaused: boolean;
}

// Deposit Form State
export interface DepositFormState {
  token: SupportedToken | null;
  amount: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  txSignature?: string;
}

// Notification Types
export type NotificationType = "deposit" | "withdrawal_submitted" | "withdrawal_approved" | "withdrawal_executed" | "yield_claimed" | "yield_executed";

export interface Notification {
  id: string;
  type: NotificationType;
  user: string;
  message: string;
  sentAt: number;
  channel: "email" | "sms" | "both";
  status: "pending" | "sent" | "failed";
}

// Tab types for navigation
export type VaultTab = "deposit" | "status" | "withdraw" | "claim" | "admin";

// Admin Stats
export interface AdminStats {
  pendingWithdrawals: number;
  pendingClaims: number;
  totalPendingAmount: number;
  recentActivity: AdminRequest[];
}
