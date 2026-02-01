"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileSignature, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTSS } from "../context/tss-context";

export function SignSection() {
  const { signMessage, hasMasterKey, output } = useTSS();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSign = async () => {
    if (!message.trim()) return;
    setIsSigning(true);
    const sig = await signMessage(message);
    if (sig) {
      setSignature(sig);
    }
    setIsSigning(false);
  };

  const copySignature = () => {
    navigator.clipboard.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasMasterKey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <FileSignature className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-mono font-semibold mb-2">No Keys Available</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Please go to the <strong>Split Keys</strong> tab first to generate your signing keys.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <FileSignature className="w-5 h-5 text-primary" />
              Sign Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Sign messages using your master private key with <strong>Ed25519</strong> signatures.
                Anyone with your public key can verify these signatures.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Message to Sign
              </label>
              <Textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (signature) setSignature("");
                }}
                placeholder="Enter your message here..."
                className="font-mono min-h-[120px]"
              />
            </div>

            {!signature ? (
              <Button
                onClick={handleSign}
                disabled={!message.trim() || isSigning}
                className="w-full"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                {isSigning ? "Signing..." : "Sign Message"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      Signature (hex):
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copySignature}
                      className="h-7 px-2"
                    >
                      {copied ? (
                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                  <code className="block text-xs font-mono text-primary break-all">
                    {signature}
                  </code>
                </div>
                <Button
                  onClick={() => {
                    setMessage("");
                    setSignature("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sign Another Message
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
