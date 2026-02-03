"use client";

/**
 * Admin Section
 *
 * Admin dashboard to:
 * - View pending withdrawal requests
 * - View pending yield claims
 * - Approve/reject requests
 * - Execute disbursements via multisig
 * - Monitor pool liquidity
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  AlertCircle,
  ExternalLink,
  Wallet,
  TrendingUp,
  ArrowLeftRight,
  Coins,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVault } from "../context/vault-context";
import type { WithdrawalRequest, YieldClaimRequest } from "../types";

// Mock admin addresses - in production, this would be checked against on-chain multisig
const ADMIN_ADDRESSES = [
  "admin1",
  // Add more admin addresses as needed
];

function WithdrawalRequestItem({
  request,
  onApprove,
  onReject,
  onExecute,
  isProcessing,
}: {
  request: WithdrawalRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onExecute: (id: string) => void;
  isProcessing: boolean;
}) {
  const { formatAmount } = useVault();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const now = Date.now();
  const canApprove = request.status === "cooling_off" && now >= request.coolingOffEndAt;
  const isApproved = request.status === "approved";
  const isExecuted = request.status === "executed";
  const isRejected = request.status === "rejected";

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(request.id, rejectReason);
      setShowRejectForm(false);
      setRejectReason("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-muted/30 border border-border/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-foreground">
              Position #{request.nftId.slice(-6).toUpperCase()}
            </span>
            <Badge
              variant="outline"
              className={
                request.status === "cooling_off"
                  ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
                  : request.status === "approved"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : request.status === "rejected"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-muted text-muted-foreground border-border"
              }
            >
              {request.status === "cooling_off" ? "Cooling Off" : request.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{request.owner}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-semibold">
            {formatAmount(request.totalAmount, request.token)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatAmount(request.amount, request.token)} principal
            {request.yieldAmount > 0 && ` + ${formatAmount(request.yieldAmount, request.token)} yield`}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Clock className="w-3.5 h-3.5" />
        <span>Submitted {new Date(request.submittedAt).toLocaleString()}</span>
        {request.coolingOffEndAt > now && (
          <>
            <span>•</span>
            <span className="text-cyan-500">
              Cooling off until {new Date(request.coolingOffEndAt).toLocaleString()}
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      {!isExecuted && !isRejected && (
        <div className="flex items-center gap-2 mt-3">
          {canApprove && !isApproved && (
            <Button
              size="sm"
              onClick={() => onApprove(request.id)}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          )}
          {isApproved && (
            <Button
              size="sm"
              onClick={() => onExecute(request.id)}
              disabled={isProcessing}
              className="bg-accent hover:bg-accent/90"
            >
              <Wallet className="w-4 h-4 mr-1" />
              Execute Payout
            </Button>
          )}
          {!isApproved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          )}
        </div>
      )}

      {/* Reject Form */}
      {showRejectForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full p-2 rounded bg-background border border-border text-sm resize-none"
            rows={2}
          />
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={handleReject} disabled={!rejectReason.trim()}>
              Confirm Reject
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Rejection Reason Display */}
      {isRejected && request.rejectionReason && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">
            <span className="font-semibold">Rejection Reason:</span> {request.rejectionReason}
          </p>
        </div>
      )}

      {/* Execution Details */}
      {isExecuted && request.executionTx && (
        <div className="mt-3">
          <a
            href={`https://explorer.solana.com/tx/${request.executionTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View Execution Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

function ClaimRequestItem({
  request,
  onApprove,
  onExecute,
  isProcessing,
}: {
  request: YieldClaimRequest;
  onApprove: (id: string) => void;
  onExecute: (id: string) => void;
  isProcessing: boolean;
}) {
  const { formatAmount } = useVault();

  const isApproved = request.status === "approved";
  const isExecuted = request.status === "executed";
  const isRejected = request.status === "rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-muted/30 border border-border/30"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-foreground">
              Position #{request.nftId.slice(-6).toUpperCase()}
            </span>
            <Badge
              variant="outline"
              className={
                request.status === "pending"
                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                  : request.status === "approved"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : request.status === "rejected"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-muted text-muted-foreground border-border"
              }
            >
              {request.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{request.owner}</p>
          <p className="text-xs text-muted-foreground">
            Submitted {new Date(request.submittedAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-semibold text-primary">
            +{formatAmount(request.claimAmount, request.token)}
          </div>
          <div className="text-xs text-muted-foreground">Yield Claim</div>
        </div>
      </div>

      {/* Actions */}
      {!isExecuted && !isRejected && (
        <div className="flex items-center gap-2 mt-3">
          {!isApproved && (
            <Button
              size="sm"
              onClick={() => onApprove(request.id)}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          )}
          {isApproved && (
            <Button
              size="sm"
              onClick={() => onExecute(request.id)}
              disabled={isProcessing}
              className="bg-accent hover:bg-accent/90"
            >
              <Wallet className="w-4 h-4 mr-1" />
              Execute Payout
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function AdminSection() {
  const {
    poolStats,
    pendingWithdrawals,
    pendingClaims,
    refreshAdminData,
    approveWithdrawal,
    rejectWithdrawal,
    executeWithdrawal,
    approveClaim,
    executeClaim,
    formatAmount,
  } = useVault();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("withdrawals");

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      // In production, this would verify the wallet address against the multisig
      // For demo, we'll set to true to show the admin interface
      setIsAdmin(true);
      setIsChecking(false);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      refreshAdminData();
    }
  }, [isAdmin, refreshAdminData]);

  const handleApproveWithdrawal = async (id: string) => {
    setProcessingId(id);
    await approveWithdrawal(id);
    setProcessingId(null);
  };

  const handleRejectWithdrawal = async (id: string, reason: string) => {
    setProcessingId(id);
    await rejectWithdrawal(id, reason);
    setProcessingId(null);
  };

  const handleExecuteWithdrawal = async (id: string) => {
    setProcessingId(id);
    // In production, this would trigger the multisig transaction
    const mockTx = "mock_exec_" + Math.random().toString(36).substr(2, 16);
    await executeWithdrawal(id, mockTx);
    setProcessingId(null);
  };

  const handleApproveClaim = async (id: string) => {
    setProcessingId(id);
    await approveClaim(id);
    setProcessingId(null);
  };

  const handleExecuteClaim = async (id: string) => {
    setProcessingId(id);
    // In production, this would trigger the multisig transaction
    const mockTx = "mock_exec_" + Math.random().toString(36).substr(2, 16);
    await executeClaim(id, mockTx);
    setProcessingId(null);
  };

  if (isChecking) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-mono">Verifying admin access...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Access Denied</h3>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have admin privileges. This area is restricted to multisig signers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalPendingWithdrawals = pendingWithdrawals.reduce((sum, w) => sum + w.totalAmount, 0);
  const totalPendingClaims = pendingClaims.reduce((sum, c) => sum + c.claimAmount, 0);
  const totalPending = totalPendingWithdrawals + totalPendingClaims;

  // Check liquidity
  const hasEnoughLiquidity = poolStats ? poolStats.availableLiquidity >= totalPending : false;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <Shield className="w-5 h-5 text-primary" />
              Admin Overview
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={refreshAdminData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Pending Withdrawals
              </div>
              <div className="text-2xl font-mono font-semibold">
                {pendingWithdrawals.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Coins className="w-3.5 h-3.5" />
                Pending Claims
              </div>
              <div className="text-2xl font-mono font-semibold">
                {pendingClaims.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Total Pending
              </div>
              <div className="text-2xl font-mono font-semibold">
                {formatAmount(totalPending, "USDC")}
              </div>
            </div>
            <div
              className={`p-4 rounded-xl border ${
                hasEnoughLiquidity
                  ? "bg-primary/5 border-primary/20"
                  : "bg-destructive/5 border-destructive/20"
              }`}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Wallet className="w-3.5 h-3.5" />
                Available Liquidity
              </div>
              <div
                className={`text-2xl font-mono font-semibold ${
                  hasEnoughLiquidity ? "text-primary" : "text-destructive"
                }`}
              >
                {poolStats ? formatAmount(poolStats.availableLiquidity, "USDC") : "-"}
              </div>
            </div>
          </div>

          {!hasEnoughLiquidity && totalPending > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-destructive font-semibold">Insufficient Liquidity</p>
                <p className="text-xs text-destructive/80 mt-1">
                  The vault does not have enough available liquidity to cover all pending requests.
                  Some approvals may need to wait until funds are available.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            Withdrawals
            {pendingWithdrawals.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingWithdrawals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Yield Claims
            {pendingClaims.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingClaims.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="mt-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-mono">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
                Pending Withdrawal Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingWithdrawals.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    No Pending Withdrawals
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All withdrawal requests have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingWithdrawals.map((request) => (
                    <WithdrawalRequestItem
                      key={request.id}
                      request={request}
                      onApprove={handleApproveWithdrawal}
                      onReject={handleRejectWithdrawal}
                      onExecute={handleExecuteWithdrawal}
                      isProcessing={processingId === request.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-mono">
                <Coins className="w-5 h-5 text-primary" />
                Pending Yield Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingClaims.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    No Pending Claims
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All yield claims have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingClaims.map((request) => (
                    <ClaimRequestItem
                      key={request.id}
                      request={request}
                      onApprove={handleApproveClaim}
                      onExecute={handleExecuteClaim}
                      isProcessing={processingId === request.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Notes */}
      <div className="p-4 rounded-xl bg-muted/20 border border-border/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Admin Guidelines</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Only approve requests after the {48}-hour cooling-off period</li>
            <li>Verify liquidity is available before approving</li>
            <li>All disbursements require multisig execution</li>
            <li>Document rejection reasons for transparency</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
