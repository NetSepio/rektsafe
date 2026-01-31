"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, RefreshCw, Wallet, Shield, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBalances } from "../hooks/use-balances";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function BalanceCard() {
  const [showBalances, setShowBalances] = useState(true);
  const { tokens, isLoading, refresh, isSDKInitialized } = useBalances();
  const { address } = useAppKitAccount();

  const formatBalance = (balance: number, decimals: number = 4) => {
    if (!showBalances) return "****";
    if (balance === 0) return "0.00";
    if (balance < 0.0001) return "<0.0001";
    return balance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  };

  // Calculate total value (mock USD values)
  const getTokenPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      SOL: 180,
      USDC: 1,
      USDT: 1,
      ZEC: 65,
      ORE: 2.5,
      stORE: 2.75,
    };
    return prices[symbol] || 0;
  };

  const totalPrivateValue = tokens.reduce((sum, token) => {
    return sum + token.privateBalance * getTokenPrice(token.symbol);
  }, 0);

  const totalPublicValue = tokens.reduce((sum, token) => {
    return sum + token.publicBalance * getTokenPrice(token.symbol);
  }, 0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-foreground text-lg">
                Wallet Balances
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                    <Info className="w-3.5 h-3.5" />
                    <span className="text-xs">Privacy Cash</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Private balances are encrypted and require Privacy Cash SDK
                    access. Public balances are fetched from Helius RPC.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalances(!showBalances)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              {showBalances ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Total Value Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-black/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono uppercase">
                Public
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-foreground">
              {showBalances
                ? `$${totalPublicValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "****"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 relative">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-mono uppercase">
                Private
              </span>
              {!isSDKInitialized && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Private balances encrypted. Deposit assets to see
                        balance here.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="text-xl font-mono font-bold text-primary">
              {showBalances
                ? `$${totalPrivateValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "****"}
            </div>
          </div>
        </div>

        {/* Token Balances Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tokens.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative overflow-hidden rounded-xl bg-black/30 border border-border/50 p-4 hover:border-border transition-colors"
            >
              {/* Glow effect */}
              <div
                className="absolute top-0 right-0 w-16 h-16 opacity-10 blur-xl"
                style={{ backgroundColor: token.color }}
              />

              <div className="relative z-10">
                {/* Token Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: `${token.color}20`,
                      color: token.color,
                    }}
                  >
                    {token.symbol.slice(0, 2)}
                  </div>
                  <span className="text-sm font-mono font-semibold text-foreground">
                    {token.symbol}
                  </span>
                </div>

                {/* Public Balance */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Public
                    </span>
                    <span className="text-sm font-mono text-foreground">
                      {formatBalance(token.publicBalance, 3)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-border/30 rounded-full mt-1">
                    <div
                      className="h-full bg-muted-foreground/30 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (token.publicBalance /
                            (token.publicBalance + token.privateBalance || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Private Balance */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary">Private</span>
                    <span className="text-sm font-mono text-primary">
                      {formatBalance(token.privateBalance, 3)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-border/30 rounded-full mt-1">
                    <div
                      className="h-full bg-primary/50 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (token.privateBalance /
                            (token.publicBalance + token.privateBalance || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
