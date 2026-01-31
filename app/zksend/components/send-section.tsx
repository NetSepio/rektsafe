"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  User,
  Wallet,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function SendSection() {
  const { addTransaction, updateTransaction } = useTransactions();
  const { isInitialized: isSessionInitialized } = useWalletSession();
  const { tokens, privateTokens, refresh } = useBalances();

  const [selectedToken, setSelectedToken] = useState<TokenSymbol | null>(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
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

  const handleSend = async () => {
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
      type: "send",
      assetIn: selectedToken,
      amountIn: parseFloat(amount),
      recipient: recipient,
      status: "pending",
    });

    try {
      // Private transfer by withdrawing to recipient
      const lamports = Math.floor(parseFloat(amount) * 1e9);
      const result = await privacyCashSDK.withdraw(lamports, recipient);

      updateTransaction(txId, {
        status: "confirmed",
        txSignature: result.signature,
      });

      setStatus({
        type: "success",
        message: `Successfully sent ${amount} ${selectedToken} privately`,
        txSignature: result.signature,
      });

      setAmount("");
      setRecipient("");
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
          <Send className="w-5 h-5 text-accent" />
          Send Privately
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        {currentToken && (
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-mono">
                Available Private Balance
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
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-2xl font-mono font-semibold text-primary">
                {privateBalance.toFixed(4)}
              </span>
              <span className="text-muted-foreground">
                {currentToken.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Asset Selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-mono">
            Select Asset to Send
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-black/30 border border-border/50 hover:border-accent/50 transition-colors"
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
                {privateTokens.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No private balance available
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
                      className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
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

        {/* Recipient Input */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-mono">
            Recipient Address
          </label>
          <div className="relative">
            <Input
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              placeholder="Enter Solana address..."
              className="h-14 pr-12 font-mono text-sm"
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          {recipientError && (
            <p className="text-xs text-destructive">{recipientError}</p>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground font-mono">
              Amount to Send
            </label>
            {currentToken && (
              <span className="text-xs text-muted-foreground">
                Available: {privateBalance.toFixed(4)} {currentToken.symbol}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-3">
            <Wallet className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-accent font-medium">
                Private Transfer
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The recipient will receive funds from the privacy pool. The
                connection to your wallet will be broken.
              </p>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={
            isLoading ||
            !selectedToken ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > privateBalance ||
            !recipient ||
            !!recipientError
          }
          className="w-full h-14 bg-accent hover:bg-accent/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send Privately
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
