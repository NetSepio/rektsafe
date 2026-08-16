"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Calendar, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePromises } from "../hooks/use-promises";

type ConditionType = "date" | "approval";

export function CreateSection() {
  const { address } = useAppKitAccount();
  const { createDate, createApproval, isLoading } = usePromises();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [condition, setCondition] = useState<ConditionType>("date");
  const [unlockDate, setUnlockDate] = useState("");
  const [approver, setApprover] = useState(address || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateAddress = (value: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateAddress(recipient)) {
      setError("Invalid recipient address");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid MON amount");
      return;
    }

    try {
      let hash: string;

      if (condition === "date") {
        if (!unlockDate) {
          setError("Select an unlock date and time");
          return;
        }

        const unlockTime = Math.floor(new Date(unlockDate).getTime() / 1000);

        if (unlockTime <= Math.floor(Date.now() / 1000)) {
          setError("Unlock time must be in the future");
          return;
        }

        hash = await createDate(recipient, amount, unlockTime);
      } else {
        if (!validateAddress(approver)) {
          setError("Invalid approver address");
          return;
        }

        hash = await createApproval(recipient, approver, amount);
      }

      setSuccess(`Promise locked. Tx: ${hash.slice(0, 14)}...${hash.slice(-6)}`);
      setRecipient("");
      setAmount("");
      setUnlockDate("");
      setApprover(address || "");
    } catch (err: any) {
      console.error("Failed to create promise:", err);
      setError(err?.reason || err?.message || "Transaction failed");
    }
  };

  const toLocalDatetime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto"
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Condition toggle */}
            <div className="flex p-1 rounded-xl bg-background border border-border/50">
              <button
                type="button"
                onClick={() => setCondition("date")}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${
                    condition === "date"
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Calendar className="w-4 h-4" />
                Date
              </button>
              <button
                type="button"
                onClick={() => setCondition("approval")}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${
                    condition === "approval"
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <ShieldCheck className="w-4 h-4" />
                Approval
              </button>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-foreground font-semibold">
                Recipient
              </label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="bg-background border-border font-mono"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-foreground font-semibold">
                Amount (MON)
              </label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-background border-border font-mono"
              />
            </div>

            {/* Date condition */}
            {condition === "date" && (
              <div className="space-y-2">
                <label className="text-sm font-mono text-foreground font-semibold">
                  Unlock date/time
                </label>
                <Input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={toLocalDatetime(Math.floor(Date.now() / 1000) + 60)}
                  className="bg-background border-border font-mono"
                />
              </div>
            )}

            {/* Approval condition */}
            {condition === "approval" && (
              <div className="space-y-2">
                <label className="text-sm font-mono text-foreground font-semibold">
                  Approver wallet
                </label>
                <Input
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  placeholder="0x..."
                  className="bg-background border-border font-mono"
                />
                <p className="text-xs text-muted-foreground font-mono">
                  Defaults to the connected sender wallet.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-mono text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-mono text-center">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Locking...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  LOCK GIFT
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
