"use client";

/**
 * zkVault Context Provider
 *
 * Manages state for:
 * - User positions (NFTs)
 * - Pool statistics
 * - Withdrawal/claim requests
 * - Yield calculations
 * - Admin operations
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import type {
  NFTPosition,
  PositionWithYield,
  PoolStats,
  WithdrawalRequest,
  YieldClaimRequest,
  SupportedToken,
  VaultConfig,
  AdminStats,
} from "../types";
import { supabaseClient, adminClient } from "../lib/supabase";

// Vault configuration
const VAULT_CONFIG: VaultConfig = {
  vaultAddress: process.env.NEXT_PUBLIC_VAULT_ADDRESS || "",
  minDeposit: 100, // Minimum $100
  maxDeposit: 100000, // Maximum $100k
  coolingOffPeriod: 48, // 48 hours
  supportedTokens: ["USDC", "USDT"],
  isPaused: false,
};

// Context state type
interface VaultContextState {
  // User data
  positions: NFTPosition[];
  positionsWithYield: PositionWithYield[];
  userWithdrawals: WithdrawalRequest[];
  userClaims: YieldClaimRequest[];

  // Pool data
  poolStats: PoolStats | null;
  vaultConfig: VaultConfig;

  // Admin data
  adminStats: AdminStats | null;
  pendingWithdrawals: WithdrawalRequest[];
  pendingClaims: YieldClaimRequest[];

  // Loading states
  isLoadingPositions: boolean;
  isLoadingStats: boolean;
  isSubmitting: boolean;

  // Actions
  refreshPositions: () => Promise<void>;
  refreshPoolStats: () => Promise<void>;
  refreshAdminData: () => Promise<void>;

  // User actions
  submitWithdrawal: (nftId: string, includeYield: boolean) => Promise<boolean>;
  submitClaim: (nftId: string, amount?: number) => Promise<boolean>;

  // Admin actions
  approveWithdrawal: (requestId: string) => Promise<boolean>;
  rejectWithdrawal: (requestId: string, reason: string) => Promise<boolean>;
  executeWithdrawal: (requestId: string, txSignature: string) => Promise<boolean>;
  approveClaim: (claimId: string) => Promise<boolean>;
  executeClaim: (claimId: string, txSignature: string) => Promise<boolean>;

  // Utilities
  calculateYield: (position: NFTPosition) => number;
  calculateTotalValue: (position: NFTPosition) => number;
  formatAmount: (amount: number, token: SupportedToken) => string;
}

const VaultContext = createContext<VaultContextState | undefined>(undefined);

// Calculate accrued yield for a position
function calculateAccruedYield(position: NFTPosition, currentYieldIndex: number): number {
  const indexDifference = currentYieldIndex - position.initialYieldIndex;
  return position.depositAmount * indexDifference;
}

// Calculate days held
function calculateDaysHeld(depositTimestamp: number): number {
  const now = Date.now();
  const diff = now - depositTimestamp;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Calculate estimated APR
function calculateEstimatedApr(
  position: NFTPosition,
  currentYieldIndex: number,
  daysHeld: number
): number {
  if (daysHeld === 0) return 0;
  const totalYield = calculateAccruedYield(position, currentYieldIndex);
  const yieldPercentage = totalYield / position.depositAmount;
  const annualizedYield = (yieldPercentage / daysHeld) * 365;
  return annualizedYield * 100; // Convert to percentage
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAppKitAccount();

  // User state
  const [positions, setPositions] = useState<NFTPosition[]>([]);
  const [positionsWithYield, setPositionsWithYield] = useState<PositionWithYield[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [userClaims, setUserClaims] = useState<YieldClaimRequest[]>([]);

  // Pool state
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);

  // Admin state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [pendingClaims, setPendingClaims] = useState<YieldClaimRequest[]>([]);

  // Loading states
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refresh user positions
  const refreshPositions = useCallback(async () => {
    if (!isConnected || !address) {
      setPositions([]);
      setPositionsWithYield([]);
      return;
    }

    setIsLoadingPositions(true);
    try {
      // Fetch positions from Supabase
      const userPositions = await supabaseClient.getPositions(address);
      setPositions(userPositions);

      // Fetch pool stats for yield calculation
      const stats = await supabaseClient.getPoolStats();

      // Calculate positions with yield
      const withYield: PositionWithYield[] = userPositions.map((pos) => {
        const accruedYield = calculateAccruedYield(pos, stats.currentYieldIndex);
        const daysHeld = calculateDaysHeld(pos.depositTimestamp);
        return {
          ...pos,
          accruedYield,
          totalValue: pos.depositAmount + accruedYield,
          timeHeld: daysHeld,
          estimatedApr: calculateEstimatedApr(pos, stats.currentYieldIndex, daysHeld),
        };
      });

      setPositionsWithYield(withYield);

      // Fetch user's withdrawal requests and claims
      const [withdrawals, claims] = await Promise.all([
        supabaseClient.getWithdrawals(address),
        supabaseClient.getClaims(address),
      ]);

      setUserWithdrawals(withdrawals);
      setUserClaims(claims);
    } catch (error) {
      console.error("Failed to refresh positions:", error);
    } finally {
      setIsLoadingPositions(false);
    }
  }, [isConnected, address]);

  // Refresh pool stats
  const refreshPoolStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const stats = await supabaseClient.getPoolStats();
      setPoolStats(stats);
    } catch (error) {
      console.error("Failed to refresh pool stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Refresh admin data
  const refreshAdminData = useCallback(async () => {
    try {
      const { withdrawals, claims, total } = await adminClient.getAllPendingRequests();
      setPendingWithdrawals(withdrawals);
      setPendingClaims(claims);

      const totalPendingAmount = withdrawals.reduce((sum, w) => sum + w.totalAmount, 0) +
        claims.reduce((sum, c) => sum + c.claimAmount, 0);

      setAdminStats({
        pendingWithdrawals: withdrawals.length,
        pendingClaims: claims.length,
        totalPendingAmount,
        recentActivity: [],
      });
    } catch (error) {
      console.error("Failed to refresh admin data:", error);
    }
  }, []);

  // Submit withdrawal request
  const submitWithdrawal = useCallback(async (
    nftId: string,
    includeYield: boolean
  ): Promise<boolean> => {
    if (!address) return false;

    setIsSubmitting(true);
    try {
      const position = positions.find((p) => p.id === nftId);
      if (!position) throw new Error("Position not found");

      const yieldAmount = includeYield
        ? calculateAccruedYield(position, poolStats?.currentYieldIndex || position.initialYieldIndex)
        : 0;

      const request: Omit<WithdrawalRequest, "id"> = {
        nftId,
        owner: address,
        amount: position.depositAmount,
        yieldAmount,
        totalAmount: position.depositAmount + yieldAmount,
        token: position.token,
        status: "cooling_off",
        submittedAt: Date.now(),
        coolingOffEndAt: Date.now() + VAULT_CONFIG.coolingOffPeriod * 60 * 60 * 1000,
      };

      await supabaseClient.createWithdrawal(request);
      await refreshPositions();
      return true;
    } catch (error) {
      console.error("Failed to submit withdrawal:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [address, positions, poolStats, refreshPositions]);

  // Submit yield claim
  const submitClaim = useCallback(async (
    nftId: string,
    amount?: number
  ): Promise<boolean> => {
    if (!address) return false;

    setIsSubmitting(true);
    try {
      const position = positions.find((p) => p.id === nftId);
      if (!position) throw new Error("Position not found");

      const claimAmount = amount || calculateAccruedYield(
        position,
        poolStats?.currentYieldIndex || position.initialYieldIndex
      );

      const request: Omit<YieldClaimRequest, "id"> = {
        nftId,
        owner: address,
        claimAmount,
        token: position.token,
        status: "pending",
        submittedAt: Date.now(),
      };

      await supabaseClient.createClaim(request);
      await refreshPositions();
      return true;
    } catch (error) {
      console.error("Failed to submit claim:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [address, positions, poolStats, refreshPositions]);

  // Admin: Approve withdrawal
  const approveWithdrawal = useCallback(async (requestId: string): Promise<boolean> => {
    if (!address) return false;
    try {
      const success = await adminClient.approveWithdrawal(requestId, address);
      if (success) await refreshAdminData();
      return success;
    } catch (error) {
      console.error("Failed to approve withdrawal:", error);
      return false;
    }
  }, [address, refreshAdminData]);

  // Admin: Reject withdrawal
  const rejectWithdrawal = useCallback(async (
    requestId: string,
    reason: string
  ): Promise<boolean> => {
    if (!address) return false;
    try {
      const success = await adminClient.rejectWithdrawal(requestId, address, reason);
      if (success) await refreshAdminData();
      return success;
    } catch (error) {
      console.error("Failed to reject withdrawal:", error);
      return false;
    }
  }, [address, refreshAdminData]);

  // Admin: Execute withdrawal
  const executeWithdrawal = useCallback(async (
    requestId: string,
    txSignature: string
  ): Promise<boolean> => {
    try {
      const success = await adminClient.executeWithdrawal(requestId, txSignature);
      if (success) await refreshAdminData();
      return success;
    } catch (error) {
      console.error("Failed to execute withdrawal:", error);
      return false;
    }
  }, [refreshAdminData]);

  // Admin: Approve claim
  const approveClaim = useCallback(async (claimId: string): Promise<boolean> => {
    if (!address) return false;
    try {
      const success = await adminClient.approveClaim(claimId, address);
      if (success) await refreshAdminData();
      return success;
    } catch (error) {
      console.error("Failed to approve claim:", error);
      return false;
    }
  }, [address, refreshAdminData]);

  // Admin: Execute claim
  const executeClaim = useCallback(async (
    claimId: string,
    txSignature: string
  ): Promise<boolean> => {
    try {
      const success = await adminClient.executeClaim(claimId, txSignature);
      if (success) await refreshAdminData();
      return success;
    } catch (error) {
      console.error("Failed to execute claim:", error);
      return false;
    }
  }, [refreshAdminData]);

  // Utility: Calculate yield for a position
  const calculateYield = useCallback((position: NFTPosition): number => {
    return calculateAccruedYield(position, poolStats?.currentYieldIndex || position.initialYieldIndex);
  }, [poolStats]);

  // Utility: Calculate total value
  const calculateTotalValue = useCallback((position: NFTPosition): number => {
    const yield_ = calculateYield(position);
    return position.depositAmount + yield_;
  }, [calculateYield]);

  // Utility: Format amount
  const formatAmount = useCallback((amount: number, token: SupportedToken): string => {
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: token === "USDC" || token === "USDT" ? 2 : 6,
    })} ${token}`;
  }, []);

  // Initial load
  useEffect(() => {
    refreshPoolStats();
  }, [refreshPoolStats]);

  // Load user data when connected
  useEffect(() => {
    if (isConnected && address) {
      refreshPositions();
    }
  }, [isConnected, address, refreshPositions]);

  const value: VaultContextState = {
    positions,
    positionsWithYield,
    userWithdrawals,
    userClaims,
    poolStats,
    vaultConfig: VAULT_CONFIG,
    adminStats,
    pendingWithdrawals,
    pendingClaims,
    isLoadingPositions,
    isLoadingStats,
    isSubmitting,
    refreshPositions,
    refreshPoolStats,
    refreshAdminData,
    submitWithdrawal,
    submitClaim,
    approveWithdrawal,
    rejectWithdrawal,
    executeWithdrawal,
    approveClaim,
    executeClaim,
    calculateYield,
    calculateTotalValue,
    formatAmount,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
