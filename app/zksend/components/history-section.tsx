"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  Shield,
  Send,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useTransactions,
  type Transaction,
} from "../context/transaction-context";
import { useAppKitAccount } from "@reown/appkit/react";

const ITEMS_PER_PAGE = 10;

function getTransactionIcon(type: Transaction["type"]) {
  switch (type) {
    case "shield":
      return Shield;
    case "send":
      return Send;
    case "unshield":
      return Unlock;
    default:
      return History;
  }
}

function getStatusIcon(status: Transaction["status"]) {
  switch (status) {
    case "confirmed":
      return CheckCircle;
    case "failed":
      return XCircle;
    case "pending":
      return Clock;
    default:
      return Clock;
  }
}

function getStatusColor(status: Transaction["status"]) {
  switch (status) {
    case "confirmed":
      return "bg-primary/20 text-primary border-primary/30";
    case "failed":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function HistorySection() {
  const { transactions, clearHistory } = useTransactions();
  const { address } = useAppKitAccount();
  const [page, setPage] = useState(1);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = transactions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleClear = () => {
    clearHistory();
    setShowClearConfirm(false);
    setPage(1);
  };

  if (transactions.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-mono">
            <History className="w-5 h-5 text-muted-foreground" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-mono text-foreground mb-2">
              No Transactions Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your transaction history will appear here once you start using
              private transfers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-mono">
          <History className="w-5 h-5 text-muted-foreground" />
          Transaction History
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowClearConfirm(true)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear History</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Clear Confirmation */}
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-semibold mb-1">
                  Clear all transaction history?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  This action cannot be undone. Your transaction data is stored
                  locally.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={handleClear}>
                    Clear History
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Transaction List */}
        <div className="space-y-3">
          {paginatedTransactions.map((tx, index) => {
            const Icon = getTransactionIcon(tx.type);
            const StatusIcon = getStatusIcon(tx.status);

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-black/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Icon & Type */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === "shield"
                          ? "bg-primary/10"
                          : tx.type === "send"
                            ? "bg-accent/10"
                            : "bg-cyan-500/10"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          tx.type === "shield"
                            ? "text-primary"
                            : tx.type === "send"
                              ? "text-accent"
                              : "text-cyan-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground capitalize">
                          {tx.type}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(tx.status)}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts */}
                  <div className="text-right">
                    <div className="font-mono font-semibold text-foreground">
                      {tx.type === "send" ? (
                        <span className="text-accent">
                          -{tx.amountIn.toFixed(4)} {tx.assetIn}
                        </span>
                      ) : tx.type === "shield" ? (
                        <span className="text-primary">
                          +{tx.amountIn.toFixed(4)} {tx.assetIn}
                        </span>
                      ) : (
                        <span className="text-cyan-400">
                          -{tx.amountIn.toFixed(4)} {tx.assetIn}
                        </span>
                      )}
                    </div>
                    {tx.recipient && (
                      <div className="text-xs text-muted-foreground mt-1">
                        To: {tx.recipient.slice(0, 6)}...
                        {tx.recipient.slice(-4)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction Link */}
                {tx.txSignature && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <a
                      href={`https://explorer.solana.com/tx/${tx.txSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View on Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Error Message */}
                {tx.error && (
                  <div className="mt-3 p-2 rounded-lg bg-destructive/10 text-xs text-destructive">
                    {tx.error}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
