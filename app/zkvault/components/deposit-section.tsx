"use client";

/**
 * Deposit Section
 *
 * Allows users to:
 * - View the vault deposit address (multisig)
 * - Deposit USDC/USDT to the vault
 * - Receive NFT representing their position
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Copy,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppKitAccount } from "@reown/appkit/react";
import { useVault } from "../context/vault-context";
import { SUPPORTED_TOKENS, type SupportedToken } from "../types";

export function DepositSection() {
  const { isConnected, address } = useAppKitAccount();
  const { vaultConfig, poolStats, formatAmount, refreshPositions } = useVault();

  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    txSignature?: string;
    nftMint?: string;
  }>({ type: null, message: "" });

  const vaultAddress = vaultConfig.vaultAddress || "Coming Soon";
  const isPaused = vaultConfig.isPaused;

  const handleCopyAddress = async () => {
    if (!vaultAddress || vaultAddress === "Coming Soon") return;
    try {
      await navigator.clipboard.writeText(vaultAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleMax = () => {
    // In real implementation, this would get the token balance
    setAmount("10000");
  };

  const handleDeposit = async () => {
    if (!isConnected || !address) {
      setStatus({ type: "error", message: "Please connect your wallet first" });
      return;
    }

    if (!selectedToken) {
      setStatus({ type: "error", message: "Please select a token" });
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount" });
      return;
    }

    if (depositAmount < vaultConfig.minDeposit) {
      setStatus({
        type: "error",
        message: `Minimum deposit is ${formatAmount(vaultConfig.minDeposit, selectedToken)}`,
      });
      return;
    }

    if (depositAmount > vaultConfig.maxDeposit) {
      setStatus({
        type: "error",
        message: `Maximum deposit is ${formatAmount(vaultConfig.maxDeposit, selectedToken)}`,
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // TODO: Implement actual deposit transaction
      // 1. Create transaction to transfer tokens to vault
      // 2. Sign and send transaction
      // 3. Wait for confirmation
      // 4. Mint NFT to user
      // 5. Save position to database

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTxSignature =
        "mock_tx_" + Math.random().toString(36).substr(2, 16);
      const mockNftMint =
        "mock_nft_" + Math.random().toString(36).substr(2, 16);

      setStatus({
        type: "success",
        message: `Successfully deposited ${amount} ${selectedToken}! Your NFT position has been minted.`,
        txSignature: mockTxSignature,
        nftMint: mockNftMint,
      });

      setAmount("");
      setSelectedToken(null);
      refreshPositions();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Deposit failed";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTokenInfo = selectedToken
    ? SUPPORTED_TOKENS.find((t) => t.symbol === selectedToken)
    : null;

  return (
    <div className="space-y-6">
      {/* Vault Address Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-mono">
            <Shield className="w-5 h-5 text-primary" />
            Vault Deposit Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send USDC or USDT to this multisig-controlled vault address. Once
            confirmed, you&apos;ll receive an NFT representing your lending
            position.
          </p>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm font-mono text-foreground break-all">
                {vaultAddress}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                disabled={vaultAddress === "Coming Soon"}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isPaused && (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-500 font-semibold">
                  Deposits Paused
                </p>
                <p className="text-xs text-yellow-500/80 mt-1">
                  New deposits are temporarily paused. Please check back later.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Deposit Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-mono">
            <Wallet className="w-5 h-5 text-primary" />
            Quick Deposit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Selector */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-mono">
              Select Token
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isPaused}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-black/30 border border-border/50 hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                {selectedTokenInfo ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: `${selectedTokenInfo.color}20`,
                        color: selectedTokenInfo.color,
                      }}
                    >
                      {selectedTokenInfo.symbol.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">
                        {selectedTokenInfo.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedTokenInfo.name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Choose a token...
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
                  className="absolute top-full left-0 right-0 mt-2 z-10 bg-card border border-border rounded-xl overflow-hidden shadow-xl"
                >
                  {SUPPORTED_TOKENS.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        setSelectedToken(token.symbol);
                        setIsDropdownOpen(false);
                        setAmount("");
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-primary/5 transition-colors"
                    >
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
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground font-mono">
                Amount
              </label>
              <span className="text-xs text-muted-foreground">
                Min:{" "}
                {formatAmount(vaultConfig.minDeposit, selectedToken || "USDC")}{" "}
                | Max:{" "}
                {formatAmount(vaultConfig.maxDeposit, selectedToken || "USDC")}
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-14 pr-20 text-lg font-mono"
                min="0"
                step="0.01"
                disabled={!selectedToken || isPaused}
              />
              <button
                onClick={handleMax}
                disabled={!selectedToken || isPaused}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Deposit Info */}
          <div className="p-4 rounded-xl bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono">
                Current APR
              </span>
              <span className="text-primary font-semibold font-mono">
                {poolStats?.baseApr.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono">
                You Receive
              </span>
              <span className="text-foreground font-mono">
                {amount && selectedToken
                  ? `1 NFT Position (${amount} ${selectedToken})`
                  : "-"}
              </span>
            </div>
          </div>

          {/* Deposit Button */}
          <Button
            onClick={handleDeposit}
            disabled={
              isLoading ||
              !isConnected ||
              !selectedToken ||
              !amount ||
              parseFloat(amount) <= 0 ||
              isPaused
            }
            className="w-full h-14 glow-primary"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
                />
                Processing Deposit...
              </>
            ) : !isConnected ? (
              "Connect Wallet to Deposit"
            ) : isPaused ? (
              "Deposits Paused"
            ) : (
              `Deposit ${selectedToken || "Tokens"}`
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

          {/* Info Note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Your deposit will be held in a multisig-controlled vault.
              You&apos;ll receive an NFT that represents your lending position
              and can be used to claim yield or withdraw your principal.
              Withdrawals require a {vaultConfig.coolingOffPeriod}-hour
              cooling-off period before admin approval.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
