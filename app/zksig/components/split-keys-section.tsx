"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Users, Copy, Download, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTSS } from "../context/tss-context";

export function SplitKeysSection() {
  const {
    totalParties,
    setTotalParties,
    threshold,
    setThreshold,
    shares,
    publicKey,
    generateKeys,
    copyShare,
    downloadShares,
    reset,
    output,
  } = useTSS();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateKeys();
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <KeyRound className="w-5 h-5 text-primary" />
              Configure Threshold Scheme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">
                Choose how many parties will hold key shares, and how many are needed to sign/decrypt:
              </p>
              <div className="flex items-center gap-2 text-primary font-mono text-sm">
                <Users className="w-4 h-4" />
                <span>
                  Any {threshold} of {totalParties} parties can recover/sign
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Total Parties (n)
                </label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={totalParties}
                  onChange={(e) => setTotalParties(parseInt(e.target.value) || 2)}
                  disabled={shares.length > 0}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Threshold (k)
                </label>
                <Input
                  type="number"
                  min={2}
                  max={totalParties}
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value) || 2)}
                  disabled={shares.length > 0}
                  className="font-mono"
                />
              </div>
            </div>

            {!shares.length ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full glow-primary"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Key Shares"}
              </Button>
            ) : (
              <Button
                onClick={reset}
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Keys
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Shares Display */}
      {shares.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-mono">
                <Share2 className="w-5 h-5 text-primary" />
                Key Shares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-[#ffaa00]/10 border border-[#ffaa00]/20">
                <p className="text-sm font-mono">
                  <span className="text-[#ffaa00]">⚠️ IMPORTANT:</span>{" "}
                  Share each key with a different trusted party. You need{" "}
                  <strong>
                    any {threshold} of {totalParties}
                  </strong>{" "}
                  to decrypt or sign messages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shares.map((party) => (
                  <div
                    key={party.id}
                    className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold">
                        Key Share {party.id}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Party {party.id}
                      </Badge>
                    </div>
                    <code className="block text-xs font-mono text-muted-foreground truncate mb-3">
                      {party.kid}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => copyShare(party.id)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Share
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={downloadShares}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All Shares
                </Button>
              </div>

              {publicKey && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-xs text-muted-foreground block mb-1">
                    Public Key:
                  </span>
                  <code className="block text-xs font-mono text-primary break-all">
                    {publicKey.x?.slice(0, 32)}...
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
