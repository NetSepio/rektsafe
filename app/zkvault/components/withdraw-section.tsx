"use client";

/**
 * Withdrawal Section
 *
 * Allows users to:
 * - Submit withdrawal requests for their NFT positions
 * - Choose to include yield or keep it separate
 * - View pending withdrawal requests
 * - Track 48-hour cooling-off period
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ImageIcon,
  ExternalLink,
  Info,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useVault } from "../context/vault-context";
import type { NFTPosition, WithdrawalRequest } from "../types";

function WithdrawalRequestCard({ request }: { request: WithdrawalRequest }) {
  const { formatAmount } = useVault();

  const now = Date.now();
  const isInCoolingOff =
    request.status === "cooling_off" && now < request.coolingOffEndAt;
  const coolingOffProgress = isInCoolingOff
    ? ((now - request.submittedAt) /
        (request.coolingOffEndAt - request.submittedAt)) *
      100
    : 100;

  const statusConfig = {
    pending: {
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      label: "Pending Review",
    },
    cooling_off: {
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
      label: "Cooling Off",
    },
    approved: {
      color: "bg-primary/10 text-primary border-primary/30",
      label: "Approved",
    },
    rejected: {
      color: "bg-destructive/10 text-destructive border-destructive/30",
      label: "Rejected",
    },
    executed: {
      color: "bg-muted text-muted-foreground border-border",
      label: "Completed",
    },
  };

  const status = statusConfig[request.status];

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.ceil(ms / (1000 * 60 * 60));
    if (hours > 24) {
      return `${Math.ceil(hours / 24)} days`;
    }
    return `${hours} hours`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-muted/30 border border-border/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-foreground">
              Position #{request.nftId.slice(-6).toUpperCase()}
            </span>
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted {new Date(request.submittedAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-semibold">
            {formatAmount(request.totalAmount, request.token)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatAmount(request.amount, request.token)} principal
            {request.yieldAmount > 0 &&
              ` + ${formatAmount(request.yieldAmount, request.token)} yield`}
          </div>
        </div>
      </div>

      {/* Cooling Off Progress */}
      {isInCoolingOff && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Cooling-off Period
            </span>
            <span className="text-muted-foreground">
              {formatTimeRemaining(request.coolingOffEndAt - now)} remaining
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coolingOffProgress}%` }}
              className="h-full bg-cyan-500"
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your request will be reviewed by admins after the cooling-off period
            expires.
          </p>
        </div>
      )}

      {/* Rejection Reason */}
      {request.status === "rejected" && request.rejectionReason && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">
            <span className="font-semibold">Reason:</span>{" "}
            {request.rejectionReason}
          </p>
        </div>
      )}

      {/* Execution Details */}
      {request.status === "executed" && request.executionTx && (
        <div className="mt-3">
          <a
            href={`https://explorer.solana.com/tx/${request.executionTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View Execution Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

export function WithdrawSection() {
  const {
    positionsWithYield,
    userWithdrawals,
    submitWithdrawal,
    isLoadingPositions,
    isSubmitting,
    formatAmount,
    vaultConfig,
    calculateYield,
  } = useVault();

  const [selectedPosition, setSelectedPosition] = useState<
    | (NFTPosition & {
        accruedYield: number;
        totalValue: number;
        timeHeld: number;
        estimatedApr: number;
      })
    | null
  >(null);
  const [includeYield, setIncludeYield] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Filter positions that can be withdrawn (active status)
  const withdrawablePositions = positionsWithYield.filter(
    (p) => p.status === "active",
  );

  const handleSubmit = async () => {
    if (!selectedPosition) {
      setStatus({ type: "error", message: "Please select a position" });
      return;
    }

    setStatus({ type: null, message: "" });
    const success = await submitWithdrawal(selectedPosition.id, includeYield);

    if (success) {
      setStatus({
        type: "success",
        message: `Withdrawal request submitted successfully! Your request will be reviewed after the ${vaultConfig.coolingOffPeriod}-hour cooling-off period.`,
      });
      setSelectedPosition(null);
      setIncludeYield(true);
    } else {
      setStatus({
        type: "error",
        message: "Failed to submit withdrawal request",
      });
    }
  };

  if (isLoadingPositions) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-mono">
              Loading positions...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Submit Withdrawal Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-mono">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Request Withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {withdrawablePositions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <Ban className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No Withdrawable Positions
              </h3>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any active positions available for
                withdrawal.
              </p>
            </div>
          ) : (
            <>
              {/* Position Selector */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-mono">
                  Select Position
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/30 border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    {selectedPosition ? (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <ImageIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">
                            Position #
                            {selectedPosition.id.slice(-6).toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatAmount(
                              selectedPosition.depositAmount,
                              selectedPosition.token,
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Choose a position...
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
                      {withdrawablePositions.map((position) => (
                        <button
                          key={position.id}
                          onClick={() => {
                            setSelectedPosition(position);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ImageIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-foreground">
                                Position #{position.id.slice(-6).toUpperCase()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatAmount(
                                  position.depositAmount,
                                  position.token,
                                )}{" "}
                                principal
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono text-foreground">
                              {formatAmount(
                                position.totalValue,
                                position.token,
                              )}
                            </div>
                            <div className="text-xs text-primary">
                              +
                              {formatAmount(
                                position.accruedYield,
                                position.token,
                              )}{" "}
                              yield
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Include Yield Checkbox */}
              {selectedPosition && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-xl bg-muted/30 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeYield"
                      checked={includeYield}
                      onCheckedChange={(checked) =>
                        setIncludeYield(checked as boolean)
                      }
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="includeYield"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Include accrued yield in withdrawal
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {includeYield
                          ? `You'll receive ${formatAmount(selectedPosition.depositAmount + calculateYield(selectedPosition), selectedPosition.token)} total`
                          : `You'll keep your yield separate and receive ${formatAmount(selectedPosition.depositAmount, selectedPosition.token)} principal`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Summary */}
              {selectedPosition && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Principal
                    </span>
                    <span className="font-mono">
                      {formatAmount(
                        selectedPosition.depositAmount,
                        selectedPosition.token,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {includeYield
                        ? "Yield (included)"
                        : "Yield (kept separate)"}
                    </span>
                    <span
                      className={`font-mono ${includeYield ? "" : "text-muted-foreground"}`}
                    >
                      {formatAmount(
                        selectedPosition.accruedYield,
                        selectedPosition.token,
                      )}
                    </span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total to Receive</span>
                    <span className="text-xl font-mono font-bold text-primary">
                      {formatAmount(
                        includeYield
                          ? selectedPosition.depositAmount +
                              calculateYield(selectedPosition)
                          : selectedPosition.depositAmount,
                        selectedPosition.token,
                      )}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedPosition || isSubmitting}
                className="w-full h-14 glow-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-5 h-5 mr-2" />
                    Submit Withdrawal Request
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
                  <p
                    className={`text-sm ${
                      status.type === "success"
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {status.message}
                  </p>
                </motion.div>
              )}
            </>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-4 border-t border-border/30">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">
                Withdrawal Process
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  All withdrawals require a {vaultConfig.coolingOffPeriod}-hour
                  cooling-off period
                </li>
                <li>
                  After cooling-off, admins review and approve your request
                </li>
                <li>Funds are sent from the multisig vault upon approval</li>
                <li>
                  You&apos;ll receive an email notification when your request is
                  processed
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {userWithdrawals.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <Clock className="w-5 h-5 text-primary" />
              Your Withdrawal Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userWithdrawals.map((request) => (
              <WithdrawalRequestCard key={request.id} request={request} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
