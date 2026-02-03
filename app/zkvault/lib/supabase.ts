/**
 * zkVault Supabase Client
 *
 * Client-side Supabase integration for:
 * - Storing withdrawal requests
 * - Storing yield claim requests
 * - Tracking request status
 * - Admin operations
 */

import type {
  WithdrawalRequest,
  YieldClaimRequest,
  NFTPosition,
  PoolStats,
  VaultConfig,
} from "../types";

// Supabase configuration - to be set via environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Database table names
export const TABLES = {
  POSITIONS: "vault_positions",
  WITHDRAWAL_REQUESTS: "withdrawal_requests",
  YIELD_CLAIMS: "yield_claims",
  POOL_STATS: "pool_stats",
  VAULT_CONFIG: "vault_config",
  ADMIN_LOGS: "admin_logs",
} as const;

// Mock storage for development/demo (when Supabase is not configured)
class MockStorage {
  private positions: NFTPosition[] = [];
  private withdrawals: WithdrawalRequest[] = [];
  private claims: YieldClaimRequest[] = [];
  private poolStats: PoolStats = {
    totalValueLocked: 1250000,
    totalDeposits: 2500000,
    totalWithdrawals: 1250000,
    activePositions: 47,
    currentYieldIndex: 1.085,
    baseApr: 12.5,
    utilizationRate: 78.5,
    availableLiquidity: 267500,
    lastUpdated: Date.now(),
  };

  // Positions
  async getPositions(owner: string): Promise<NFTPosition[]> {
    return this.positions.filter((p) => p.owner === owner);
  }

  async getPosition(nftId: string): Promise<NFTPosition | null> {
    return this.positions.find((p) => p.id === nftId) || null;
  }

  async savePosition(position: NFTPosition): Promise<void> {
    const existing = this.positions.findIndex((p) => p.id === position.id);
    if (existing >= 0) {
      this.positions[existing] = position;
    } else {
      this.positions.push(position);
    }
  }

  // Withdrawals
  async createWithdrawal(request: Omit<WithdrawalRequest, "id">): Promise<WithdrawalRequest> {
    const newRequest: WithdrawalRequest = {
      ...request,
      id: `wd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.withdrawals.push(newRequest);
    return newRequest;
  }

  async getWithdrawals(owner: string): Promise<WithdrawalRequest[]> {
    return this.withdrawals.filter((w) => w.owner === owner);
  }

  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    return this.withdrawals.filter((w) => w.status === "pending" || w.status === "cooling_off");
  }

  async updateWithdrawal(id: string, updates: Partial<WithdrawalRequest>): Promise<void> {
    const index = this.withdrawals.findIndex((w) => w.id === id);
    if (index >= 0) {
      this.withdrawals[index] = { ...this.withdrawals[index], ...updates };
    }
  }

  // Claims
  async createClaim(request: Omit<YieldClaimRequest, "id">): Promise<YieldClaimRequest> {
    const newRequest: YieldClaimRequest = {
      ...request,
      id: `yc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.claims.push(newRequest);
    return newRequest;
  }

  async getClaims(owner: string): Promise<YieldClaimRequest[]> {
    return this.claims.filter((c) => c.owner === owner);
  }

  async getPendingClaims(): Promise<YieldClaimRequest[]> {
    return this.claims.filter((c) => c.status === "pending");
  }

  async updateClaim(id: string, updates: Partial<YieldClaimRequest>): Promise<void> {
    const index = this.claims.findIndex((c) => c.id === id);
    if (index >= 0) {
      this.claims[index] = { ...this.claims[index], ...updates };
    }
  }

  // Pool Stats
  async getPoolStats(): Promise<PoolStats> {
    return this.poolStats;
  }

  async updatePoolStats(updates: Partial<PoolStats>): Promise<void> {
    this.poolStats = { ...this.poolStats, ...updates, lastUpdated: Date.now() };
  }
}

// Initialize mock storage
const mockStorage = new MockStorage();

// Check if Supabase is configured
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

// Supabase client functions
export const supabaseClient = {
  // Positions
  async getPositions(owner: string): Promise<NFTPosition[]> {
    if (!isSupabaseConfigured) {
      return mockStorage.getPositions(owner);
    }
    // TODO: Implement actual Supabase query
    return mockStorage.getPositions(owner);
  },

  async getPosition(nftId: string): Promise<NFTPosition | null> {
    if (!isSupabaseConfigured) {
      return mockStorage.getPosition(nftId);
    }
    return mockStorage.getPosition(nftId);
  },

  async savePosition(position: NFTPosition): Promise<void> {
    if (!isSupabaseConfigured) {
      return mockStorage.savePosition(position);
    }
    return mockStorage.savePosition(position);
  },

  // Withdrawal Requests
  async createWithdrawal(request: Omit<WithdrawalRequest, "id">): Promise<WithdrawalRequest> {
    if (!isSupabaseConfigured) {
      return mockStorage.createWithdrawal(request);
    }
    return mockStorage.createWithdrawal(request);
  },

  async getWithdrawals(owner: string): Promise<WithdrawalRequest[]> {
    if (!isSupabaseConfigured) {
      return mockStorage.getWithdrawals(owner);
    }
    return mockStorage.getWithdrawals(owner);
  },

  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    if (!isSupabaseConfigured) {
      return mockStorage.getPendingWithdrawals();
    }
    return mockStorage.getPendingWithdrawals();
  },

