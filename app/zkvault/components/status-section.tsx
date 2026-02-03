"use client";

/**
 * Status Section
 *
 * Displays user's NFT positions:
 * - Current balance (principal + accrued yield)
 * - Time held
 * - Estimated APR
 * - Position status
 */

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Clock,
  ImageIcon,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVault } from "../context/vault-context";
import type { PositionWithYield } from "../types";

// Format as USD (1 USDC = 1 USDT = 1 USD)
function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function PositionCard({
  position,
  index,
}: {
  position: PositionWithYield;
  index: number;
}) {
  const statusConfig = {
    active: {
      color: "bg-primary/10 text-primary border-primary/30",
      label: "Active",
    },
    withdrawal_pending: {
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      label: "Withdrawal Pending",
    },
    withdrawn: {
      color: "bg-muted text-muted-foreground border-border",
      label: "Withdrawn",
    },
    claimed: {
      color: "bg-accent/10 text-accent border-accent/30",
      label: "Claimed",
    },
  };

  const status = statusConfig[position.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-mono">
                  Position #{position.id.slice(-6).toUpperCase()}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  {new Date(position.depositTimestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Asset Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {position.token} Position
            </Badge>
          </div>

          {/* Principal & Yield */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Wallet className="w-3.5 h-3.5" />
                Principal
              </div>
              <div className="text-lg font-mono font-semibold text-foreground">
                {formatUSD(position.depositAmount)}
              </div>
              <div className="text-xs text-muted-foreground">
                {position.depositAmount.toLocaleString()} {position.token}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-xs text-primary mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Accrued Yield
              </div>
              <div className="text-lg font-mono font-semibold text-primary">
                +{formatUSD(position.accruedYield)}
              </div>
              <div className="text-xs text-primary/70">
                +{position.accruedYield.toLocaleString()} {position.token}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {position.timeHeld} days held
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {position.estimatedApr.toFixed(2)}% APR
                </span>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Value ({position.token})
              </span>
              <span className="text-2xl font-bold font-mono text-foreground">
                {formatUSD(position.totalValue)}
              </span>
            </div>
          </div>

          {/* Transaction Link */}
          <a
            href={`https://explorer.solana.com/tx/${position.transactionSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View Deposit Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatusSection() {
  const {
    positionsWithYield,
    isLoadingPositions,
    refreshPositions,
    formatAmount,
  } = useVault();

  // Calculate totals
  const totalPrincipal = positionsWithYield.reduce(
    (sum, p) => sum + p.depositAmount,
    0,
  );
  const totalYield = positionsWithYield.reduce(
    (sum, p) => sum + p.accruedYield,
    0,
  );
  const totalValue = totalPrincipal + totalYield;
  const avgApr =
    positionsWithYield.length > 0
      ? positionsWithYield.reduce((sum, p) => sum + p.estimatedApr, 0) /
        positionsWithYield.length
      : 0;

  if (isLoadingPositions) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-mono">
              Loading your positions...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positionsWithYield.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-muted/50">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No Active Positions
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                You don&apos;t have any NFT lending positions yet. Deposit funds
                to the vault to start earning yield.
              </p>
            </div>
            <Button
              onClick={refreshPositions}
              variant="outline"
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <Wallet className="w-5 h-5 text-primary" />
              Portfolio Summary
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={refreshPositions}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-muted/30"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Total Principal
              </div>
              <div className="text-xl font-mono font-semibold">
                {formatUSD(totalPrincipal)}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-1.5 text-xs text-primary mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Total Yield Earned
              </div>
              <div className="text-xl font-mono font-semibold text-primary">
                +{formatUSD(totalYield)}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Wallet className="w-3.5 h-3.5" />
                Total Value
              </div>
              <div className="text-2xl font-mono font-bold">
                {formatUSD(totalValue)}
              </div>
              <div className="text-xs text-primary mt-1">
                ~{avgApr.toFixed(1)}% Avg APR
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {positionsWithYield.map((position, index) => (
          <PositionCard key={position.id} position={position} index={index} />
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-muted/20 border border-border/30 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">
            How Yield is Calculated
          </p>
          <p>
            Yield accrues based on the pool&apos;s performance. The yield index
            increases over time, and your accrued yield = Principal × (Current
            Index - Deposit Index). You can claim yield separately or include it
            in your withdrawal request.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
