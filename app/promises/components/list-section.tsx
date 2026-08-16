"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Lock, Unlock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePromises } from "../hooks/use-promises";
import type { PromiseData } from "@/lib/promises/contract";

interface ListSectionProps {
  mode: "sent" | "received";
}

function getStatus(promise: PromiseData): "locked" | "claimable" | "claimed" {
  if (promise.claimed) return "claimed";

  if (promise.conditionType === "date") {
    const now = Math.floor(Date.now() / 1000);
    return now >= promise.unlockTime ? "claimable" : "locked";
  }

  return promise.approved ? "claimable" : "locked";
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function PromiseCard({
  promise,
  onApprove,
  onClaim,
  isProcessing,
}: {
  promise: PromiseData;
  onApprove: (id: number) => void;
  onClaim: (id: number) => void;
  isProcessing: number | null;
}) {
  const { address } = useAppKitAccount();
  const status = getStatus(promise);
  const isApprover =
    address?.toLowerCase() === promise.approver.toLowerCase();
  const isRecipient =
    address?.toLowerCase() === promise.recipient.toLowerCase();

  const statusConfig = {
    locked: {
      label: "LOCKED",
      icon: Lock,
      color: "text-accent bg-accent/10 border-accent/30",
    },
    claimable: {
      label: "CLAIMABLE",
      icon: Unlock,
      color: "text-primary bg-primary/10 border-primary/30",
    },
    claimed: {
      label: "CLAIMED",
      icon: CheckCircle2,
      color: "text-muted-foreground bg-muted/20 border-muted/30",
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-mono font-bold text-foreground">
                {promise.amountFormatted} MON
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${statusConfig[status].color}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusConfig[status].label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono text-muted-foreground">
              <div>
                <span className="text-xs uppercase tracking-wider">Sender</span>
                <p className="text-foreground font-medium">
                  {truncateAddress(promise.sender)}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider">
                  Recipient
                </span>
                <p className="text-foreground font-medium">
                  {truncateAddress(promise.recipient)}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider">
                  Condition
                </span>
                <p className="text-foreground font-medium">
                  {promise.conditionType === "date" ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(promise.unlockTime * 1000).toLocaleString()}
                    </span>
                  ) : (
                    <span>Approver: {truncateAddress(promise.approver)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {promise.conditionType === "approval" &&
              !promise.approved &&
              !promise.claimed &&
              isApprover && (
                <Button
                  size="sm"
                  onClick={() => onApprove(promise.id)}
                  disabled={isProcessing === promise.id}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-mono"
                >
                  {isProcessing === promise.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "APPROVE"
                  )}
                </Button>
              )}

            {status === "claimable" && !promise.claimed && isRecipient && (
              <Button
                size="sm"
                onClick={() => onClaim(promise.id)}
                disabled={isProcessing === promise.id}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
              >
                {isProcessing === promise.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "CLAIM"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ListSection({ mode }: ListSectionProps) {
  const { sent, received, isLoading, approve, claim } = usePromises();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const promises = mode === "sent" ? sent : received;

  const handleApprove = async (id: number) => {
    setActionError(null);
    setProcessingId(id);
    try {
      await approve(id);
    } catch (err: any) {
      console.error("Approve failed:", err);
      setActionError(err?.reason || err?.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleClaim = async (id: number) => {
    setActionError(null);
    setProcessingId(id);
    try {
      await claim(id);
    } catch (err: any) {
      console.error("Claim failed:", err);
      setActionError(err?.reason || err?.message || "Claim failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-4"
    >
      {actionError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-mono text-center">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-mono">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
          Loading promises...
        </div>
      ) : promises.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-mono">
          No {mode} promises yet.
        </div>
      ) : (
        promises.map((promise, index) => (
          <motion.div
            key={promise.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <PromiseCard
              promise={promise}
              onApprove={handleApprove}
              onClaim={handleClaim}
              isProcessing={processingId}
            />
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