  async updateWithdrawal(id: string, updates: Partial<WithdrawalRequest>): Promise<void> {
    if (!isSupabaseConfigured) {
      return mockStorage.updateWithdrawal(id, updates);
    }
    return mockStorage.updateWithdrawal(id, updates);
  },

  // Yield Claims
  async createClaim(request: Omit<YieldClaimRequest, "id">): Promise<YieldClaimRequest> {
    if (!isSupabaseConfigured) {
      return mockStorage.createClaim(request);
    }
    return mockStorage.createClaim(request);
  },

  async getClaims(owner: string): Promise<YieldClaimRequest[]> {
    if (!isSupabaseConfigured) {
      return mockStorage.getClaims(owner);
    }
    return mockStorage.getClaims(owner);
  },

  async getPendingClaims(): Promise<YieldClaimRequest[]> {
    if (!isSupabaseConfigured) {
      return mockStorage.getPendingClaims();
    }
    return mockStorage.getPendingClaims();
  },

  async updateClaim(id: string, updates: Partial<YieldClaimRequest>): Promise<void> {
    if (!isSupabaseConfigured) {
      return mockStorage.updateClaim(id, updates);
    }
    return mockStorage.updateClaim(id, updates);
  },

  // Pool Stats
  async getPoolStats(): Promise<PoolStats> {
    if (!isSupabaseConfigured) {
      return mockStorage.getPoolStats();
    }
    return mockStorage.getPoolStats();
  },

  async updatePoolStats(updates: Partial<PoolStats>): Promise<void> {
    if (!isSupabaseConfigured) {
      return mockStorage.updatePoolStats(updates);
    }
    return mockStorage.updatePoolStats(updates);
  },
};

// Admin functions (require authentication)
export const adminClient = {
  async approveWithdrawal(
    requestId: string,
    adminAddress: string
  ): Promise<boolean> {
    try {
      await supabaseClient.updateWithdrawal(requestId, {
        status: "approved",
        reviewedAt: Date.now(),
        reviewedBy: adminAddress,
      });
      return true;
    } catch {
      return false;
    }
  },

  async rejectWithdrawal(
    requestId: string,
    adminAddress: string,
    reason: string
  ): Promise<boolean> {
    try {
      await supabaseClient.updateWithdrawal(requestId, {
        status: "rejected",
        reviewedAt: Date.now(),
        reviewedBy: adminAddress,
        rejectionReason: reason,
      });
      return true;
    } catch {
      return false;
    }
  },

  async executeWithdrawal(
    requestId: string,
    txSignature: string
  ): Promise<boolean> {
    try {
      await supabaseClient.updateWithdrawal(requestId, {
        status: "executed",
        executedAt: Date.now(),
        executionTx: txSignature,
      });
      return true;
    } catch {
      return false;
    }
  },

  async approveClaim(
    claimId: string,
    adminAddress: string
  ): Promise<boolean> {
    try {
      await supabaseClient.updateClaim(claimId, {
        status: "approved",
        reviewedAt: Date.now(),
        reviewedBy: adminAddress,
      });
      return true;
    } catch {
      return false;
    }
  },

  async executeClaim(
    claimId: string,
    txSignature: string
  ): Promise<boolean> {
    try {
      await supabaseClient.updateClaim(claimId, {
        status: "executed",
        executedAt: Date.now(),
        executionTx: txSignature,
      });
      return true;
    } catch {
      return false;
    }
  },

  async getAllPendingRequests() {
    const [withdrawals, claims] = await Promise.all([
      supabaseClient.getPendingWithdrawals(),
      supabaseClient.getPendingClaims(),
    ]);

    return {
      withdrawals,
      claims,
      total: withdrawals.length + claims.length,
    };
  },
};

export default supabaseClient;
