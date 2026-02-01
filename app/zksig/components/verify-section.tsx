"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTSS } from "../context/tss-context";

export function VerifySection() {
  const { verifySignature, hasPublicKey, publicKeyHex } = useTSS();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleVerify = async () => {
    if (!message.trim() || !signature.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    const isValid = await verifySignature(message, signature);

    setVerificationResult({
      valid: isValid,
      message: isValid
        ? "Signature is VALID - Message authenticated and untampered"
        : "Signature is INVALID - Message may be tampered or wrong key",
    });

    setIsVerifying(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Verify Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm text-muted-foreground">
                Verify Ed25519 signatures against the public key. You can verify signatures
                created by this app or any other Ed25519-compatible tool.
              </p>
            </div>

            {hasPublicKey && publicKeyHex && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-xs text-muted-foreground block mb-1">
                  Current Public Key:
                </span>
                <code className="block text-xs font-mono text-primary break-all">
                  {publicKeyHex.slice(0, 32)}...
                </code>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Original Message
              </label>
              <Textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setVerificationResult(null);
                }}
                placeholder="Enter the original message..."
                className="font-mono min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Signature (hex)
              </label>
              <Input
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value);
                  setVerificationResult(null);
                }}
                placeholder="Enter the signature in hexadecimal format..."
                className="font-mono"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={!message.trim() || !signature.trim() || isVerifying}
              variant="outline"
              className="w-full border-accent/50 text-accent hover:bg-accent/10"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {isVerifying ? "Verifying..." : "Verify Signature"}
            </Button>

            <AnimatePresence>
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg border ${
                    verificationResult.valid
                      ? "bg-primary/10 border-primary/30"
                      : "bg-destructive/10 border-destructive/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {verificationResult.valid ? (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                    <div>
                      <p
                        className={`font-mono font-semibold ${
                          verificationResult.valid ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {verificationResult.valid ? "Valid Signature" : "Invalid Signature"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {verificationResult.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
