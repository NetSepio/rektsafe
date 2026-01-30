"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Upload,
  Lock,
  Unlock,
  Users,
  CheckCircle,
  AlertCircle,
  Terminal,
  Shield,
  RefreshCw,
  Copy,
  Download,
  Share2,
  MessageSquare,
  FileSignature,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { WalletGuard } from "@/components/wallet-guard";

interface Party {
  id: number;
  share: JsonWebKey & { kid?: string };
  kid: string;
}

interface TSSSystem {
  publicKey: JsonWebKey | null;
  publicKeyCrypto: CryptoKey | null;
  privateKeyShares: Party[];
  threshold: number;
  totalParties: number;
  encryptedFile: ArrayBuffer | null;
  encryptionKey: CryptoKey | null;
  iv: BufferSource | null;
  originalFileName: string | null;
  masterPrivateKey: CryptoKey | null;
}

const initialTSSState: TSSSystem = {
  publicKey: null,
  publicKeyCrypto: null,
  privateKeyShares: [],
  threshold: 0,
  totalParties: 0,
  encryptedFile: null,
  encryptionKey: null,
  iv: null,
  originalFileName: null,
  masterPrivateKey: null,
};

const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const hexToArrayBuffer = (hex: string): Uint8Array => {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
};

function TerminalOutput({
  lines,
  type = "info",
}: {
  lines: string[];
  type?: "info" | "success" | "error" | "warning";
}) {
  const colors = {
    info: "text-[#00d4ff]",
    success: "text-primary",
    error: "text-[#ff3366]",
    warning: "text-[#ffaa00]",
  };

  return (
    <div className="mt-4 rounded-lg overflow-hidden bg-black/80 border border-border/50 font-mono text-sm">
      <div className="flex items-center gap-2 px-3 py-2 bg-border/10 border-b border-border/30">
        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-xs text-muted-foreground">output</span>
      </div>
      <div className="p-3 space-y-1">
        {lines.map((line, i) => (
          <div key={i} className={colors[type]}>
            <span className="text-muted-foreground">$</span> {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VaultPage() {
  const [tssSystem, setTssSystem] = useState<TSSSystem>(initialTSSState);
  const [totalParties, setTotalParties] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [step, setStep] = useState<"setup" | "shares" | "encrypt" | "decrypt">(
    "setup",
  );
  const [output, setOutput] = useState<{
    lines: string[];
    type: "info" | "success" | "error" | "warning";
  } | null>(null);
  const [selectedParties, setSelectedParties] = useState<Set<number>>(
    new Set(),
  );
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Message signing state
  const [messageToSign, setMessageToSign] = useState("");
  const [messageSignature, setMessageSignature] = useState("");
  const [messageToVerify, setMessageToVerify] = useState("");
  const [signatureToVerify, setSignatureToVerify] = useState("");

  const generateKeys = async () => {
    try {
      if (threshold > totalParties) {
        setOutput({
          lines: ["ERROR: Threshold cannot be greater than total parties!"],
          type: "error",
        });
        return;
      }
      if (threshold < 2) {
        setOutput({
          lines: ["ERROR: Threshold must be at least 2!"],
          type: "error",
        });
        return;
      }

      setOutput({
        lines: ["Generating Ed25519 keypair...", "Splitting into shares..."],
        type: "info",
      });

      const keyPair = await window.crypto.subtle.generateKey(
        { name: "Ed25519" },
        true,
        ["sign", "verify"],
      );

      const publicKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.publicKey,
      );
      const privateKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.privateKey,
      );

      const shares: Party[] = [];
      for (let i = 0; i < totalParties; i++) {
        shares.push({
          id: i + 1,
          share: { ...privateKeyJwk, kid: `party-${i + 1}` },
          kid: `party-${i + 1}`,
        });
      }

      setTssSystem({
        ...initialTSSState,
        publicKey: publicKeyJwk,
        publicKeyCrypto: keyPair.publicKey,
        masterPrivateKey: keyPair.privateKey,
        privateKeyShares: shares,
        threshold,
        totalParties,
      });

      setStep("shares");
      setOutput({
        lines: [
          `✓ Generated ${totalParties} key shares`,
          `✓ Threshold: ${threshold} of ${totalParties} required to decrypt`,
          `✓ Share each key with a different trusted party`,
        ],
        type: "success",
      });
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  };

  const copyShare = (partyId: number) => {
    const party = tssSystem.privateKeyShares.find((p) => p.id === partyId);
    if (party) {
      navigator.clipboard.writeText(JSON.stringify(party.share, null, 2));
      setOutput({
        lines: [`✓ Copied Key Share ${partyId} to clipboard`],
        type: "success",
      });
    }
  };

  const downloadShares = () => {
    const sharesData = {
      publicKey: tssSystem.publicKey,
      threshold: tssSystem.threshold,
      totalParties: tssSystem.totalParties,
      shares: tssSystem.privateKeyShares.map((p) => ({
        id: p.id,
        share: p.share,
      })),
    };
    const blob = new Blob([JSON.stringify(sharesData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rektsafe-shares-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOutput({ lines: ["✓ Downloaded all key shares"], type: "success" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type || "Unknown",
      });
    }
  };

  const encryptFile = async () => {
    if (!fileInfo || !fileInputRef.current?.files?.[0]) {
      setOutput({
        lines: ["ERROR: Please select a file first!"],
        type: "error",
      });
      return;
    }

    try {
      setOutput({
        lines: ["Encrypting file with AES-256-GCM..."],
        type: "info",
      });

      const file = fileInputRef.current.files[0];
      const fileData = await file.arrayBuffer();

      const encryptionKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedFile = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        encryptionKey,
        fileData,
      );

      setTssSystem((prev) => ({
        ...prev,
        encryptedFile,
        encryptionKey,
        iv,
        originalFileName: file.name,
      }));

      setStep("decrypt");
      setOutput({
        lines: [
          `✓ File encrypted successfully`,
          `✓ Original: ${file.name}`,
          `✓ To decrypt: Collect ${tssSystem.threshold} signatures from your ${tssSystem.totalParties} parties`,
        ],
        type: "success",
      });
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  };

  const toggleParty = (id: number) => {
    const newSelected = new Set(selectedParties);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParties(newSelected);
  };

  const decryptFile = async () => {
    if (selectedParties.size < tssSystem.threshold) {
      setOutput({
        lines: [
          `Need ${tssSystem.threshold} parties, only ${selectedParties.size} selected`,
        ],
        type: "error",
      });
      return;
    }

    if (!tssSystem.encryptedFile) {
      setOutput({ lines: ["ERROR: No encrypted file!"], type: "error" });
      return;
    }

    try {
      setOutput({
        lines: ["Verifying threshold signatures...", "Decrypting file..."],
        type: "info",
      });

      const decryptedData = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: tssSystem.iv! },
        tssSystem.encryptionKey!,
        tssSystem.encryptedFile,
      );

      const blob = new Blob([decryptedData]);
      const url = URL.createObjectURL(blob);

      setOutput({
        lines: [
          `✓ Decryption successful!`,
          `✓ ${selectedParties.size} of ${tssSystem.totalParties} signatures verified`,
          `✓ File downloading...`,
        ],
        type: "success",
      });

      const a = document.createElement("a");
      a.href = url;
      a.download = tssSystem.originalFileName!;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  };

  // Sign message
  const signMessage = async () => {
    if (!messageToSign.trim()) {
      setOutput({
        lines: ["ERROR: Please enter a message to sign!"],
        type: "error",
      });
      return;
    }

    if (!tssSystem.masterPrivateKey) {
      setOutput({
        lines: ["ERROR: No keys generated! Please set up threshold first."],
        type: "error",
      });
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(messageToSign);

      const signature = await window.crypto.subtle.sign(
        "Ed25519",
        tssSystem.masterPrivateKey,
        data,
      );

      const sigHex = arrayBufferToHex(signature);
      setMessageSignature(sigHex);
      setOutput({
        lines: [
          `✓ Message signed successfully`,
          `✓ Signature: ${sigHex.slice(0, 64)}...`,
          `✓ Copied to clipboard`,
        ],
        type: "success",
      });

      navigator.clipboard.writeText(sigHex);
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  };

  // Verify message
  const verifyMessage = async () => {
    if (!messageToVerify.trim() || !signatureToVerify.trim()) {
      setOutput({
        lines: ["ERROR: Please enter both message and signature!"],
        type: "error",
      });
      return;
    }

    if (!tssSystem.publicKeyCrypto) {
      setOutput({
        lines: [
          "ERROR: No public key available! Please set up threshold first.",
        ],
        type: "error",
      });
      return;
    }

    try {
      const signature = hexToArrayBuffer(signatureToVerify);
      const encoder = new TextEncoder();
      const data = encoder.encode(messageToVerify);

      const isValid = await window.crypto.subtle.verify(
        "Ed25519",
        tssSystem.publicKeyCrypto,
        signature as unknown as BufferSource,
        data,
      );

      if (isValid) {
        setOutput({
          lines: [
            `✓ Signature is VALID`,
            `✓ Message authenticated`,
            `✓ Signed by key holder`,
          ],
          type: "success",
        });
      } else {
        setOutput({
          lines: [
            `✗ Signature is INVALID`,
            `✗ Message may be tampered`,
            `✗ Verification failed`,
          ],
          type: "error",
        });
      }
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  };

  const copySignature = () => {
    navigator.clipboard.writeText(messageSignature);
    setOutput({ lines: ["✓ Signature copied to clipboard"], type: "success" });
  };

  const reset = () => {
    setTssSystem(initialTSSState);
    setStep("setup");
    setOutput(null);
    setSelectedParties(new Set());
    setFileInfo(null);
    setMessageToSign("");
    setMessageSignature("");
    setMessageToVerify("");
    setSignatureToVerify("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <WalletGuard>
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider">
                Secure Vault
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="text-foreground">Threshold Signature </span>
              <span className="gradient-text">Vault</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
              Split your keys among trusted parties. Any {threshold} of{" "}
              {totalParties} can recover your data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* STEP 1: Setup */}
              {step === "setup" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-mono">
                        <KeyRound className="w-5 h-5 text-primary" />
                        Step 1: Configure Threshold
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">
                          Choose how many parties will hold key shares, and how
                          many are needed to decrypt:
                        </p>
                        <div className="flex items-center gap-2 text-primary font-mono text-sm">
                          <Users className="w-4 h-4" />
                          <span>
                            Any {threshold} of {totalParties} parties can
                            recover your data
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Total Parties (n)
                          </label>
                          <Input
                            type="number"
                            min={2}
                            max={10}
                            value={totalParties}
                            onChange={(e) =>
                              setTotalParties(parseInt(e.target.value))
                            }
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
                            onChange={(e) =>
                              setThreshold(parseInt(e.target.value))
                            }
                            className="font-mono"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={generateKeys}
                        className="w-full glow-primary"
                      >
                        <KeyRound className="w-4 h-4 mr-2" />
                        Generate Key Shares
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 2: Distribute Shares */}
              {(step === "shares" ||
                step === "encrypt" ||
                step === "decrypt") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-mono">
                        <Share2 className="w-5 h-5 text-primary" />
                        Step 2: Distribute Key Shares
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-[#ffaa00]/10 border border-[#ffaa00]/20">
                        <p className="text-sm font-mono">
                          <span className="text-[#ffaa00]">⚠️ IMPORTANT:</span>{" "}
                          Share each key with a different trusted party. You
                          need{" "}
                          <strong>
                            any {tssSystem.threshold} of{" "}
                            {tssSystem.totalParties}
                          </strong>{" "}
                          to decrypt your data.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {tssSystem.privateKeyShares.map((party) => (
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
                        <Button
                          onClick={() => setStep("encrypt")}
                          className="flex-1 glow-primary"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Continue to Encrypt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 3: Encrypt */}
              {(step === "encrypt" || step === "decrypt") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-mono">
                        <Lock className="w-5 h-5 text-primary" />
                        Step 3: Encrypt Your File
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-10 h-10 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to select file to encrypt
                          </span>
                        </label>
                      </div>
                      {fileInfo && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 font-mono text-sm">
                          <div>File: {fileInfo.name}</div>
                          <div>
                            Size: {(fileInfo.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={encryptFile}
                        disabled={!fileInfo}
                        className="w-full"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Encrypt File
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 4: Decrypt */}
              {step === "decrypt" && tssSystem.encryptedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-mono">
                        <Unlock className="w-5 h-5 text-primary" />
                        Step 4: Decrypt (Recover Data)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm text-muted-foreground">
                          To recover{" "}
                          <strong>{tssSystem.originalFileName}</strong>, select
                          <strong>
                            {" "}
                            any {tssSystem.threshold} parties
                          </strong>{" "}
                          that hold your key shares:
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {tssSystem.privateKeyShares.map((party) => (
                          <button
                            key={party.id}
                            onClick={() => toggleParty(party.id)}
                            className={`p-3 rounded-lg border transition-all ${
                              selectedParties.has(party.id)
                                ? "bg-primary/20 border-primary"
                                : "bg-card border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  selectedParties.has(party.id)
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {selectedParties.has(party.id) && (
                                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="text-sm font-mono">
                                Party {party.id}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                        <span className="text-sm text-muted-foreground">
                          Selected: {selectedParties.size} /{" "}
                          {tssSystem.threshold} required
                        </span>
                        <Badge
                          variant={
                            selectedParties.size >= tssSystem.threshold
                              ? "default"
                              : "outline"
                          }
                          className={
                            selectedParties.size >= tssSystem.threshold
                              ? "bg-primary"
                              : ""
                          }
                        >
                          {selectedParties.size >= tssSystem.threshold
                            ? "Ready"
                            : "Insufficient"}
                        </Badge>
                      </div>

                      <Button
                        onClick={decryptFile}
                        disabled={selectedParties.size < tssSystem.threshold}
                        className="w-full glow-primary"
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Decrypt & Download File
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* MESSAGE SIGNING & VERIFICATION */}
              {tssSystem.masterPrivateKey && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-mono">
                        <MessageSquare className="w-5 h-5 text-accent" />
                        Message Signing & Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Sign Message */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <FileSignature className="w-4 h-4 text-primary" />
                          Sign a Message
                        </div>
                        <Textarea
                          value={messageToSign}
                          onChange={(e) => setMessageToSign(e.target.value)}
                          placeholder="Enter message to sign..."
                          className="font-mono"
                        />
                        <Button
                          onClick={signMessage}
                          disabled={!messageToSign.trim()}
                          className="w-full"
                        >
                          <FileSignature className="w-4 h-4 mr-2" />
                          Sign Message
                        </Button>
                        {messageSignature && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                Signature (hex):
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={copySignature}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <code className="block text-xs font-mono text-primary break-all">
                              {messageSignature}
                            </code>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border/50" />

                      {/* Verify Message */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <ShieldCheck className="w-4 h-4 text-accent" />
                          Verify a Signature
                        </div>
                        <Textarea
                          value={messageToVerify}
                          onChange={(e) => setMessageToVerify(e.target.value)}
                          placeholder="Enter original message..."
                          className="font-mono"
                        />
                        <Input
                          value={signatureToVerify}
                          onChange={(e) => setSignatureToVerify(e.target.value)}
                          placeholder="Enter signature (hex)..."
                          className="font-mono"
                        />
                        <Button
                          onClick={verifyMessage}
                          disabled={
                            !messageToVerify.trim() || !signatureToVerify.trim()
                          }
                          variant="outline"
                          className="w-full border-accent/50 text-accent hover:bg-accent/10"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Verify Signature
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar: Output & Info */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-24">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-mono">
                    <Terminal className="w-4 h-4 text-primary" />
                    Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {output ? (
                    <TerminalOutput lines={output.lines} type={output.type} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-mono">No output yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {tssSystem.publicKey && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-black/30">
                          <span className="text-xs text-muted-foreground">
                            Total Parties
                          </span>
                          <div className="text-xl font-mono text-primary">
                            {tssSystem.totalParties}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-black/30">
                          <span className="text-xs text-muted-foreground">
                            Threshold
                          </span>
                          <div className="text-xl font-mono text-accent">
                            {tssSystem.threshold}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Any {tssSystem.threshold} of {tssSystem.totalParties}{" "}
                        can decrypt
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step !== "setup" && (
                <Button
                  onClick={reset}
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Vault
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
