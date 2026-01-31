"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "../context/transaction-context";
import { useBalances } from "../hooks/use-balances";
import { useWalletSession } from "@/components/wallet-session-provider";
import { privacyCashSDK, type TokenSymbol } from "../lib/privacy-cash-sdk";

export function ShieldSection() {
  const { addTransaction, updateTransaction } = useTransactions();
  const { isInitialized: isSessionInitialized } = useWalletSession();
  const { tokens, shieldableTokens, refresh, isSDKInitialized } = useBalances();

  const [selectedToken, setSelectedToken] = useState<TokenSymbol | null>(null);
  const [amount, setAmount] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    txSignature?: string;
  }>({ type: null, message: "" });

  // Get current token data
  const currentToken = selectedToken
    ? tokens.find((t) => t.symbol === selectedToken)
    : null;

  const publicBalance = currentToken?.publicBalance || 0;

  const handleMax = () => {
    setAmount(publicBalance.toString());
  };

  const handleShield = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount" });
      return;
    }

    if (parseFloat(amount) > publicBalance) {
      setStatus({ type: "error", message: "Insufficient public balance" });
      return;
    }

    if (!selectedToken || !currentToken) {
      setStatus({ type: "error", message: "Please select a token" });
      return;
    }

    if (!isSessionInitialized) {
      setStatus({
        type: "error",
        message:
          "Wallet session not initialized. Please sign the message first.",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: "" });

    const txId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    addTransaction({
      type: "shield",
      assetIn: selectedToken,
      amountIn: parseFloat(amount),
      status: "pending",
    });

    try {
      let result;

      if (currentToken.isNative) {
        // Deposit SOL using SDK
        const lamports = Math.floor(parseFloat(amount) * 1e9);
        result = await privacyCashSDK.deposit(lamports);
      } else {
        throw new Error("SPL token deposits not yet implemented");
      }

      updateTransaction(txId, {
        status: "confirmed",
        txSignature: result.signature,
      });

      setStatus({
        type: "success",
        message: `Successfully shielded ${amount} ${selectedToken}`,
        txSignature: result.signature,
      });

      setAmount("");
      refresh();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Transaction failed";
      updateTransaction(txId, { status: "failed", error: errorMsg });
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-mono">
          <Shield className="w-5 h-5 text-primary" />
          Shield Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        {currentToken && (
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-mono">
                Current Balance
              </span>
              <div
                className="px-2 py-1 rounded text-xs font-bold"
                style={{
                  backgroundColor: `${currentToken.color}20`,
                  color: currentToken.color,
                }}
              >
                {currentToken.symbol}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wallet className="w-3.5 h-3.5" />
                  Public
                </div>
                <div className="text-lg font-mono font-semibold text-foreground">
                  {publicBalance.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-primary mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  Private
                </div>
                <div className="text-lg font-mono font-semibold text-primary">
                  {currentToken.privateBalance.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-mono">
            Select Asset to Shield
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-black/30 border border-border/50 hover:border-primary/50 transition-colors"
            >
              {currentToken ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                    style={{
                      backgroundColor: `${currentToken.color}20`,
                      color: currentToken.color,
                    }}
                  >
                    {currentToken.symbol.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">
                      {currentToken.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentToken.name}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Choose an asset...
                </span>
              )}
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 z-10 bg-card border border-border rounded-xl overflow-hidden shadow-xl max-h-72 overflow-y-auto"
              >
                {shieldableTokens.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No tokens with public balance available
                  </div>
                ) : (
                  shieldableTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        setSelectedToken(token.symbol);
                        setIsDropdownOpen(false);
                        setAmount("");
                      }}
                      className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: `${token.color}20`,
                            color: token.color,
                          }}
                        >
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {token.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-foreground">
                          {token.publicBalance.toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground font-mono">
              Amount to Shield
            </label>
            {currentToken && (
              <span className="text-xs text-muted-foreground">
                Available: {publicBalance.toFixed(4)} {currentToken.symbol}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-14 pr-20 text-lg font-mono"
              min="0"
              step="0.001"
              disabled={!selectedToken}
            />
            <button
              onClick={handleMax}
              disabled={!selectedToken || publicBalance === 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Fee Info */}
        <div className="p-4 rounded-xl bg-muted/30 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">
              Privacy Pool Fee
            </span>
            <span className="text-foreground font-mono">~0.001 SOL</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">
              Relayer Cost
            </span>
            <span className="text-foreground font-mono">~0.0005 SOL</span>
          </div>
        </div>

        {/* Shield Button */}
        <Button
          onClick={handleShield}
          disabled={
            isLoading ||
            !selectedToken ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > publicBalance
          }
          className="w-full h-14 glow-primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Shielding...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-5 h-5 mr-2" />
              Shield {selectedToken || "Assets"}
            </>
          )}
        </Button>

        {/* Status Messages */}
        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-start gap-3 ${
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
            <div className="flex-1">
              <p
                className={`text-sm ${
                  status.type === "success"
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {status.message}
              </p>
              {status.txSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${status.txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  View Transaction
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
