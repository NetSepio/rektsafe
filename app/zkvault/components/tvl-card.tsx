"use client";

/**
 * TVL Card Component
 *
 * Displays Total Value Locked in USD and key pool statistics
 * for the lending vault.
 */

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Users,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault } from "../context/vault-context";

// Format as USD since 1 USDC = 1 USDT = 1 USD
function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TVLCard() {
  const { poolStats, isLoadingStats } = useVault();

  if (isLoadingStats || !poolStats) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-mono">
            <Wallet className="w-5 h-5 text-primary" />
            Vault Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Total Deposits",
      value: formatUSD(poolStats.totalDeposits),
      icon: ArrowUpRight,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Withdrawals",
      value: formatUSD(poolStats.totalWithdrawals),
      icon: ArrowDownRight,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Active Positions",
      value: poolStats.activePositions.toString(),
      icon: Users,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
    },
    {
      label: "Utilization",
      value: `${poolStats.utilizationRate.toFixed(1)}%`,
      icon: Droplets,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-mono">
          <Wallet className="w-5 h-5 text-primary" />
          Vault Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main TVL Display with Big APR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TVL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-2">
              <DollarSign className="w-4 h-4" />
              Total Value Locked
            </div>
            <div className="text-4xl md:text-5xl font-bold font-mono text-foreground">
              {formatUSD(poolStats.totalValueLocked)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Available:{" "}
              <span className="text-primary font-semibold">
                {formatUSD(poolStats.availableLiquidity)}
              </span>
            </div>
          </motion.div>

          {/* Big APR Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 text-sm text-primary font-mono mb-2">
              <TrendingUp className="w-4 h-4" />
              Current APR
            </div>
            <div className="text-5xl md:text-6xl font-bold font-mono text-primary">
              {poolStats.baseApr.toFixed(1)}%
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Annual Percentage Rate
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-muted/30 border border-border/30"
            >
              <div className={`p-2 rounded-lg ${stat.bgColor} w-fit mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-lg font-semibold font-mono">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Yield Index */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Current Yield Index
              </span>
            </div>
            <span className="text-lg font-mono font-semibold text-primary">
              {poolStats.currentYieldIndex.toFixed(6)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Yield = Principal × (Current Index - Deposit Index)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
