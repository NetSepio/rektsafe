"use client";

/**
 * Claim Yield Section
 *
 * Allows users to:
 * - View accrued yield on their positions
 * - Submit yield-only claims (without withdrawing principal)
 * - Track claim request status
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ImageIcon,
  ExternalLink,
  Info,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVault } from "../context/vault-context";
import type { NFTPosition, YieldClaimRequest } from "../types";

function ClaimRequestCard({ request }: { request: YieldClaimRequest }) {
  const { formatAmount } = useVault();

  const statusConfig = {
    pending: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Pending Review" },
    approved: { color: "bg-primary/10 text-primary border-primary/30", label: "Approved" },
    rejected: { color: "bg-destructive/10 text-destructive border-destructive/30", label: "Rejected" },
    executed: { color: "bg-muted text-muted-foreground border-border", label: "Completed" },
  };

  const status = statusConfig[request.status];

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
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
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

      {/* Execution Details */}
      {request.status === "executed" && request.executionTx && (
        <div className="mt-3 pt-3 border-t border-border/30">
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

function PositionYieldCard({
  position,
  index,
  onClaim,
  isSubmitting,
}: {
  position: NFTPosition & { accruedYield: number; totalValue: number; timeHeld: number; estimatedApr: number };
  index: number;
  onClaim: (position: NFTPosition) => void;
  isSubmitting: boolean;
}) {
  const { formatAmount } = useVault();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-mono text-sm">
                  Position #{position.id.slice(-6).toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {position.timeHeld} days held
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Est. APR</div>
              <div className="text-sm font-semibold text-primary">
                {position.estimatedApr.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Yield Display */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Accrued Yield</span>
              </div>
              <div className="text-2xl font-bold font-mono text-primary">
                +{formatAmount(position.accruedYield, position.token)}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Principal: {formatAmount(position.depositAmount, position.token)}
            </div>
          </div>

          {/* Claim Button */}
          <Button
            onClick={() => onClaim(position)}
            disabled={position.accruedYield <= 0 || isSubmitting}
            className="w-full glow-primary"
            variant={position.accruedYield > 0 ? "default" : "outline"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : position.accruedYield > 0 ? (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Claim {formatAmount(position.accruedYield, position.token)}
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                No Yield Available
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ClaimSection() {
  const {
    positionsWithYield,
    userClaims,
    submitClaim,
    isLoadingPositions,
    isSubmitting,
    formatAmount,
  } = useVault();

  const [selectedPosition, setSelectedPosition] = useState<NFTPosition | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Filter positions with yield
  const positionsWithYieldAvailable = positionsWithYield.filter(
    (p) => p.accruedYield > 0 && p.status === "active"
  );

  const handleClaim = async (position: NFTPosition) => {
    setSelectedPosition(position);
    setStatus({ type: null, message: "" });

    const success = await submitClaim(position.id);

    if (success) {
      setStatus({
        type: "success",
        message: "Yield claim request submitted successfully! You'll receive your yield after admin approval.",
      });
    } else {
      setStatus({ type: "error", message: "Failed to submit claim request" });
    }
    setSelectedPosition(null);
  };

  if (isLoadingPositions) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-mono">Loading positions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Yield Summary Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-mono">
            <Wallet className="w-5 h-5 text-primary" />
            Yield Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Total Claimable Yield</div>
              <div className="text-2xl font-mono font-semibold text-primary">
                {formatAmount(
                  positionsWithYieldAvailable.reduce((sum, p) => sum + p.accruedYield, 0),
                  "USDC"
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Positions with Yield</div>
              <div className="text-2xl font-mono font-semibold">
                {positionsWithYieldAvailable.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Pending Claims</div>
              <div className="text-2xl font-mono font-semibold">
                {userClaims.filter((c) => c.status === "pending" || c.status === "approved").length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions with Yield */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-mono">
            <TrendingUp className="w-5 h-5 text-primary" />
            Claim Yield by Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          {positionsWithYieldAvailable.length === 0 ? (
            <div className="p-8 text-center">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No Yield Available
              </h3>
              <p className="text-sm text-muted-foreground">
                Your positions haven&apos;t accrued any yield yet. Yield accrues over time based on pool performance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {positionsWithYieldAvailable.map((position, index) => (
                <PositionYieldCard
                  key={position.id}
                  position={position}
                  index={index}
                  onClaim={handleClaim}
                  isSubmitting={isSubmitting && selectedPosition?.id === position.id}
                />
              ))}
            </div>
          )}

          {/* Status Messages */}
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
                status.type === "success"
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-destructive/10 border border-destructive/30"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  status.type === "success" ? "text-primary" : "text-destructive"
                }`}
              >
                {status.message}
              </p>
            </motion.div>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground mt-6 pt-4 border-t border-border/30">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">About Yield Claims</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Yield claims are processed separately from withdrawals</li>
                <li>You keep your NFT position and continue earning after claiming</li>
                <li>Claims require admin approval for security</li>
                <li>No cooling-off period for yield claims</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Claims */}
      {userClaims.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <Coins className="w-5 h-5 text-primary" />
              Your Claim Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userClaims.map((request) => (
              <ClaimRequestCard key={request.id} request={request} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
