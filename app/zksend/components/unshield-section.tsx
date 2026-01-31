"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Unlock,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Wallet,
  Shield,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppKitAccount } from "@reown/appkit/react";
import { useTransactions } from "../context/transaction-context";
import { useBalances } from "../hooks/use-balances";
import { useWalletSession } from "@/components/wallet-session-provider";
import { privacyCashSDK, type TokenSymbol } from "../lib/privacy-cash-sdk";

// Validate Solana address
const isValidSolanaAddress = (address: string): boolean => {
  try {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
};

export function UnshieldSection() {
  const { address } = useAppKitAccount();
  const { addTransaction, updateTransaction } = useTransactions();
  const { isInitialized: isSessionInitialized } = useWalletSession();
  const { tokens, privateTokens, refresh, isSDKInitialized } = useBalances();

  const [selectedToken, setSelectedToken] = useState<TokenSymbol | null>(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(address || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    txSignature?: string;
  }>({ type: null, message: "" });

  // Get current token data
  const currentToken = selectedToken
    ? tokens.find((t) => t.symbol === selectedToken)
    : null;

  const privateBalance = currentToken?.privateBalance || 0;

  const handleMax = () => {
    setAmount(privateBalance.toString());
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (value && !isValidSolanaAddress(value)) {
      setRecipientError("Invalid Solana address");
    } else {
      setRecipientError("");
    }
  };

  const handleUseConnectedWallet = () => {
    if (address) {
      setRecipient(address);
      setRecipientError("");
    }
  };

  const handleUnshield = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount" });
      return;
    }

    if (parseFloat(amount) > privateBalance) {
      setStatus({ type: "error", message: "Insufficient private balance" });
      return;
    }

    if (!recipient) {
      setStatus({ type: "error", message: "Please enter a recipient address" });
      return;
    }

    if (!isValidSolanaAddress(recipient)) {
      setStatus({ type: "error", message: "Invalid recipient address" });
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
      type: "unshield",
      assetIn: selectedToken,
      amountIn: parseFloat(amount),
      recipient: recipient,
      status: "pending",
    });

    try {
      // Initialize SDK from session if not already initialized
      if (!isSDKInitialized) {
        await privacyCashSDK.initializeFromSession();
      }

      let result;

      if (currentToken.isNative) {
        // Withdraw SOL using SDK
        const lamports = Math.floor(parseFloat(amount) * 1e9);
        result = await privacyCashSDK.withdraw(lamports, recipient);
      } else if (selectedToken === "USDC") {
        // Withdraw USDC using SDK
        const baseUnits = Math.floor(parseFloat(amount) * 1e6);
        result = await privacyCashSDK.withdrawUSDC(baseUnits, recipient);
      } else {
        // Withdraw SPL token using SDK
        const baseUnits = Math.floor(
          parseFloat(amount) * Math.pow(10, currentToken.decimals),
        );
        result = await privacyCashSDK.withdrawSPL(
          baseUnits,
          currentToken.mint!,
          recipient,
        );
      }

      updateTransaction(txId, {
        status: "confirmed",
        txSignature: result.signature,
      });

      setStatus({
        type: "success",
        message: `Successfully unshielded ${amount} ${selectedToken} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
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
          <Unlock className="w-5 h-5 text-cyan-400" />
          Unshield Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        {currentToken && (
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-mono">
                Balance Overview
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
                <div className="flex items-center gap-2 text-xs text-primary mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  Private (Before)
                </div>
                <div className="text-lg font-mono font-semibold text-primary">
                  {privateBalance.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wallet className="w-3.5 h-3.5" />
                  Private (After)
                </div>
                <div className="text-lg font-mono font-semibold text-foreground">
                  {Math.max(
                    0,
                    privateBalance - parseFloat(amount || "0"),
                  ).toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-mono">
            Asset to Unshield
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
                  Choose private asset...
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
                {privateTokens.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No tokens with private balance available.
                    <br />
                    Shield some assets first.
                  </div>
                ) : (
                  privateTokens.map((token) => (
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
                        <div className="text-sm font-mono text-primary">
                          {token.privateBalance.toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Private
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
              Amount to Unshield
            </label>
            {currentToken && (
              <span className="text-xs text-primary">
                Private: {privateBalance.toFixed(4)} {currentToken.symbol}
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
              disabled={!selectedToken || privateBalance === 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground font-mono">
              Recipient Address
            </label>
            <button
              onClick={handleUseConnectedWallet}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Wallet className="w-3 h-3" />
              Use my wallet
            </button>
          </div>
          <Input
            value={recipient}
            onChange={(e) => handleRecipientChange(e.target.value)}
            placeholder="Enter Solana address..."
            className={`h-14 font-mono text-sm ${
              recipientError ? "border-destructive" : ""
            }`}
          />
          {recipientError && (
            <p className="text-xs text-destructive">{recipientError}</p>
          )}
        </div>

        {/* Fee Info */}
        <div className="p-4 rounded-xl bg-muted/30 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">
              Withdrawal Fee
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

        {/* Unshield Button */}
        <Button
          onClick={handleUnshield}
          disabled={
            isLoading ||
            !selectedToken ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > privateBalance ||
            !recipient ||
            !!recipientError
          }
          className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
          style={{
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Unshielding...
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-5 h-5 mr-2" />
              Unshield {selectedToken || "Assets"}
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
